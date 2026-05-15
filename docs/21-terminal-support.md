# 20-터미널 지원

Grok Build는 **전체 화면 TUI(Terminal User Interface)**로 동작합니다.  
이 때문에, 일부 터미널 에뮬레이터, tmux, Zellij, SSH 환경 등에서 색상, 클립보드, 마우스, 전체 화면 렌더링과 관련된 문제가 발생할 수 있습니다.

이 문서는 그런 문제들을 해결하는 방법과, Grok Build를 더 쾌적하게 사용할 수 있는 터미널 환경 설정 방법을 정리합니다.

---

## Terminal Support 문제 소개

Grok Build는 터미널에 다음과 같은 것들을 사용합니다:

- **색상**: 24-bit truecolor (16,777,216 colors)
- **클립보드**: OSC 52 escape sequence
- **마우스**: 마우스 이벤트 캡처
- **전체 화면**: Alternate Screen Buffer

이 기능들은 대부분의 현대적인 터미널에서는 잘 동작하지만, tmux, Zellij, SSH, 오래된 터미널 등에서는 추가 설정이 필요할 수 있습니다.

---

## Quick Fixes (빠른 해결 방법)

### 1. Truecolor (색상이 흐리거나 이상할 때)

```bash
# ~/.zshrc 또는 ~/.bashrc에 추가
export COLORTERM=truecolor
```

**tmux나 SSH 환경에서 추가로**:

```tmux
# ~/.tmux.conf 또는 ~/.byobu/.tmux.conf에 추가
set -g default-terminal "tmux-256color"
set -as terminal-features ",*:RGB"
```

설정 후:

```bash
tmux source-file ~/.tmux.conf
# 또는 tmux 세션 detach 후 reattach
```

### 2. 클립보드 + Passthrough (tmux에서 복사/붙여넣기가 안 될 때)

```tmux
# ~/.tmux.conf
set -g set-clipboard on
set -g allow-passthrough on
```

설정 후 tmux 설정을 다시 로드하세요.

### 3. Live Diagnostics (`/terminal-check`)

Grok 안에서 아래 슬래시 명령어를 입력하면, Grok이 현재 터미널 환경을 분석하고 정확한 해결 방법을 알려줍니다.

```bash
/terminal-check
```

이 명령어는 Grok이 감지한 터미널 정보와, 그에 맞는 정확한 수정 방법을 보여줍니다.

---

## Detected Terminals

Grok은 환경 변수(`TERM`, `COLORTERM`, `SSH_CONNECTION` 등)를 통해 사용 중인 터미널을 자동으로 감지합니다.

### Grok이 명시적으로 지원하는 터미널

- iTerm2 (macOS)
- Terminal.app (macOS)
- Alacritty
- Kitty
- WezTerm
- Windows Terminal
- GNOME Terminal
- Konsole
- tmux (설정 필요)
- Zellij (설정 필요)
- SSH (설정 필요)

각 터미널마다 최적의 설정이 다를 수 있습니다. `/terminal-check`를 실행하면 Grok이 자동으로 진단해줍니다.

---


지금까지 다음 내용을 다루었습니다:

- Terminal Support 문제 소개 (TUI 특성으로 인한 이슈)
- Quick Fixes (Truecolor, tmux 설정, clipboard, passthrough)
- `/terminal-check` 명령어
- Detected Terminals

---

## tmux 환경 상세 설정

tmux는 Grok Build와 함께 사용할 때 가장 흔한 문제의 원인 중 하나입니다. 아래 설정을 추천합니다.

### tmux.conf 추천 설정

```tmux
# ~/.tmux.conf

# Truecolor 지원
set -g default-terminal "tmux-256color"
set -as terminal-features ",*:RGB"

# 클립보드 지원 (OSC 52 passthrough)
set -g set-clipboard on
set -g allow-passthrough on

# 마우스 지원
set -g mouse on

# Escape 키 지연 시간 줄이기 (Vim 사용자에게 중요)
set -s escape-time 0
```

