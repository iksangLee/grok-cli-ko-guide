# 17-샌드박스

Grok Build는 AI가 실제로 파일을 읽고, 수정하고, 명령을 실행할 수 있는 강력한 도구입니다.  
하지만 그만큼 **보안 위험**도 존재합니다.

예를 들어, Grok에게 “이 프로젝트를 정리해줘”라고 말했을 때, 실수로 중요한 설정 파일(`.env`, `.ssh/id_rsa`, `.aws/credentials` 등)을 삭제하거나 외부로 유출할 수도 있습니다.

이런 위험을 줄이기 위해 Grok Build가 제공하는 기능이 바로 **Sandbox Mode**입니다.

---

## Sandbox Mode란 무엇인가?

**Sandbox Mode**는 Grok(와 Grok이 실행하는 하위 프로세스)이 파일 시스템과 네트워크에 접근할 수 있는 범위를 **운영체제 커널 수준에서 강제로 제한**하는 보안 기능입니다.

### OS-level Isolation

- Linux: **Landlock** (커널 보안 모듈)
- macOS: **Seatbelt** (App Sandbox와 유사한 메커니즘)

이 두 기술은 **모델(LLM)이 아무리 똑똑해도 우회할 수 없는** 하드웨어/커널 수준의 보안 경계입니다.

쉽게 말해, “Grok이 아무리 노력해도 접근할 수 없는 영역을 미리 만들어 두는 것”입니다.

---

## 왜 Sandbox가 필요한가?

Grok Build는 기본적으로 **Sandbox가 꺼져 있는 상태**입니다. (off)

이 상태에서는 Grok이 사용자의 컴퓨터 전체에 거의 자유롭게 접근할 수 있습니다.

Sandbox를 사용하면 다음과 같은 보호를 받을 수 있습니다:

- 중요한 설정 파일(`.ssh`, `.aws`, `.gnupg` 등) 보호
- 시스템 파일 수정 방지
- 외부 네트워크 접근 제한 (하위 프로세스 기준)
- 악성 코드나 의심스러운 명령 실행 제한

특히 **신뢰할 수 없는 코드**를 분석하거나, **보안이 중요한 프로젝트**에서 Grok을 사용할 때 매우 유용합니다.

---

## Built-in Profiles

Grok Build는 4가지 기본 프로필을 제공합니다.

| Profile         | FS Read          | FS Write                     | Child Network | 주요 용도                     |
|-----------------|------------------|------------------------------|---------------|-------------------------------|
| `off` (기본)    | 전체 허용        | 전체 허용                    | 허용          | 일반 개발                     |
| `workspace`     | 전체 허용        | CWD + /tmp + ~/.grok/        | 허용          | 일상 개발 (추천)              |
| `read-only`     | 전체 허용        | ~/.grok/ 만                  | 차단          | 코드 리뷰, 조사               |
| `strict`        | CWD + 시스템 경로 | CWD + /tmp + ~/.grok/       | 차단          | 신뢰할 수 없는 코드 분석      |

### Profile 상세 설명

**1. `off` (기본)**
- Sandbox가 완전히 비활성화된 상태
- Grok이 파일 시스템과 네트워크에 거의 제한 없이 접근 가능
- 가장 편리하지만, 보안 위험이 가장 큼

**2. `workspace` (일상 개발 추천)**
- **가장 추천하는 프로필**
- 파일은 어디든 읽을 수 있음 (의존성, 시스템 라이브러리 등 분석 가능)
- 쓰기는 현재 작업 디렉토리(CWD), `/tmp`, `~/.grok/`로 제한
- 네트워크 접근은 허용 (web_search, MCP 서버 등)

**3. `read-only`**
- 파일은 읽을 수 있지만, 수정은 `~/.grok/` 폴더로만 가능
- 하위 프로세스의 네트워크 접근 완전 차단
- 코드 리뷰, 기술 스택 조사, 문서 분석 등 **읽기 전용** 작업에 적합

**4. `strict` (최대 격리)**
- 읽기: 현재 작업 디렉토리 + 필수 시스템 경로만
- 쓰기: CWD + /tmp + ~/.grok/ 로 제한
- 네트워크 완전 차단
- **신뢰할 수 없는 코드**를 분석할 때 사용

---

