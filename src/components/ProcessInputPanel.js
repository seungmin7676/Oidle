export default function ProcessInputPanel({
  form,
  error,
  onChange,
  onAdd,
  presets,
  selectedPreset,
  onSelectPreset,
  onLoadPreset,
}) {
  const current = presets.find((p) => p.id === selectedPreset);

  // Enter 키로도 추가할 수 있게.
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onAdd();
  };

  return (
    <section className="card panel--input">
      <div className="card-header">
        <span className="card-icon-dot dot--purple" />
        <h2 className="card-title">프로세스 추가</h2>
      </div>

      <div className="card-body">
        <div className="form-group">
          <label htmlFor="preset-select">예제 데이터 세트</label>
          <select
            id="preset-select"
            className="select-box"
            value={selectedPreset}
            onChange={(e) => onSelectPreset(e.target.value)}
          >
            <option value="">-- 직접 입력 --</option>
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>{preset.name}</option>
            ))}
          </select>
          {current && <p className="preset-hint">{current.desc}</p>}
        </div>
        <button className="btn btn--ghost btn--full btn--load" onClick={onLoadPreset}>
          예제 데이터 불러오기
        </button>

        <div className="form-group">
          <label htmlFor="proc-name">프로세스 이름</label>
          <input
            id="proc-name"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="form-group">
          <label htmlFor="proc-arrival">도착 시간 (Arrival Time)</label>
          <input
            id="proc-arrival"
            type="number"
            min="0"
            value={form.arrivalTime}
            onChange={(e) => onChange('arrivalTime', e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="form-group">
          <label htmlFor="proc-burst">실행 시간 (Burst Time)</label>
          <input
            id="proc-burst"
            type="number"
            min="1"
            value={form.burstTime}
            onChange={(e) => onChange('burstTime', e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="form-group">
          <label htmlFor="proc-priority">우선순위 (Priority)</label>
          <input
            id="proc-priority"
            type="number"
            placeholder="숫자가 작을수록 우선순위 높음"
            value={form.priority}
            onChange={(e) => onChange('priority', e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button className="btn btn--primary btn--full" onClick={onAdd}>+ 프로세스 추가</button>
        </div>
      </div>
    </section>
  );
}
