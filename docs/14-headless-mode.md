# 13-헤드리스 모드

Grok Build는 기본적으로 **터미널 전체 화면 TUI**로 동작합니다.  
하지만 때로는 TUI 없이, 명령줄에서 바로 Grok을 실행하고 결과를 받아서 사용하고 싶을 때가 있습니다.

이럴 때 사용하는 것이 바로 **Headless Mode**입니다.

---

## Headless Mode란 무엇인가?

**Headless Mode**는 Grok Build를 **비대화형(Non-interactive)**으로 실행하는 방식입니다.

- TUI(터미널 UI) 없이 명령줄에서 바로 실행
- 하나의 프롬프트를 주고, Grok이 처리한 결과를 받아서 출력
- 스크립트, CI/CD, 자동화 도구 등과 연동하기에 적합

쉽게 말해, “Grok에게 일을 시키고 결과를 바로 받는” 방식입니다.

### 언제 Headless Mode를 사용하면 좋을까?

- CI/CD 파이프라인에서 코드 리뷰 자동화
- pre-commit hook에서 코드 품질 검사
- 정기적으로 실행되는 스크립트 (cron, GitHub Actions 등)
- 다른 도구와 연동해서 결과를 받아 처리할 때
- JSON 형식으로 결과를 받아서 프로그램에서 활용할 때

---

## 기본 사용법

Headless Mode를 실행하는 가장 기본적인 방법은 `-p` 옵션(또는 `--single`)을 사용하는 것입니다.

```bash
grok -p "Your prompt here"
```

예시:

```bash
grok -p "이 프로젝트의 package.json을 분석하고, 사용 중인 주요 라이브러리를 알려줘"
```

Grok은 프롬프트를 처리하고, 필요한 도구를 실행한 뒤, 결과를 표준 출력(stdout)으로 출력하고 종료합니다.

---

## 주요 CLI 옵션

Headless Mode에서 자주 사용하는 옵션들을 정리했습니다.

### 기본 옵션

| 옵션                        | 설명 |
|-----------------------------|------|
| `-p, --single <PROMPT>`     | Headless 모드로 실행 (필수) |
| `-m, --model <MODEL>`       | 사용할 모델 지정 |
| `--cwd <PATH>`              | 작업 디렉토리 지정 |
| `--yolo`                    | 모든 도구 실행을 자동 승인 (주의 필요) |

### 세션 관련 옵션

| 옵션                        | 설명 |
|-----------------------------|------|
| `-s, --session-id <ID>`     | 특정 세션 ID로 Headless 세션 생성/이용 |
| `-r, --resume <ID>`         | 기존 세션을 이어서 실행 |
| `-c, --continue`            | 가장 최근 세션을 이어서 실행 |

### 출력 형식 옵션

| 옵션                        | 설명 |
|-----------------------------|------|
| `--output-format <FMT>`     | 출력 형식 지정 (`plain`, `json`, `streaming-json`) |

- `plain`: 일반 텍스트 출력 (기본)
- `json`: JSON 형식으로 결과 출력 (프로그래밍 연동에 유용)
- `streaming-json`: NDJSON 형식으로 실시간 스트리밍 출력

### 도구 제한 옵션 (고급)

| 옵션                        | 설명 |
|-----------------------------|------|
| `--tools <TOOLS>`           | 허용할 도구만 지정 (콤마로 구분) |
| `--disallowed-tools <TOOLS>`| 금지할 도구 지정 |
| `--max-turns <N>`           | 최대 턴 수 제한 |
| `--permission-mode <MODE>`  | 권한 모드 설정 |

---

## 출력 형식

### 1. plain (기본)

```bash
grok -p "프로젝트 구조를 분석해줘"
```

일반 텍스트로 결과가 출력됩니다. 사람이 읽기 가장 편합니다.

### 2. json

```bash
grok -p "이 함수의 역할을 분석해줘" --output-format json
```

JSON 형식으로 결과가 나옵니다. 구조화된 데이터를 받아 처리하고 싶을 때 유용합니다.

### 3. streaming-json

