# 09-플러그인과-마켓플레이스

Skill과 MCP Servers를 어느 정도 사용하다 보면, 자연스럽게 이런 생각이 들기 시작합니다.

> “이걸 팀 전체가 같이 쓰게 하려면 어떻게 해야 하지?”
> “매번 같은 설정을 반복해서 만들고 싶지 않은데…”

이때 등장하는 것이 바로 **Plugins**와 **Marketplace**입니다.

이 문서는 Plugins를 만들고, Marketplace를 활용해서 팀이나 커뮤니티 단위로 확장 기능을 공유·배포하는 실전 방법을 다룹니다.

---

## 1. Plugins & Marketplace란 무엇인가?

### Plugins의 본질

Plugin은 **여러 확장 기능을 하나로 묶은 패키지**입니다.

예를 들어, “우리 팀 프론트엔드 표준 플러그인”을 만들면 다음과 같은 것들을 한 번에 포함할 수 있습니다:

- 팀에서 공통으로 사용하는 6~8개의 Skills
- 프로젝트에서 자주 쓰는 MCP 서버 설정 (Filesystem, Git, Postgres 등)
- pre-commit, pre-push에 필요한 Hooks
- 팀 컨벤션을 담은 AGENTS.md 조각

이렇게 만들어두면, 새로운 프로젝트를 시작하거나 새로운 팀원이 들어왔을 때 **“이 플러그인 하나만 설치하면 끝”**이 됩니다.

### Marketplace의 역할

Marketplace는 **다른 사람이 만든 플러그인을 쉽게 찾아서 설치**할 수 있게 해주는 공간입니다.

Grok Build 안에서 `Ctrl + L` → Marketplace 탭을 열면, Git 저장소로 등록된 다양한 플러그인을 검색하고 한 번에 설치할 수 있습니다.

### 왜 Plugins와 Marketplace가 필요한가?

| 상황 | Plugins / Marketplace 없이 | Plugins + Marketplace 사용 시 |
|------|---------------------------|-------------------------------|
| 팀 컨벤션 공유 | 매번 설명하고, Skill을 하나씩 복사해서 넣어야 함 | Plugin 하나로 모든 규칙 배포 |
| 새 프로젝트 시작 | MCP 서버, Skill, Hook을 매번 새로 설정 | Plugin 설치 한 번으로 완료 |
| 오픈소스 기여 | 설정을 공유하기 어려움 | Marketplace에 공개해서 누구나 사용 가능 |
| 유지보수 | Skill이 여기저기 흩어져 있음 | Plugin 단위로 버전 관리 가능 |

---

## 2. Plugins의 구조 이해하기

Plugin은 단순한 폴더일 뿐입니다. 하지만 안에 어떤 것을 넣느냐에 따라 가치가 크게 달라집니다.

### Plugin이 포함할 수 있는 것들

- `skills/` 폴더 → 여러 개의 Skill
- `.mcp.json` → MCP 서버 설정
- `hooks/` 폴더 → Hook 설정 파일
- `AGENTS.md` → 프로젝트 규칙
- `agents/` 폴더 → 커스텀 에이전트 정의 (고급)

### 가장 많이 쓰이는 Plugin 구성 패턴

**패턴 1: 팀 컨벤션 Plugin (가장 흔함)**
- Skills 7~10개
- MCP 서버 설정 2~3개
- pre-commit Hook 1~2개
- AGENTS.md

**패턴 2: 기술 스택 Plugin**
- 특정 프레임워크(React, Next.js, NestJS 등)에 최적화된 Skill 모음
- 관련 MCP 서버 설정

**패턴 3: 업무 도메인 Plugin**
- 특정 업무(결제, 인증, 데이터 분석 등)에 특화된 도구 모음

---

## 3. Plugin 만들기 - 기본 과정

### 추천 폴더 구조

```bash
my-team-frontend-plugin/
├── skills/
│   ├── git-commit-message/
│   ├── unit-test-generation/
│   ├── refactor-props-drilling/
│   └── docs-jsdoc/
├── .mcp.json
├── hooks/
│   └── pre-commit.json
├── AGENTS.md
└── README.md
```