설정 후 적용:

```bash
tmux source-file ~/.tmux.conf
# 또는 tmux 세션에서 detach 후 reattach
```

### tmux + SSH 환경

SSH로 접속해서 tmux를 사용하는 경우, 추가로 `TERM` 환경 변수를 확인하세요.

```bash
echo $TERM
```

`xterm-256color` 또는 `tmux-256color`가 나오면 좋습니다.

SSH 접속 시:

```bash
ssh -t user@host 'tmux attach || tmux new'
```

---

## Zellij 환경

Zellij는 tmux의 대안으로 인기 있지만, Grok Build와 함께 사용할 때 몇 가지 문제가 발생할 수 있습니다.

### Zellij의 주요 문제

- 많은 `Ctrl`/`Alt` 키 조합을 Zellij가 먼저 가로챔
- Escape sequence를 제대로 전달하지 못하는 경우가 있음

### Zellij 설정 추천

```kdl
// ~/.config/zellij/config.kdl

// Lock mode로 전환 (Grok 사용 시)
keybinds clear-defaults=true {
    locked {
        bind "Ctrl g" { SwitchToMode "Normal"; }
    }
    normal {
        // Grok 사용 시 필요한 키를 Zellij가 가로채지 않도록 설정
    }
}
```

**추천**: Zellij를 사용할 때는 `Ctrl+G`로 Lock mode를 활성화한 상태에서 Grok을 사용하는 것이 좋습니다.

---

## SSH 환경

SSH로 접속해서 Grok을 사용하는 경우, 아래 사항을 확인하세요.

### SSH 접속 시 추천 옵션

```bash
ssh -t user@host
```

`-t` 옵션은 pseudo-terminal을 강제로 할당합니다.

### SSH + tmux 환경

SSH → tmux → Grok 순으로 사용하는 경우, tmux 설정이 가장 중요합니다.

tmux 설정 + SSH 환경 변수 확인:

```bash
# 접속한 서버에서
echo $TERM
echo $COLORTERM
```

`tmux-256color` + `truecolor`가 이상적입니다.

### OSC 52 클립보드 in SSH

SSH에서 OSC 52 클립보드를 사용하려면, SSH 클라이언트 설정이 필요할 수 있습니다.

**macOS + iTerm2**:
- iTerm2 Preferences → Advanced → "Applications in terminal may access clipboard" → Yes

**Windows + Windows Terminal**:
- Windows Terminal 설정에서 OSC 52 지원 확인

---

## OSC 52 클립보드 지원 상세

Grok Build는 OSC 52 escape sequence를 사용해서 터미널 클립보드에 내용을 복사합니다.

### OSC 52가 동작하지 않을 때

1. **터미널이 OSC 52를 지원하는지 확인**
   - iTerm2, Kitty, Alacritty, WezTerm, Windows Terminal 등은 대부분 지원
   - 일부 오래된 터미널은 지원하지 않음

2. **tmux/Zellij passthrough 설정**
   - 위에서 설명한 tmux 설정 (`set -g allow-passthrough on`) 필요

3. **SSH 환경**
   - SSH 접속 시 OSC 52가 제대로 전달되지 않을 수 있음
   - `ssh -t` 옵션 사용
   - 터미널 설정에서 OSC 52 허용

### OSC 52 테스트

터미널에서 아래 명령어로 OSC 52를 테스트할 수 있습니다:

```bash
printf '\e]52;c;%s\a' "$(echo -n 'Hello from OSC 52' | base64)"
```

이후 터미널 클립보드에 "Hello from OSC 52"가 복사되면 성공입니다.

---

## Mouse 지원 문제 해결

Grok Build는 마우스 이벤트를 사용해서 스크롤백을 부드럽게 탐색할 수 있습니다.

### Mouse가 동작하지 않을 때

