"""Build the design reader and source archive; never modifies game runtime files.

Requires Python Markdown, supplied through --deps when not globally installed.
"""
from pathlib import Path
import argparse
import hashlib
import html
import json
import re
import runpy
import sys
import zipfile

parser = argparse.ArgumentParser()
parser.add_argument('--deps', type=Path)
args = parser.parse_args()
if args.deps:
    sys.path.insert(0, str(args.deps))
import markdown

root = Path(__file__).resolve().parents[1]
source = root / 'docs' / 'the-witness'
contract = json.loads((source / 'design-contract.json').read_text(encoding='utf-8'))
files = [source / name for name in contract['documentFiles']]
campaign = json.loads((source / 'campaign-contract.json').read_text(encoding='utf-8'))
version = contract['documentVersion']
assert re.fullmatch(r'\d+\.\d+', version)
assert version == campaign['documentVersion']
out = root / 'outputs' / f'THE-WITNESS-Design-v{version}'
out.mkdir(parents=True, exist_ok=True)
assert len(files) == 16
assert contract['contentBudget'] == dict(bridgeQuests=12, relationshipQuests=6, legends=5, requiredLegends=3, optionalLegends=2, veils=4, hubs=3, companions=4)
assert campaign['budget'] == contract['contentBudget']
assert len(contract['canonicalScenes']) == 5
contract_report = runpy.run_path(str(root/'tools'/'validate-witness-contracts.py'))['validate_contracts'](source)
(out/'contract-qa.json').write_text(json.dumps(contract_report,ensure_ascii=False,indent=2),encoding='utf-8')
all_text = '\n'.join(p.read_text(encoding='utf-8') for p in files)
source_ids = set(re.findall(r'^\*\*S(\d{2}) ', (source/'10-source-register.md').read_text(encoding='utf-8'), re.M))
assert source_ids == {f'{i:02d}' for i in range(1, 33)}
assert set(re.findall(r'\bS(\d{2})\b', all_text)) <= source_ids
chapters = campaign['chapters']
assert [q['id'] for q in chapters] == [f'Q{i:02d}' for i in range(1,13)]
evidence_ids = {e['id'] for e in campaign['evidence']}
assert len(evidence_ids) == 10
quest_ids = {q['id'] for q in chapters}
for i,q in enumerate(chapters):
    assert q['previous'] == (chapters[i-1]['id'] if i else None)
    assert q['next'] == (chapters[i+1]['id'] if i+1<len(chapters) else None)
    assert len(q['routes']) == len(set(q['routes'])) and len(q['routes']) >= 2
    assert q['fallback'] and q['commitEvent'] == q['id']+'.COMMITTED'
    assert all(c['target'] in quest_ids|{'EPILOGUE'} for c in q['callbacks'])
    assert all(c['target']=='EPILOGUE' or c['target']>q['id'] for c in q['callbacks'])
assert set(chapters[1]['routes']) == set(contract['Q02']['routes'])
assert chapters[-2]['routes'] == chapters[-1]['routes']
assert {x for q in chapters for x in q['legends']} == {x['id'] for x in contract['canonicalScenes']}
assert {x for q in chapters for x in q['veils']} == {'V01','V02','V03','V04'}
g17=campaign['truthModel']['G17']
assert g17['dispatched'] == g17['receivedGalilee']+g17['documentedDamage']+g17['diverted']
assert campaign['truthModel']['B06']['distinctFromG17']
for claim in campaign['claims']:
    assert set(claim['allOf']+claim['anyOf']) <= evidence_ids
assert len(campaign['relationshipQuests']) == 6
assert all(len(b['approaches'])>=2 and b['callback'] in quest_ids for b in campaign['relationshipQuests'])
dossier=(source/'11-chapter-dossiers.md').read_text(encoding='utf-8')
assert re.findall(r'^## (Q\d{2}) ',dossier,re.M)==[q['id'] for q in chapters]
for q in chapters:
    section=re.split(r'^## ',dossier,flags=re.M)[int(q['id'][1:])]
    assert all('`'+route+'`' in section for route in q['routes']), q['id']
for p in files:
    for target in re.findall(r'\]\(([^)]+)\)', p.read_text(encoding='utf-8')):
        if not target.startswith(('http:', 'https:', '#')):
            assert (p.parent / target.split('#')[0]).exists(), (p, target)