### Plugin 만들기 단계

1. **플러그인 폴더 생성**
   ```bash
   mkdir my-team-standards
   cd my-team-standards
   ```

2. **필요한 Skill, MCP 설정, Hook 등을 안에 복사/추가**

3. **.mcp.json 작성** (MCP 서버가 포함된 경우)
   ```json
   {
     "mcpServers": {
       "filesystem": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/project"]
       }
     }
   }
   ```

4. **hooks/pre-commit.json 작성** (필요한 경우)

5. **AGENTS.md 작성** (팀 규칙)

6. **Git 저장소로 만들기**
   ```bash
   git init
   git add .
   git commit -m "feat: team standards plugin v1.0.0"
   git remote add origin https://github.com/your-org/my-team-standards
   git push -u origin main
   ```

7. **Marketplace에 등록** (선택)
   - Grok Build의 Marketplace 탭에서 Git URL을 등록하면 다른 사람들도 설치할 수 있게 됩니다.

---

## 4. 실전 Plugin 예시 모음

이 섹션에서는 실제로 팀이나 개인이 자주 만드는 Plugin 유형을 중심으로 구체적인 예시를 보여줄게.

### 4.1 팀 표준 Plugin (가장 많이 만드는 유형)

**목적**: 팀의 코딩 컨벤션, 개발 프로세스, 품질 기준을 한 번에 배포

**일반적인 구성**

- `skills/git-commit-message` (팀 커밋 규칙)
- `skills/unit-test-generation` (테스트 작성 규칙)
- `skills/refactor-props-drilling` (리팩터링 패턴)
- `skills/docs-jsdoc` (문서화 규칙)
- `.mcp.json` (Filesystem + Git MCP 설정)
- `hooks/pre-commit.json` (lint + typecheck 강제)
- `AGENTS.md` (팀 철학과 아키텍처 방향)

**장점**
- 새로운 프로젝트를 시작할 때 설정 시간이 크게 줄어듦
- 팀원이 늘어나도 컨벤션이 잘 유지됨
- Skill이나 MCP를 개별적으로 관리할 때보다 훨씬 깔끔함

### 4.2 기술 스택 Plugin

**예시**: `nextjs-standards`

- Next.js 프로젝트에 특화된 Skill 모음
  - App Router 사용 시 권장 패턴
  - Server Component / Client Component 구분 규칙
  - 데이터 페칭 패턴 (React Query vs Server Actions)
- 관련 MCP 서버 (예: Turborepo 관련 도구)
- TypeScript strict 설정 관련 Skill

이런 플러그인은 특정 기술을 자주 사용하는 팀이나, 기술 스택이 자주 바뀌는 조직에서 유용하다.

### 4.3 업무 도메인 Plugin

**예시**: `payment-system-tools`

- 결제 도메인에서 자주 사용하는 유틸리티 Skill
- 특정 DB 스키마에 최적화된 쿼리 작성 Skill
- 결제 관련 테스트 데이터 생성 Skill
- 해당 도메인에서 자주 쓰는 MCP 서버 (예: 내부 결제 API 연동 MCP)

이런 플러그인은 도메인 전문성이 높은 팀(예: 핀테크, 헬스케어)에서 특히 효과적이다.

---

## 5. Marketplace 활용하기

### Marketplace에서 플러그인 설치하는 방법

1. Grok Build에서 `Ctrl + L` 키를 누름
2. **Marketplace** 탭으로 이동
3. 검색하거나, Git URL을 직접 입력
4. Install 클릭

설치된 플러그인은 `~/.grok/plugins/` 또는 프로젝트 내 `.grok/plugins/` 에 저장된다.

### Marketplace 사용 팁

- **신뢰할 수 있는 소스 확인**: GitHub Star 수, 마지막 업데이트 날짜, README의 충실도를 확인
- **권한 확인**: Plugin이 어떤 MCP 서버와 Hook을 포함하는지 반드시 확인 (보안상 중요)
- **버전 선택**: 최신 버전이 항상 좋은 것은 아님. 안정적인 버전을 선택하는 습관을 들여라

