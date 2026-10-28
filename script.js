// CPS Test Application
class CPSTester {
    constructor() {
        this.timer = 5.00;
        this.clicks = 0;
        this.startTime = null;
        this.endTime = null;
        this.isRunning = false;
        this.intervalId = null;
        this.timerIntervalId = null;
        this.remainingTime = this.timer;
        this.personalBest = parseFloat(localStorage.getItem('personalBest') || '0');
        this.totalTests = parseInt(localStorage.getItem('totalTests') || '0');
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
        this.loadStats();
    }

    initializeElements() {
        this.timerValue = document.getElementById('timerValue');
        this.clicksValue = document.getElementById('clicksValue');
        this.scoreValue = document.getElementById('scoreValue');
        this.clickArea = document.getElementById('clickArea');
        this.timerUp = document.getElementById('timerUp');
        this.timerDown = document.getElementById('timerDown');
        this.themeToggle = document.getElementById('themeToggle');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.spacebarBtn = document.getElementById('spacebarBtn');
        this.timeframeButtons = document.querySelectorAll('.timeframe-btn');
        this.progressFill = document.getElementById('progressFill');
        this.clickRipple = document.getElementById('clickRipple');
        this.resultsSection = document.getElementById('resultsSection');
        this.shareBtn = document.getElementById('shareBtn');
        this.retryBtn = document.getElementById('retryBtn');
    }

    loadStats() {
        if (this.personalBestEl) {
            this.animateNumber(this.personalBestEl, this.personalBest, 2);
        }
        if (this.totalTestsEl) {
            this.animateNumber(this.totalTestsEl, this.totalTests, 0);
        }
    }

