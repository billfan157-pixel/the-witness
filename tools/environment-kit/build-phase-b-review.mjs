import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'../..'),out=path.join(root,'outputs/q01-phase-b');
const report=JSON.parse(fs.readFileSync(path.join(out,'candidate/report.json'),'utf8'));
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
for(const lighting of ['day','evening'])for(const view of ['first','third']){
 const shots=report.shots.filter(s=>s.lighting===lighting&&s.view===view),w=540,h=365,columns=3,height=Math.ceil(shots.length/columns)*h;
 if(!shots.length)continue;
 const pieces=[];
 for(const [i,s]of shots.entries()){
  const label=Buffer.from(`<svg width="${w}" height="27"><rect width="100%" height="100%" fill="#182b28"/><text x="12" y="19" fill="#e5dac1" font-size="16" font-family="sans-serif">${escape(s.point)} · ${lighting} · ${view}</text></svg>`);
  pieces.push({input:await sharp(path.join(out,'candidate',s.file)).resize(w,338,{fit:'contain',background:'#182b28'}).toBuffer(),left:i%columns*w,top:Math.floor(i/columns)*h+27});
  pieces.push({input:label,left:i%columns*w,top:Math.floor(i/columns)*h});
 }
 await sharp({create:{width:w*columns,height,channels:3,background:'#182b28'}}).composite(pieces).webp({quality:90}).toFile(path.join(out,`route-${lighting}-${view}.webp`));
}
const cards=report.shots.map(s=>`<figure data-point="${escape(s.point)}" data-light="${s.lighting}" data-view="${s.view}"><a href="candidate/${s.file}" target="_blank"><img loading="lazy" src="candidate/${s.file}" alt="${escape(s.point)} ${s.lighting} ${s.view}"></a><figcaption>${escape(s.point)} · ${s.lighting} · ${s.view}</figcaption></figure>`).join('');
fs.writeFileSync(path.join(out,'review.html'),`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Q01 · Giai đoạn B · Toàn tuyến</title><style>body{margin:0;background:#10201d;color:#e9dfcd;font:16px/1.5 system-ui}header{padding:24px 4vw;position:sticky;top:0;background:#10201df5;z-index:1;border-bottom:1px solid #607266}h1{font:32px Georgia;margin:0 0 10px}p{margin:5px 0}button,select{font:inherit;padding:8px 14px;background:#273a32;color:#eee2c9;border:1px solid #8e815d;border-radius:5px;margin:6px 6px 0 0}main{padding:20px 3vw;display:grid;grid-template-columns:repeat(auto-fit,minmax(460px,1fr));gap:22px}figure{margin:0}img{width:100%;display:block;border-radius:6px}figcaption{padding:8px 0}figure[hidden]{display:none}a{color:#e6ca83}@media(max-width:520px){main{grid-template-columns:1fr}}</style><header><h1>Q01 · Giai đoạn B — đánh giá toàn tuyến</h1><p>${report.points.length} điểm trọng yếu · ${report.shots.length} ảnh từ camera chơi thực · ${report.quality}. Nhấp ảnh để xem nguyên kích thước.</p><p>Đi theo tuyến bằng bộ điều khiển game. Phạm vi: sân hàng, kho, thang, mái, bến và các điểm nhiệm vụ; ngày và tối. Đây là bằng chứng để duyệt mỹ thuật, chưa là phê duyệt của người dùng.</p><select id="light"><option value="">Ngày + tối</option><option value="day">Ban ngày</option><option value="evening">Buổi tối</option></select><select id="view"><option value="">Cả hai góc nhìn</option><option value="first">Góc nhìn thứ nhất</option><option value="third">Góc nhìn thứ ba</option></select><select id="point"><option value="">Toàn tuyến</option>${report.points.map(p=>`<option>${escape(p.id)}</option>`).join('')}</select><span id="count"></span></header><main>${cards}</main><script>function filter(){let n=0;for(const f of document.querySelectorAll('figure')){f.hidden=!!((light.value&&light.value!==f.dataset.light)||(view.value&&view.value!==f.dataset.view)||(point.value&&point.value!==f.dataset.point));if(!f.hidden)n++;}count.textContent=n+' ảnh';}for(const s of document.querySelectorAll('select'))s.onchange=filter;filter();</script></html>`);
console.log(JSON.stringify({shots:report.shots.length,contactSheets:4,gallery:path.join(out,'review.html')}));
