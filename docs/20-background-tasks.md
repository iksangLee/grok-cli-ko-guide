# 19-백그라운드 작업

Grok Build를 사용하다 보면, 가끔 **오래 걸리는 작업**을 실행해야 할 때가 있습니다.

예를 들어:
- 개발 서버를 띄우고 (`npm run dev`, `rails server`)
- 테스트 스위트를 전체 실행하고 (`npm test`, `pytest`)
- 빌드나 컴파일을 시작하고 (`make build`, `cargo build`)

이런 작업들은 **실행하는 데 몇 초에서 몇 분**이 걸릴 수 있습니다.  
만약 Grok이 이런 작업을 **포그라운드(foreground)**로 실행하면, 그동안 Grok은 다른 일을 할 수 없고, 당신도 기다려야 합니다.

이런 문제를 해결하기 위해 Grok Build가 제공하는 기능이 바로 **Background Tasks**입니다.

---

## Background Tasks란 무엇인가?

**Background Tasks**는 Grok이 **오래 걸리는 작업을 백그라운드(뒤에서)**로 실행하게 해주는 기능입니다.

- 작업은 즉시 시작되고, 처음 10초 정도는 출력이 실시간으로 보입니다.
- 그 이후에는 작업이 백그라운드로 전환되고, Grok은 다른 작업을 계속할 수 있습니다.
- 작업이 끝나면 Grok에게 **알림**이 옵니다.

쉽게 말해, "Grok이 한쪽에서 일을 하고 있는 동안, 당신은 다른 얘기를 할 수 있게 해주는 기능"입니다.

---

## Background Commands (명령을 백그라운드로 실행하기)

### 기본 사용법

Grok이 터미널 명령을 실행할 때, `is_background: true` 옵션을 주면 해당 명령이 백그라운드로 실행됩니다.

(내부적으로는 `run_terminal_cmd` 도구에 `is_background: true`를 전달하는 방식입니다.)

**예시**:

```
개발 서버를 백그라운드로 실행해줘.
```

Grok은 `npm run dev` 같은 명령을 `is_background: true`로 실행합니다.

### 어떻게 동작하나?

1. Grok이 `run_terminal_cmd` 도구를 호출 (with `is_background: true`)
2. 명령이 시작되고, 처음 10초 정도 출력이 보임
3. 10초 후, 명령이 백그라운드로 전환됨
4. Grok은 `task_id`를 받음 (이 ID로 나중에 작업 상태를 확인할 수 있음)
5. 작업이 끝나면 Grok에게 **알림**이 옴

---

## Ctrl+G: Demote to Background (포그라운드 → 백그라운드 전환)

TUI(터미널 UI)에서 작업이 실행되고 있을 때, **Ctrl+G**를 누르면 현재 실행 중인 작업을 **강제로 백그라운드로 전환**할 수 있습니다.

### 언제 Ctrl+G를 사용하면 좋을까?

- 명령이 예상보다 오래 걸릴 때
- Grok에게 다른 질문을 하고 싶을 때
- "이 작업은 오래 걸리겠구나"라고 미리 알게 되었을 때

**예시 상황**:
- `npm install`을 실행했는데, 생각보다 오래 걸림
- `Ctrl+G`를 눌러서 백그라운드로 전환
- Grok에게 "이 프로젝트의 구조를 분석해줘"라고 질문

Grok은 백그라운드 작업을 계속 실행하면서, 당신의 질문에 답변할 수 있습니다.

작업이 끝나면 Grok에게 **알림**이 옵니다.

---

## Background Task 관리

### 작업 상태 확인 (`get_task_output`)

백그라운드 작업의 현재 상태와 출력을 확인하려면 `get_task_output` 도구를 사용합니다.

- `get_task_output(task_id)`: 현재 상태와 출력 확인 (non-blocking)
- `get_task_output(task_id, block=true)`: 작업이 끝날 때까지 기다림
- `get_task_output(task_id, block=true, timeout_ms=30000)`: 최대 30초까지 기다림

**실전 팁**:
- "백그라운드 작업 상태가 어때?"라고 물으면 Grok이 `get_task_output`을 호출합니다.
- `block=true`를 사용하면 작업이 끝날 때까지 기다렸다가 결과를 알려줍니다.

### 작업 종료 (`kill_task`)

