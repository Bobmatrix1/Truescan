import os
import cv2
import onnx
import torch
import argparse
import numpy as np
import torch.nn as nn
from models.TMC import ETMC
from models import image

from onnx2pytorch import ConvertModel

onnx_model = onnx.load('checkpoints/efficientnet.onnx')
pytorch_model = ConvertModel(onnx_model)

#Set random seed for reproducibility.
torch.manual_seed(42)


# Define the audio_args dictionary
audio_args = {
    'nb_samp': 64600,
    'first_conv': 1024,
    'in_channels': 1,
    'filts': [20, [20, 20], [20, 128], [128, 128]],
    'blocks': [2, 4],
    'nb_fc_node': 1024,
    'gru_node': 1024,
    'nb_gru_layer': 3,
    'nb_classes': 2
}


def get_args(parser):
    parser.add_argument("--batch_size", type=int, default=8)
    parser.add_argument("--data_dir", type=str, default="datasets/train/fakeavceleb*")
    parser.add_argument("--LOAD_SIZE", type=int, default=256)
    parser.add_argument("--FINE_SIZE", type=int, default=224)
    parser.add_argument("--dropout", type=float, default=0.2)
    parser.add_argument("--gradient_accumulation_steps", type=int, default=1)
    parser.add_argument("--hidden", nargs="*", type=int, default=[])
    parser.add_argument("--hidden_sz", type=int, default=768)
    parser.add_argument("--img_embed_pool_type", type=str, default="avg", choices=["max", "avg"])
    parser.add_argument("--img_hidden_sz", type=int, default=1024)
    parser.add_argument("--include_bn", type=int, default=True)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--lr_factor", type=float, default=0.3)
    parser.add_argument("--lr_patience", type=int, default=10)
    parser.add_argument("--max_epochs", type=int, default=500)
    parser.add_argument("--n_workers", type=int, default=12)
    parser.add_argument("--name", type=str, default="MMDF")
    parser.add_argument("--num_image_embeds", type=int, default=1)
    parser.add_argument("--patience", type=int, default=20)
    parser.add_argument("--savedir", type=str, default="./savepath/")
    parser.add_argument("--seed", type=int, default=1)
    parser.add_argument("--n_classes", type=int, default=2)
    parser.add_argument("--annealing_epoch", type=int, default=10)
    parser.add_argument("--device", type=str, default='cpu')
    parser.add_argument("--pretrained_image_encoder", type=bool, default = False)
    parser.add_argument("--freeze_image_encoder", type=bool, default = False)
    parser.add_argument("--pretrained_audio_encoder", type = bool, default=False)
    parser.add_argument("--freeze_audio_encoder", type = bool, default = False)
    parser.add_argument("--augment_dataset", type = bool, default = True)

    for key, value in audio_args.items():
        parser.add_argument(f"--{key}", type=type(value), default=value)

def model_summary(args):
    '''Prints the model summary.'''
    model = ETMC(args)

    for name, layer in model.named_modules():
        print(name, layer)

def load_multimodal_model(args):
    '''Load multimodal model'''
    model = ETMC(args)
    ckpt = torch.load('checkpoints/model.pth', map_location = torch.device('cpu'))
    model.load_state_dict(ckpt, strict = True)
    model.eval()
    return model

def load_img_modality_model(args):
    '''Loads image modality model.'''
    rgb_encoder = pytorch_model

    ckpt = torch.load('checkpoints/model.pth', map_location = torch.device('cpu'))
    rgb_encoder.load_state_dict(ckpt['rgb_encoder'], strict = True)
    rgb_encoder.eval()
    return rgb_encoder

def load_spec_modality_model(args):
    spec_encoder = image.RawNet(args)
    ckpt = torch.load('checkpoints/model.pth', map_location = torch.device('cpu'))
    spec_encoder.load_state_dict(ckpt['spec_encoder'], strict = True)
    spec_encoder.eval()
    return spec_encoder


#Load models.
parser = argparse.ArgumentParser(description="Inference models")
get_args(parser)
args, remaining_args = parser.parse_known_args()
assert remaining_args == [], remaining_args

spec_model = load_spec_modality_model(args)

img_model = load_img_modality_model(args)


def preprocess_img(face):
    if face is None:
        return None
    face = np.array(face, dtype=np.float32)
    face = face / 255.0
    face = cv2.resize(face, (256, 256))
    face_pt = torch.unsqueeze(torch.tensor(face, dtype=torch.float32), dim = 0) 
    return face_pt