    attachEventListeners() {
        // Click area with ripple effect
        this.clickArea.addEventListener('click', (e) => {
            this.createRipple(e);
            this.handleClick();
        });
        
        // Timer controls
        this.timerUp.addEventListener('click', () => this.adjustTimer(0.1));
        this.timerDown.addEventListener('click', () => this.adjustTimer(-0.1));
        
        // Timeframe buttons
        this.timeframeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const time = parseFloat(btn.dataset.time);
                this.setTimer(time);
                this.updateTimeframeButtons(btn);
            });
        });

        // Theme toggle
        this.themeToggle.addEventListener('change', () => {
            document.body.classList.toggle('light-mode');
        });

        // Fullscreen
        this.fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log('Fullscreen error:', err);
                });
            } else {
                document.exitFullscreen();
            }
        });

        // Spacebar counter (placeholder)
        this.spacebarBtn.addEventListener('click', () => {
            alert('Spacebar Counter feature coming soon!');
        });

        // Share button
        if (this.shareBtn) {
            this.shareBtn.addEventListener('click', () => this.shareResults());
        }

        // Retry button
        if (this.retryBtn) {
            this.retryBtn.addEventListener('click', () => {
                this.resultsSection.style.display = 'none';
                this.resetTest();
            });
        }

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isRunning) {
                e.preventDefault();
                this.handleClick();
            }
        });

        // Prevent context menu on right click during test
        this.clickArea.addEventListener('contextmenu', (e) => {
            if (this.isRunning) {
                e.preventDefault();
            }
        });
    }

    createRipple(event) {
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        const rect = this.clickArea.getBoundingClientRect();
        const size = 20;
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        this.clickArea.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    adjustTimer(delta) {
        if (this.isRunning) return;
        this.timer = Math.max(0.1, Math.min(100, this.timer + delta));
        this.timer = Math.round(this.timer * 10) / 10;
        this.remainingTime = this.timer;
        this.updateDisplay();
    }

    setTimer(time) {
        if (this.isRunning) return;
        this.timer = time;
        this.remainingTime = this.timer;
        this.updateDisplay();
    }

    updateTimeframeButtons(activeBtn) {
        this.timeframeButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    handleClick() {
        if (!this.isRunning) {
            this.startTest();
        } else {
            this.recordClick();
        }
    }

    startTest() {
        this.isRunning = true;
        this.clicks = 0;
        this.startTime = Date.now();
        this.remainingTime = this.timer;
        this.clickArea.classList.add('active');
        this.clickArea.querySelector('.click-instruction').textContent = 'CLICK AS FAST AS YOU CAN!';
        this.resultsSection.style.display = 'none';
        
        // Reset progress bar
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }
        
        // Update timer display
        this.timerIntervalId = setInterval(() => {
            this.remainingTime -= 0.01;
            if (this.remainingTime <= 0) {
                this.remainingTime = 0;
            }
            this.updateDisplay();
            this.updateProgress();
        }, 10);

        // End test after timer expires
        this.intervalId = setTimeout(() => {
            this.endTest();
        }, this.timer * 1000);
    }

    updateProgress() {
        if (this.progressFill && this.startTime) {
            const elapsed = (Date.now() - this.startTime) / 1000;
            const progress = (elapsed / this.timer) * 100;
            this.progressFill.style.width = Math.min(progress, 100) + '%';
        }
    }

    recordClick() {
        if (!this.isRunning) return;
        this.clicks++;
        this.animateValue(this.scoreValue);
        this.updateDisplay();
    }

    animateValue(element) {
        element.classList.add('animate');
        setTimeout(() => {
            element.classList.remove('animate');
        }, 300);
    }

    animateNumber(element, target, decimals) {
        const start = 0;
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (target - start) * progress;
            
            if (decimals === 0) {
                element.textContent = Math.floor(current);
            } else {
                element.textContent = current.toFixed(decimals);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    endTest() {
        this.isRunning = false;
        this.endTime = Date.now();
        const actualTime = (this.endTime - this.startTime) / 1000;
        const cps = this.clicks / actualTime;

        clearInterval(this.timerIntervalId);
        clearTimeout(this.intervalId);

        this.clickArea.classList.remove('active');
        this.clickArea.querySelector('.click-instruction').textContent = 'CLICK HERE TO START CPS TEST';

        // Update final display
        this.clicksValue.textContent = cps.toFixed(2);
        this.scoreValue.textContent = this.clicks;

        // Update progress to 100%
        if (this.progressFill) {
            this.progressFill.style.width = '100%';
        }

        // Update personal best
        if (cps > this.personalBest) {
            this.personalBest = cps;
            localStorage.setItem('personalBest', cps.toString());
        }

        // Update total tests
        this.totalTests++;
        localStorage.setItem('totalTests', this.totalTests.toString());

        // Show results
        setTimeout(() => {
            this.showResults(cps);
        }, 500);
    }

    showResults(cps) {
        const resultClicks = document.getElementById('resultClicks');
        const resultCPS = document.getElementById('resultCPS');
        const resultTime = document.getElementById('resultTime');
        const resultBadge = document.getElementById('resultBadge');

        if (resultClicks) resultClicks.textContent = this.clicks;
        if (resultCPS) {
            this.animateNumber(resultCPS, cps, 2);
        }
        if (resultTime) resultTime.textContent = this.timer.toFixed(1) + 's';

        // Set badge
        let badgeText = '';
        if (cps < 5) {
            badgeText = '🐢 Speed of the turtle';
        } else if (cps >= 5 && cps <= 10) {
            badgeText = '👍 A good result!';
        } else if (cps > 10 && cps <= 15) {
            badgeText = '🚀 Faster than most players!';
        } else if (cps > 15 && cps <= 20) {
            badgeText = '⚡ Lightning fast!';
        } else {
            badgeText = '🔥 INSANE SPEED!';
        }

        if (resultBadge) resultBadge.textContent = badgeText;

        // Show results section
        if (this.resultsSection) {
            this.resultsSection.style.display = 'block';
        }

        // Store result for sharing
        this.lastResult = { clicks: this.clicks, cps: cps, time: this.timer };
    }

    shareResults() {
        if (!this.lastResult) return;

        const text = `I scored ${this.lastResult.cps.toFixed(2)} CPS (${this.lastResult.clicks} clicks in ${this.lastResult.time.toFixed(1)}s) on CPS Test! Can you beat my score? 🎮`;
        const url = window.location.href;

        if (navigator.share) {
            navigator.share({
                title: 'CPS Test Result',
                text: text,
                url: url
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
                alert('Result copied to clipboard!');
            }).catch(err => {
                console.log('Error copying:', err);
            });
        }
    }

    resetTest() {
        this.clicks = 0;
        this.startTime = null;
        this.endTime = null;
        this.remainingTime = this.timer;
        this.updateDisplay();
    }

    updateDisplay() {
        this.timerValue.textContent = this.remainingTime.toFixed(2);
        this.scoreValue.textContent = this.clicks;

        if (this.isRunning && this.startTime) {
            const elapsed = (Date.now() - this.startTime) / 1000;
            if (elapsed > 0) {
                const currentCps = this.clicks / elapsed;
                this.clicksValue.textContent = currentCps.toFixed(2);
                this.animateValue(this.clicksValue);
            } else {
                this.clicksValue.textContent = '0.00';
            }
        } else {
            this.clicksValue.textContent = '0.00';
        }
    }
}

// Initialize the CPS Tester when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CPSTester();
});

// Handle fullscreen changes
document.addEventListener('fullscreenchange', () => {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (document.fullscreenElement) {
        fullscreenBtn.textContent = 'Exit Fullscreen';
    } else {
        fullscreenBtn.textContent = 'Open Fullscreen';
    }
});


