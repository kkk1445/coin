// 전역 변수 선언
let isModalOpen = false;

// 모달 관련 함수들
function showModal(modalId) {
    if (isModalOpen) return;
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        isModalOpen = true;
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        isModalOpen = false;
    }
}

// 모달 닫기 이벤트 리스너 (한 번만 등록)
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('close')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            hideModal(modal.id);
        }
    }
    if (e.target.classList.contains('modal')) {
        hideModal(e.target.id);
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isModalOpen) {
        const openModal = document.querySelector('.modal[style*="display: flex"]');
        if (openModal) {
            hideModal(openModal.id);
        }
    }
});

// 사용자 인증 관련 함수들
function login(username, password) {
    const userData = localStorage.getItem('user_' + username);
    if (!userData) {
        throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
    
    const user = JSON.parse(userData);
    if (user.password !== password) {
        throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
    
    localStorage.setItem('currentUser', username);
    return user;
}

function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

function updateUserInfo(username, email, phone) {
    const userData = JSON.parse(localStorage.getItem('user_' + username));
    if (!userData) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
    }
    
    userData.email = email;
    userData.phone = phone;
    localStorage.setItem('user_' + username, JSON.stringify(userData));
}

function changePassword(username, oldPassword, newPassword) {
    const userData = JSON.parse(localStorage.getItem('user_' + username));
    if (!userData) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
    }
    
    if (userData.password !== oldPassword) {
        throw new Error('기존 비밀번호가 일치하지 않습니다.');
    }
    
    userData.password = newPassword;
    localStorage.setItem('user_' + username, JSON.stringify(userData));
}

// 헤더 네비게이션 업데이트
function updateUserNavArea() {
    const currentUser = localStorage.getItem('currentUser');
    const userNavArea = document.getElementById('user-nav-area');
    if (!userNavArea) return;
    
    if (currentUser) {
        userNavArea.innerHTML = `
            <div class="user-dropdown">
                <button class="user-dropdown-toggle" id="user-dropdown-toggle">${currentUser} ▼</button>
                <div class="user-dropdown-menu" id="user-dropdown-menu">
                    <a href="#" id="my-info">내 정보 관리</a>
                    <a href="#" id="change-password">비밀번호 변경</a>
                    <a href="inquiry-page.html">내 문의 내역</a>
                    <a href="staking-page.html" id="my-staking-link">내 스테이킹</a>
                    <button id="logout-btn">로그아웃</button>
                </div>
            </div>
        `;
        
        // 드롭다운 메뉴 이벤트 리스너
        const toggleBtn = document.getElementById('user-dropdown-toggle');
        const menu = document.getElementById('user-dropdown-menu');
        
        if (toggleBtn && menu) {
            toggleBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                menu.classList.toggle('active');
            });
            
            document.addEventListener('click', function(e) {
                if (!menu.contains(e.target) && e.target !== toggleBtn) {
                    menu.classList.remove('active');
                }
            });
            
            // 로그아웃 버튼
            document.getElementById('logout-btn').addEventListener('click', logout);
            
            // 내 정보 관리
            document.getElementById('my-info').addEventListener('click', function(e) {
                e.preventDefault();
                const userData = JSON.parse(localStorage.getItem('user_' + currentUser));
                document.getElementById('myinfo-username').value = userData.username;
                document.getElementById('myinfo-email').value = userData.email;
                document.getElementById('myinfo-phone').value = userData.phone;
                showModal('myinfo-modal');
            });
            
            // 비밀번호 변경
            document.getElementById('change-password').addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById('pw-old').value = '';
                document.getElementById('pw-new').value = '';
                document.getElementById('pw-new-confirm').value = '';
                showModal('pwchange-modal');
            });
        }
    } else {
        userNavArea.innerHTML = '<a href="#" id="login-button">로그인</a>';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 버튼 이벤트 리스너
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'login-button') {
            e.preventDefault();
            showModal('login-modal');
        }
    });
    
    // 로그인 폼 제출
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            try {
                const username = document.getElementById('login-username').value;
                const password = document.getElementById('login-password').value;
                login(username, password);
                alert(username + '님, 로그인 되었습니다!');
                hideModal('login-modal');
                updateUserNavArea();
            } catch (error) {
                alert(error.message);
            }
        });
    }
    
    // 내 정보 관리 폼 제출
    const myinfoForm = document.getElementById('myinfo-form');
    if (myinfoForm) {
        myinfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            try {
                const currentUser = localStorage.getItem('currentUser');
                const email = document.getElementById('myinfo-email').value;
                const phone = document.getElementById('myinfo-phone').value;
                
                if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
                    throw new Error('올바른 이메일 형식이 아닙니다.');
                }
                if (!/^01[0-9]{1}[0-9]{3,4}[0-9]{4}$/.test(phone)) {
                    throw new Error('올바른 휴대폰 번호를 입력하세요.');
                }
                
                updateUserInfo(currentUser, email, phone);
                alert('정보가 저장되었습니다.');
                hideModal('myinfo-modal');
            } catch (error) {
                alert(error.message);
            }
        });
    }
    
    // 비밀번호 변경 폼 제출
    const pwchangeForm = document.getElementById('pwchange-form');
    if (pwchangeForm) {
        pwchangeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            try {
                const currentUser = localStorage.getItem('currentUser');
                const oldPw = document.getElementById('pw-old').value;
                const newPw = document.getElementById('pw-new').value;
                const newPw2 = document.getElementById('pw-new-confirm').value;
                
                if (newPw.length < 8 || !/[A-Z]/.test(newPw) || !/[a-z]/.test(newPw) || !/[0-9]/.test(newPw) || !/[!@#$%^&*]/.test(newPw)) {
                    throw new Error('새 비밀번호는 8자 이상, 대/소문자, 숫자, 특수문자를 모두 포함해야 합니다.');
                }
                if (newPw !== newPw2) {
                    throw new Error('새 비밀번호가 일치하지 않습니다.');
                }
                
                changePassword(currentUser, oldPw, newPw);
                alert('비밀번호가 성공적으로 변경되었습니다.');
                hideModal('pwchange-modal');
            } catch (error) {
                alert(error.message);
            }
        });
    }
    
    // 헤더 네비게이션 업데이트
    updateUserNavArea();
}); 