### 직접 만든 플러그인을 Marketplace에 등록하는 방법

1. Plugin을 Git 저장소로 공개
2. Grok Build Marketplace 탭에서 “Add source” 클릭
3. Git URL 입력
4. Marketplace에 노출되면 다른 사람들도 설치 가능

---

## 6. Plugin 버전 관리와 배포 전략

### Semantic Versioning 추천

- **Major**: breaking change (기존 Skill 동작이 크게 바뀌는 경우)
- **Minor**: 새로운 Skill이나 MCP 추가
- **Patch**: 버그 수정, 문서 수정, 작은 개선

팀에서 사용할 때는 **CHANGELOG.md**를 꼭 작성하는 것을 강력 추천한다.

### 팀 내 배포 프로세스 추천

1. Plugin을 별도 Git 저장소로 관리
2. `main` 브랜치가 안정 버전
3. `develop` 브랜치에서 개발
4. 변경 시 Semantic Versioning으로 태그 생성
5. Marketplace에 등록하거나, 팀 내부에서 Git URL로 공유

---

## 7. 보안과 유지보수 관점에서의 주의점

### 보안 위험

- Plugin에 포함된 MCP 서버가 어떤 권한을 가지는지 반드시 확인
- 특히 Filesystem MCP가 포함된 경우, 어떤 경로를 열어주는지 주의
- GitHub Token 같은 민감 정보가 Plugin에 하드코딩되어 있지 않은지 확인

### 유지보수 부담

- Plugin 안에 Skill이 너무 많으면 나중에 관리하기 어려워짐
- 한 Plugin이 너무 많은 책임을 지면 “God Plugin”이 되기 쉽다
- 가능하면 **목적별로 Plugin을 분리**하는 것이 장기적으로 유리하다

### 권장하는 원칙

- Plugin 하나당 **하나의 명확한 목적**을 가지게 만들어라
- 자주 바뀌는 부분은 Plugin에서 분리해서 Skill 단위로 관리
- Marketplace에 공개하는 Plugin은 **문서화와 테스트**를 철저히 하라

---


지금까지 실전에서 자주 만드는 Plugin 유형, Marketplace 활용법, 버전 관리, 그리고 보안·유지보수 관점에서의 주의점을 다루었다.

---

## 8. Plugin과 다른 확장 기능의 실질적인 연동 사례

Plugin은 단순히 Skill이나 MCP를 묶는 것 이상의 가치를 발휘할 때가 많다. 특히 다른 확장 기능과 잘 연동했을 때 진가가 드러난다.

### 8.1 Plugin + Skill 연동 (가장 흔한 패턴)

Plugin 안에 여러 Skill을 넣고, 각 Skill이 서로 보완하게 만드는 것이 가장 효과적이다.

**실전 예시**:
- `git-commit-message` Skill
- `unit-test-generation` Skill
- `refactor-props-drilling` Skill

이 세 Skill을 하나의 Plugin으로 묶으면, 개발자가 코드를 수정한 후 “커밋 메시지 작성해줘”라고 하면 자연스럽게 테스트도 제안하고, 리팩터링도 제안하는 흐름이 만들어진다.

### 8.2 Plugin + MCP 연동

Plugin 안에 MCP 설정을 넣으면, 해당 프로젝트에서 필요한 외부 도구를 한 번에 연결할 수 있다.

**예시**:
- Filesystem MCP (프로젝트 루트)
- Git MCP
- PostgreSQL MCP (해당 프로젝트 전용 DB)

이렇게 하면 Plugin을 설치하는 순간, 개발 환경이 거의 완성되는 수준까지 갈 수 있다.

### 8.3 Plugin + Hooks 연동

Plugin 안에 pre-commit, pre-push Hook을 포함하면, **자동화 + 품질 강제**를 동시에 할 수 있다.

