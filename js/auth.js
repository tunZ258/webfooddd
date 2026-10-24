// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các Form Elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Hàm tiện ích: Kiểm tra định dạng Email bằng Regex
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Hàm tiện ích: Hiển thị lỗi cho một Input
    const showError = (groupId, errorId, message) => {
        const group = document.getElementById(groupId);
        const errorEl = document.getElementById(errorId);
        if (group && errorEl) {
            group.classList.add('error');
            errorEl.textContent = message;
        }
    };

    // Hàm tiện ích: Xóa lỗi của một Input
    const clearError = (groupId, errorId) => {
        const group = document.getElementById(groupId);
        const errorEl = document.getElementById(errorId);
        if (group && errorEl) {
            group.classList.remove('error');
            errorEl.textContent = '';
        }
    };

    /* =========================================
       1. VALIDATE FORM ĐĂNG NHẬP
       ========================================= */
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Ngăn chặn reload trang
            let isValid = true;

            // Lấy giá trị
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            // Validate Email
            if (!email) {
                showError('emailGroup', 'emailError', 'Vui lòng nhập email');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError('emailGroup', 'emailError', 'Định dạng email không hợp lệ');
                isValid = false;
            } else {
                clearError('emailGroup', 'emailError');
            }

            // Validate Password
            if (!password) {
                showError('passwordGroup', 'passwordError', 'Vui lòng nhập mật khẩu');
                isValid = false;
            } else {
                clearError('passwordGroup', 'passwordError');
            }

            // Xử lý khi Form hợp lệ
            if (isValid) {
                // Giả lập gọi API Đăng nhập thành công
                window.showToast('Đăng nhập thành công! Đang chuyển hướng...', 'success');
                
                // Lưu trạng thái đăng nhập vào LocalStorage (Tùy chọn)
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);

                // Chuyển hướng về trang chủ sau 1.5s
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        });
    }

    /* =========================================
       2. VALIDATE FORM ĐĂNG KÝ
       ========================================= */
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            // Lấy giá trị
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value.trim();
            const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();

            // Validate Name
            if (!name) {
                showError('nameGroup', 'nameError', 'Vui lòng nhập họ và tên');
                isValid = false;
            } else {
                clearError('nameGroup', 'nameError');
            }

            // Validate Email
            if (!email) {
                showError('regEmailGroup', 'regEmailError', 'Vui lòng nhập email');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError('regEmailGroup', 'regEmailError', 'Định dạng email không hợp lệ');
                isValid = false;
            } else {
                clearError('regEmailGroup', 'regEmailError');
            }

            // Validate Password
            if (!password) {
                showError('regPasswordGroup', 'regPasswordError', 'Vui lòng nhập mật khẩu');
                isValid = false;
            } else if (password.length < 6) {
                showError('regPasswordGroup', 'regPasswordError', 'Mật khẩu phải có ít nhất 6 ký tự');
                isValid = false;
            } else {
                clearError('regPasswordGroup', 'regPasswordError');
            }

            // Validate Confirm Password
            if (!confirmPassword) {
                showError('confirmPasswordGroup', 'confirmPasswordError', 'Vui lòng xác nhận mật khẩu');
                isValid = false;
            } else if (password !== confirmPassword) {
                showError('confirmPasswordGroup', 'confirmPasswordError', 'Mật khẩu xác nhận không khớp');
                isValid = false;
            } else {
                clearError('confirmPasswordGroup', 'confirmPasswordError');
            }

            // Xử lý khi Form hợp lệ
            if (isValid) {
                // Giả lập gọi API Đăng ký thành công
                window.showToast('Đăng ký tài khoản thành công! Vui lòng đăng nhập.', 'success');
                
                // Reset form
                registerForm.reset();

                // Chuyển hướng sang trang đăng nhập sau 1.5s
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
        });
    }

    /* Xóa thông báo lỗi khi người dùng bắt đầu gõ lại vào ô Input */
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // parentElement chính là thẻ div.form-group chứa input đó
            this.parentElement.classList.remove('error');
        });
    });
});