1. **tmux 설정**
   ```tmux
   set -g mouse on
   ```

2. **터미널 설정**
   - 일부 터미널은 마우스 지원을 명시적으로 활성화해야 합니다.

3. **SSH 환경**
   - SSH 접속 시 마우스 이벤트가 제대로 전달되지 않을 수 있습니다.
   - `ssh -t` 옵션 사용

### Mouse 비활성화

마우스가 오히려 방해되는 경우, `config.toml`에서 비활성화할 수 있습니다:

```toml
[ui]
mouse = false
```

---

## Fullscreen / Alternate Screen 문제

Grok Build는 터미널의 Alternate Screen Buffer를 사용해서 전체 화면을 구현합니다.

### Alternate Screen이 제대로 동작하지 않을 때

- `TERM` 환경 변수가 올바른지 확인 (`xterm-256color`, `tmux-256color` 등)
- tmux/Zellij 설정에서 `default-terminal`이 올바른지 확인

### Alternate Screen 강제 비활성화 (고급)

일부 환경에서 Alternate Screen이 문제를 일으키는 경우, `config.toml`에서 관련 설정을 조정할 수 있습니다 (고급 사용자용).

---

## 각 터미널별 추천 설정 정리

### macOS

- **iTerm2**: Truecolor 지원 우수, OSC 52 기본 지원, tmux와 잘 연동
- **Terminal.app**: Truecolor 지원 (macOS 10.14+), tmux 설정 필요
- **Kitty**: Truecolor, OSC 52, mouse 모두 우수
- **Alacritty**: Truecolor, OSC 52 지원, 설정 파일 필요

### Linux

- **GNOME Terminal**: Truecolor 지원, tmux 설정 필요
- **Konsole**: Truecolor 지원 우수
- **WezTerm**: Truecolor, OSC 52, mouse 모두 우수

### Windows

- **Windows Terminal**: Truecolor, OSC 52 지원, tmux/Zellij와 잘 연동
- **WSL2 + Windows Terminal**: 가장 추천

---


지금까지 tmux, Zellij, SSH 환경별 상세 설정, OSC 52 클립보드, Mouse 지원, Fullscreen 문제, 각 터미널별 추천 설정을 다루었습니다.

---

## `/terminal-check` 명령어 상세 활용법

`/terminal-check`는 Grok 안에서 터미널 환경을 진단하는 가장 강력한 도구입니다.

### 사용 방법

```bash
/terminal-check
```

### 출력 내용

- 현재 감지된 `TERM` 환경 변수
- `COLORTERM` 환경 변수
- SSH 접속 여부
- tmux/Zellij 사용 여부
- OSC 52 지원 여부
- Mouse 지원 여부
- Truecolor 지원 여부
- **정확한 해결 방법** (당신의 환경에 맞춤)

### 실전 활용 팁

1. **터미널 문제가 생겼을 때 가장 먼저 실행**
   - `/terminal-check`를 실행하면 Grok이 당신의 환경을 분석하고, 정확한 수정 명령을 알려줍니다.

2. **tmux/Zellij 설정 후 확인**
   - tmux.conf나 zellij 설정을 변경한 후, `/terminal-check`로 설정이 제대로 적용되었는지 확인할 수 있습니다.

3. **SSH 접속 후 확인**
   - SSH로 서버에 접속한 후, `/terminal-check`로 서버 측 터미널 설정이 올바른지 확인하세요.

4. **새로운 터미널로 변경했을 때**
   - iTerm2에서 Kitty로 바꾼 경우, `/terminal-check`로 새로운 환경에 맞는 설정을 확인하세요.

---

## 터미널 관련 문제 해결 체크리스트

터미널 문제가 발생했을 때, 아래 순서대로 확인해보세요.

### 체크리스트

1. **`/terminal-check` 실행**
   - 가장 먼저 이 명령어를 실행하세요. Grok이 정확한 해결 방법을 알려줍니다.

