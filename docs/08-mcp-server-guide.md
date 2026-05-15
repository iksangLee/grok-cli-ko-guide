# 07-MCP-서버-사용-가이드

Skill을 어느 정도 익히고 나면, 자연스럽게 이런 생각이 들기 시작합니다.

> “Grok이 실제로 내 데이터베이스를 조회하거나, GitHub 이슈를 직접 만들거나, 브라우저를 제어하게 할 수는 없을까?”

이때 필요한 것이 바로 **MCP Servers**입니다.

이 문서는 MCP Servers를 **실제로 설치하고, 안전하게 사용하고, 실무에서 가치 있게 활용**하는 데 집중합니다.

---

## 1. MCP Servers란 무엇인가?

### MCP의 본질

**MCP(Model Context Protocol)**는 Grok Build가 외부의 도구나 서비스와 통신할 수 있게 해주는 **표준 프로토콜**입니다.

쉽게 말해, “Grok이 단순히 말만 하는 AI가 아니라, 실제 도구를 직접 사용할 수 있게 해주는 통로”입니다.

### Claude Code / Cursor와의 가장 큰 차이

Claude Code나 Cursor를 사용해 본 적이 있다면, 모델이 내부적으로 파일을 읽고, shell 명령을 실행하는 모습을 본 적이 있을 것입니다.

하지만 그 방식은 대부분 **모델 내부에 숨겨져** 있습니다.

MCP의 접근 방식은 다릅니다:

| 구분                    | Claude Code / Cursor (기본)       | Grok + MCP Servers                     |
|-------------------------|------------------------------------|----------------------------------------|
| 도구 사용 방식          | 모델이 내부적으로 판단하고 실행    | 명시적으로 MCP 서버를 등록해서 사용    |
| 투명성                  | 어떤 도구를 쓰는지 잘 보이지 않음  | 어떤 MCP 서버가 연결되어 있는지 명확함 |
| 확장성                  | 모델에 따라 지원 여부가 달라짐     | 누구나 MCP 서버를 만들고 공유 가능     |
| 제어권                  | 모델이 알아서 결정                 | 사용자가 어떤 서버를 쓸지 직접 결정    |

MCP의 철학은 **“모델이 모든 걸 알아서 하게 두지 말고, 사용자가 필요한 도구를 직접 연결하게 하자”**입니다.

### MCP로 할 수 있는 일들

- 로컬 파일 시스템 탐색 및 수정
- Git 저장소 직접 조작
- PostgreSQL, MySQL, SQLite 같은 데이터베이스 조회 및 조작
- GitHub, Linear, Notion, Slack 등 외부 서비스 연동
- 브라우저 제어 (Playwright, Puppeteer 기반)
- 터미널 명령 실행 (제한적으로)
- 사내 내부 도구 연동

### MCP의 장점과 단점

**장점**
- 매우 강력한 확장성 (필요한 도구를 얼마든지 붙일 수 있음)
- 표준화되어 있어서 다양한 MCP 서버가 이미 존재함
- 명시적으로 제어할 수 있어서 투명함

**단점**
- 설정이 필요함 (Skill보다 초기 진입 장벽이 있음)
- 보안 위험이 더 크다 (실제 시스템에 접근하기 때문)
- 서버가 죽거나 응답이 느리면 Grok의 응답도 느려질 수 있음

---

## 2. MCP 서버 종류와 선택 기준

MCP 서버는 크게 두 가지 방식으로 동작합니다.

### 1. stdio MCP 서버 (가장 흔함)

- Grok이 자식 프로세스로 MCP 서버를 실행하는 방식
- 가장 많이 사용되는 형태
- 예: `@modelcontextprotocol/server-filesystem`, `@modelcontextprotocol/server-git` 등

**장점**: 설정이 비교적 간단, 로컬에서 바로 실행 가능

**단점**: 서버가 크래시 나면 Grok도 영향을 받음

### 2. HTTP / SSE MCP 서버

- 원격으로 실행되는 MCP 서버에 HTTP나 SSE로 연결하는 방식
- 팀 내부 도구나, 클라우드에서 관리하는 MCP 서버에 유용

**장점**: 원격 제어 가능, 중앙에서 관리하기 좋음

