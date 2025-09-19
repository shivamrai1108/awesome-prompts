// Simple Authentication System for Prompt Library
class AuthSystem {
    constructor() {
        this.storageKey = 'promptLibraryAuth';
        this.currentUser = this.loadCurrentUser();
    }

    // Load current user from storage
    loadCurrentUser() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error loading user:', error);
            return null;
        }
    }

    // Save user to storage
    saveCurrentUser(user) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(user));
            this.currentUser = user;
            return true;
        } catch (error) {
            console.error('Error saving user:', error);
            return false;
        }
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Simple email/name login (no password for demo)
    login(email, name = null) {
        if (!email || !this.isValidEmail(email)) {
            return { success: false, error: 'Invalid email address' };
        }

        const user = {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            email: email,
            name: name || email.split('@')[0],
            loginTime: new Date().toISOString(),
            isAuthenticated: true
        };

        if (this.saveCurrentUser(user)) {
            // Transfer anonymous votes to authenticated user
            this.transferAnonymousVotes(user.id);
            
            return { 
                success: true, 
                user: user,
                message: 'Logged in successfully' 
            };
        }

        return { success: false, error: 'Failed to save user data' };
    }

    // Guest login (anonymous but with optional name)
    loginAsGuest(name = 'Guest User') {
        const user = {
            id: 'guest_' + Math.random().toString(36).substr(2, 9),
            name: name,
            email: null,
            loginTime: new Date().toISOString(),
            isGuest: true,
            isAuthenticated: false
        };

        if (this.saveCurrentUser(user)) {
            return { 
                success: true, 
                user: user,
                message: 'Logged in as guest' 
            };
        }

        return { success: false, error: 'Failed to create guest session' };
    }

    // Transfer votes from anonymous user to authenticated user
    transferAnonymousVotes(newUserId) {
        try {
            // Get existing voting system
            const votingSystem = window.votingSystem;
            if (votingSystem && votingSystem.userVotes) {
                // Update the user ID in voting system
                votingSystem.userId = newUserId;
                // Save votes under new user ID
                votingSystem.saveUserVotes();
            }
        } catch (error) {
            console.error('Error transferring votes:', error);
        }
    }

    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.storageKey);
        
        // Optionally clear votes or keep them
        return { success: true, message: 'Logged out successfully' };
    }

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Get user display name
    getDisplayName() {
        if (!this.currentUser) return 'Anonymous';
        return this.currentUser.name || this.currentUser.email || 'User';
    }

    // Check if user can vote
    canVote() {
        // Allow voting for all users (authenticated, guest, or anonymous)
        return true;
    }

    // Get user voting permissions
    getVotingPermissions() {
        const basePermissions = {
            canVote: true,
            canViewVotes: true,
            canSubmitPrompts: false
        };

        if (!this.currentUser) {
            // Anonymous user - basic permissions
            return basePermissions;
        }

        if (this.currentUser.isGuest) {
            // Guest user - slightly more permissions
            return {
                ...basePermissions,
                canSubmitPrompts: true
            };
        }

        // Authenticated user - full permissions
        return {
            ...basePermissions,
            canSubmitPrompts: true,
            canViewPersonalStats: true,
            canExportData: true
        };
    }

    // Get user stats
    getUserStats() {
        if (!window.votingSystem) return null;

        const votingData = window.votingSystem.exportUserVotes();
        const permissions = this.getVotingPermissions();

        return {
            user: this.currentUser,
            permissions: permissions,
            votingStats: votingData,
            sessionTime: this.currentUser ? new Date() - new Date(this.currentUser.loginTime) : null
        };
    }
}

