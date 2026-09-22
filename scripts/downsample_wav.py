import pathlib
import wave

root = pathlib.Path(__file__).resolve().parents[1] / 'assets' / 'ielts-audio'
for source in root.glob('*.wav'):
    with wave.open(str(source), 'rb') as inp:
        channels, width, rate, frames, _, _ = inp.getparams()
        raw = inp.readframes(frames)
    if channels == 2:
        raw = b''.join(raw[i:i+width] for i in range(0, len(raw), width * channels))
    elif channels != 1:
        continue
    # Keep one out of every source samples.  Speech remains intelligible at 8 kHz.
    step = max(1, round(rate / 8000))
    samples = [raw[i:i+width] for i in range(0, len(raw), width * step)]
    if width == 2:
        packed = bytes(((int.from_bytes(s, 'little', signed=True) + 32768) >> 8) & 255 for s in samples if len(s) == 2)
    else:
        packed = b''.join(s for s in samples if len(s) == width)
    temp = source.with_suffix('.small.wav')
    with wave.open(str(temp), 'wb') as out:
        out.setnchannels(1); out.setsampwidth(1); out.setframerate(8000); out.writeframes(packed)
    temp.replace(source)
print('Downsampled', len(list(root.glob('*.wav'))), 'recordings')
