const state = JSON.parse(localStorage.getItem('fraccionAutonomaState') || '{}');
const defaults = {
  route:'home',
  goal:'Resolver 3 retos de fracciones',
  completed:[1],
  attempts:0,
  helps:0,
  score:25,
  selectedAnswer:null,
  feedback:null,
  selfcheck:null,
  currentSequence:2
};
Object.assign(defaults,state);
let appState = defaults;

const view = document.getElementById('view');
const toast = document.getElementById('toast');
const navItems = [...document.querySelectorAll('.nav-item')];

function save(){ localStorage.setItem('fraccionAutonomaState', JSON.stringify(appState)); }
function showToast(msg){ toast.textContent=msg; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),1800); }
function setRoute(route){ appState.route=route; save(); navItems.forEach(b=>b.classList.toggle('active',b.dataset.route===route)); render(); window.scrollTo({top:0,behavior:'smooth'}); }

navItems.forEach(btn=>btn.addEventListener('click',()=>setRoute(btn.dataset.route)));
document.getElementById('menuBtn').addEventListener('click',()=>setRoute('mas'));
document.getElementById('profileBtn').addEventListener('click',()=>showToast('Perfil del estudiante'));

function home(){
  const pct = Math.min(100, Math.round((appState.completed.length/4)*100));
  return `
    <section class="hero">
      <div class="hero-row">
        <div class="student-blob">🧑‍🎓</div>
        <div><h1>¡Bienvenido!</h1><p>Hoy es un gran día para aprender con fracciones.</p></div>
      </div>
      <div class="goal-card" onclick="setRoute('metas')">
        <div class="goal-icon">🎯</div>
        <div><strong>Mi meta de hoy</strong><small>${escapeHtml(appState.goal)}</small></div>
        <span class="badge">Editar</span>
      </div>
      <div class="progress-card" onclick="setRoute('progreso')">
        <div class="progress-ring" style="--p:${pct}"><strong>${pct}%</strong></div>
        <div><strong>Mi progreso</strong><small>${appState.completed.length} de 4 secuencias completadas</small></div>
      </div>
    </section>

    <div class="section-title"><h2>Ruta de aprendizaje</h2><button onclick="setRoute('retos')">Ver todos</button></div>
    <div class="grid">
      <button class="tile orange" onclick="openSequence(1)"><span class="tile-icon">◔</span><strong>Reto 1</strong><small>Reconozco, planifico y represento</small></button>
      <button class="tile blue" onclick="openSequence(2)"><span class="tile-icon">◫</span><strong>Practicar</strong><small>Comparo y elijo mi estrategia</small></button>
      <button class="tile green" onclick="setRoute('progreso')"><span class="tile-icon">▥</span><strong>Mi progreso</strong><small>Revisa tus avances y próximos pasos</small></button>
      <button class="tile purple" onclick="setRoute('ayudas')"><span class="tile-icon">☼</span><strong>Ayudas</strong><small>Pistas y explicaciones cuando las necesites</small></button>
      <button class="tile orange" onclick="setRoute('autoevaluacion')"><span class="tile-icon">☑</span><strong>Autoevaluación</strong><small>¿Qué aprendí hoy?</small></button>
      <button class="tile blue" onclick="setRoute('logros')"><span class="tile-icon">★</span><strong>Mis logros</strong><small>Reconoce tu avance en la ruta</small></button>
    </div>
  `;
}

function retos(){
  const items=[
    [1,'Reconozco, planifico y represento','Significado de fracción y representación parte-todo'],
    [2,'Comparo y elijo mi estrategia','Comparación y equivalencia de fracciones'],
    [3,'Resuelvo y verifico','Problemas con fracciones y comprobación'],
    [4,'Reto Fracción Autónoma','Integración de aprendizajes y autorreflexión']
  ];
  return `<div class="challenge-head"><h2>Mis retos</h2><span class="pill">4 secuencias</span></div><div class="route-list">${items.map(([n,t,d])=>`<button class="route-card ${appState.completed.includes(n)?'done':''} ${appState.currentSequence===n?'current':''}" onclick="openSequence(${n})"><div class="route-num">${appState.completed.includes(n)?'✓':n}</div><div><strong>${t}</strong><small>${d}</small></div><span class="arrow">›</span></button>`).join('')}</div>`;
}

