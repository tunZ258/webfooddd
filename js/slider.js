// js/slider.js

document.addEventListener('DOMContentLoaded', () => {
    /* =========================================
       1. HERO SLIDER LOGIC
       ========================================= */
    const sliderContainer = document.getElementById('sliderContainer');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const indicatorsContainer = document.getElementById('sliderIndicators');

    // Chỉ chạy code nếu các element tồn tại trên trang (chỉ ở trang chủ)
    if (sliderContainer && slides.length > 0) {
        let currentIndex = 0;
        const totalSlides = slides.length;
        let autoSlideInterval;

        // Tự động tạo các nút Indicator dựa trên số lượng slide
        slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (index === 0) indicator.classList.add('active');
            
            // Lắng nghe sự kiện click trên từng indicator
            indicator.addEventListener('click', () => {
                goToSlide(index);
            });
            
            indicatorsContainer.appendChild(indicator);
        });

        const indicators = document.querySelectorAll('.indicator');

        // Hàm cập nhật vị trí slider và trạng thái indicator
        function updateSlider() {
            // Dịch chuyển container (mỗi slide chiếm 100% chiều rộng)
            sliderContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Cập nhật class active cho indicators
            indicators.forEach(ind => ind.classList.remove('active'));
            if (indicators[currentIndex]) {
                indicators[currentIndex].classList.add('active');
            }
        }

        // Chuyển đến slide tiếp theo
        function nextSlide() {
            currentIndex = (currentIndex === totalSlides - 1) ? 0 : currentIndex + 1;
            updateSlider();
        }

        // Quay lại slide trước đó
        function prevSlide() {
            currentIndex = (currentIndex === 0) ? totalSlides - 1 : currentIndex - 1;
            updateSlider();
        }

        // Chuyển đến một slide cụ thể (khi click indicator)
        function goToSlide(index) {
            currentIndex = index;
            updateSlider();
            resetAutoSlide(); // Reset lại bộ đếm thời gian khi người dùng tự tương tác
        }

        // Bắt đầu tự động chuyển slide sau mỗi 5 giây
        function startAutoSlide() {
            autoSlideInterval = setInterval(nextSlide, 5000);
        }

        // Reset bộ đếm tự động
        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        // Gắn sự kiện cho 2 nút Prev / Next
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoSlide();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoSlide();
            });
        }

        // Khởi động auto slide
        startAutoSlide();
    }


    /* =========================================
       2. FLASH SALE COUNTDOWN LOGIC
       ========================================= */
    const cdDays = document.getElementById('cdDays');
    const cdHours = document.getElementById('cdHours');
    const cdMins = document.getElementById('cdMins');
    const cdSecs = document.getElementById('cdSecs');

    if (cdDays && cdHours && cdMins && cdSecs) {
        // Thiết lập thời gian kết thúc (Ví dụ: cuối ngày hiện tại hoặc +1 ngày)
        const now = new Date();
        // Thiết lập Flash Sale kết thúc vào 23:59:59 của ngày hôm sau
        const flashSaleEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59).getTime();

        function updateCountdown() {
            const currentTime = new Date().getTime();
            const distance = flashSaleEnd - currentTime;

            // Nếu hết thời gian
            if (distance < 0) {
                cdDays.textContent = '00';
                cdHours.textContent = '00';
                cdMins.textContent = '00';
                cdSecs.textContent = '00';
                return;
            }

            // Tính toán Ngày, Giờ, Phút, Giây
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Cập nhật DOM (Thêm số 0 đằng trước nếu nhỏ hơn 10)
            cdDays.textContent = days.toString().padStart(2, '0');
            cdHours.textContent = hours.toString().padStart(2, '0');
            cdMins.textContent = minutes.toString().padStart(2, '0');
            cdSecs.textContent = seconds.toString().padStart(2, '0');
        }

        // Chạy hàm mỗi giây
        setInterval(updateCountdown, 1000);
        
        // Gọi ngay lần đầu tiên để tránh bị delay 1 giây khi load trang
        updateCountdown(); 
    }
});