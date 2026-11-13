"""Extract original artwork colours as data for an origin-clean CanvasTexture."""
import json
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1]
names = ['1-large 5.png', '2-large 5.png', '1-large 4.png', '3-large 3.png', '8-large 2.png']
samples = []
for name in names:
    with Image.open(root / 'assets/elements-source' / name) as image:
        image = image.convert('RGB').resize((70, 70), Image.Resampling.NEAREST)
        samples.append(['#%02x%02x%02x' % pixel for pixel in image.getdata()])
(root / 'assets/js/element-source-data.js').write_text('/* Original graduation artwork: wood/fire/earth/metal/water. */\nwindow.ElementSourceData=' + json.dumps(samples, separators=(',', ':')) + ';\n', encoding='utf-8')
