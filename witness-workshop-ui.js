(function(root){
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button=(label,act,attrs='',extra='')=>`<button class="choice ${extra}" data-act="${act}" ${attrs}>${label}</button>`;
  const select=(id,label,value,choices,attrs='')=>`<label class="field" for="${id}">${esc(label)}<select id="${id}" data-depth-input ${attrs}><option value="">Chưa đặt</option>${choices.map(x=>`<option value="${esc(x.id)}" ${value===x.id?'selected':''}>${esc(x.label)}</option>`).join('')}</select></label>`;
  function render(d,p,feedback=null){
    let html=`<div class="workshop" data-workshop="${d.id}"><p class="workshop-brief">${esc(d.brief)}</p>${d.voice?`<div class="notice"><strong>${esc(d.voice[0])}</strong><p>“${esc(d.voice[1])}”</p></div>`:''}${d.context?`<div class="notice">${esc(d.context)}</div>`:''}`;
    if(d.observations)html+=`<div class="workshop-observations">${d.observations.map(([title,text])=>`<div class="paper"><strong>${esc(title)}</strong><p>${esc(text)}</p></div>`).join('')}</div>`;
    html+=`<details class="workshop-rules" open><summary>Điều cần giữ trong tình huống này</summary><ul>${d.rules.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`;
    if(d.type==='sequence'){
      const order=p.order||[];
      html+=`<div class="workshop-columns"><section><h3>Thao tác có thể chọn</h3><div class="choices">${d.steps.filter(x=>!order.includes(x.id)).map(x=>button(`<strong>${esc(x.label)}</strong><small>${esc(x.detail)}</small>`,'depth-step',`data-value="${x.id}"`)).join('')||'<p>Đã đặt đủ thao tác. Có thể bỏ một bước để xếp lại.</p>'}</div></section><section><h3>Phương án của bạn</h3><ol class="workshop-order">${order.map(id=>{const x=d.steps.find(x=>x.id===id);return `<li><span>${esc(x.label)}</span><button data-act="depth-remove" data-value="${id}" aria-label="Bỏ ${esc(x.label)}">Bỏ</button></li>`;}).join('')}</ol><p class="credits">${order.length}/${d.steps.length} thao tác · chọn “Thử phương án” để kiểm quan hệ chuẩn bị.</p></section></div>`;
    }else if(['allocation','dispatch','arrangement'].includes(d.type)){
      const a=p.assignments||{};
      html+=`<div class="workshop-stations">${d.stations.map(st=>{const group=d.items.filter(x=>a[x.id]===st.id),weight=group.reduce((n,x)=>n+(x.weight??1),0);return `<section class="paper"><h3>${esc(st.label)}</h3><p>${esc(st.detail)}</p><strong>${group.length} người/vật${st.minLoad!=null?' · '+weight+' đơn vị':''}</strong><p>${group.map(x=>esc(x.label)).join(' · ')||'Chưa có ai/vật ở đây.'}</p></section>`;}).join('')}</div><div class="workshop-assignments">${d.items.map(x=>`<div class="workshop-row">${select('depth-'+x.id,x.label,a[x.id],d.stations,`data-kind="assignment" data-key="${x.id}"`)}<small>${esc(x.detail)}</small></div>`).join('')}</div>`;
    }else if(d.type==='route'){
      const path=p.path||[d.start],current=path[path.length-1],at=id=>d.nodes.find(n=>n.id===id),used=(from,to)=>path.some((id,i)=>id===to&&path[i-1]===from);
      html+=`<div class="workshop-route"><svg viewBox="0 0 660 290" role="img" aria-label="Sơ đồ tuyến có các điểm nối; danh sách thao tác ở ngay dưới"><g>${d.edges.map(e=>`<line x1="${at(e.from).x}" y1="${at(e.from).y}" x2="${at(e.to).x}" y2="${at(e.to).y}" class="${used(e.from,e.to)?'visited':''}"/>`).join('')}</g>${d.nodes.map(n=>`<g><circle cx="${n.x}" cy="${n.y}" r="${n.id===current?11:7}" class="${path.includes(n.id)?'visited':''}"/><text x="${n.x}" y="${n.y-18}" text-anchor="middle">${esc(n.label)}</text></g>`).join('')}</svg><p><strong>Tuyến đã đặt:</strong> ${path.map(id=>esc(at(id)?.label||id)).join(' → ')}</p><p><strong>Đang ở ${esc(at(current)?.label)}:</strong> ${esc(at(current)?.detail)}</p><div class="choices">${d.edges.filter(e=>e.from===current&&!path.includes(e.to)).map(e=>button(`<strong>Tới ${esc(at(e.to).label)}</strong><small>${esc(at(e.to).detail)}${d.noiseBudget!=null?' · Tiếng dội +'+e.noise+', lộ sáng +'+e.light:''}</small>`,'depth-route',`data-value="${e.to}"`)).join('')}</div><button class="text-link" data-act="depth-back" ${path.length<2?'disabled':''}>Lùi một mốc</button></div>`;
    }else if(d.type==='ledger'){
      html+=`<div class="workshop-ledger">${d.fields.map(f=>`<label class="field" for="depth-${f.id}">${esc(f.label)}<input id="depth-${f.id}" data-depth-input data-kind="number" data-key="${f.id}" type="number" inputmode="numeric" min="0" max="24" value="${esc(p.numbers?.[f.id]??'')}" placeholder="Điền lượng đã đối chiếu"></label>`).join('')}</div>`;
    }else if(d.type==='inference'){
      html+=`<div class="workshop-observations">${d.cards.map(c=>`<div class="paper"><strong>${esc(c.label)}</strong><p>${esc(c.detail)}</p></div>`).join('')}</div><div class="workshop-claims">${d.claims.map(c=>{const value=p.claims?.[c.id]||{};return `<fieldset><legend>${esc(c.label)}</legend>${select('depth-status-'+c.id,'Mức có thể kết luận',value.status,[{id:'supported',label:'Có nguồn hỗ trợ đúng phạm vi'},{id:'open',label:'Chưa đủ căn cứ để khẳng định'}],`data-kind="status" data-key="${c.id}"`)}<p class="credits">Ghép tối đa hai dấu hỗ trợ. Có thể để trống khi chưa đủ căn cứ.</p>${d.cards.map(x=>`<label class="check"><input type="checkbox" data-depth-input data-kind="card" data-key="${c.id}" value="${x.id}" ${(value.cards||[]).includes(x.id)?'checked':''}>${esc(x.label)}</label>`).join('')}</fieldset>`;}).join('')}</div>`;
    }
    html+=`<div id="depth-feedback" class="workshop-feedback ${feedback?.ok?'ok':''}" role="status" aria-live="polite">${feedback?`<strong>${feedback.ok?(d.type==='arrangement'?'Bố cục được giữ theo lựa chọn của bạn.':'Phương án đáp ứng các điều kiện.'):'Phương án còn chỗ cần kiểm.'}</strong>${(feedback.issues||[]).map(x=>`<p>${esc(x)}</p>`).join('')}${(feedback.notes||[]).map(x=>`<p>${esc(x)}</p>`).join('')}`:'Có thể thử, sửa và rời bàn; bản nháp được giữ khi bạn quay lại.'}</div><p class="credits">${esc(d.label)}${d.sourceRef?' · Mạch nguồn: '+esc(d.sourceRef):d.owner.startsWith('V')?' · Giấc mơ ẩn dụ':''}</p></div>`;
    return html;
  }
  function reduce(p,d,action,key,value,checked=false){
    p=JSON.parse(JSON.stringify(p));
    if(action==='depth-step'&&d.steps.some(x=>x.id===value)&&!p.order.includes(value))p.order.push(value);
    if(action==='depth-remove')p.order=p.order.filter(x=>x!==value);
    if(action==='depth-route'&&d.edges.some(e=>e.from===p.path[p.path.length-1]&&e.to===value)&&!p.path.includes(value))p.path.push(value);
    if(action==='depth-back'&&p.path.length>1)p.path.pop();
    if(action==='assignment'){p.assignments||={};if(value)p.assignments[key]=value;else delete p.assignments[key];}
    if(action==='number'){p.numbers||={};p.numbers[key]=value;}
    if(action==='status'){p.claims||={};p.claims[key]||={status:'',cards:[]};p.claims[key].status=value;}
    if(action==='card'){p.claims||={};p.claims[key]||={status:'',cards:[]};const cards=p.claims[key].cards;p.claims[key].cards=checked?[...new Set([...cards,value])].slice(-2):cards.filter(x=>x!==value);}
    return p;
  }
  const api={render,reduce};root.WitnessWorkshop=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
