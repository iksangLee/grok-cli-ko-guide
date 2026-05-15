# 05-설정

Grok Build는 여러 가지 설정을 통해 동작 방식을 바꿀 수 있습니다.  
설정은 크게 다음과 같은 곳에서 관리됩니다:

- CLI 옵션 (`--yolo`, `--model` 등)
- 환경 변수
- `~/.grok/config.toml` (가장 많이 사용하는 설정 파일)
- `pager.toml` (화면 표시 관련 설정)

이 문서에서는 실제로 가장 많이 사용하는 **config.toml** 중심으로, 실무에서 알아두면 좋은 설정들을 실용적으로 정리합니다.

---

## 설정의 우선순위 (Precedence)

Grok은 설정을 다음과 같은 순서로 적용합니다. (위에 있을수록 우선순위가 높습니다)

1. **CLI 플래그** (예: `grok --yolo`, `grok --model grok-4`)
2. **환경 변수** (예: `GROK_CODE_XAI_API_KEY`, `GROK_MEMORY`)
3. **`config.toml`** (`~/.grok/config.toml`)
4. **원격 설정** (기업용 배포 환경에서 GrowthBook 등을 통해 관리)
5. **기본값**

즉, `config.toml`에 아무것도 적지 않아도 Grok은 합리적인 기본값으로 동작합니다.  
당신이 정말 바꾸고 싶은 설정만 적으면 됩니다.

---

## config.toml 기본

설정 파일 위치: `~/.grok/config.toml`

파일이 없으면 Grok이 자동으로 생성해주기도 하지만, 직접 만들어도 됩니다.

### 기본 구조

```toml
[cli]
auto_update = true

[models]
default = "grok-build"

[ui]
simple_mode = true

[features]
telemetry = false
codebase_indexing = true
```

각 섹션별로 주요 설정을 정리하겠습니다.

---

## General Settings (일반 설정)

### [cli] 섹션

```toml
[cli]
auto_update = true
```

- `auto_update`: Grok 시작 시 자동으로 업데이트를 확인할지 여부 (기본: `true`)

### [models] 섹션

```toml
[models]
default = "grok-build"                    # 기본 모델
web_search = "grok-4.20-multi-agent"      # 웹 검색에 사용할 모델
```

- `default`: 새로운 세션에서 사용할 기본 모델
- `web_search`: `web_search` 도구가 사용할 모델 (웹 검색 품질에 영향)

### [ui] 섹션

```toml
[ui]
simple_mode = true
max_thoughts_width = 120
```

- `simple_mode`: 간단한 키바인딩 모드 사용 여부 (초보자에게 추천)
- `max_thoughts_width`: Thinking block(사고 과정)의 최대 너비

### [features] 섹션

```toml
[features]
support_permission = false      # 도구 실행 전 항상 권한을 물을지
telemetry = false               # 익명 사용 통계 전송 여부
feedback = false                # 피드백 시스템 사용 여부
lsp_tools = false               # LSP 도구 노출 여부
codebase_indexing = true        # 코드베이스 인덱싱 (코드 그래프) 사용 여부
```

**중요 설정 설명:**

- `support_permission`: `false`로 두면 도구 실행 시 매번 권한을 묻습니다. (안전)
- `codebase_indexing`: `true`로 하면 Grok이 코드베이스를 더 잘 이해할 수 있습니다. (대부분 추천)
- `telemetry`: 사용 통계를 xAI에 보내는 기능입니다. 개인정보가 민감하다면 `false`로 두는 것이 좋습니다.

### [session] 섹션

```toml
[session]
auto_compact_threshold_percent = 85   # 컨텍스트의 몇 %가 차면 자동 압축
load_envrc = true                     # .envrc 파일 자동 로드 여부
```

- `auto_compact_threshold_percent`: 대화가 길어져서 컨텍스트가 85% 이상 차면 자동으로 압축합니다.
- `load_envrc`: 프로젝트 루트에 `.envrc` 파일이 있으면 자동으로 로드합니다. (direnv 사용자에게 유용)

---

## Tool Configuration ([tools])

```toml
[tools]
max_parallel_tools = 5
default_timeout_sec = 60
```

