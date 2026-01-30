# 📼 The Void Guestbook (CRT Style)

> **"THE VOID"**
> **"고요 속의 외침..."**
>
> 이 프로젝트는 **JSP, MariaDB**를 기반으로 한 방명록 애플리케이션입니다.
> 레트로한 **CRT 모니터 효과**, **마우스 픽셀 트레일**, 그리고 독특한 **로그(Log) 형태의 텍스트 출력**을 통해 몰입감 있는 사용자 경험을 제공합니다.

---

## 🛠 Tech Stack

* **Backend**: Java Server Pages (JSP), JDBC
* **Database**: MariaDB
* **Frontend**: HTML5, CSS3 (Advanced Animations), Vanilla JavaScript
* **Server**: Apache Tomcat

---

## 📋 1. Backend Specification (JSP)

서버 사이드 로직은 데이터베이스 연결 및 방명록 데이터의 CRUD를 담당합니다.

| 구분 | 이름 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| **선언부** `S` | `dbUrl` | String | MariaDB JDBC 연결 URL |
| `S` | `dbUser` | String | DB 사용자 계정 |
| `S` | `dbPass` | String | DB 사용자 비밀번호 |
| `D` | `setupTable()` | void | `guestbook` 테이블이 존재하지 않을 경우 자동 생성 |
| **스크립틀릿** | `nickname` | String | (POST) 폼에서 전송된 작성자 닉네임 |
| `P` | `content` | String | (POST) 폼에서 전송된 방명록 내용 |
| `O` | `conn` | Connection | DB 연결 객체 |
| `O` | `pstmt` | PreparedStatement | (POST) SQL INSERT(방명록 저장) 실행 객체 |
| `V` | `selectSql` | String | (GET) 'clear' 시점 이후의 로그를 조회하는 쿼리 |
| `V` | `entries` | List | (GET) DB에서 가져온 로그 데이터를 저장하는 리스트 |
| `O` | `stmt` | Statement | (GET) SQL SELECT 실행 객체 |
| `O` | `rs` | ResultSet | (GET) `selectSql`의 실행 결과셋 |
| `V` | `entry` | String | `<닉네임 : 내용>` 형태로 가공되어 화면에 뿌려질 문자열 |

> *범례: `S`(Settings), `D`(Definition), `P`(Parameter), `O`(Object), `V`(Variable)*

---

## ⚡ 2. Frontend Logic (JavaScript)

사용자 인터랙션, 파티클 효과, 마우스 트레일 등 시각적 요소를 제어합니다.

### 2.1 데이터 및 핵심 로직
| 구분 | 이름 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| **데이터** | `guestbookEntries` | Array | JSP에서 렌더링 된 방명록 데이터 배열 |
| **렌더링** | `logContainer` | Object | `#log-container` DOM 요소 (로그가 출력될 위치) |
| | `allLogs` | String | `guestbookEntries` 배열을 공백으로 합친 문자열 |
| | `singleLogBlock` | Object | `allLogs` 전체를 감싸는 단일 `<span>` DOM 요소 |

### 2.2 비주얼 이펙트 (Visual Effects)
| 구분 | 이름 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| **파티클** | `createParticles()` | Function | `#particles` 내부에 배경 파티클 생성 |
| | `particlesContainer` | Object | `#particles` DOM 요소 |
| | `particleCount` | Number | 생성할 파티클 개수 (기본: 50) |
| **CRT 효과** | `initCRTEffects()` | Function | 화면 깜빡임, 노이즈, 진동 등 CRT 모니터 효과 초기화 |

### 2.3 마우스 트레일 (PixelTrail Class)
마우스 움직임에 따라 픽셀이 흩뿌려지는 효과를 구현한 클래스입니다.