ids = {p.name: ('overview' if p.name == 'README.md' else 'chapter-' + p.name[:2]) for p in files}
nav, sections = [], []
for p in files:
    text = p.read_text(encoding='utf-8')
    title = text.splitlines()[0].removeprefix('# ')
    body = markdown.markdown(text, extensions=['tables', 'fenced_code', 'sane_lists'])
    if p.name.startswith('11-'):
        body = re.sub(r'<h2>(Q\d{2})(.*?)</h2>', lambda m:f'<h2 id="chapter-11-{m[1].lower()}">{m[1]}{m[2]}</h2>',body)
    if p.name.startswith('14-'):
        body = re.sub(r'<h2>(L\d{2})(.*?)</h2>', lambda m:f'<h2 id="chapter-14-{m[1].lower()}">{m[1]}{m[2]}</h2>',body)
    if p.name.startswith('15-'):
        body = re.sub(r'<h2>(L\d{2})\.(SOURCE|WORLD)(.*?)</h2>', lambda m:f'<h2 id="chapter-15-{m[1].lower()}-{m[2].lower()}">{m[1]}.{m[2]}{m[3]}</h2>',body)
    for filename, target in ids.items():
        body = body.replace(f'href="{filename}"', f'href="#{target}"')
    for catalog in ['design-contract.json','campaign-contract.json']:
        body = body.replace(f'href="{catalog}"', f'href="sources/{catalog}"')
    body = re.sub(r'<a href="(https?://[^\"]+)"', r'<a target="_blank" rel="noopener noreferrer" href="\1"', body)
    nav.append(f'<a href="#{ids[p.name]}">{html.escape(title)}</a>')
    sections.append(f'<article id="{ids[p.name]}" data-chapter><div class="eyebrow">DESIGN DOSSIER / 07.11.2026</div>{body}</article>')

