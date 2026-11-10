"""Export the current documentation manifest; never write gameplay sources."""
from pathlib import Path
from datetime import datetime, timezone
import argparse
import hashlib
import html
import json
import re
import runpy
import shutil
import sys
import zipfile
from urllib.parse import unquote

parser = argparse.ArgumentParser()
parser.add_argument('--deps', type=Path)
args = parser.parse_args()
if args.deps:
    sys.path.insert(0, str(args.deps))
import markdown

root = Path(__file__).resolve().parents[1]
source = root / 'docs/the-witness'
contract = json.loads((source / 'design-contract.json').read_text(encoding='utf-8'))
doc_root = source.parent if contract.get('documentationRoot') == '..' else source
files = [doc_root / name for name in contract['documentFiles']]
assert files and len(files) == len(set(files))
assert all(p.is_file() and p.resolve().is_relative_to(doc_root.resolve()) for p in files)
qa = runpy.run_path(str(root / 'tools/validate-witness-contracts.py'))['validate_contracts'](source)
registry = json.loads((root / 'docs/agent/registry.json').read_text(encoding='utf-8'))
roles = {x['path']: x['role'] for x in registry['knowledge']['roles']}
edition = contract.get('depthExpansion', {}).get('revision', contract['documentVersion'])
assert re.fullmatch(r'\d+\.\d+', edition)
out = root / 'outputs' / ('THE-WITNESS-Design-v' + edition)
assert out.resolve().is_relative_to((root / 'outputs').resolve()) and not out.is_symlink()
if out.exists():
    shutil.rmtree(out)
out.mkdir(parents=True)


def key(p):
    return p.relative_to(root).as_posix()


def local_target(p, href):
    if re.match(r'^(?:https?:|mailto:|#)', href):
        return None
    target = (p.parent / unquote(href.split('#')[0])).resolve()
    assert target.is_relative_to(root.resolve()), (p, href, 'outside repository')
    assert target.is_file(), (p, href, 'missing linked source')
    return target


resources = set(files) | set(source.glob('*-contract.json'))
queue = list(resources)
while queue:
    p = queue.pop()
    if p.suffix != '.md':
        continue
    for href in re.findall(r'\]\(([^\s)]+)(?:\s+"[^"]*")?\)', p.read_text(encoding='utf-8')):
        target = local_target(p, href)
        if target is not None and target not in resources:
            resources.add(target)
            queue.append(target)


def article_id(p):
    name = p.name
    if p == root / 'docs/README.md':
        return 'overview'
    if p.parent == root / 'docs' and p.stem.isupper():
        return 'core-' + p.stem.lower()
    if p.parent == source and re.match(r'\d\d-', name):
        return 'chapter-' + name[:2]
    return 'reference-' + re.sub(r'[^a-z0-9]+', '-', key(p).lower()).strip('-')


ids = {p.resolve(): article_id(p) for p in files}
assert len(set(ids.values())) == len(ids), 'reader section IDs must be unique'
nav, sections = [], []
for p in files:
    text = p.read_text(encoding='utf-8')
    title = next(line.removeprefix('# ') for line in text.splitlines() if line.startswith('# '))
    body = markdown.markdown(text, extensions=['tables', 'fenced_code', 'sane_lists'])
    if p.name.startswith('11-'):
        body = re.sub(r'<h2>(Q\d{2})(.*?)</h2>', lambda m: '<h2 id="chapter-11-' + m[1].lower() + '">' + m[1] + m[2] + '</h2>', body)
    if p.name.startswith('14-legends'):
        body = re.sub(r'<h2>(L\d{2})(.*?)</h2>', lambda m: '<h2 id="chapter-14-' + m[1].lower() + '">' + m[1] + m[2] + '</h2>', body)
    if p.name.startswith('15-'):
        body = re.sub(r'<h2>(L\d{2})\.(SOURCE|WORLD)(.*?)</h2>', lambda m: '<h2 id="chapter-15-' + m[1].lower() + '-' + m[2].lower() + '">' + m[1] + '.' + m[2] + m[3] + '</h2>', body)

    def rewrite(match):
        href = html.unescape(match[1])
        target = local_target(p, href)
        if target is None:
            return match[0]
        fragment = href.split('#', 1)[1] if '#' in href else ''
        dest = ('#' + (fragment or ids[target])) if target in ids else ('sources/' + key(target) + ('#' + fragment if fragment else ''))
        return 'href="' + html.escape(dest, quote=True) + '"'

    body = re.sub(r'href="([^"]+)"', rewrite, body)
    section_id = ids[p.resolve()]
    nav.append('<a href="#' + section_id + '">' + html.escape(title) + '</a>')
    sections.append('<article id="' + section_id + '" data-chapter><small>' + roles.get(key(p), 'reference') + ' · ' + html.escape(key(p)) + '</small>' + body + '</article>')

