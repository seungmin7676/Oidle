export default function ProcessTable({ processes, onDelete, onClearAll }) {
  return (
    <section className="card panel--table">
      <div className="card-header">
        <span className="card-icon-dot dot--blue" />
        <h2 className="card-title">프로세스 목록</h2>
        <span className="process-count">{processes.length}개</span>
        <button className="btn btn--reset" onClick={onClearAll}>초기화</button>
      </div>

      <div className="card-body table-wrapper">
        <table className="process-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>도착 시간</th>
              <th>실행 시간</th>
              <th>우선순위</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {processes.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty">프로세스를 추가하거나 예제를 불러오세요.</td>
              </tr>
            ) : (
              processes.map((p) => (
                <tr key={p.id} className="process-row">
                  <td><span className="process-badge" style={{ '--clr': p.color }}>{p.id}</span></td>
                  <td>{p.arrivalTime}</td>
                  <td>{p.burstTime}</td>
                  <td>{p.priority}</td>
                  <td>
                    <button className="btn--delete" onClick={() => onDelete(p.id)} aria-label={`${p.id} 삭제`}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
