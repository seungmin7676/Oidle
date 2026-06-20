import { ALGORITHMS, ALGORITHM_DESCRIPTIONS } from '../constants';

export default function ControlPanel({
  algorithm,
  onAlgorithmChange,
  quantum,
  onQuantumChange,
  onRun,
  disabled,
}) {
  const isRR = algorithm === 'rr';

  return (
    <section className="card panel--control">
      <div className="card-header">
        <span className="card-icon-dot dot--cyan" />
        <h2 className="card-title">스케줄링 설정</h2>
      </div>

      <div className="card-body">
        <div className="control-body">
          <div className="control-group">
            <label htmlFor="algorithm-select">알고리즘</label>
            <select
              id="algorithm-select"
              className="select-box"
              value={algorithm}
              onChange={(e) => onAlgorithmChange(e.target.value)}
            >
              {ALGORITHMS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="quantum-input">타임 슬라이스 (Round Robin 전용)</label>
            <input
              id="quantum-input"
              className="quantum-input"
              type="number"
              min="1"
              value={quantum}
              disabled={!isRR}
              onChange={(e) => onQuantumChange(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>

          <div className="control-actions">
            <button className="btn btn--run" onClick={onRun} disabled={disabled}>▶ 실행</button>
          </div>
        </div>

        <p className="algo-desc">{ALGORITHM_DESCRIPTIONS[algorithm]}</p>
      </div>
    </section>
  );
}