**단점**: 네트워크 지연, 인증 관리 필요

### 처음에 추천하는 MCP 서버 (사용 빈도 순)

| 순서 | MCP 서버 이름                        | 추천 대상 | 난이도 | 추천 이유 |
|------|-------------------------------------|-----------|--------|----------|
| 1    | **Filesystem**                      | 거의 모든 사람 | 하     | 로컬 파일을 직접 탐색할 수 있게 해줌. 가장 기본 |
| 2    | **Git**                             | Git을 자주 쓰는 사람 | 하     | Git 명령을 자연어로 실행할 수 있게 해줌 |
| 3    | **PostgreSQL / SQLite**             | DB를 다루는 사람 | 중     | 실제 데이터를 조회하고 싶을 때 강력 |
| 4    | **GitHub**                          | GitHub을 많이 쓰는 사람 | 중     | 이슈, PR, 코드 검색 등을 직접 할 수 있음 |
| 5    | **Browser (Playwright)**            | 웹 자동화가 필요한 사람 | 중~상 | 브라우저를 직접 제어할 수 있음 |

**추천 전략**:
- 처음에는 **Filesystem MCP** 하나만 설치해서 익혀보세요.
- 그 다음에 **Git MCP**를 추가하는 것이 가장 자연스러운 순서입니다.

---

## 3. 기본 MCP 서버 설정하기

이제 실제로 MCP 서버를 설치하고 연결해보겠습니다.

### MCP 서버를 추가하는 기본 방법

MCP 서버는 주로 `~/.grok/config.toml` 파일에서 관리합니다.

#### 1. Filesystem MCP 서버 추가 (가장 추천하는 첫 시작)

```toml
[mcp_servers.filesystem]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "/Users/당신의-이름/projects"]
```

**설명**:
- `command`: 실행할 명령어 (보통 `npx` 또는 `node`)
- `args`: 실행 인자
- 마지막 인자는 **접근을 허용할 디렉토리 경로**입니다. (보안상 매우 중요)

#### 2. Git MCP 서버 추가

```toml
[mcp_servers.git]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-git", "--repository", "/Users/당신의-이름/projects/원하는-프로젝트"]
```

#### 3. 여러 디렉토리를 허용하고 싶을 때 (Filesystem)

```toml
[mcp_servers.filesystem]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "/Users/당신의-이름/projects", "/Users/당신의-이름/Documents"]
```

### 설정 후 확인하는 방법

1. Grok Build를 재시작 (또는 `/reload` 명령 사용)
2. `Ctrl + L` → **MCP** 탭으로 이동
3. 추가한 MCP 서버가 “Connected” 상태로 보이는지 확인

정상적으로 연결되었다면, 이제 Grok에게 다음과 같이 요청할 수 있습니다:

```
@src/components/UserProfile.tsx 이 파일이 속한 폴더 구조를 알려줘
```

Grok이 실제로 파일 시스템 MCP를 통해 폴더를 탐색해서 답변한다면 성공입니다.

### 처음 설정할 때 자주 발생하는 문제

**1. npx가 설치되어 있지 않음**
- Node.js가 설치되어 있어야 합니다.
- `node -v`와 `npm -v`가 정상적으로 나오는지 확인하세요.

**2. 경로를 잘못 입력함**
- 접근하려는 폴더의 **정확한 절대 경로**를 입력해야 합니다.
- 상대 경로는 동작하지 않습니다.

**3. 서버가 Connected 되지 않고 계속 “Connecting...” 상태**
- 해당 MCP 서버가 실제로 설치되어 있는지 확인 (`npx @modelcontextprotocol/server-filesystem --help`)
- 방화벽이나 보안 프로그램이 프로세스 실행을 막고 있을 수 있습니다.

**4. 보안 경고가 계속 뜸**
- Grok Build는 MCP 서버가 실제 시스템에 접근한다는 것을 인지하고, 처음 연결할 때 경고를 표시합니다.
- 신뢰할 수 있는 서버만 추가하세요.

---

## 4. 실전 MCP 서버 활용 예시

이 섹션에서는 실제로 많은 사람들이 유용하게 쓰는 MCP 서버들을 중심으로, **구체적인 설정 방법과 사용 예시**를 다룹니다.