## Sensitive Path Protection (항상 보호되는 경로)

Sandbox 프로필과 관계없이, Grok Build는 다음 경로에 대한 **쓰기 접근을 항상 차단**합니다:

- `~/.ssh/` (SSH 키)
- `~/.aws/` (AWS 인증 정보)
- `~/.gnupg/` (GPG 키)
- `~/.grok/auth/` (Grok 인증 토큰)

이 경로들은 **절대적인 보호**를 받기 때문에, 실수로 중요한 인증 정보가 유출되거나 삭제되는 것을 막아줍니다.

---


지금까지 다음 내용을 다루었습니다:

- Sandbox Mode의 개념 (OS-level isolation)
- 왜 Sandbox가 필요한지
- Built-in Profiles (off, workspace, read-only, strict) 상세 설명
- Sensitive Path Protection (항상 보호되는 경로)

---

## Sandbox 활성화/비활성화 방법

### 1. CLI 옵션으로 활성화 (가장 간단)

```bash
# workspace 프로필 (일상 개발 추천)
grok --sandbox workspace

# read-only 프로필 (조사/리뷰용)
grok --sandbox read-only

# strict 프로필 (최대 격리)
grok --sandbox strict
```

### 2. 환경 변수로 활성화

```bash
export GROK_SANDBOX=workspace
grok

# 또는
export GROK_SANDBOX=read-only
grok
```

### 3. config.toml에서 영구 설정 (추천)

`~/.grok/config.toml`에 아래 내용을 추가하세요:

```toml
[sandbox]
profile = "workspace"   # off | workspace | read-only | strict
```

이 설정은 Grok을 실행할 때마다 자동으로 적용됩니다.

### Sandbox 강제 비활성화

Sandbox를 사용하고 싶지 않을 때는:

```bash
grok --no-sandbox
```

또는 환경 변수:

```bash
export GROK_SANDBOX=off
grok
```

---

## 각 프로필별 실전 사용 예시

### workspace (일상 개발)

**상황**: 평소 프로젝트 개발

```bash
grok --sandbox workspace -p "이 프로젝트의 구조를 분석하고, 개선점을 제안해줘"
```

- 파일은 어디든 읽을 수 있음
- 쓰기는 현재 프로젝트 폴더 + /tmp + ~/.grok/ 로 제한
- 네트워크 접근 허용 (web_search, MCP 등)

**추천 대상**: 대부분의 개발 작업

### read-only (조사/리뷰)

**상황**: 코드 리뷰, 기술 스택 조사, 문서 분석

```bash
grok --sandbox read-only -p "이 프로젝트의 의존성과 아키텍처를 분석해줘"
```

- 파일 읽기 가능
- 쓰기는 ~/.grok/ 폴더로만 제한
- 네트워크 완전 차단 (하위 프로세스 기준)

**추천 대상**: "읽기만 해도 되는" 작업

### strict (최대 격리)

**상황**: 신뢰할 수 없는 코드 분석, 보안 리뷰

```bash
grok --sandbox strict -p "이 코드에 보안 취약점이 있는지 검사해줘"
```

- 읽기: CWD + 필수 시스템 경로만
- 쓰기: CWD + /tmp + ~/.grok/ 로 제한
- 네트워크 완전 차단

**추천 대상**: 외부에서 받은 코드, 보안이 매우 중요한 작업

---

## Sandbox 사용 시 주의할 점과 한계

### 1. Sandbox는 "하드" 보안이지만, 완벽하지는 않음

- Sandbox는 **Grok이 실행하는 프로세스와 하위 프로세스**에만 적용됩니다.
- Grok 자체가 아닌, 사용자가 직접 실행하는 명령어에는 영향을 주지 않습니다.

### 2. network 접근 제한은 "child process" 기준

- `web_search` 도구 자체는 네트워크를 사용할 수 있습니다 (Grok 본체가 처리).
- 하지만 `run_shell`로 실행되는 하위 프로세스는 Sandbox 프로필에 따라 네트워크가 차단될 수 있습니다.

### 3. sensitive path 보호는 "쓰기"만 차단

- `~/.ssh/`, `~/.aws/` 등은 **쓰기**가 차단되지만, **읽기**는 Sandbox 프로필에 따라 가능할 수 있습니다.
- 중요한 인증 정보가 담긴 파일은 읽기조차 하지 않는 것이 가장 안전합니다.

