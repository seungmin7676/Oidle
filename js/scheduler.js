/* ============================================================
   scheduler.js - Pure Function Scheduling Algorithms
   Oidle : Process Scheduling Visualizer
   ============================================================
   DOM 접근 없음. 순수 함수만 사용.

   [입력] processes: Process 객체 배열 (cloned)
   [출력] { ganttChartData, metrics, processes }
     - ganttChartData : [{ processId, start, end }]
     - metrics        : { avgWaitingTime, avgTurnaroundTime,
                          avgResponseTime, cpuUtilization, throughput,
                          totalTime, processCount }
     - processes      : 완료된 Process 배열 (waitingTime 등 채워짐)
   ============================================================ */

'use strict';

/* ============================================================
   내부 유틸
   ============================================================ */

/**
 * 프로세스 배열을 깊은 복사 (plain object 방식)
 * scheduler 내부에서 원본을 절대 변형하지 않기 위해 사용
 */
function cloneProcesses(processes) {
  return processes.map(p => ({
    id:             p.id,
    arrivalTime:    p.arrivalTime,
    burstTime:      p.burstTime,
    remainingTime:  p.burstTime,   // 매번 새로 시작
    priority:       p.priority,
    color:          p.color,
    startTime:      null,
    completionTime: null,
    waitingTime:    0,
    turnaroundTime: 0,
    responseTime:   null,
    state:          'new',
  }));
}

/**
 * 간트 배열 압축: 연속된 같은 processId 를 하나의 구간으로 합침
 */
function compressGantt(raw) {
  if (raw.length === 0) return [];
  const result = [{ ...raw[0] }];
  for (let i = 1; i < raw.length; i++) {
    const last = result[result.length - 1];
    if (raw[i].processId === last.processId) {
      last.end = raw[i].end;
    } else {
      result.push({ ...raw[i] });
    }
  }
  return result;
}

/**
 * 최종 지표(metrics) 계산
 * @param {object[]} procs  - 완료된 프로세스 배열
 * @param {number}   total  - 총 시뮬레이션 시간
 */
function calcMetrics(procs, total) {
  const n = procs.length;
  if (n === 0 || total === 0) return {
    avgWaitingTime: 0, avgTurnaroundTime: 0, avgResponseTime: 0,
    cpuUtilization: 0, throughput: 0, totalTime: total, processCount: n,
  };

  const totalBurst    = procs.reduce((s, p) => s + p.burstTime, 0);
  const avgWaiting    = procs.reduce((s, p) => s + p.waitingTime,    0) / n;
  const avgTurnaround = procs.reduce((s, p) => s + p.turnaroundTime, 0) / n;
  const avgResponse   = procs.reduce((s, p) => s + p.responseTime,   0) / n;

  return {
    avgWaitingTime:    Math.round(avgWaiting    * 100) / 100,
    avgTurnaroundTime: Math.round(avgTurnaround * 100) / 100,
    avgResponseTime:   Math.round(avgResponse   * 100) / 100,
    cpuUtilization:    Math.round((totalBurst / total) * 10000) / 100,
    throughput:        Math.round((n / total)  * 1000) / 1000,
    totalTime:         total,
    processCount:      n,
  };
}

/* ============================================================
   1. FCFS - First Come, First Served (Non-preemptive)
   ============================================================ */
function scheduleFCFS(processes) {
  const procs    = cloneProcesses(processes);
  const ganttRaw = [];

  const sorted = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let time = 0;

  for (const p of sorted) {
    if (time < p.arrivalTime) {
      ganttRaw.push({ processId: 'IDLE', start: time, end: p.arrivalTime });
      time = p.arrivalTime;
    }

    p.startTime    = time;
    p.responseTime = p.startTime - p.arrivalTime;

    for (let t = 0; t < p.burstTime; t++) {
      ganttRaw.push({ processId: p.id, start: time, end: time + 1 });
      time++;
    }

    p.completionTime = time;
    p.turnaroundTime = p.completionTime - p.arrivalTime;
    p.waitingTime    = p.turnaroundTime - p.burstTime;
    p.state          = 'terminated';
  }

  return { ganttChartData: compressGantt(ganttRaw), metrics: calcMetrics(procs, time), processes: procs };
}

/* ============================================================
   2. SJF - Shortest Job First (Non-preemptive)
   ============================================================ */
