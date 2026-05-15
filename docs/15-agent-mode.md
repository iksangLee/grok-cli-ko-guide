# 14-에이전트 모드 (ACP)

Grok Build는 기본적으로 터미널에서 직접 실행하는 TUI 방식으로 사용합니다.  
하지만 IDE(통합 개발 환경)나 다른 프로그램 안에서 Grok을 사용하고 싶을 때가 있습니다.

이럴 때 사용하는 것이 바로 **Agent Mode**입니다.

---

## Agent Mode란 무엇인가?

**Agent Mode**는 Grok Build를 **ACP(Agent Client Protocol)** 서버로 실행해서, IDE나 에디터, 커스텀 도구와 연동할 수 있게 해주는 모드입니다.

### ACP(Agent Client Protocol)란?

ACP는 AI 에이전트와 클라이언트(IDE, 에디터, 앱) 간의 **표준 통신 규약**입니다.  
JSON-RPC라는 구조화된 메시지 형식을 사용해서 다음과 같은 일을 할 수 있습니다:

- 대화 세션 생성, 불러오기, 이어가기
- 사용자 메시지 전송 및 응답 받기 (스트리밍 포함)
- Grok이 어떤 도구를 사용 중인지 실시간으로 보기
- Grok의 사고 과정(Thinking) 실시간 관찰
- 도구 실행 권한을 실시간으로 승인/거부

쉽게 말해, **Grok을 IDE 안에 "살아있는 AI 페어 프로그래머"로 넣는 방식**입니다.

---

## stdio Transport (가장 흔한 방식)

Agent Mode의 가장 기본적인 실행 방식은 `stdio`입니다.

```bash
grok agent stdio
```

이 명령어를 실행하면 Grok이 JSON-RPC 메시지를 stdin/stdout으로 주고받는 ACP 서버가 됩니다.

### 주로 사용되는 곳

- **Zed** 에디터
- **Neovim** (ACP 플러그인)
- **Emacs** (ACP 지원)
- 기타 ACP를 지원하는 IDE나 커스텀 도구
- ACP 클라이언트 라이브러리를 사용하는 프로그램

### 옵션

```bash
grok agent stdio --model grok-build --yolo
```

- `-m, --model`: 사용할 모델 지정
- `--yolo`: 모든 도구 실행을 자동 승인 (주의 필요)
- `--reauth`: 강제로 재인증 진행

---

## Server Mode (HTTP)

stdio 방식 외에도, HTTP 서버 형태로 Agent Mode를 실행할 수 있습니다.

```bash
grok agent serve --bind 127.0.0.1:2419 --secret my-secret-token
```

### 옵션 설명

- `--bind`: 어떤 주소와 포트로 열지 지정
- `--secret`: 접속 시 필요한 비밀 토큰 (보안용)

이 방식은 네트워크를 통해 여러 클라이언트가 Grok에 접근할 수 있게 해줍니다.  
(예: 팀 내부에서 공유하는 AI 에이전트 서버)

---

## Agent Mode vs Headless Mode

많은 사람들이 혼동하는 부분이 Agent Mode와 Headless Mode의 차이입니다.

| 구분           | Headless Mode                  | Agent Mode (ACP)                     |
|----------------|--------------------------------|--------------------------------------|
| 실행 방식      | 한 번 실행 → 결과 받고 종료    | 지속적으로 실행 (서버 형태)          |
| 통신 방식      | 표준 입출력 (텍스트/JSON)      | JSON-RPC (구조화된 메시지)           |
| 세션 관리      | 제한적                         | 세션 생성/로드/이어하기 완벽 지원    |
| 도구 확인      | 결과에 포함                    | 실시간으로 어떤 도구를 쓰는지 관찰 가능 |
| 권한 처리      | YOLO 또는 사전 승인            | 실시간으로 권한 요청/승인 가능       |
| 주요 용도      | 스크립트, CI/CD, 자동화        | IDE 연동, 실시간 협업                |

**한 줄 요약**:
- **Headless Mode**: "Grok에게 일 시키고 결과 받기"
- **Agent Mode**: "Grok을 항상 켜두고 실시간으로 함께 작업하기"

---

## Agent Mode에서 실제로 어떤 일이 일어나나?

Agent Mode(stdio)로 실행하면, Grok은 JSON-RPC 메시지를 주고받으며 다음과 같은 흐름으로 동작합니다.

### 1. 세션 생성 / 로드

IDE(또는 클라이언트)가 Grok에 연결되면, 먼저 세션을 생성하거나 기존 세션을 로드합니다.

- `session/new`: 새 세션 생성
- `session/load`: 기존 세션 불러오기

### 2. 프롬프트 전송

사용자가 메시지를 입력하면, IDE가 `prompt/send` 요청을 보냅니다.

