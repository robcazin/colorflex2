import argparse, math, numpy as np
from PIL import Image
from moviepy.editor import ImageSequenceClip

MODES = {"multiply","screen","overlay","softlight","darken","lighten","difference"}

def ease(t):  # 0..1 -> 0..1
    return 0.5 - 0.5*math.cos(math.pi*max(0.0, min(1.0, t)))

# sRGB <> Linear helpers (approx)
def srgb_to_lin(x):  # x in [0,1]
    a = 0.055
    return np.where(x <= 0.04045, x/12.92, ((x + a)/(1+a))**2.4)
def lin_to_srgb(y):  # y in [0,1]
    a = 0.055
    return np.where(y <= 0.0031308, 12.92*y, (1+a)*np.power(y, 1/2.4) - a)

def load_letterbox(path, W, H):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    s = min(W / w, H / h)
    nw, nh = max(1,int(w*s)), max(1,int(h*s))
    im = im.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("RGB", (W, H), (0,0,0))
    canvas.paste(im, ((W-nw)//2, (H-nh)//2))
    arr = np.asarray(canvas, dtype=np.float32) / 255.0  # sRGB [0..1]
    return arr

def blend_linear(A_srgb, B_srgb, alpha, mode):
    # convert to linear for accurate math
    A = srgb_to_lin(A_srgb)
    B = srgb_to_lin(B_srgb)

    if mode == "multiply":
        M = A * B
    elif mode == "screen":
        M = 1.0 - (1.0 - A) * (1.0 - B)
    elif mode == "overlay":
        M = np.where(A <= 0.5, 2*A*B, 1.0 - 2*(1.0 - A)*(1.0 - B))
    elif mode == "softlight":
        # common softlight approximation
        M = (1-2*B)*A*A + 2*B*A
    elif mode == "darken":
        M = np.minimum(A, B)
    elif mode == "lighten":
        M = np.maximum(A, B)
    elif mode == "difference":
        M = np.abs(A - B)
    else:
        M = (A + B) * 0.5

    # transition from A -> mode(A,B)
    Y = (1.0 - alpha) * A + alpha * M
    # back to sRGB
    out = lin_to_srgb(np.clip(Y, 0.0, 1.0))
    return (out * 255.0).astype(np.uint8)

def build(images, W, H, fps, hold, trans, mode):
    arrs = [load_letterbox(p, W, H) for p in images]
    frames = []
    holdf  = max(0, int(round(hold*fps)))
    transf = max(2, int(round(trans*fps)))

    for i in range(len(arrs)-1):
        frames += [(arrs[i]*255).astype(np.uint8)] * holdf
        for k in range(transf):
            alpha = ease(k/(transf-1))
            frames.append(blend_linear(arrs[i], arrs[i+1], alpha, mode))

    frames += [(arrs[-1]*255).astype(np.uint8)] * holdf
    return frames

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("images", nargs="+")
    ap.add_argument("-o","--out", default="slideshow_blend.mp4")
    ap.add_argument("--mode", default="screen", choices=sorted(MODES))
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--width", type=int, default=1920)
    ap.add_argument("--height", type=int, default=1080)
    ap.add_argument("--hold", type=float, default=0.75)
    ap.add_argument("--trans", type=float, default=2.75)
    args = ap.parse_args()

    print(f"Using blend mode: {args.mode}")
    frames = build(args.images, args.width, args.height, args.fps, args.hold, args.trans, args.mode)
    clip = ImageSequenceClip(frames, fps=args.fps)  # NOTE: no channel flip
    clip.write_videofile(args.out, codec="libx264", audio=False, bitrate="10M", preset="veryfast")