function scheduleSJF(processes) {
  const procs    = cloneProcesses(processes);
  const ganttRaw = [];
  const done     = new Set();
  let time       = 0;
  let completed  = 0;
  const n        = procs.length;

  while (completed < n) {
    const ready = procs.filter(p => p.arrivalTime <= time && !done.has(p.id));

    if (ready.length === 0) {
      const nextArrival = Math.min(...procs.filter(p => !done.has(p.id)).map(p => p.arrivalTime));
      ganttRaw.push({ processId: 'IDLE', start: time, end: nextArrival });
      time = nextArrival;
      continue;
    }

    ready.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
    const p = ready[0];

    p.startTime    = time;
    p.responseTime = p.startTime - p.arrivalTime;

    for (let t = 0; t < p.burstTime; t++) {
      ganttRaw.push({ processId: p.id, start: time, end: time + 1 });
      time++;
    }

    p.completionTime = time;
    p.turnaroundTime = p.completionTime - p.arrivalTime;
    p.waitingTime    = p.turnaroundTime - p.burstTime;
    p.state          = 'terminated';
    done.add(p.id);
    completed++;
  }

  return { ganttChartData: compressGantt(ganttRaw), metrics: calcMetrics(procs, time), processes: procs };
}

/* ============================================================
   3. SRTF - Shortest Remaining Time First (Preemptive SJF)
      매 tick 마다 남은 시간이 가장 짧은 프로세스 선택
   ============================================================ */
function scheduleSRTF(processes) {
  const procs    = cloneProcesses(processes);
  const ganttRaw = [];
  const done     = new Set();
  let time       = 0;
  let completed  = 0;
  const n        = procs.length;
  const maxTime  = procs.reduce((s, p) => s + p.burstTime, 0) + 1;

  while (completed < n && time <= maxTime) {
    const ready = procs.filter(
      p => p.arrivalTime <= time && !done.has(p.id) && p.remainingTime > 0
    );

    if (ready.length === 0) {
      const pending = procs.filter(p => !done.has(p.id));
      if (pending.length === 0) break;
      const nextArrival = Math.min(...pending.map(p => p.arrivalTime));
      ganttRaw.push({ processId: 'IDLE', start: time, end: nextArrival });
      time = nextArrival;
      continue;
    }

    ready.sort((a, b) => a.remainingTime - b.remainingTime || a.arrivalTime - b.arrivalTime);
    const p = ready[0];

    if (p.startTime === null) {
      p.startTime    = time;
      p.responseTime = p.startTime - p.arrivalTime;
    }

    ganttRaw.push({ processId: p.id, start: time, end: time + 1 });
    p.remainingTime--;
    time++;

    if (p.remainingTime === 0) {
      p.completionTime = time;
      p.turnaroundTime = p.completionTime - p.arrivalTime;
      p.waitingTime    = p.turnaroundTime - p.burstTime;
      p.state          = 'terminated';
      done.add(p.id);
      completed++;
    }
  }

  return { ganttChartData: compressGantt(ganttRaw), metrics: calcMetrics(procs, time), processes: procs };
}

/* ============================================================
   4. Round Robin (time quantum 포함)
      quantum 단위 실행, quantum 도중 새 도착 프로세스 반영
   ============================================================ */
function scheduleRR(processes, timeQuantum) {
  if (timeQuantum === undefined || timeQuantum === null) timeQuantum = 2;
  timeQuantum = Number(timeQuantum);

  const procs    = cloneProcesses(processes);
  const ganttRaw = [];
  const done     = new Set();
  let time       = 0;
  let completed  = 0;
  const n        = procs.length;

  const queue   = [];
  const sorted  = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let nextIdx   = 0;

  // 초기 큐 채우기
  while (nextIdx < sorted.length && sorted[nextIdx].arrivalTime <= time) {
    queue.push(sorted[nextIdx]);
    nextIdx++;
  }

  while (completed < n) {
    if (queue.length === 0) {
      if (nextIdx >= sorted.length) break;
      const next = sorted[nextIdx];
      ganttRaw.push({ processId: 'IDLE', start: time, end: next.arrivalTime });
      time = next.arrivalTime;
      while (nextIdx < sorted.length && sorted[nextIdx].arrivalTime <= time) {
        queue.push(sorted[nextIdx]);
        nextIdx++;
      }
      continue;
    }

    const p = queue.shift();

    if (p.startTime === null) {
      p.startTime    = time;
      p.responseTime = p.startTime - p.arrivalTime;
    }

    const execTime = Math.min(timeQuantum, p.remainingTime);

    for (let t = 0; t < execTime; t++) {
      ganttRaw.push({ processId: p.id, start: time, end: time + 1 });
      p.remainingTime--;
      time++;

      while (nextIdx < sorted.length && sorted[nextIdx].arrivalTime <= time) {
        queue.push(sorted[nextIdx]);
        nextIdx++;
      }
    }

    if (p.remainingTime === 0) {
      p.completionTime = time;
      p.turnaroundTime = p.completionTime - p.arrivalTime;
      p.waitingTime    = p.turnaroundTime - p.burstTime;
      p.state          = 'terminated';
      done.add(p.id);
      completed++;
    } else {
      queue.push(p);
    }
  }

  return { ganttChartData: compressGantt(ganttRaw), metrics: calcMetrics(procs, time), processes: procs };
}

