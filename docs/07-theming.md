# 06-테마

Grok Build의 TUI는 **완전히 테마를 변경할 수 있습니다**.  
모든 색상은 중앙의 `Theme` 구조체에서 관리되며, 하드코딩된 색상은 전혀 없습니다.

이 문서는 Grok Build의 테마 시스템을 이해하고, 원하는 대로 커스터마이징하는 방법을 처음 사용자 관점에서 정리합니다.

---

## Theming 소개

Grok Build의 TUI는 **모든 색상과 스타일**이 중앙에서 관리되는 구조로 설계되어 있습니다.

### Theme 구조체

Grok Build 내부에서는 `Theme`라는 구조체가 모든 색상, 레이아웃, 애니메이션 스타일을 정의합니다.  
이 구조체를 통해:

- 테마를 실시간으로 변경할 수 있음
- 스크롤백 레이아웃을 세밀하게 커스터마이징할 수 있음
- 애니메이션 속도와 스타일을 조정할 수 있음
- 블록 스타일링을 세밀하게 제어할 수 있음

### 테마 설정 위치

테마는 세 가지 방법으로 설정할 수 있습니다:

1. **TUI 내에서** (`/theme` 명령어)
2. **config.toml** (`~/.grok/config.toml`)
3. **CLI 플래그** (`--light`, `--dark` 등)

---

## Available Themes (내장 테마)

Grok Build는 4개의 내장 테마를 제공합니다.

| 테마 이름          | 설정 이름 (config.toml)                  | 설명 | Truecolor 필요 |
|--------------------|------------------------------------------|------|----------------|
| **GrokNight**      | `groknight`, `grok-night`, `dark`        | 중립적인 회색 기반 + 악센트 색상. 기본 테마. 256색/16색 터미널에서도 잘 동작 | No |
| **GrokDay**        | `grokday`, `grok-day`, `light`, `day`    | 밝은 터미널 배경에 최적화된 라이트 테마 | No |
| **TokyoNight**     | `tokyonight`, `tokyo-night`, `tokyo`     | Tokyo Night 색상 스킴에서 영감을 받은 파란색 계열 배경. 색상 양자화 시 특징이 사라짐 | Yes |
| **RosePineMoon**   | `rosepine`, `rose-pine`, `rosepinemoon`, `rose-pine-moon` | Rose Pine 색상 패밀리의 따뜻하고 부드러운 팔레트 | Yes |

**팁**: 테마 이름은 대소문자를 구분하지 않습니다.

### GrokNight (기본 테마)

- **설명**: 중립적인 회색 기반에 악센트 색상을 더한 테마
- **장점**: 256색/16색 터미널에서도 색상이 잘 보존 됨
- **단점**: TokyoNight나 RosePineMoon에 비해 화려하지 않음
- **추천 대상**: 대부분의 사용자, 특히 256색 터미널 사용자

### GrokDay (라이트 테마)

- **설명**: 밝은 터미널 배경에 최적화된 라이트 테마
- **장점**: 밝은 환경에서 눈이 덜 피로함
- **단점**: 일부 사용자에게는 "너무 밝다"는 느낌이 들 수 있음
- **추천 대상**: 밝은 터미널 배경을 선호하는 사용자

### TokyoNight

- **설명**: Tokyo Night 색상 스킴에서 영감을 받은 파란색 계열 배경
- **장점**: 현대적이고 세련된 느낌
- **단점**: Truecolor가 아닌 터미널에서는 색상이 제대로 표현되지 않음
- **추천 대상**: Truecolor 지원 터미널 사용자

### RosePineMoon

- **설명**: Rose Pine 색상 패밀리의 따뜻하고 부드러운 팔레트
- **장점**: 눈이 편안하고, 장시간 사용에 좋음
- **단점**: Truecolor가 아닌 터미널에서는 색상이 제대로 표현되지 않음
- **추천 대상**: Truecolor 지원 터미널 사용자, 따뜻한 색감을 선호하는 사용자

---

## Switching Themes (테마 변경 방법)

### 1. TUI 내에서 변경 (`/theme`)

Grok Build 안에서 `/theme` 명령어를 입력하면, **실시간 미리보기** 테마 선택기가 열립니다.

