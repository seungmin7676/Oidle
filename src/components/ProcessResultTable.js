export default function ProcessResultTable({ processes }) {
  if (!processes || processes.length === 0) return null;

  return (
    <div className="result-table-wrap">
      <h3 className="result-table-title">프로세스별 상세 결과</h3>
      <div className="table-wrapper">
        <table className="process-table result-table">
          <thead>
            <tr>
              <th>프로세스</th>
              <th>도착 시간</th>
              <th>실행 시간</th>
              <th>완료 시간</th>
              <th>반환 시간</th>
              <th>대기 시간</th>
              <th>응답 시간</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p) => (
              <tr key={p.id} className="process-row">
                <td><span className="process-badge" style={{ '--clr': p.color }}>{p.id}</span></td>
                <td>{p.arrivalTime}</td>
                <td>{p.burstTime}</td>
                <td className="col-finish">{p.completionTime ?? '-'}</td>
                <td className="col-turn">{p.turnaroundTime ?? '-'}</td>
                <td className="col-wait">{p.waitingTime ?? '-'}</td>
                <td className="col-resp">{p.responseTime ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
