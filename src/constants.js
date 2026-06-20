export const ALGORITHMS = [
  {
    value: 'fcfs',
    label: 'FCFS (선입선출)',
    desc: '도착한 순서대로 처리한다. 구현이 단순하지만 긴 작업이 먼저 오면 뒤의 짧은 작업들이 오래 기다리는 Convoy Effect가 생긴다. (비선점)',
  },
  {
    value: 'sjf',
    label: 'SJF (비선점 최단 작업)',
    desc: '실행 시간이 가장 짧은 작업을 먼저 처리해 평균 대기 시간을 줄인다. 한번 시작하면 끝까지 실행하므로 도중에 더 짧은 작업이 와도 양보하지 않는다. (비선점)',
  },
  {
    value: 'srtf',
    label: 'SRTF (선점 최단 작업)',
    desc: 'SJF의 선점형. 매 순간 남은 실행 시간이 가장 짧은 작업을 고르며, 더 짧은 작업이 도착하면 즉시 선점한다. 긴 작업은 기아에 빠질 수 있다. (선점)',
  },
  {
    value: 'rr',
    label: 'Round Robin',
    desc: '각 작업에 타임 퀀텀만큼 CPU를 돌아가며 공평하게 나눠 준다. 퀀텀이 끝나면 큐 맨 뒤로 보내 응답성을 높인다. 퀀텀 크기가 성능을 좌우한다. (선점)',
  },
  {
    value: 'priority_np',
    label: 'Priority (비선점)',
    desc: '우선순위가 높은(숫자가 작은) 작업을 먼저 처리한다. 실행 중에는 더 높은 우선순위가 와도 양보하지 않는다. (비선점)',
  },
  {
    value: 'priority_p',
    label: 'Priority (선점)',
    desc: '우선순위 기반 선점형. 실행 중이라도 더 높은 우선순위 작업이 도착하면 즉시 CPU를 넘긴다. 낮은 우선순위 작업은 기아에 빠질 수 있다. (선점)',
  },
];

export const ALGORITHM_LABELS = Object.fromEntries(
  ALGORITHMS.map((a) => [a.value, a.label])
);

export const ALGORITHM_DESCRIPTIONS = Object.fromEntries(
  ALGORITHMS.map((a) => [a.value, a.desc])
);
