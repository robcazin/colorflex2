import argparse, math, os
import numpy as np
import cv2
from moviepy.editor import ImageSequenceClip

def read_image(path, size=None):
    img = cv2.imread(path, cv2.IMREAD_COLOR)
    if img is None:
        raise FileNotFoundError(f"Cannot read {path}")
    if size is not None:
        img = cv2.resize(img, size, interpolation=cv2.INTER_AREA)
    return img

def ease_in_out(t):
    # smoothstep(0,1,t) with steeper center (cosine-based)
    return 0.5 - 0.5*math.cos(math.pi*t)

def frame_match_dissolve(a, b, steps=30, strength=0.95):
    """
    a,b: uint8 BGR images, same size
    steps: number of frames in the transition
    strength: 0..1, how aggressively differences 'flip early'
    """
    # Difference magnitude in [0,1]
    diff = cv2.absdiff(a, b)
    diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
    # Slight blur so the mask isn't noisy
    diff_gray = cv2.GaussianBlur(diff_gray, (11,11), 0)

    frames = []
    a_f = a.astype(np.float32) / 255.0
    b_f = b.astype(np.float32) / 255.0
    # Broadcast mask to 3 channels
    m = np.repeat(diff_gray[...,None], 3, axis=2)  # 0 (same) .. 1 (very different)

    for i in range(steps):
        t = ease_in_out(i/(steps-1))
        # Pixels that differ (m~1) transition earlier; stable pixels (m~0) wait longer
        # Effective alpha for B: alpha_eff = t ** (1 - m*strength)
        alpha_eff = np.power(max(t,1e-6), (1.0 - m*strength))
        # Blend
        f = a_f*(1.0 - alpha_eff) + b_f*alpha_eff
        frames.append((np.clip(f,0,1)*255.0).astype(np.uint8))
    return frames

def build_sequence(paths, fps=30, hold=0.75, trans=2.75, size=1080, strength=0.95, start_end_hold=1.0):
    # Load images, normalize to square height=width=size (letterbox if needed to keep aspect)
    imgs0 = [cv2.imread(p) for p in paths]
    if any(im is None for im in imgs0):
        bad = [p for p,im in zip(paths,imgs0) if im is None]
        raise FileNotFoundError(f"Could not read: {bad}")

    # Compute target (width,height) keeping aspect, max dimension = size
    h0, w0 = imgs0[0].shape[:2]
    scale = size / max(h0, w0)
    W, H = int(round(w0*scale)), int(round(h0*scale))
    imgs = [cv2.resize(im, (W,H), interpolation=cv2.INTER_AREA) for im in imgs0]

    frames = []
    def hold_frames(img, seconds):
        return [img]*(int(round(seconds*fps)))

    # Opening hold
    frames += hold_frames(imgs[0], start_end_hold)

    for i in range(len(imgs)-1):
        frames += hold_frames(imgs[i], hold)
        steps = max(2, int(round(trans*fps)))
        frames += frame_match_dissolve(imgs[i], imgs[i+1], steps=steps, strength=strength)

    # Closing hold
    frames += hold_frames(imgs[-1], start_end_hold)
    return frames, fps

def main():
    ap = argparse.ArgumentParser(description="Frame-match dissolve slideshow")
    ap.add_argument("images", nargs="+", help="Input images in desired order")
    ap.add_argument("-o","--out", default="slideshow.mp4", help="Output MP4 path")
    ap.add_argument("--fps", type=int, default=30, help="Frames per second")
    ap.add_argument("--hold", type=float, default=0.75, help="Hold (s) on each still between transitions")
    ap.add_argument("--trans", type=float, default=2.75, help="Transition duration (s) per pair")
    ap.add_argument("--start_end_hold", type=float, default=1.0, help="Hold (s) at start and end")
    ap.add_argument("--size", type=int, default=1080, help="Max dimension (px) after scaling")
    ap.add_argument("--strength", type=float, default=0.95, help="0..1 difference-acceleration strength")
    args = ap.parse_args()

    frames, fps = build_sequence(
        args.images,
        fps=args.fps,
        hold=args.hold,
        trans=args.trans,
        size=args.size,
        strength=args.strength,
        start_end_hold=args.start_end_hold
    )
    # MoviePy expects RGB
    clip = ImageSequenceClip([cv2.cvtColor(f, cv2.COLOR_BGR2RGB) for f in frames], fps=args.fps)
    clip.write_videofile(args.out, codec="libx264", audio=False, bitrate="10M")

if __name__ == "__main__":
    main()
