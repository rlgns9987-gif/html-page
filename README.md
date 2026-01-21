# 모두에듀 - 학점은행제 상담 서비스

Express + Supabase 기반 MVC 구조 웹 애플리케이션

## 📁 폴더 구조

```
modu-edu/
├── controllers/
│   └── consultController.js   # 상담 비즈니스 로직
├── models/
│   └── supabase.js            # Supabase 클라이언트
├── routes/
│   └── consultRoutes.js       # API 라우팅
├── public/
│   ├── index.html             # 메인 페이지
│   ├── styles.css             # 스타일시트
│   ├── index.js               # 프론트엔드 스크립트
│   └── (이미지 파일들)         # logo.png, main.jpg 등
├── app.js                     # Express 서버
├── package.json
├── .env                       # 환경변수 (직접 생성 필요)
└── .env.example               # 환경변수 템플릿
```

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
```bash
cp .env.example .env
```

`.env` 파일을 열어서 Supabase 정보 입력:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
PORT=3000
```

### 3. 이미지 파일 추가
`public/` 폴더에 필요한 이미지 파일들 추가:
- logo.png
- main.jpg
- main1.png, main2.png, main3.png, main4.png
- main1_back.png, main2_back.png
- main_.png
- talk1.png

### 4. 서버 실행
```bash
# 개발 모드 (자동 재시작)
npm run dev

# 프로덕션 모드
npm start
```

### 5. 접속
브라우저에서 `http://localhost:3000` 접속

## 📡 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/consult` | 상담 신청 생성 |
| GET | `/api/consult` | 상담 목록 조회 |
| GET | `/api/consult/:id` | 상담 상세 조회 |
| DELETE | `/api/consult/:id` | 상담 삭제 |

### 상담 신청 요청 예시
```json
{
    "name": "홍길동",
    "phone": "010-1234-5678",
    "goals": ["학위취득", "편입 준비"],
    "education": "고등학교 졸업",
    "contactMethod": "전화 상담"
}
```

## 🗄️ Supabase 테이블 구조

```sql
create table consults (
    id bigint primary key generated always as identity,
    name text not null,
    phone text not null,
    goals text[],
    education text,
    contact_method text,
    created_at timestamp with time zone default now()
);
```

## 📝 라이선스

© 2024 모두에듀. All rights reserved.
