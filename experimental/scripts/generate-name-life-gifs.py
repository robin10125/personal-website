from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
FORWARD_PATH = ASSETS / "robin-hylands-life-forward.gif"
REVERSE_PATH = ASSETS / "robin-hylands-life-reverse.gif"

NAME = "Robin Hylands"
WIDTH = 440
HEIGHT = 68
TITLE_FONT_SIZE = 58
STEPS = 100
DURATION_MS = 40
REVERSE_SECONDS = 1.6
REVERSE_START_STEP = 60
REVERSE_SPAN_STEPS = 60

BACKGROUND = (247, 246, 242)
LIVE = (22, 22, 22)
FONT_PATH = "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf"

# SmoothLife parameters from Stephan Rafler's continuous Life formulation.
BIRTH_LOW = 0.278
BIRTH_HIGH = 0.365
DEATH_LOW = 0.267
DEATH_HIGH = 0.445
ALPHA_N = 0.028
ALPHA_M = 0.147
TIME_STEP = 0.08

INNER_RADIUS = 4.0
OUTER_RADIUS = 12.0


def sigmoid(x, center, alpha):
    return 1.0 / (1.0 + np.exp(-(x - center) * 4.0 / alpha))


def interval_sigmoid(x, low, high, alpha):
    return sigmoid(x, low, alpha) * (1.0 - sigmoid(x, high, alpha))


def mix_by_inner(alive_value, dead_value, inner_average):
    amount = sigmoid(inner_average, 0.5, ALPHA_M)
    return alive_value * (1.0 - amount) + dead_value * amount


def make_kernel(inner_radius, outer_radius=None):
    y, x = np.ogrid[:HEIGHT, :WIDTH]
    x = x - WIDTH // 2
    y = y - HEIGHT // 2
    distance = np.sqrt(x * x + y * y)

    if outer_radius is None:
        kernel = distance <= inner_radius
    else:
        kernel = (distance > inner_radius) & (distance <= outer_radius)

    kernel = kernel.astype(np.float32)
    kernel /= kernel.sum()
    return np.fft.rfft2(np.fft.ifftshift(kernel))


INNER_KERNEL = make_kernel(INNER_RADIUS)
OUTER_KERNEL = make_kernel(INNER_RADIUS, OUTER_RADIUS)


def convolve_periodic(field, kernel_fft):
    return np.fft.irfft2(np.fft.rfft2(field) * kernel_fft, s=field.shape).real


def smoothlife_step(field):
    inner_average = convolve_periodic(field, INNER_KERNEL)
    outer_average = convolve_periodic(field, OUTER_KERNEL)

    birth_low = mix_by_inner(BIRTH_LOW, DEATH_LOW, inner_average)
    birth_high = mix_by_inner(BIRTH_HIGH, DEATH_HIGH, inner_average)
    target = interval_sigmoid(outer_average, birth_low, birth_high, ALPHA_N)
    return np.clip(field + TIME_STEP * (2.0 * target - 1.0), 0.0, 1.0)