Grok은 이 프롬프트를 받아서 처리하고, 결과를 스트리밍으로 돌려줍니다.

### 3. 도구 호출 (Tool Call)

Grok이 코드를 읽거나, 파일을 수정하거나, shell 명령을 실행해야 할 때:

- `tool/call` 요청을 IDE 쪽으로 보냄
- IDE는 사용자에게 권한을 물어보거나, 자동으로 승인
- 결과(`tool/result`)를 다시 Grok에게 전달

### 4. 사고 과정 (Thought Stream)

Grok이 생각하는 과정(Thinking Block)을 실시간으로 IDE에 스트리밍할 수 있습니다.

- IDE는 이 사고 과정을 실시간으로 사용자에게 보여줄 수 있음
- "Grok이 지금 무슨 생각을 하고 있는지" 투명하게 관찰 가능

### 5. 세션 종료

연결이 끊기거나, 사용자가 명시적으로 종료하면 세션이 종료됩니다.

---

## Permission Handling (실시간 권한 관리)

Agent Mode의 가장 큰 장점 중 하나는 **도구 실행 권한을 실시간으로 관리**할 수 있다는 점입니다.

### 동작 방식

1. Grok이 `write_file`이나 `run_shell` 같은 도구를 사용하려고 함
2. ACP를 통해 IDE에 권한 요청 메시지 전송
3. IDE가 사용자에게 "이 파일을 수정해도 될까요?"라고 물음
4. 사용자가 승인/거부
5. 결과가 Grok에게 전달됨

### YOLO 모드

```bash
grok agent stdio --yolo
```

`--yolo` 옵션을 사용하면, 모든 도구 실행을 자동으로 승인합니다.

**주의**: 편리하지만 보안상 위험할 수 있으니, 신뢰할 수 있는 환경에서만 사용하세요.

---

## Thought Streams (사고 과정 관찰)

Agent Mode에서는 Grok이 생각하는 과정을 실시간으로 관찰할 수 있습니다.

- "지금 이 파일을 읽고 있음"
- "이 변경을 위해 어떤 접근이 좋을지 고민 중"
- "이전 대화에서 언급된 내용을 참고하고 있음"

이러한 Thought Stream은 IDE에서 "Grok이 지금 무슨 생각을 하고 있는지"를 사용자에게 보여주는 데 사용됩니다.

이는 단순한 결과뿐만 아니라, **과정**까지 투명하게 보여준다는 점에서 Headless Mode와 큰 차이입니다.

---

## 주요 IDE 연동 예시

### Zed

Zed는 ACP를 공식 지원하는 에디터 중 하나입니다.

- Zed 설정에서 Grok Agent를 추가
- `grok agent stdio`를 백엔드로 지정
- Zed 내에서 Grok과 실시간으로 협업 가능

### Neovim

Neovim 사용자들은 ACP 플러그인을 통해 Grok을 연동할 수 있습니다.

- `grok agent stdio` 실행
- Neovim 플러그인이 ACP 클라이언트 역할 수행
- 코드 작성, 리뷰, 리팩터링 등을 Vim 안에서 직접 요청 가능

### Emacs

Emacs에도 ACP 지원 패키지가 있으며, `grok agent stdio`를 백엔드로 연결해서 사용합니다.

### 커스텀 도구

자신만의 IDE나 내부 도구를 만들고 있다면, ACP 클라이언트 라이브러리를 사용해서 직접 `grok agent stdio`와 통신하는 프로그램을 만들 수 있습니다.

---

## Agent Mode 시작하기

### 1. 기본 실행

```bash
grok agent stdio
```

### 2. 특정 모델로 실행

```bash
grok agent stdio -m grok-build
```

### 3. YOLO 모드로 실행 (자동 승인)

```bash
grok agent stdio --yolo
```

### 4. IDE에서 연결

각 IDE(또는 ACP 클라이언트)에서 `grok agent stdio`를 백엔드 프로세스로 지정하면 됩니다.

(자세한 설정 방법은 각 IDE의 ACP 플러그인 문서를 참고하세요.)

---


지금까지 Agent Mode의 실제 동작 흐름, 권한 관리, 사고 과정 관찰, IDE 연동 예시, 그리고 시작 방법을 다루었습니다.

---

## Agent Mode 전체 옵션 정리

Agent Mode에서 사용할 수 있는 주요 옵션들을 정리했습니다.

### 기본 옵션
- `-m, --model <MODEL>`: 사용할 모델 지정 (예: `grok-build`)
- `--yolo`: 모든 도구 실행을 자동으로 승인 (주의 필요)
- `--reauth`: 강제로 재인증 진행

### stdio 모드 전용
- `grok agent stdio`: JSON-RPC를 stdin/stdout으로 통신

