// js/cart.js

document.addEventListener('DOMContentLoaded', () => {
    // Lấy DOM elements
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartLayout = document.getElementById('cartLayout');
    const subTotalEl = document.getElementById('subTotal');
    const shippingFeeEl = document.getElementById('shippingFee');
    const discountRow = document.getElementById('discountRow');
    const discountAmountEl = document.getElementById('discountAmount');
    const totalPriceEl = document.getElementById('totalPrice');
    
    const voucherCodeInput = document.getElementById('voucherCode');
    const applyVoucherBtn = document.getElementById('applyVoucherBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // State quản lý giỏ hàng
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let shippingFee = 30000;
    let discountPercent = 0; // Phần trăm giảm giá từ Voucher

    // Tiện ích format tiền tệ
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // 1. Hàm Render Giỏ hàng
    function renderCart() {
        // Kiểm tra giỏ hàng rỗng
        if (cart.length === 0) {
            cartLayout.innerHTML = `
                <div class="empty-cart" style="width: 100%; grid-column: 1 / -1;">
                    <svg viewBox="0 0 24 24" width="80" height="80" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    <h3 style="margin-bottom: 15px;">Giỏ hàng của bạn đang trống</h3>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">Hãy quay lại trang sản phẩm để chọn mua những thức ăn dinh dưỡng nhất cho thú cưng nhé!</p>
                    <a href="products.html" class="btn btn-primary">Tiếp tục mua sắm</a>
                </div>
            `;
            // Cập nhật số lượng badge trên Header (Hàm từ main.js)
            if(typeof window.updateBadgeCounts === 'function') window.updateBadgeCounts();
            return;
        }

        // Render HTML cho từng sản phẩm trong giỏ
        const cartHtml = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div>
                        <a href="product-detail.html?id=${item.id}" class="cart-item-name">${item.name}</a>
                        <div class="cart-item-brand">${item.brand}</div>
                    </div>
                </div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                <div>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <input type="text" class="qty-input" value="${item.quantity}" readonly>
                        <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <div>
                    <button class="btn-remove" onclick="removeCartItem(${index})" title="Xóa sản phẩm">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
        `).join('');

        cartItemsContainer.innerHTML = cartHtml;
        
        // Tính toán và hiển thị tổng tiền
        calculateSummary();
        
        // Lưu lại vào LocalStorage & Cập nhật Header
        localStorage.setItem('cart', JSON.stringify(cart));
        if(typeof window.updateBadgeCounts === 'function') window.updateBadgeCounts();
    }

    // 2. Cập nhật số lượng sản phẩm
    window.updateQuantity = (index, delta) => {
        let newQuantity = cart[index].quantity + delta;
        
        if (newQuantity < 1) {
            // Nếu giảm về 0 thì hỏi có muốn xóa không
            const confirmDelete = confirm('Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?');
            if (confirmDelete) {
                removeCartItem(index);
            }
            return;
        }
        
        cart[index].quantity = newQuantity;
        renderCart();
    };

    // 3. Xóa sản phẩm khỏi giỏ
    window.removeCartItem = (index) => {
        const removedItemName = cart[index].name;
        cart.splice(index, 1);
        renderCart();
        window.showToast(`Đã xóa "${removedItemName}" khỏi giỏ hàng.`);
    };

    // 4. Tính toán Tóm tắt đơn hàng
    function calculateSummary() {
        // Tạm tính (Subtotal)
        const subTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Miễn phí vận chuyển nếu đơn hàng > 500k
        shippingFee = subTotal > 500000 ? 0 : 30000;
        
        // Giảm giá (Discount)
        const discountAmount = (subTotal * discountPercent) / 100;

        // Tổng tiền (Total)
        const total = subTotal + shippingFee - discountAmount;

        // Render Text
        subTotalEl.textContent = formatPrice(subTotal);
        
        if (shippingFee === 0) {
            shippingFeeEl.textContent = "Miễn phí";
            shippingFeeEl.style.color = "var(--primary-color)";
        } else {
            shippingFeeEl.textContent = formatPrice(shippingFee);
            shippingFeeEl.style.color = "var(--text-main)";
        }

        if (discountAmount > 0) {
            discountRow.style.display = 'flex';
            discountAmountEl.textContent = '-' + formatPrice(discountAmount);
        } else {
            discountRow.style.display = 'none';
        }

        totalPriceEl.textContent = formatPrice(total);
    }

    // 5. Logic xử lý Voucher (Mã giảm giá giả lập)
    if (applyVoucherBtn) {
        applyVoucherBtn.addEventListener('click', () => {
            const code = voucherCodeInput.value.trim().toUpperCase();
            
            if (!code) {
                window.showToast('Vui lòng nhập mã giảm giá', 'error');
                return;
            }

            // Giả lập logic mã giảm giá
            if (code === 'PETLOVE10') {
                discountPercent = 10;
                window.showToast('Áp dụng mã giảm giá 10% thành công!');
                calculateSummary();
            } else if (code === 'FREESHIP') {
                // Ví dụ mã freeship
                discountPercent = 0;
                shippingFee = 0;
                window.showToast('Áp dụng mã Miễn phí vận chuyển thành công!');
                calculateSummary();
            } else {
                window.showToast('Mã giảm giá không hợp lệ hoặc đã hết hạn', 'error');
                discountPercent = 0;
                calculateSummary();
            }
        });
    }

    // 6. Xử lý nút Thanh toán
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            
            // Xóa giỏ hàng và thông báo thành công (Giả lập thanh toán)
            cart = [];
            localStorage.removeItem('cart');
            renderCart();
            
            alert('🎉 Đặt hàng thành công! Cảm ơn bạn đã tin tưởng PET FOOD STORE.');
            window.location.href = 'index.html';
        });
    }

    // Gọi hàm render lần đầu khi tải trang
    renderCart();
});