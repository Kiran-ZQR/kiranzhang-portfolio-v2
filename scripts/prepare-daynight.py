"""Create web delivery copies from the supplied exports; never modify originals."""
import json
import sys
from pathlib import Path
from PIL import Image

source = Path(sys.argv[1])
root = Path(__file__).resolve().parents[1]
target = root / 'assets/daynight'
target.mkdir(parents=True, exist_ok=True)
# Explicit pairing: export suffixes are not consistent between modes.
scenes = [
 ('article', '图文一级页 · 完整内容', 'reading', '图文一级页-light', '图文一级页-dark'),
 ('article-short', '图文一级页 · 另一版本', 'reading', '图文一级页-light-1', '图文一级页-dark-1'),
 ('article-detail', '图文二级页 · 完整内容', 'reading', '图文二级页_light-1', '图文二级页_dark'),
 ('article-detail-short', '图文二级页 · 另一版本', 'reading', '图文二级页_light', '图文二级页_dark-1'),
 ('personal', '个性化图文 · 完整内容', 'reading', '个性化图文-light', '个性化图文-dark'),
 ('personal-short', '个性化图文 · 另一版本', 'reading', '个性化图文-light-1', '个性化图文-dark-1'),
 ('video', '视频二级页', 'video', '视频二级页-light', '视频二级页-dark'),
 ('video-feed', '个性化视频 · Feed', 'video', '个性化视频（feed）-light', '个性化视频（feed）-dark'),
 ('video-vertical', '个性化竖版视频', 'video', '个性化竖版视频-light', '个性化竖版视频-dark'),
 ('news', '硬资讯 · 完整内容', 'news', '硬资讯-light', '硬资讯-dark-1'),
 ('news-short', '硬资讯 · 另一版本', 'news', '硬资讯-light-1', '硬资讯-dark'),
 ('news-video', '硬资讯视频', 'news', '硬资讯视频-light', '硬资讯视频-dark'),
 ('extra', '号外编选 · 不带拉动', 'edition', '号外编选（不带拉动）-light', '号外编选（不带拉动）-dark'),
 ('extra-pull', '号外编选 · 带拉动', 'edition', '号外编选（带拉动）-light', '号外编选（带拉动）-dark'),
 ('extra-article', '号外非指令文章', 'edition', '号外非指令文章-light', '号外非指令文章-dark'),
 ('morning', '早报页', 'edition', '早报页-light', '早报页-dark'),
]
manifest = []
for key, label, category, light, dark in scenes:
    dimensions = []
    for mode, name in [('light', light), ('dark', dark)]:
        with Image.open(source / (name + '.png')) as im:
            dimensions.append(im.size)
            for width in [450, 900]:
                resized = im.convert('RGB').resize((width, round(im.height * width / im.width)), Image.Resampling.LANCZOS)
                resized.save(target / f'{key}-{mode}-{width}.webp', 'WEBP', quality=88, method=6)
    assert dimensions[0] == dimensions[1], key
    manifest.append(dict(id=key, label=label, category=category, width=dimensions[0][0], height=dimensions[0][1]))
(target / 'scenes.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{len(manifest)} pairs; {sum(p.stat().st_size for p in target.glob("*.webp"))/1024/1024:.2f} MB total delivery images')
