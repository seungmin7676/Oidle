/* ============================================================
   main.js - App Entry Point & UI Controller
   Oidle : Process Scheduling Visualizer
   ============================================================
   [역할]
   - DOM 이벤트 바인딩
   - ProcessManager, Scheduler, Visualizer, Dashboard 연결
   - 프로세스 추가/삭제/초기화 UI 처리
   - 시뮬레이션 실행/정지/리셋 흐름 제어
   ============================================================ */

'use strict';

/* ============================================================
   알고리즘 레이블 맵
   ============================================================ */
const ALGO_LABELS = {
  fcfs:        'FCFS (First Come First Served)',
  sjf:         'SJF (Shortest Job First)',
  srtf:        'SRTF (Shortest Remaining Time First)',
  rr:          'Round Robin',
  priority_np: 'Priority (Non-Preemptive)',
  priority_p:  'Priority (Preemptive)',
};

/* ============================================================
   DOM 요소 참조
   ============================================================ */
const DOM = {
  inputName:       document.getElementById('input-name'),
  inputArrival:    document.getElementById('input-arrival'),
  inputBurst:      document.getElementById('input-burst'),
  inputPriority:   document.getElementById('input-priority'),
  btnAddProcess:   document.getElementById('btn-add-process'),
  btnClearAll:     document.getElementById('btn-clear-all'),

  processTbody:    document.getElementById('process-tbody'),
  processCount:    document.getElementById('process-count'),

  selectAlgorithm: document.getElementById('select-algorithm'),
  quantumGroup:    document.getElementById('quantum-group'),
  inputQuantum:    document.getElementById('input-quantum'),
  inputSpeed:      document.getElementById('input-speed'),
  speedLabel:      document.getElementById('speed-label'),
  btnRun:          document.getElementById('btn-run'),
  btnPause:        document.getElementById('btn-pause'),
  btnReset:        document.getElementById('btn-reset'),

  ganttPanel:      document.getElementById('gantt-panel'),
  ganttCanvas:     document.getElementById('gantt-canvas'),
  currentTime:     document.getElementById('current-time'),
};

/* ============================================================
   앱 상태
   ============================================================ */
let _isRunning = false;
let _isPaused  = false;

/* ============================================================
   프로세스 테이블 렌더링
   ============================================================ */
function renderProcessTable() {
  const procs = processManager.getAllProcesses();
  DOM.processCount.textContent = procs.length + '개';

  if (procs.length === 0) {
    DOM.processTbody.innerHTML =
      '<tr><td colspan="5" class="empty-row">프로세스를 추가하세요.</td></tr>';
    return;
  }

  DOM.processTbody.innerHTML = procs.map((p, i) => `
    <tr data-pid="${p.id}" class="process-row new-row">
      <td><span class="process-badge" style="--clr:${p.color}">${p.id}</span></td>
      <td>${p.arrivalTime}</td>
      <td>${p.burstTime}</td>
      <td>${p.priority}</td>
      <td><button class="btn btn--delete" data-id="${p.id}" aria-label="삭제">&#x2715;</button></td>
    </tr>
  `).join('');

  // 삭제 버튼 이벤트
  DOM.processTbody.querySelectorAll('.btn--delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.dataset.id;
      processManager.removeProcess(pid);
      renderProcessTable();
      // 간트/대시보드 초기화
      Visualizer.destroy();
      Dashboard.reset();
      Dashboard.rebuildProcessStates(processManager.getAllProcesses());
    });
  });
}

/* ============================================================
   입력 폼 초기화
   ============================================================ */
function clearInputForm() {
  DOM.inputName.value     = '';
  DOM.inputArrival.value  = '';
  DOM.inputBurst.value    = '';
  DOM.inputPriority.value = '';
  DOM.inputName.focus();
}

/* ============================================================
   입력 필드 shake 에러 효과
   ============================================================ */
function shakeElement(el) {
  el.classList.remove('animate-shake');
  void el.offsetWidth; // reflow
  el.classList.add('animate-shake');
  el.addEventListener('animationend', () => el.classList.remove('animate-shake'), { once: true });
}

/* ============================================================
   프로세스 추가 핸들러
   ============================================================ */
function handleAddProcess() {
  const name     = DOM.inputName.value.trim();
  const arrival  = DOM.inputArrival.value.trim();
  const burst    = DOM.inputBurst.value.trim();
  const priority = DOM.inputPriority.value.trim() || '1';

  if (!name)   { shakeElement(DOM.inputName);    return; }
  if (!arrival && arrival !== '0') {
    DOM.inputArrival.value = '0';
  }
  if (!burst || Number(burst) < 1) { shakeElement(DOM.inputBurst); return; }

  const result = processManager.addProcess({
    id:          name,
    arrivalTime: Number(arrival) || 0,
    burstTime:   Number(burst),
    priority:    Number(priority) || 1,
  });

  if (!result) {
    shakeElement(DOM.inputName);
    return;
  }

  clearInputForm();
  renderProcessTable();
  Dashboard.rebuildProcessStates(processManager.getAllProcesses());
}