| 메서드/변수 | 설명 |
| :--- | :--- |
| `constructor()` | 클래스 생성자 |
| `init()` | 마우스 이벤트 리스너(`mousemove`, `mouseleave`) 등록 및 초기화 |
| `onMouseMove(e)` | 마우스 이동 시 커서 좌표 업데이트 및 픽셀 생성 트리거 |
| `createPixels(x, y)` | 마우스 이동 속도에 맞춰 픽셀 생성 간격(Density) 조절 |
| `createPixel(...)` | 개별 픽셀(`pixel-trail-dot`) DOM 생성 및 애니메이션 적용 |
| `clearTrail()` | 마우스가 화면 밖으로 나갈 때 트레일 제거 |

### 2.4 이벤트 리스너 (Event Handling)
| 이벤트 | 대상 | 설명 |
| :--- | :--- | :--- |
| `DOMContentLoaded` | `window` | DOM 로드 완료 시 JS 로직 실행 |
| `submit` | `guestbookForm` | 폼 제출 시 버튼 텍스트 변경 및 중복 제출 방지 |
| `keydown/keyup` | `input` | 타이핑 시 텍스트 글로우(Glow) 효과 적용 |
| `mouseenter/leave` | `input` | 입력 필드 진입/이탈 시 커서 스타일 변경 |
| `mousemove` | `document` | `PixelTrail` 및 파티클 상호작용 트리거 |
| `beforeunload` | `window` | 페이지 이탈 시 페이드아웃 효과 |

---

## 🎨 3. Styling (CSS)

전체적인 레이아웃과 레트로 감성의 CRT/글리치 효과를 정의합니다.

### 3.1 레이아웃 (Layout)
| 선택자 (Selector) | 설명 |
| :--- | :--- |
| `html, body` | 기본 스타일, 배경색, 폰트, CRT 왜곡 효과 설정 |
| `#log-container` | **(핵심)** 방명록 로그가 표시되는 상단 컨테이너 |
| `.log-entry` | **(핵심)** 전체 로그 텍스트를 감싸는 `<span>` (줄바꿈 처리) |
| `.form-container` | **(핵심)** 중앙 입력 폼 컨테이너 (글리치 효과 포함) |

### 3.2 CRT & Visual Effects
| 선택자 (Selector) | 설명 |
| :--- | :--- |
| `#crt-screen` | CRT 효과 전체를 감싸는 오버레이 컨테이너 |
| `.scanlines` | 화면을 가로지르는 얇은 스캔라인 효과 |
| `.screen-flicker` | 오래된 모니터 같은 화면 깜빡임 |
| `.screen-noise` | 화면 지직거림(Noise) 효과 |
| `.screen-curvature` | 볼록한 브라운관 느낌의 곡면/비네팅 효과 |
| `.screen-bezel` | 모니터 테두리(베젤) 구현 |
| `.screen-beam` | 위에서 아래로 흐르는 빔(Scan) 효과 |
| `.screen-reflection` | 화면 상단의 빛 반사 효과 |

### 3.3 Interactive Elements
| 선택자 (Selector) | 설명 |
| :--- | :--- |
| `#particles`, `.particle` | 배경에 떠다니는 먼지 입자 효과 |
| `#pixel-trail` | 마우스 트레일 컨테이너 |
| `.pixel-trail-dot` | 마우스를 따라다니는 개별 사각형 픽셀 |
| `.custom-cursor` | 시스템 마우스를 대체하는 십자형 커서 |
| `.form-container h2/h3` | 폼 제목 ("THE VOID", "고요 속의 외침...") |
| `.form-container input` | 닉네임, 내용 입력창 (포커스 시 효과) |
| `.form-container button` | 'Submit' 버튼 |

---

## 🚀 How to Run

1.  **Database Setup**:
    MariaDB에 접속하여 데이터베이스를 생성합니다. (테이블은 최초 실행 시 `setupTable()`에 의해 자동 생성됩니다.)
2.  **Configuration**:
    JSP 파일 상단 선언부(`<%! ... %>`)의 `dbUrl`, `dbUser`, `dbPass`를 본인의 환경에 맞게 수정합니다.
3.  **Deploy**:
    Tomcat 서버의 `webapps` 폴더에 프로젝트를 배포하고 서버를 실행합니다.
4.  **Access**:
    브라우저에서 `http://localhost:8080/프로젝트명`으로 접속합니다.

---
*Created by dockerdie*