```bash
grok -p "이 파일을 리팩터링해줘" --output-format streaming-json
```

실시간으로 JSON 라인이 스트리밍됩니다. 긴 작업을 실시간으로 처리하고 싶을 때 사용합니다.

---


## Headless Mode 실전 예시

### 1. CI/CD에서 코드 리뷰 자동화 (GitHub Actions)

```yaml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Grok Code Review
        run: |
          grok -p "이 PR의 변경사항을 리뷰하고, 잠재적인 문제를 지적해줘" \
            --output-format json \
            --yolo > review-result.json
        env:
          GROK_CODE_XAI_API_KEY: ${{ secrets.GROK_API_KEY }}
```

### 2. pre-commit hook에서 코드 품질 검사

`.git/hooks/pre-commit` 파일에 추가:

```bash
#!/bin/bash
echo "Running AI-assisted code review..."
grok -p "이 변경사항을 리뷰하고, 명백한 버그나 스타일 위반이 있는지 알려줘" --yolo
```

### 3. 정기적인 코드베이스 분석 스크립트

```bash
#!/bin/bash
# weekly-analysis.sh

DATE=$(date +%Y-%m-%d)
grok -p "지난 주 동안 변경된 코드 중에서 개선이 필요한 부분을 찾아줘" \
  --output-format json \
  > "analysis-$DATE.json"
```

### 4. 다른 도구와 연동 (예: 결과 파싱)

```bash
RESULT=$(grok -p "이 파일의 주요 함수들을 나열해줘" --output-format json)
FUNCTION_COUNT=$(echo $RESULT | jq '.functions | length')
echo "총 $FUNCTION_COUNT개의 함수가 있습니다."
```

---

## Tool Filtering

Headless Mode에서는 `--tools`와 `--disallowed-tools` 옵션을 사용해서 Grok이 사용할 수 있는 도구를 제한할 수 있습니다.

### 허용 도구만 지정하기 (`--tools`)

```bash
grok -p "이 프로젝트를 분석해줘" \
  --tools "read_file, list_dir, grep_search"
```

- 위 명령어는 Grok이 `read_file`, `list_dir`, `grep_search` 도구만 사용할 수 있게 제한합니다.

### 특정 도구 금지하기 (`--disallowed-tools`)

```bash
grok -p "이 파일을 리팩터링해줘" \
  --disallowed-tools "write_file, run_shell"
```

- 파일 수정이나 shell 실행을 막고 싶을 때 유용합니다.

**주의**: `--tools`와 `--disallowed-tools`는 Headless Mode에서만 동작합니다. TUI에서는 무시됩니다.

---

## Permission Mode

Headless Mode에서는 `--permission-mode` 옵션을 사용해서 도구 실행 권한을 제어할 수 있습니다.

### 옵션 종류

- `ask` (기본): 도구 실행 전마다 사용자에게 물어봄
- `auto` (YOLO): 모든 도구 실행을 자동 승인

```bash
grok -p "이 프로젝트를 정리해줘" --permission-mode auto
```

**주의**: `--yolo` 플래그와 동일한 효과입니다. 보안상 중요한 작업에서는 `ask` 모드를 유지하는 것이 안전합니다.

---

## JSON 출력 활용법 (프로그래밍 연동)

Headless Mode의 강력한 기능 중 하나는 `--output-format json`을 사용해서 **구조화된 결과**를 받아오는 것입니다.

### 예시: JSON 파싱해서 활용하기

```bash
RESULT=$(grok -p "이 파일의 함수 목록을 JSON으로 추출해줘" --output-format json)

# 함수 개수 추출
COUNT=$(echo $RESULT | jq '.functions | length')
echo "총 $COUNT개의 함수가 있습니다."

# 첫 번째 함수 이름 출력
FIRST_FUNC=$(echo $RESULT | jq -r '.functions[0].name')
echo "첫 번째 함수: $FIRST_FUNC"
```

### streaming-json 활용

긴 작업을 실시간으로 처리하고 싶을 때:

```bash
grok -p "이 대형 파일을 분석해줘" --output-format streaming-json | while read line; do
  echo "진행 중: $line"
done
```