function metas(){
  return `<div class="challenge-head"><h2>Mi meta</h2><span class="pill">Autorregulación</span></div>
    <div class="meta-card"><label>¿Qué quiero lograr hoy?</label><input id="goalInput" value="${escapeHtml(appState.goal)}" maxlength="80" /></div>
    <button class="btn orange" style="width:100%" onclick="saveGoal()">Guardar meta</button>`;
}

function saveGoal(){ const el=document.getElementById('goalInput'); appState.goal=el.value.trim()||'Resolver 3 retos de fracciones'; save(); showToast('Meta guardada'); setTimeout(()=>setRoute('home'),500); }

function practica(){ openSequence(2,true); return ''; }

function sequenceView(n){
  if(n===1) return sequence1();
  if(n===2) return sequence2();
  if(n===3) return sequence3();
  return sequence4();
}

function sequence1(){
  return `<div class="challenge-head"><h2>Reto 1</h2><span class="pill">1 de 4</span></div>
  <div class="problem-card">
    <span class="label">Reconozco y represento</span>
    <p>Una pizza se divide en 4 partes iguales. Ana comió 3 partes. ¿Qué fracción representa la parte que comió?</p>
    <div class="frac-box"><div class="frac">3/4</div><div class="bar four"><span class="fill"></span><span class="fill"></span><span class="fill"></span><span></span></div></div>
    <div class="answers">
      ${answerBtn('1/4','a')}${answerBtn('3/4','b')}${answerBtn('4/3','c')}
    </div>
    <div class="action-row"><button class="btn hint" onclick="hint('Piensa cuántas partes se comieron y cuántas partes tiene el total.')">💡 Pista</button><button class="btn explain" onclick="hint('El numerador muestra las partes tomadas; el denominador, las partes iguales del total.')">📘 Explicación</button><button class="btn primary" onclick="checkSimple('b',1)">Comprobar</button></div>
    ${feedbackHtml()}
  </div>`;
}

function sequence2(){
  return `<div class="challenge-head"><h2>Comparo y elijo</h2><span class="pill">2 de 4</span></div>
  <div class="problem-card">
    <span class="label">Problema</span>
    <p>Ana recorrió <strong>3/4</strong> de un camino y Luis <strong>2/3</strong>. ¿Quién recorrió más?</p>
    <div class="fraction-compare">
      <div class="frac-box"><div><strong>Ana</strong></div><div class="frac">3/4</div><div class="bar four"><span class="fill"></span><span class="fill"></span><span class="fill"></span><span></span></div></div>
      <div class="compare-symbol">?</div>
      <div class="frac-box"><div><strong>Luis</strong></div><div class="frac">2/3</div><div class="bar three blue"><span class="fill"></span><span class="fill"></span><span></span></div></div>
    </div>
    <div class="answers">
      ${answerBtn('Ana recorrió más','ana')}${answerBtn('Luis recorrió más','luis')}${answerBtn('Ambos recorrieron lo mismo','igual')}
    </div>
    <div class="action-row"><button class="btn hint" onclick="hint('Busca un denominador común: 3/4 = 9/12 y 2/3 = 8/12.')">💡 Pista</button><button class="btn explain" onclick="hint('También puedes comparar las barras: 3/4 representa una parte mayor que 2/3.')">📘 Ver explicación</button><button class="btn retry" onclick="resetChallenge()">↻ Intentar de nuevo</button></div>
    <button class="btn orange" style="width:100%;margin-top:10px" onclick="checkSimple('ana',2)">Comprobar respuesta</button>
    ${feedbackHtml()}
  </div>`;
}