**실전 구성 예시**:
- pre-commit Hook: lint + typecheck + test (일부)
- Skill: “테스트가 실패하면 원인을 분석하고 수정 제안을 해주는 역할”

Hook이 먼저 검사하고, 실패하면 Skill이 도와주는 형태가 매우 강력하다.

---

## 9. 팀에서 Plugins & Marketplace를 도입하는 전략

### 도입 단계별 추천

**1단계: 파일럿 팀에서 시작 (1~2개월)**
- 작은 팀이나 일부 프로젝트에서만 Plugin을 만들어 사용
- 피드백을 받아가며 Plugin을 다듬음

**2단계: 표준 Plugin 만들기**
- 팀 컨벤션이 어느 정도 안정되면, 공식 Plugin으로 승격
- CHANGELOG와 문서화를 철저히 함

**3단계: Marketplace 또는 내부 저장소 배포**
- Marketplace에 등록하거나, 팀 내부 Git 저장소로 공유
- 신규 입사자 온보딩 문서에 Plugin 설치 과정을 포함

### 도입 시 주의할 점

- 너무 일찍 너무 많은 Plugin을 만들지 말 것 (관리 부담 증가)
- Plugin을 만들기 전에 **Skill 단위로 먼저 검증**하는 것이 좋음
- Plugin을 강제로 사용하게 하지 말고, “이 Plugin을 쓰면 이런 장점이 있다”는 식으로 설득하는 것이 효과적

---

## 10. Best Practices & Anti-patterns

### Best Practices

- Plugin 하나당 **명확한 목적** 하나를 가진다
- 자주 바뀌는 부분은 Plugin이 아닌 Skill 단위로 관리
- Marketplace에 공개하는 Plugin은 **README와 예시를 충분히** 작성
- 버전 관리를 철저히 하고, Breaking Change는 Major 버전으로 올림
- Plugin 안에 민감 정보(토큰, 비밀번호 등)를 절대 포함하지 않음

### Anti-patterns (피해야 할 것)

- **God Plugin**: 모든 걸 다 넣으려는 Plugin (유지보수 지옥)
- **문서 없는 Plugin**: 설치 방법과 사용법이 README에 제대로 적혀있지 않은 경우
- **중복 Plugin**: 비슷한 역할을 하는 Plugin이 여러 개 생기는 상황
- **너무 자주 업데이트되는 Plugin**: 팀원들이 따라가기 힘듦
- **권한이 과도한 Plugin**: 불필요하게 많은 MCP 서버나 파일 경로를 포함

---

## 11. 다음 단계

`09-플러그인과-마켓플레이스.md`를 모두 읽었다면, 이제 Grok Build의 주요 확장 기능 4가지를 모두 다룬 셈이다.

### 추천 학습/도입 순서 (최종)

1. **Skills** — 가장 쉽고 효과가 빠름
2. **MCP Servers** — 실제 데이터를 다루는 능력
3. **Plugins & Marketplace** — 팀 단위 표준화
4. **Hooks** — 가장 강력하지만 가장 신중해야 함

### 다음 가이드 추천

- **10-훅-활용-가이드** (준비 중)
  - Hooks는 확장 기능 중에서 **가장 위험도가 높고**, 잘못 사용하면 오히려 생산성을 크게 저하시킬 수 있다.
  - 따라서 가장 마지막에 배우는 것을 추천한다.

---

**09-플러그인과-마켓플레이스.md 끝**

여기까지 읽어주셔서 감사합니다.

Plugins와 Marketplace는 Grok Build의 확장 기능을 **개인 → 팀 → 커뮤니티**로 확장시켜주는 중요한 역할을 합니다.

특히 팀 단위로 Grok을 도입하려고 한다면, 이 두 가지를 잘 활용하는 것이 생산성 향상의 핵심이 될 가능성이 높습니다.

Plugin을 만들거나 Marketplace를 활용하다가 막히는 부분이 있으면 언제든 말씀해주세요.

---

*이 가이드는 실무에서 Plugins & Marketplace를 도입했던 경험을 바탕으로 작성되었습니다.*
---