### 4. Sandbox를 켜도 "사용자 실수"는 막을 수 없음

- 사용자가 직접 "rm -rf ~" 같은 명령을 실행하면 Sandbox와 관계없이 실행됩니다.
- Sandbox는 **Grok이 실행하는 작업**에 대한 보호입니다.

---

## Best Practices

### 1. 기본은 `workspace` 프로필 사용

- 일상 개발에서는 `--sandbox workspace` 또는 config.toml에 `profile = "workspace"`를 설정하는 것이 가장 균형이 좋습니다.

### 2. "읽기만 해도 되는" 작업은 `read-only`로

- 코드 리뷰, 기술 조사, 문서 분석 등은 `read-only` 프로필을 적극 활용하세요.

### 3. 신뢰할 수 없는 코드는 `strict`로

- 외부에서 받은 코드, 오픈소스 라이브러리 분석, 보안 리뷰 등은 `strict` 프로필을 사용하세요.

### 4. 중요한 인증 정보는 아예 읽지 않게 하라

- `.env`, `id_rsa`, `.aws/credentials` 같은 파일은 Grok에게 처음부터 보여주지 않는 것이 가장 안전합니다.
- 필요하다면 `--cwd`를 다르게 해서 작업하거나, Sandbox를 `strict`로 설정하세요.

### 5. Sandbox + Tool Filtering 조합

Sandbox와 `--tools` / `--disallowed-tools`를 함께 사용하면 더 강력한 보안을 만들 수 있습니다.

```bash
grok --sandbox strict -p "..." --tools "read_file, grep_search" --disallowed-tools "write_file, run_shell"
```

---


지금까지 Sandbox 활성화 방법, 각 프로필별 실전 예시, 주의할 점, 그리고 Best Practices를 다루었습니다.

---

## Sandbox의 기술적 한계

Sandbox는 강력한 보안 기능을 제공하지만, 완벽한 보호는 아닙니다. 아래는 Sandbox의 기술적 한계를 이해하는 데 도움이 되는 내용입니다.

### Landlock (Linux)과 Seatbelt (macOS)

- **Landlock (Linux)**: Linux 커널 5.13 이상에서 지원되는 보안 모듈로, 프로세스가 접근할 수 있는 파일 시스템 경로를 세밀하게 제한할 수 있습니다.
- **Seatbelt (macOS)**: macOS의 App Sandbox와 유사한 메커니즘으로, 프로세스의 파일 시스템과 네트워크 접근을 제어합니다.

이 두 기술은 **사용자 공간**이 아닌 **커널 공간**에서 동작하기 때문에, Grok(또는 하위 프로세스)이 아무리 노력해도 우회할 수 없습니다.

### Sandbox가 보호하지 못하는 것

- **사용자가 직접 실행하는 명령어**: `rm -rf ~` 같은 명령을 사용자가 직접 실행하면 Sandbox와 관계없이 실행됩니다.
- **Grok 본체의 네트워크 접근**: `web_search` 도구 자체는 네트워크를 사용할 수 있습니다 (Grok 본체가 처리).
- **메모리 기반 공격**: Sandbox는 파일 시스템과 네트워크를 제한하지만, 메모리 기반의 공격(예: side-channel attack)은 막지 못할 수 있습니다.
- **하드웨어 접근**: USB, 블루투스, 카메라 등 하드웨어 장치 접근은 Sandbox 범위 밖입니다.

### Sandbox와 "사용자 책임"

Sandbox는 **Grok이 실행하는 작업**에 대한 보호 장치일 뿐입니다.  
사용자가 직접 위험한 명령을 실행하거나, 중요한 파일을 Grok에게 보여주는 것은 Sandbox로 막을 수 없습니다.

---

## 고급 설정 (Custom Profile, Fine-grained 규칙)

### Custom Profile (고급 사용자)

기본 프로필(off, workspace, read-only, strict) 외에도, 사용자가 직접 세밀한 규칙을 정의할 수 있습니다 (현재는 고급 사용자/개발자向け).

예를 들어, 특정 폴더만 읽기/쓰기 허용하거나, 특정 네트워크만 허용하는 등의 fine-grained 규칙을 만들 수 있습니다.

