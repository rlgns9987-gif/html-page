const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const consultRoutes = require('./routes/consultRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 관리자 계정 설정
const ADMIN_ID = process.env.ADMIN_ID || 'admin';
const ADMIN_PW = process.env.ADMIN_PW || 'rlgnsWkd12#';

// ========================
// Middleware
// ========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'modu-edu-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // HTTPS 사용 시 true로 변경
        maxAge: 1000 * 60 * 60 * 24 // 24시간
    }
}));

// 정적 파일 서빙 (HTML, CSS, JS, 이미지)
// admin.html은 직접 접근 차단을 위해 제외
// 변경 후 (정상)
app.use((req, res, next) => {
    if (req.path === '/admin.html') {
        return res.status(403).send('Forbidden');
    }
    next();
});
app.use(express.static(path.join(__dirname, 'public')));

// ========================
// 관리자 인증 미들웨어
// ========================
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        res.redirect('/admin/login');
    }
}

// ========================
// 관리자 라우트
// ========================

// 관리자 로그인 페이지
app.get('/admin/login', (req, res) => {
    // 이미 로그인되어 있으면 관리자 페이지로
    if (req.session && req.session.isAdmin) {
        return res.redirect('/admin');
    }
    res.sendFile(path.join(__dirname, 'views', 'admin-login.html'));
});

// 로그인 처리
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_ID && password === ADMIN_PW) {
        req.session.isAdmin = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: '아이디 또는 비밀번호가 틀렸습니다.' });
    }
});

// 로그아웃
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// 관리자 페이지 (인증 필요)
app.get('/admin', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ========================
// API Routes
// ========================
app.use('/api/consult', consultRoutes);

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 처리
app.use((req, res) => {
    res.status(404).json({ error: '페이지를 찾을 수 없습니다.' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

// ========================
// Server Start
// ========================
app.listen(PORT, () => {
    console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
    console.log(`📋 관리자 페이지: http://localhost:${PORT}/admin`);
});