## 공식 명령어 & 고급 기능 (참고)

이 가이드에서는 실전 사용에 초점을 맞췄지만, 아래 공식 기능들도 알아두면 도움이 됩니다.

### TUI 관리 단축키 상세 (Ctrl+L 모달)

`Ctrl + L` (또는 `/plugins`)을 누르면 Plugins 관리 모달이 열립니다. 이 모달에는 세 개의 탭이 있습니다:

- **Plugins** 탭: 설치된 플러그인 관리
- **Marketplace** 탭: 플러그인 검색 및 설치
- **Hooks** 탭: Hook 관리

**주요 키보드 단축키**:

| 키          | Plugins 탭에서의 동작                     | Marketplace 탭에서의 동작               |
|-------------|-------------------------------------------|-----------------------------------------|
| `r`         | 모든 플러그인 새로고침                    | Marketplace 소스 새로고침               |
| `i`         | 로컬 경로에서 플러그인 설치               | 선택한 플러그인 설치                    |
| `e`         | 선택한 플러그인 활성화/비활성화           | -                                       |
| `Space`     | 플러그인 상세 정보 펼치기/접기            | 소스 또는 플러그인 상세 정보 펼치기/접기 |
| `/`         | 플러그인 이름으로 검색                    | 플러그인 이름으로 검색                  |
| `d`         | -                                         | 선택한 플러그인 제거 (Marketplace)      |
| `u`         | -                                         | 설치된 Marketplace 플러그인 전체 업데이트 |

**실전 팁**:
- `Ctrl + L` → `r` : 플러그인을 수정한 후 빠르게 새로고침할 때 자주 사용
- `Space` : 플러그인이 어떤 Skill과 MCP를 포함하고 있는지 확인할 때 유용
- `i` : 로컬에서 개발 중인 플러그인을 테스트할 때 사용

### Trust 시스템 (플러그인)

외부에서 받은 플러그인이나, 신뢰할 수 없는 소스의 플러그인은 기본적으로 **trust(신뢰)**되지 않습니다.

신뢰하지 않은 플러그인은 보안상의 이유로 일부 기능(Skill, Hook, MCP 등)이 제한될 수 있습니다.

**Trust 설정 방법**:
- TUI에서 `Ctrl + L` → Plugins 탭 → `t` 키로 trust
- 또는 `/plugins trust <플러그인 경로>` 명령어 사용

**주의**: 신뢰할 수 없는 플러그인을 함부로 trust하지 마세요. 특히 MCP 서버나 Hook이 포함된 플러그인은 보안 위험이 있을 수 있습니다.

### `/plugins` Slash Commands

```bash
/plugins list            # 설치된 플러그인 목록
/plugins reload          # 모든 플러그인 새로고침
/plugins trust <path>    # 특정 플러그인을 신뢰
```

이 명령어들은 TUI를 열지 않고도 플러그인을 관리하고 싶을 때 유용합니다.

---

이 섹션은 참고용으로 작성되었습니다. 실제로 플러그인을 관리할 때는 `Ctrl + L` 모달의 단축키와 Trust 시스템을 잘 활용해보세요.


---

## 배경 지식: 이 기능이 왜 이렇게 동작하는가

> **참고**: 이 섹션은 Grok 공식 문서에 명시된 설계 의도를 그대로 설명한 것이 아닙니다.  
> 실제 동작 방식과 관찰, 그리고 논리적 해석을 바탕으로 작성한 **참고용 설명**입니다.  
> xAI에서 공식적으로 발표한 설계 철학이 아니라는 점을 참고해 주세요.

Plugins & Marketplace 시스템이 현재와 같은 형태로 제공되는 배경과 특징을 정리했습니다.

### 1. 왜 Plugin으로 묶어서 배포하나?

Skills, MCP 서버, Hooks 등을 개별적으로 설치하고 관리하는 것은 처음에는 괜찮지만, 팀 규모가 커지거나 프로젝트가 많아지면 관리가 매우 어려워집니다.

