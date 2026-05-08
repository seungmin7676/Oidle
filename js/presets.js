/* ============================================================
   presets.js - Demo Process Preset Datasets
   Oidle : Process Scheduling Visualizer
   ============================================================
   각 프리셋은 특정 알고리즘의 장점/특징을 극명히 보여주는
   프로세스 데이터 세트입니다.
   ============================================================ */

'use strict';

const PRESETS = [
  /* ──────────────────────────────────────────────────────────
     FCFS TEST
     - 도착 순서 = 실행 순서 (모든 프로세스가 시간 0에 도착)
     - 긴 작업이 먼저 도착하면 짧은 작업들이 오래 대기 (Convoy Effect)
     - FCFS vs SJF 비교 시 SJF 의 우수성이 두드러짐
  ────────────────────────────────────────────────────────── */
  {
    id:   'fcfs_test',
    name: 'FCFS TEST',
    desc: 'Convoy Effect: 긴 작업 선점으로 짧은 작업 대기 증가',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 10, priority: 3 },
      { id: 'P2', arrivalTime: 0, burstTime:  2, priority: 2 },
      { id: 'P3', arrivalTime: 0, burstTime:  3, priority: 1 },
      { id: 'P4', arrivalTime: 0, burstTime:  1, priority: 2 },
    ],
  },

  /* ──────────────────────────────────────────────────────────
     SJF TEST
     - 다양한 실행 시간, 동시 도착
     - SJF: 짧은 것 먼저 → 평균 대기시간 최소화
     - FCFS 대비 평균 대기시간이 크게 줄어드는 것을 확인 가능
  ────────────────────────────────────────────────────────── */
  {
    id:   'sjf_test',
    name: 'SJF TEST',
    desc: '짧은 작업 우선 처리로 평균 대기시간 최소화',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime:  8, priority: 2 },
      { id: 'P2', arrivalTime: 0, burstTime:  1, priority: 3 },
      { id: 'P3', arrivalTime: 0, burstTime:  4, priority: 1 },
      { id: 'P4', arrivalTime: 0, burstTime:  2, priority: 2 },
      { id: 'P5', arrivalTime: 0, burstTime:  6, priority: 1 },
    ],
  },

  /* ──────────────────────────────────────────────────────────
     SRTF TEST
     - 실행 중에 더 짧은 작업이 도착 → 선점 발생
     - P1(8) 실행 중 P2(2), P3(4) 도착 → P2가 P1 선점
     - SRTF vs SJF(비선점) 비교 시 응답시간/대기시간 차이 극명
  ────────────────────────────────────────────────────────── */
  {
    id:   'srtf_test',
    name: 'SRTF TEST',
    desc: '실행 중 더 짧은 작업 도착 시 선점 → 응답시간 단축',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime:  8, priority: 2 },
      { id: 'P2', arrivalTime: 2, burstTime:  2, priority: 3 },
      { id: 'P3', arrivalTime: 3, burstTime:  4, priority: 1 },
      { id: 'P4', arrivalTime: 5, burstTime:  1, priority: 2 },
    ],
  },

  /* ──────────────────────────────────────────────────────────
     ROUND ROBIN TEST
     - 비슷한 실행시간, 동시 도착 → RR 공정성 부각
     - time quantum = 2 권장
     - 모든 프로세스가 골고루 CPU 시간 획득
  ────────────────────────────────────────────────────────── */
  {
    id:   'rr_test',
    name: 'ROUND ROBIN TEST',
    desc: '모든 프로세스에 공정한 CPU 시간 배분 (quantum=2 권장)',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime:  5, priority: 2 },
      { id: 'P2', arrivalTime: 0, burstTime:  6, priority: 1 },
      { id: 'P3', arrivalTime: 0, burstTime:  4, priority: 3 },
      { id: 'P4', arrivalTime: 0, burstTime:  5, priority: 2 },
      { id: 'P5', arrivalTime: 0, burstTime:  3, priority: 1 },
    ],
  },

  /* ──────────────────────────────────────────────────────────
     PRIORITY TEST
     - 우선순위 차이가 큰 프로세스 혼합
     - 높은 우선순위(낮은 숫자) 프로세스 먼저 처리
     - Priority(선점) vs Priority(비선점) 비교 가능
     - P5(priority=1, 늦게 도착) → 선점 시 즉시 실행
  ────────────────────────────────────────────────────────── */
  {
    id:   'priority_test',
    name: 'PRIORITY TEST',
    desc: '우선순위 차이가 극명한 세트 (선점/비선점 비교 가능)',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime:  6, priority: 3 },
      { id: 'P2', arrivalTime: 0, burstTime:  4, priority: 4 },
      { id: 'P3', arrivalTime: 1, burstTime:  3, priority: 2 },
      { id: 'P4', arrivalTime: 2, burstTime:  5, priority: 5 },
      { id: 'P5', arrivalTime: 3, burstTime:  2, priority: 1 },
    ],
  },

  /* ──────────────────────────────────────────────────────────
     IDLE TIME TEST
     - 프로세스 도착 간격이 커서 IDLE 구간 다수 발생
     - CPU 유휴시간이 시각화에 뚜렷하게 표시됨
     - 모든 알고리즘에서 CPU 이용률 차이 확인 가능
  ────────────────────────────────────────────────────────── */
  {
    id:   'idle_test',
    name: 'IDLE TIME TEST',
    desc: '도착 간격이 커서 CPU 유휴(IDLE) 구간이 명확히 발생',
    processes: [
      { id: 'P1', arrivalTime:  0, burstTime: 3, priority: 2 },
      { id: 'P2', arrivalTime:  8, burstTime: 2, priority: 1 },
      { id: 'P3', arrivalTime: 15, burstTime: 4, priority: 3 },
      { id: 'P4', arrivalTime: 22, burstTime: 1, priority: 2 },
    ],
  },

  /* ──────────────────────────────────────────────────────────
     STARVATION TEST
     - 짧은 작업이 계속 도착하여 긴 작업이 오래 대기
     - SJF/SRTF 에서 P1(burst=20) 이 심각하게 지연됨
     - FCFS 는 P1 을 즉시 실행 (starvation 없음)
  ────────────────────────────────────────────────────────── */
  {
    id:   'starvation_test',
    name: 'STARVATION TEST',
    desc: 'SJF/SRTF 에서 긴 작업(P1)이 짧은 작업들에 계속 밀려 기아 발생',
    processes: [
      { id: 'P1', arrivalTime:  0, burstTime: 20, priority: 3 },
      { id: 'P2', arrivalTime:  1, burstTime:  2, priority: 2 },
      { id: 'P3', arrivalTime:  2, burstTime:  3, priority: 1 },
      { id: 'P4', arrivalTime:  4, burstTime:  1, priority: 2 },
      { id: 'P5', arrivalTime:  6, burstTime:  2, priority: 1 },
    ],
  },
];