// Login Modal HTML Template
const LOGIN_MODAL_HTML = `
<div id="loginModal" class="modal-overlay" style="display: none;">
    <div class="modal-content">
        <div class="modal-header">
            <h2>🔐 Login to Vote & Contribute</h2>
            <button class="modal-close" onclick="authSystem.closeLoginModal()">&times;</button>
        </div>
        
        <div class="modal-body">
            <div class="login-options">
                <!-- Email Login -->
                <div class="login-option">
                    <h3>📧 Login with Email</h3>
                    <p class="login-description">Get full access to voting, contributions, and personal stats</p>
                    <form id="emailLoginForm" class="login-form">
                        <input type="email" id="emailInput" placeholder="Enter your email" required>
                        <input type="text" id="nameInput" placeholder="Your name (optional)">
                        <button type="submit" class="btn btn-primary">Login with Email</button>
                    </form>
                </div>

                <!-- Guest Login -->
                <div class="login-option">
                    <h3>👤 Continue as Guest</h3>
                    <p class="login-description">Vote and contribute without providing email</p>
                    <form id="guestLoginForm" class="login-form">
                        <input type="text" id="guestNameInput" placeholder="Your name (optional)" value="Guest User">
                        <button type="submit" class="btn btn-secondary">Continue as Guest</button>
                    </form>
                </div>

                <!-- Anonymous Option -->
                <div class="login-option">
                    <h3>🕶️ Stay Anonymous</h3>
                    <p class="login-description">Browse and vote without any identification</p>
                    <button onclick="authSystem.closeLoginModal()" class="btn btn-outline">Continue Anonymously</button>
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <p class="privacy-note">
                🔒 Your data stays local - no server registration required.<br>
                We respect your privacy and don't track personal information.
            </p>
        </div>
    </div>
</div>`;

// User Profile Widget HTML
const USER_PROFILE_HTML = `
<div id="userProfile" class="user-profile">
    <div class="user-info">
        <span class="user-name" id="userName">Anonymous</span>
        <span class="user-type" id="userType"></span>
    </div>
    <div class="user-actions">
        <button id="userMenuBtn" class="user-menu-btn" onclick="authSystem.toggleUserMenu()">⚙️</button>
        <div id="userMenu" class="user-menu" style="display: none;">
            <a href="#" onclick="authSystem.showUserStats()">📊 My Stats</a>
            <a href="#" onclick="authSystem.showLoginModal()">🔐 Login</a>
            <a href="#" onclick="authSystem.logout()">🚪 Logout</a>
        </div>
    </div>
</div>`;

// Enhanced Auth System with UI
class AuthSystemWithUI extends AuthSystem {
    constructor() {
        super();
        this.initializeUI();
        this.setupEventListeners();
    }

    // Initialize UI components
    initializeUI() {
        // Add login modal to page
        document.body.insertAdjacentHTML('beforeend', LOGIN_MODAL_HTML);
        
        // Add user profile widget to header
        const header = document.querySelector('header') || document.querySelector('.header');
        if (header) {
            header.insertAdjacentHTML('beforeend', USER_PROFILE_HTML);
        }

        this.updateUserUI();
    }

