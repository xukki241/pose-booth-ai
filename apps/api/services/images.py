"""Bounded decoding for transient inference frames; never persists customer images."""
import base64
import binascii
import io
from PIL import Image, ImageOps, UnidentifiedImageError
from PIL.JpegImagePlugin import JpegImageFile
from PIL.PngImagePlugin import PngImageFile

MAX_IMAGE_BYTES = 8 * 1024 * 1024
MAX_IMAGE_PIXELS = 16_000_000


def decode_image(value: str) -> Image.Image:
    if value.startswith("data:"):
        header, separator, value = value.partition(",")
        if not separator or header not in {"data:image/jpeg;base64", "data:image/png;base64"}:
            raise ValueError("Only JPEG and PNG data URLs are supported")
    if len(value) > ((MAX_IMAGE_BYTES + 2) // 3) * 4:
        raise ValueError("Image exceeds 8 MiB limit")
    try:
        data = base64.b64decode(value, validate=True)
        if not data or len(data) > MAX_IMAGE_BYTES:
            raise ValueError("Invalid image size")
        # Select explicit decoders, bypassing Ultralytics' global Image.open HEIF patch.
        decoder = PngImageFile if data.startswith(b"\x89PNG\r\n\x1a\n") else JpegImageFile if data.startswith(b"\xff\xd8") else None
        if decoder is None:
            raise ValueError("Only JPEG and PNG are supported")
        with decoder(io.BytesIO(data)) as image:
            if image.format not in {"JPEG", "PNG"}:
                raise ValueError("Only JPEG and PNG are supported")
            if image.width * image.height > MAX_IMAGE_PIXELS:
                raise ValueError("Image exceeds 16 megapixels")
            return ImageOps.exif_transpose(image).convert("RGB")
    except (binascii.Error, UnidentifiedImageError, OSError, SyntaxError, Image.DecompressionBombError) as exc:
        raise ValueError("Invalid JPEG/PNG image") from exc
