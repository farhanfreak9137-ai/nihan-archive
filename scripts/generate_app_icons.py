import os
from PIL import Image, ImageDraw

SRC_PATH = r"C:\Users\RCP\.gemini\antigravity-ide\brain\f6f1ad87-633b-4dec-9ffa-32f90847dc1e\logo_editorial_monogram_1788606122246.jpg"
BASE_DIR = r"C:\Our archive"

im = Image.open(SRC_PATH).convert("RGBA")

# 1. Save main web logo
public_dir = os.path.join(BASE_DIR, "public")
os.makedirs(public_dir, exist_ok=True)
im.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "logo.png"), "PNG")
im.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "logo-192.png"), "PNG")
im.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "favicon.png"), "PNG")
im.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(public_dir, "favicon.ico"), "ICO")

print("Saved web logos to public/")

# 2. Helper to create round icon
def make_round(img):
    size = img.size
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size[0], size[1]), fill=255)
    output = Image.new('RGBA', size, (0, 0, 0, 0))
    output.paste(img, (0, 0))
    output.putalpha(mask)
    return output

# 3. Android Mipmap sizes
icon_sizes = {
    "mipmap-mdpi": (48, 108),
    "mipmap-hdpi": (72, 162),
    "mipmap-xhdpi": (96, 216),
    "mipmap-xxhdpi": (144, 324),
    "mipmap-xxxhdpi": (192, 432),
}

res_dir = os.path.join(BASE_DIR, "android", "app", "src", "main", "res")

for folder, (std_size, fg_size) in icon_sizes.items():
    target_dir = os.path.join(res_dir, folder)
    if not os.path.exists(target_dir):
        continue
    
    # Standard square icon
    std_img = im.resize((std_size, std_size), Image.Resampling.LANCZOS)
    std_img.save(os.path.join(target_dir, "ic_launcher.png"), "PNG")
    
    # Round icon
    round_img = make_round(std_img)
    round_img.save(os.path.join(target_dir, "ic_launcher_round.png"), "PNG")
    
    # Adaptive foreground (icon centered on transparent canvas)
    fg_canvas = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
    inner_dim = int(fg_size * 0.72)
    resized_inner = im.resize((inner_dim, inner_dim), Image.Resampling.LANCZOS)
    offset = (fg_size - inner_dim) // 2
    fg_canvas.paste(resized_inner, (offset, offset), resized_inner)
    fg_canvas.save(os.path.join(target_dir, "ic_launcher_foreground.png"), "PNG")
    print(f"Updated {folder} icons")

# 4. Splash screens
splash_folders = [
    "drawable",
    "drawable-land-hdpi",
    "drawable-land-mdpi",
    "drawable-land-xhdpi",
    "drawable-land-xxhdpi",
    "drawable-land-xxxhdpi",
    "drawable-port-hdpi",
    "drawable-port-mdpi",
    "drawable-port-xhdpi",
    "drawable-port-xxhdpi",
    "drawable-port-xxxhdpi",
]

for s_folder in splash_folders:
    s_path = os.path.join(res_dir, s_folder, "splash.png")
    if os.path.exists(s_path):
        existing = Image.open(s_path)
        w, h = existing.size
        splash_canvas = Image.new("RGBA", (w, h), (11, 13, 16, 255))
        logo_dim = min(w, h, 400)
        resized_logo = im.resize((logo_dim, logo_dim), Image.Resampling.LANCZOS)
        pos = ((w - logo_dim) // 2, (h - logo_dim) // 2)
        splash_canvas.paste(resized_logo, pos, resized_logo)
        splash_canvas.save(s_path, "PNG")
        print(f"Updated splash for {s_folder}")

print("All app icons and splash screens successfully updated!")