2. **환경 변수 확인**
   ```bash
   echo $TERM
   echo $COLORTERM
   ```
   - `TERM`이 `xterm-256color` 또는 `tmux-256color`인지 확인
   - `COLORTERM=truecolor`가 설정되어 있는지 확인

3. **tmux/Zellij 설정 확인**
   - tmux를 사용 중이라면 `~/.tmux.conf` 설정 확인
   - Zellij를 사용 중이라면 `~/.config/zellij/config.kdl` 설정 확인

4. **SSH 환경 확인**
   - `ssh -t` 옵션 사용
   - 서버 측 `TERM` 환경 변수 확인

5. **OSC 52 테스트**
   ```bash
   printf '\e]52;c;%s\a' "$(echo -n 'test' | base64)"
   ```
   - 터미널 클립보드에 "test"가 복사되는지 확인

6. **Mouse 테스트**
   - 스크롤백을 마우스로 스크롤해보기
   - 마우스가 동작하지 않으면 tmux 설정이나 터미널 설정 확인

7. **Grok 재시작**
   - 설정을 변경한 후 Grok을 완전히 재시작해보기

---

## 전체 가이드 마무리

`20-터미널-지원.md`를 모두 읽었다면, 이제 Grok Build를 **더 쾌적하고 안정적인 터미널 환경**에서 사용할 수 있는 방법을 배운 것입니다.

### 핵심 요약

- Grok Build는 TUI이기 때문에 터미널 환경에 민감합니다.
- `/terminal-check` 명령어는 가장 강력한 진단 도구입니다.
- tmux/Zellij/SSH 환경에서는 추가 설정이 필요합니다.
- OSC 52, Mouse, Truecolor는 대부분의 현대 터미널에서 지원하지만, 설정이 필요할 수 있습니다.
- 각 터미널마다 최적의 설정이 다릅니다.

### 터미널 환경 개선 추천

1. **macOS 사용자**:
   - iTerm2 또는 Kitty 사용
   - tmux 사용 시 `default-terminal "tmux-256color"` + `allow-passthrough on` 설정

2. **Linux 사용자**:
   - WezTerm 또는 Alacritty 사용
   - GNOME Terminal/Konsole도 충분히 사용 가능

3. **Windows 사용자**:
   - Windows Terminal + WSL2 조합이 가장 추천
   - tmux/Zellij도 잘 동작

4. **SSH 사용자**:
   - `ssh -t` 옵션 사용
   - 서버 측 tmux 설정 확인

---

**20-터미널-지원.md 끝**

여기까지 Grok Build를 더 쾌적하게 사용할 수 있는 터미널 환경 설정 방법을 정리했습니다.

터미널 설정은 한 번만 잘 해두면 오랫동안 편하게 Grok을 사용할 수 있습니다.

특히 `/terminal-check` 명령어를 기억해두세요. 터미널 문제가 생겼을 때 가장 먼저 실행하는 습관을 들이면, 문제를 빠르게 해결할 수 있습니다.

이 문서에서 다루지 않은 특정 터미널에서의 문제나, 더 고급 설정이 필요하시면 언제든 말씀해주세요.

---

*이 가이드는 다양한 터미널 환경에서 Grok을 사용했던 경험을 바탕으로 작성되었습니다.*


- `/terminal-check` 명령어 상세 활용법
- 터미널 관련 문제 해결 체크리스트
- 전체 가이드 마무리

---


---

## 배경 지식: 이 기능이 왜 이렇게 동작하는가

> **참고**: 이 섹션은 Grok 공식 문서에 명시된 설계 의도를 그대로 설명한 것이 아닙니다.  
> 실제 동작 방식과 관찰, 그리고 논리적 해석을 바탕으로 작성한 **참고용 설명**입니다.  
> xAI에서 공식적으로 발표한 설계 철학이 아니라는 점을 참고해 주세요.