    // Setup event listeners
    setupEventListeners() {
        // Email login form
        const emailForm = document.getElementById('emailLoginForm');
        if (emailForm) {
            emailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('emailInput').value;
                const name = document.getElementById('nameInput').value;
                this.handleEmailLogin(email, name);
            });
        }

        // Guest login form
        const guestForm = document.getElementById('guestLoginForm');
        if (guestForm) {
            guestForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('guestNameInput').value;
                this.handleGuestLogin(name);
            });
        }

        // Close modal on outside click
        document.getElementById('loginModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeLoginModal();
            }
        });
    }

    // Handle email login
    handleEmailLogin(email, name) {
        const result = this.login(email, name);
        if (result.success) {
            this.closeLoginModal();
            this.updateUserUI();
            this.showMessage(result.message, 'success');
        } else {
            this.showMessage(result.error, 'error');
        }
    }

    // Handle guest login
    handleGuestLogin(name) {
        const result = this.loginAsGuest(name);
        if (result.success) {
            this.closeLoginModal();
            this.updateUserUI();
            this.showMessage(result.message, 'success');
        } else {
            this.showMessage(result.error, 'error');
        }
    }

    // Show login modal
    showLoginModal() {
        document.getElementById('loginModal').style.display = 'flex';
    }

    // Close login modal
    closeLoginModal() {
        document.getElementById('loginModal').style.display = 'none';
    }

    // Toggle user menu
    toggleUserMenu() {
        const menu = document.getElementById('userMenu');
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }

    // Update user UI
    updateUserUI() {
        const userName = document.getElementById('userName');
        const userType = document.getElementById('userType');
        
        if (userName) {
            userName.textContent = this.getDisplayName();
        }
        
        if (userType) {
            if (!this.currentUser) {
                userType.textContent = '(Anonymous)';
                userType.className = 'user-type anonymous';
            } else if (this.currentUser.isGuest) {
                userType.textContent = '(Guest)';
                userType.className = 'user-type guest';
            } else {
                userType.textContent = '(Registered)';
                userType.className = 'user-type registered';
            }
        }
    }

    // Show user stats
    showUserStats() {
        const stats = this.getUserStats();
        alert(`User Stats:\nVotes Cast: ${stats.votingStats.totalVotes}\nUser Type: ${this.currentUser ? (this.currentUser.isGuest ? 'Guest' : 'Registered') : 'Anonymous'}`);
    }

    // Enhanced logout
    logout() {
        const result = super.logout();
        if (result.success) {
            this.updateUserUI();
            this.showMessage(result.message, 'success');
            // Hide user menu
            document.getElementById('userMenu').style.display = 'none';
        }
        return result;
    }

    // Show message to user
    showMessage(message, type = 'info') {
        // Create or update message element
        let messageEl = document.getElementById('authMessage');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'authMessage';
            messageEl.className = 'auth-message';
            document.body.appendChild(messageEl);
        }
        
        messageEl.textContent = message;
        messageEl.className = `auth-message ${type}`;
        messageEl.style.display = 'block';
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }

    // Check if user should be prompted to login
    shouldPromptLogin(action = 'vote') {
        // For voting, you can choose different policies:
        
        // Option 1: Never require login (current behavior)
        return false;
        
        // Option 2: Require login for voting
        // return !this.isLoggedIn();
        
        // Option 3: Prompt after certain number of anonymous votes
        // const anonymousVotes = Object.keys(window.votingSystem?.userVotes || {}).length;
        // return !this.isLoggedIn() && anonymousVotes >= 5;
    }

    // Handle vote attempt
    handleVoteAttempt(promptId, voteType) {
        if (this.shouldPromptLogin('vote')) {
            this.showLoginModal();
            return false;
        }
        return true;
    }
}

// CSS Styles for Auth System
const AUTH_STYLES = `
<style>
/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    padding: 0;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
}

.modal-header h2 {
    margin: 0;
    color: #333;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
}

.modal-close:hover {
    color: #333;
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    padding: 20px;
    border-top: 1px solid #eee;
    text-align: center;
}

.privacy-note {
    font-size: 12px;
    color: #666;
    margin: 0;
    line-height: 1.4;
}

/* Login Options */
.login-options {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.login-option {
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
}

.login-option h3 {
    margin: 0 0 5px 0;
    color: #333;
}

.login-description {
    margin: 0 0 15px 0;
    color: #666;
    font-size: 14px;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.login-form input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.login-form input:focus {
    outline: none;
    border-color: #007bff;
}

/* User Profile Widget */
.user-profile {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.user-name {
    font-weight: 500;
    color: #333;
}

.user-type {
    font-size: 12px;
    color: #666;
}

.user-type.guest {
    color: #ff9800;
}

.user-type.registered {
    color: #4caf50;
}

.user-type.anonymous {
    color: #666;
}

.user-menu-btn {
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 5px 8px;
    cursor: pointer;
    font-size: 12px;
}

.user-menu-btn:hover {
    background: #e9e9e9;
}

.user-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 150px;
    z-index: 100;
}

.user-menu a {
    display: block;
    padding: 8px 12px;
    text-decoration: none;
    color: #333;
    font-size: 13px;
}

.user-menu a:hover {
    background: #f5f5f5;
}

/* Auth Messages */
.auth-message {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    z-index: 1001;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.auth-message.success {
    background: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
}

.auth-message.error {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
}

.auth-message.info {
    background: #cce7ff;
    border: 1px solid #b3d9ff;
    color: #004085;
}

/* Button Styles */
.btn {
    padding: 10px 16px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    transition: background-color 0.2s;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #545b62;
}

.btn-outline {
    background: transparent;
    color: #007bff;
    border: 1px solid #007bff;
}

.btn-outline:hover {
    background: #007bff;
    color: white;
}
</style>
`;

// Add styles to document
document.head.insertAdjacentHTML('beforeend', AUTH_STYLES);

// Create global instance
window.authSystem = new AuthSystemWithUI();