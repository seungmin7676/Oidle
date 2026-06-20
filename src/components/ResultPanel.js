import GanttChart from './GanttChart';
import { ALGORITHM_LABELS } from '../constants';

export default function ResultPanel({ result, algorithm, processes, currentTime }) {
  return (
    <section className="card panel--gantt">
      <div className="card-header">
        <span className="card-icon-dot dot--cyan" />
        <h2 className="card-title">간트 차트 (Gantt Chart)</h2>
        {result && (
          <span className="dashboard-status">
            {ALGORITHM_LABELS[algorithm] ?? algorithm} · 총 {result.metrics.totalTime} tick
          </span>
        )}
      </div>

      <div className="card-body gantt-body">
        <GanttChart
          ganttChartData={result?.ganttChartData ?? []}
          processes={processes}
          currentTime={currentTime}
        />
      </div>
    </section>
  );
}
