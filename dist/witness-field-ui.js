(function(root){
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(s,f,{near=null,message='',tested=false}={}){
    const X=root.WitnessDepth,C=root.WitnessCraft,d=f.def,p=f.payload,spots=C.fieldSpots(s),result=X.evaluate(s,d,p),current=spots.find(x=>x.id===near),selected=[...(d.items||[]),...(d.cards||[])].find(x=>x.id===f.selected);
    let html=`<div class="field-heading"><div><span class="eyebrow">CÙNG LÀM TẠI HIỆN TRƯỜNG</span><h2>${esc(d.title)}</h2></div><button data-act="field-exit" aria-label="Tạm rời phần việc">×</button></div><details class="field-brief" open><summary>Vì sao bạn làm việc này</summary><p>${esc(d.brief)}</p>${d.outcome?`<p><strong>Xong việc sẽ:</strong> ${esc(d.outcome)}</p>`:''}${d.rules?.length?`<p><strong>Nguyên tắc:</strong> ${esc(d.rules[0])}</p>`:''}${d.voice?`<p><strong>${esc(d.voice[0])}:</strong> ${esc(d.voice[1])}</p>`:''}${d.observations?.map(([title,text])=>`<p><strong>${esc(title)}:</strong> ${esc(text)}</p>`).join('')||''}</details>`;
    if(['allocation','dispatch','arrangement','inference'].includes(d.type)){
      const list=d.items||d.cards;
      html+=`<label class="field-select" for="field-item">${d.type==='inference'?'Dấu / nguồn đang đối chiếu':'Người / vật đang nhận việc'}<select id="field-item" data-field-select><option value="">Chọn một phần đang cùng làm</option>${list.map(x=>`<option value="${x.id}" ${f.selected===x.id?'selected':''}>${esc(x.label)}</option>`).join('')}</select></label>${selected?`<p class="field-selection">${esc(selected.detail)}</p>`:''}`;
    }
    if(d.type==='sequence')html+=`<p class="field-progress">Đã làm ${p.order?.length||0}/${d.steps.length} thao tác. Tới vật / điểm có tên để làm bước kế tiếp.</p>`;
    if(d.type==='route'){
      let noise=0,light=0;for(let i=1;i<(p.path||[]).length;i++){const e=d.edges.find(e=>e.from===p.path[i-1]&&e.to===p.path[i]);noise+=e?.noise||0;light+=e?.light||0;}
      html+=`<p class="field-progress">${(p.path||[d.start]).map(id=>esc(d.nodes.find(x=>x.id===id)?.label||id)).join(' → ')}</p>${d.noiseBudget!=null?`<p class="field-selection">Tiếng dội ${noise}/${d.noiseBudget} · Lộ sáng ${light}/${d.lightBudget}</p>`:''}`;
    }
    if(current){
      html+=`<div class="field-current"><strong>${esc(current.label)}</strong><p>${esc(current.detail)}</p>`;
      if(current.op.kind==='number')html+=`<div class="field-counter"><button data-act="field-number" data-id="${current.id}" data-delta="-1" aria-label="Bớt một đơn vị">−</button><output aria-live="polite">${esc(p.numbers?.[current.op.value]||0)}</output><button data-act="field-number" data-id="${current.id}" data-delta="1" aria-label="Thêm một đơn vị">+</button></div>`;
      else if(current.op.kind==='claim'){
        const claim=p.claims?.[current.op.value];
        html+=`<div class="field-verdict"><button data-act="field-verdict" data-id="${current.id}" data-value="supported" aria-pressed="${claim?.status==='supported'}">Có nguồn đúng phạm vi</button><button data-act="field-verdict" data-id="${current.id}" data-value="open" aria-pressed="${claim?.status==='open'}">Chưa đủ căn cứ</button></div><button class="field-do" data-act="field-operate" data-id="${current.id}">${selected?'Ghép / bỏ '+esc(selected.label):'Chọn dấu ở trên để ghép'}</button><small>Đang ghép: ${(claim?.cards||[]).map(id=>esc(d.cards.find(x=>x.id===id)?.label)).join(' · ')||'chưa có'}</small>`;
      }else if(current.op.kind!=='handoff')html+=`<button class="field-do" data-act="field-operate" data-id="${current.id}">${current.op.kind==='station'?(selected?'Đưa '+esc(selected.label)+' tới đây':'Chọn người hoặc vật ở trên'):current.op.kind==='route'?'Kiểm và giữ mốc này':'Thực hiện thao tác này'}</button>`;
      html+='</div>';
    }
    html+=`<details class="field-destinations"><summary>Các điểm trong cảnh</summary><div>${spots.map(pt=>`<button data-act="field-go" data-id="${pt.id}">${esc(pt.label)}</button>`).join('')}</div></details>`;
    if(message)html+=`<p class="field-message" role="status" aria-live="polite">${esc(message)}</p>`;
    if(tested&&!result.ok)html+=`<div class="field-issues" role="status">${result.issues.slice(0,3).map(t=>`<p>${esc(t)}</p>`).join('')}</div>`;
    html+=`<div class="field-toolbar"><button data-act="field-test">Thử cách đang đặt</button><button data-act="field-back">Lùi một bước</button><button data-act="field-reset">Đặt lại</button><button data-act="field-board">Mở bảng đối chiếu</button></div>${result.ok?`<button class="primary field-finish" data-act="field-handoff">${d.type==='arrangement'?'Giữ bố cục và trở về':'Về bàn giao phần việc'}</button>`:''}<p class="field-footnote">${d.type==='arrangement'?'Có thể để trống. Bố cục không chấm phản tư.':'Bản nháp được giữ. Chỉ bàn giao mới ghi hoàn tất.'}</p>`;
    return html;
  }
  root.WitnessFieldUI={render};if(typeof module!=='undefined')module.exports=root.WitnessFieldUI;
})(globalThis);
