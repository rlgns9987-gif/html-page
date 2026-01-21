document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================
    // 1. 슬라이더 기능 (모바일 무한 루프 + PC 반응형)
    // ==========================================================
    const track = document.querySelector('.reviews-track');
    const originalCards = document.querySelectorAll('.review-card');
    const nextBtn = document.querySelector('.slider-next');
    
    let currentIndex = 0;
    let isSliding = false;

    if (track && originalCards.length > 0) {
        const cloneFirst = originalCards[0].cloneNode(true);
        cloneFirst.classList.add('clone-card'); 
        cloneFirst.classList.remove('animate-on-scroll'); 
        cloneFirst.style.opacity = '1';
        cloneFirst.style.transform = 'translateY(0)';
        track.appendChild(cloneFirst);
    }

    const allCards = document.querySelectorAll('.review-card'); 

    function updateSlider(withTransition = true) {
        if (!track) return;

        if (window.innerWidth >= 768) {
            if(nextBtn) nextBtn.style.display = "none";
            track.style.flexWrap = 'wrap';
            track.style.width = '100%'; 
            track.style.transition = 'none'; 
            track.style.transform = 'none';
            originalCards.forEach(card => {
                card.style.width = '33.333%'; 
            });
        } else {
            if(nextBtn) nextBtn.style.display = "block";
            track.style.flexWrap = 'nowrap';
            track.style.width = `${allCards.length * 100}%`;
            
            allCards.forEach(card => {
                card.style.width = `${100 / allCards.length}%`;
            });

            track.style.transition = withTransition ? 'transform 0.4s ease' : 'none';
            const movePercent = currentIndex * (100 / allCards.length);
            track.style.transform = `translateX(-${movePercent}%)`;
        }
    }
    
    function nextSlide() {
        if (isSliding || window.innerWidth >= 768) return; 

        allCards.forEach(card => {
            if (card.classList.contains('animate-on-scroll')) {
                card.classList.add('is-visible');
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });

        const totalSlides = allCards.length; 
        
        currentIndex++;
        isSliding = true;
        updateSlider(true); 

        if (currentIndex === totalSlides - 1) {
            setTimeout(() => {
                currentIndex = 0; 
                updateSlider(false);
                isSliding = false;   
            }, 400); 
        } else {
            setTimeout(() => {
                isSliding = false;
            }, 400);
        }
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    window.addEventListener('resize', function() {
        currentIndex = 0;
        updateSlider(false);
    });
    
    updateSlider(false);


    // ==========================================================
    // 2. 숫자 카운트 업 애니메이션 (Hero Stats)
    // ==========================================================
    const statsSection = document.querySelector('.hero-stats');
    const statNumbers = document.querySelectorAll('.hero-stat-number');
    let statsAnimated = false;

    function parseStatValue(text) {
        const suffixMatch = text.match(/[^0-9.,\s]+$/);
        const suffix = suffixMatch ? suffixMatch[0] : '';
        const numericString = text.replace(/,/g, '').replace(suffix, '');
        const targetValue = parseFloat(numericString);
        return { targetValue, suffix };
    }

    function animateCounter(element, target, suffix, duration = 2000) {
        let startTimestamp = null;
        const startValue = 0;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOut = 1 - Math.pow(2, -10 * progress);
            
            let currentValue = startValue + (target - startValue) * easeOut;
            
            if (Number.isInteger(target)) {
                 currentValue = Math.floor(currentValue);
            } else {
                 currentValue = parseFloat(currentValue.toFixed(1));
            }

            element.textContent = currentValue.toLocaleString() + suffix;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = target.toLocaleString() + suffix;
            }
        };
        window.requestAnimationFrame(step);
    }

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                statNumbers.forEach(statNum => {
                    const originalText = statNum.textContent;
                    const { targetValue, suffix } = parseStatValue(originalText);
                    statNum.textContent = "0" + suffix;
                    animateCounter(statNum, targetValue, suffix, 2000);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    if (statsSection) {
        statsObserver.observe(statsSection);
    }


    // ==========================================================
    // 3. 스크롤 페이드 인 애니메이션
    // ==========================================================
    const scrollElements = document.querySelectorAll('.animate-on-scroll');

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    scrollElements.forEach(el => {
        scrollObserver.observe(el);
    });


    // ==========================================================
    // 4. 실시간 상담 현황 (일일 고정 랜덤)
    // ==========================================================
    const scrollerTrack = document.querySelector('.scroller-track');

    const lastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권'];
    const goals = [
        '사회복지사 2급', '전기공학', '경영학', '심리학', 
        '컴퓨터공학', '학사편입 준비', '일반편입 준비', '전기기사 응시자격', 
        '산업기사 응시자격', '대학원 진학', 'CPA 응시자격', '한국어교원'
    ];
    const educations = ['고등학교 졸업', '전문대 졸업', '4년제 졸업', '대학 중퇴', '대학 제적'];
    const methods = ['전화상담', '카카오톡'];

    function getTodaySeed() {
        const now = new Date();
        return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    }

    function getTodayDateString() {
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${mm}-${dd}`;
    }

    function mulberry32(a) {
        return function() {
          var t = a += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    const todaySeed = getTodaySeed();
    const seededRandom = mulberry32(todaySeed);
    const todayDateStr = getTodayDateString();

    function getRandomInt(max) {
        return Math.floor(seededRandom() * max);
    }

    function createScrollerItem() {
        const name = lastNames[getRandomInt(lastNames.length)] + '**';
        const goal = goals[getRandomInt(goals.length)];
        const edu = educations[getRandomInt(educations.length)];
        const method = methods[getRandomInt(methods.length)];

        const div = document.createElement('div');
        div.className = 'scroller-item';
        
        div.innerHTML = `
            <div class="scroller-info">
                <span class="scroller-name">${name}</span>
                <div class="scroller-detail">
                    ${goal} 
                    <span style="opacity:0.4; margin:0 4px">|</span> 
                    ${edu}
                </div>
            </div>
            <div style="text-align:right;display:flex;align-items:center">
                <div style="font-size:0.75rem; color:#f4df11; margin-bottom:2px; font-weight:bold;">${todayDateStr}</div>
                <span class="scroller-tag">${method}</span>
            </div>
        `;
        return div;
    }

    function initScroller() {
        if (!scrollerTrack) return;
        scrollerTrack.innerHTML = '';

        const itemCount = 8; 
        const items = [];

        for (let i = 0; i < itemCount; i++) {
            const item = createScrollerItem();
            items.push(item);
            scrollerTrack.appendChild(item);
        }

        items.forEach(item => {
            const clone = item.cloneNode(true);
            scrollerTrack.appendChild(clone);
        });
    }

    initScroller();


    // ==========================================================
    // 5. 버튼 클릭 이벤트 (스크롤 이동 & 문의 링크)
    // ==========================================================
    
    const ctaBtn = document.querySelector('.hero-cta');
    const contactSection = document.querySelector('.contact-form-section');

    if (ctaBtn && contactSection) {
        ctaBtn.addEventListener('click', function() {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    const floatingInquiryBtn = document.querySelector('.floating-inquiry');

    if (floatingInquiryBtn) {
        floatingInquiryBtn.addEventListener('click', function() {
            window.open('http://pf.kakao.com/_cxgiAX/chat', '_blank');
        });
    }


    // ==========================================================
    // 6. [신규] 상담 신청 폼 제출 (API 연동)
    // ==========================================================
    const consultForm = document.getElementById('consultForm');
    const submitBtn = document.getElementById('submitBtn');
    const successModal = document.getElementById('successModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    if (consultForm) {
        consultForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // 폼 데이터 수집
            const formData = {
                name: document.getElementById('nameInput').value.trim(),
                phone: document.getElementById('phoneInput').value.trim(),
                goals: [],
                education: null,
                contactMethod: null
            };

            // 학습목표 (다중 선택)
            const goalCheckboxes = document.querySelectorAll('input[name="goal"]:checked');
            goalCheckboxes.forEach(cb => formData.goals.push(cb.value));

            // 최종학력 (첫 번째 선택값만)
            const educationCheckboxes = document.querySelectorAll('input[name="education"]:checked');
            if (educationCheckboxes.length > 0) {
                formData.education = educationCheckboxes[0].value;
            }

            // 상담 방식
            const contactMethodRadio = document.querySelector('input[name="contact-method"]:checked');
            if (contactMethodRadio) {
                formData.contactMethod = contactMethodRadio.value;
            }

            // 유효성 검사
            if (formData.goals.length === 0) {
                alert('학습목표를 선택해주세요.');
                return;
            }
            if (!formData.education) {
                alert('최종학력을 선택해주세요.');
                return;
            }
            if (!formData.name) {
                alert('성함을 입력해주세요.');
                return;
            }
            if (!formData.phone) {
                alert('연락처를 입력해주세요.');
                return;
            }
            if (!formData.contactMethod) {
                alert('원하는 상담 방식을 선택해주세요.');
                return;
            }

            // 개인정보 동의 확인
            const privacyAgree = document.getElementById('privacyAgree');
            if (!privacyAgree.checked) {
                alert('개인정보 수집 및 이용에 동의해주세요.');
                return;
            }

            // 버튼 비활성화 (중복 제출 방지)
            submitBtn.disabled = true;
            submitBtn.textContent = '신청 중...';

            try {
                const response = await fetch('/api/consult', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    // 성공 모달 표시
                    successModal.classList.add('active');
                    
                    // 폼 초기화
                    consultForm.reset();
                } else {
                    alert(result.error || '상담 신청에 실패했습니다. 다시 시도해주세요.');
                }

            } catch (error) {
                console.error('Error:', error);
                alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '담당자 배정받기';
            }
        });
    }

    // 모달 닫기
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', function() {
            successModal.classList.remove('active');
        });
    }

    // 모달 바깥 클릭 시 닫기
    if (successModal) {
        successModal.addEventListener('click', function(e) {
            if (e.target === successModal) {
                successModal.classList.remove('active');
            }
        });
    }

});
