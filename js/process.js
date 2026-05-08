/* ============================================================
   process.js - Process 클래스 & ProcessManager 클래스
   Oidle : Process Scheduling Visualizer
   ============================================================ */

'use strict';

/* ── 프로세스 고유 색상 팔레트 ────────────────────────────────── */
const PROCESS_COLORS = [
  '#6366f1', // 인디고
  '#8b5cf6', // 바이올렛
  '#06b6d4', // 시안
  '#10b981', // 에메랄드
  '#f59e0b', // 앰버
  '#ef4444', // 레드
  '#ec4899', // 핑크
  '#14b8a6', // 틸
];

/* ============================================================
   Process 클래스
   - 스케줄러가 사용하는 프로세스 데이터 단위
   ============================================================ */
class Process {
  /**
   * @param {object} param0
   * @param {string}  param0.id            - 프로세스 이름 (예: "P1")
   * @param {number}  param0.arrivalTime   - 도착 시간 (>= 0)
   * @param {number}  param0.burstTime     - 총 실행 시간 (> 0)
   * @param {number}  param0.priority      - 우선순위 (1 = 가장 높음)
   * @param {string}  param0.color         - 간트 차트 표시 색상
   */
  constructor({ id, arrivalTime, burstTime, priority = 1, color = '#6366f1' }) {
    // ── 식별자 ──────────────────────────────────────────────
    this.id            = String(id);

    // ── 입력값 (불변) ────────────────────────────────────────
    this.arrivalTime   = Number(arrivalTime);
    this.burstTime     = Number(burstTime);
    this.priority      = Number(priority);
    this.color         = color;

    // ── 스케줄링 런타임 상태 ─────────────────────────────────
    this.remainingTime = Number(burstTime);   // 남은 실행 시간 (선점형에서 감소)

    // ── 시간 기록 (스케줄러가 채움) ──────────────────────────
    this.startTime      = null;   // 처음 CPU 할당된 시각
    this.completionTime = null;   // 실행 완료 시각

    // ── 계산 결과 (시뮬레이션 종료 후 산출) ──────────────────
    this.waitingTime    = 0;      // 대기 시간
    this.turnaroundTime = 0;      // 반환 시간
    this.responseTime   = null;   // 응답 시간 (첫 CPU 할당 시 계산)

    // ── 프로세스 상태 ─────────────────────────────────────────
    // 'new' | 'ready' | 'running' | 'waiting' | 'terminated'
    this.state = 'new';
  }

  /* ── 복사본 반환 (원본 보호용) ─────────────────────────────── */
  clone() {
    const copy = new Process({
      id:          this.id,
      arrivalTime: this.arrivalTime,
      burstTime:   this.burstTime,
      priority:    this.priority,
      color:       this.color,
    });
    copy.remainingTime  = this.remainingTime;
    copy.startTime      = this.startTime;
    copy.completionTime = this.completionTime;
    copy.waitingTime    = this.waitingTime;
    copy.turnaroundTime = this.turnaroundTime;
    copy.responseTime   = this.responseTime;
    copy.state          = this.state;
    return copy;
  }

  /* ── 스케줄러 실행 전 상태 초기화 ─────────────────────────── */
  reset() {
    this.remainingTime  = this.burstTime;
    this.startTime      = null;
    this.completionTime = null;
    this.waitingTime    = 0;
    this.turnaroundTime = 0;
    this.responseTime   = null;
    this.state          = 'new';
  }

  /* ── 첫 CPU 할당 시 호출 ────────────────────────────────────── */
  recordFirstRun(currentTime) {
    if (this.startTime === null) {
      this.startTime    = Number(currentTime);
      this.responseTime = this.startTime - this.arrivalTime;
    }
  }

  /* ── 완료 시 호출 ───────────────────────────────────────────── */
  recordCompletion(currentTime) {
    this.completionTime = Number(currentTime);
    this.turnaroundTime = this.completionTime - this.arrivalTime;
    this.waitingTime    = this.turnaroundTime - this.burstTime;
    this.state          = 'terminated';
  }

  /* ── 디버그용 문자열 ─────────────────────────────────────────── */
  toString() {
    return `Process(${this.id} | AT:${this.arrivalTime} BT:${this.burstTime} RT:${this.remainingTime} P:${this.priority} state:${this.state})`;
  }
}


/* ============================================================
   ProcessManager 클래스
   - 프로세스 목록(원본) 관리
   - UI 테이블과 동기화
   ============================================================ */
class ProcessManager {
  constructor() {
    /** @type {Process[]} 원본 프로세스 목록 */
    this._processes = [];

    /** 다음에 추가할 때 사용할 내부 색상 인덱스 */
    this._colorIndex = 0;
  }

