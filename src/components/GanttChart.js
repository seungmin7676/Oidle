import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const IDLE_FILL = 'rgba(203, 213, 225, 0.7)';
const IDLE_BORDER = 'rgba(148, 163, 184, 0.9)';

// 재생 중 현재 시각에 빨간 점선을 그려 주는 플러그인.
const cursorLine = {
  id: 'cursorLine',
  afterDraw(chart) {
    const t = chart.options.plugins?.cursorLine?.time;
    if (t == null) return;

    const { ctx, chartArea, scales } = chart;
    if (!chartArea || !scales?.x) return;
    const x = scales.x.getPixelForValue(t);
    if (x < chartArea.left || x > chartArea.right) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(239,68,68,0.85)';
    ctx.setLineDash([5, 3]);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(239,68,68,0.95)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (chartArea.top - 6 > 2) ctx.fillText(`t=${t}`, x, chartArea.top - 6);
    ctx.restore();
  },
};
Chart.register(cursorLine);

// #rrggbb → rgba 문자열. 채움은 반투명, 테두리는 불투명하게.
function withAlpha(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return hex || `rgba(99,102,241,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function GanttChart({ ganttChartData, processes, currentTime }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // 간트 데이터가 바뀔 때만 차트를 새로 그린다.
  useEffect(() => {
    const segments = ganttChartData ?? [];
    if (!canvasRef.current || segments.length === 0) return undefined;

    const colorOf = new Map(processes.map((p) => [p.id, p.color || '#6366f1']));

    // 등장 순서대로 행(레이블)을 만든다.
    const rows = [];
    segments.forEach((seg) => {
      if (!rows.includes(seg.processId)) rows.push(seg.processId);
    });

    // 막대 하나당 데이터 한 점. 같은 프로세스의 여러 구간도 한 데이터셋에 담는다.
    const bars = segments.map((seg) => ({ x: [seg.start, seg.end], y: seg.processId }));
    const fills = segments.map((seg) =>
      seg.processId === 'IDLE' ? IDLE_FILL : withAlpha(colorOf.get(seg.processId), 0.8)
    );
    const borders = segments.map((seg) =>
      seg.processId === 'IDLE' ? IDLE_BORDER : withAlpha(colorOf.get(seg.processId), 1)
    );
    const totalTime = segments[segments.length - 1].end;

    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: rows,
        datasets: [{
          data: bars,
          backgroundColor: fills,
          borderColor: borders,
          borderWidth: 1.5,
          borderRadius: 4,
          borderSkipped: false,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          cursorLine: { time: currentTime ?? null },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const [start, end] = ctx.raw.x;
                return `  ${ctx.raw.y}:  ${start} ~ ${end}  (${end - start} tick)`;
              },
            },
            backgroundColor: 'rgba(30,27,75,0.92)',
            titleColor: '#a5b4fc',
            bodyColor: '#f1f5f9',
            borderColor: 'rgba(99,102,241,0.4)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            min: 0,
            max: totalTime,
            ticks: {
              stepSize: Math.max(1, Math.floor(totalTime / 20)),
              color: '#6366f1',
              font: { size: 11, family: "'Inter', sans-serif" },
            },
            grid: { color: 'rgba(99,102,241,0.08)', lineWidth: 1 },
            title: {
              display: true,
              text: 'Time (tick)',
              color: '#6366f1',
              font: { size: 12, weight: '700', family: "'Inter', sans-serif" },
            },
          },
          y: {
            ticks: {
              color: '#1e1b4b',
              font: { size: 12, weight: '700', family: "'Inter', 'Noto Sans KR', sans-serif" },
            },
            grid: { display: false },
          },
        },
        layout: { padding: { top: 14, right: 16, bottom: 8, left: 8 } },
      },
    });

    // 행 수에 맞춰 캔버스 높이를 잡는다.
    const height = Math.max(120, rows.length * 48 + 60);
    canvasRef.current.parentElement.style.minHeight = `${height}px`;
    canvasRef.current.style.height = `${height}px`;
    chartRef.current.resize();

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // currentTime은 아래 effect에서 따로 처리한다.
  }, [ganttChartData, processes]); // eslint-disable-line

  // 커서만 움직일 때는 차트를 다시 만들지 않고 위치만 갱신한다.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.options.plugins.cursorLine = { time: currentTime ?? null };
    chart.update('none');
  }, [currentTime]);

  if (!ganttChartData || ganttChartData.length === 0) {
    return <p className="empty-placeholder">시뮬레이션을 실행하면 간트 차트가 표시됩니다.</p>;
  }

  return (
    <div className="gantt-canvas-wrap">
      <canvas ref={canvasRef} />
    </div>
  );
}
