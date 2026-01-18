document.addEventListener('DOMContentLoaded', function() {
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
        const itemsPerSlide = getItemsPerSlide();
        const cardWidth = 100 / itemsPerSlide;
        
        if (window.innerWidth >= 768) {
            // PC: 3열 2행
            document.querySelector('.slider-btn.slider-next').style.display="none";
            track.style.flexWrap = 'wrap';
            track.style.width = `${getTotalSlides() * 100}%`;
            cards.forEach(card => {
                card.style.width = `${100 / (3 * getTotalSlides())}%`;
            });
            track.style.transform = `translateX(-${currentIndex * (100 / getTotalSlides())}%)`;
        } else {
            // 모바일: 1개씩
            document.querySelector('.slider-btn.slider-next').style.display="block";
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
    
    nextBtn.addEventListener('click', nextSlide);
    
    window.addEventListener('resize', function() {
        currentIndex = 0;
        updateSlider();
    });
    
    updateSlider();
});