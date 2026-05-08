/* ============================================================
   dashboard.js - Performance Metrics Dashboard
   Oidle : Process Scheduling Visualizer
   ============================================================
   [입력] metrics 객체, processes 배열 (scheduler 결과)
   [역할] 성능 지표 카드 및 결과 테이블 DOM 업데이트
   ============================================================ */

'use strict';

/* ============================================================
   Dashboard 모듈
   ============================================================ */
const Dashboard = (function () {
  /* ----------------------------------------------------------
     DOM ID 상수 (index.html 과 일치)
  ---------------------------------------------------------- */
  const IDS = {
    avgWait:      'metric-avg-wait',
    avgTurn:      'metric-avg-turnaround',
    avgResp:      'metric-avg-response',
    totalTime:    'metric-total-time',
    cpuUtil:      'metric-cpu-util',
    throughput:   'metric-throughput',
    status:       'dashboard-status',
    resultTbody:  'result-tbody',
    dashPanel:    'dashboard-panel',
    metricsGrid:  'metrics-grid',
  };

  /* ----------------------------------------------------------
     _set(id, value)  - 안전한 DOM 텍스트 업데이트
  ---------------------------------------------------------- */
  function _set(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  /* ----------------------------------------------------------
     _addClass / _removeClass
  ---------------------------------------------------------- */
  function _addClass(id, cls) {
    const el = document.getElementById(id);
    if (el) el.classList.add(cls);
  }
  function _removeClass(id, cls) {
    const el = document.getElementById(id);
    if (el) el.classList.remove(cls);
  }

  /* ----------------------------------------------------------
     render(metrics, processes, algorithmLabel)
     - 핵심 지표 카드 6개 업데이트
     - 프로세스별 결과 테이블 업데이트
     - @param {object}   metrics        - calcMetrics() 결과
     - @param {object[]} processes      - 완료된 Process 배열
     - @param {string}   algorithmLabel - 알고리즘 이름 (표시용)
  ---------------------------------------------------------- */
  function render(metrics, processes, algorithmLabel) {
    if (!metrics) {
      console.warn('[Dashboard] metrics is null');
      return;
    }

    // ── 핵심 지표 카드 업데이트 ──────────────────────────────
    _set(IDS.avgWait,    metrics.avgWaitingTime    !== undefined ? metrics.avgWaitingTime    + ' tick' : '-');
    _set(IDS.avgTurn,    metrics.avgTurnaroundTime !== undefined ? metrics.avgTurnaroundTime + ' tick' : '-');
    _set(IDS.avgResp,    metrics.avgResponseTime   !== undefined ? metrics.avgResponseTime   + ' tick' : '-');
    _set(IDS.totalTime,  metrics.totalTime         !== undefined ? metrics.totalTime         + ' tick' : '-');
    _set(IDS.cpuUtil,    metrics.cpuUtilization    !== undefined ? metrics.cpuUtilization    + ' %'    : '-');
    _set(IDS.throughput, metrics.throughput        !== undefined ? metrics.throughput        + ' proc/tick' : '-');

    // has-value 클래스 추가 (그라데이션 강조)
    [IDS.avgWait, IDS.avgTurn, IDS.avgResp, IDS.totalTime, IDS.cpuUtil, IDS.throughput].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('has-value');
    });

    // ── 상태 텍스트 업데이트 ─────────────────────────────────
    const label = algorithmLabel || 'Unknown';
    _set(IDS.status, label + ' - 시뮬레이션 완료');

    // ── 프로세스별 결과 테이블 ────────────────────────────────
    _renderResultTable(processes);

    // ── 완료 애니메이션 클래스 적용 ──────────────────────────
    _addClass(IDS.dashPanel, 'complete');
    const grid = document.getElementById(IDS.metricsGrid);
    if (grid) grid.classList.add('dashboard-complete');

    console.log('[Dashboard] rendered. metrics:', metrics);
  }

  /* ----------------------------------------------------------
     _renderResultTable(processes)
     - 프로세스별 상세 결과 테이블 행 생성
  ---------------------------------------------------------- */
  function _renderResultTable(processes) {
    const tbody = document.getElementById(IDS.resultTbody);
    if (!tbody) return;

    if (!processes || processes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-row">결과 없음</td></tr>';
      return;
    }

    const rows = processes.map(p => {
      const color = p.color || '#6366f1';
      return `
        <tr>
          <td>
            <span class="process-badge" style="--clr:${color}">${p.id}</span>
          </td>
          <td>${p.arrivalTime}</td>
          <td>${p.burstTime}</td>
          <td class="col-finish">${p.completionTime !== null ? p.completionTime : '-'}</td>
          <td class="col-turn">${p.turnaroundTime !== undefined ? p.turnaroundTime : '-'}</td>
          <td class="col-wait">${p.waitingTime !== undefined ? p.waitingTime : '-'}</td>
          <td class="col-resp">${p.responseTime !== null ? p.responseTime : '-'}</td>
        </tr>`;
    });

    tbody.innerHTML = rows.join('');
  }

  /* ----------------------------------------------------------
     reset()
     - 대시보드를 초기 상태로 되돌림
  ---------------------------------------------------------- */
  function reset() {
    // 지표 카드 초기화
    [IDS.avgWait, IDS.avgTurn, IDS.avgResp, IDS.totalTime, IDS.cpuUtil, IDS.throughput].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = '-';
        el.classList.remove('has-value');
      }
    });

    // 상태 텍스트
    _set(IDS.status, '시뮬레이션 대기 중...');

    // 결과 테이블 초기화
    const tbody = document.getElementById(IDS.resultTbody);
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-row">시뮬레이션을 실행하면 결과가 표시됩니다.</td></tr>';
    }

    // 완료 클래스 제거
    _removeClass(IDS.dashPanel, 'complete');
    const grid = document.getElementById(IDS.metricsGrid);
    if (grid) grid.classList.remove('dashboard-complete');

    console.log('[Dashboard] reset.');
  }

  /* ----------------------------------------------------------
     updateCpuGauge(utilization)
     - CPU 이용률 게이지 바 실시간 업데이트
     - @param {number} utilization - 0~100 (%)
  ---------------------------------------------------------- */
  function updateCpuGauge(utilization) {
    const fill  = document.getElementById('cpu-gauge-fill');
    const label = document.getElementById('cpu-gauge-value');
    const pct   = Math.min(100, Math.max(0, Number(utilization) || 0));
    if (fill)  fill.style.width   = pct + '%';
    if (label) label.textContent  = pct + '%';
    if (fill)  fill.classList.toggle('active', pct > 0);
  }

  /* ----------------------------------------------------------
     updateCurrentTime(t)
     - 현재 시각 표시 업데이트
  ---------------------------------------------------------- */
  function updateCurrentTime(t) {
    const el = document.getElementById('current-time');
    if (el) el.textContent = t;
  }

  /* ----------------------------------------------------------
     updateCpuBadge(state)
     - 헤더 CPU 상태 배지 업데이트
     - @param {string} state - 'idle' | 'running'
  ---------------------------------------------------------- */
  function updateCpuBadge(state) {
    const badge = document.getElementById('cpu-status-badge');
    if (!badge) return;
    if (state === 'running') {
      badge.textContent = 'CPU RUNNING';
      badge.className   = 'badge badge--running';
    } else {
      badge.textContent = 'CPU IDLE';
      badge.className   = 'badge badge--idle';
    }
  }

  /* ----------------------------------------------------------
     updateProcessState(processId, state)
     - 간트 패널 프로세스 상태 배지 업데이트
     - @param {string} processId
     - @param {string} state - 'ready'|'running'|'waiting'|'terminated'
  ---------------------------------------------------------- */
  function updateProcessState(processId, state) {
    const statesDiv = document.getElementById('process-states');
    if (!statesDiv) return;

    const items = statesDiv.querySelectorAll('.state-item');
    items.forEach(item => {
      const badge = item.querySelector('.process-badge');
      if (badge && badge.textContent.trim() === processId) {
        const stateBadge = item.querySelector('.state-badge');
        if (stateBadge) {
          stateBadge.className = 'state-badge state--' + state;
          stateBadge.textContent = state.toUpperCase();
        }
      }
    });
  }

  /* ----------------------------------------------------------
     rebuildProcessStates(processes)
     - process-states 영역 전체 재구성 (시뮬레이션 시작 시)
  ---------------------------------------------------------- */
  function rebuildProcessStates(processes) {
    const statesDiv = document.getElementById('process-states');
    if (!statesDiv || !processes) return;

    statesDiv.innerHTML = processes.map(p => `
      <div class="state-item">
        <span class="process-badge" style="--clr:${p.color || '#6366f1'}">${p.id}</span>
        <span class="state-badge state--ready">READY</span>
      </div>
    `).join('');
  }

  // public API
  return {
    render,
    reset,
    updateCpuGauge,
    updateCurrentTime,
    updateCpuBadge,
    updateProcessState,
    rebuildProcessStates,
  };

})();
