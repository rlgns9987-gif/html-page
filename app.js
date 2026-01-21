const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const consultRoutes = require('./routes/consultRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================
// Middleware
// ========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 (HTML, CSS, JS, 이미지)
app.use(express.static(path.join(__dirname, 'public')));

// ========================
// Routes
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
});
