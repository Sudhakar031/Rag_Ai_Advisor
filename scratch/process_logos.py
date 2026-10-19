import os
from PIL import Image

src_tab_icon = r"C:/Users/Administrator/.gemini/antigravity/brain/0749b620-ebd1-4e21-88cc-edcc49abe401/.user_uploaded/media_1791440451335_77159896.png"
src_header_logo = r"C:/Users/Administrator/.gemini/antigravity/brain/0749b620-ebd1-4e21-88cc-edcc49abe401/.user_uploaded/media_1791440458209_c9a5f83c.png"

def make_transparent(im, tolerance=240):
    im = im.convert("RGBA")
    datas = im.getdata()
    new_data = []
    for item in datas:
        r, g, b, a = item
        # Calculate brightness / distance from white
        if r >= 250 and g >= 250 and b >= 250:
            new_data.append((255, 255, 255, 0))
        elif r > tolerance and g > tolerance and b > tolerance:
            # Smooth alpha feathering on edges
            min_val = min(r, g, b)
            alpha = int(255 * (255 - min_val) / (255 - tolerance))
            new_data.append((r, g, b, min(255, max(0, alpha))))
        else:
            new_data.append(item)
    im.putdata(new_data)
    return im

def crop_tight(im, padding=8):
    im_trans = make_transparent(im.copy())
    bbox = im_trans.getbbox()
    if bbox:
        # Add a small padding around the logo
        left = max(0, bbox[0] - padding)
        top = max(0, bbox[1] - padding)
        right = min(im.width, bbox[2] + padding)
        bottom = min(im.height, bbox[3] + padding)
        return im_trans.crop((left, top, right, bottom))
    return im_trans

# 1. Process Tab Icon (Image 1)
im1 = Image.open(src_tab_icon)
im1_trans = crop_tight(im1, padding=6)
# Make it square
w, h = im1_trans.size
side = max(w, h) + 8
square_icon = Image.new("RGBA", (side, side), (255, 255, 255, 0))
square_icon.paste(im1_trans, ((side - w) // 2, (side - h) // 2), im1_trans)

# Resize to standard icon sizes
icon_256 = square_icon.resize((256, 256), Image.Resampling.LANCZOS)
icon_64 = square_icon.resize((64, 64), Image.Resampling.LANCZOS)
icon_32 = square_icon.resize((32, 32), Image.Resampling.LANCZOS)

# 2. Process Header Logo (Image 2)
im2 = Image.open(src_header_logo)
im2_trans = crop_tight(im2, padding=4)

os.makedirs("public", exist_ok=True)
os.makedirs("app", exist_ok=True)
os.makedirs("static", exist_ok=True)

# Save tab icon files
square_icon.save("public/hireko-tab-icon.png")
square_icon.save("app/icon.png")
icon_256.save("public/apple-touch-icon.png")

# Save favicon.ico with multiple sizes (16, 32, 48, 64, 128, 256)
icon_256.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
icon_256.save("app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])

# Save header logo
im2_trans.save("public/hireko-header-logo.png")
im2_trans.save("static/hireko-header-logo.png")

print("Generated files:")
print(" - public/hireko-tab-icon.png:", square_icon.size)
print(" - app/icon.png:", square_icon.size)
print(" - public/favicon.ico & app/favicon.ico")
print(" - public/hireko-header-logo.png:", im2_trans.size)