백그라운드 작업을 강제로 종료하려면 `kill_task` 도구를 사용합니다.

```bash
kill_task(task_id)
```

- shell 프로세스의 경우: `SIGTERM` → `SIGKILL` 순으로 종료 시도
- Subagent의 경우: `Cancel+Shutdown` 신호 전송

**실전 팁**:
- "백그라운드 작업 중단해줘"라고 하면 Grok이 `kill_task`를 호출합니다.
- 작업이 너무 오래 걸리거나, 더 이상 필요 없을 때 사용하세요.

---

## Common Use Cases (자주 쓰이는 상황)

### 1. 개발 서버 실행

```
개발 서버를 백그라운드로 실행해줘.
```

- `npm run dev`, `rails server`, `python manage.py runserver` 등
- 서버가 실행되는 동안 다른 작업(코드 수정, 테스트 등)을 계속할 수 있음

### 2. 테스트 스위트 실행

```
테스트를 백그라운드로 실행해줘.
```

- `npm test`, `pytest`, `cargo test` 등
- 테스트가 실행되는 동안 다른 파일을 수정하거나, Grok에게 다른 질문을 할 수 있음

### 3. 빌드/컴파일

```
빌드를 백그라운드로 실행해줘.
```

- `make build`, `cargo build`, `npm run build` 등
- 빌드가 끝나면 Grok이 알려줌

### 4. 긴 컴파일 작업

```
이 C++ 프로젝트를 컴파일해줘.
```

- 컴파일이 오래 걸리는 프로젝트에서 특히 유용
- Ctrl+G로 백그라운드 전환 → 다른 작업 계속

---


지금까지 다음 내용을 다루었습니다:

- Background Tasks의 개념
- Background Commands (is_background: true)
- Ctrl+G: Demote to Background
- Background Task 관리 (get_task_output, kill_task)
- Common Use Cases

---

## /loop 명령어 (반복 작업 스케줄링)

`/loop` 명령어는 **특정 작업을 주기적으로 반복**해서 실행하게 해주는 명령어입니다.

### 기본 사용법

```bash
/loop "이 프로젝트의 테스트를 실행해줘" every 30 minutes
/loop "데이터베이스 백업 상태를 확인해줘" every hour
```

- Grok이 지정된 간격마다 자동으로 해당 작업을 실행합니다.
- 작업이 끝나면 결과가 대화에 추가됩니다.

### /loop의 특징

- **지속적 실행**: Grok 세션이 열려 있는 동안 계속 반복됩니다.
- **수동 종료 필요**: `/loop`를 중지하려면 별도로 명령해야 합니다.
- **알림 형태**: 작업 결과가 대화에 메시지로 추가됩니다.

**실전 팁**:
- "30분마다 테스트 실행" 같은 반복적인 모니터링 작업에 유용합니다.
- 하지만 너무 자주 실행하면 Grok의 컨텍스트가 불필요하게 채워질 수 있으니 주의하세요.

---

## monitor 도구 (장시간 실행되는 프로세스 실시간 모니터링)

`monitor` 도구는 **장시간 실행되는 프로세스나 백그라운드 작업을 실시간으로 관찰**할 수 있게 해주는 도구입니다.

### monitor 도구 사용법

```bash
monitor "npm run dev" --persistent true
monitor "tail -f /var/log/app.log" --description "Application log monitor"
```

- `persistent: true`로 설정하면, Grok 세션이 끝나도 모니터링이 계속됩니다.
- `description`을 지정하면, 모니터링의 목적을 명확히 할 수 있습니다.

### monitor 도구의 특징

- **실시간 스트리밍**: 프로세스의 출력이 실시간으로 Grok에게 전달됩니다.
- **지속성**: Grok 세션이 종료되어도 모니터링이 계속될 수 있습니다.
- **설명 추가 가능**: `description`으로 모니터링의 목적을 기록할 수 있습니다.

**실전 팁**:
- 개발 서버(`npm run dev`, `rails server`)를 띄워놓고, 그 출력을 실시간으로 관찰할 때 유용합니다.
- 로그 파일을 `tail -f`로 모니터링하면서, 에러가 발생하면 Grok이 자동으로 알려줄 수 있습니다.

---

## Scheduler 시스템 (cron-like 반복 작업)

