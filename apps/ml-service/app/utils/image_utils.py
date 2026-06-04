"""Image processing utilities."""

import logging
from io import BytesIO

from PIL import Image

logger = logging.getLogger(__name__)


def get_image_dimensions(image_bytes: bytes) -> tuple[int, int]:
    """Get the dimensions of an image.

    Args:
        image_bytes: Raw image bytes

    Returns:
        Tuple of (width, height)
    """
    image = Image.open(BytesIO(image_bytes))
    return image.size


def resize_image(
    image_bytes: bytes,
    max_width: int = 1920,
    max_height: int = 1080,
    quality: int = 85,
) -> bytes:
    """Resize an image while maintaining aspect ratio.

    Args:
        image_bytes: Raw image bytes
        max_width: Maximum width
        max_height: Maximum height
        quality: JPEG quality (1-100)

    Returns:
        Resized image bytes
    """
    image = Image.open(BytesIO(image_bytes))

    # Don't upscale
    if image.width <= max_width and image.height <= max_height:
        return image_bytes

    # Calculate new dimensions
    ratio = min(max_width / image.width, max_height / image.height)
    new_size = (int(image.width * ratio), int(image.height * ratio))

    # Resize
    resized = image.resize(new_size, Image.Resampling.LANCZOS)

    # Convert to RGB if necessary (for JPEG)
    if resized.mode in ("RGBA", "P"):
        resized = resized.convert("RGB")

    # Save to bytes
    output = BytesIO()
    resized.save(output, format="JPEG", quality=quality, optimize=True)
    output.seek(0)

    logger.debug(f"Resized image from {image.size} to {new_size}")
    return output.getvalue()


def create_thumbnail(
    image_bytes: bytes,
    size: tuple[int, int] = (300, 300),
    quality: int = 80,
) -> bytes:
    """Create a thumbnail from an image.

    Args:
        image_bytes: Raw image bytes
        size: Thumbnail size (width, height)
        quality: JPEG quality (1-100)

    Returns:
        Thumbnail image bytes
    """
    image = Image.open(BytesIO(image_bytes))

    # Create thumbnail (maintains aspect ratio)
    image.thumbnail(size, Image.Resampling.LANCZOS)

    # Convert to RGB if necessary
    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")

    # Save to bytes
    output = BytesIO()
    image.save(output, format="JPEG", quality=quality, optimize=True)
    output.seek(0)

    logger.debug(f"Created thumbnail of size {image.size}")
    return output.getvalue()


def optimize_image(image_bytes: bytes, quality: int = 85) -> bytes:
    """Optimize an image for web delivery.

    Args:
        image_bytes: Raw image bytes
        quality: JPEG quality (1-100)

    Returns:
        Optimized image bytes
    """
    image = Image.open(BytesIO(image_bytes))

    # Convert to RGB if necessary
    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")

    # Save with optimization
    output = BytesIO()
    image.save(output, format="JPEG", quality=quality, optimize=True)
    output.seek(0)

    original_size = len(image_bytes)
    optimized_size = len(output.getvalue())
    savings = (1 - optimized_size / original_size) * 100

    logger.debug(
        f"Optimized image: {original_size} -> {optimized_size} "
        f"({savings:.1f}% reduction)"
    )
    return output.getvalue()


def extract_exif_data(image_bytes: bytes) -> dict:
    """Extract EXIF metadata from an image.

    Args:
        image_bytes: Raw image bytes

    Returns:
        Dictionary of EXIF data
    """
    image = Image.open(BytesIO(image_bytes))
    exif_data = {}

    try:
        exif = image._getexif()
        if exif:
            from PIL.ExifTags import TAGS

            for tag_id, value in exif.items():
                tag = TAGS.get(tag_id, tag_id)
                # Convert bytes to string if possible
                if isinstance(value, bytes):
                    try:
                        value = value.decode("utf-8")
                    except UnicodeDecodeError:
                        value = str(value)
                exif_data[tag] = value
    except Exception as e:
        logger.warning(f"Could not extract EXIF data: {e}")

    return exif_data