### 4.1 PostgreSQL MCP 서버

**사용 빈도**: ★★★★★ (데이터를 다루는 프로젝트)

데이터베이스를 직접 조회하고 싶을 때 가장 강력한 MCP입니다.

**설정 예시**

```toml
[mcp_servers.postgres]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-postgres"]
env = { DATABASE_URL = "postgresql://username:password@localhost:5432/mydb" }
```

**실제 사용 예시**

```
users 테이블의 최근 10개 레코드를 created_at 기준으로 내림차순 정렬해서 보여줘
```

```
orders 테이블에서 status가 'pending'인 주문들의 총 금액 합계를 계산해줘
```

**주의사항**
- `DATABASE_URL`에 비밀번호가 직접 들어가기 때문에, **개인용 컴퓨터**에서만 사용하는 것을 추천합니다.
- 팀 공유용으로는 환경변수나 별도 설정 파일을 사용하는 방식을 고려하세요.

---

### 4.2 GitHub MCP 서버

**사용 빈도**: ★★★★☆

GitHub 이슈, PR, 코드 검색 등을 자연어로 하고 싶을 때 매우 유용합니다.

**설정 예시**

```toml
[mcp_servers.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]
env = { GITHUB_PERSONAL_ACCESS_TOKEN = "ghp_xxxxxxxxxxxx" }
```

**실제 사용 예시**

```
이 저장소에서 "bug" 라벨이 붙은 이슈 중 아직 open 상태인 것들을 보여줘
```

```
#123 PR에 대한 리뷰 코멘트들을 요약해줘
```

```
최근에 merge된 PR 중에서 breaking change가 있었던 것들을 찾아줘
```

**Personal Access Token 발급 팁**
- `repo` 권한 (전체 repo 접근)
- `read:org` (조직 정보 읽기)
- `read:user` (사용자 정보 읽기)

필요한 최소 권한만 주는 것을 추천합니다.

---

### 4.3 Browser (Playwright) MCP 서버

**사용 빈도**: ★★★☆

웹사이트를 직접 조작하고 정보를 가져오고 싶을 때 사용합니다.

**설정 예시**

```toml
[mcp_servers.browser]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-playwright"]
```

**실제 사용 예시**

```
https://github.com/leeiksang/_Grok-CLI 이 페이지의 Star 수와 최근 커밋 3개를 추출해줘
```

```
현재 페이지에서 "로그인" 버튼이 어디에 있는지 좌표와 함께 설명해줘
```

**주의사항**
- 브라우저 MCP는 리소스를 상당히 많이 사용합니다.
- 헤드리스 모드로 실행되는 경우가 많아서, 시각적으로 확인하기 어려울 수 있습니다.

---

### 4.4 기타 유용한 MCP 서버들

- **SQLite MCP**: 가벼운 로컬 DB 작업에 좋음
- **Filesystem (고급)**: 여러 디렉토리를 동시에 제어하고 싶을 때
- **Linear MCP**: 이슈 트래킹을 자동화하고 싶을 때
- **Slack / Discord MCP**: 알림 자동화

필요에 따라 하나씩 추가하면서 익히는 것을 추천합니다.

---

## 5. 여러 MCP 서버를 체계적으로 관리하기

MCP 서버를 3~4개 이상 사용하게 되면, `config.toml`이 지저분해지고 관리가 어려워집니다.

### 추천하는 관리 방식

#### 1. 의미 있는 이름으로 구분하기

```toml
[mcp_servers."project-db"]
[mcp_servers."github-main"]
[mcp_servers."browser-automation"]
```

#### 2. 환경변수를 적극 활용하기

비밀번호, 토큰 등 민감한 정보는 환경변수로 분리하는 것이 좋습니다.

```toml
[mcp_servers.postgres]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-postgres"]
env = { DATABASE_URL = "$DATABASE_URL" }
```

#### 3. 프로젝트별로 다른 MCP 세트를 사용하고 싶을 때

Grok Build는 `--cwd`로 실행할 때 해당 디렉토리의 `.grok/config.toml`을 우선적으로 읽습니다.

