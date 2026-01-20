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

});