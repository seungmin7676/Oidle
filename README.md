# Oidle — 프로세스 스케줄링 시각화

*Oidle : 유휴 시간(Idle Time)을 없애자! (O-idle)*

운영체제 수업에서 배우는 CPU 스케줄링 알고리즘들이 실제로 어떻게 동작하는지
간트 차트와 애니메이션으로 직접 보면서 비교할 수 있게 만든 웹 앱이다.
원본 [Oidle](https://github.com/seungmin7676/Oidle) 프로젝트를 React로 다시 구현했다.

라이브 데모: https://seungmin7676.github.io/Oidle

## 만든 이유

프로세스가 CPU를 점유하고 반납하는 과정은 글로만 보면 잘 와닿지 않는다.
특히 선점/비선점의 차이나 Convoy Effect, 기아(starvation) 같은 현상은
같은 입력을 알고리즘만 바꿔서 돌려봐야 체감이 된다.
그래서 프로세스를 직접 넣고 알고리즘을 바꿔가며 간트 차트가 어떻게 달라지는지
눈으로 비교하는 데 초점을 맞췄다.

## 기능

- **프로세스 입력**: 이름·도착 시간·실행 시간·우선순위를 직접 넣어 추가하고, 개별 삭제·전체 초기화 가능
- **예제 세트**: 알고리즘 특징이 잘 드러나는 7가지 프리셋 (Convoy Effect, 기아, 유휴 구간 등)
- **알고리즘 6종**: FCFS, SJF, SRTF, Round Robin(타임 퀀텀 조절), Priority(비선점/선점)
- **간트 차트**: Chart.js 가로 막대. 프로세스별 색상, IDLE 구간은 회색, 구간 정보 툴팁
- **재생 애니메이션**: 재생/일시정지/정지, 1x~16x 속도. 현재 시각 커서가 차트 위를 지나가고,
  각 프로세스의 상태(NEW / READY / RUNNING / DONE)가 실시간으로 바뀐다
- **성능 지표**: 평균 대기·반환·응답 시간, CPU 이용률, 처리량, 프로세스별 상세 결과 표

예를 들어 `FCFS TEST` 세트를 FCFS로 돌리면 평균 대기 시간이 9.25 tick이지만,
같은 입력을 SJF로 바꾸면 2.5 tick으로 줄어드는 걸 바로 확인할 수 있다.

## 폴더 구조

```
src/
├── index.js                  진입점
├── App.js                    상태 관리 (프로세스, 알고리즘, 애니메이션)
├── constants.js              알고리즘 목록/라벨
├── style.css
├── components/
│   ├── Header.js
│   ├── ProcessInputPanel.js  입력 폼 + 프리셋 선택
│   ├── ProcessTable.js       프로세스 목록
│   ├── ControlPanel.js       알고리즘 선택 + 실행
│   ├── ResultPanel.js        간트 차트 섹션
│   ├── GanttChart.js         Chart.js 간트 차트 + 커서
│   ├── AnimationPanel.js     재생 컨트롤 + 상태 그리드
│   ├── DashboardPanel.js     성능 지표
│   └── ProcessResultTable.js 프로세스별 결과 표
├── utils/
│   └── scheduler.js          알고리즘 6종 (순수 함수)
└── data/
    └── presets.js            예제 데이터
```

스케줄링 로직은 비선점(`runNonPreemptive`)·선점(`runPreemptive`)·라운드로빈
세 개의 루프로 정리했고, 알고리즘별 차이는 준비 큐에서 무엇을 먼저 고르느냐
(비교 함수)만 바꿔서 처리한다.

## 기술 스택

React 19 / JavaScript (ES6+) / Chart.js 4 / Create React App.
배포는 GitHub Pages(gh-pages).

## 실행

```bash
npm install
npm start        # http://localhost:3000
```

## 사용법

1. 프로세스를 직접 입력하거나 예제 세트를 불러온다.
2. 알고리즘을 고른다. Round Robin은 타임 퀀텀을 설정한다.
3. `실행`을 누르면 간트 차트와 성능 지표가 갱신된다.
4. `애니메이션 실행`으로 진행 과정을 재생한다.
5. 같은 프로세스 세트로 알고리즘만 바꿔가며 결과를 비교한다.

---

한림대학교 웹 프로그래밍 과목 프로젝트.
