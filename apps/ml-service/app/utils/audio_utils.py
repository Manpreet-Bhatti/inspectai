"""Audio processing utilities."""

import logging
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)


def get_audio_duration(audio_bytes: bytes, format: str = "webm") -> float:
    """Get the duration of an audio file in seconds.

    Args:
        audio_bytes: Raw audio bytes
        format: Audio format (e.g., 'webm', 'mp3', 'wav')

    Returns:
        Duration in seconds
    """
    try:
        import soundfile as sf

        # Write to temp file
        with tempfile.NamedTemporaryFile(suffix=f".{format}", delete=False) as f:
            f.write(audio_bytes)
            temp_path = Path(f.name)

        try:
            info = sf.info(str(temp_path))
            return info.duration
        finally:
            temp_path.unlink(missing_ok=True)

    except Exception:
        # Fallback to pydub
        try:
            from pydub import AudioSegment

            with tempfile.NamedTemporaryFile(suffix=f".{format}", delete=False) as f:
                f.write(audio_bytes)
                temp_path = Path(f.name)

            try:
                audio = AudioSegment.from_file(str(temp_path), format=format)
                return len(audio) / 1000.0
            finally:
                temp_path.unlink(missing_ok=True)

        except Exception as e:
            logger.warning(f"Could not determine audio duration: {e}")
            return 0.0


def convert_to_wav(audio_bytes: bytes, input_format: str = "webm") -> bytes:
    """Convert audio to WAV format.

    Args:
        audio_bytes: Raw audio bytes
        input_format: Input audio format

    Returns:
        WAV audio bytes
    """
    from pydub import AudioSegment

    with tempfile.NamedTemporaryFile(suffix=f".{input_format}", delete=False) as f:
        f.write(audio_bytes)
        input_path = Path(f.name)

    try:
        audio = AudioSegment.from_file(str(input_path), format=input_format)

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            output_path = Path(f.name)

        audio.export(str(output_path), format="wav")

        with open(output_path, "rb") as f:
            wav_bytes = f.read()

        output_path.unlink(missing_ok=True)
        logger.debug(f"Converted {input_format} to WAV")
        return wav_bytes

    finally:
        input_path.unlink(missing_ok=True)


def normalize_audio(audio_bytes: bytes, format: str = "webm") -> bytes:
    """Normalize audio volume.

    Args:
        audio_bytes: Raw audio bytes
        format: Audio format

    Returns:
        Normalized audio bytes
    """
    from pydub import AudioSegment
    from pydub.effects import normalize

    with tempfile.NamedTemporaryFile(suffix=f".{format}", delete=False) as f:
        f.write(audio_bytes)
        input_path = Path(f.name)

    try:
        audio = AudioSegment.from_file(str(input_path), format=format)
        normalized = normalize(audio)

        with tempfile.NamedTemporaryFile(suffix=f".{format}", delete=False) as f:
            output_path = Path(f.name)

        normalized.export(str(output_path), format=format)

        with open(output_path, "rb") as f:
            normalized_bytes = f.read()

        output_path.unlink(missing_ok=True)
        logger.debug("Normalized audio volume")
        return normalized_bytes

    finally:
        input_path.unlink(missing_ok=True)


def trim_silence(
    audio_bytes: bytes,
    format: str = "webm",
    silence_thresh: int = -40,
    min_silence_len: int = 500,
) -> bytes:
    """Trim silence from audio.

    Args:
        audio_bytes: Raw audio bytes
        format: Audio format
        silence_thresh: Silence threshold in dB
        min_silence_len: Minimum silence length in ms

    Returns:
        Trimmed audio bytes
    """
    from pydub import AudioSegment
    from pydub.silence import detect_nonsilent

    with tempfile.NamedTemporaryFile(suffix=f".{format}", delete=False) as f:
        f.write(audio_bytes)
        input_path = Path(f.name)

    try:
        audio = AudioSegment.from_file(str(input_path), format=format)

        # Detect non-silent chunks
        nonsilent_chunks = detect_nonsilent(
            audio,
            min_silence_len=min_silence_len,
            silence_thresh=silence_thresh,
        )

        if not nonsilent_chunks:
            return audio_bytes

        # Get start and end of non-silent audio
        start = nonsilent_chunks[0][0]
        end = nonsilent_chunks[-1][1]

        trimmed = audio[start:end]

        with tempfile.NamedTemporaryFile(suffix=f".{format}", delete=False) as f:
            output_path = Path(f.name)

        trimmed.export(str(output_path), format=format)

        with open(output_path, "rb") as f:
            trimmed_bytes = f.read()

        output_path.unlink(missing_ok=True)

        original_duration = len(audio) / 1000.0
        trimmed_duration = len(trimmed) / 1000.0
        logger.debug(
            f"Trimmed silence: {original_duration:.1f}s -> {trimmed_duration:.1f}s"
        )
        return trimmed_bytes

    finally:
        input_path.unlink(missing_ok=True)
