const supabase = require('../models/supabase');
const nodemailer = require('nodemailer');
const axios = require('axios'); // 추가됨

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
    host: 'smtp.naver.com',  // 네이버 SMTP 서버 주소
    port: 465,               // 네이버는 465 포트(SSL)를 권장합니다.
    secure: true,            // 465 포트를 쓸 때는 true로 설정해야 합니다.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // 인증서 에러 무시 (Vercel 환경에서 종종 필요)
    },
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
    socketTimeout: 10000
});

// 이메일 발송 함수
async function sendEmail(to, consultData) {
    const date = new Date(consultData.created_at);
    
    const mailOptions = {
        from: '"모두에듀" <rlgns987@naver.com>',
        to: to,
        subject: `[모두에듀] 새 상담 신청 - ${consultData.name}`,
        html: `
            <h2>새 상담 신청이 접수되었습니다</h2>
            <table border="1" cellpadding="10" style="border-collapse: collapse;">
                <tr><td><strong>ID</strong></td><td>${consultData.id}</td></tr>
                <tr><td><strong>이름</strong></td><td>${consultData.name}</td></tr>
                <tr><td><strong>연락처</strong></td><td>${consultData.phone}</td></tr>
                <tr><td><strong>학습목표</strong></td><td>${consultData.goals.join(', ')}</td></tr>
                <tr><td><strong>최종학력</strong></td><td>${consultData.education}</td></tr>
                <tr><td><strong>상담방식</strong></td><td>${consultData.contact_method}</td></tr>
                <tr><td><strong>신청시간</strong></td><td>${date.toLocaleString('ko-KR')}</td></tr>
            </table>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('이메일 발송 성공:', to);
    } catch (error) {
        console.error('이메일 발송 실패:', error);
    }
}

// 디스코드 알림 발송 함수
async function sendDiscordNotification(consultData) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL; // 디스코드 웹훅 URL
    if (!webhookUrl) return;
    
    const manager = consultData.id % 2 ? "승민" : "기훈";
    
    const embedMessage = {
        embeds: [{
            title: "[모두에듀] 새로운 상담 신청!",
            color: 3447003, // 디스코드 브랜드 색상
            fields: [
                { name: "담당자", value:manager},
                { name: "이름", value: consultData.name},
                { name: "연락처", value: consultData.phone},
                { name: "학습목표", value: consultData.goals.join(', ') },
                { name: "최종학력", value: consultData.education},
                { name: "상담방식", value: consultData.contact_method}
            ],
            timestamp: new Date(),
            footer: { text: "실시간 상담 알림" }
        }]
    };

    try {
        await axios.post(webhookUrl, embedMessage);
        console.log('디스코드 알림 발송 성공');
    } catch (error) {
        console.error('디스코드 알림 발송 실패:', error);
    }
}

// 통계 조회 (누적 신청 수, 오늘 신청 수, 오늘 신청자 목록)
exports.getStats = async (req, res) => {
    try {
        // 오늘 날짜 범위 계산 (한국 시간 기준)
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayStartUTC = new Date(todayStart.getTime());
        
        const todayEnd = new Date();
        todayEnd.setUTCHours(23, 59, 59, 999);
        const todayEndUTC = new Date(todayEnd.getTime());

        // 1. 전체 누적 신청 수
        const { count: totalCount, error: totalError } = await supabase
            .from('consults')
            .select('*', { count: 'exact', head: true });

        if (totalError) {
            console.error('Total count error:', totalError);
        }

        // 2. 오늘 신청 수 및 오늘 신청자 목록
        const { data: todayData, error: todayError } = await supabase
            .from('consults')
            .select('id, name, goals, education, contact_method, created_at')
            .gte('created_at', todayStartUTC.toISOString())
            .lte('created_at', todayEndUTC.toISOString())
            .order('created_at', { ascending: false });

        if (todayError) {
            console.error('Today data error:', todayError);
        }

        const todayCount = todayData ? todayData.length : 0;
        const baseTotal = 1532; // 기본 누적 수
        const dailyLimit = 20;  // 일일 신청 가능 수

        res.status(200).json({
            success: true,
            data: {
                totalCount: baseTotal + (totalCount || 0),  // 기본값 + 실제 DB 수
                todayCount: todayCount,
                remainingToday: Math.max(0, dailyLimit - todayCount),
                todayConsults: todayData || []
            }
        });

    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({
            success: false,
            error: '서버 오류가 발생했습니다.'
        });
    }
};

// 상담 신청 생성
exports.createConsult = async (req, res) => {
    try {
        const { name, phone, goals, education, contactMethod } = req.body;

        // 유효성 검사
        if (!name || !phone || !goals || !education || !contactMethod) {
            return res.status(400).json({ 
                success: false,
                error: '필수 항목을 모두 입력해주세요.' 
            });
        }

        // Supabase에 데이터 삽입
        const { data, error } = await supabase
            .from('consults')
            .insert([{
                name: name,
                phone: phone,
                goals: goals,  // 배열로 저장
                education: education,
                contact_method: contactMethod
            }])
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            return res.status(400).json({ 
                success: false,
                error: '상담 신청 저장에 실패했습니다.' 
            });
        }

        // 이메일 발송 (id 홀수/짝수에 따라)
        const savedData = data[0];
        const emailTo = savedData.id % 2 === 1 
            ? 'xhxmsja112@naver.com'   // 홀수
            : 'rlgns9987@gmail.com'; // 짝수

        await sendEmail(emailTo, savedData);
        await sendDiscordNotification(savedData);

        console.log("성공")
        res.status(201).json({ 
            success: true,
            message: '상담 신청이 완료되었습니다.',
            data: data[0]
        });

    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ 
            success: false,
            error: '서버 오류가 발생했습니다.' 
        });
    }
};

// 상담 목록 조회 (관리자용)
exports.getConsults = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('consults')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Error:', error);
            return res.status(400).json({ 
                success: false,
                error: '데이터 조회에 실패했습니다.' 
            });
        }

        res.status(200).json({ 
            success: true,
            count: data.length,
            data: data
        });

    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ 
            success: false,
            error: '서버 오류가 발생했습니다.' 
        });
    }
};

// 상담 상세 조회
exports.getConsultById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('consults')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ 
                success: false,
                error: '해당 상담 내역을 찾을 수 없습니다.' 
            });
        }

        res.status(200).json({ 
            success: true,
            data: data
        });

    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ 
            success: false,
            error: '서버 오류가 발생했습니다.' 
        });
    }
};

// 상담 삭제
exports.deleteConsult = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('consults')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ 
                success: false,
                error: '삭제에 실패했습니다.' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: '삭제되었습니다.'
        });

    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ 
            success: false,
            error: '서버 오류가 발생했습니다.' 
        });
    }
};

// 상담 상태 업데이트
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // 유효한 상태값 확인
        const validStatuses = ['pending', 'paid', 'fail'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false,
                error: '유효하지 않은 상태값입니다.' 
            });
        }

        const { data, error } = await supabase
            .from('consults')
            .update({ status: status })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            return res.status(400).json({ 
                success: false,
                error: '상태 변경에 실패했습니다.' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: '상태가 변경되었습니다.',
            data: data[0]
        });

    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ 
            success: false,
            error: '서버 오류가 발생했습니다.' 
        });
    }
};