---

## 주의할 점과 Best Practices

### 1. YOLO 모드(--yolo)는 신중하게 사용하라

Headless Mode에서 `--yolo`를 사용하면 Grok이 파일을 수정하거나 명령을 실행하는 것을 자동으로 승인합니다.

- CI/CD처럼 안전한 환경에서는 유용하지만,
- 중요한 프로젝트에서는 `--yolo` 없이 실행하고, 필요할 때만 권한을 주는 것이 안전합니다.

### 2. Tool Filtering을 적극 활용하라

필요한 도구만 허용하거나, 위험한 도구는 미리 차단하는 습관을 들이세요.

```bash
grok -p "..." --tools "read_file, grep_search" --disallowed-tools "write_file, run_shell"
```

### 3. JSON 출력을 활용해서 자동화하라

Headless Mode의 진짜 가치는 **다른 프로그램과 연동**하는 데 있습니다.

- JSON으로 결과를 받아서 파싱
- streaming-json으로 실시간 처리
- 다른 도구와 파이프라인 연결

### 4. 세션 ID를 활용해서 연속 작업하기

```bash
# 첫 번째 작업
grok -p "이 프로젝트를 분석해줘" --session-id my-analysis

# 두 번째 작업 (이어서)
grok -p "분석 결과를 바탕으로 개선점을 제안해줘" --resume my-analysis
```

---


지금까지 Headless Mode의 실전 예시, Tool Filtering, Permission Mode, JSON 활용법, 그리고 Best Practices를 다루었습니다.

---

## Headless Mode 전체 옵션 정리

Headless Mode에서 사용할 수 있는 주요 옵션들을 카테고리별로 정리했습니다.

### 기본 옵션
- `-p, --single <PROMPT>`: Headless 모드 실행 (필수)
- `-m, --model <MODEL>`: 모델 지정
- `--cwd <PATH>`: 작업 디렉토리 지정
- `--yolo`: 모든 도구 자동 승인

### 세션 관련
- `-s, --session-id <ID>`: 세션 ID 지정
- `-r, --resume <ID>`: 기존 세션 이어서 실행
- `-c, --continue`: 가장 최근 세션 이어서 실행

### 출력 관련
- `--output-format <plain|json|streaming-json>`: 결과 출력 형식

### 도구 제한 (Headless 전용)
- `--tools <TOOLS>`: 허용할 도구만 지정 (콤마 구분)
- `--disallowed-tools <TOOLS>`: 금지할 도구 지정
- `--max-turns <N>`: 최대 턴 수 제한
- `--effort <low|medium|high>`: 작업 강도 조정
- `--permission-mode <ask|auto>`: 권한 모드

### 권한 제어 (TUI + Headless 공통)
- `--allow <RULE>`: 특정 작업 허용 규칙 (glob 패턴, 반복 가능)
- `--deny <RULE>`: 특정 작업 금지 규칙 (glob 패턴, 반복 가능)

---

## 고급 사용 사례

### 1. Subagent와 Headless 연동

Headless Mode를 Subagent로 실행해서, 메인 세션에서 복잡한 작업을 병렬로 처리할 수 있습니다.

```bash
# 메인 세션
grok -p "이 프로젝트의 결제 모듈을 리팩터링해줘"

# Subagent로 특정 모듈 분석
grok -p "PaymentService.ts 파일을 분석해줘" \
  --session-id payment-analysis \
  --output-format json
```

### 2. 복잡한 파이프라인 구축

여러 Headless Grok을 연결해서 고도화된 워크플로를 만들 수 있습니다.

예: 
1. 코드 변경 감지 → 
2. Headless Grok으로 자동 리뷰 → 
3. 리뷰 결과에 따라 자동 테스트 실행 → 
4. 테스트 통과 시 Headless Grok으로 PR 설명 작성

### 3. 대규모 코드베이스 분석

```bash
grok -p "이 프로젝트에서 보안 취약점이 있을 가능성이 있는 부분을 찾아줘" \
  --max-turns 20 \
  --tools "read_file, grep_search, list_dir" \
  --output-format json \
  > security-report.json
```

