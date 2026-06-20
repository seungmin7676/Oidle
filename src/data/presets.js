// 알고리즘별 특징이 잘 드러나도록 골라 둔 예제 입력들.
// desc는 드롭다운에서 프리셋을 고르면 힌트로 보여준다.
// algorithm은 해당 예제를 불러올 때 같이 선택해 주는 추천 알고리즘이다.

export const PRESETS = [
  {
    id: 'fcfs_test',
    name: 'FCFS TEST',
    desc: '긴 작업(P1)이 먼저 도착해 짧은 작업들이 줄줄이 기다리는 Convoy Effect',
    algorithm: 'fcfs',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 10, priority: 3 },
      { id: 'P2', arrivalTime: 0, burstTime: 2, priority: 2 },
      { id: 'P3', arrivalTime: 0, burstTime: 3, priority: 1 },
      { id: 'P4', arrivalTime: 0, burstTime: 1, priority: 2 },
    ],
  },
  {
    id: 'sjf_test',
    name: 'SJF TEST',
    desc: 'P1 실행 중에 더 짧은 작업이 도착해도 선점하지 못하는 비선점 특성',
    algorithm: 'sjf',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 8, priority: 2 },
      { id: 'P2', arrivalTime: 1, burstTime: 2, priority: 1 },
      { id: 'P3', arrivalTime: 2, burstTime: 1, priority: 2 },
      { id: 'P4', arrivalTime: 4, burstTime: 4, priority: 3 },
      { id: 'P5', arrivalTime: 6, burstTime: 3, priority: 1 },
    ],
  },
  {
    id: 'srtf_test',
    name: 'SRTF TEST',
    desc: '실행 중 더 짧은 작업이 도착하면 곧바로 선점이 일어난다 (SJF와 비교용)',
    algorithm: 'srtf',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 8, priority: 2 },
      { id: 'P2', arrivalTime: 2, burstTime: 2, priority: 3 },
      { id: 'P3', arrivalTime: 3, burstTime: 4, priority: 1 },
      { id: 'P4', arrivalTime: 5, burstTime: 1, priority: 2 },
    ],
  },
  {
    id: 'rr_test',
    name: 'ROUND ROBIN TEST',
    desc: '뒤늦게 도착한 프로세스가 큐에 끼어들며 CPU를 번갈아 나눠 쓴다 (quantum=2 추천)',
    algorithm: 'rr',
    quantum: 2,
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 6, priority: 2 },
      { id: 'P2', arrivalTime: 2, burstTime: 6, priority: 1 },
      { id: 'P3', arrivalTime: 5, burstTime: 4, priority: 3 },
      { id: 'P4', arrivalTime: 8, burstTime: 4, priority: 2 },
      { id: 'P5', arrivalTime: 11, burstTime: 3, priority: 1 },
    ],
  },
  {
    id: 'priority_test',
    name: 'PRIORITY TEST',
    desc: '우선순위 차이가 큰 세트 — 늦게 온 P5(pri=1)가 선점형에서 바로 끼어든다',
    algorithm: 'priority_p',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 6, priority: 3 },
      { id: 'P2', arrivalTime: 0, burstTime: 4, priority: 4 },
      { id: 'P3', arrivalTime: 1, burstTime: 3, priority: 2 },
      { id: 'P4', arrivalTime: 2, burstTime: 5, priority: 5 },
      { id: 'P5', arrivalTime: 3, burstTime: 2, priority: 1 },
    ],
  },
  {
    id: 'idle_test',
    name: 'IDLE TIME TEST',
    desc: '도착이 끊기는 구간에서 CPU가 노는(IDLE) 모습을 볼 수 있는 세트',
    algorithm: 'fcfs',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 4 },
      { id: 'P2', arrivalTime: 0, burstTime: 2, priority: 1 },
      { id: 'P3', arrivalTime: 12, burstTime: 5, priority: 2 },
      { id: 'P4', arrivalTime: 12, burstTime: 3, priority: 4 },
      { id: 'P5', arrivalTime: 25, burstTime: 2, priority: 1 },
    ],
  },
  {
    id: 'starvation_test',
    name: 'STARVATION TEST',
    desc: '짧은 작업이 계속 끼어들어 긴 P1이 선점형에서 한참 밀리는 기아 현상',
    algorithm: 'srtf',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 15, priority: 4 },
      { id: 'P2', arrivalTime: 1, burstTime: 2, priority: 2 },
      { id: 'P3', arrivalTime: 4, burstTime: 3, priority: 1 },
      { id: 'P4', arrivalTime: 9, burstTime: 2, priority: 3 },
      { id: 'P5', arrivalTime: 13, burstTime: 3, priority: 2 },
    ],
  },
];
