"""Produce optimized delivery images from supplied comment exports, unchanged originals."""
from pathlib import Path
from PIL import Image
import sys

source = Path(sys.argv[1])
target = Path(__file__).resolve().parents[1] / 'assets/comments'
target.mkdir(parents=True, exist_ok=True)
images = {
 'feed': ('comments', '沉浸流'),
 'video-comments': ('comments', '视频'),
 'video-thread': ('comments', '视频-2'),
 'article': ('comments', '图文-1'),
 'article-comments': ('comments', '图文'),
 'article-thread': ('comments', '图文-展开'),
 'compose': ('comments', '图文-3'),
 'mention': ('comments', '图文-4'),
 'mention-selected': ('comments', '图文-5'),
 'success': ('comments', '发布成功'),
 'login': ('comments', '未登陆'),
 'entry': ('messages', 'iPhone 13 mini - 88'),
 'menu': ('messages', '入口1'),
 'video-menu': ('messages', '入口2-1'),
 'inbox': ('messages', '评论与回复'),
 'history': ('messages', '评论与回复-1'),
 'deleted': ('messages', '评论与回复-删除'),
 'empty-light': ('messages', '评论与回复-2'),
 'empty-dark': ('messages', '评论与回复-3'),
 'locate': ('messages', '弹起'),
 'handoff': ('messages', '图文-2'),
}
for key, (folder, name) in images.items():
    with Image.open(source / folder / (name + '.png')) as original:
        for width in (450, 900):
            height = round(original.height * width / original.width)
            original.convert('RGB').resize((width, height), Image.Resampling.LANCZOS).save(
                target / f'{key}-{width}.webp', quality=88, method=6)
print(f'Prepared {len(images)} screens, 2 sizes each; originals untouched.')