- `max_parallel_tools`: 한 번에 병렬로 실행할 수 있는 도구의 최대 개수
- `default_timeout_sec`: 도구 실행 기본 타임아웃 시간

이 설정은 복잡한 작업을 할 때 Grok이 너무 많은 도구를 동시에 호출하지 않도록 제어하는 데 유용합니다.

---

## Authentication

```toml
[auth]
method = "browser"   # browser | api_key | oidc
```

- `method`: 인증 방식 선택
  - `browser`: 브라우저 로그인 (기본, 가장 편리)
  - `api_key`: 환경 변수나 config에 API 키 직접 입력
  - `oidc`: 기업용 OIDC 인증

API 키를 사용하는 경우:

```toml
[auth]
api_key = "xai-..."   # 또는 환경 변수 GROK_CODE_XAI_API_KEY 사용 권장
```

**권장**: 보안상 API 키는 `config.toml`에 직접 적기보다는 환경 변수로 관리하는 것이 좋습니다.

---

## Custom Models

Grok Build는 기본 모델 외에도 사용자가 직접 모델을 추가해서 사용할 수 있습니다.

```toml
[models.custom]
my-local-model = { type = "openai", base_url = "http://localhost:1234/v1", api_key = "sk-..." }
ollama-llama3 = { type = "ollama", base_url = "http://localhost:11434", model = "llama3" }
```

Custom Models 설정은 11-custom-models.md 문서에서 더 자세히 다룹니다.

---

## MCP Servers (config.toml에서 관리)

MCP 서버는 `config.toml`에서도 설정할 수 있습니다. (이전 가이드에서 다룬 방식)

```toml
[mcp_servers.filesystem]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "/Users/사용자이름/projects"]
enabled = true
startup_timeout_sec = 15
```

- `enabled`: 해당 MCP 서버를 활성화/비활성화
- `startup_timeout_sec`: 서버 시작 대기 시간
- `tool_timeouts`: 특정 도구별 타임아웃 설정 가능

여러 MCP 서버를 관리할 때는 `~/.grok/config.toml` 또는 프로젝트 내 `.grok/config.toml`을 사용하는 것이 좋습니다.

---

## Memory, Subagents, Skills, Plugins 관련 설정

```toml
[memory]
enabled = true
max_memories = 100

[subagents]
max_concurrent = 3
default_timeout = 300

[skills]
paths = ["~/my-custom-skills"]     # 추가 Skill 검색 경로
ignore = ["~/my-custom-skills/wip"]

[plugins]
paths = ["~/my-team-plugins"]
disabled = ["old-plugin-v1"]
```

- `memory`: 장기 기억 기능 관련 설정
- `subagents`: 병렬 하위 에이전트 최대 개수
- `skills`: 추가 Skill 폴더 경로 지정
- `plugins`: Plugin 경로 및 비활성화 설정

이 설정들은 나중에 각 기능 가이드에서 더 자세히 다룹니다.

---


지금까지 다음 내용을 다루었습니다:

- Tool Configuration
- Authentication 설정
- Custom Models
- MCP Servers (config.toml 관리)
- Memory, Subagents, Skills, Plugins 관련 설정

---

## pager.toml (화면 표시 설정)

`pager.toml`은 Grok의 화면 출력 스타일(터미널 UI)을 세밀하게 조정하는 파일입니다.

기본 위치: `~/.grok/pager.toml`

### 주요 설정 영역

```toml
[terminal]
theme = "dark"                    # dark | light | custom
truecolor = true
mouse = true

[animation]
enabled = true
speed = "normal"                  # slow | normal | fast

[prompt]
multiline = true
history_size = 1000

[scrollback]
max_lines = 10000
syntax_highlighting = true
```

### 주요 옵션 설명

- `theme`: 터미널 테마 (dark/light)
- `animation.enabled`: Thinking block이나 도구 실행 시 애니메이션 사용 여부
- `syntax_highlighting`: 코드 블록에 문법 강조 적용
- `history_size`: 프롬프트 입력 히스토리 저장 개수