function sequence3(){
  return `<div class="challenge-head"><h2>Resuelvo y verifico</h2><span class="pill">3 de 4</span></div>
  <div class="problem-card">
    <span class="label">Problema contextualizado</span>
    <p>En una receta se usaron <strong>1/2</strong> taza de leche en la mañana y <strong>1/4</strong> en la tarde. ¿Cuánto se utilizó en total?</p>
    <div class="answers">
      ${answerBtn('2/6','26')}${answerBtn('3/4','34')}${answerBtn('1/6','16')}
    </div>
    <div class="action-row"><button class="btn hint" onclick="hint('Convierte 1/2 a cuartos: 1/2 = 2/4.')">💡 Pista</button><button class="btn explain" onclick="hint('2/4 + 1/4 = 3/4. Comprueba que la respuesta sea menor que 1 taza.')">📘 Explicación</button><button class="btn retry" onclick="resetChallenge()">↻ Nuevo intento</button></div>
    <button class="btn green" style="width:100%;margin-top:10px" onclick="checkSimple('34',3)">Verificar</button>
    ${feedbackHtml()}
  </div>`;
}

function sequence4(){
  return `<div class="challenge-head"><h2>Reto Fracción Autónoma</h2><span class="pill">4 de 4</span></div>
  <div class="problem-card">
    <span class="label">Reto final</span>
    <p>Camila completó <strong>5/8</strong> de una lectura. Después avanzó <strong>1/4</strong> más. ¿Qué parte del libro ha completado?</p>
    <div class="answers">
      ${answerBtn('6/12','612')}${answerBtn('7/8','78')}${answerBtn('3/4','34f')}
    </div>
    <div class="action-row"><button class="btn hint" onclick="hint('Convierte 1/4 a octavos: 1/4 = 2/8.')">💡 Pista</button><button class="btn explain" onclick="hint('5/8 + 2/8 = 7/8. Después revisa si tu resultado tiene sentido.')">📘 Explicación</button><button class="btn retry" onclick="resetChallenge()">↻ Revisar</button></div>
    <button class="btn orange" style="width:100%;margin-top:10px" onclick="checkSimple('78',4)">Finalizar reto</button>
    ${feedbackHtml()}
  </div>`;
}

function answerBtn(text,val){ return `<button class="answer ${appState.selectedAnswer===val?'selected':''}" onclick="selectAnswer('${val}')"><span>○</span>${text}</button>`; }
function selectAnswer(v){ appState.selectedAnswer=v; appState.feedback=null; save(); render(); }
function resetChallenge(){ appState.selectedAnswer=null; appState.feedback=null; save(); render(); }
function hint(msg){ appState.helps++; save(); showToast('Ayuda consultada'); const old=document.querySelector('.help-box'); if(old) old.remove(); const card=document.querySelector('.problem-card'); card.insertAdjacentHTML('beforeend',`<div class="help-box">💡 ${msg}</div>`); }
function checkSimple(correct,seq){
  appState.attempts++;
  if(!appState.selectedAnswer){ showToast('Selecciona una respuesta'); return; }
  if(appState.selectedAnswer===correct){
    appState.feedback={type:'success',title:'¡Muy bien!',text:'La respuesta es correcta. Ahora revisa qué estrategia utilizaste y qué te ayudó a decidir.'};
    if(!appState.completed.includes(seq)) appState.completed.push(seq);
    appState.score=Math.min(100,appState.score+20);
    appState.currentSequence=Math.min(4,seq+1);
  }else{
    appState.feedback={type:'error',title:'Revisa tu estrategia',text:'La respuesta todavía no coincide. Observa las representaciones, consulta una pista si la necesitas y vuelve a intentarlo.'};
  }
  save(); render();
}
function feedbackHtml(){ if(!appState.feedback) return ''; const f=appState.feedback; return `<div class="feedback ${f.type}"><h3>${f.type==='success'?'✓':'↺'} ${f.title}</h3><p>${f.text}</p></div>`; }
function openSequence(n,fromPractice=false){ appState.currentSequence=n; appState.selectedAnswer=null; appState.feedback=null; appState.route='seq'+n; save(); navItems.forEach(b=>b.classList.toggle('active',fromPractice?b.dataset.route==='practica':b.dataset.route==='retos')); render(); window.scrollTo({top:0}); }

