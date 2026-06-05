from pathlib import Path

import torch
import torch.nn.functional as F
from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

NAME = "Robin Hylands"
WIDTH = 220
HEIGHT = 34
OUTPUT_SCALE = 2
TITLE_FONT_SIZE = 29
BACKGROUND = (247, 246, 242)
LIVE = (22, 22, 22)
FONT_PATH = "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf"

BIRTH_LOW = 0.278
BIRTH_HIGH = 0.365
DEATH_LOW = 0.267
DEATH_HIGH = 0.445
ALPHA_N = 0.028
ALPHA_M = 0.147
TIME_STEP = 0.08

INNER_RADIUS = 2.0
OUTER_RADIUS = 6.0
ITERATIONS = 600
LEARNING_RATE = 0.04


def sigmoid_rule(x, center, alpha):
    return torch.sigmoid((x - center) * 4.0 / alpha)


def interval_sigmoid(x, low, high, alpha):
    return sigmoid_rule(x, low, alpha) * (1.0 - sigmoid_rule(x, high, alpha))


def mix_by_inner(alive_value, dead_value, inner_average):
    amount = sigmoid_rule(inner_average, 0.5, ALPHA_M)
    return alive_value * (1.0 - amount) + dead_value * amount


def make_kernel(inner_radius, outer_radius=None):
    radius = int(round(outer_radius if outer_radius is not None else inner_radius))
    coords = torch.arange(-radius, radius + 1, dtype=torch.float32)
    y, x = torch.meshgrid(coords, coords, indexing="ij")
    distance = torch.sqrt(x * x + y * y)

    if outer_radius is None:
        kernel = distance <= inner_radius
    else:
        kernel = (distance > inner_radius) & (distance <= outer_radius)

    kernel = kernel.float()
    kernel /= kernel.sum()
    return kernel.view(1, 1, kernel.shape[0], kernel.shape[1])


INNER_KERNEL = make_kernel(INNER_RADIUS)
OUTER_KERNEL = make_kernel(INNER_RADIUS, OUTER_RADIUS)


def circular_convolve(field, kernel):
    pad_y = kernel.shape[-2] // 2
    pad_x = kernel.shape[-1] // 2
    padded = F.pad(field, (pad_x, pad_x, pad_y, pad_y), mode="circular")
    return F.conv2d(padded, kernel)


def smoothlife_step(field):
    inner_average = circular_convolve(field, INNER_KERNEL)
    outer_average = circular_convolve(field, OUTER_KERNEL)
    low = mix_by_inner(BIRTH_LOW, DEATH_LOW, inner_average)
    high = mix_by_inner(BIRTH_HIGH, DEATH_HIGH, inner_average)
    target = interval_sigmoid(outer_average, low, high, ALPHA_N)
    return torch.clamp(field + TIME_STEP * (2.0 * target - 1.0), 0.0, 1.0)


def text_target():
    image = Image.new("L", (WIDTH, HEIGHT), 0)
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(FONT_PATH, TITLE_FONT_SIZE)
    bbox = draw.textbbox((0, 0), NAME, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (WIDTH - text_width) // 2 - bbox[0]
    y = (HEIGHT - text_height) // 2 - bbox[1]
    draw.text((x, y), NAME, fill=255, font=font)
    image = image.filter(ImageFilter.GaussianBlur(0.35))
    data = torch.tensor(list(image.getdata()), dtype=torch.float32).view(1, 1, HEIGHT, WIDTH)
    return data / 255.0


def logit_clamped(field):
    field = torch.clamp(field, 1e-4, 1.0 - 1e-4)
    return torch.log(field / (1.0 - field))


def total_variation(field):
    return (
        torch.mean(torch.abs(field[:, :, :, 1:] - field[:, :, :, :-1]))
        + torch.mean(torch.abs(field[:, :, 1:, :] - field[:, :, :-1, :]))
    )


def render_field(field, path):
    field = field.detach().cpu().squeeze().clamp(0.0, 1.0)
    alpha = smoothstep(0.18, 0.62, field)
    mask = Image.fromarray((alpha.numpy() * 255).astype("uint8"), "L")
    mask = mask.filter(ImageFilter.GaussianBlur(0.35))
    image = Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND)
    shape = Image.new("RGB", (WIDTH, HEIGHT), LIVE)
    image.paste(shape, mask=mask)
    image = image.resize((WIDTH * OUTPUT_SCALE, HEIGHT * OUTPUT_SCALE), Image.Resampling.BICUBIC)
    image.save(path)


def smoothstep(edge0, edge1, value):
    x = torch.clamp((value - edge0) / (edge1 - edge0), 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def render_error(predicted, target, path):
    error = torch.abs(predicted.detach().cpu().squeeze() - target.detach().cpu().squeeze())
    image = Image.fromarray((error.clamp(0.0, 1.0).numpy() * 255).astype("uint8"), "L")
    image = image.resize((WIDTH * OUTPUT_SCALE, HEIGHT * OUTPUT_SCALE), Image.Resampling.BICUBIC)
    image.save(path)


def main():
    torch.set_num_threads(4)
    ASSETS.mkdir(exist_ok=True)
    target = text_target()

    with torch.no_grad():
        backward_euler = torch.clamp(target - TIME_STEP * (2.0 * smoothlife_step(target) - 1.0), 0.0, 1.0)

    logits = logit_clamped(backward_euler).clone().detach().requires_grad_(True)
    optimizer = torch.optim.Adam([logits], lr=LEARNING_RATE)

    for iteration in range(ITERATIONS + 1):
        predecessor = torch.sigmoid(logits)
        predicted = smoothlife_step(predecessor)
        reconstruction_loss = F.mse_loss(predicted, target)
        regularization = 0.0008 * total_variation(predecessor)
        loss = reconstruction_loss + regularization

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        if iteration % 100 == 0:
            print(
                f"{iteration:04d} loss={loss.item():.8f} "
                f"mse={reconstruction_loss.item():.8f} tv={regularization.item():.8f}",
                flush=True,
            )

    with torch.no_grad():
        predecessor = torch.sigmoid(logits)
        predicted = smoothlife_step(predecessor)
        final_mse = F.mse_loss(predicted, target).item()

    render_field(predecessor, ASSETS / "smoothlife-name-predecessor.png")
    render_field(predicted, ASSETS / "smoothlife-name-forward-from-predecessor.png")
    render_field(target, ASSETS / "smoothlife-name-target.png")
    render_error(predicted, target, ASSETS / "smoothlife-name-forward-error.png")

    print(f"final mse={final_mse:.8f}")
    print(f"Wrote {ASSETS / 'smoothlife-name-predecessor.png'}")
    print(f"Wrote {ASSETS / 'smoothlife-name-forward-from-predecessor.png'}")
    print(f"Wrote {ASSETS / 'smoothlife-name-target.png'}")
    print(f"Wrote {ASSETS / 'smoothlife-name-forward-error.png'}")


if __name__ == "__main__":
    main()
