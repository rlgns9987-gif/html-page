const express = require('express');
const router = express.Router();
const consultController = require('../controllers/consultController');

// POST   /api/consult           - 상담 신청 생성
router.post('/', consultController.createConsult);

// GET    /api/consult           - 상담 목록 조회 (관리자용)
router.get('/', consultController.getConsults);

// GET    /api/consult/:id       - 상담 상세 조회
router.get('/:id', consultController.getConsultById);

// PATCH  /api/consult/:id/status - 상담 상태 업데이트
router.patch('/:id/status', consultController.updateStatus);

// DELETE /api/consult/:id       - 상담 삭제
router.delete('/:id', consultController.deleteConsult);

module.exports = router;
