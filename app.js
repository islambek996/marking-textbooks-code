import { slides, META } from './content.js';

const app = document.querySelector('#app');
let active = 0;
let debug = false;

function px(v){ return `${v}px`; }
function setBox(el, item){
  el.style.left = `${item.x / META.width * 100}%`;
  el.style.top = `${item.y / META.height * 100}%`;
  if (item.w != null) el.style.width = `${item.w / META.width * 100}%`;
  if (item.h != null) el.style.height = `${item.h / META.height * 100}%`;
  if (item.opacity != null) el.style.opacity = item.opacity;
  if (item.rotate != null) el.style.transform = `rotate(${item.rotate}deg)`;
  if (item.radius != null) el.style.borderRadius = px(item.radius);
  if (item.z != null) el.style.zIndex = item.z;
  if (item.blend) el.style.mixBlendMode = item.blend;
}

function makeText(item){
  const el=document.createElement('div');
  el.className='layer text' + (item.center ? ' center':'') + (item.uppercase ? ' uppercase':'');
  el.textContent=item.text;
  setBox(el,item);
  el.style.fontSize = `calc(var(--scale) * ${item.size ?? 18}px)`;
  el.style.fontWeight = item.weight ?? 500;
  el.style.color = item.color ?? '#fff';
  el.style.lineHeight = item.lineHeight ?? 1.12;
  if(item.letter != null) el.style.letterSpacing=`calc(var(--scale) * ${item.letter}px)`;
  if(item.shadow) el.style.textShadow='0 0 16px rgba(0,0,0,.75)';
  if(item.transform) el.style.transform = item.transform;
  return el;
}

function makeBox(item){
  const el=document.createElement('div');
  el.className='layer ' + (item.className||'');
  setBox(el,item);
  if(item.accent){el.style.borderColor=item.accent;el.style.boxShadow=`inset 0 0 24px ${item.accent}22,0 0 22px ${item.accent}18`;}
  return el;
}

const cropPresets = [
  [/^s4_step/, { zoom: 1.55, pos: '50% 68%' }],
  [/^s6_t/, { zoom: 1.45, pos: '50% 60%' }],
  [/^s5_s[1-5]/, { zoom: 1.42, pos: '50% 47%' }],
  [/^s5_s[6-9]/, { zoom: 1.28, pos: '50% 50%' }],
  [/^s3_operator/, { zoom: 1.28, pos: '50% 72%' }],
  [/^s3_edu/, { zoom: 1.08, pos: '50% 58%' }],
  [/^s3_ministry/, { zoom: 1.08, pos: '50% 50%' }],
  [/^s4_bottom/, { zoom: 1.24, pos: '50% 62%' }],
  [/^s6_center/, { zoom: 1.22, pos: '50% 48%' }],
  [/^s7_cit/, { zoom: 1.35, pos: '50% 58%' }],
  [/^s7_core|^s7_edu|^s7_gov/, { zoom: 1.28, pos: '50% 52%' }],
  [/^s7_phone/, { zoom: 1.22, pos: '50% 52%' }],
  [/^s7_contacts/, { zoom: 1.08, pos: '50% 50%' }],
  [/^s8_cit/, { zoom: 1.20, pos: '50% 50%' }],
  [/^s8_city/, { zoom: 1.03, pos: '50% 50%' }],
  [/^s8_core/, { zoom: 1.22, pos: '50% 52%' }],
  [/^s8_edu/, { zoom: 1.20, pos: '50% 50%' }],
  [/^s8_gov/, { zoom: 1.22, pos: '50% 68%' }],
  [/^s8_phone/, { zoom: 1.28, pos: '72% 50%' }],
  [/^s8_contacts/, { zoom: 1.08, pos: '50% 50%' }],
  [/^s2_paper/, { zoom: 1.08, pos: '76% 50%' }],
];

function resolveCropPreset(src=''){
  const name=src.split('/').pop().replace(/\.webp$/i,'');
  return cropPresets.find(([re])=>re.test(name))?.[1] || {};
}

function makeImage(item){
  const el=document.createElement('div');
  el.className='layer image ' + (item.radius ? 'round':'');
  setBox(el,item);
  if(item.filter) el.style.filter=item.filter;
  const im=document.createElement('img');
  im.src=item.src;
  im.alt='';
  const preset=resolveCropPreset(item.src);
  im.style.objectPosition=item.objectPosition||preset.pos||'50% 50%';
  if(item.fit) im.style.objectFit=item.fit;
  if(item.cropZoom || preset.zoom){
    im.style.transformOrigin='center center';
    im.style.transform=`scale(${item.cropZoom ?? preset.zoom})`;
  }
  el.appendChild(im);
  return el;
}

