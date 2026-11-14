const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');let checks=0;
function test(name,fn){fn();checks++;console.log('PASS '+name);}
const SOURCES=['index.html','witness.css','witness-content.js','witness-spine.js','witness-depth.js','witness-relationships.js','witness-craft.js','witness-craft-renderer.js','witness-field-ui.js','witness-workshop-ui.js','witness-model.js','witness-world.js','witness-compass.js','witness-app.js','witness-audio.js','witness-audio-library.js','tools/build.cjs','tools/serve.cjs','tools/vieneu-tts.cjs','test/campaign.cjs','test/spine.cjs','test/charset.cjs','test/scene-plan.cjs','test/v31-systems.cjs','test/vieneu-pipeline.cjs'];
// Dấu hiệu UTF-8 bị đọc sai như Latin-1 (mojibake) và ký tự thay thế.
const MOJIBAKE=[/\u00C3[\u0080-\u00BF]/,/\u00C2[\u0080-\u00BF]/,/\u00E2\u0080[\u0080-\u00BF]/,/\u00E1\u00BA[\u0080-\u00BF]/,/\uEF\uBF\uBD/];
const COMBINING=/[\u0300\u0301\u0303\u0308\u0309\u0323]/;
const DOTS=String.fromCharCode(46,46,46);
const REQUIRED=['Chứng Nhân','Di Sản Giao Ước','Xêdarê','đối chiếu','Người Chứng','đính chính','bữa chung','Phản tư','Mỗi cuộc đời'];
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function stringLiterals(src){const out=[];for(const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'/g))out.push(m[1]);for(const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"/g))out.push(m[1]);return out;}
test('Every source file is valid UTF-8 without replacement characters',()=>{for(const f of SOURCES){const s=read(f);assert(!s.includes('\uFFFD'),f+' chứa ký tự thay thế U+FFFD');}});
test('No source file carries mojibake from a wrong decode',()=>{for(const f of SOURCES){const s=read(f);for(const rx of MOJIBAKE){const hit=s.match(rx);assert(!hit,f+' chứa chuỗi sai mã: '+(hit?hit[0]:''));}}});
test('Vietnamese text stays in NFC so diacritics compose identically everywhere',()=>{for(const f of SOURCES){const s=read(f);assert.equal(s.normalize('NFC'),s,f+' không ở dạng NFC');}});
test('Key Vietnamese phrases survive in the shipping sources',()=>{const all=SOURCES.map(read).join('\n');for(const phrase of REQUIRED)assert(all.includes(phrase),'Thiếu cụm: '+phrase);});
test('Bilingual tone is intact in the interface copy',()=>{const app=read('witness-app.js'),html=read('index.html'),content=read('witness-content.js');assert(html.includes('Mỗi cuộc đời đều để lại một lời chứng.'));assert(app.includes('DẤU VẾT ĐỂ LẠI'));assert(app.includes('Đang đi tới…'));assert(content.includes('Góc bàn đã thuê còn là nơi sao giấy và gửi lời.'));assert(content.includes('Chứng Nhân')||content.includes('người chứng'));});
test('No Vietnamese source is left with a lone combining mark or an unspaced ellipsis',()=>{for(const f of SOURCES){const s=read(f);assert(!COMBINING.test(s),f+' có dấu thanh tách lẻ');for(const lit of stringLiterals(s))assert(!lit.includes(DOTS),f+' dùng ba chấm thay vì dấu chấm lửng');}});
console.log(JSON.stringify({status:'passed',checks,files:SOURCES.length,scope:'charset-vietnamese'}));
