import ProcessResultTable from './ProcessResultTable';

export default function DashboardPanel({ result }) {
  if (!result) {
    return (
      <section className="card panel--dashboard">
        <div className="card-header">
          <span className="card-icon-dot dot--violet" />
          <h2 className="card-title">성능 분석 대시보드</h2>
          <span className="dashboard-status">시뮬레이션 대기 중...</span>
        </div>
        <div className="card-body">
          <p className="empty-placeholder">시뮬레이션을 실행하면 결과가 표시됩니다.</p>
        </div>
      </section>
    );
  }

  const m = result.metrics;
  const metrics = [
    { label: '평균 대기 시간', value: `${m.avgWaitingTime} tick` },
    { label: '평균 반환 시간', value: `${m.avgTurnaroundTime} tick` },
    { label: '평균 응답 시간', value: `${m.avgResponseTime} tick` },
    { label: '총 실행 시간', value: `${m.totalTime} tick` },
    { label: 'CPU 이용률', value: `${m.cpuUtilization} %` },
    { label: '처리량', value: `${m.throughput} proc/tick` },
  ];

  return (
    <section className="card panel--dashboard complete">
      <div className="card-header">
        <span className="card-icon-dot dot--violet" />
        <h2 className="card-title">성능 분석 대시보드</h2>
        <span className="dashboard-status">시뮬레이션 완료</span>
      </div>

      <div className="card-body">
        <div className="cpu-gauge-wrap">
          <div className="cpu-gauge-label">
            <span>CPU 이용률</span>
            <span className="cpu-gauge-value">{m.cpuUtilization}%</span>
          </div>
          <div className="cpu-gauge-track">
            <div
              className={`cpu-gauge-fill${m.cpuUtilization > 0 ? ' active' : ''}`}
              style={{ width: `${m.cpuUtilization}%` }}
            />
          </div>
        </div>

        <div className="metrics-grid">
          {metrics.map((item) => (
            <div className="metric-card" key={item.label}>
              <span className="metric-label">{item.label}</span>
              <span className="metric-value">{item.value}</span>
            </div>
          ))}
        </div>

        <ProcessResultTable processes={result.processes} />
      </div>
    </section>
  );
}