터미널 지원 기능들이 현재와 같은 형태로 제공되는 배경과 특징을 정리했습니다.

### 1. 왜 OSC 52 클립보드를 사용하는가?

Grok Build는 TUI에서 복사/붙여넣기를 편하게 하기 위해 OSC 52 escape sequence를 사용합니다.

이 방식의 장점은:
- tmux, SSH, 원격 환경에서도 **Grok 내부의 텍스트를 시스템 클립보드로 직접 복사**할 수 있음
- 별도의 `pbcopy`, `xclip` 같은 외부 도구에 의존하지 않아도 됨

다만 tmux에서는 `set -g set-clipboard on`과 `allow-passthrough on` 설정이 필요합니다.

### 2. 왜 Alternate Screen Buffer를 사용하는가?

Grok Build의 TUI는 전체 화면을 사용합니다.  
이때 Alternate Screen Buffer를 사용하면:

- TUI가 종료되면 **이전 터미널 내용이 그대로 복원**됨
- 스크롤백이 TUI 전용으로 관리되어 깔끔함

이게 없으면 TUI 종료 후에 온갖 로그가 터미널에 남아서 지저분해질 수 있습니다.

### 3. 왜 truecolor를 강하게 권장하나?

Grok Build는 **24-bit truecolor**를 기본으로 사용합니다.  
TokyoNight, RosePineMoon 같은 예쁜 테마는 truecolor가 아니면 색이 많이 깨집니다.

그래서 시작할 때 터미널 색상 지원 수준을 자동으로 감지하고, `/terminal-check` 명령어로 진단할 수 있게 해놓았습니다.

---

## 디버깅 체크리스트

터미널 관련 문제가 발생할 때, 아래 순서대로 확인해보세요.

### 색상이 이상하거나 흐리게 나올 때

1. `export COLORTERM=truecolor`를 `~/.zshrc` 또는 `~/.bashrc`에 추가
2. tmux 사용 시:
   ```tmux
   set -g default-terminal "tmux-256color"
   set -as terminal-features ",*:RGB"
   ```
3. `/terminal-check` 명령어로 Grok이 현재 터미널을 어떻게 인식하는지 확인

### tmux에서 복사/붙여넣기가 안 될 때

```tmux
set -g set-clipboard on
set -g allow-passthrough on
```

설정 후 `tmux source-file ~/.tmux.conf` 실행.

### 마우스 이벤트가 이상할 때

- 대부분의 현대 터미널에서는 잘 동작하지만, 일부 오래된 터미널이나 SSH 환경에서는 마우스가 제대로 전달되지 않을 수 있습니다.
- 이때는 `grok --no-mouse` 플래그를 사용해보세요.

### TUI 종료 후 화면이 깨질 때

- Alternate Screen Buffer가 제대로 동작하지 않는 경우입니다.
- `reset` 명령어를 실행하면 대부분 복구됩니다.
- tmux/Zellij 안에서 자주 발생하면 해당 multiplexer 설정을 점검하세요.

### SSH 접속해서 Grok을 쓸 때 색상/클립보드가 안 될 때

- 로컬 터미널에서 `COLORTERM=truecolor`가 설정되어 있어야 합니다.
- SSH로 접속한 서버 쪽에도 같은 환경변수가 전달되어야 합니다.
- tmux를 SSH 안에서 사용한다면 tmux 설정도 같이 확인하세요.

### Vim Mode에서 키보드가 이상할 때

- 일부 터미널에서 Vim Mode의 특수 키 매핑이 제대로 안 될 수 있습니다.
- 그럴 때는 Simple Mode (`--simple` 또는 config.toml `simple_mode = true`)를 사용하는 것을 추천합니다.

---

이 두 섹션은 터미널 환경에서 Grok Build를 사용할 때 발생하는 문제를 스스로 해결할 수 있도록 돕기 위해 추가되었습니다.