css = '''
:root{--ink:#1e292b;--paper:#f6f3ed;--muted:#596365;--accent:#785328;--line:#d8d1c6}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:32px}
body{margin:0;color:var(--ink);background:var(--paper);font:17px/1.78 'Segoe UI',Arial,sans-serif}
aside{position:fixed;inset:0 auto 0 0;width:305px;border-right:1px solid var(--line);padding:30px 25px;overflow:auto;background:#eee9df}
.brand{font:600 27px/1.2 Georgia,serif;letter-spacing:2px}.subtitle{color:var(--muted);font-size:13px;margin:8px 0 22px}
nav a{display:block;text-decoration:none;color:var(--ink);font-size:13px;line-height:1.5;padding:9px 0;border-bottom:1px solid var(--line)}
nav a:hover,nav a.active{color:var(--accent);font-weight:600}
main{margin-left:305px;max-width:1380px;padding:55px 60px 100px}
.cover{padding:25px 0 60px;border-bottom:2px solid var(--ink);margin-bottom:65px}
.cover h1{font:normal clamp(34px,5vw,68px)/1.1 Georgia,serif;letter-spacing:3px;margin:15px 0}.cover h2{font:normal 25px/1.4 Georgia,serif;color:var(--accent)}
.cover p{max-width:740px}.eyebrow{font-size:11px;letter-spacing:2px;color:var(--muted);font-weight:600}
article{padding-bottom:65px;margin-bottom:65px;border-bottom:1px solid var(--line);scroll-margin-top:32px}
article h1{font:normal 34px/1.3 Georgia,serif;margin:12px 0 30px}
article h2{font-size:23px;line-height:1.5;margin-top:40px}article h3{font-size:19px;margin-top:32px}
p{margin:16px 0}li{margin:8px 0}a{color:var(--accent);text-underline-offset:3px;overflow-wrap:anywhere}
code{font-size:.86em;background:#eae4d9;padding:2px 5px;overflow-wrap:anywhere}pre{overflow:auto}
table{width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;margin:24px 0;table-layout:fixed}
th,td{text-align:left;vertical-align:top;padding:12px 9px;border:1px solid var(--line);overflow-wrap:anywhere}th{background:#eae4d9}
input,select{width:100%;border:1px solid #ada79d;background:#fffdf8;padding:11px;font:14px 'Segoe UI',sans-serif;border-radius:0}select{margin:12px 0}
button{border:1px solid #8b8174;background:transparent;padding:9px 13px;color:var(--ink);cursor:pointer;font:14px 'Segoe UI',sans-serif;margin-top:12px}
#result{font-size:12px;color:var(--muted);min-height:22px;margin-top:5px}.no-print{font-size:13px}
[hidden]{display:none!important}footer{font-size:13px;color:var(--muted)}
@media(max-width:1000px){aside{position:relative;width:100%;max-height:none;padding:24px}nav{display:grid;grid-template-columns:1fr 1fr;gap:0 20px}main{margin:0;padding:30px 24px}article h1{font-size:28px}table{font-size:12px}}
@media(max-width:550px){nav{display:block}table{display:block;overflow:auto;table-layout:auto}th,td{min-width:130px}main{padding:24px 18px}}
@media print{@page{size:A4;margin:17mm 15mm}body{background:white;font-size:10pt;line-height:1.55}aside,.no-print,button{display:none}main{margin:0;padding:0;max-width:none}.cover{break-after:page;margin:0;padding-top:35mm;border:0}.cover h1{font-size:40pt}article{break-before:page;border:0;margin:0;padding:0}article h1{font-size:25pt}article h2{font-size:16pt;break-after:avoid}article h3{font-size:13pt;break-after:avoid}p,li{orphans:3;widows:3}table{font-size:8pt;table-layout:fixed}tr{break-inside:avoid}a{color:inherit}article[hidden]{display:block!important}}
'''
script = '''
const chapters=[...document.querySelectorAll('[data-chapter]')];
const input=document.getElementById('search');
const normal=s=>s.toLocaleLowerCase('vi').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/đ/g,'d');
input.addEventListener('input',()=>{const q=normal(input.value.trim());let n=0;chapters.forEach(c=>{const hit=!q||normal(c.textContent).includes(q);c.hidden=!hit;if(hit)n++});document.getElementById('result').textContent=q?n+' / '+chapters.length+' tài liệu chứa từ khóa':'';});
function jump(hash){input.value='';chapters.forEach(c=>c.hidden=false);document.getElementById('result').textContent='';requestAnimationFrame(()=>{document.getElementById(hash.slice(1)).scrollIntoView({behavior:'instant',block:'start'});history.replaceState(null,'',hash);});}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();jump(a.hash);}));
document.getElementById('quest-jump').addEventListener('change',e=>{if(e.target.value)jump(e.target.value);});
document.getElementById('legend-jump').addEventListener('change',e=>{if(e.target.value)jump(e.target.value);});
window.addEventListener('beforeprint',()=>chapters.forEach(c=>c.hidden=false));
document.getElementById('print').addEventListener('click',()=>window.print());
'''
quest_options=''.join(f'<option value="#chapter-11-{q["id"].lower()}">{q["id"]} — '+html.escape(re.search(r'^## '+q['id']+r' — (.+)$',dossier,re.M)[1])+'</option>' for q in chapters)
legend_dossier=(source/'14-legends-depth-dossiers.md').read_text(encoding='utf-8')
legend_options=''.join(f'<option value="#chapter-14-{lid.lower()}">'+html.escape(re.search(r'^## '+lid+r' — (.+)$',legend_dossier,re.M)[1])+'</option>' for lid in campaign['narrativeSpine']['requiredOrder'])
page = f'''<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>THE WITNESS — Design Compendium v{version}</title><style>{css}</style></head><body>
<aside><div class="brand">THE WITNESS</div><div class="subtitle">Legacy of the Covenant<br>HỒ SƠ TIỀN SẢN XUẤT / v{version}</div><label for="search" class="no-print">Tìm trong bộ tài liệu (có thể gõ không dấu)</label><input id="search" type="search" placeholder="Ví dụ: Môsê, cổng truyện"><div id="result" role="status" aria-live="polite"></div><label for="legend-jump" class="no-print">Ba chương cốt truyện</label><select id="legend-jump"><option value="">Chọn Legend bắt buộc</option>{legend_options}</select><label for="quest-jump" class="no-print">Các cầu nối đời thường</label><select id="quest-jump"><option value="">Chọn cầu nối Q01–Q12</option>{quest_options}</select><nav>{''.join(nav)}</nav><button id="print">In / Lưu thành PDF</button></aside>
<main><header class="cover"><div class="eyebrow">BIBLE • EXPLORATION • LIVING BRIDGES</div><h1>THE WITNESS</h1><h2>Legacy of the Covenant</h2><p><strong>Chứng Nhân: Di Sản Giao Ước</strong></p><p>“Across the ages, every life bears witness.”<br>Qua các thời đại, mỗi cuộc đời đều để lại một lời chứng.</p><p><strong>Kinh Thánh là cốt truyện chính. Thám hiểm là lối chơi chủ đạo.</strong><br>Môsê — Đavít — Phêrô: ba Legends bắt buộc nối bằng đời sống của người thường. Chơi hoặc xem tóm tắt đủ nội dung; thoát giữa chương giữ cổng chưa mở.</p><p class="no-print"><a href="THE-WITNESS-v3-Pitch.html">Đọc pitch và bất biến một trang</a> · <a href="#chapter-14-l01">Bắt đầu hồ sơ Môsê</a><br>{len(files)} tài liệu • {len(source_ids)} nguồn • 3 hồ sơ Legends • 6 packet nguồn/thế giới • 2 hợp đồng<br>Ngân sách thử: Legends 216/720 phút = 30%; chưa đo.<br>Thiết kế v3 chưa thẩm định chuyên gia, chưa playtest; bản chơi 0.1.0 vẫn theo v2.</p></header>{''.join(sections)}<footer>Nguồn biên tập: docs/the-witness • 07/11/2026 • [H] sáng tác / [C] chưa xác định • Bảy vị trí duyệt chưa phân công.</footer></main><script>{script}</script></body></html>'''
reader=out / 'THE-WITNESS-Design-Compendium.html'
reader.write_text(page,encoding='utf-8')
pitch_markdown=(source/'13-legends-spine-charter.md').read_text(encoding='utf-8')
pitch_body=markdown.markdown(pitch_markdown,extensions=['sane_lists'])
for filename,target in ids.items():
    pitch_body=pitch_body.replace(f'href="{filename}"',f'href="THE-WITNESS-Design-Compendium.html#{target}"')