**사용 방법**:
1. 프롬프트 입력란에 `/theme` 입력
2. 화살표 키 또는 `j`/`k`로 테마 탐색
3. 테마를 선택하면 TUI가 **실시간으로** 업데이트됨
4. `Enter`를 누르면 선택한 테마가 저장되고 적용됨
5. `Escape`를 누르면 취소

**실전 팁**: `/theme` 명령어는 테마를 "미리 보기"하면서 선택할 수 있어서 가장 편리합니다.

### 2. config.toml에서 변경

`~/.grok/config.toml` 파일에 테마를 지정할 수 있습니다:

```toml
[ui]
theme = "tokyonight"
```

**사용 가능한 값**:
- `groknight`, `grok-night`, `dark`
- `grokday`, `grok-day`, `light`, `day`
- `tokyonight`, `tokyo-night`, `tokyo`
- `rosepine`, `rose-pine`, `rosepinemoon`, `rose-pine-moon`

### 3. CLI 플래그로 변경

Grok Build 실행 시 테마를 지정할 수 있습니다:

```bash
# 라이트 테마로 시작
grok --light

# 다크 테마로 시작
grok --dark
```

**주의**: CLI 플래그로 지정한 테마는 **해당 실행에만** 적용되며, `config.toml`에 저장되지 않습니다.

---

## Color Support Detection (색상 지원 감지)

Grok Build는 시작 시 사용자의 터미널 색상 지원 수준을 자동으로 감지합니다.

### 감지하는 항목

- **Truecolor (24-bit)**: 16,777,216 색상 지원 (`COLORTERM=truecolor`)
- **256-color**: 256 색상 지원 (`TERM=xterm-256color`)
- **16-color**: 16 색상 지원 (기본)

### 터미널 색상 지원에 따른 테마 선택

| 터미널 색상 지원 | 추천 테마 |
|------------------|-----------|
| Truecolor (24-bit) | TokyoNight, RosePineMoon (화려한 테마) |
| 256-color | GrokNight, GrokDay (안전한 테마) |
| 16-color | GrokNight, GrokDay (안전한 테마) |

**팁**: `/terminal-check` 명령어로 현재 터미널의 색상 지원 수준을 확인할 수 있습니다.

---


지금까지 다음 내용을 다루었습니다:

- Theming 소개 (TUI가 themeable하다는 점)
- Available Themes (GrokNight, GrokDay, TokyoNight, RosePineMoon) 상세
- Switching Themes (TUI `/theme`, config.toml, CLI flag)
- Color Support Detection (터미널 색상 지원 감지)

---


- pager.toml 상세 설정 (Terminal, Animation, Prompt, Scrollback, Block, Todo, Plugins)
- Theme 커스터마이징 (색상, 레이아웃, 애니메이션 세밀 조정)
- Best Practices (테마 선택 가이드)

---


## Theme 파일 직접 커스터마이징 (고급)

Grok Build의 Theme은 `pager.toml`에서 세밀하게 커스터마이징할 수 있습니다.

### 색상 팔레트 상세

```toml
[colors]
background = "#1a1a2e"          # 배경색
foreground = "#eaeaea"          # 기본 텍스트 색상
accent = "#00d4ff"              # 악센트 색상 (강조)
error = "#ff6b6b"               # 에러 색상
warning = "#ffd93d"             # 경고 색상
success = "#6bcb77"             # 성공 색상
info = "#4dabf7"                # 정보 색상
border = "#4a4a6a"              # 테두리 색상
selection = "#2d2d4a"           # 선택 영역 색상
```

### Thinking Block 색상

```toml
[colors.thinking]
border = "#5a5a8a"
background = "#1f1f3a"
text = "#b0b0d0"
```

### Tool Call 색상

```toml
[colors.tool]
border = "#4a7c59"
background = "#1a2a1f"
text = "#a0d0b0"
```

### Error Block 색상

```toml
[colors.error]
border = "#8b3a3a"
background = "#2a1a1a"
text = "#d0a0a0"
```

---

## 각 테마의 색상 팔레트 상세

### GrokNight (기본)

```toml
[colors]
background = "#1a1a2e"
foreground = "#eaeaea"
accent = "#00d4ff"
error = "#ff6b6b"
warning = "#ffd93d"
success = "#6bcb77"
```

