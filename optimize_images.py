
from PIL import Image, ImageOps
from pathlib import Path

# Maximum image dimensions by category
CONFIG = {
    "assets/cards": 900,
    "assets/visuals/artwork": 800,
    "assets/visuals/spectrograms": 1200,
}

Image.MAX_IMAGE_PIXELS = 100_000_000

total_before = 0
total_after = 0
processed = 0
errors = []

for folder, max_dimension in CONFIG.items():
    directory = Path(folder)

    if not directory.exists():
        print(f"Missing directory: {folder}")
        continue

    for path in directory.rglob("*.png"):
        try:
            original_size = path.stat().st_size
            with Image.open(path) as image:
                image.load()
                image = ImageOps.exif_transpose(image)
                image.thumbnail(
                    (max_dimension, max_dimension),
                    Image.Resampling.LANCZOS
                )

                # Keep PNG filenames and transparency.
                # Reduce palette where practical for smaller files.
                if image.mode in ("RGB", "RGBA"):
                    if image.mode == "RGB":
                        image = image.quantize(
                            colors=256,
                            method=Image.Quantize.MEDIANCUT
                        )
                    else:
                        image = image.quantize(
                            colors=256,
                            method=Image.Quantize.FASTOCTREE
                        )

                temp_path = path.with_name(path.name + ".tmp")
                try:
                    image.save(temp_path, format="PNG", optimize=True)
                    new_size = temp_path.stat().st_size

                    # Replace only when the optimized image is smaller.
                    if new_size < original_size:
                        temp_path.replace(path)
                    else:
                        temp_path.unlink()
                        new_size = original_size
                finally:
                    if temp_path.exists():
                        temp_path.unlink()

            total_before += original_size
            total_after += new_size
            processed += 1

        except Exception as error:
            errors.append((str(path), str(error)))

    print(f"Finished: {folder}")

print(f"\nProcessed: {processed} images")
print(f"Before: {total_before / 1048576:.1f} MB")
print(f"After:  {total_after / 1048576:.1f} MB")
print(f"Saved:  {(total_before - total_after) / 1048576:.1f} MB")

for filename, error in errors:
    print(f"ERROR: {filename}: {error}")