---

## 자주 발생하는 문제와 해결 방법 (Troubleshooting)

### 1. Headless 모드에서 도구가 실행되지 않는다

**증상**: Grok이 아무것도 하지 않고 바로 종료됨

**해결**:
- `--yolo` 또는 `--permission-mode auto`를 사용했는지 확인
- Tool Filtering로 필요한 도구를 허용했는지 확인 (`--tools`)
- 프롬프트가 너무 모호하지 않은지 확인

### 2. JSON 출력이 깨져 보인다

**증상**: `--output-format json`을 사용했는데 결과가 이상함

**해결**:
- `jq` 같은 JSON 파서로 확인해보기
- `streaming-json`이 아닌 `json`을 사용했는지 확인 (streaming-json은 NDJSON 형식)

### 3. 세션 ID가 잘못됐다고 나온다

**증상**: `--resume`으로 세션을 이어가려는데 "session not found" 에러

**해결**:
- 세션 ID가 정확한지 `/session-info`나 `grok inspect`로 확인
- 세션이 해당 프로젝트(`--cwd`)에서 생성된 것인지 확인

### 4. Tool Filtering이 적용되지 않는다

**증상**: `--tools`나 `--disallowed-tools`를 사용했는데 무시됨

**해결**:
- 이 옵션들은 **Headless Mode에서만** 동작합니다.
- TUI에서는 무시되며 경고 메시지가 출력됩니다.

---

## 전체 가이드 마무리

`13-헤드리스-모드.md`를 모두 읽었다면, 이제 Grok Build를 **스크립트와 자동화**에 활용하는 방법을 배운 것입니다.

### 핵심 요약

- Headless Mode는 `-p` 옵션으로 실행
- 출력 형식은 `plain`, `json`, `streaming-json` 중 선택
- Tool Filtering과 Permission Mode로 안전하게 제어 가능
- JSON 출력을 활용하면 다른 프로그램과 쉽게 연동 가능
- CI/CD, pre-commit, 정기 분석 등 다양한 자동화에 활용

### Headless Mode 추천 사용처

- CI/CD 파이프라인
- Git Hooks (pre-commit, pre-push)
- 정기적인 코드 품질 검사
- 대규모 코드베이스 분석
- 다른 도구와의 파이프라인 연동

---

**13-헤드리스-모드.md 끝**

여기까지 Grok Build의 Headless Mode를 실전 관점에서 정리했습니다.

Headless Mode는 Grok Build를 단순한 대화형 도구에서 **자동화 가능한 AI 에이전트**로 만들어주는 중요한 기능입니다.

특히 JSON 출력과 Tool Filtering을 잘 활용하면, Grok을 기존 개발 워크플로에 자연스럽게 녹여넣을 수 있습니다.

이 문서에서 다루지 않은 더 고급 활용법이나 특정 환경에서의 문제 해결이 필요하시면 언제든 말씀해주세요.

---

*이 가이드는 실제 CI/CD와 자동화 환경에서 Headless Mode를 활용했던 경험을 바탕으로 작성되었습니다.*

---


- Headless Mode에서 사용할 수 있는 모든 옵션 상세 정리
- 고급 사용 사례 (Subagent, 복잡한 파이프라인)
- 자주 발생하는 문제와 해결 방법
- 전체 가이드 마무리

---



지금까지 다음 내용을 다루었습니다:

- Headless Mode의 개념
- 언제 사용하면 좋은지
- 기본 사용법 (`grok -p`)
- 주요 CLI 옵션
- 출력 형식 (plain, json, streaming-json)

---


- Headless Mode 실전 예시 (CI/CD, 스크립트, 자동화)
- Tool Filtering과 Permission Mode 상세
- JSON 출력 활용법
- 주의할 점과 Best Practices

---


---

## 배경 지식: 이 기능이 왜 이렇게 동작하는가