프로젝트 루트에 `.grok/config.toml`을 만들면, 그 프로젝트에서만 특정 MCP 서버를 사용할 수 있습니다.

---

## 6. 보안과 권한 관리

MCP 서버는 **실제 시스템에 접근**하는 만큼, 보안에 대한 이해가 매우 중요합니다.

### 가장 중요한 원칙: 최소 권한 원칙

- Filesystem MCP를 추가할 때는 **필요한 폴더만** 정확히 지정하세요.
- GitHub 토큰은 **필요한 최소 권한**만 부여하세요.
- 데이터베이스 접속 계정은 **읽기 전용** 계정을 별도로 만드는 것을 강력 추천합니다.

### 위험한 상황들

- 전체 홈 디렉토리를 Filesystem MCP로 열어두는 경우
- 관리자 권한 DB 계정을 그대로 MCP에 연결하는 경우
- 개인 Access Token을 Git에 커밋하는 경우

### 실무에서 추천하는 안전한 패턴

1. **개인 프로젝트** → 비교적 자유롭게 사용
2. **팀/회사 프로젝트** → 
   - 읽기 전용 DB 계정 사용
   - GitHub은 Fine-grained Personal Access Token 사용
   - 중요한 폴더는 Filesystem MCP에서 제외

3. **보안이 매우 중요한 프로젝트** → MCP 서버 사용 자체를 최소화하거나 사용하지 않음

Grok Build는 MCP 서버가 연결될 때마다 사용자에게 경고를 보여주지만, **최종 책임은 사용자에게** 있습니다.

---


지금까지 실전에서 가장 많이 쓰이는 MCP 서버들의 구체적인 활용 방법과, 여러 MCP 서버를 안전하고 체계적으로 관리하는 방법을 다루었습니다.

---

## 7. MCP 서버 보안 심화

MCP 서버는 Grok Build 확장 기능 중에서 **보안 위험이 가장 높은** 부분입니다. 왜냐하면 실제로 파일 시스템, 데이터베이스, 외부 서비스에 접근할 수 있기 때문입니다.

### 실제로 발생할 수 있는 위험 사례

**1. 과도한 파일 시스템 접근**
- Filesystem MCP를 홈 디렉토리 전체에 열어둔 경우
- Grok이 실수로 중요한 설정 파일(`.env`, `id_rsa`, `.aws/credentials` 등)을 읽거나 수정할 수 있음

**2. 데이터베이스 권한 남용**
- 관리자 권한(`superuser`) 계정으로 PostgreSQL MCP를 연결한 경우
- Grok이 실수로 테이블을 삭제하거나, 대량의 데이터를 유출할 수 있음

**3. Personal Access Token 유출**
- GitHub Token을 `config.toml`에 하드코딩한 상태에서, 해당 파일을 실수로 커밋하거나 공유한 경우

**4. 브라우저 MCP를 통한 정보 유출**
- 로그인된 브라우저 세션을 MCP가 제어하는 경우, 쿠키나 세션 정보를 탈취당할 위험이 있음

### 안전한 MCP 사용을 위한 실전 가이드

**1. 최소 권한 원칙 철저히 지키기**
- Filesystem MCP → 필요한 폴더만 정확히 지정
- Database MCP → 읽기 전용 계정(`SELECT` 권한만) 사용
- GitHub MCP → 필요한 최소 권한의 Fine-grained Token 사용

**2. 민감 정보는 절대 하드코딩하지 않기**
```toml
# 나쁜 예
env = { DATABASE_URL = "postgresql://admin:SuperSecret123@localhost:5432/prod" }

# 좋은 예
env = { DATABASE_URL = "$PROD_DB_URL" }
```
환경변수나 별도 `.env` 파일을 사용하는 습관을 들이세요.

**3. 정기적으로 MCP 서버 목록 점검하기**
- 3~4개월에 한 번씩, “지금 연결된 MCP 서버 중에 정말 필요한 게 뭐지?”를 확인하세요.
- 사용하지 않는 MCP 서버는 과감하게 제거하세요.

**4. 중요한 프로젝트에서는 사용을 최소화하기**
- 회사 내부의 핵심 프로젝트나, 고객 데이터가 많이 있는 프로젝트에서는 MCP 서버 사용 자체를 최소화하거나 사용하지 않는 것을 추천합니다.