Grok Build는 **Scheduler** 시스템을 통해, **cron**처럼 특정 시간에 반복적으로 작업을 실행할 수 있습니다.

### Scheduler 사용법

Scheduler는 `/loop`와 유사하지만, **더 정교한 스케줄링**이 가능합니다.

```bash
/loop "매일 오전 9시에 이 프로젝트의 빌드 상태를 확인해줘" every day at 9am
/loop "매주 월요일에 코드 품질 리포트를 작성해줘" every monday
```

### Scheduler의 특징

- **시간 기반 스케줄링**: "매일", "매주", "특정 시간" 등으로 지정 가능
- **지속성**: Grok 세션이 종료되어도 스케줄러는 계속 동작할 수 있습니다.
- **알림 형태**: 작업 결과가 대화에 메시지로 추가됩니다.

**실전 팁**:
- "매일 아침 9시에 빌드 상태 확인" 같은 정기적인 모니터링 작업에 적합합니다.
- `/loop`보다 더 명확한 시간 지정이 가능합니다.

---

## Background Tasks와 Subagent의 연동

Background Tasks와 Subagent를 함께 사용하면, 더 강력한 자동화가 가능합니다.

### 예시: Subagent + Background Task

```
이 프로젝트의 테스트를 Subagent로 백그라운드에서 실행해줘.
```

Grok이 Subagent를 생성하고, 그 안에서 `is_background: true`로 테스트를 실행할 수 있습니다.

### 예시: monitor + Subagent

```
이 개발 서버를 Subagent로 모니터링하면서, 에러가 발생하면 알려줘.
```

Grok이 Subagent를 생성하고, `monitor` 도구로 서버 출력을 실시간으로 관찰하면서, 에러가 발생하면 메인 세션에 알림을 보낼 수 있습니다.

### 연동의 장점

- **병렬 처리**: 메인 세션은 다른 작업을 하면서, Subagent가 백그라운드 작업을 수행
- **실시간 모니터링**: `monitor` 도구로 Subagent의 작업을 실시간으로 관찰
- **알림**: 작업 완료나 에러 발생 시 메인 세션에 자동으로 알림

---


지금까지 `/loop`, `monitor`, Scheduler 시스템, 그리고 Background Tasks와 Subagent의 연동을 다루었습니다.

---

## Scheduler 상세 설정

Scheduler는 `/loop`보다 더 정교한 스케줄링을 지원합니다.

### cron-like 문법

```bash
/loop "이 프로젝트의 빌드 상태를 확인해줘" every day at 9am
/loop "코드 품질 리포트를 작성해줘" every monday at 10am
/loop "데이터베이스 백업 상태를 체크해줘" every hour
```

- `every day at 9am`: 매일 오전 9시
- `every monday`: 매주 월요일
- `every hour`: 매시간

### durable 옵션

```bash
/loop "..." durable: true
```

- `durable: true`로 설정하면, Grok 세션이 종료되어도 스케줄러가 계속 동작합니다.
- Grok을 다시 시작해도 스케줄이 유지됩니다.

### persistent 옵션

```bash
monitor "npm run dev" --persistent true
```

- `persistent: true`로 설정하면, Grok 세션이 끝나도 모니터링이 계속됩니다.
- 로그 파일을 실시간으로 관찰하는 경우에 유용합니다.

### Scheduler 관리

- `/loop list`: 현재 실행 중인 스케줄러 목록
- `/loop stop <id>`: 특정 스케줄러 중지
- `/loop clear`: 모든 스케줄러 중지

---

## Background Tasks 관련 Best Practices

### 1. Background Task는 "긴 작업"에만 사용하라

- 10초 이내에 끝나는 작업은 포그라운드로 실행하는 것이 오히려 좋습니다.
- Background Task는 "기다리는 동안 다른 일을 하고 싶을 때" 유용합니다.

### 2. Ctrl+G를 적극 활용하라

- 작업이 시작된 후 "이게 오래 걸리겠구나" 싶으면, 바로 `Ctrl+G`로 백그라운드 전환하세요.
- 미리 `is_background: true`를 지정하지 않아도, 실행 중에 전환할 수 있습니다.

### 3. `monitor` 도구는 "지속적인 관찰"에 사용하라

