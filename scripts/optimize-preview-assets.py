"""Generate lightweight delivery copies; retain every original artwork."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
files = [root / 'assets' / f'project-card-{i}.png' for i in range(1, 5)]
files += [root / 'assets/life-weave/five-elements-opening.png']
for source in files:
    output = source.with_suffix('.webp')
    with Image.open(source) as image:
        image.save(output, 'WEBP', quality=90, method=6)
    print(f'{source.name}: {source.stat().st_size} -> {output.stat().st_size} bytes')
