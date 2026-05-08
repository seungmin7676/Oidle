/* ============================================================
   main.js ? 진입점 & UI 초기화 (정적 뼈대 단계)
   Oidle : Process Scheduling Visualizer
   ============================================================
   현재 단계: 정적 UI 뼈대
   - DOM 요소 참조
   - 더미 데이터 상수
   - 기본 이벤트 바인딩 (알고리즘 선택 시 퀀텀 표시/숨김, 속도 라벨)
   - 이후 단계에서 process.js / scheduler.js / visualizer.js / dashboard.js 연결 예정
   ============================================================ */

'use strict';

/* ── 1. 프로세스 고유 색상 팔레트 ────────────────────────────── */
const PROCESS_COLORS = [
  '#7c3aed', // 보라
  '#2563eb', // 파랑
  '#0891b2', // 청록
  '#059669', // 에메랄드
  '#d97706', // 호박
  '#dc2626', // 빨강
  '#db2777', // 분홍
  '#7c3aed', // 보라 (순환)
];

/* ── 2. 더미 초기 프로세스 데이터 ───────────────────────────── */
const DUMMY_PROCESSES = [
  { id: 0, name: 'P1', arrival: 0, burst: 5, priority: 2 },
  { id: 1, name: 'P2', arrival: 1, burst: 3, priority: 1 },
  { id: 2, name: 'P3', arrival: 2, burst: 8, priority: 3 },
];

/* ── 3. DOM 요소 참조 (이후 JS 모듈에서 재사용) ─────────────── */
const DOM = {
  // 입력 폼
  inputName:      document.getElementById('input-name'),
  inputArrival:   document.getElementById('input-arrival'),
  inputBurst:     document.getElementById('input-burst'),
  inputPriority:  document.getElementById('input-priority'),
  btnAddProcess:  document.getElementById('btn-add-process'),
  btnClearAll:    document.getElementById('btn-clear-all'),

  // 프로세스 테이블
  processTbody:   document.getElementById('process-tbody'),
  processCount:   document.getElementById('process-count'),

  // 컨트롤
  selectAlgorithm: document.getElementById('select-algorithm'),
  quantumGroup:    document.getElementById('quantum-group'),
  inputQuantum:    document.getElementById('input-quantum'),
  inputSpeed:      document.getElementById('input-speed'),
  speedLabel:      document.getElementById('speed-label'),
  btnRun:          document.getElementById('btn-run'),
  btnPause:        document.getElementById('btn-pause'),
  btnReset:        document.getElementById('btn-reset'),

  // 간트 차트
  ganttPanel:      document.getElementById('gantt-panel'),
  ganttCanvas:     document.getElementById('gantt-canvas'),
  currentTime:     document.getElementById('current-time'),
  processStates:   document.getElementById('process-states'),
  cpuGaugeFill:    document.getElementById('cpu-gauge-fill'),
  cpuGaugeValue:   document.getElementById('cpu-gauge-value'),
  cpuStatusBadge:  document.getElementById('cpu-status-badge'),

  // 대시보드
  dashboardPanel:  document.getElementById('dashboard-panel'),
  dashboardStatus: document.getElementById('dashboard-status'),
  metricAvgWait:   document.getElementById('metric-avg-wait'),
  metricAvgTurn:   document.getElementById('metric-avg-turnaround'),
  metricAvgResp:   document.getElementById('metric-avg-response'),
  metricTotalTime: document.getElementById('metric-total-time'),
  metricCpuUtil:   document.getElementById('metric-cpu-util'),
  metricThroughput:document.getElementById('metric-throughput'),
  resultTbody:     document.getElementById('result-tbody'),
};

/* ── 4. 알고리즘 선택 → 퀀텀 입력 표시/숨김 ─────────────────── */
function handleAlgorithmChange() {
  const algo = DOM.selectAlgorithm.value;
  if (algo === 'rr') {
    DOM.quantumGroup.style.display = 'flex';
  } else {
    DOM.quantumGroup.style.display = 'none';
  }
}

/* ── 5. 속도 슬라이더 → 라벨 업데이트 ──────────────────────── */
function handleSpeedChange() {
  DOM.speedLabel.textContent = `x${DOM.inputSpeed.value}`;
}

/* ── 6. 프로세스 개수 업데이트 ──────────────────────────────── */
function updateProcessCount() {
  const rows = DOM.processTbody.querySelectorAll('tr.process-row');
  DOM.processCount.textContent = `${rows.length}개`;
}

/* ── 7. 버튼 플레이스홀더 핸들러 (이후 로직 연결 예정) ───────── */
function handleAddProcess() {
  // TODO: process.js 구현 후 연결
  console.log('[TODO] 프로세스 추가 기능 구현 예정');
}

function handleClearAll() {
  // TODO: process.js 구현 후 연결
  console.log('[TODO] 전체 초기화 기능 구현 예정');
}

function handleRun() {
  // TODO: scheduler.js 구현 후 연결
  console.log('[TODO] 시뮬레이션 실행 기능 구현 예정');
}

function handlePause() {
  // TODO: scheduler.js 구현 후 연결
  console.log('[TODO] 일시정지 기능 구현 예정');
}

function handleReset() {
  // TODO: scheduler.js 구현 후 연결
  console.log('[TODO] 초기화 기능 구현 예정');
}

/* ── 8. 이벤트 바인딩 ───────────────────────────────────────── */
function bindEvents() {
  DOM.selectAlgorithm.addEventListener('change', handleAlgorithmChange);
  DOM.inputSpeed.addEventListener('input', handleSpeedChange);

  DOM.btnAddProcess.addEventListener('click', handleAddProcess);
  DOM.btnClearAll.addEventListener('click', handleClearAll);
  DOM.btnRun.addEventListener('click', handleRun);
  DOM.btnPause.addEventListener('click', handlePause);
  DOM.btnReset.addEventListener('click', handleReset);
}

/* ── 9. 초기 UI 상태 설정 ──────────────────────────────────── */
function initUI() {
  // Round Robin이 아닌 경우 퀀텀 입력 숨김
  handleAlgorithmChange();

  // 속도 라벨 초기값
  handleSpeedChange();

  // 더미 데이터 기준 프로세스 개수
  updateProcessCount();

  console.log('%c Oidle ? Process Scheduling Visualizer ', 
    'background: linear-gradient(90deg,#7c3aed,#2563eb,#0891b2); color:#fff; font-weight:bold; padding:4px 8px; border-radius:4px;');
  console.log('정적 UI 뼈대 로드 완료. 다음 단계: 스케줄링 로직 구현 예정.');
}

/* ── 10. 앱 진입점 ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  initUI();
});