### GrokDay (라이트)

```toml
[colors]
background = "#f5f5f5"
foreground = "#2d2d2d"
accent = "#0066cc"
error = "#cc0000"
warning = "#cc6600"
success = "#009933"
```

### TokyoNight

```toml
[colors]
background = "#1a1b26"
foreground = "#c0caf5"
accent = "#7aa2f7"
error = "#f7768e"
warning = "#e0af68"
success = "#9ece6a"
```

### RosePineMoon

```toml
[colors]
background = "#232136"
foreground = "#e0def4"
accent = "#c4a7e7"
error = "#eb6f92"
warning = "#f6c177"
success = "#9ccfd8"
```

---

## 테마 관련 문제 해결

### 색상이 이상하거나 흐릴 때

1. **Truecolor 지원 확인**
   ```bash
   echo $COLORTERM
   ```
   - `truecolor` 또는 `24bit`가 나와야 합니다.

2. **TERM 환경 변수 확인**
   ```bash
   echo $TERM
   ```
   - `xterm-256color` 또는 `tmux-256color`가 이상적입니다.

3. **tmux/Zellij 설정 확인**
   - `set -g default-terminal "tmux-256color"`
   - `set -as terminal-features ",*:RGB"`

4. **`/terminal-check` 실행**
   - Grok 안에서 `/terminal-check`를 실행하면, 정확한 해결 방법을 알려줍니다.

### 테마가 적용되지 않을 때

1. **config.toml 확인**
   ```toml
   [ui]
   theme = "tokyonight"
   ```

2. **CLI 플래그 확인**
   - `--light` 또는 `--dark` 옵션이 있는지 확인

3. **TUI에서 `/theme`로 변경**
   - `/theme` 명령어로 실시간 미리보기를 통해 변경

### 애니메이션이 부드럽지 않을 때

```toml
[animation]
enabled = true
speed = "normal"   # slow | normal | fast
```

- `speed = "slow"`로 설정하면 애니메이션이 더 부드러워집니다.

---

## 전체 가이드 마무리

`06-테마.md`를 모두 읽었다면, 이제 Grok Build의 **테마 시스템**을 이해한 것입니다.

### 핵심 요약

- Grok Build는 4개의 내장 테마를 제공합니다: GrokNight, GrokDay, TokyoNight, RosePineMoon
- 테마는 TUI(`/theme`), config.toml, CLI 플래그로 변경할 수 있습니다
- `pager.toml`에서 화면 출력 스타일을 세밀하게 커스터마이징할 수 있습니다
- Truecolor 지원 터미널에서는 TokyoNight나 RosePineMoon을, 256색 터미널에서는 GrokNight을 추천합니다
- Theme + pager.toml 조합으로 자신만의 스타일을 만들 수 있습니다

### 테마 선택 추천 (최종)

| 사용자 유형                    | 추천 테마          | 이유 |
|--------------------------------|--------------------|------|
| **처음 시작하는 사용자**       | `groknight`        | 256색 터미널에서도 잘 보임 |
| **밝은 환경 선호**             | `grokday`          | 밝은 배경, 눈이 편안함 |
| **Truecolor 터미널 사용자**    | `tokyonight`       | 현대적이고 세련된 느낌 |
| **장시간 사용, 눈이 편한 테마** | `rosepinemoon`     | 따뜻하고 부드러운 팔레트 |

---

**06-테마.md 끝**

여기까지 Grok Build의 테마 시스템을 실전 관점에서 정리했습니다.

테마는 단순한 "예쁜 색상"이 아니라, **장시간 사용 시 눈의 피로도**와 **작업 효율성**에 영향을 미치는 중요한 요소입니다.

자신의 터미널 환경과 작업 스타일에 맞는 테마를 선택하고, `pager.toml`로 세밀하게 조정하면, Grok Build를 더 쾌적하게 사용할 수 있습니다.

이 문서에서 다루지 않은 더 고급 테마 커스터마이징이나, 특정 터미널에서의 테마 문제 해결이 필요하시면 언제든 말씀해주세요.

---

*이 가이드는 다양한 테마를 실제로 사용하고 커스터마이징했던 경험을 바탕으로 작성되었습니다.*