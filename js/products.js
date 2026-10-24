// js/products.js

// Biến toàn cục lưu trữ dữ liệu sản phẩm để dễ truy xuất
let globalProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch dữ liệu từ file JSON
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) throw new Error('Không thể tải dữ liệu sản phẩm');
        globalProducts = await response.json();
        
        // Khởi tạo các chức năng dựa trên trang hiện tại
        initPageLogic();
    } catch (error) {
        console.error("Lỗi fetch data:", error);
        window.showToast("Có lỗi xảy ra khi tải dữ liệu sản phẩm!", "error");
    }
});

// --- TIỆN ÍCH DÙNG CHUNG ---

// Format tiền tệ VNĐ
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Tạo HTML sao đánh giá
const generateStars = (rating) => {
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '⭐';
    }
    if (hasHalfStar) {
        starsHtml += '🌟'; // Tạm dùng icon này cho half-star
    }
    return starsHtml;
};

// Render 1 Product Card HTML
const createProductCard = (product) => {
    return `
        <div class="product-card">
            <a href="product-detail.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-img">
            </a>
            <span class="product-brand">${product.brand}</span>
            <a href="product-detail.html?id=${product.id}">
                <h3 class="product-name" title="${product.name}">${product.name}</h3>
            </a>
            <div class="rating" style="margin-bottom: 10px; font-size: 12px;">${generateStars(product.rating)} (${product.rating})</div>
            <div class="product-price">${formatPrice(product.price)}</div>
            <div class="product-actions">
                <button class="btn-add-cart" onclick="addToCart('${product.id}')">Thêm vào giỏ</button>
            </div>
        </div>
    `;
};