(이 기능은 현재 개발 중이거나, 고급 설정 파일을 통해 지원될 예정입니다.)

### Fine-grained 규칙 예시 (개념)

```toml
[sandbox]
profile = "custom"

[sandbox.custom]
# 읽기 허용 경로
read = ["/Users/사용자이름/projects", "/usr/local"]

# 쓰기 허용 경로
write = ["/Users/사용자이름/projects/my-app", "/tmp"]

# 네트워크 차단
network = false
```

이런 식으로 세밀하게 제어할 수 있지만, 대부분의 사용자는 기본 프로필로도 충분히 안전하게 사용할 수 있습니다.

---

## Sandbox와 다른 보안 기능의 연동

### Sandbox + Tool Filtering

Sandbox와 `--tools` / `--disallowed-tools`를 함께 사용하면 더 강력한 보안을 만들 수 있습니다.

```bash
grok --sandbox strict -p "..." --tools "read_file, grep_search" --disallowed-tools "write_file, run_shell"
```

- Sandbox로 파일 시스템 접근 자체를 제한하고
- Tool Filtering로 사용할 수 있는 도구까지 제한

이 조합은 **신뢰할 수 없는 코드**를 분석할 때 매우 효과적입니다.

### Sandbox + Hooks

pre-commit Hook에서 Sandbox를 강제로 활성화할 수 있습니다.

```bash
#!/bin/bash
# pre-commit hook 예시
export GROK_SANDBOX=strict
grok -p "이 변경사항을 리뷰하고, 보안 위험이 있는지 알려줘" --yolo
```

### Sandbox + MCP

MCP 서버를 사용할 때도 Sandbox가 적용됩니다.

- Filesystem MCP를 사용할 때는 Sandbox 프로필에 따라 접근 가능한 경로가 제한됩니다.
- `strict` 프로필에서는 MCP 서버도 CWD 외부 파일을 읽거나 쓸 수 없습니다.

---

## 전체 가이드 마무리

`17-샌드박스.md`를 모두 읽었다면, 이제 Grok Build의 **보안** 기능을 이해한 것입니다.

### 핵심 요약

- Sandbox는 **OS-level**에서 Grok의 파일 시스템과 네트워크 접근을 제한합니다.
- `workspace` 프로필은 일상 개발에 가장 추천됩니다.
- `read-only`는 조사/리뷰용, `strict`는 신뢰할 수 없는 코드 분석용입니다.
- 중요한 인증 정보(`.ssh`, `.aws`, `.gnupg`)는 항상 보호됩니다.
- Sandbox + Tool Filtering 조합으로 더 강력한 보안을 만들 수 있습니다.

### Sandbox를 언제 사용하면 좋을까?

- **workspace**: 평소 개발 (기본 추천)
- **read-only**: 코드 리뷰, 기술 조사, 문서 분석
- **strict**: 외부 코드 분석, 보안 리뷰, 중요한 프로젝트

---

**17-샌드박스.md 끝**

여기까지 Grok Build의 Sandbox 기능을 실전 관점에서 정리했습니다.

Sandbox는 Grok Build를 **안전하게** 사용할 수 있게 해주는 가장 중요한 보안 기능 중 하나입니다.

특히 팀 환경이나 중요한 프로젝트에서 Grok을 도입할 때, Sandbox 설정을 제대로 하는 것이 보안의 출발점입니다.

이 문서에서 다루지 않은 더 고급 설정이나 특정 환경에서의 Sandbox 활용법이 필요하시면 언제든 말씀해주세요.

---

*이 가이드는 보안 관점에서 Sandbox를 실무에 도입했던 경험을 바탕으로 작성되었습니다.*


---

## 배경 지식: 이 기능이 왜 이렇게 동작하는가

> **참고**: 이 섹션은 Grok 공식 문서에 명시된 설계 의도를 그대로 설명한 것이 아닙니다.  
> 실제 동작 방식과 관찰, 그리고 논리적 해석을 바탕으로 작성한 **참고용 설명**입니다.  
> xAI에서 공식적으로 발표한 설계 철학이 아니라는 점을 참고해 주세요.

Sandbox Mode가 현재와 같은 형태로 제공되는 이유와 특징을 정리했습니다.

