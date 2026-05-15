# 02-인증

Grok Build를 처음 실행하면, **인증** 과정을 거쳐야 합니다.  
인증은 Grok이 당신의 신원을 확인하고, xAI의 서버와 안전하게 통신할 수 있게 해주는 과정입니다.

이 문서는 Grok Build에서 사용할 수 있는 다양한 인증 방법과, 각각의 장단점, 추천하는 사용 방법을 처음 사용자 관점에서 정리합니다.

---

## 인증 방법 개요

Grok Build는 다음과 같은 인증 방법을 지원합니다:

1. **Browser Login** (브라우저 로그인) — 기본, 가장 편리
2. **API Key** (API 키) — 환경 변수 또는 설정 파일에 직접 입력
3. **OIDC** (OpenID Connect) — 기업용 인증 (Google Workspace, Okta 등)
4. **External Auth** (외부 인증 제공자) — OIDC 외의 기업용 인증
5. **Device Code Flow** — 브라우저가 없는 환경 (SSH, 서버 등)에서 유용

---

## Browser Login (브라우저 로그인) — 기본 추천

Grok Build를 처음 실행하면, **브라우저 로그인**이 기본 인증 방법입니다.

### 사용 방법

```bash
grok
```

- Grok이 자동으로 브라우저를 열고, grok.com 로그인 페이지로 이동합니다.
- grok.com 계정으로 로그인하면, Grok Build가 인증 토큰을 받아옵니다.
- 인증 토큰은 `~/.grok/auth.json` 파일에 저장됩니다.

### 장점

- 가장 간단하고 빠름
- 별도의 API 키를 관리할 필요 없음
- 토큰이 자동으로 갱신됨 (7일마다 만료, Grok이 자동으로 재인증 요청)

### 단점

- 브라우저가 있는 환경에서만 사용 가능
- SSH나 서버 환경에서는 사용할 수 없음

### 인증 토큰 위치

인증 토큰은 `~/.grok/auth.json`에 저장됩니다.

- 이 파일을 삭제하면 다시 로그인해야 합니다.
- 토큰은 7일 후에 만료되며, Grok이 자동으로 재인증을 요청합니다.

**실전 팁**: 브라우저가 있는 환경이라면, **Browser Login**을 사용하는 것이 가장 편리합니다.

---

## API Key 인증

브라우저 없이 인증하고 싶거나, CI/CD 환경, SSH 서버 등에서 Grok을 사용하고 싶을 때 **API Key**를 사용합니다.

### 사용 방법