/* ============================================================
   5-A. Priority Non-Preemptive
        숫자가 낮을수록 우선순위 높음 (1 = 최고)
   ============================================================ */
function schedulePriorityNP(processes) {
  const procs    = cloneProcesses(processes);
  const ganttRaw = [];
  const done     = new Set();
  let time       = 0;
  let completed  = 0;
  const n        = procs.length;

  while (completed < n) {
    const ready = procs.filter(p => p.arrivalTime <= time && !done.has(p.id));

    if (ready.length === 0) {
      const nextArrival = Math.min(...procs.filter(p => !done.has(p.id)).map(p => p.arrivalTime));
      ganttRaw.push({ processId: 'IDLE', start: time, end: nextArrival });
      time = nextArrival;
      continue;
    }

    ready.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
    const p = ready[0];

    p.startTime    = time;
    p.responseTime = p.startTime - p.arrivalTime;

    for (let t = 0; t < p.burstTime; t++) {
      ganttRaw.push({ processId: p.id, start: time, end: time + 1 });
      time++;
    }

    p.completionTime = time;
    p.turnaroundTime = p.completionTime - p.arrivalTime;
    p.waitingTime    = p.turnaroundTime - p.burstTime;
    p.state          = 'terminated';
    done.add(p.id);
    completed++;
  }

  return { ganttChartData: compressGantt(ganttRaw), metrics: calcMetrics(procs, time), processes: procs };
}

/* ============================================================
   5-B. Priority Preemptive
        매 tick 마다 도착한 프로세스 중 우선순위 가장 높은 것 실행
   ============================================================ */
function schedulePriorityP(processes) {
  const procs    = cloneProcesses(processes);
  const ganttRaw = [];
  const done     = new Set();
  let time       = 0;
  let completed  = 0;
  const n        = procs.length;
  const maxTime  = procs.reduce((s, p) => s + p.burstTime, 0) + 1;

  while (completed < n && time <= maxTime) {
    const ready = procs.filter(
      p => p.arrivalTime <= time && !done.has(p.id) && p.remainingTime > 0
    );

    if (ready.length === 0) {
      const pending = procs.filter(p => !done.has(p.id));
      if (pending.length === 0) break;
      const nextArrival = Math.min(...pending.map(p => p.arrivalTime));
      ganttRaw.push({ processId: 'IDLE', start: time, end: nextArrival });
      time = nextArrival;
      continue;
    }

    ready.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
    const p = ready[0];

    if (p.startTime === null) {
      p.startTime    = time;
      p.responseTime = p.startTime - p.arrivalTime;
    }

    ganttRaw.push({ processId: p.id, start: time, end: time + 1 });
    p.remainingTime--;
    time++;

    if (p.remainingTime === 0) {
      p.completionTime = time;
      p.turnaroundTime = p.completionTime - p.arrivalTime;
      p.waitingTime    = p.turnaroundTime - p.burstTime;
      p.state          = 'terminated';
      done.add(p.id);
      completed++;
    }
  }

  return { ganttChartData: compressGantt(ganttRaw), metrics: calcMetrics(procs, time), processes: procs };
}

/* ============================================================
   메인 디스패처
   ============================================================ */
/**
 * @param {string}   algorithm  'fcfs'|'sjf'|'srtf'|'rr'|'priority_np'|'priority_p'
 * @param {object[]} processes  Process 배열
 * @param {object}   [options]  { timeQuantum: number }
 * @returns {{ ganttChartData, metrics, processes }}
 */
function runScheduler(algorithm, processes, options) {
  if (options === undefined) options = {};

  if (!processes || processes.length === 0) {
    return {
      ganttChartData: [],
      metrics: {
        avgWaitingTime: 0, avgTurnaroundTime: 0, avgResponseTime: 0,
        cpuUtilization: 0, throughput: 0, totalTime: 0, processCount: 0,
      },
      processes: [],
    };
  }

  const quantum = Number(options.timeQuantum) || 2;

  switch (algorithm) {
    case 'fcfs':        return scheduleFCFS(processes);
    case 'sjf':         return scheduleSJF(processes);
    case 'srtf':        return scheduleSRTF(processes);
    case 'rr':          return scheduleRR(processes, quantum);
    case 'priority_np': return schedulePriorityNP(processes);
    case 'priority_p':  return schedulePriorityP(processes);
    default:
      console.warn('[Scheduler] Unknown algorithm:', algorithm);
      return scheduleFCFS(processes);
  }
}