그래서 여러 확장 기능을 **하나의 패키지(Plugin)**로 묶어서 배포할 수 있게 했습니다. 이렇게 하면:

- 팀 컨벤션(Skills + MCP + Hooks)을 한 번에 배포 가능
- 새 프로젝트나 신규 입사자 온보딩이 훨씬 수월해짐
- 버전 관리와 업데이트가 용이해짐

### 2. 왜 Marketplace가 필요한가?

팀 내부에서 Plugin을 공유하는 것만으로는 한계가 있습니다.  
다른 팀이나 커뮤니티에서 만든 좋은 Plugin을 쉽게 찾아서 설치할 수 있게 하기 위해 Marketplace가 존재합니다.

Marketplace는 단순한 다운로드 장소가 아니라, Plugin을 발견하고 설치하며 업데이트를 관리할 수 있는 배포 플랫폼 역할을 합니다.

### 3. 왜 Trust(신뢰) 시스템이 필요한가?

Plugin은 내부에 Skill, MCP 서버, Hook 등을 포함할 수 있기 때문에, 실행 권한이 상당히 강력합니다.  
특히 외부에서 받은 Plugin을 그대로 실행하면 보안 위험이 발생할 수 있습니다.

그래서 Grok은 기본적으로 신뢰(trust)되지 않은 Plugin의 일부 기능(Skill, MCP, Hook 실행 등)을 제한하고, 사용자가 직접 신뢰 여부를 결정하도록 설계했습니다.

## 디버깅 체크리스트

Plugin이 제대로 동작하지 않을 때, 아래 순서대로 확인해보세요.

### Plugin이 보이지 않을 때

1. **Plugin이 제대로 설치되었는지 확인**
   - `Ctrl + L` → Plugins 탭에서 Plugin이 보이는지 확인
   - Marketplace에서 설치한 경우, 설치 후 `/plugins reload` 또는 `Ctrl + L` → `r` 키로 새로고침

2. **Plugin 경로가 올바른지 확인**
   - `~/.grok/plugins/` 또는 프로젝트 내 `.grok/plugins/` 폴더에 Plugin 폴더가 제대로 있는지 확인

### Plugin이 신뢰(trust)되지 않을 때

- 외부에서 받은 Plugin은 기본적으로 trust되지 않습니다.
- TUI에서 `Ctrl + L` → Plugins 탭 → `t` 키로 trust를 하거나, `/plugins trust <경로>` 명령어를 실행하세요.
- 신뢰하지 않은 Plugin은 Skill, MCP, Hook이 제한될 수 있습니다.

### Plugin 내부 Skill / MCP / Hook이 로드되지 않을 때

1. **Plugin이 trust되었는지 다시 확인**
2. **Skill의 경우**
   - Plugin 안에 `skills/` 폴더가 있고, 그 안에 `SKILL.md`가 올바르게 작성되어 있는지 확인
3. **MCP의 경우**
   - Plugin 안에 `.mcp.json` 파일이 있고, 설정이 올바른지 확인
4. **Hook의 경우**
   - Plugin 안에 `hooks/` 폴더와 `hooks.json`이 제대로 작성되어 있는지 확인
   - 프로젝트 Hook은 별도로 trust가 필요할 수 있음

### 플러그인 간 충돌이 발생할 때

- 같은 이름의 Skill이나 MCP 서버가 여러 Plugin에 존재하면 충돌할 수 있습니다.
- `Ctrl + L` → Plugins 탭에서 충돌 경고(Conflicts)가 있는지 확인하세요.
- 가능하면 Plugin을 목적별로 분리해서 만드는 것이 혼란을 줄이는 데 도움이 됩니다.

### Marketplace에서 설치가 안 될 때

- Git 저장소가 공개(public)인지 확인
- Plugin 구조가 올바른지 (필수 파일이 있는지)
- Marketplace 소스가 제대로 등록되어 있는지 (`r` 키로 새로고침)

---

이 두 섹션은 Plugin을 사용할 때 발생하는 문제를 스스로 해결할 수 있도록 돕기 위해 추가되었습니다.

