document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================
    // 1. 슬라이더 기능 (모바일 무한 루프 + PC 반응형)
    // ==========================================================
    const track = document.querySelector('.reviews-track');
    const originalCards = document.querySelectorAll('.review-card'); // 원래 카드들 (6개)
    const nextBtn = document.querySelector('.slider-next');
    
    let currentIndex = 0;
    let isSliding = false; // 슬라이드 중 클릭 방지

    // [핵심 1] 복제 카드 생성 시 애니메이션 제거 (즉시 보이게 설정)
    if (track && originalCards.length > 0) {
        const cloneFirst = originalCards[0].cloneNode(true);
        cloneFirst.classList.add('clone-card'); 
        
        // 복제된 카드는 스크롤 애니메이션 클래스를 제거하고 투명도를 1로 고정
        cloneFirst.classList.remove('animate-on-scroll'); 
        cloneFirst.style.opacity = '1';
        cloneFirst.style.transform = 'translateY(0)';
        
        track.appendChild(cloneFirst);
    }

    // 복제된 카드를 포함한 전체 리스트 다시 선택
    const allCards = document.querySelectorAll('.review-card'); 

    function updateSlider(withTransition = true) {
        if (!track) return;

        // PC 화면 (768px 이상)
        if (window.innerWidth >= 768) {
            if(nextBtn) nextBtn.style.display = "none";
            track.style.flexWrap = 'wrap';
            track.style.width = '100%'; 
            track.style.transition = 'none'; 
            track.style.transform = 'none';
            originalCards.forEach(card => {
                card.style.width = '33.333%'; 
            });
        } 
        // 모바일 화면
        else {
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

        // [핵심 2] 버튼을 누르는 순간, 모든 카드의 페이드 인 대기 상태를 해제하고 즉시 보이게 함
        // 이렇게 하면 넘길 때 페이드 인 애니메이션 없이 슬라이드만 깔끔하게 됩니다.
        allCards.forEach(card => {
            if (card.classList.contains('animate-on-scroll')) {
                card.classList.add('is-visible');
                card.style.opacity = '1'; // 강제 적용
                card.style.transform = 'translateY(0)'; // 강제 적용
            }
        });

        const totalSlides = allCards.length; 
        
        // 1. 다음 슬라이드로 이동
        currentIndex++;
        isSliding = true;
        updateSlider(true); 

        // 2. 무한 루프 처리 (마지막 복제 카드 도착 시)
        if (currentIndex === totalSlides - 1) {
            setTimeout(() => {
                currentIndex = 0; 
                updateSlider(false); // 애니메이션 끄고 순간이동
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
    // 2. 숫자 카운트 업 애니메이션 (Hero Stats) - 기존 동일
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
                console.log(statNumbers)
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
    // 3. 스크롤 페이드 인 애니메이션 (이미지 포함 전체 적용)
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
    // 4. [수정] 실시간 상담 현황 (일일 고정 랜덤 - Seeded Random)
    // ==========================================================
    const scrollerTrack = document.querySelector('.scroller-track');

    // 랜덤 데이터 소스
    const lastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권'];
    const goals = [
        '사회복지사 2급', '전기공학', '경영학', '심리학', 
        '컴퓨터공학', '학사편입 준비', '일반편입 준비', '전기기사 응시자격', 
        '산업기사 응시자격', '대학원 진학', 'CPA 응시자격', '한국어교원'
    ];
    const educations = ['고등학교 졸업', '전문대 졸업', '4년제 졸업', '대학 중퇴', '대학 제적'];
    const methods = ['전화상담', '카카오톡'];

    // 1. 오늘 날짜 시드 생성 (어제와 다른 랜덤 명단을 위해)
    function getTodaySeed() {
        const now = new Date();
        return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    }

    // 2. [추가] 오늘 날짜 문자열 생성 (예: "01-20")
    function getTodayDateString() {
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${mm}-${dd}`;
    }

    // 시드 기반 난수 생성기
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
    const todayDateStr = getTodayDateString(); // 오늘 날짜 저장 (예: 01-20)

    function getRandomInt(max) {
        return Math.floor(seededRandom() * max);
    }

    // 데이터 생성 함수 (날짜 추가됨)
    function createScrollerItem() {
        const name = lastNames[getRandomInt(lastNames.length)] + '**';
        const goal = goals[getRandomInt(goals.length)];
        const edu = educations[getRandomInt(educations.length)];
        const method = methods[getRandomInt(methods.length)];

        const div = document.createElement('div');
        div.className = 'scroller-item';
        
        // HTML 구조 수정: 상세 내용 맨 뒤에 날짜 추가
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
        scrollerTrack.innerHTML = ''; // 초기화

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
    // 5. [추가] 버튼 클릭 이벤트 (스크롤 이동 & 문의 링크)
    // ==========================================================
    
    // 1) "1:1 무료 상담 받기" 버튼 클릭 시 -> 상담 폼으로 부드럽게 스크롤 이동
    const ctaBtn = document.querySelector('.hero-cta');
    const contactSection = document.querySelector('.contact-form-section');

    if (ctaBtn && contactSection) {
        ctaBtn.addEventListener('click', function() {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 2) 우측 하단 "문의" 버튼 클릭 시 -> 카카오톡 채팅방 새 창으로 열기
    const floatingInquiryBtn = document.querySelector('.floating-inquiry');

    if (floatingInquiryBtn) {
        floatingInquiryBtn.addEventListener('click', function() {
            window.open('http://pf.kakao.com/_cxgiAX/chat', '_blank');
        });
    }

});