function progreso(){
  const pct=Math.round((appState.completed.length/4)*100);
  return `<div class="challenge-head"><h2>Mi progreso</h2><span class="pill">Seguimiento</span></div>
  <div class="progress-big"><div class="progress-ring" style="--p:${pct}"><strong>${pct}%</strong></div><strong>Avance general</strong><small style="display:block;color:var(--muted);margin-top:4px">Vas por buen camino</small></div>
  <div class="stats"><div class="stat"><strong>${appState.completed.length}</strong><small>Retos completados</small></div><div class="stat"><strong>${appState.helps}</strong><small>Ayudas usadas</small></div><div class="stat"><strong>${appState.attempts}</strong><small>Intentos</small></div></div>
  <div class="section-title"><h2>Detalle de la ruta</h2></div>
  <div class="progress-list">${[1,2,3,4].map(n=>`<div class="progress-item"><div><strong>Secuencia ${n}</strong><small>${['Representación','Comparación','Verificación','Reto final'][n-1]}</small></div><span>${appState.completed.includes(n)?'✅':'⏳'}</span></div>`).join('')}</div>`;
}

function ayudas(){
  return `<div class="challenge-head"><h2>Ayudas</h2><span class="pill">Apoyo gradual</span></div>
  <div class="teacher-card"><h3>💡 Pistas</h3><p>Orientan sin mostrar directamente la respuesta. Úsalas cuando una estrategia no te permita continuar.</p></div>
  <div class="teacher-card"><h3>🧩 Representaciones</h3><p>Barras y círculos ayudan a leer, comparar y verificar fracciones.</p></div>
  <div class="teacher-card"><h3>📘 Explicaciones</h3><p>Revisan el procedimiento paso a paso para que puedas intentar otra vez.</p></div>
  <div class="teacher-card"><h3>👩‍🏫 Mediación docente</h3><p>Si una ayuda digital no es suficiente, el docente acompaña y formula preguntas para orientar el proceso.</p></div>`;
}

function autoevaluacion(){
  return `<div class="challenge-head"><h2>¿Qué aprendí hoy?</h2><span class="pill">Metacognición</span></div>
  <div class="selfcheck">
    <div class="meta-card"><label>¿Cómo te sentiste con la actividad?</label><div class="mood-grid">${mood('😊','Lo comprendí','bien')}${mood('😐','Necesito practicar','practicar')}${mood('🆘','Solicitar ayuda','ayuda')}</div></div>
    <div class="meta-card"><label>¿Qué estrategia te funcionó?</label><input id="strategyInput" placeholder="Ej.: usar una barra de fracciones" /></div>
    <button class="btn green" style="width:100%" onclick="saveSelfcheck()">Guardar autoevaluación</button>
  </div>`;
}
function mood(emoji,label,val){ return `<button class="mood ${appState.selfcheck===val?'active':''}" onclick="appState.selfcheck='${val}';save();render()"><span>${emoji}</span>${label}</button>`; }
function saveSelfcheck(){ const s=document.getElementById('strategyInput')?.value||''; localStorage.setItem('fraccionAutoStrategy',s); showToast('Autoevaluación guardada'); setTimeout(()=>setRoute('home'),500); }

