// 스케줄링 알고리즘 모음.
// 대부분의 알고리즘은 "준비 큐에서 하나 고른다"는 규칙만 다를 뿐 흐름은 같아서
// 비선점/선점 루프를 하나씩 두고 비교 함수(compare)만 바꿔 끼우는 식으로 구현했다.
// Round Robin만 큐 순환 방식이라 따로 뺐다.

function makeWorkingSet(processes) {
  return processes.map((p) => ({
    id: p.id,
    arrivalTime: p.arrivalTime,
    burstTime: p.burstTime,
    priority: p.priority,
    color: p.color,
    remainingTime: p.burstTime,
    startTime: null,
    completionTime: null,
    responseTime: null,
    turnaroundTime: 0,
    waitingTime: 0,
    state: 'new',
  }));
}

// 프로세스가 끝났을 때 시간 관련 지표를 채워준다.
function complete(p, time) {
  p.completionTime = time;
  p.turnaroundTime = time - p.arrivalTime;
  p.waitingTime = p.turnaroundTime - p.burstTime;
  p.state = 'terminated';
}

// 준비 큐 선택 기준. 동점이면 먼저 도착한 쪽을 우선한다.
const byArrival = (a, b) => a.arrivalTime - b.arrivalTime;
const byBurst = (a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime;
const byRemaining = (a, b) => a.remainingTime - b.remainingTime || a.arrivalTime - b.arrivalTime;
const byPriority = (a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime;

// 같은 프로세스가 연속으로 실행된 구간(틱 단위)을 하나로 합친다.
function mergeSegments(ticks) {
  const merged = [];
  for (const seg of ticks) {
    const last = merged[merged.length - 1];
    if (last && last.processId === seg.processId) last.end = seg.end;
    else merged.push({ ...seg });
  }
  return merged;
}

function summarize(procs, totalTime) {
  const n = procs.length;
  if (n === 0 || totalTime === 0) {
    return {
      avgWaitingTime: 0, avgTurnaroundTime: 0, avgResponseTime: 0,
      cpuUtilization: 0, throughput: 0, totalTime, processCount: n,
    };
  }
  const totalBurst = procs.reduce((sum, p) => sum + p.burstTime, 0);
  const avg = (pick) => procs.reduce((sum, p) => sum + pick(p), 0) / n;
  const round2 = (x) => Math.round(x * 100) / 100;

  return {
    avgWaitingTime: round2(avg((p) => p.waitingTime)),
    avgTurnaroundTime: round2(avg((p) => p.turnaroundTime)),
    avgResponseTime: round2(avg((p) => p.responseTime)),
    cpuUtilization: round2((totalBurst / totalTime) * 100),
    throughput: Math.round((n / totalTime) * 1000) / 1000,
    totalTime,
    processCount: n,
  };
}

function buildResult(procs, ticks, totalTime) {
  return {
    ganttChartData: mergeSegments(ticks),
    metrics: summarize(procs, totalTime),
    processes: procs,
  };
}

// 다음에 도착할 프로세스 시각으로 시간을 건너뛰며 IDLE 구간을 기록한다.
function skipToNextArrival(procs, ticks, time, isPending) {
  const next = Math.min(...procs.filter(isPending).map((p) => p.arrivalTime));
  ticks.push({ processId: 'IDLE', start: time, end: next });
  return next;
}

// FCFS / SJF / Priority(비선점) 공통: 고른 프로세스를 끝까지 실행한다.
function runNonPreemptive(processes, compare) {
  const procs = makeWorkingSet(processes);
  const ticks = [];
  let time = 0;
  let finished = 0;

  while (finished < procs.length) {
    const ready = procs.filter((p) => p.completionTime === null && p.arrivalTime <= time);
    if (ready.length === 0) {
      time = skipToNextArrival(procs, ticks, time, (p) => p.completionTime === null);
      continue;
    }
    const p = ready.sort(compare)[0];
    p.startTime = time;
    p.responseTime = time - p.arrivalTime;
    ticks.push({ processId: p.id, start: time, end: time + p.burstTime });
    time += p.burstTime;
    complete(p, time);
    finished += 1;
  }
  return buildResult(procs, ticks, time);
}

// SRTF / Priority(선점) 공통: 매 틱마다 다시 골라서 1틱씩 실행한다.
function runPreemptive(processes, compare) {
  const procs = makeWorkingSet(processes);
  const ticks = [];
  let time = 0;
  let finished = 0;

  while (finished < procs.length) {
    const ready = procs.filter((p) => p.remainingTime > 0 && p.arrivalTime <= time);
    if (ready.length === 0) {
      time = skipToNextArrival(procs, ticks, time, (p) => p.remainingTime > 0);
      continue;
    }
    const p = ready.sort(compare)[0];
    if (p.startTime === null) {
      p.startTime = time;
      p.responseTime = time - p.arrivalTime;
    }
    ticks.push({ processId: p.id, start: time, end: time + 1 });
    p.remainingTime -= 1;
    time += 1;
    if (p.remainingTime === 0) {
      complete(p, time);
      finished += 1;
    }
  }
  return buildResult(procs, ticks, time);
}

function runRoundRobin(processes, quantum) {
  const procs = makeWorkingSet(processes);
  const arriving = [...procs].sort(byArrival);
  const ticks = [];
  const queue = [];
  let time = 0;
  let finished = 0;
  let arrived = 0;

  const admitArrivals = () => {
    while (arrived < arriving.length && arriving[arrived].arrivalTime <= time) {
      queue.push(arriving[arrived]);
      arrived += 1;
    }
  };

  admitArrivals();
  while (finished < procs.length) {
    if (queue.length === 0) {
      if (arrived >= arriving.length) break; // 더 들어올 게 없으면 종료(방어용)
      ticks.push({ processId: 'IDLE', start: time, end: arriving[arrived].arrivalTime });
      time = arriving[arrived].arrivalTime;
      admitArrivals();
      continue;
    }

    const p = queue.shift();
    if (p.startTime === null) {
      p.startTime = time;
      p.responseTime = time - p.arrivalTime;
    }

    const slice = Math.min(quantum, p.remainingTime);
    for (let i = 0; i < slice; i += 1) {
      ticks.push({ processId: p.id, start: time, end: time + 1 });
      time += 1;
      p.remainingTime -= 1;
      admitArrivals(); // 실행 도중 도착한 프로세스가 큐에서 앞서도록 먼저 넣는다
    }

    if (p.remainingTime === 0) {
      complete(p, time);
      finished += 1;
    } else {
      queue.push(p);
    }
  }
  return buildResult(procs, ticks, time);
}

export default function runScheduler(algorithm, processes, options = {}) {
  if (!processes || processes.length === 0) {
    return buildResult([], [], 0);
  }
  switch (algorithm) {
    case 'sjf': return runNonPreemptive(processes, byBurst);
    case 'priority_np': return runNonPreemptive(processes, byPriority);
    case 'srtf': return runPreemptive(processes, byRemaining);
    case 'priority_p': return runPreemptive(processes, byPriority);
    case 'rr': return runRoundRobin(processes, Number(options.timeQuantum) || 2);
    case 'fcfs':
    default: return runNonPreemptive(processes, byArrival);
  }
}