function makeIcon(item){
  const el=document.createElement('div');
  el.className='layer ' + (item.boxed?'icon-box':'');
  setBox(el,{...item,w:item.s,h:item.s});
  el.style.fontSize=`calc(var(--scale) * ${item.s*0.53}px)`;
  el.style.color=item.color||'#76c7ff';
  el.style.fontWeight='900';
  el.style.textShadow=item.glow?'0 0 14px currentColor':'';
  el.textContent=item.symbol;
  if(item.simple) el.style.textAlign='center';
  return el;
}

function makeBadge(item){
  const el=document.createElement('div');
  el.className='layer badge';
  setBox(el,{...item,w:item.w||54,h:item.h||54});
  el.style.fontSize=`calc(var(--scale) * ${(item.w||54)*0.52}px)`;
  if(item.accent){el.style.background=item.accent}
  el.textContent=item.n;
  return el;
}

function makeLine(item){
  const el=document.createElement('div');
  el.className='layer line';
  setBox(el,item);
  if(item.color){el.style.background=item.color}
  return el;
}

function renderSlide(index){
  const slide=slides[index];
  const viewport=document.createElement('div');
  viewport.className='viewport';
  const canvas=document.createElement('div');
  canvas.className='canvas';
  canvas.dataset.slide=slide.number;
  canvas.style.background=slide.background;
  const layers=document.createDocumentFragment();
  for(const item of slide.elements){
    let el;
    if(item.type==='text') el=makeText(item);
    else if(item.type==='image') el=makeImage(item);
    else if(item.type==='box') el=makeBox(item);
    else if(item.type==='icon') el=makeIcon(item);
    else if(item.type==='badge') el=makeBadge(item);
    else if(item.type==='line') el=makeLine(item);
    else continue;
    el.dataset.kind=item.type;
    layers.appendChild(el);
  }
  canvas.appendChild(layers);
  viewport.appendChild(canvas);
  app.replaceChildren(viewport);
  updateScale(canvas);
}

function updateScale(canvas=document.querySelector('.canvas')){
  if(!canvas) return;
  const width=canvas.getBoundingClientRect().width;
  canvas.style.setProperty('--scale', width/META.width);
}

function renderUi(){
  const top=document.createElement('div');
  top.className='top-info';
  top.textContent=`${slides[active].number} / ${String(slides.length).padStart(2,'0')}  •  ${slides[active].id}`;
  document.body.appendChild(top);

  const controls=document.createElement('div');
  controls.className='controls';
  const prev=document.createElement('button'); prev.textContent='←'; prev.title='Предыдущий слайд';
  const next=document.createElement('button'); next.textContent='→'; next.title='Следующий слайд';
  const dbg=document.createElement('button'); dbg.textContent='◌'; dbg.title='Режим слоёв';
  controls.append(prev,next,dbg); document.body.appendChild(controls);

  const pager=document.createElement('div'); pager.className='pager';
  slides.forEach((s,i)=>{ const b=document.createElement('button'); b.textContent=s.number; b.dataset.i=i; pager.appendChild(b); });
  document.body.appendChild(pager);
  return {top,prev,next,dbg,pager};
}

const ui=renderUi();
function goTo(i){ active=(i+slides.length)%slides.length; renderSlide(active); ui.top.textContent=`${slides[active].number} / ${String(slides.length).padStart(2,'0')}  •  ${slides[active].id}`; [...ui.pager.children].forEach((b,j)=>b.classList.toggle('active',j===active)); }
ui.prev.addEventListener('click',()=>goTo(active-1));
ui.next.addEventListener('click',()=>goTo(active+1));
ui.dbg.addEventListener('click',()=>{debug=!debug;document.body.classList.toggle('debug',debug);});
[...ui.pager.children].forEach(b=>b.addEventListener('click',()=>goTo(Number(b.dataset.i))));

window.addEventListener('resize',()=>updateScale());
document.addEventListener('keydown',(e)=>{
  if(e.key==='ArrowRight'||e.key==='PageDown') goTo(active+1);
  if(e.key==='ArrowLeft'||e.key==='PageUp') goTo(active-1);
  if(e.key==='Home') goTo(0);
  if(e.key==='End') goTo(slides.length-1);
  if(e.key.toLowerCase()==='d') {debug=!debug;document.body.classList.toggle('debug',debug);}
});

goTo(0);