/* ============================================================
   전체 초기화 핸들러
   ============================================================ */
function handleClearAll() {
  processManager.clearAll();
  renderProcessTable();
  Visualizer.destroy();
  Dashboard.reset();
  Dashboard.updateCurrentTime(0);
  Dashboard.updateCpuBadge('idle');
  Dashboard.updateCpuGauge(0);
  _isRunning = false;
  _isPaused  = false;
  updateControlButtons();
}

/* ============================================================
   알고리즘 선택 변경 → 퀀텀 입력 토글
   ============================================================ */
function handleAlgorithmChange() {
  const algo = DOM.selectAlgorithm.value;
  DOM.quantumGroup.style.display = (algo === 'rr') ? 'flex' : 'none';
}

/* ============================================================
   속도 슬라이더 → 라벨 업데이트
   ============================================================ */
function handleSpeedChange() {
  DOM.speedLabel.textContent = 'x' + DOM.inputSpeed.value;
}

/* ============================================================
   버튼 상태 관리
   ============================================================ */
function updateControlButtons() {
  DOM.btnRun.disabled   = _isRunning && !_isPaused;
  DOM.btnPause.disabled = !_isRunning || _isPaused;
}

/* ============================================================
   시뮬레이션 실행
   ============================================================ */
function handleRun() {
  const procs = processManager.getAllProcesses();
  if (procs.length === 0) {
    shakeElement(DOM.btnRun);
    return;
  }

  const algorithm = DOM.selectAlgorithm.value;
  const quantum   = Number(DOM.inputQuantum.value) || 2;

  // 스케줄러 실행 (순수 함수 - 클론된 데이터 사용)
  const cloned = processManager.getClonedProcesses();
  const result = runScheduler(algorithm, cloned, { timeQuantum: quantum });

  const { ganttChartData, metrics, processes: finishedProcs } = result;

  // 간트 차트 렌더링
  Dashboard.rebuildProcessStates(finishedProcs);
  Visualizer.render('gantt-canvas', ganttChartData, finishedProcs);

  // 간트 패널 running 클래스
  if (DOM.ganttPanel) DOM.ganttPanel.classList.add('running');

  // 대시보드 렌더링
  const algoLabel = ALGO_LABELS[algorithm] || algorithm;
  Dashboard.render(metrics, finishedProcs, algoLabel);
  Dashboard.updateCpuGauge(metrics.cpuUtilization);
  Dashboard.updateCurrentTime(metrics.totalTime);
  Dashboard.updateCpuBadge('idle');

  // 모든 프로세스 TERMINATED 로 표시
  finishedProcs.forEach(p => Dashboard.updateProcessState(p.id, 'terminated'));

  _isRunning = true;
  _isPaused  = false;
  updateControlButtons();

  console.log('[Main] Simulation complete.', algorithm, metrics);
}

/* ============================================================
   일시정지 (현재 단계에서는 토글 역할)
   ============================================================ */
function handlePause() {
  _isPaused = !_isPaused;
  updateControlButtons();
}

/* ============================================================
   리셋
   ============================================================ */
function handleReset() {
  processManager.resetAll();
  Visualizer.destroy();
  Dashboard.reset();
  Dashboard.rebuildProcessStates(processManager.getAllProcesses());
  Dashboard.updateCurrentTime(0);
  Dashboard.updateCpuBadge('idle');
  Dashboard.updateCpuGauge(0);
  if (DOM.ganttPanel) DOM.ganttPanel.classList.remove('running');
  _isRunning = false;
  _isPaused  = false;
  updateControlButtons();
}

/* ============================================================
   키보드 단축키 (Enter → 프로세스 추가)
   ============================================================ */
function handleKeydown(e) {
  if (e.key === 'Enter') {
    const active = document.activeElement;
    if ([DOM.inputName, DOM.inputArrival, DOM.inputBurst, DOM.inputPriority].includes(active)) {
      handleAddProcess();
    }
  }
}

/* ============================================================
   이벤트 바인딩
   ============================================================ */
function bindEvents() {
  DOM.btnAddProcess.addEventListener('click', handleAddProcess);
  DOM.btnClearAll.addEventListener('click', handleClearAll);
  DOM.selectAlgorithm.addEventListener('change', handleAlgorithmChange);
  DOM.inputSpeed.addEventListener('input', handleSpeedChange);
  DOM.btnRun.addEventListener('click', handleRun);
  DOM.btnPause.addEventListener('click', handlePause);
  DOM.btnReset.addEventListener('click', handleReset);
  document.addEventListener('keydown', handleKeydown);
}

/* ============================================================
   초기화
   ============================================================ */
function init() {
  handleAlgorithmChange();
  handleSpeedChange();
  renderProcessTable();
  Dashboard.rebuildProcessStates(processManager.getAllProcesses());
  updateControlButtons();

  console.log('%c Oidle - Process Scheduling Visualizer ',
    'background:linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4);color:#fff;font-weight:800;padding:4px 10px;border-radius:6px;');
  console.log('[Main] App initialized. Processes:', processManager.count);
}

/* ============================================================
   진입점
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  init();
});