> **참고**: 이 섹션은 Grok 공식 문서에 명시된 설계 의도를 그대로 설명한 것이 아닙니다.  
> 실제 동작 방식과 관찰, 그리고 논리적 해석을 바탕으로 작성한 **참고용 설명**입니다.  
> xAI에서 공식적으로 발표한 설계 철학이 아니라는 점을 참고해 주세요.

Headless Mode가 현재와 같은 형태로 제공되는 배경과 특징을 정리했습니다.

### 1. 왜 일부 옵션이 Headless에서만 동작하나?

`--tools`, `--disallowed-tools`, `--max-turns`, `--effort`, `--permission-mode` 같은 옵션들은 **Headless 전용**입니다.

이유는 Headless Mode가 **비대화형**으로 설계되었기 때문입니다.  
TUI에서는 사용자가 실시간으로 개입할 수 있지만, Headless에서는 그렇지 않기 때문에, 도구 사용 범위, 턴 수, 권한 모드 등을 미리 강하게 제어할 수 있는 옵션이 필요합니다.

### 2. 왜 JSON 출력 형식을 지원하나?

Headless Mode의 가장 큰 장점 중 하나는 **다른 프로그램과 연동**하기 쉽다는 점입니다.  
`--output-format json`이나 `streaming-json`을 사용하면, Grok의 결과를 구조화된 데이터로 받아서 자동화 파이프라인에 넣을 수 있습니다.

이 때문에 Headless Mode는 단순한 "텍스트 출력"을 넘어, **프로그래밍 가능한 AI 에이전트**로서의 역할을 할 수 있게 됩니다.

### 3. 왜 YOLO 모드(--yolo)가 존재하나?

Headless Mode는 종종 CI/CD나 자동화 스크립트에서 사용됩니다.  
이런 환경에서는 매번 권한을 확인받는 것이 오히려 방해가 될 수 있기 때문에, `--yolo` 옵션을 제공합니다.

다만 YOLO 모드는 강력한 권한을 부여하기 때문에, 중요한 작업을 자동화할 때는 `--tools`나 `--disallowed-tools`와 함께 사용하는 것이 일반적으로 권장됩니다.

---

## 디버깅 체크리스트

Headless Mode가 제대로 동작하지 않을 때, 아래 순서대로 확인해보세요.

### Grok이 아무것도 하지 않고 바로 종료될 때

1. **프롬프트가 너무 모호한지 확인**
   - Headless에서는 TUI처럼 대화를 주고받을 수 없기 때문에, 프롬프트가 구체적이고 명확해야 합니다.

2. **필요한 도구가 제한되어 있는지 확인**
   - `--tools`나 `--disallowed-tools`로 도구가 너무 많이 막혀 있으면, 작업을 수행할 수 없어서 바로 종료될 수 있습니다.

### JSON 출력이 깨지거나 파싱이 안 될 때

1. **올바른 출력 형식을 사용했는지 확인**
   - `--output-format json` (단일 JSON)
   - `--output-format streaming-json` (NDJSON, 한 줄씩 JSON)

2. **jq 같은 JSON 파서로 확인해보기**
   ```bash
   grok -p "..." --output-format json | jq .
   ```

### Tool Filtering이 적용되지 않을 때

- `--tools`와 `--disallowed-tools` 옵션은 **Headless Mode에서만** 동작합니다.
- TUI에서 실행하면 무시되고 경고 메시지가 출력됩니다.

### 권한 관련 문제

- `--yolo`를 사용하지 않으면, Headless에서도 권한 확인이 필요할 수 있습니다.
- 중요한 작업을 자동화할 때는 `--yolo` + `--tools` 조합을 사용하는 것이 일반적으로 안전합니다.

### 세션 관련 문제

- `--resume`으로 세션을 이어가려는데 "session not found"가 뜨면, 세션 ID가 정확한지, 해당 프로젝트에서 생성된 세션인지 확인하세요.
```

The file /Users/leeiksang/.grok/docs/user-guide/ko/13-헤드리스-모드.md has been updated successfully.
이 두 섹션은 Headless Mode를 사용할 때 발생하는 문제를 스스로 해결할 수 있도록 돕기 위해 추가되었습니다.