  /* ─────────────────────────────────────────────────────────
     addProcess(data)
     - data: { id, arrivalTime, burstTime, priority }
     - 중복 id 허용하지 않음
     - 성공 시 Process 객체 반환, 실패 시 null
  ───────────────────────────────────────────────────────── */
  addProcess({ id, arrivalTime, burstTime, priority = 1 }) {
    // ── 유효성 검사 ──────────────────────────────────────────
    const name = String(id).trim();
    if (!name) {
      console.warn('[ProcessManager] 프로세스 이름이 비어 있습니다.');
      return null;
    }
    if (this._processes.some(p => p.id === name)) {
      console.warn(`[ProcessManager] 이미 존재하는 id: "${name}"`);
      return null;
    }

    const at = Number(arrivalTime);
    const bt = Number(burstTime);
    const pr = Number(priority);

    if (isNaN(at) || at < 0) {
      console.warn('[ProcessManager] 도착 시간은 0 이상의 숫자여야 합니다.');
      return null;
    }
    if (isNaN(bt) || bt <= 0) {
      console.warn('[ProcessManager] 실행 시간은 1 이상의 숫자여야 합니다.');
      return null;
    }
    if (isNaN(pr) || pr < 1) {
      console.warn('[ProcessManager] 우선순위는 1 이상의 숫자여야 합니다.');
      return null;
    }

    // ── 생성 ─────────────────────────────────────────────────
    const color   = PROCESS_COLORS[this._colorIndex % PROCESS_COLORS.length];
    this._colorIndex++;

    const process = new Process({ id: name, arrivalTime: at, burstTime: bt, priority: pr, color });
    this._processes.push(process);

    console.log(`[ProcessManager] 추가됨: ${process.toString()}`);
    return process;
  }

  /* ─────────────────────────────────────────────────────────
     removeProcess(id)
     - 성공 시 true, 없으면 false
  ───────────────────────────────────────────────────────── */
  removeProcess(id) {
    const idx = this._processes.findIndex(p => p.id === String(id));
    if (idx === -1) {
      console.warn(`[ProcessManager] 존재하지 않는 id: "${id}"`);
      return false;
    }
    const removed = this._processes.splice(idx, 1)[0];
    console.log(`[ProcessManager] 삭제됨: ${removed.id}`);
    return true;
  }

  /* ─────────────────────────────────────────────────────────
     updateProcess(id, data)
     - 변경 가능 필드: arrivalTime, burstTime, priority
     - id(이름) 변경은 허용하지 않음
     - 성공 시 수정된 Process 반환, 실패 시 null
  ───────────────────────────────────────────────────────── */
  updateProcess(id, data) {
    const process = this._processes.find(p => p.id === String(id));
    if (!process) {
      console.warn(`[ProcessManager] 존재하지 않는 id: "${id}"`);
      return null;
    }

    if (data.arrivalTime !== undefined) {
      const at = Number(data.arrivalTime);
      if (isNaN(at) || at < 0) {
        console.warn('[ProcessManager] 유효하지 않은 도착 시간.');
        return null;
      }
      process.arrivalTime = at;
    }

    if (data.burstTime !== undefined) {
      const bt = Number(data.burstTime);
      if (isNaN(bt) || bt <= 0) {
        console.warn('[ProcessManager] 유효하지 않은 실행 시간.');
        return null;
      }
      process.burstTime      = bt;
      process.remainingTime  = bt; // 원본 변경 시 remainingTime도 동기화
    }

    if (data.priority !== undefined) {
      const pr = Number(data.priority);
      if (isNaN(pr) || pr < 1) {
        console.warn('[ProcessManager] 유효하지 않은 우선순위.');
        return null;
      }
      process.priority = pr;
    }

    console.log(`[ProcessManager] 수정됨: ${process.toString()}`);
    return process;
  }

  /* ─────────────────────────────────────────────────────────
     getAllProcesses()
     - 원본 배열의 얕은 복사본 반환 (직접 수정 방지)
  ───────────────────────────────────────────────────────── */
  getAllProcesses() {
    return [...this._processes];
  }

  /* ─────────────────────────────────────────────────────────
     getProcess(id)
     - 단일 Process 참조 반환 (없으면 null)
  ───────────────────────────────────────────────────────── */
  getProcess(id) {
    return this._processes.find(p => p.id === String(id)) ?? null;
  }

  /* ─────────────────────────────────────────────────────────
     getClonedProcesses()
     - 스케줄러에 넘길 깊은 복사본 배열 반환
     - 원본 데이터를 보호하여 시뮬레이션 반복 실행 지원
  ───────────────────────────────────────────────────────── */
  getClonedProcesses() {
    return this._processes.map(p => p.clone());
  }

  /* ─────────────────────────────────────────────────────────
     resetAll()
     - 모든 프로세스의 런타임 상태를 초기화
     - 시뮬레이션 재실행 시 호출
  ───────────────────────────────────────────────────────── */
  resetAll() {
    this._processes.forEach(p => p.reset());
    console.log('[ProcessManager] 모든 프로세스 초기화 완료.');
  }

  /* ─────────────────────────────────────────────────────────
     clearAll()
     - 프로세스 목록 전체 삭제
  ───────────────────────────────────────────────────────── */
  clearAll() {
    this._processes = [];
    this._colorIndex = 0;
    console.log('[ProcessManager] 전체 목록 삭제 완료.');
  }

  /* ─────────────────────────────────────────────────────────
     count (getter)
  ───────────────────────────────────────────────────────── */
  get count() {
    return this._processes.length;
  }
}


/* ============================================================
   전역 싱글톤 인스턴스 생성
   - 다른 모듈(main.js, scheduler.js 등)에서 공유
   ============================================================ */
const processManager = new ProcessManager();

/* ── 더미 데이터 로드 (HTML 테이블과 동기화) ─────────────────── */
(function loadDummyData() {
  processManager.addProcess({ id: 'P1', arrivalTime: 0, burstTime: 5, priority: 2 });
  processManager.addProcess({ id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 });
  processManager.addProcess({ id: 'P3', arrivalTime: 2, burstTime: 8, priority: 3 });
})();