css = '''*{box-sizing:border-box}body{margin:0;background:#f5f2eb;color:#202f2e;font:17px/1.7 system-ui}aside{position:fixed;inset:0 auto 0 0;width:280px;padding:24px;overflow:auto;background:#e9e3d7}nav a{display:block;margin:9px 0;font-size:14px}main{margin-left:280px;max-width:1100px;padding:40px}article{padding:24px 0;border-bottom:1px solid #bdb6a7;overflow-wrap:anywhere}h1,h2,h3{line-height:1.3}a{color:#745120}input,select,button{max-width:100%;font:inherit;padding:7px;margin:7px 0}table{border-collapse:collapse;width:100%;font-size:14px}td,th{border:1px solid #bdb6a7;padding:8px;text-align:left}pre{white-space:pre-wrap}img{max-width:100%}[hidden]{display:none!important}@media(max-width:800px){aside{position:static;width:auto}main{margin:0;padding:22px}table{display:block;overflow:auto}}@media print{aside,.no-print{display:none}main{margin:0}article{break-before:page}}'''
script = '''const search=document.getElementById('search'),chapters=[...document.querySelectorAll('[data-chapter]')];const norm=s=>s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/đ/gi,'d').toLowerCase();function filter(){let n=0;for(const c of chapters){c.hidden=!norm(c.textContent).includes(norm(search.value));if(!c.hidden)n++;}document.getElementById('result').textContent=n+' tài liệu';}function jump(hash){search.value='';filter();const e=document.getElementById(hash.slice(1));if(e)e.scrollIntoView();}search.oninput=filter;document.querySelectorAll('a[href^="#"]').forEach(a=>a.onclick=e=>{e.preventDefault();jump(a.hash);});for(const id of ['quest-jump','legend-jump'])document.getElementById(id).onchange=e=>jump(e.target.value);document.getElementById('print').onclick=()=>window.print();window.onbeforeprint=()=>chapters.forEach(c=>c.hidden=false);filter();'''
campaign = json.loads((source / 'campaign-contract.json').read_text(encoding='utf-8'))
quests = ''.join('<option value="#chapter-11-' + q['id'].lower() + '">' + q['id'] + '</option>' for q in campaign['chapters'])
legends = ''.join('<option value="#chapter-14-' + lid.lower() + '">' + lid + '</option>' for lid in campaign['narrativeSpine']['requiredOrder'])
date = datetime.now(timezone.utc).date().isoformat()
reader = '<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>THE WITNESS · Nguồn chuẩn</title><style>' + css + '</style><body><aside><strong>THE WITNESS</strong><p>6 trang lõi · chi tiết theo nhu cầu</p><input id="search" aria-label="Tìm tài liệu"><div id="result" role="status"></div><select id="quest-jump" aria-label="Chapter"><option value="">Q01–Q12</option>' + quests + '</select><select id="legend-jump" aria-label="Legend"><option value="">Legends</option>' + legends + '</select><nav>' + ''.join(nav) + '</nav><button id="print">In / PDF</button></aside><main><header><h1>Chứng Nhân: Di Sản Giao Ước</h1><p>Bản xuất nguồn ngày ' + date + '. Thiết kế, hiện trạng và nghiệm thu được phân biệt theo vai trò; xem STATUS trước khi làm.</p></header>' + ''.join(sections) + '</main><script>' + script + '</script></body></html>'
(out / 'THE-WITNESS-Design-Compendium.html').write_text(reader, encoding='utf-8')
pitch = '<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Chứng Nhân · Pitch</title><style>body{background:#eee;font:17px/1.7 system-ui}.pitch-page{box-sizing:border-box;width:210mm;min-height:297mm;padding:20mm;background:white;margin:auto}a{color:#745120}@media(max-width:800px){.pitch-page{width:auto;min-height:0;padding:24px}}@media print{body{margin:0}}</style><main class="pitch-page"><h1>UNSEALED WITNESS</h1><h2>Legacy of the Covenant</h2><p>Thám hiểm và điều tra đời sống người thường, nối ba chương Kinh Thánh L01, L02, L04. Quan sát, thử, cùng làm, bàn giao và nhìn thấy hệ quả.</p><p>Canon được bảo toàn; quyền hành động thuộc phần hư cấu. Hai định dạng tiếp cận có cùng quyền mở cổng khi đủ core. Lời chứng có nguồn và phạm vi, không được ép đồng thuận.</p><p>Thời lượng và chất lượng chưa được chứng nhận bằng playtest. Đọc <a href="THE-WITNESS-Design-Compendium.html#core-product">hợp đồng sản phẩm</a> và <a href="THE-WITNESS-Design-Compendium.html#core-status">trạng thái</a> để biết giới hạn.</p></main></html>'
(out / 'THE-WITNESS-v3-Pitch.html').write_text(pitch, encoding='utf-8')
for p in sorted(resources):
    destination = out / 'sources' / key(p)
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(p, destination)
summary = {'format': 2, 'version': edition, 'date': date, 'documentationVersion': 2, 'markdownDocuments': len(files), 'coreDocuments': len(registry['knowledge']['coreDocuments']), 'scope': 'documentation export only; not gameplay, art or production acceptance', 'sourceSha256': {key(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(resources)}, 'sections': {key(p): ids[p.resolve()] for p in files}}
(out / 'validation.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
(out / 'contract-qa.json').write_text(json.dumps(qa, ensure_ascii=False, indent=2), encoding='utf-8')
archive = out.parent / (out.name + '.zip')
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
    for p in sorted(out.rglob('*')):
        if p.is_file():
            bundle.write(p, p.relative_to(out))
print(json.dumps({'output': str(out), 'documents': len(files), 'core': summary['coreDocuments'], 'resources': len(resources), 'archive': str(archive)}, ensure_ascii=False))
