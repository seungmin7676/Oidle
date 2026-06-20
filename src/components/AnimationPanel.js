const STATE_LABELS = {
  new: 'NEW',
  ready: 'READY',
  running: 'RUNNING',
  terminated: 'DONE',
};

// 특정 시각 t에서 프로세스가 어떤 상태인지 알아낸다.
function stateAt(process, t, gantt) {
  if (t < process.arrivalTime) return 'new';
  if (process.completionTime !== null && t >= process.completionTime) return 'terminated';
  const running = gantt.some((seg) => seg.processId === process.id && seg.start <= t && t < seg.end);
  return running ? 'running' : 'ready';
}

const segmentAt = (t, gantt) => gantt.find((seg) => seg.start <= t && t < seg.end) ?? null;

export default function AnimationPanel({
  result,
  processes,
  animTime,
  animState,
  animSpeed,
  onPlay,
  onPause,
  onResume,
  onStop,
  onSpeedChange,
}) {
  const totalTime = result?.metrics.totalTime ?? 0;
  const gantt = result?.ganttChartData ?? [];
  const progress = totalTime > 0 ? Math.min(100, (animTime / totalTime) * 100) : 0;

  const isIdleState = animState === 'idle';
  const isDone = animState === 'done';

  const segment = result ? segmentAt(animTime, gantt) : null;
  const onCpu = segment && segment.processId !== 'IDLE' ? segment.processId : null;
  const runningProc = onCpu ? processes.find((p) => p.id === onCpu) : null;

  const statusText =
    animState === 'playing' ? '재생 중...' : animState === 'paused' ? '일시정지' : '재생 완료';

  return (
    <section className="card panel--animation">
      <div className="card-header">
        <span className="card-icon-dot dot--pink" />
        <h2 className="card-title">프로세스 실행 과정 애니메이션</h2>
        {!isIdleState && <span className="dashboard-status">{statusText}</span>}
      </div>

      <div className="card-body anim-body">
        <div className="anim-controls">
          {isIdleState || isDone ? (
            <button
              className="btn btn--anim-play"
              onClick={onPlay}
              disabled={!result}
              title={!result ? '먼저 시뮬레이션을 실행해주세요' : ''}
            >
              ▶ 애니메이션 실행
            </button>
          ) : animState === 'playing' ? (
            <button className="btn btn--anim-pause" onClick={onPause}>⏸ 일시정지</button>
          ) : (
            <button className="btn btn--anim-play" onClick={onResume}>▶ 계속</button>
          )}

          {!isIdleState && (
            <button className="btn btn--anim-stop" onClick={onStop}>⏹ 정지</button>
          )}

          <div className="anim-speed-group">
            <label htmlFor="anim-speed">속도</label>
            <input
              id="anim-speed"
              type="range"
              min="1"
              max="16"
              step="1"
              value={animSpeed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
            />
            <span className="anim-speed-label">{animSpeed}x</span>
          </div>
        </div>

        <div className="anim-timeline">
          <div className="anim-time-label">
            <span>현재 시간</span>
            <span className="anim-time-value">
              {!isIdleState ? `${animTime} / ${totalTime} tick` : result ? `0 / ${totalTime} tick` : '—'}
            </span>
          </div>
          <div className="anim-track">
            <div className="anim-track-fill" style={{ width: `${progress}%` }} />
            {!isIdleState && <div className="anim-track-cursor" style={{ left: `${progress}%` }} />}
          </div>
        </div>

        {!isIdleState && (
          <>
            <div className="anim-current-wrap">
              <span className="anim-current-label">CPU 실행 중</span>
              {isDone ? (
                <span className="anim-current-badge anim-badge--done">완료</span>
              ) : onCpu ? (
                <span className="anim-current-badge" style={{ '--clr': runningProc?.color ?? '#6366f1' }}>
                  {onCpu}
                </span>
              ) : (
                <span className="anim-current-badge anim-badge--idle">IDLE</span>
              )}
              {!isDone && onCpu && segment && (
                <span className="anim-seg-info">구간 {segment.start} ~ {segment.end} tick</span>
              )}
            </div>

            <div className="anim-states-grid">
              {result.processes.map((p) => {
                const state = isDone ? 'terminated' : stateAt(p, animTime, gantt);
                return (
                  <div key={p.id} className={`anim-state-item state-item--${state}`}>
                    <span className="process-badge" style={{ '--clr': p.color }}>{p.id}</span>
                    <span className={`state-badge state--${state}`}>{STATE_LABELS[state]}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!result && (
          <p className="empty-placeholder">먼저 시뮬레이션을 실행하면 애니메이션을 사용할 수 있습니다.</p>
        )}
      </div>
    </section>
  );
}