- 개발 서버, 로그 파일, 메시지 큐 등을 실시간으로 관찰할 때 유용합니다.
- `persistent: true`를 사용하면 Grok 세션이 끝나도 모니터링이 계속됩니다.

### 4. Scheduler는 "정기적인 작업"에 사용하라

- 매일 아침 빌드 상태 확인
- 매주 월요일 코드 품질 리포트 작성
- 매시간 데이터베이스 상태 체크

### 5. Subagent와의 연동은 "복잡한 자동화"에 사용하라

- Subagent가 백그라운드 작업을 수행하면서, 메인 세션은 다른 일을 할 수 있습니다.
- `monitor`와 Subagent를 함께 사용하면, Subagent의 작업을 실시간으로 관찰할 수 있습니다.

---

## 자주 발생하는 문제와 해결 방법 (Troubleshooting)

### 1. Background Task가 시작되지 않는다

**증상**: "백그라운드로 실행해줘"라고 했는데, 작업이 포그라운드로 실행됨

**해결**:
- Grok이 `is_background: true`를 제대로 인식했는지 확인
- "백그라운드로 실행해줘"라고 명확히 말하세요.

### 2. Background Task의 결과를 받지 못한다

**증상**: 작업이 끝났는데 알림이 오지 않음

**해결**:
- `get_task_output(task_id, block=true)`를 사용해서 작업이 끝날 때까지 기다려보세요.
- 작업이 너무 오래 걸리면 `timeout_ms`를 늘려보세요.

### 3. `/loop`가 너무 자주 실행된다

**증상**: `/loop`로 설정한 작업이 너무 자주 실행되어 Grok이 바쁨

**해결**:
- 스케줄 간격을 늘리세요 (`every hour` → `every 3 hours`)
- 작업 자체를 가볍게 만드세요.

### 4. `monitor`가 너무 많은 출력을 보여준다

**증상**: `monitor`로 로그를 보고 있는데, 너무 많은 로그가 쌓여서 대화가 지저분함

**해결**:
- `monitor`에 `description`을 지정해서, 어떤 모니터링인지 명확히 하세요.
- 필요할 때만 `monitor`를 사용하고, 끝나면 중지하세요.

### 5. Scheduler가 Grok 세션이 끝난 후에도 동작하지 않는다

**증상**: Grok을 종료했는데, `/loop`나 `monitor`가 중지됨

**해결**:
- `durable: true` 또는 `persistent: true` 옵션을 사용하세요.
- Grok을 다시 시작해도 스케줄이 유지되게 하려면, 이 옵션을 꼭 사용해야 합니다.

---

## 전체 가이드 마무리

`19-백그라운드-작업.md`를 모두 읽었다면, 이제 Grok Build의 **백그라운드 작업과 모니터링** 기능을 이해한 것입니다.

### 핵심 요약

- **Background Commands**: `is_background: true`로 긴 작업을 백그라운드로 실행
- **Ctrl+G**: 실행 중인 작업을 즉시 백그라운드로 전환
- **`/loop`**: 반복적인 작업을 주기적으로 실행
- **`monitor`**: 장시간 실행되는 프로세스를 실시간으로 관찰
- **Scheduler**: cron-like로 정기적인 작업을 자동화
- **Subagent + Background Tasks**: 병렬 처리와 실시간 모니터링의 강력한 조합

### Background Tasks 추천 사용처

- 개발 서버 실행
- 테스트 스위트 실행
- 빌드/컴파일
- 로그 모니터링
- 정기적인 상태 체크
- 병렬 작업 처리

---

**19-백그라운드-작업.md 끝**

여기까지 Grok Build의 Background Tasks와 모니터링 기능을 실전 관점에서 정리했습니다.

이 기능들을 잘 활용하면, Grok이 "한 가지 일만 하는 AI"가 아니라 **여러 일을 동시에 처리할 수 있는 AI**가 됩니다.

특히 CI/CD, 자동화, 모니터링이 중요한 환경에서는 이 기능들이 매우 강력한 도구가 될 것입니다.

이 문서에서 다루지 않은 더 고급 활용법이나 특정 환경에서의 문제 해결이 필요하시면 언제든 말씀해주세요.

---

*이 가이드는 실제 자동화 환경에서 Background Tasks를 활용했던 경험을 바탕으로 작성되었습니다.*