pitch_body=pitch_body.replace('href="campaign-contract.json"','href="sources/campaign-contract.json"')
pitch_css='''*{box-sizing:border-box}body{margin:0;background:#e8e3da;color:#202d2e;font:14.5px/1.48 "Segoe UI",Arial,sans-serif}.pitch-page{width:210mm;height:297mm;padding:13mm 16mm;margin:20px auto;background:#fffefb}h1{font:600 23px/1.3 "Segoe UI",Arial,sans-serif;margin:0 0 10px;color:#684722}p{margin:9px 0}a{color:#684722}strong{font-weight:650}@media(max-width:800px){.pitch-page{width:auto;height:auto;margin:0;padding:24px}}@media print{@page{size:A4;margin:0}body{background:white}.pitch-page{width:210mm;height:297mm;margin:0;break-inside:avoid}}'''
(out/'THE-WITNESS-v3-Pitch.html').write_text(f'<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>THE WITNESS — Pitch v3 một trang</title><style>{pitch_css}</style></head><body><main class="pitch-page">{pitch_body}</main></body></html>',encoding='utf-8')
source_out=out / 'sources'
source_out.mkdir(exist_ok=True)
for p in files+[source/'design-contract.json',source/'campaign-contract.json']:
    (source_out/p.name).write_bytes(p.read_bytes())
tool_out=out/'tools'
tool_out.mkdir(exist_ok=True)
(tool_out/'validate-witness-contracts.py').write_bytes((root/'tools'/'validate-witness-contracts.py').read_bytes())
summary={'version':version,'date':'2026-11-07','markdownDocuments':len(files),'sourceIds':len(source_ids),'charactersIncludingSpaces':len(all_text),'whitespaceSeparatedTokens':len(all_text.split()),'runtimeFilesWrittenByBuilder':False,'checks':['local markdown links resolve','source IDs S01-S32 present and references resolve','both JSON contracts parse and budgets agree','12 linked bridges have fallback and forward callbacks','Q02 routes agree with retained consent example','Q11 and Q12 plan methods agree','three required/two optional Legends and four optional Veils scheduled','G17 quantity conservation and B06 separation','claim evidence IDs resolve','six relationship quests have approaches and callbacks','all 12 bridge dossiers match route IDs',f'{contract_report["assertions"]} v3 design assertions; see contract-qa.json'],'sourceSha256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in files+[source/'design-contract.json',source/'campaign-contract.json']}}
(out/'validation.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
archive=root/'outputs'/f'THE-WITNESS-Design-v{version}.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(out.rglob('*')):
        if p.is_file(): z.write(p,Path(out.name)/p.relative_to(out))
print(json.dumps({'reader':str(reader),'archive':str(archive),**summary},ensure_ascii=False,indent=2))