### 1. 왜 Landlock / Seatbelt 같은 OS-level 샌드박스를 사용하나?

Grok은 AI 모델이기 때문에, 사용자가 “이 파일은 절대 건드리지 마”라고 지시해도 실수로 무시할 가능성이 있습니다.  
따라서 모델의 판단과 관계없이 **강제로 접근을 제한**할 수 있는 방법이 필요합니다.

- Linux: Landlock (커널 LSM)
- macOS: Seatbelt

이 두 기술은 **커널 수준**에서 동작하기 때문에, Grok과 Grok이 실행하는 하위 프로세스가 아무리 노력해도 우회하기 어렵습니다. 이것이 “hard security boundary”의 핵심입니다.

### 2. 왜 4개의 프로필(off, workspace, read-only, strict)로 나누었나?

사용자의 작업 상황에 따라 필요한 보안 수준이 다르기 때문입니다.

- `workspace`: 일상 개발에서 가장 균형이 좋음 (읽기는 자유롭게, 쓰기는 현재 작업 디렉토리 + /tmp + ~/.grok/ 만 허용)
- `read-only`: 코드 리뷰나 조사 작업을 할 때 안전하게 사용
- `strict`: 신뢰할 수 없는 코드를 분석할 때 최대한 잠그기
- `off`: 기본값 (편의성을 최우선으로 함)

특히 `workspace` 프로필을 일상적으로 추천하는 이유는, 대부분의 개발 작업에서 “읽기는 많이 하되, 쓰기는 현재 프로젝트에만” 하면 충분하기 때문입니다.

### 3. 왜 .ssh, .aws, .gnupg 같은 경로는 항상 보호하나?

이 경로들은 **프로필 설정과 상관없이** 항상 쓰기가 금지되어 있습니다.

이유는 간단합니다. 이 파일들이 유출되거나 삭제되면 **심각한 보안 사고**로 직결되기 때문입니다.  
Sandbox를 사용하든 사용하지 않든, 최소한 이 민감한 경로만큼은 Grok이 절대 건드리지 못하게 하는 것이 안전합니다.

---

## 디버깅 체크리스트

Sandbox Mode 사용 중 문제가 발생할 때, 아래 순서대로 확인해보세요.

### Sandbox 때문에 작업이 안 될 때 (너무 강하게 막힘)

1. **현재 어떤 프로필을 사용 중인지 확인**
   - `--sandbox strict`를 걸었는데 작업이 안 된다면 → `workspace`나 `read-only`로 낮춰보세요.
   - 특히 외부 MCP 서버나 web_search를 자주 쓰는 경우 `strict`에서는 네트워크가 막혀 불편할 수 있습니다.

2. **필요한 파일이 sensitive path에 있는지 확인**
   - `.env`, `credentials`, `.ssh/config` 등을 읽으려는데 안 되면, 해당 파일이 `~/.ssh/`나 `~/.aws/` 하위에 있지 않은지 확인하세요.

### Sandbox를 켰는데도 중요한 파일이 위험할 때

- Sandbox는 **자식 프로세스** 기준으로 동작합니다.
- 일부 MCP 서버는 별도의 프로세스로 실행되기 때문에, sandbox 설정이 제대로 상속되지 않을 수 있습니다.
- 중요한 작업 전에는 `--sandbox read-only` 또는 `strict`를 사용하는 것을 권장합니다.

### macOS에서 Sandbox가 기대보다 약하게 동작할 때

- macOS 환경에서는 Terminal 앱의 권한 설정(Privacy & Security)에 따라 Sandbox의 효과가 달라질 수 있습니다.
- 예상보다 Sandbox가 약하게 느껴진다면, Terminal 앱의 "Full Disk Access" 권한을 확인해보세요.

### Sandbox를 꺼야 하는 상황

- 로컬 LLM이나 Ollama를 사용하는 경우
- 특정 시스템 파일을 자주 읽어야 하는 작업이 많은 경우
- 개발 서버를 여러 개 띄우는 등 복잡한 로컬 환경

이때는 `--sandbox off` 또는 `config.toml`에서 기본값을 `off`로 두는 것이 좋습니다.

---

이 두 섹션은 Sandbox Mode를 사용할 때 발생하는 문제를 스스로 해결할 수 있도록 돕기 위해 추가되었습니다.

