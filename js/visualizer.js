/* ============================================================
   visualizer.js - Gantt Chart Renderer using Chart.js
   Oidle : Process Scheduling Visualizer
   ============================================================
   [입력] ganttChartData: [{ processId, start, end }]
          processes: Process 배열 (color 정보 포함)
   [역할] Chart.js 가로 막대 차트로 간트 차트 렌더링
   [중요] DOM 접근은 canvas 요소에만 한정
          기존 차트 destroy 후 재생성
   ============================================================ */

'use strict';

/* ============================================================
   Visualizer 모듈 (즉시 실행 함수로 네임스페이스 보호)
   ============================================================ */
const Visualizer = (function () {

  /** 현재 Chart.js 인스턴스 보관 */
  let _chartInstance = null;

  /** IDLE 고정 색상 */
  const IDLE_COLOR       = 'rgba(203, 213, 225, 0.7)';
  const IDLE_BORDER      = 'rgba(148, 163, 184, 0.9)';

  /**
   * 프로세스 목록에서 id -> color 맵 생성
   * @param {object[]} processes
   * @returns {Map<string, string>}
   */
  function buildColorMap(processes) {
    const map = new Map();
    map.set('IDLE', IDLE_COLOR);
    if (processes && processes.length > 0) {
      processes.forEach(p => {
        map.set(p.id, p.color || '#6366f1');
      });
    }
    return map;
  }

  /**
   * rgba 색상 문자열에서 border 색상 생성 (투명도 높임)
   * @param {string} color - hex 또는 rgba
   * @returns {string}
   */
  function toBorderColor(color) {
    if (!color) return 'rgba(99,102,241,1)';
    if (color.startsWith('#')) {
      // hex -> rgba with full opacity
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r},${g},${b},1)`;
    }
    return color.replace(/[\d.]+\)$/, '1)');
  }

  /**
   * 배경색 (반투명)
   */
  function toFillColor(color) {
    if (!color) return 'rgba(99,102,241,0.75)';
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r},${g},${b},0.80)`;
    }
    return color;
  }

  /* ----------------------------------------------------------
     render(canvasId, ganttChartData, processes)
     - 메인 렌더링 함수
     - @param {string}   canvasId       - canvas 요소 id
     - @param {object[]} ganttChartData - [{ processId, start, end }]
     - @param {object[]} processes      - Process 배열
  ---------------------------------------------------------- */
  function render(canvasId, ganttChartData, processes) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn('[Visualizer] canvas not found:', canvasId);
      return;
    }

    // 기존 차트 제거
    if (_chartInstance) {
      _chartInstance.destroy();
      _chartInstance = null;
    }

    if (!ganttChartData || ganttChartData.length === 0) {
      console.warn('[Visualizer] ganttChartData is empty');
      return;
    }

    const colorMap  = buildColorMap(processes);
    const totalTime = ganttChartData[ganttChartData.length - 1].end;

    /* ── Chart.js 데이터셋 구성 ──────────────────────────────
       각 프로세스(+ IDLE)를 하나의 dataset 으로 만들고
       해당 구간만 [start, end] 데이터로 표현
       나머지 구간은 null (투명)
    ──────────────────────────────────────────────────────── */

    // y축 레이블: 등장 순서대로 유니크하게 수집
    const labels = [];
    ganttChartData.forEach(seg => {
      if (!labels.includes(seg.processId)) labels.push(seg.processId);
    });

    // 각 레이블(행)별 세그먼트 목록
    const segsByLabel = {};
    labels.forEach(lbl => { segsByLabel[lbl] = []; });
    ganttChartData.forEach(seg => segsByLabel[seg.processId].push(seg));

    // 하나의 행당 여러 세그먼트 → 각 세그먼트를 개별 dataset 으로
    const datasets = [];
    ganttChartData.forEach((seg, idx) => {
      const fillColor   = seg.processId === 'IDLE' ? IDLE_COLOR  : toFillColor(colorMap.get(seg.processId));
      const borderColor = seg.processId === 'IDLE' ? IDLE_BORDER : toBorderColor(colorMap.get(seg.processId));

      // 이 dataset 은 해당 y 레이블에만 값을 가짐
      const data = labels.map(lbl =>
        lbl === seg.processId ? [seg.start, seg.end] : null
      );

      datasets.push({
        label:           seg.processId === 'IDLE' ? 'IDLE' : seg.processId,
        data:            data,
        backgroundColor: fillColor,
        borderColor:     borderColor,
        borderWidth:     1.5,
        borderRadius:    4,
        borderSkipped:   false,
        barPercentage:   0.6,
        categoryPercentage: 0.8,
      });
    });

    /* ── Chart.js 생성 ──────────────────────────────────── */
    const ctx = canvas.getContext('2d');

    _chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels:   labels,
        datasets: datasets,
      },
      options: {
        indexAxis: 'y',          // 가로 막대 차트
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 400,
          easing:  'easeOutQuart',
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const v = ctx.raw;
                if (!v || !Array.isArray(v)) return '';
                return `  ${ctx.dataset.label}:  ${v[0]} ~ ${v[1]}  (${v[1] - v[0]} tick)`;
              },
            },
            backgroundColor: 'rgba(30,27,75,0.92)',
            titleColor:      '#a5b4fc',
            bodyColor:       '#f1f5f9',
            borderColor:     'rgba(99,102,241,0.4)',
            borderWidth:     1,
            padding:         10,
            cornerRadius:    8,
          },
        },
        scales: {
          x: {
            type:     'linear',
            position: 'bottom',
            min:      0,
            max:      totalTime,
            ticks: {
              stepSize: Math.max(1, Math.floor(totalTime / 20)),
              color:    '#6366f1',
              font:     { size: 11, family: "'Inter', sans-serif" },
            },
            grid: {
              color:     'rgba(99,102,241,0.08)',
              lineWidth: 1,
            },
            title: {
              display: true,
              text:    'Time (tick)',
              color:   '#6366f1',
              font:    { size: 12, weight: '700', family: "'Inter', sans-serif" },
            },
          },
          y: {
            ticks: {
              color: '#1e1b4b',
              font:  { size: 12, weight: '700', family: "'Inter', 'Noto Sans KR', sans-serif" },
            },
            grid: {
              display: false,
            },
          },
        },
        layout: {
          padding: { top: 8, right: 16, bottom: 8, left: 8 },
        },
      },
    });

    // canvas 높이 동적 조정 (레이블 수 기반)
    const rowH  = 48;
    const minH  = 120;
    const newH  = Math.max(minH, labels.length * rowH + 60);
    canvas.parentElement.style.minHeight = newH + 'px';
    canvas.style.height = newH + 'px';
    _chartInstance.resize();

    console.log('[Visualizer] Gantt chart rendered. segments:', ganttChartData.length, 'rows:', labels.length);
  }

  /* ----------------------------------------------------------
     destroy()  - 차트 명시적 제거
  ---------------------------------------------------------- */
  function destroy() {
    if (_chartInstance) {
      _chartInstance.destroy();
      _chartInstance = null;
      console.log('[Visualizer] Chart destroyed.');
    }
  }

  /* ----------------------------------------------------------
     getInstance() - 현재 Chart 인스턴스 반환 (디버그용)
  ---------------------------------------------------------- */
  function getInstance() {
    return _chartInstance;
  }

  // public API
  return { render, destroy, getInstance };

})();
