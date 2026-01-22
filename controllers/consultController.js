const supabase = require('../models/supabase');

// 통계 조회 (누적 신청 수, 오늘 신청 수, 오늘 신청자 목록)
exports.getStats = async (req, res) => {
    try {
        // 오늘 날짜 범위 계산 (한국 시간 기준)
        const now = new Date();
        const koreaOffset = 9 * 60 * 60 * 1000; // UTC+9
        const koreaTime = new Date(now.getTime() + koreaOffset);
        
        const todayStart = new Date(koreaTime);
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayStartUTC = new Date(todayStart.getTime() - koreaOffset);
        
        const todayEnd = new Date(koreaTime);
        todayEnd.setUTCHours(23, 59, 59, 999);
        const todayEndUTC = new Date(todayEnd.getTime() - koreaOffset);

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
        const dailyLimit = 30;  // 일일 신청 가능 수

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
        const validStatuses = ['pending', 'success', 'fail'];
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
