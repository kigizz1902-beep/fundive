const stages = [
  { depth:'3m', title:'EP.01 — 오키나와 프리다이빙, 왜 가야 할까',
    desc:'산소통 없이 숨 하나로 들어가는 오키나와 바다. 투명한 시야와 따뜻한 수온을 만나는 시리즈의 시작.',
    creatures:['🌊','☀️'], y:330 },
  { depth:'8m', title:'EP.02 — 만날 수 있는 해양생물 총정리',
    desc:'흰동가리, 바다거북, 운 좋으면 만타가오리까지. 가장 화려한 비주얼의 회차.',
    creatures:['🐠','🐢','🦈'], y:570 },
  { depth:'15m', title:'EP.03 — 다이빙 포인트 추천',
    desc:'케라마 제도를 비롯한 대표 포인트를 난이도·시야별로 비교하는 실용 가이드.',
    creatures:['🏝️','🤿'], y:810 },
  { depth:'22m', title:'EP.04 — 언제 가야 가장 좋을까',
    desc:'6~9월 황금기와 비수기를 수온·시야·혼잡도로 비교 분석.',
    creatures:['📅','🌡️'], y:1050 },
  { depth:'30m', title:'EP.05 — 준비물 & 코스 추천',
    desc:'장비 체크리스트부터 예약 방법, 코스 추천까지. 떠날 준비를 끝내는 마지막 회차.',
    creatures:['🎒','🧭'], y:1290 }
];

let cleared = JSON.parse(sessionStorage.getItem('dq_cleared') || '[false,false,false,false,false]');

// activeIndex: 처음으로 클리어하지 않은 스테이지 (다이버가 향해 있는 곳)
function getActiveIndex(){
  const idx = cleared.findIndex(c => !c);
  return idx === -1 ? stages.length - 1 : idx;
}
let activeIndex = getActiveIndex();
let viewIndex = activeIndex; // 현재 보고 있는(모달에 띄울) 스테이지

const world = document.getElementById('world');
const player = document.getElementById('player');

function playerSvg(){
  return `<svg viewBox="0 0 16 16">
    <rect x="5" y="1" width="6" height="5" fill="#FF5D5D"/>
    <rect x="4" y="6" width="8" height="6" fill="#0D6B7A"/>
    <rect x="2" y="7" width="2" height="3" fill="#0D6B7A"/>
    <rect x="12" y="7" width="2" height="3" fill="#0D6B7A"/>
    <rect x="4" y="12" width="3" height="3" fill="#F4D58D"/>
    <rect x="9" y="12" width="3" height="3" fill="#F4D58D"/>
    <rect x="6" y="2" width="4" height="2" fill="#FFF8E7"/>
  </svg>`;
}
player.innerHTML = playerSvg();

function buildNodes(){
  stages.forEach((s, i)=>{
    const node = document.createElement('div');
    node.className = 'node' + (cleared[i] ? ' cleared' : '') + (i===activeIndex ? ' active' : '');
    node.style.top = s.y + 'px';
    node.innerHTML = `<span class="num pixel">${i+1}</span>` + (cleared[i] ? '<span class="star">⭐</span>' : '');
    node.dataset.index = i;
    node.addEventListener('click', ()=>{ selectView(i); });
    world.appendChild(node);

    const label = document.createElement('div');
    label.className = 'label pixel';
    label.style.top = (s.y + 18) + 'px';
    label.textContent = s.depth + ' STAGE';
    world.appendChild(label);
  });
  drawPath();
  placePlayer(true);
}

function drawPath(){
  const line = document.getElementById('pathLine');
  const worldWidth = world.clientWidth;
  const cx = worldWidth/2;
  const buoyBottom = 120 + 46 + 46 + 10; // 부표 하단 대략 위치
  let pts = `${cx},${buoyBottom}`;
  stages.forEach(s=>{ pts += ` ${cx},${s.y+39}`; });
  line.setAttribute('points', pts);
}

function placePlayer(immediate){
  const s = stages[activeIndex];
  const worldWidth = world.clientWidth;
  const cx = worldWidth/2;
  const sideOffset = -Math.min(70, worldWidth/2 - 40); // 스테이지 버튼 왼쪽에서 헤엄
  const px = cx + sideOffset;
  if(immediate){ player.style.transition = 'none'; }
  player.style.left = px + 'px';
  player.style.top = (s.y + 18) + 'px';
  if(immediate){
    requestAnimationFrame(()=>{ player.style.transition = ''; });
  }
  placeControls(s, immediate);
}

