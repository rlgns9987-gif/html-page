document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================
    // 1. 기존 슬라이더 기능 (유지)
    // ==========================================================
    const track = document.querySelector('.reviews-track');
    const cards = document.querySelectorAll('.review-card');
    const nextBtn = document.querySelector('.slider-next');
    
    let currentIndex = 0;
    
    function getItemsPerSlide() {
        return window.innerWidth >= 768 ? 6 : 1;
    }
    
    function getTotalSlides() {
        return Math.ceil(cards.length / getItemsPerSlide());
    }
    
    function updateSlider() {
        if (!track) return; // 에러 방지

        const itemsPerSlide = getItemsPerSlide();
        
        if (window.innerWidth >= 768) {
            // PC: 3열 2행 (전체 보임)
            if(nextBtn) nextBtn.style.display="none";
            track.style.flexWrap = 'wrap';
            track.style.width = '100%'; // PC에선 100%
            cards.forEach(card => {
                card.style.width = '33.333%'; // 3개씩
            });
            track.style.transform = 'none'; // 슬라이드 효과 제거
        } else {
            // 모바일: 1개씩 슬라이드
            if(nextBtn) nextBtn.style.display="block";
            track.style.flexWrap = 'nowrap';
            track.style.width = `${cards.length * 100}%`;
            cards.forEach(card => {
                card.style.width = `${100 / cards.length}%`;
            });
            track.style.transform = `translateX(-${currentIndex * (100 / cards.length)}%)`;
        }
    }
    
    function nextSlide() {
        const totalSlides = window.innerWidth >= 768 ? getTotalSlides() : cards.length;
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    window.addEventListener('resize', function() {
        currentIndex = 0;
        updateSlider();
    });
    
    updateSlider();


    // ==========================================================
    // 2. 숫자 카운트 업 애니메이션 (Hero Stats)
    // ==========================================================
    const statsSection = document.querySelector('.hero-stats');
    const statNumbers = document.querySelectorAll('.hero-stat-number');
    let statsAnimated = false; // 중복 실행 방지

    // 숫자와 단위(명, %)를 분리하는 함수
    function parseStatValue(text) {
        const suffixMatch = text.match(/[^0-9.,\s]+$/);
        const suffix = suffixMatch ? suffixMatch[0] : '';
        const numericString = text.replace(/,/g, '').replace(suffix, '');
        const targetValue = parseFloat(numericString);
        return { targetValue, suffix };
    }

    // 실제 카운팅 함수 (다다다닥 효과)
    function animateCounter(element, target, suffix, duration = 2000) {
        let startTimestamp = null;
        const startValue = 0;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Ease-out 효과 (끝으로 갈수록 천천히)
            const easeOut = 1 - Math.pow(2, -10 * progress);
            
            let currentValue = startValue + (target - startValue) * easeOut;
            
            // 정수/소수 처리
            if (Number.isInteger(target)) {
                 currentValue = Math.floor(currentValue);
            } else {
                 currentValue = parseFloat(currentValue.toFixed(1));
            }

            element.textContent = currentValue.toLocaleString() + suffix;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = target.toLocaleString() + suffix; // 최종값 고정
            }
        };
        window.requestAnimationFrame(step);
    }

    // 화면에 보이면 실행하는 옵저버
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                statNumbers.forEach(statNum => {
                    const originalText = statNum.textContent;
                    const { targetValue, suffix } = parseStatValue(originalText);
                    
                    statNum.textContent = "0" + suffix; // 0부터 시작
                    animateCounter(statNum, targetValue, suffix, 2000); // 2초간 실행
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    if (statsSection) {
        statsObserver.observe(statsSection);
    }


    // ==========================================================
    // 3. 스크롤 페이드 인 애니메이션 (전체 요소)
    // ==========================================================
    const scrollElements = document.querySelectorAll('.animate-on-scroll');

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                scrollObserver.unobserve(entry.target); // 한 번 나오면 끝
            }
        });
    }, { threshold: 0.1 }); // 10% 보이면 실행

    scrollElements.forEach(el => {
        scrollObserver.observe(el);
    });

});