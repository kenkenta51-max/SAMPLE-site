"""Build all static samples under the GitHub Pages project path."""
from pathlib import Path
import importlib.util
import json
import os
import re
import shutil
from zipfile import ZipFile, ZIP_DEFLATED
from html import escape

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'dist'
BASE = '/' + os.environ.get('PAGES_BASE_PATH', 'SAMPLE-site').strip('/') + '/'
EXCLUDE = {'previews', 'inputs', 'rules', 'qa', 'delivery', 'docs', 'scripts', 'tests', 'site-dist', 'node_modules', '__pycache__'}
SKIP_SUFFIXES = {'.md', '.py', '.pyc', '.cjs', '.yml', '.yaml', '.toml'}

def main():
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    sites = json.loads((ROOT / 'sites.json').read_text())
    for site in sites:
        source = ROOT / 'sites' / site['slug'] / site.get('public_directory', '.')
        target = OUTPUT / 'sites' / site['slug']
        if site['slug'] == 'kurahaus-sample':
            spec = importlib.util.spec_from_file_location('kurahaus_build', source / 'scripts/build-pages.py')
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            module.BASE_PATH = BASE + 'sites/kurahaus-sample/'
            module.SITE_URL = 'https://kenkenta51-max.github.io' + module.BASE_PATH
            module.main()
            shutil.copytree(module.OUTPUT, target, ignore=shutil.ignore_patterns('.kurahaus-generated'))
        else:
            for file in source.rglob('*'):
                relative = file.relative_to(source)
                if not file.is_file() or any(p.startswith('.') or p in EXCLUDE for p in relative.parts):
                    continue
                if file.suffix.lower() in SKIP_SUFFIXES or file.name in {'vercel.json', 'package.json', 'package-lock.json'}:
                    continue
                dest = target / relative
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(file, dest)
        if site['slug'] == 'mirai-code-lab':
            archive = target / 'downloads' / 'MIRAI_CODE_LAB_sections_04-09.zip'
            archive.parent.mkdir(parents=True, exist_ok=True)
            with ZipFile(archive, 'w', ZIP_DEFLATED) as bundle:
                for image in sorted((target / 'designs').glob('*.png')):
                    bundle.write(image, image.name)
        if not (target / 'index.html').is_file():
            raise RuntimeError('Missing entry point: ' + site['slug'])
    cards = '\n'.join(
        '<li><span class="number">' + f'{i:02}' + '</span><div><h2><a href="sites/' + escape(s['slug']) + '/">' + escape(s['title']) + '</a></h2>'
        '<p>' + escape(s['slug']) + '</p></div><a class="visit" href="sites/' + escape(s['slug']) + '/" aria-label="' + escape(s['title']) + 'を開く">サイトを見る <span aria-hidden="true">↗</span></a></li>'
        for i, s in enumerate(sites, 1)
    )
    template = (ROOT / 'web/index.html').read_text()
    (OUTPUT / 'index.html').write_text(template.replace('{{SITE_LIST}}', cards).replace('{{SITE_COUNT}}', str(len(sites))))
    (OUTPUT / '.nojekyll').touch()
    print(f'Built {len(sites)} sites at {BASE}')

if __name__ == '__main__':
    main()
