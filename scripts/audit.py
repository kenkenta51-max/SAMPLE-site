"""Verify local HTML links and HTML/CSS assets in the generated publication."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote
import json
import os
import re

ROOT = Path(__file__).resolve().parent.parent / 'dist'
BASE = '/' + os.environ.get('PAGES_BASE_PATH', 'SAMPLE-site').strip('/') + '/'
ORIGIN = 'https://kenkenta51-max.github.io'
errors = set()
checked = 0


def check(value, path):
    global checked
    value = value.strip()
    if not value or value.startswith(('#', 'data:', 'javascript:', 'mailto:', 'tel:', 'blob:')):
        return
    page_url = ORIGIN + BASE + path.relative_to(ROOT).as_posix()
    target = urlsplit(urljoin(page_url, value))
    if target.netloc != urlsplit(ORIGIN).netloc:
        return
    pathname = unquote(target.path)
    if not pathname.startswith(BASE):
        errors.add((str(path.relative_to(ROOT)), value, 'outside publication'))
        return
    local = ROOT / pathname[len(BASE):]
    if local.is_dir():
        local = local / 'index.html'
    checked += 1
    if not local.is_file():
        errors.add((str(path.relative_to(ROOT)), value, 'missing file'))

class Links(HTMLParser):
    def __init__(self, path):
        super().__init__(); self.path = path
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for attr in ('src', 'href', 'poster'):
            if attrs.get(attr):
                check(attrs[attr], self.path)
        if attrs.get('srcset') and not attrs['srcset'].startswith('data:'):
            for part in attrs['srcset'].split(','):
                if part.strip(): check(part.strip().split()[0], self.path)
        if 'style' in attrs:
            css(attrs['style'], self.path)

def css(text, path):
    for match in re.finditer(r'''url\(\s*(['"]?)(.*?)\1\s*\)''', text, re.S):
        check(match.group(2), path)

for file in ROOT.rglob('*'):
    if file.suffix == '.html':
        text = file.read_text()
        Links(file).feed(text)
        for match in re.finditer(r'<style[^>]*>(.*?)</style>', text, re.S | re.I):
            css(match.group(1), file)
    elif file.suffix == '.css':
        css(file.read_text(), file)
print(f'Checked {checked} local references across {len(list(ROOT.rglob("*.html")))} HTML pages')
for error in sorted(errors): print('ERROR', *error)
if errors: raise SystemExit(1)
