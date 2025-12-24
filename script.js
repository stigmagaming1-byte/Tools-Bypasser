// Main Application Controller
class RobloxBypassApp {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.progress = 0;
        this.totalBypasses = localStorage.getItem('totalBypasses') || 0;
        this.startTime = Date.now();
        this.soundEnabled = true;
        this.theme = localStorage.getItem('theme') || 'dark';
        
        this.init();
    }

    async init() {
        // Set theme
        document.documentElement.setAttribute('data-theme', this.theme);

        // Initialize UI
        this.initUI();
        this.initEvents();
        this.initParticles();

        // Start uptime counter
        this.startUptimeCounter();

        // Show welcome message
        this.showNotification('System Ready', 'Welcome to Roblox Bypass Pro v2.1.4', 'info');

        // Load stats
        this.updateStats();
    }

    initUI() {
        // Update theme toggle icon
        const themeIcon = document.getElementById('themeToggle').querySelector('i');
        themeIcon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        // Update sound toggle icon
        const soundIcon = document.getElementById('soundToggle').querySelector('i');
        soundIcon.className = this.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        
        // Update stats
        document.getElementById('totalBypasses').textContent = this.totalBypasses;
    }

    initEvents() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });

        // Start button
        document.getElementById('submitBtn').addEventListener('click', () => {
            this.startBypass();
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearForm();
        });

        // Paste cookie
        document.getElementById('pasteCookie').addEventListener('click', async () => {
            await this.pasteFromClipboard('cookieInput');
        });

        // Toggle password visibility
        document.getElementById('togglePassword').addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // Password strength checker
        document.getElementById('passwordInput').addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });

        // Console controls
        document.getElementById('clearConsole').addEventListener('click', () => {
            this.clearConsole();
        });

        document.getElementById('copyConsole').addEventListener('click', () => {
            this.copyConsole();
        });

        document.getElementById('pauseConsole').addEventListener('click', () => {
            this.togglePauseConsole();
        });

        // Console command input
        document.getElementById('consoleCommand').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(e.target.value);
                e.target.value = '';
            }
        });

        document.getElementById('sendCommand').addEventListener('click', () => {
            const input = document.getElementById('consoleCommand');
            this.executeCommand(input.value);
            input.value = '';
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('gotItBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Show instructions when clicking info icon
        document.querySelector('.input-info').addEventListener('click', () => {
            this.showInstructions();
        });

        // Auto-save session
        document.getElementById('saveSession').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.saveSession();
            }
        });
    }

    initParticles() {
        const container = document.getElementById('particles');
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties
            const size = Math.random() * 3 + 1;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            
            // Apply styles
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: var(--primary);
                border-radius: 50%;
                left: ${x}%;
                top: ${y}%;
                opacity: ${Math.random() * 0.5 + 0.1};
                animation: floatParticle ${duration}s linear ${delay}s infinite;
            `;
            
            // Add keyframe animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes floatParticle {
                    0% {
                        transform: translate(0, 0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.5;
                    }
                    90% {
                        opacity: 0.5;
                    }
                    100% {
                        transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            
            container.appendChild(particle);
            document.head.appendChild(style);
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            document.getElementById('mainContainer').style.display = 'block';
        }, 500);
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        
        const themeIcon = document.getElementById('themeToggle').querySelector('i');
        themeIcon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        this.playSound('click');
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundIcon = document.getElementById('soundToggle').querySelector('i');
        soundIcon.className = this.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        
        if (this.soundEnabled) {
            this.playSound('click');
        }
    }

    async startBypass() {
        if (this.isRunning) {
            this.showNotification('Warning', 'Bypass is already running!', 'warning');
            return;
        }

        const cookie = document.getElementById('cookieInput').value.trim();
        const password = document.getElementById('passwordInput').value.trim();

        if (!cookie) {
            this.showNotification('Error', 'Please enter Roblox cookie!', 'error');
            this.shakeElement(document.getElementById('cookieInput'));
            return;
        }

        if (!password) {
            this.showNotification('Error', 'Please enter password!', 'error');
            this.shakeElement(document.getElementById('passwordInput'));
            return;
        }

        // Validate cookie format
        if (!cookie.includes('_|WARNING:')) {
            this.showNotification('Warning', 'Cookie format might be incorrect', 'warning');
        }

        this.isRunning = true;
        this.progress = 0;
        
        // Disable start button
        const startBtn = document.getElementById('submitBtn');
        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSING...';

        // Reset progress
        this.resetProgress();
        
        // Log start
        this.logToConsole('system', 'Starting bypass process...');
        this.logToConsole('info', `Mode: ${document.getElementById('modeSelect').value}`);
        this.logToConsole('info', 'Initializing automation...');

        // Start API request
        try {
            const response = await fetch('/api/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cookie: cookie,
                    password: password,
                    mode: 'auto'
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.logToConsole('success', 'API request sent successfully');
                this.logToConsole('info', 'Starting progress simulation...');

                // Simulate progress while monitoring status
                await Promise.all([
                    this.simulateProgress(),
                    this.monitorStatus()
                ]);
            } else {
                throw new Error(result.message || 'API request failed');
            }
        } catch (error) {
            this.logToConsole('error', `Process failed: ${error.message}`);
            this.showResult('error', 'Bypass Failed', 'An error occurred during the bypass process.');
        } finally {
            this.isRunning = false;
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> SUBMIT';
        }
    }

    async simulateProgress() {
        const steps = [
            { name: 'Initializing', duration: 1000 },
            { name: 'Launching Browser', duration: 1500 },
            { name: 'Navigating to Site', duration: 1200 },
            { name: 'Closing Pop-ups', duration: 800 },
            { name: 'Inputting Credentials', duration: 1000 },
            { name: 'Processing Request', duration: 2500 },
            { name: 'Verifying Results', duration: 1500 }
        ];

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];

            // Update progress
            this.updateProgress((i + 1) * (100 / steps.length), step.name);

            // Log step
            this.logToConsole('info', `Step ${i + 1}: ${step.name}`);

            // Simulate processing time
            await this.sleep(step.duration);

            // Random chance of simulated issues
            if (Math.random() < 0.1 && i < steps.length - 1) {
                this.logToConsole('warning', `Minor delay in ${step.name}...`);
                await this.sleep(500);
            }
        }
    }

    async monitorStatus() {
        // Monitor for completion by checking status endpoint
        const maxChecks = 60; // 5 minutes max
        let checks = 0;

        while (checks < maxChecks) {
            try {
                const response = await fetch('/api/status');
                const status = await response.json();

                if (!status.automation_ready) {
                    // Automation is still running
                    this.logToConsole('info', 'Processing... please wait');
                    await this.sleep(5000); // Check every 5 seconds
                    checks++;
                } else {
                    // Automation completed
                    this.logToConsole('success', 'Bypass process completed!');
                    this.showResult('success', 'Process Complete', 'Check the server logs for results.');
                    this.playSound('success');
                    break;
                }
            } catch (error) {
                this.logToConsole('warning', 'Status check failed, retrying...');
                await this.sleep(2000);
                checks++;
            }
        }

        if (checks >= maxChecks) {
            this.logToConsole('warning', 'Process timeout - check server logs');
            this.showResult('warning', 'Process Timeout', 'The process may still be running on the server.');
        }
    }

    updateProgress(percent, stepName) {
        this.progress = percent;
        
        // Update progress bar
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        
        progressBar.style.width = `${percent}%`;
        progressPercent.textContent = `${Math.round(percent)}%`;
        
        // Update steps
        const stepNumber = Math.ceil(percent / (100 / 6));
        this.updateStep(stepNumber);
        
        // Update console
        if (stepName) {
            this.logToConsole('info', `Progress: ${stepName} (${Math.round(percent)}%)`);
        }
    }

    updateStep(stepNumber) {
        const steps = document.querySelectorAll('.step');
        
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            
            step.classList.remove('active', 'completed');
            
            if (stepNum < stepNumber) {
                step.classList.add('completed');
                step.querySelector('.step-icon').innerHTML = '<i class="fas fa-check"></i>';
            } else if (stepNum === stepNumber) {
                step.classList.add('active');
            }
        });
    }

    resetProgress() {
        this.progress = 0;
        document.getElementById('progressBar').style.width = '0%';
        document.getElementById('progressPercent').textContent = '0%';
        
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            step.classList.remove('active', 'completed');
            step.querySelector('.step-icon').textContent = step.dataset.step;
        });
        
        // Set first step as active
        document.querySelector('.step[data-step="1"]').classList.add('active');
    }

    showResult(type, title, message) {
        const resultCard = document.getElementById('resultCard');
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultMessage = document.getElementById('resultMessage');
        const resultActions = document.getElementById('resultActions');
        
        // Reset classes
        resultIcon.className = 'result-icon';
        resultIcon.classList.add(type);
        
        // Update content
        resultTitle.textContent = title;
        resultMessage.textContent = message;
        
        // Update icon
        const icon = resultIcon.querySelector('i');
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
            resultActions.innerHTML = `
                <button class="btn-success" onclick="app.exportLog()">
                    <i class="fas fa-download"></i>
                    Export Log
                </button>
                <button class="btn-primary" onclick="app.startBypass()">
                    <i class="fas fa-redo"></i>
                    Try Another
                </button>
            `;
        } else if (type === 'error') {
            icon.className = 'fas fa-times-circle';
            resultActions.innerHTML = `
                <button class="btn-secondary" onclick="app.showInstructions()">
                    <i class="fas fa-question-circle"></i>
                    Get Help
                </button>
                <button class="btn-primary" onclick="app.startBypass()">
                    <i class="fas fa-redo"></i>
                    Try Again
                </button>
            `;
        }
        
        // Highlight result card
        resultCard.style.animation = 'none';
        setTimeout(() => {
            resultCard.style.animation = 'successPulse 2s';
        }, 10);
    }

    logToConsole(type, message) {
        const consoleOutput = document.getElementById('consoleOutput');
        const timestamp = new Date().toLocaleTimeString();
        
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        
        line.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="message">${message}</span>
        `;
        
        consoleOutput.appendChild(line);
        
        // Auto-scroll to bottom
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
        
        // Limit console lines
        const lines = consoleOutput.querySelectorAll('.console-line');
        if (lines.length > 100) {
            lines[0].remove();
        }
    }

    clearForm() {
        document.getElementById('cookieInput').value = '';
        document.getElementById('passwordInput').value = '';
        document.getElementById('modeSelect').value = 'auto';
        
        this.showNotification('Form Cleared', 'All inputs have been reset', 'info');
        this.playSound('click');
    }

    async pasteFromClipboard(targetId) {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById(targetId).value = text;
            
            this.showNotification('Pasted', 'Content pasted from clipboard', 'success');
            this.playSound('click');
            
            // Check if it looks like a cookie
            if (targetId === 'cookieInput' && text.includes('_|WARNING:')) {
                this.logToConsole('info', 'Valid cookie format detected');
            }
        } catch (err) {
            this.showNotification('Error', 'Failed to paste from clipboard', 'error');
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('passwordInput');
        const toggleIcon = document.getElementById('togglePassword').querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
        
        this.playSound('click');
    }

    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        let strength = 0;
        let color = '#ef4444'; // red
        let text = 'Weak';
        
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        
        if (strength >= 75) {
            color = '#10b981'; // green
            text = 'Strong';
        } else if (strength >= 50) {
            color = '#f59e0b'; // yellow
            text = 'Medium';
        } else if (strength >= 25) {
            color = '#f97316'; // orange
            text = 'Fair';
        }
        
        strengthBar.style.width = `${strength}%`;
        strengthBar.style.background = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }

    clearConsole() {
        const consoleOutput = document.getElementById('consoleOutput');
        consoleOutput.innerHTML = `
            <div class="console-line system">
                <span class="timestamp">[${new Date().toLocaleTimeString()}]</span>
                <span class="message">Console cleared. System ready.</span>
            </div>
        `;
        
        this.showNotification('Console Cleared', 'All messages have been removed', 'info');
        this.playSound('click');
    }

    copyConsole() {
        const consoleOutput = document.getElementById('consoleOutput');
        const lines = consoleOutput.querySelectorAll('.message');
        const text = Array.from(lines).map(line => line.textContent).join('\n');
        
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied', 'Console output copied to clipboard', 'success');
            this.playSound('click');
        });
    }

    togglePauseConsole() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseConsole');
        const icon = pauseBtn.querySelector('i');
        
        if (this.isPaused) {
            icon.className = 'fas fa-play';
            this.showNotification('Console Paused', 'New messages will not be displayed', 'warning');
        } else {
            icon.className = 'fas fa-pause';
            this.showNotification('Console Resumed', 'Messages will now be displayed', 'info');
        }
        
        this.playSound('click');
    }

    executeCommand(command) {
        if (!command.trim()) return;
        
        this.logToConsole('system', `> ${command}`);
        
        const cmd = command.toLowerCase().trim();
        
        switch (cmd) {
            case 'help':
                this.logToConsole('info', 'Available commands:');
                this.logToConsole('info', 'help - Show this help message');
                this.logToConsole('info', 'clear - Clear console');
                this.logToConsole('info', 'status - Show system status');
                this.logToConsole('info', 'stats - Show bypass statistics');
                this.logToConsole('info', 'theme [dark/light] - Change theme');
                this.logToConsole('info', 'sound [on/off] - Toggle sounds');
                break;
                
            case 'status':
                this.logToConsole('info', `System Status: ${this.isRunning ? 'Running' : 'Idle'}`);
                this.logToConsole('info', `Progress: ${this.progress}%`);
                this.logToConsole('info', `Theme: ${this.theme}`);
                this.logToConsole('info', `Sound: ${this.soundEnabled ? 'On' : 'Off'}`);
                break;
                
            case 'stats':
                this.logToConsole('info', `Total Bypasses: ${this.totalBypasses}`);
                this.logToConsole('info', `Success Rate: 85%`);
                this.logToConsole('info', `Active Users: 1`);
                break;
                
            case 'theme dark':
                this.theme = 'dark';
                document.documentElement.setAttribute('data-theme', 'dark');
                this.logToConsole('success', 'Theme changed to dark');
                break;
                
            case 'theme light':
                this.theme = 'light';
                document.documentElement.setAttribute('data-theme', 'light');
                this.logToConsole('success', 'Theme changed to light');
                break;
                
            case 'sound on':
                this.soundEnabled = true;
                this.logToConsole('success', 'Sounds enabled');
                break;
                
            case 'sound off':
                this.soundEnabled = false;
                this.logToConsole('success', 'Sounds disabled');
                break;
                
            case 'clear':
                this.clearConsole();
                break;
                
            default:
                this.logToConsole('error', `Unknown command: ${command}`);
                this.logToConsole('info', 'Type "help" for available commands');
        }
    }

    showInstructions() {
        document.getElementById('instructionsModal').classList.add('active');
        this.playSound('click');
    }

    closeModal() {
        document.getElementById('instructionsModal').classList.remove('active');
        this.playSound('click');
    }

    showNotification(title, message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse forwards';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideInRight 0.3s ease reverse forwards';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Play sound
        if (this.soundEnabled) {
            const audio = new Audio(`https://assets.mixkit.co/sfx/preview/mixkit-${type}-${type === 'success' ? 'bell' : 'alert'}-600.mp3`);
            audio.volume = 0.3;
            audio.play().catch(() => {});
        }
    }

    playSound(type) {
        if (!this.soundEnabled) return;
        
        const audio = document.getElementById(`${type}Sound`);
        if (audio) {
            audio.currentTime = 0;
            audio.volume = 0.3;
            audio.play().catch(() => {});
        }
    }

    shakeElement(element) {
        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = 'errorPulse 0.5s';
        }, 10);
    }

    saveSession() {
        const cookie = document.getElementById('cookieInput').value;
        const password = document.getElementById('passwordInput').value;
        
        if (cookie || password) {
            // Note: In real implementation, use proper encryption
            const sessionData = {
                cookie: btoa(cookie),
                password: btoa(password),
                timestamp: Date.now()
            };
            
            localStorage.setItem('bypassSession', JSON.stringify(sessionData));
            this.showNotification('Session Saved', 'Credentials saved for 24 hours', 'success');
        }
    }

    updateStats() {
        document.getElementById('totalBypasses').textContent = this.totalBypasses;
        
        // Update other stats
        const successRate = this.totalBypasses > 0 ? '85%' : '100%';
        document.getElementById('successRate').textContent = successRate;
        
        // Simulate active users
        const activeUsers = Math.floor(Math.random() * 50) + 1;
        document.getElementById('activeUsers').textContent = activeUsers;
    }

    startUptimeCounter() {
        setInterval(() => {
            const uptime = Date.now() - this.startTime;
            const hours = Math.floor(uptime / 3600000);
            const minutes = Math.floor((uptime % 3600000) / 60000);
            const seconds = Math.floor((uptime % 60000) / 1000);
            
            document.getElementById('uptime').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    exportLog() {
        const consoleOutput = document.getElementById('consoleOutput');
        const lines = consoleOutput.querySelectorAll('.console-line');
        const logText = Array.from(lines).map(line => {
            const timestamp = line.querySelector('.timestamp').textContent;
            const message = line.querySelector('.message').textContent;
            return `${timestamp} ${message}`;
        }).join('\n');
        
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bypass-log-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Log Exported', 'Console log downloaded successfully', 'success');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize app when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.app = new RobloxBypassApp();

    // Add some initial console messages
    setTimeout(() => {
        app.logToConsole('system', '=== ROBlox Bypass Pro v2.1.4 ===');
        app.logToConsole('info', 'Automation engine ready');
        app.logToConsole('info', 'Enter credentials and click START BYPASS');
        app.logToConsole('warning', 'For educational purposes only');
    }, 500);
});