def text_mask():
    image = Image.new("L", (WIDTH, HEIGHT), 0)
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(FONT_PATH, TITLE_FONT_SIZE)
    bbox = draw.textbbox((0, 0), NAME, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (WIDTH - text_width) // 2 - bbox[0]
    y = (HEIGHT - text_height) // 2 - bbox[1]
    draw.text((x, y), NAME, fill=255, font=font)
    return np.asarray(image, dtype=np.float32) / 255.0


def initial_field():
    image = Image.fromarray((text_mask() * 255).astype(np.uint8), "L")
    image = image.filter(ImageFilter.GaussianBlur(0.8))
    field = np.asarray(image, dtype=np.float32) / 255.0
    field += 0.035 * deterministic_noise()
    return np.clip(field, 0.0, 1.0)


def deterministic_noise():
    rng = np.random.default_rng(17)
    noise = rng.random((HEIGHT, WIDTH), dtype=np.float32)
    mask = text_mask()
    noise *= np.clip(mask + 0.15, 0.0, 1.0)
    return noise


def fit_field_to_canvas(field):
    ys, xs = np.where(field > 0.18)
    if xs.size == 0:
        return field

    x0, x1 = xs.min(), xs.max() + 1
    y0, y1 = ys.min(), ys.max() + 1
    cropped = field[y0:y1, x0:x1]
    crop_height, crop_width = cropped.shape
    padding = 4
    scale = min((WIDTH - 2 * padding) / crop_width, (HEIGHT - 2 * padding) / crop_height)
    new_width = max(1, round(crop_width * scale))
    new_height = max(1, round(crop_height * scale))

    image = Image.fromarray((cropped * 255).astype(np.uint8), "L")
    image = image.resize((new_width, new_height), Image.Resampling.BICUBIC)
    fitted = Image.new("L", (WIDTH, HEIGHT), 0)
    fitted.paste(image, ((WIDTH - new_width) // 2, (HEIGHT - new_height) // 2))
    return np.asarray(fitted, dtype=np.float32) / 255.0


def render_field(field, *, fit=True):
    if fit:
        field = fit_field_to_canvas(field)
    alpha = smoothstep(0.18, 0.62, field)
    alpha_image = Image.fromarray((alpha * 255).astype(np.uint8), "L")
    alpha_image = alpha_image.filter(ImageFilter.GaussianBlur(0.35))
    image = Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND)
    shape = Image.new("RGB", (WIDTH, HEIGHT), LIVE)
    image.paste(shape, mask=alpha_image)
    return image


def center_field(field):
    ys, xs = np.where(field > 0.18)
    if xs.size == 0:
        return field

    dx = round((WIDTH / 2) - ((xs.min() + xs.max()) / 2))
    dy = round((HEIGHT / 2) - ((ys.min() + ys.max()) / 2))
    if dx == 0 and dy == 0:
        return field

    centered = np.zeros_like(field)
    src_x0 = max(0, -dx)
    src_x1 = min(WIDTH, WIDTH - dx)
    dst_x0 = max(0, dx)
    dst_x1 = min(WIDTH, WIDTH + dx)
    src_y0 = max(0, -dy)
    src_y1 = min(HEIGHT, HEIGHT - dy)
    dst_y0 = max(0, dy)
    dst_y1 = min(HEIGHT, HEIGHT + dy)
    centered[dst_y0:dst_y1, dst_x0:dst_x1] = field[src_y0:src_y1, src_x0:src_x1]
    return centered


def smoothstep(edge0, edge1, value):
    x = np.clip((value - edge0) / (edge1 - edge0), 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def ease_in_out(t):
    return t * t * (3.0 - 2.0 * t)


def normalize_field(field):
    maximum = float(field.max())
    if maximum <= 0:
        return field
    return np.clip(field / maximum, 0.0, 1.0)


def save_gif(path, frames, durations, loop=None):
    save_args = {
        "save_all": True,
        "append_images": frames[1:],
        "duration": durations,
        "optimize": True,
    }
    if loop is not None:
        save_args["loop"] = loop
    frames[0].save(path, **save_args)


def main():
    ASSETS.mkdir(exist_ok=True)

    target = text_mask()
    field = initial_field()
    fields = []

    for _ in range(STEPS + 1):
        fields.append(center_field(field))
        field = smoothlife_step(field)

    forward_frames = [render_field(frame) for frame in fields]
    save_gif(
        FORWARD_PATH,
        forward_frames,
        [DURATION_MS] * len(forward_frames),
        loop=0,
    )

    reverse_frame_count = round((REVERSE_SECONDS * 1000) / DURATION_MS)
    reverse_indices = np.linspace(
        REVERSE_START_STEP,
        REVERSE_START_STEP - REVERSE_SPAN_STEPS,
        reverse_frame_count,
    ).round().astype(int)
    reverse_fields = [fields[index] for index in reverse_indices]
    reverse_frames = [render_field(frame) for frame in reverse_fields]
    save_gif(
        REVERSE_PATH,
        reverse_frames,
        [DURATION_MS] * len(reverse_frames),
    )

    print(f"Wrote {FORWARD_PATH}")
    print(f"Wrote {REVERSE_PATH}")


if __name__ == "__main__":
    main()