### Server Mode (HTTP)
- `grok agent serve --bind <IP:PORT> --secret <TOKEN>`: HTTP 서버로 실행

Agent Mode는 TUI와 달리 **지속적으로 실행**되는 서버 형태이기 때문에, 옵션이 상대적으로 간단합니다.

---

## 고급 설정

### 모델 지정

```bash
grok agent stdio -m grok-4
```

특정 작업에 더 적합한 모델을 사용하고 싶을 때 유용합니다.

### YOLO 모드

```bash
grok agent stdio --yolo
```

모든 도구 실행을 자동으로 승인합니다.  
CI/CD나 자동화 환경에서는 편리하지만, **보안상 중요한 환경에서는 사용을 자제**하는 것이 좋습니다.

### 강제 재인증

```bash
grok agent stdio --reauth
```

인증 토큰이 만료되거나, 다른 계정으로 전환하고 싶을 때 사용합니다.

---

## Agent Mode vs Headless Mode vs TUI 비교

| 구분            | TUI (기본)               | Headless Mode             | Agent Mode (ACP)              |
|-----------------|--------------------------|---------------------------|-------------------------------|
| 실행 형태       | 인터랙티브 전체 화면     | 한 번 실행 → 결과 받고 종료 | 지속 실행 (서버)              |
| 사용자 인터페이스 | 터미널 UI               | 없음 (텍스트/JSON 출력)   | IDE/에디터 UI                 |
| 세션 관리       | 강력                     | 제한적                    | 매우 강력 (ACP 세션)          |
| 도구 확인       | TUI에서 실시간 확인      | 결과에 포함               | 실시간 Thought Stream + Tool Call |
| 권한 처리       | TUI에서 실시간 승인      | YOLO 또는 사전 설정       | 실시간 권한 요청 (IDE)        |
| 주요 용도       | 일상 개발                | 스크립트, CI/CD           | IDE 연동, 실시간 협업         |
| 통신 방식       | -                        | stdout                    | JSON-RPC (ACP)                |

**한 줄 요약**:
- **TUI**: 사람이 직접 대화하며 사용
- **Headless**: 프로그램이 Grok에게 일을 시키고 결과 받음
- **Agent Mode**: IDE/에디터 안에 Grok을 "살아있는 AI"로 넣음

---

## Agent Mode 사용 시 주의할 점과 Best Practices

### 1. YOLO 모드는 신중하게

`--yolo`를 사용하면 IDE에서 매번 권한을 묻지 않습니다.  
편리하지만, 중요한 프로젝트에서는 **의도치 않은 파일 수정**이 발생할 수 있으니 주의하세요.

### 2. 인증 상태 관리

Agent Mode는 장시간 실행되는 경우가 많습니다.  
인증 토큰이 만료되면 `--reauth` 옵션으로 재인증해야 합니다.

### 3. IDE 확장 프로그램 신뢰

Agent Mode는 IDE 확장 프로그램이 `grok agent stdio`를 실행하는 구조입니다.  
신뢰할 수 있는 공식 확장 프로그램만 사용하세요.

### 4. 디버깅 방법

Agent Mode가 제대로 동작하지 않을 때는:

- `grok agent stdio`를 직접 터미널에서 실행해보기 (로그 확인)
- IDE 로그에서 ACP 관련 에러 메시지 확인
- `/inspect` 명령어로 로드된 상태 확인 (TUI에서)

### 5. Best Practices

- Agent Mode는 **실시간 협업**에 최적화되어 있음
- 장시간 실행 시 인증 상태를 주기적으로 확인
- 중요한 작업은 YOLO 모드 대신 권한 확인을 유지
- IDE 확장 프로그램은 공식/검증된 것만 사용

---

## 전체 가이드 마무리

`14-에이전트-모드.md`를 모두 읽었다면, 이제 Grok Build를 **IDE와 깊게 연동**하는 방법을 배운 것입니다.

### 핵심 요약

- **Agent Mode**는 ACP(Agent Client Protocol)를 통해 IDE와 실시간으로 통신합니다.
- `grok agent stdio`가 가장 기본적인 실행 방식입니다.
- Thought Stream, Tool Call, Permission Handling 등을 실시간으로 관찰/제어할 수 있습니다.
- Zed, Neovim, Emacs 등 다양한 에디터에서 활용 가능합니다.

### 언제 Agent Mode를 사용하면 좋을까?

- IDE 안에서 Grok과 **실시간으로 함께 코딩**하고 싶을 때
- 코드 작성, 리뷰, 리팩터링 등을 IDE 안에서 직접 요청하고 싶을 때
- Thought Process(사고 과정)를 투명하게 보고 싶을 때
- Headless 모드보다 더 강력한 세션 관리와 권한 제어가 필요할 때

---

**14-에이전트-모드.md 끝**