function placeControls(s, immediate){
  const controls = document.getElementById('controls');
  const worldWidth = world.clientWidth;
  const cx = worldWidth/2;
  const navOffset = Math.min(170, worldWidth/2 - 50); // 스테이지 버튼 오른쪽 옆
  if(immediate){ controls.style.transition = 'none'; }
  controls.style.left = (cx + navOffset) + 'px';
  controls.style.top = (s.y - 14) + 'px';
  if(immediate){
    requestAnimationFrame(()=>{ controls.style.transition = ''; });
  }
}

function selectView(i){
  if(i > activeIndex){
    showToast('이전 스테이지부터 클리어하세요!');
    return;
  }
  viewIndex = i;
  openModal();
}

function openModal(){
  const s = stages[viewIndex];
  document.getElementById('modalTag').textContent = s.depth + ' STAGE';
  document.getElementById('modalTitle').textContent = s.title;
  document.getElementById('modalDesc').textContent = s.desc;
  document.getElementById('modalCreatures').innerHTML = s.creatures.map(c=>`<span>${c}</span>`).join('');
  const clearBtn = document.getElementById('clearBtn');
  if(cleared[viewIndex]){
    clearBtn.textContent = '클리어 완료!';
    clearBtn.disabled = true;
  } else if(viewIndex === activeIndex){
    clearBtn.textContent = '스테이지 클리어!';
    clearBtn.disabled = false;
  } else {
    clearBtn.textContent = '잠겨 있음';
    clearBtn.disabled = true;
  }
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal(){
  document.getElementById('modalOverlay').classList.remove('open');
}

function clearStage(){
  if(viewIndex !== activeIndex || cleared[viewIndex]) return;
  cleared[activeIndex] = true;
  sessionStorage.setItem('dq_cleared', JSON.stringify(cleared));
  rebuildNodeVisual(activeIndex);
  bumpCoin();
  activeIndex = getActiveIndex();
  viewIndex = activeIndex;
  updateActiveHighlight();
  placePlayer(false); // 다이버와 내비게이션이 다음 깊이로 같이 내려감
  showToast('★ STAGE CLEAR! ★');
  closeModal();
}

function rebuildNodeVisual(i){
  const node = document.querySelectorAll('.node')[i];
  node.classList.add('cleared');
  node.innerHTML = `<span class="num pixel">${i+1}</span><span class="star">⭐</span>`;
}

function updateActiveHighlight(){
  document.querySelectorAll('.node').forEach((node, i)=>{
    node.classList.toggle('active', i===activeIndex);
  });
}

function bumpCoin(){
  document.getElementById('coinNum').textContent = cleared.filter(Boolean).length;
  const icon = document.getElementById('coinIcon');
  icon.classList.remove('pop');
  requestAnimationFrame(()=>{ icon.classList.add('pop'); });
}

let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 1600);
}

document.getElementById('upBtn').addEventListener('click', ()=> selectView(Math.max(0, viewIndex-1)));
document.getElementById('downBtn').addEventListener('click', ()=> selectView(Math.min(stages.length-1, viewIndex+1)));
document.getElementById('enterBtn').addEventListener('click', ()=>{ viewIndex = activeIndex; openModal(); });
document.getElementById('closeX').addEventListener('click', closeModal);
document.getElementById('clearBtn').addEventListener('click', clearStage);
document.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowUp') selectView(Math.max(0, viewIndex-1));
  if(e.key === 'ArrowDown') selectView(Math.min(stages.length-1, viewIndex+1));
  if(e.key === 'Enter'){ viewIndex = activeIndex; openModal(); }
  if(e.key === 'Escape') closeModal();
});

document.getElementById('resetBtn').addEventListener('click', ()=>{
  cleared = [false,false,false,false,false];
  sessionStorage.setItem('dq_cleared', JSON.stringify(cleared));
  activeIndex = 0;
  viewIndex = 0;
  document.querySelectorAll('.node').forEach((node, i)=>{
    node.classList.remove('cleared');
    node.classList.toggle('active', i===activeIndex);
    node.innerHTML = `<span class="num pixel">${i+1}</span>`;
  });
  document.getElementById('coinNum').textContent = '0';
  placePlayer(true);
  showToast('RESET! 처음부터 다시 시작해요');
});

buildNodes();
document.getElementById('coinNum').textContent = cleared.filter(Boolean).length;

let resizeTimer;
window.addEventListener('resize', ()=>{
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(()=>{ drawPath(); placePlayer(true); }, 100);
});