---

## 8. 커스텀 MCP 서버 만들기 (고급)

기존에 공개된 MCP 서버로 부족한 경우, 직접 MCP 서버를 만들 수 있습니다.

### 커스텀 MCP 서버를 만들게 되는 전형적인 상황

- 회사 내부 API와 연동하고 싶을 때
- 사내 데이터베이스 스키마에 최적화된 도구를 만들고 싶을 때
- 특정 업무 프로세스를 자동화하는 전용 도구가 필요할 때

### MCP 서버 개발 개요

MCP 서버는 기본적으로 두 가지 방식으로 개발할 수 있습니다:

1. **TypeScript/Node.js** (가장 추천)
   - `@modelcontextprotocol/sdk`를 사용
   - 공식 예제가 가장 잘 되어 있음

2. **Python**
   - `mcp` 패키지를 사용

### 간단한 커스텀 MCP 서버 예시 (TypeScript)

기본 구조는 다음과 같습니다:

```ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "my-company-api",
  version: "1.0.0",
});

server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "get_employee_info",
      description: "사원 정보를 조회합니다.",
      inputSchema: { /* ... */ }
    }
  ]
}));

server.setRequestHandler("tools/call", async (request) => {
  // 실제 API 호출 로직
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

커스텀 MCP 서버 개발은 이 가이드의 범위를 벗어나는 고급 주제이므로, 필요할 때 공식 문서와 예제를 참고하는 것을 추천합니다.

---

## 9. 자주 발생하는 문제와 해결 방법 (Troubleshooting)

### MCP 서버가 Connected 되지 않을 때

**증상**: MCP 탭에서 서버가 계속 "Connecting..." 또는 "Error" 상태

**해결 방법**:
1. `npx`로 해당 패키지가 정상 실행되는지 터미널에서 직접 테스트
   ```bash
   npx -y @modelcontextprotocol/server-filesystem /path/to/folder
   ```
2. Node.js 버전 확인 (Node 18 이상 권장)
3. 해당 폴더에 대한 읽기 권한이 있는지 확인

### Grok이 MCP 서버를 사용하지 않을 때

**증상**: MCP 서버는 연결되어 있는데, Grok이 파일 시스템이나 DB를 사용하지 않음

**해결 방법**:
- 프롬프트에서 **명시적으로** 요청해야 합니다.
  - 나쁜 예: “이 프로젝트 분석해줘”
  - 좋은 예: “Filesystem MCP를 사용해서 이 프로젝트의 폴더 구조를 분석해줘”

### MCP 서버 응답이 너무 느릴 때

- MCP 서버 자체가 무거운 작업을 하고 있을 수 있음 (예: 큰 데이터베이스 조회)
- 네트워크 지연 (HTTP MCP의 경우)
- 해결: 타임아웃 설정을 조정하거나, 불필요한 MCP 서버를 일시적으로 비활성화

---

## 10. Best Practices 정리

- **처음에는 Filesystem MCP 하나만**으로 시작하세요.
- **읽기 전용** 계정과 토큰을 최대한 활용하세요.
- **config.toml**은 의미 있는 이름으로 정리하고, 환경변수를 적극 사용하세요.
- **사용하지 않는 MCP 서버**는 과감하게 제거하세요.
- **보안이 중요한 프로젝트**에서는 MCP 사용을 최소화하거나 하지 마세요.
- **정기적으로** 연결된 MCP 서버 목록을 점검하세요.

---

## 11. 다음 단계

`07-MCP-서버-사용-가이드.md`를 모두 읽으셨습니다.

이제 Skill과 MCP Servers를 어느 정도 사용할 수 있게 되었다면, 다음으로 추천하는 확장 기능은 **Plugins & Marketplace**입니다.

### 추천 학습 순서 (최종)

1. **Skills** — 완료
2. **MCP Servers** — 완료
3. **Plugins & Marketplace** — 팀 단위 표준화
4. **Hooks** — 이벤트 기반 자동화 (가장 신중하게)

### 다음에 읽을 문서 추천

- **09-플러그인과-마켓플레이스** (준비 중)
  - 여러 Skill과 MCP 서버를 하나로 묶어서 팀과 공유하는 방법
  - Marketplace를 통해 다른 사람의 플러그인을 활용하는 방법

---

**07-MCP-서버-사용-가이드.md 끝**

여기까지 읽어주셔서 감사합니다.

MCP Servers는 Grok Build를 “말 잘하는 AI”에서 “실제로 일을 할 수 있는 AI”로 만들어주는 가장 강력한 확장 기능입니다.

다만 그만큼 **책임도 큽니다**. 
설정 하나, 권한 하나가 보안 사고로 이어질 수 있다는 점을 항상 기억하고, 신중하게 사용하시기 바랍니다.

MCP 서버를 설정하다가 막히거나, 보안 관련해서 더 구체적인 조언이 필요하시면 언제든 말씀해주세요.

---

*이 가이드는 실제 사용 경험과 보안 관점을 반영하여 작성되었습니다.*
---

## 공식 명령어 & 고급 기능 (참고)

이 가이드에서는 실전 사용에 초점을 맞췄지만, 아래 공식 기능들도 알아두면 도움이 됩니다.

### `grok mcp` CLI

MCP 서버를 TUI 없이 명령줄에서 관리할 수 있는 강력한 도구입니다.

**주요 명령어**:

```bash
# 현재 등록된 MCP 서버 목록 확인
grok mcp list
grok mcp list --json