여기까지 Grok Build의 Agent Mode를 실전 관점에서 정리했습니다.

Agent Mode는 Grok Build를 단순한 터미널 도구에서 **현대적인 AI-native 개발 환경**의 핵심으로 만들어주는 중요한 기능입니다.

이제 Grok Build의 주요 실행 모드(TUI, Headless, Agent Mode)와 확장 기능(Skills, MCP, Plugins, Hooks, Memory, Project Rules)을 모두 살펴보았습니다.

필요한 부분부터 하나씩 도입하면서, 자신만의 개발 환경을 만들어가시길 응원합니다.

이 문서에서 다루지 않은 더 고급 활용법이나 특정 IDE에서의 연동 방법이 필요하시면 언제든 말씀해주세요.

---

*이 가이드는 ACP를 통한 IDE 연동 경험을 바탕으로 작성되었습니다.*

---

## 배경 지식: 이 기능이 왜 이렇게 동작하는가

> **참고**: 이 섹션은 Grok 공식 문서에 명시된 설계 의도를 그대로 설명한 것이 아닙니다.  
> 실제 동작 방식과 관찰, 그리고 논리적 해석을 바탕으로 작성한 **참고용 설명**입니다.  
> xAI에서 공식적으로 발표한 설계 철학이 아니라는 점을 참고해 주세요.

Agent Mode(ACP)가 현재와 같은 형태로 제공되는 배경과 특징을 정리했습니다.

### 1. 왜 ACP라는 별도의 프로토콜을 만들었나?

IDE나 에디터 안에서 Grok을 사용하려면, 단순한 텍스트 입출력만으로는 부족합니다.  
실시간으로:

- 어떤 도구를 사용하고 있는지 보여줘야 하고 (Tool visibility)
- Grok의 사고 과정을 관찰할 수 있어야 하며 (Thought streams)
- 도구 실행 권한을 실시간으로 승인/거부할 수 있어야 합니다 (Interactive permission handling)

이러한 요구사항을 체계적으로 지원하기 위해 **Agent Client Protocol (ACP)**이라는 표준을 만들었습니다.

### 2. 왜 stdio가 기본이고, Server Mode(HTTP)도 지원하나?

- **stdio**: 가장 간단하고, 별도의 네트워크 설정 없이 바로 사용할 수 있습니다. 대부분의 IDE 연동이 이 방식을 사용합니다.
- **Server Mode (HTTP)**: 여러 클라이언트가 동시에 접속하거나, 원격으로 Grok을 제어하고 싶을 때 유용합니다. (예: 팀 내부 공유 AI 에이전트)

### 3. 왜 Thought Stream과 Tool Call을 실시간으로 노출하나?

Headless 모드에서는 결과만 받지만, Agent Mode에서는 **과정**까지 볼 수 있게 했습니다.  
이를 통해 개발자는 "Grok이 지금 무슨 생각을 하고 있는지", "어떤 파일을 읽고 있는지"를 실시간으로 파악할 수 있어, 신뢰 형성과 디버깅에 도움이 됩니다.

---

## 디버깅 체크리스트

Agent Mode가 제대로 동작하지 않을 때, 아래 순서대로 확인해보세요.

### Agent가 연결되지 않을 때

1. **grok agent stdio**가 정상적으로 실행되는지 터미널에서 직접 테스트
2. IDE의 ACP 플러그인 로그 확인 (Zed, Neovim 등)
3. `grok agent stdio --reauth`로 인증 문제 해결 시도

### 권한 요청이 IDE에 안 보일 때

- Agent Mode에서는 권한 요청이 **IDE 쪽**으로 전달되어야 합니다.
- IDE 설정에서 "Grok Agent" 또는 "ACP" 관련 권한 설정이 올바른지 확인하세요.
- `--yolo`를 사용하면 권한 요청 자체가 발생하지 않습니다.

### Tool이 보이지 않거나 호출되지 않을 때

- Agent Mode에서는 도구 목록이 IDE에 실시간으로 전달됩니다.
- `/inspect` (TUI)나 IDE의 도구 패널에서 어떤 도구가 사용 가능한지 확인하세요.

### Thought Stream이 안 보일 때

- 일부 IDE 플러그인은 Thought Stream을 아직 지원하지 않을 수 있습니다.
- Zed나 최신 ACP 플러그인을 사용하는지 확인하세요.

### 연결이 자주 끊기거나 불안정할 때

- `--reauth`로 인증 토큰을 갱신해보세요.
- Agent Mode는 장시간 실행되는 경우가 많으니, 인증 상태를 주기적으로 확인하는 것이 좋습니다.

---

이 두 섹션은 Agent Mode를 사용할 때 발생하는 문제를 스스로 해결할 수 있도록 돕기 위해 추가되었습니다.