이 파일은 **개인 취향**에 따라 조정하는 경우가 많습니다. 대부분의 사용자는 기본 설정으로도 충분히 사용합니다.

---

## Environment Variables (환경 변수)

Grok Build는 `config.toml` 외에도 환경 변수를 통해 많은 설정을 제어할 수 있습니다.

### 자주 사용하는 환경 변수

| 환경 변수                        | 설명                                      | 예시 |
|----------------------------------|-------------------------------------------|------|
| `GROK_CODE_XAI_API_KEY`          | API 키 인증 시 사용                       | `xai-...` |
| `GROK_MEMORY`                    | Memory 기능 활성화 여부                   | `true` / `false` |
| `GROK_TELEMETRY`                 | 사용 통계 전송 여부                       | `false` |
| `GROK_DEFAULT_MODEL`             | 기본 모델 지정                            | `grok-build` |
| `GROK_SANDBOX`                   | 샌드박스 모드 강제                        | `true` |
| `GROK_YOLO`                      | YOLO 모드 (자동 승인) 강제                | `true` |
| `GROK_LOG_LEVEL`                 | 로그 레벨 (debug, info, warn, error)      | `debug` |

### 환경 변수 사용 팁

- **API 키**: `GROK_CODE_XAI_API_KEY`를 사용하는 것이 `config.toml`에 직접 적는 것보다 보안상 더 안전합니다.
- **디버깅**: `GROK_LOG_LEVEL=debug`로 설정하면 상세한 로그를 볼 수 있습니다.
- **임시 설정**: 한 번만 다른 설정으로 실행하고 싶을 때 환경 변수를 사용하는 것이 편리합니다.

---

## 실전에서 자주 사용하는 설정 모범 사례

### 1. 개인 개발 환경 추천 설정

```toml
[cli]
auto_update = true

[ui]
simple_mode = true

[features]
support_permission = false
telemetry = false
codebase_indexing = true

[session]
auto_compact_threshold_percent = 80
```

### 2. 팀/회사 환경 추천 설정

```toml
[features]
telemetry = false
support_permission = true          # 보안을 위해 권한 확인 강제
codebase_indexing = true

[session]
load_envrc = false                 # .envrc 자동 로드 비활성화 (보안)
```

### 3. 대규모 프로젝트 환경

```toml
[models]
default = "grok-build"

[features]
codebase_indexing = true
max_thoughts_width = 100

[session]
auto_compact_threshold_percent = 75   # 컨텍스트를 빨리 압축
```

---

## 전체 설정 마무리

Grok Build의 설정은 **필요한 만큼만** 조정하면 됩니다.

- 처음에는 기본 설정으로 충분히 잘 동작합니다.
- 자주 쓰는 기능(Skills, MCP, Plugins 등)을 본격적으로 사용하기 시작하면 그때 필요한 설정을 추가로 조정하는 것이 효율적입니다.
- 보안이 중요한 환경에서는 `support_permission`, `telemetry`, API 키 관리 방식에 특히 신경 쓰는 것이 좋습니다.

필요한 설정은 상황에 따라 점진적으로 추가해 나가면 됩니다.

---

**05-설정.md 끝**

여기까지 Grok Build의 주요 설정 옵션들을 실전 관점에서 정리했습니다.

설정 파일을 너무 복잡하게 만들기보다는, **필요한 기능이 생길 때마다 하나씩 추가**하는 방식으로 관리하는 것을 추천합니다.

이 문서에서 다루지 않은 더 고급 설정(예: Enterprise Deployment, Remote 설정)은 실제 필요할 때 별도로 찾아보시면 됩니다.

---

*이 문서는 원본의 방대한 설정 중에서 실제 사용 빈도가 높은 항목들을 중심으로 재구성하였습니다.*




- Tool Configuration ([tools] 섹션)
- Authentication 설정
- Custom Models (사용자 정의 모델)
- MCP Servers 설정 (config.toml에서)
- Memory, Subagents, Skills, Plugins 관련 설정

---


특히:
- 설명의 난이도가 적당했는지
- 실제로 자주 바꾸는 설정들을 잘 선별했는지
- 다음으로 어떤 섹션을 먼저 다루면 좋을지