// Hàm thêm vào giỏ hàng (Global để gọi từ onclick)
window.addToCart = (productId, qty = 1) => {
    const product = globalProducts.find(p => p.id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += qty;
    } else {
        cart.push({ ...product, quantity: qty });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Cập nhật số lượng trên Header (hàm từ main.js)
    if(typeof window.updateBadgeCounts === 'function') {
        window.updateBadgeCounts();
    }
    
    window.showToast(`Đã thêm ${qty} "${product.name}" vào giỏ hàng!`);
};


// --- LOGIC ĐIỀU HƯỚNG THEO TRANG ---

function initPageLogic() {
    const path = window.location.pathname;

    if (path.includes('index.html') || path.endsWith('/')) {
        renderHomePage();
    } else if (path.includes('products.html')) {
        renderProductsPage();
    } else if (path.includes('product-detail.html')) {
        renderProductDetailPage();
    }
}

/* =========================================
   A. LOGIC TRANG CHỦ
   ========================================= */
function renderHomePage() {
    const flashSaleContainer = document.getElementById('flashSaleProducts');
    const featuredContainer = document.getElementById('featuredProducts');
    const bestSellerContainer = document.getElementById('bestSellerProducts');

    if (flashSaleContainer) {
        const flashSaleProducts = globalProducts.filter(p => p.isFlashSale).slice(0, 4);
        flashSaleContainer.innerHTML = flashSaleProducts.map(createProductCard).join('');
    }

    if (featuredContainer) {
        const featuredProducts = globalProducts.filter(p => p.isFeatured).slice(0, 4);
        featuredContainer.innerHTML = featuredProducts.map(createProductCard).join('');
    }

    if (bestSellerContainer) {
        const bestSellerProducts = globalProducts.filter(p => p.isBestSeller).slice(0, 4);
        bestSellerContainer.innerHTML = bestSellerProducts.map(createProductCard).join('');
    }
}

/* =========================================
   B. LOGIC TRANG DANH SÁCH SẢN PHẨM
   ========================================= */
function renderProductsPage() {
    const productsGrid = document.getElementById('allProductsGrid');
    const productCountEl = document.getElementById('productCount');
    if (!productsGrid) return;

    let filteredData = [...globalProducts];
    
    let currentPage = 1;
    const itemsPerPage = 8;

    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');

    if (categoryParam) {
        document.querySelector(`input[name="category"][value="${categoryParam}"]`)?.setAttribute('checked', true);
    }
    if (searchParam) {
        const searchInput = document.getElementById('searchInput');
        if(searchInput) searchInput.value = searchParam;
    }

    function applyFilters() {
        filteredData = [...globalProducts];

        // 1. TÍNH NĂNG TÌM KIẾM ĐÃ ĐƯỢC CẬP NHẬT (Quét Tên + Thương hiệu + Mô tả)
        const currentSearch = urlParams.get('search') || (document.getElementById('searchInput') ? document.getElementById('searchInput').value : '');
        if (currentSearch) {
            const keyword = currentSearch.toLowerCase().trim();
            filteredData = filteredData.filter(p => {
                const matchesName = p.name.toLowerCase().includes(keyword);
                const matchesBrand = p.brand.toLowerCase().includes(keyword);
                const matchesDesc = p.description ? p.description.toLowerCase().includes(keyword) : false;
                
                return matchesName || matchesBrand || matchesDesc;
            });
        }

        // 2. Category filter
        const categoryVal = document.querySelector('input[name="category"]:checked')?.value || 'all';
        if (categoryVal !== 'all') {
            filteredData = filteredData.filter(p => p.category === categoryVal);
        }

        // 3. Price filter
        const priceVal = document.querySelector('input[name="price"]:checked')?.value || 'all';
        if (priceVal === 'under50') {
            filteredData = filteredData.filter(p => p.price < 50000);
        } else if (priceVal === '50to150') {
            filteredData = filteredData.filter(p => p.price >= 50000 && p.price <= 150000);
        } else if (priceVal === 'over150') {
            filteredData = filteredData.filter(p => p.price > 150000);
        }

        // 4. Brand filter
        const brandCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        if (brandCheckboxes.length > 0) {
            const selectedBrands = Array.from(brandCheckboxes).map(cb => cb.value);
            filteredData = filteredData.filter(p => selectedBrands.includes(p.brand));
        }

        // 5. Sort
        const sortVal = document.getElementById('sortSelect')?.value || 'default';
        if (sortVal === 'priceAsc') {
            filteredData.sort((a, b) => a.price - b.price);
        } else if (sortVal === 'priceDesc') {
            filteredData.sort((a, b) => b.price - a.price);
        } else if (sortVal === 'newest') {
            filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        currentPage = 1; 
        renderGrid();
    }

    function renderGrid() {
        productCountEl.textContent = filteredData.length;

        if (filteredData.length === 0) {
            productsGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;">Không tìm thấy sản phẩm nào phù hợp.</div>';
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

        productsGrid.innerHTML = paginatedData.map(createProductCard).join('');
        renderPagination();
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        const paginationContainer = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHtml = '';
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        paginationContainer.innerHTML = paginationHtml;

        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentPage = parseInt(e.target.dataset.page);
                renderGrid();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    document.querySelectorAll('input[name="category"], input[name="price"], input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', applyFilters);
    });

    document.getElementById('sortSelect')?.addEventListener('change', applyFilters);

    document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
        document.querySelector('input[name="category"][value="all"]').checked = true;
        document.querySelector('input[name="price"][value="all"]').checked = true;
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.getElementById('sortSelect').value = 'default';
        
        window.history.pushState({}, '', 'products.html');
        applyFilters();
    });

    applyFilters();
}

/* =========================================
   C. LOGIC TRANG CHI TIẾT SẢN PHẨM
   ========================================= */
function renderProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const container = document.getElementById('productDetailContainer');
    
    if (!productId || !container) return;

    const product = globalProducts.find(p => p.id === productId);

    if (!product) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center;">Sản phẩm không tồn tại!</div>';
        return;
    }

    document.getElementById('breadcrumbName').textContent = product.name;

    // Lấy mảng ảnh hoặc tạo mảng dự phòng
    const galleryImages = (product.images && product.images.length > 0) 
                          ? product.images 
                          : [product.image];

    // Tạo HTML cho các ảnh thumbnail
    const thumbnailsHTML = galleryImages.map((imgUrl, index) => {
        const activeClass = index === 0 ? 'active' : '';
        return `<img src="${imgUrl}" 
                     class="thumbnail ${activeClass}" 
                     onclick="changeImage(this.src, this)"
                     onerror="this.src='https://placehold.co/100x100/E5E7EB/1F2937?text=Lỗi'">`;
    }).join('');

    // ĐÃ PHỤC HỒI: Đưa chuỗi HTML động vào giao diện (Cả Gallery và Thông tin)
    container.innerHTML = `
        <div class="product-gallery">
            <img src="${galleryImages[0]}" 
                 alt="${product.name}" 
                 class="main-image" 
                 id="mainImage"
                 onerror="this.src='https://placehold.co/400x400/E5E7EB/1F2937?text=Chưa+Có+Ảnh'">
            
            <div class="thumbnail-list">
                ${thumbnailsHTML}
            </div>
        </div>
        
        <div class="product-info">
            <h1 class="product-title">${product.name}</h1>
            <div class="product-meta">
                <span class="brand">Thương hiệu: <strong>${product.brand}</strong></span>
                <span class="rating">${generateStars(product.rating)} (${product.rating})</span>
            </div>
            
            <div class="product-price-large">${formatPrice(product.price)}</div>
            
            <div class="product-description-short">
                <p>${product.description}</p>
            </div>

            <div class="purchase-actions">
                <div class="quantity-control">
                    <button class="qty-btn" id="btnMinus">-</button>
                    <input type="number" id="qtyInput" class="qty-input" value="1" min="1">
                    <button class="qty-btn" id="btnPlus">+</button>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-outline" id="btnAddToCartDetail">Thêm vào giỏ</button>
                    <button class="btn btn-primary" id="btnBuyNow">Mua ngay</button>
                </div>
            </div>
        </div>
    `;

    // Cập nhật dữ liệu cho Tab Mô tả
    document.getElementById('detailDescription').textContent = product.description + " Sản phẩm được sản xuất với tiêu chuẩn chất lượng cao nhất, đảm bảo an toàn tuyệt đối cho thú cưng của bạn.";

    // Render Sản phẩm liên quan
    const relatedContainer = document.getElementById('relatedProducts');
    if (relatedContainer) {
        const related = globalProducts
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 4);
        
        if (related.length > 0) {
            relatedContainer.innerHTML = related.map(createProductCard).join('');
        } else {
            relatedContainer.innerHTML = '<p>Chưa có sản phẩm liên quan.</p>';
        }
    }

    // Logic thay đổi hình ảnh
    window.changeImage = (src, el) => {
        document.getElementById('mainImage').src = src;
        document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
        el.classList.add('active');
    };

    // Logic Tăng/Giảm số lượng
    const qtyInput = document.getElementById('qtyInput');
    document.getElementById('btnMinus').addEventListener('click', () => {
        let current = parseInt(qtyInput.value);
        if (current > 1) qtyInput.value = current - 1;
    });
    
    document.getElementById('btnPlus').addEventListener('click', () => {
        let current = parseInt(qtyInput.value);
        qtyInput.value = current + 1;
    });

    // Thêm giỏ hàng từ trang chi tiết
    document.getElementById('btnAddToCartDetail').addEventListener('click', () => {
        const qty = parseInt(qtyInput.value) || 1;
        addToCart(product.id, qty);
    });

    // Mua ngay
    document.getElementById('btnBuyNow').addEventListener('click', () => {
        const qty = parseInt(qtyInput.value) || 1;
        addToCart(product.id, qty);
        window.location.href = 'cart.html';
    });

    // Tabs Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}