1. [grok.com](https://grok.com)에서 API 키를 발급받습니다.
2. 환경 변수로 설정합니다:

```bash
export GROK_CODE_XAI_API_KEY="xai-여러분의-키"
grok
```

또는 `~/.grok/config.toml`에 직접 설정할 수도 있습니다:

```toml
[auth]
api_key = "xai-여러분의-키"
```

### 장점

- 브라우저가 없는 환경에서도 사용 가능 (SSH, 서버, CI/CD)
- 환경 변수로 관리하면 보안상 더 안전할 수 있음

### 단점

- API 키를 직접 관리해야 함
- 키가 유출되면 보안 위험이 있음
- 키가 만료되면 직접 갱신해야 함

### API Key 관리 팁

- **환경 변수로 관리**하는 것이 `config.toml`에 직접 적는 것보다 보안상 더 안전합니다.
- `.bashrc` 또는 `.zshrc`에 export 문을 추가하면, 터미널을 열 때마다 자동으로 설정됩니다.
- CI/CD에서는 GitHub Secrets나 GitLab CI Variables에 API 키를 저장하세요.

**실전 팁**: SSH 서버나 CI/CD에서 Grok을 사용해야 한다면, **API Key**를 사용하세요.

---

## OIDC / External Auth (기업용 인증)

기업 환경(Google Workspace, Okta, Azure AD 등)에서 Grok을 사용하고 싶다면, **OIDC (OpenID Connect)** 또는 **External Auth**를 사용할 수 있습니다.

### OIDC 인증

OIDC는 "OpenID Connect"의 약자로, 기업에서 이미 사용 중인 인증 시스템(Google, Microsoft, Okta 등)을 통해 Grok에 로그인할 수 있게 해줍니다.

**설정 방법**:
- 기업 관리자가 OIDC를 설정해야 합니다.
- 설정 후, Grok Build에서 OIDC 인증을 선택하면, 기업 로그인 페이지로 이동합니다.

### External Auth

OIDC 외의 기업용 인증 시스템을 사용하는 경우, **External Auth**를 사용할 수 있습니다.

**설정 방법**:
- 기업 관리자가 External Auth를 설정해야 합니다.
- 설정 후, Grok Build에서 해당 인증 제공자를 선택하면 로그인 페이지로 이동합니다.

### 장점

- 기업에서 이미 사용 중인 계정으로 로그인 가능
- 2단계 인증(2FA) 등 기업 보안 정책을 그대로 적용할 수 있음
- 직원 계정 관리가 용이함

### 단점

- 기업 관리자가 먼저 설정해야 함
- 개인 사용자에게는 필요하지 않음

**실전 팁**: 회사에서 Grok을 도입한다면, IT/보안 팀에 OIDC 또는 External Auth 설정을 요청하세요.

---

## Device Code Flow (브라우저 없는 환경)

SSH 서버, Docker 컨테이너, CI/CD 환경 등 **브라우저가 없는 환경**에서 Grok을 사용하고 싶을 때, **Device Code Flow**를 사용할 수 있습니다.

### 사용 방법

```bash
grok --device-code
```

- Grok이 **디바이스 코드**와 **인증 URL**을 출력합니다.
- 다른 기기(컴퓨터, 스마트폰)에서 인증 URL에 접속합니다.
- 디바이스 코드를 입력합니다.
- 인증이 완료되면, Grok Build가 자동으로 인증 토큰을 받아옵니다.

### 장점

- 브라우저가 없는 환경에서도 인증 가능
- SSH, Docker, CI/CD에서 유용

### 단점

- 인증 과정이 Browser Login보다 조금 더 복잡함
- 디바이스 코드가 노출되면 보안 위험이 있음 (짧은 시간 동안만 유효)

**실전 팁**: SSH 서버에서 Grok을 처음 실행할 때, `--device-code` 옵션을 사용하세요.

---

## 인증 방법 선택 가이드

| 환경                  | 추천 인증 방법          | 이유 |
|-----------------------|-------------------------|------|
| **개인 컴퓨터** (macOS, Linux, Windows) | **Browser Login** | 가장 편리하고 빠름 |
| **SSH 서버**          | **API Key** 또는 **Device Code** | 브라우저가 없음 |
| **CI/CD** (GitHub Actions, GitLab CI 등) | **API Key** | 환경 변수로 안전하게 관리 가능 |
| **Docker 컨테이너**   | **API Key** 또는 **Device Code** | 브라우저가 없음 |
| **기업 환경** (Google Workspace, Okta 등) | **OIDC / External Auth** | 기업 보안 정책 적용 가능 |

---


지금까지 다음 내용을 다루었습니다:

- 인증 방법 개요 (Browser, API Key, OIDC, External Auth, Device Code)
- Browser Login (기본, 가장 편리)
- API Key 인증 (환경 변수 추천)
- OIDC / External Auth 개요 (기업용)
- Device Code Flow (브라우저 없는 환경)

---

## 각 인증 방법의 상세 설정

### Browser Login 상세

Browser Login은 Grok Build를 처음 실행할 때 자동으로 진행됩니다.

**설정 파일 위치**:
- 인증 토큰: `~/.grok/auth.json`

**토큰 만료**:
- 인증 토큰은 7일 후에 만료됩니다.
- Grok이 자동으로 재인증을 요청합니다.
- 토큰이 만료되면, Grok이 브라우저를 열어서 다시 로그인하도록 안내합니다.

**설정 변경**:
- Browser Login을 다른 인증 방법으로 바꾸려면, `~/.grok/auth.json` 파일을 삭제하거나, `config.toml`에서 인증 방법을 변경하세요.

### API Key 상세

API Key는 `config.toml` 또는 환경 변수로 설정할 수 있습니다.

**config.toml에 설정**:

```toml
[auth]
method = "api_key"
api_key = "xai-여러분의-키"
```

**환경 변수로 설정** (보안상 더 추천):

```bash
export GROK_CODE_XAI_API_KEY="xai-여러분의-키"
```

**환경 변수 설정 파일에 추가** (영구 설정):

```bash
# ~/.zshrc 또는 ~/.bashrc에 추가
export GROK_CODE_XAI_API_KEY="xai-여러분의-키"
```

**API Key 발급**:
- [grok.com](https://grok.com)에서 API 키를 발급받을 수 있습니다.
- "API Keys" 섹션에서 새 키를 생성하세요.

**API Key 보안**:
- API 키는 절대 Git에 커밋하지 마세요.
- `.env` 파일이나 환경 변수로 관리하세요.
- CI/CD에서는 GitHub Secrets나 GitLab CI Variables에 저장하세요.

### OIDC / External Auth 상세

OIDC / External Auth는 기업 관리자가 먼저 설정해야 합니다.

**설정 방법**:
1. 기업 IT/보안 팀에 OIDC 또는 External Auth 설정 요청
2. 설정 완료 후, Grok Build에서 해당 인증 제공자를 선택
3. 기업 로그인 페이지로 이동하여 로그인

**설정 파일** (자동 설정됨):
- Grok Build가 OIDC 설정을 자동으로 감지합니다.
- 추가 설정이 필요한 경우, 기업 관리자에게 문의하세요.

---

## 인증 토큰 위치와 관리

### 인증 토큰 위치

- **Browser Login**: `~/.grok/auth.json`
- **API Key**: `~/.grok/config.toml` 또는 환경 변수

### 인증 토큰 관리 팁

1. **토큰 삭제**:
   - `~/.grok/auth.json` 파일을 삭제하면, 다음 실행 시 다시 로그인해야 합니다.

2. **토큰 만료**:
   - Browser Login 토큰은 7일 후 만료
   - Grok이 자동으로 재인증을 요청

3. **여러 기기에서 사용**:
   - 각 기기마다 별도로 인증해야 합니다.
   - API Key는 환경 변수로 설정하면 여러 기기에서 동일하게 사용할 수 있습니다.

4. **보안**:
   - `auth.json` 파일은 600 권한으로 보호하세요 (`chmod 600 ~/.grok/auth.json`)
   - API 키는 환경 변수로 관리하는 것이 더 안전합니다.

---

## 인증 관련 문제 해결

### 1. "인증이 실패했습니다" 오류

**원인**:
- API 키가 잘못됨
- 토큰이 만료됨
- 네트워크 문제

**해결**:
- API 키가 정확한지 확인
- `~/.grok/auth.json` 파일을 삭제하고 다시 로그인
- API Key를 환경 변수로 설정했는지 확인

### 2. 브라우저가 열리지 않음

**원인**:
- 브라우저가 설치되지 않음
- SSH 환경에서 실행 중
- `DISPLAY` 환경 변수가 설정되지 않음 (Linux)

**해결**:
- SSH 환경이라면, **API Key** 또는 **Device Code Flow** 사용
- Linux에서 `export DISPLAY=:0` 설정

### 3. 토큰이 자주 만료됨

**원인**:
- 7일마다 토큰이 만료됨 (정상)

**해결**:
- Grok이 자동으로 재인증을 요청하므로, 브라우저에서 다시 로그인하면 됩니다.

### 4. API Key가 인식되지 않음

**원인**:
- 환경 변수가 설정되지 않음
- `config.toml`에 API 키가 잘못 입력됨

**해결**:
- `echo $GROK_CODE_XAI_API_KEY`로 환경 변수 확인
- `config.toml`에서 API 키가 정확한지 확인

---

## 보안 모범 사례

### 1. API Key는 환경 변수로 관리

```bash
# ~/.zshrc 또는 ~/.bashrc
export GROK_CODE_XAI_API_KEY="xai-여러분의-키"
```

- `config.toml`에 직접 적는 것보다 보안상 더 안전합니다.
- Git에 커밋되지 않습니다.

### 2. auth.json 파일 권한 설정

```bash
chmod 600 ~/.grok/auth.json
```

- 파일 소유자만 읽을 수 있게 설정하세요.

### 3. CI/CD에서는 GitHub Secrets 사용

GitHub Actions 예시:

```yaml
- name: Run Grok
  run: grok -p "코드 리뷰해줘"
  env:
    GROK_CODE_XAI_API_KEY: ${{ secrets.GROK_API_KEY }}
```

### 4. API Key 주기적 갱신

- API 키는 정기적으로 갱신하는 것이 좋습니다.
- [grok.com](https://grok.com)에서 새 키를 발급받고, 환경 변수를 업데이트하세요.

### 5. Browser Login vs API Key

- **Browser Login**: 개인 컴퓨터에서 가장 안전하고 편리
- **API Key**: SSH, CI/CD, Docker 등 브라우저가 없는 환경에서 사용
- **OIDC/External Auth**: 기업 환경에서 보안 정책을 따를 때

---


지금까지 각 인증 방법의 상세 설정, 인증 토큰 관리, 문제 해결, 그리고 보안 모범 사례를 다루었습니다.

---

## OIDC / External Auth 상세 설정 (기업용)

### OIDC (OpenID Connect) 상세

OIDC는 기업에서 이미 사용 중인 인증 시스템(Google Workspace, Microsoft Entra ID, Okta, Auth0 등)을 통해 Grok에 로그인할 수 있게 해줍니다.

**설정 과정**:

1. **기업 IT/보안 팀이 OIDC를 설정**
   - Google Workspace, Okta, Azure AD 등에서 OIDC 애플리케이션 생성
   - Grok Build를 신뢰할 수 있는 클라이언트로 등록
   - Redirect URI 설정 (Grok Build에서 제공하는 URI)

2. **Grok Build에서 OIDC 인증 선택**
   - Grok Build 실행 시, OIDC 인증 옵션을 선택
   - 기업 로그인 페이지로 자동 이동

3. **기업 계정으로 로그인**
   - 2단계 인증(2FA), SSO 등 기업 보안 정책이 그대로 적용됨

**설정 파일** (자동 설정됨):

Grok Build가 OIDC 설정을 자동으로 감지하므로, 사용자가 직접 `config.toml`에 설정할 필요는 없습니다.

**기업 관리자가 설정해야 할 내용** (참고):

- Client ID
- Client Secret (필요한 경우)
- Authorization Endpoint
- Token Endpoint
- UserInfo Endpoint
- Redirect URI

기업 IT 팀에 Grok Build OIDC 설정 가이드를 요청하세요.

### External Auth 상세

OIDC 외의 기업용 인증 시스템을 사용하는 경우, **External Auth**를 사용할 수 있습니다.

**설정 방법**은 OIDC와 유사합니다:

1. 기업 IT/보안 팀이 External Auth를 설정
2. Grok Build에서 해당 인증 제공자를 선택
3. 기업 로그인 페이지로 이동하여 로그인

**지원되는 External Auth 제공자**:

- SAML 2.0
- LDAP
- Custom OAuth 2.0
- 기타 기업용 인증 시스템

기업 IT 팀에 "Grok Build External Auth 설정"을 요청하세요.

---

## Device Code Flow 상세 (브라우저 없는 환경)

### Device Code Flow 상세 동작

Device Code Flow는 **브라우저가 없는 환경** (SSH, Docker, CI/CD, 서버 등)에서 인증을 가능하게 해주는 방법입니다.

**단계별 동작**:

1. **Grok Build 실행**
   ```bash
   grok --device-code
   ```

2. **디바이스 코드와 인증 URL 출력**
   Grok이 다음과 같은 메시지를 출력합니다:
   ```
   Visit this URL to authenticate:
   https://grok.com/device
   
   Enter this code: ABCD-1234
   ```

3. **다른 기기에서 인증**
   - 컴퓨터, 스마트폰, 태블릿 등에서 인증 URL에 접속
   - 디바이스 코드를 입력
   - grok.com 계정으로 로그인 (2FA 포함)

4. **인증 완료**
   - 인증이 완료되면, Grok Build가 자동으로 인증 토큰을 받아옵니다.
   - `~/.grok/auth.json`에 토큰이 저장됩니다.

### Device Code Flow의 특징

- **브라우저가 필요 없음**: SSH, Docker, CI/CD에서 사용 가능
- **보안**: 디바이스 코드는 짧은 시간 동안만 유효 (보통 15분)
- **2FA 지원**: 기업에서 2단계 인증을 사용하는 경우에도 적용됨

### Device Code Flow 사용 팁

**1. SSH 서버에서 사용**

```bash
ssh user@server
export GROK_CODE_XAI_API_KEY="..."  # 또는
grok --device-code
```

**2. Docker 컨테이너에서 사용**

```dockerfile
# Dockerfile
ENV GROK_CODE_XAI_API_KEY=...
# 또는
# grok --device-code 실행 후, 다른 기기에서 인증
```

**3. CI/CD에서 사용**

```yaml
# GitHub Actions
- name: Run Grok
  run: grok -p "코드 리뷰해줘"
  env:
    GROK_CODE_XAI_API_KEY: ${{ secrets.GROK_API_KEY }}
```

CI/CD에서는 **API Key**를 사용하는 것이 더 간단합니다.

### Device Code Flow의 단점

- 인증 과정이 Browser Login보다 조금 더 복잡함
- 디바이스 코드가 노출되면 보안 위험이 있음 (짧은 시간 동안만 유효)
- SSH에서 복사/붙여넣기가 불편할 수 있음

---

## 인증 관련 고급 설정 (config.toml)

### [auth] 섹션 상세

```toml
[auth]
method = "browser"                    # browser | api_key | oidc | external
api_key = "xai-..."                   # API Key (보안상 환경 변수 추천)
oidc_provider = "google"              # OIDC 제공자 (google, okta, azure 등)
external_auth_url = "https://..."     # External Auth URL (기업용)
device_code_flow = true               # Device Code Flow 강제
```

### 인증 방법 강제

```toml
[auth]
method = "api_key"                    # Browser Login을 사용하지 않고 API Key만 사용
```

### OIDC 제공자 지정

```toml
[auth]
method = "oidc"
oidc_provider = "okta"                # google, okta, azure, custom
```

### External Auth URL 지정

```toml
[auth]
method = "external"
external_auth_url = "https://auth.company.com/grok"
```

---

## 전체 가이드 마무리

`02-인증.md`를 모두 읽었다면, 이제 Grok Build의 **인증 방법**을 모두 이해한 것입니다.

### 핵심 요약

- **Browser Login**: 개인 컴퓨터에서 가장 편리 (기본)
- **API Key**: SSH, CI/CD, Docker 등 브라우저 없는 환경에서 사용
- **OIDC / External Auth**: 기업 환경에서 보안 정책을 따를 때
- **Device Code Flow**: 브라우저 없는 환경에서 인증이 필요한 경우

### 인증 방법 선택 가이드 (최종)

| 환경                        | 추천 인증 방법              | 이유 |
|-----------------------------|-----------------------------|------|
| **개인 컴퓨터**             | **Browser Login**           | 가장 편리하고 빠름 |
| **SSH 서버**                | **API Key** 또는 **Device Code** | 브라우저가 없음 |
| **CI/CD**                   | **API Key**                 | 환경 변수로 안전하게 관리 |
| **Docker 컨테이너**         | **API Key** 또는 **Device Code** | 브라우저가 없음 |
| **기업 환경** (Google, Okta) | **OIDC / External Auth**    | 기업 보안 정책 적용 가능 |

### 보안 모범 사례 (최종)

1. **API Key는 환경 변수로 관리** (`GROK_CODE_XAI_API_KEY`)
2. **`auth.json` 파일 권한 설정** (`chmod 600`)
3. **CI/CD에서는 GitHub Secrets 사용**
4. **API Key 주기적 갱신**
5. **Browser Login vs API Key**:
   - Browser Login: 개인 컴퓨터 (가장 안전하고 편리)
   - API Key: SSH, CI/CD, Docker (브라우저 없는 환경)

---

**02-인증.md 끝**

여기까지 Grok Build의 인증 방법을 실전 관점에서 정리했습니다.

인증은 Grok Build를 안전하게 사용하는 첫걸음입니다.  
환경에 맞는 인증 방법을 선택하고, 보안 모범 사례를 지키면, Grok Build를 안심하고 사용할 수 있습니다.

이 문서에서 다루지 않은 더 고급 인증 설정이나, 특정 기업 환경에서의 OIDC 설정이 필요하시면 언제든 말씀해주세요.

---

*이 가이드는 다양한 인증 방법을 실무에 도입했던 경험을 바탕으로 작성되었습니다.*

지금까지 각 인증 방법의 상세 설정, 인증 토큰 관리, 문제 해결, 그리고 보안 모범 사례를 다루었습니다.

---


- OIDC / External Auth 상세 설정
- Device Code Flow 상세
- 인증 관련 고급 설정 (config.toml)
- 전체 가이드 마무리

---



- 각 인증 방법의 상세 설정 (config.toml, 환경 변수)
- 인증 토큰 위치와 관리
- 인증 관련 문제 해결 (토큰 만료, 인증 실패 등)
- 보안 모범 사례

---