# stdio MCP 서버 추가
grok mcp add my-filesystem \
  --command npx \
  --args "-y @modelcontextprotocol/server-filesystem /Users/사용자이름/projects"

# HTTP MCP 서버 추가
grok mcp add my-github \
  --url https://mcp.example.com/api \
  --env GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxx

# MCP 서버 제거
grok mcp remove my-filesystem
```

**장점**:
- 스크립트나 CI/CD에서 MCP 서버를 자동으로 관리할 수 있음
- TUI를 열지 않고도 빠르게 추가/삭제 가능

### Tool Naming (도구 이름 규칙)

MCP 서버의 도구들은 **서버 이름으로 네임스페이스**가 붙습니다.

예:
- `filesystem` 서버의 `read_file` 도구 → `filesystem__read_file`
- `github` 서버의 `create_issue` 도구 → `github__create_issue`

이 규칙을 알면 여러 MCP 서버를 동시에 사용할 때 어떤 도구가 어디서 왔는지 쉽게 구분할 수 있습니다.

### Live Toggle (`/mcps`)

TUI에서 `Ctrl + L` → MCP 탭으로 들어가면, 실행 중에도 MCP 서버를 켜고 끌 수 있습니다.

- `e` 키: 선택한 MCP 서버 활성화/비활성화
- `r` 키: 전체 MCP 서버 새로고침

이 기능은 특정 상황에서만 MCP 서버를 임시로 켜고 싶을 때 매우 유용합니다.

---

이 섹션은 참고용으로 작성되었습니다. 실제 사용 시에는 `grok mcp` CLI와 `/mcps` 모달을 적극 활용해보세요.


---

## 배경 지식: 이 기능이 왜 이렇게 동작하는가

> **참고**: 이 섹션은 Grok 공식 문서에 명시된 설계 의도를 그대로 설명한 것이 아닙니다.  
> 실제 동작 방식과 관찰, 그리고 논리적 해석을 바탕으로 작성한 **참고용 설명**입니다.  
> xAI에서 공식적으로 발표한 설계 철학이 아니라는 점을 참고해 주세요.

MCP 서버 시스템이 현재와 같은 형태로 동작하는 배경과 특징에 대해 정리했습니다.

### 1. 왜 MCP 서버를 명시적으로 등록해야 하나?

Grok이 외부 도구를 사용하려면, 어떤 프로세스를 실행하고 어떤 도구를 제공하는지를 명확하게 정의해야 합니다.  
그래서 `config.toml`이나 `grok mcp add` 명령어를 통해 MCP 서버를 직접 등록하는 방식을 사용합니다.

이 방식의 장점은 다음과 같습니다:

- 어떤 MCP 서버가 현재 활성화되어 있는지 투명하게 확인할 수 있음
- 문제가 있거나 위험한 MCP 서버를 쉽게 비활성화하거나 제거할 수 있음
- 프로젝트별로 필요한 MCP 서버만 선택적으로 구성할 수 있음

### 2. 왜 Tool Naming에 `server__tool` 형태를 쓰나?

여러 MCP 서버를 동시에 사용할 경우, 도구 이름이 충돌할 가능성이 있습니다.  
예를 들어 `filesystem` 서버와 `github` 서버가 모두 `read_file`이라는 도구를 가지고 있을 수 있습니다.

Grok은 이를 구분하기 위해 도구 이름을 자동으로 `서버이름__도구이름` 형태로 네임스페이싱합니다.  
(`filesystem__read_file`, `github__create_issue` 등)

이 규칙 덕분에 여러 MCP 서버를 함께 사용할 때도 어떤 도구가 어디에서 왔는지 명확하게 구분할 수 있습니다.

### 3. 왜 Trust(신뢰) 확인 과정이 존재하나?

MCP 서버는 파일 시스템 접근, 외부 API 호출, 데이터베이스 쿼리 등 실제로 강력한 권한을 가진 도구를 제공할 수 있습니다.  
따라서 Grok은 기본적으로 모든 MCP 서버를 무조건 신뢰하지 않고, 사용자가 직접 신뢰 여부를 결정할 수 있도록 설계되어 있습니다.

특히 프로젝트 루트에 `.mcp.json` 파일이 있거나, Plugin을 통해 MCP 서버가 추가되는 경우에도 별도의 신뢰 확인 과정을 거치게 됩니다. 이는 보안상 중요한 MCP 서버가 무단으로 실행되는 것을 방지하기 위한 장치입니다.

---

## 디버깅 체크리스트

MCP 서버가 제대로 동작하지 않을 때, 아래 순서대로 확인해보세요.

### MCP 서버가 Connected 되지 않을 때

1. **해당 MCP 서버가 실제로 실행 가능한지 확인**
   ```bash
   npx -y @modelcontextprotocol/server-filesystem /path/to/folder
   ```
   - 위 명령어가 직접 실행되지 않으면, npx나 Node.js 환경 문제일 가능성이 높습니다.

2. **경로가 정확한지 확인**
   - Filesystem MCP의 경우, 접근하려는 폴더의 **절대 경로**를 정확히 입력해야 합니다.
   - 상대 경로는 동작하지 않습니다.

3. **config.toml 문법 오류 확인**
   - `[mcp_servers.이름]` 섹션이 제대로 닫혔는지, `command`와 `args`가 올바른지 확인하세요.

### Grok이 MCP 도구를 사용하지 않을 때

**가장 흔한 원인**: 프롬프트에서 **명시적으로** MCP 서버 사용을 요청하지 않았기 때문입니다.

- 나쁜 예: “이 프로젝트 분석해줘”
- 좋은 예: “Filesystem MCP를 사용해서 이 프로젝트의 폴더 구조를 분석해줘”

Grok은 MCP 서버를 자동으로 적극적으로 사용하지 않습니다. 필요하다고 판단할 때만 사용합니다.

### 특정 MCP 도구가 보이지 않을 때

1. **Tool Naming 규칙 확인**
   - 도구 이름이 `서버이름__도구이름` 형태인지 확인하세요.
   - 예: `filesystem__read_file`, `github__create_issue`

2. **MCP 서버가 enabled 상태인지 확인**
   ```toml
   [mcp_servers.이름]
   enabled = true
   ```

3. **`/mcps` 모달에서 확인**
   - TUI에서 `Ctrl + L` → MCP 탭에서 해당 서버가 Connected 되어 있는지, 도구 목록이 보이는지 확인하세요.

### MCP 서버 응답이 너무 느릴 때

- MCP 서버 자체가 무거운 작업을 하고 있을 수 있습니다 (예: 큰 데이터베이스 조회).
- 네트워크 MCP 서버의 경우, 서버 상태나 네트워크 지연이 원인일 수 있습니다.
- `startup_timeout_sec`이나 `tool_timeout_sec` 값을 config.toml에서 조정해보세요.

---

이 두 섹션은 MCP 서버를 사용할 때 발생하는 문제를 스스로 해결할 수 있도록 돕기 위해 추가되었습니다.