def preprocess_audio(input_audio):
    if input_audio is None:
        return None
    if isinstance(input_audio, str):
        try:
            import librosa
            data, sr = librosa.load(input_audio, sr=16000)
        except Exception:
            import soundfile as sf
            data, sr = sf.read(input_audio)
    elif isinstance(input_audio, tuple):
        sr, data = input_audio
    elif isinstance(input_audio, np.ndarray):
        data = input_audio
    else:
        data = np.array(input_audio)

    data = np.array(data, dtype=np.float32)
    if data.ndim > 1:
        if data.shape[0] == 2:
            data = np.mean(data, axis=0)
        elif data.shape[1] == 2:
            data = np.mean(data, axis=1)
        else:
            data = data.flatten()
            
    if np.max(np.abs(data)) > 1.0:
        data = data / 32768.0

    if len(data) < 1024:
        data = np.pad(data, (0, 1024 - len(data)), 'constant')

    audio_pt = torch.unsqueeze(torch.tensor(data, dtype=torch.float32), dim = 0)
    return audio_pt

def deepfakes_spec_predict(input_audio):
    if input_audio is None:
        return "Please upload an audio file."
    audio = preprocess_audio(input_audio)
    if audio is None:
        return "Error processing audio input."
    with torch.no_grad():
        spec_grads = spec_model.forward(audio)
    spec_grads_inv = np.exp(spec_grads.cpu().detach().numpy().squeeze())

    if spec_grads_inv[0] > 0.5:
        preds = round(float(spec_grads_inv[0]) * 100, 3)
        text2 = f"The audio is REAL. \nConfidence score is: {preds}%"
    else:
        preds = round(float(spec_grads_inv[1]) * 100, 3)
        text2 = f"The audio is FAKE. \nConfidence score is: {preds}%"

    return text2

def deepfakes_image_predict(input_image):
    if input_image is None:
        return "Please upload an image."
    face = preprocess_img(input_image)
    if face is None:
        return "Error processing image input."
    print(f"Face shape is: {face.shape}")
    with torch.no_grad():
        img_grads = img_model.forward(face)
    img_grads = img_grads.cpu().detach().numpy()
    img_grads_np = np.squeeze(img_grads)

    if img_grads_np[0] > 0.5:
        preds = round(float(img_grads_np[0]) * 100, 3)
        text2 = f"The image is REAL. \nConfidence score is: {preds}%"
    else:
        preds = round(float(img_grads_np[1]) * 100, 3)
        text2 = f"The image is FAKE. \nConfidence score is: {preds}%"

    return text2


def preprocess_video(input_video, n_frames = 3):
    if input_video is None:
        return []
    v_cap = cv2.VideoCapture(input_video)
    v_len = int(v_cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if v_len <= 0:
        v_cap.release()
        return []

    # Pick 'n_frames' evenly spaced frames to sample
    if n_frames is None or v_len < n_frames:
        sample = np.arange(0, v_len)
    else:
        sample = np.linspace(0, v_len - 1, n_frames).astype(int)

    # Loop through frames.
    frames = []
    for j in range(v_len):
        success = v_cap.grab()
        if j in sample:
            success, frame = v_cap.retrieve()
            if not success:
                continue
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = preprocess_img(frame)
            frames.append(frame)
    v_cap.release()
    return frames


def deepfakes_video_predict(input_video):
    '''Perform inference on a video.'''
    if input_video is None:
        return "Please upload a video file."
    video_frames = preprocess_video(input_video)
    if not video_frames:
        return "Unable to extract frames from the uploaded video."
    real_faces_list = []
    fake_faces_list = []

    with torch.no_grad():
        for face in video_frames:
            img_grads = img_model.forward(face)
            img_grads = img_grads.cpu().detach().numpy()
            img_grads_np = np.squeeze(img_grads)
            real_faces_list.append(img_grads_np[0])
            fake_faces_list.append(img_grads_np[1])

    real_faces_mean = np.mean(real_faces_list)
    fake_faces_mean = np.mean(fake_faces_list)

    if real_faces_mean > 0.5:
        preds = round(float(real_faces_mean) * 100, 3)
        text2 = f"The video is REAL. \nConfidence score is: {preds}%"
    else:
        preds = round(float(fake_faces_mean) * 100, 3)
        text2 = f"The video is FAKE. \nConfidence score is: {preds}%"

    return text2

