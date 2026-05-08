# Oidle : Process Scheduling Visualizer

*Oidle : 유휴 시간(Idle Time)을 없애자!(O-idle)*

> **유한한 CPU 연산 시간을 효율적으로 재활용하는 프로세스 스케줄링 과정의 시각화**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

---

## 프로젝트 소개

운영체제(OS)에서 프로세스가 생성되고 소멸되는 과정은 **'시간'과 '메모리'라는 자원을 소비하는 과정**이다.  
이미 흘러가 버리면 사라지는 **유휴 시간(Idle Time)** 을 스케줄링 알고리즘을 통해 유의미한 연산 시간으로 전환시키는 과정 자체가 디지털 자원의 선순환이자 재활용이다.

**Oidle**은 이 과정을 웹 기반으로 시각화하여, 유휴 시간 없이 최적의 처리 성능을 구현하는 **디지털 자원 재생산**을 목표로 한다.

---

## 주요 기능

### 1. 프로세스 생성 및 관리
- 이름, 도착 시간, 실행 시간, 우선순위를 직접 입력하여 가상 프로세스 생성
- 프로세스 추가 / 개별 삭제 / 전체 초기화
- **Enter 키**로 빠르게 프로세스 추가 가능

### 2. 예제 데이터 세트 (Preset)
알고리즘별 특성을 극명히 비교할 수 있는 7가지 프리셋 제공:

| 세트 이름 | 핵심 특징 |
|-----------|-----------|
| **FCFS TEST** | Convoy Effect: 긴 작업 선점 시 짧은 작업 대기 급증 |
| **SJF TEST** | 짧은 작업 우선 → 평균 대기시간 최소화 |
| **SRTF TEST** | 실행 중 더 짧은 작업 도착 시 선점 → 응답시간 단축 |
| **ROUND ROBIN TEST** | 모든 프로세스에 공정한 CPU 시간 배분 |
| **PRIORITY TEST** | 우선순위 차이 극명, 선점/비선점 비교 가능 |
| **IDLE TIME TEST** | 도착 간격이 커서 CPU 유휴 구간 다수 발생 |
| **STARVATION TEST** | SJF/SRTF에서 긴 작업이 짧은 작업들에 밀려 기아 발생 |

### 3. 스케줄링 알고리즘 (6종)
| 알고리즘 | 유형 | 설명 |
|----------|------|------|
| **FCFS** | 비선점 | 도착 순서대로 처리 |
| **SJF** | 비선점 | 실행 시간이 가장 짧은 작업 우선 |
| **SRTF** | 선점 | 잔여 시간이 가장 짧은 작업 우선 (매 tick 선점 판단) |
| **Round Robin** | 선점 | 타임 퀀텀(설정 가능) 단위로 순환 실행 |
| **Priority (Non-Preemptive)** | 비선점 | 우선순위 높은 작업 우선 (낮은 숫자 = 높은 우선순위) |
| **Priority (Preemptive)** | 선점 | 더 높은 우선순위 작업 도착 시 즉시 선점 |

### 4. 간트 차트 시각화
- **Chart.js** 기반 가로 막대형 간트 차트
- 각 프로세스에 고유 색상 부여 (인디고, 바이올렛, 시안, 에메랄드 등)
- **IDLE 구간**은 회색으로 명확히 표시
- 툴팁: 구간 시작/종료 시각 및 실행 시간 표시

### 5. 성능 분석 대시보드
시뮬레이션 완료 후 자동 계산 및 표시:

| 지표 | 설명 |
|------|------|
| 평균 대기 시간 | 프로세스들의 대기 시간 평균 |
| 평균 반환 시간 | 도착부터 완료까지 걸린 시간 평균 |
| 평균 응답 시간 | 도착부터 첫 CPU 할당까지 걸린 시간 평균 |
| 총 실행 시간 | 전체 시뮬레이션 소요 시간 |
| CPU 이용률 | 전체 시간 중 CPU 가 실제로 작업한 비율 (%) |
| 처리량 | 단위 시간당 처리된 프로세스 수 |

---

## 프로젝트 구조

```
Oidle/
├── index.html              # 메인 페이지 (전체 UI)
├── css/
│   ├── style.css           # 전체 레이아웃 & 모던 그라데이션 테마
│   ├── dashboard.css       # 성능 분석 대시보드 스타일
│   └── animations.css      # 키프레임 & 애니메이션 정의
└── js/
    ├── presets.js          # 예제 데이터 세트 (7종)
    ├── process.js          # Process 클래스 & ProcessManager
    ├── scheduler.js        # 스케줄링 알고리즘 순수 함수 (6종)
    ├── visualizer.js       # Chart.js 간트 차트 렌더러
    ├── dashboard.js        # 성능 지표 DOM 업데이트
    └── main.js             # 진입점 & 전체 모듈 연결
```

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+, Vanilla) |
| **시각화** | [Chart.js](https://www.chartjs.org/) v4.4.0 (CDN) |
| **폰트** | [Noto Sans KR](https://fonts.google.com/noto/specimen/Noto+Sans+KR) + [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) |
| **레이아웃** | Flexbox / CSS Grid |
| **디자인** | 모던 그라데이션 테마 (인디고-퍼플-시안 팔레트) |
| **빌드 도구** | 없음 (외부 의존성 전부 CDN) |

---

## 실행 방법

별도의 설치 과정 없이 브라우저에서 바로 실행 가능합니다.

```bash
# 저장소 클론
git clone https://github.com/seungmin7676/Oidle.git

# index.html 을 브라우저로 열기
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

> **주의:** Chart.js 및 Google Fonts는 CDN을 통해 로드되므로 **인터넷 연결이 필요**합니다.

---

## 사용 방법

1. **프로세스 추가**  
   - 직접 입력: 이름, 도착 시간, 실행 시간, 우선순위 입력 후 `+ 프로세스 추가` 클릭  
   - 예제 사용: "예제 데이터 세트" 드롭다운에서 원하는 세트 선택 → `예제 데이터 불러오기` 클릭

2. **알고리즘 선택**  
   - 6가지 알고리즘 중 선택  
   - Round Robin 선택 시 타임 퀀텀 값 설정

3. **시뮬레이션 실행**  
   - `▶ 실행` 버튼 클릭  
   - 간트 차트와 성능 분석 대시보드가 즉시 업데이트

4. **결과 비교**  
   - 동일한 프로세스 세트로 알고리즘을 바꿔가며 결과 비교  
   - `? 초기화` 버튼으로 결과 초기화 후 재실행 가능

---

## 모듈 아키텍처

```
index.html
    │
    ├── presets.js    ─── PRESETS[]  (전역 상수)
    ├── process.js    ─── processManager (전역 싱글톤)
    ├── scheduler.js  ─── runScheduler() (순수 함수)
    ├── visualizer.js ─── Visualizer.render() (모듈 패턴)
    ├── dashboard.js  ─── Dashboard.render() (모듈 패턴)
    └── main.js       ─── 전체 이벤트 바인딩 & 흐름 제어
```

**설계 원칙:**
- `scheduler.js` : DOM 접근 **완전 금지**, 순수 함수로만 구성
- `processManager` : 원본 데이터 보호 (`getClonedProcesses()` 제공)
- `Visualizer` / `Dashboard` : IIFE 모듈 패턴으로 네임스페이스 보호
- `main.js` : 전역 변수 최소화, 이벤트 위임 패턴 활용

---

## 라이선스

본 프로젝트는 웹 프로그래밍 과목 프로젝트입니다.

---


