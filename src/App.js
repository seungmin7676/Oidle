import { useState, useEffect, useRef } from 'react';
import { PRESETS } from './data/presets';
import runScheduler from './utils/scheduler';
import Header from './components/Header';
import ProcessInputPanel from './components/ProcessInputPanel';
import ProcessTable from './components/ProcessTable';
import ControlPanel from './components/ControlPanel';
import ResultPanel from './components/ResultPanel';
import AnimationPanel from './components/AnimationPanel';
import DashboardPanel from './components/DashboardPanel';

const PALETTE = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
const colorFor = (index) => PALETTE[index % PALETTE.length];

const EMPTY_FORM = { name: '', arrivalTime: '', burstTime: '', priority: '' };

export default function App() {
  // 처음에는 빈 목록에서 시작한다. (직접 입력하거나 예제를 불러와 채운다)
  const [processes, setProcesses] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [algorithm, setAlgorithm] = useState('fcfs');
  const [quantum, setQuantum] = useState(2);
  const [result, setResult] = useState(null);

  // 애니메이션: idle → playing ⇄ paused → done
  const [animState, setAnimState] = useState('idle');
  const [animTime, setAnimTime] = useState(0);
  const [animSpeed, setAnimSpeed] = useState(4); // 초당 진행 틱 수
  const timerRef = useRef(null);

  // 재생 중일 때 일정 간격으로 현재 시각을 한 틱씩 밀어준다.
  useEffect(() => {
    if (animState !== 'playing' || !result) return undefined;

    const total = result.metrics.totalTime;
    const interval = Math.max(50, Math.round(1000 / animSpeed));
    const id = setInterval(() => {
      setAnimTime((t) => {
        if (t >= total) {
          clearInterval(id);
          setAnimState('done');
          return total;
        }
        return t + 1;
      });
    }, interval);

    timerRef.current = id;
    return () => clearInterval(id);
  }, [animState, animSpeed, result]);

  const stopTimer = () => clearInterval(timerRef.current);

  const resetAnimation = () => {
    stopTimer();
    setAnimState('idle');
    setAnimTime(0);
  };

  // 입력이 바뀌면 이전 결과는 무효가 되므로 같이 비워준다.
  const invalidateResult = () => {
    setResult(null);
    resetAnimation();
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const addProcess = () => {
    const name = form.name.trim();
    const burstTime = Number(form.burstTime);

    if (!name) return setFormError('프로세스 이름을 입력하세요.');
    if (processes.some((p) => p.id === name)) return setFormError(`"${name}" 은 이미 있는 이름입니다.`);
    if (!Number.isFinite(burstTime) || burstTime <= 0) return setFormError('실행 시간은 1 이상이어야 합니다.');

    const next = {
      id: name,
      arrivalTime: Math.max(0, Number(form.arrivalTime) || 0),
      burstTime,
      priority: Number(form.priority) || 1,
      color: colorFor(processes.length),
    };
    setProcesses((prev) => [...prev, next]);
    setForm(EMPTY_FORM);
    setFormError('');
    invalidateResult();
    return undefined;
  };

  const deleteProcess = (id) => {
    setProcesses((prev) => prev.filter((p) => p.id !== id));
    invalidateResult();
  };

  const clearAll = () => {
    setProcesses([]);
    invalidateResult();
  };

  const loadPreset = () => {
    const preset = PRESETS.find((p) => p.id === selectedPreset);
    if (!preset) return;
    setProcesses(preset.processes.map((p, i) => ({ ...p, color: colorFor(i) })));
    // 예제에 맞는 알고리즘(있으면 타임 퀀텀까지)을 같이 골라 준다.
    if (preset.algorithm) setAlgorithm(preset.algorithm);
    if (preset.quantum) setQuantum(preset.quantum);
    setFormError('');
    invalidateResult();
  };

  const run = () => {
    if (processes.length === 0) return;
    setResult(runScheduler(algorithm, processes, { timeQuantum: quantum }));
    resetAnimation();
  };

  const playAnimation = () => {
    if (!result) return;
    setAnimTime(0);
    setAnimState('playing');
  };
  const pauseAnimation = () => { stopTimer(); setAnimState('paused'); };
  const resumeAnimation = () => setAnimState('playing');

  // 간트 차트 위 커서: 정지 상태에서는 숨긴다.
  const cursorTime = animState === 'idle' ? null : animTime;
  const cpuStatus = animState === 'playing' ? 'CPU RUNNING' : 'CPU IDLE';

  return (
    <div className="app-shell">
      <Header status={cpuStatus} />

      <main className="app-main">
        <div className="row row--top">
          <ProcessInputPanel
            form={form}
            error={formError}
            onChange={handleFormChange}
            onAdd={addProcess}
            presets={PRESETS}
            selectedPreset={selectedPreset}
            onSelectPreset={setSelectedPreset}
            onLoadPreset={loadPreset}
          />
          <ProcessTable
            processes={processes}
            onDelete={deleteProcess}
            onClearAll={clearAll}
          />
        </div>

        <div className="row row--control">
          <ControlPanel
            algorithm={algorithm}
            onAlgorithmChange={setAlgorithm}
            quantum={quantum}
            onQuantumChange={setQuantum}
            onRun={run}
            disabled={processes.length === 0}
          />
        </div>

        <div className="row row--dashboard">
          <ResultPanel
            result={result}
            algorithm={algorithm}
            processes={processes}
            currentTime={cursorTime}
          />
          <AnimationPanel
            result={result}
            processes={processes}
            animTime={animTime}
            animState={animState}
            animSpeed={animSpeed}
            onPlay={playAnimation}
            onPause={pauseAnimation}
            onResume={resumeAnimation}
            onStop={resetAnimation}
            onSpeedChange={setAnimSpeed}
          />
          <DashboardPanel result={result} />
        </div>
      </main>
    </div>
  );
}
