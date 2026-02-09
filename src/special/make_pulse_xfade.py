import argparse, math, numpy as np
from moviepy.editor import ImageClip, CompositeVideoClip

def ease_in_out(t):
    return 0.5 - 0.5*math.cos(math.pi*t)

def multiply_blend_frame(imgA, imgB, opacity):
    A = imgA.astype(np.float32)/255.0
    B = imgB.astype(np.float32)/255.0
    mult = A*B
    out = (1.0-opacity)*A + opacity*mult
    return (np.clip(out,0,1)*255).astype("uint8")

def letterbox(path, W, H):
    clip = ImageClip(path)
    scale = min(W/clip.w, H/clip.h)
    return clip.resize(scale).on_color(size=(W,H), color=(0,0,0), pos=('center','center'))

def make_pulse_overlay(base_clip, next_clip, pulse, fps, strength):
    # Overlay exists only during the final `pulse` seconds of base_clip
    W, H = base_clip.size
    def frame_func(t):  # t in [0,pulse]
        a = t / max(pulse, 1e-6)
        op = ease_in_out(a)*strength
        frameA = base_clip.get_frame(base_clip.duration - 1.0/fps)
        frameB = next_clip.get_frame(0)
        return multiply_blend_frame(frameA, frameB, op)
    return (ImageClip(np.zeros((H,W,3), dtype=np.uint8), duration=pulse)
            .set_make_frame(frame_func))

from moviepy.editor import ImageClip, CompositeVideoClip, concatenate_videoclips

def build_sequence(paths, W=1920, H=1080, fps=30,
                   hold=0.75, pulse=0.5, trans=2.75,
                   start_end_hold=1.0, pulse_strength=0.35):
    def letterbox(path):
        clip = ImageClip(path)
        scale = min(W/clip.w, H/clip.h)
        return clip.resize(scale).on_color(size=(W,H), color=(0,0,0), pos=("center","center"))

    def make_pulse_hold(curr_path, next_path):
        base = letterbox(curr_path).set_duration(hold)
        if next_path is None or pulse <= 0:
            return base
        next_still = letterbox(next_path).set_duration(hold)

        # overlay only during last `pulse` seconds of base
        def pulse_frame(t):
            # t in [0,pulse]
            a = t / max(pulse, 1e-6)
            op = (0.5 - 0.5*math.cos(math.pi*a)) * pulse_strength  # ease in/out
            A = base.get_frame(base.duration - 1.0/fps)
            B = next_still.get_frame(0)
            return multiply_blend_frame(A, B, op)

        overlay = (ImageClip(np.zeros((H,W,3), dtype=np.uint8), duration=pulse)
                   .set_make_frame(pulse_frame)
                   .set_start(hold - pulse))

        return CompositeVideoClip([base, overlay]).set_duration(hold)

    clips = []

    # Opening still
    clips.append(letterbox(paths[0]).set_duration(start_end_hold))

    # Middle stills with pulse baked in; extend duration by trans (except the last)
    for i, p in enumerate(paths):
        nxt = paths[i+1] if i < len(paths)-1 else None
        body = make_pulse_hold(p, nxt)
        extra = trans if nxt is not None else 0
        clip_i = body.set_duration(body.duration + extra)
        # crossfade-in for every clip after the first (concatenate handles overlap)
        if i > 0:
            clip_i = clip_i.crossfadein(trans)
        clips.append(clip_i)

    # Closing still
    clips.append(letterbox(paths[-1]).set_duration(start_end_hold).crossfadein(trans))

    # Concatenate in strict order with fixed overlaps
    final = concatenate_videoclips(clips, method="compose", padding=-trans)
    return final.set_fps(fps)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("images", nargs="+")
    ap.add_argument("-o","--out", default="Cottage_Tulips_PulseXfade.mp4")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--width", type=int, default=1920)
    ap.add_argument("--height", type=int, default=1080)
    ap.add_argument("--hold", type=float, default=0.75)
    ap.add_argument("--pulse", type=float, default=0.5)
    ap.add_argument("--trans", type=float, default=2.75)
    ap.add_argument("--start_end_hold", type=float, default=1.0)
    ap.add_argument("--pulse_strength", type=float, default=0.35)
    args = ap.parse_args()

    clip = build_sequence(
        args.images, W=args.width, H=args.height, fps=args.fps,
        hold=args.hold, pulse=args.pulse, trans=args.trans,
        start_end_hold=args.start_end_hold, pulse_strength=args.pulse_strength
    )
    clip.write_videofile(args.out, codec="libx264", audio=False, bitrate="10M", preset="veryfast")