- `/loop` 명령어 (반복 작업 스케줄링)
- `monitor` 도구 (장시간 실행되는 프로세스 실시간 모니터링)
- Scheduler 시스템 (cron-like 반복 작업)
- Background Tasks와 Subagent의 연동

---


---

## 배경 지식: 이 기능이 왜 이렇게 동작하는가

> **참고**: 이 섹션은 Grok 공식 문서에 명시된 설계 의도를 그대로 설명한 것이 아닙니다.  
> 실제 동작 방식과 관찰, 그리고 논리적 해석을 바탕으로 작성한 **참고용 설명**입니다.  
> xAI에서 공식적으로 발표한 설계 철학이 아니라는 점을 참고해 주세요.

Background Tasks 기능이 현재와 같은 형태로 제공되는 배경과 특징을 정리했습니다.

### 1. 왜 10초 후에 자동으로 백그라운드로 보내는가?

Grok이 오래 걸리는 명령을 실행할 때, 처음 10초 동안은 출력이 실시간으로 보이도록 했습니다.

이유는 두 가지입니다:
- 사용자가 "지금 이 작업이 잘 되고 있는지"를 바로 확인할 수 있게 하기 위해
- 10초가 지나면 대부분의 긴 작업(빌드, 테스트, 서버 실행)의 초기 로그가 충분히 나오기 때문

이후에는 Grok이 다른 일을 할 수 있도록 자동으로 백그라운드 전환을 하는 방식으로 동작합니다.

### 2. 왜 Ctrl+G로 수동 demote가 가능한가?

때로는 "이 작업은 백그라운드로 보내고, 지금은 다른 얘기를 하고 싶다"고 판단하는 순간이 있습니다.

이때 **Ctrl+G**를 누르면 현재 실행 중인 포그라운드 작업을 강제로 백그라운드로 보낼 수 있습니다.

이 기능은 사용자가 직접 작업의 실행 방식을 제어할 수 있게 해줍니다.

### 3. 왜 /loop (Scheduler)도 함께 제공하나?

Background Tasks는 "한 번 실행하고 잊기" 위한 기능입니다.  
반면 `/loop`는 **주기적으로 반복** 실행하기 위한 기능입니다 (cron-like).

이 둘을 함께 제공함으로써:
- 일회성 긴 작업 → Background Tasks
- 정기적인 모니터링/빌드 → /loop + Scheduler

라는 명확한 역할 분리를 할 수 있게 했습니다.

---

## 디버깅 체크리스트

Background Tasks 관련 문제가 발생할 때, 아래 순서대로 확인해보세요.

### 백그라운드 작업이 끝났는데도 알림이 안 올 때

1. **monitor 명령어로 상태 확인**
   ```bash
   grok monitor <task_id>
   ```
2. 작업이 실제로 종료되었는지, 아니면 아직 실행 중인지 확인하세요.

### Ctrl+G가 안 먹힐 때

- TUI에서 실제로 포그라운드 작업이 실행 중일 때만 동작합니다.
- 이미 백그라운드 상태이거나, Grok이 입력을 기다리고 있는 상태에서는 무시됩니다.
- Vim mode를 사용 중이라면 `Ctrl+G`가 다른 의미일 수 있으니 Simple mode로 전환해보세요.

### background task가 너무 많이 쌓일 때

- `grok background list` 또는 TUI에서 `Ctrl+G` 후 상태를 확인할 수 있습니다.
- 불필요한 background task는 `grok background kill <id>`로 정리하는 습관을 들이는 것이 좋습니다.

### 개발 서버를 background로 띄웠는데 로그를 보고 싶을 때

- `grok monitor <task_id>`를 사용하면 실시간으로 로그를 볼 수 있습니다.
- 또는 `grok logs <task_id>` 같은 명령으로 과거 로그를 확인할 수 있습니다.

### /loop 스케줄러와 Background Tasks를 혼동할 때

- 한 번만 실행하는 긴 작업 → Background Tasks (`is_background: true`)
- 주기적으로 반복 실행 → `/loop` 또는 Scheduler

이 구분을 명확히 하면 훨씬 편하게 사용할 수 있습니다.

---

이 두 섹션은 Background Tasks와 Scheduler를 사용할 때 발생하는 문제를 스스로 해결할 수 있도록 돕기 위해 추가되었습니다.