function logros(){
  return `<div class="challenge-head"><h2>Mis logros</h2><span class="pill">Progreso</span></div>
    <div class="grid"><div class="tile orange"><span class="tile-icon">🏅</span><strong>Primera meta</strong><small>Definiste una meta antes de comenzar.</small></div><div class="tile blue"><span class="tile-icon">🧠</span><strong>Estratega</strong><small>Probaste más de una forma de resolver.</small></div><div class="tile green"><span class="tile-icon">🔎</span><strong>Verificador</strong><small>Revisaste una respuesta antes de continuar.</small></div><div class="tile purple"><span class="tile-icon">🌱</span><strong>Autónomo</strong><small>Reconociste qué necesitas reforzar.</small></div></div>`;
}

function mas(){
  return `<div class="challenge-head"><h2>Más opciones</h2><span class="pill">Fracción Autónoma 4.0</span></div>
    <button class="tile blue" style="width:100%;margin-bottom:10px" onclick="setRoute('metas')"><span class="tile-icon">🎯</span><strong>Editar mi meta</strong><small>Define qué quieres lograr en la sesión.</small></button>
    <button class="tile green" style="width:100%;margin-bottom:10px" onclick="setRoute('autoevaluacion')"><span class="tile-icon">☑</span><strong>Autoevaluación</strong><small>Registra qué comprendiste y qué debes practicar.</small></button>
    <button class="tile purple" style="width:100%;margin-bottom:10px" onclick="setRoute('docente')"><span class="tile-icon">👩‍🏫</span><strong>Vista docente</strong><small>Resumen básico de avances e intentos.</small></button>
    <button class="btn ghost" style="width:100%" onclick="resetAll()">Restablecer progreso de demostración</button>`;
}

function docente(){
  return `<div class="challenge-head"><h2>Vista docente</h2><span class="pill">Analítica básica</span></div>
  <div class="teacher-card"><h3>Grupo: 5°</h3><p>Vista de demostración. En la versión institucional, aquí se consolidan señales de avance para orientar el acompañamiento.</p></div>
  <div class="stats"><div class="stat"><strong>${appState.completed.length}/4</strong><small>Secuencias</small></div><div class="stat"><strong>${appState.attempts}</strong><small>Intentos</small></div><div class="stat"><strong>${appState.helps}</strong><small>Ayudas</small></div></div>
  <div class="section-title"><h2>Señales para acompañar</h2></div>
  <div class="teacher-card"><h3>📌 Planificación</h3><p>Meta actual: ${escapeHtml(appState.goal)}</p></div>
  <div class="teacher-card"><h3>🔁 Seguimiento</h3><p>${appState.attempts>3?'Se observan varios intentos; conviene revisar la estrategia utilizada.':'El número de intentos se mantiene dentro de lo esperado para la demostración.'}</p></div>
  <div class="teacher-card"><h3>💡 Uso de ayudas</h3><p>${appState.helps} ayudas consultadas. La interpretación pedagógica corresponde al docente.</p></div>`;
}

function resetAll(){ localStorage.clear(); location.reload(); }
function escapeHtml(s=''){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function render(){
  const r=appState.route;
  if(r==='home') view.innerHTML=home();
  else if(r==='retos') view.innerHTML=retos();
  else if(r==='practica') { openSequence(2,true); return; }
  else if(r==='progreso') view.innerHTML=progreso();
  else if(r==='metas') view.innerHTML=metas();
  else if(r==='ayudas') view.innerHTML=ayudas();
  else if(r==='autoevaluacion') view.innerHTML=autoevaluacion();
  else if(r==='logros') view.innerHTML=logros();
  else if(r==='mas') view.innerHTML=mas();
  else if(r==='docente') view.innerHTML=docente();
  else if(r.startsWith('seq')) view.innerHTML=sequenceView(Number(r.replace('seq','')));
  navItems.forEach(b=>b.classList.toggle('active',b.dataset.route===r || (r.startsWith('seq')&&b.dataset.route==='retos')));
}

if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{});}
render();
