// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Loading Animation ---
    const loader = document.getElementById('loader');
    if (loader) {
        // Giả lập thời gian load để thấy hiệu ứng
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300); // Chờ opacity transition hoàn thành
        }, 500); 
    }

    // --- 2. Dark Mode Toggle ---
    const darkModeToggle = document.getElementById('darkModeToggle');
    const root = document.documentElement;

    // Kiểm tra trạng thái Dark Mode từ LocalStorage khi khởi tạo
    if (localStorage.getItem('theme') === 'dark') {
        root.setAttribute('data-theme', 'dark');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            if (root.hasAttribute('data-theme')) {
                root.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            } else {
                root.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // --- 3. Sticky Header ---
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = 'var(--box-shadow)';
        } else {
            header.style.boxShadow = 'none';
        }
    });

    // --- 4. Hamburger Menu (Mobile) ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navbar = document.getElementById('navbar');

    if (hamburgerBtn && navbar) {
        hamburgerBtn.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    }

    // --- 5. Back to Top Button ---
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- 6. Chức năng Search Cơ bản ---
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                // Chuyển hướng sang trang products với query parameter
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            } else {
                window.showToast('Vui lòng nhập từ khóa tìm kiếm!', 'error');
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    // Khởi tạo cập nhật số lượng giỏ hàng/yêu thích
    updateBadgeCounts();
});

// --- 7. Toast Notification Utility (Dùng chung cho toàn website) ---
// Tạo keyframes cho hiệu ứng tắt Toast
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

window.showToast = (message, type = 'success') => {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    // Đổi icon và màu sắc dựa theo loại thông báo
    const icon = type === 'success' 
        ? '<svg viewBox="0 0 24 24" width="20" height="20" stroke="#4CAF50" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
        : '<svg viewBox="0 0 24 24" width="20" height="20" stroke="#F44336" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    if (type === 'error') {
        toast.style.borderLeftColor = '#F44336';
    }

    toast.innerHTML = `${icon} <span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Tự động xóa Toast sau 3 giây
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
};

// --- 8. Hàm cập nhật Badge số lượng trên Header ---
window.updateBadgeCounts = () => {
    const cartCount = document.getElementById('cartCount');
    const wishlistCount = document.getElementById('wishlistCount');

    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        // Tính tổng số lượng sản phẩm trong giỏ
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    if (wishlistCount) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        wishlistCount.textContent = wishlist.length;
    }
};