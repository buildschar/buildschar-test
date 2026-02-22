// ── LottoBall Web Component ───────────────────────────────────────────────────
class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const delay = parseInt(this.getAttribute('delay') || '0', 10);

        this.shadowRoot.innerHTML = `
            <style>
                @keyframes dropIn {
                    0%   { opacity: 0; transform: translateY(-70px) scale(0.4) rotate(-20deg); }
                    55%  { transform: translateY(8px) scale(1.12) rotate(4deg); }
                    75%  { transform: translateY(-4px) scale(0.96) rotate(-1deg); }
                    100% { opacity: 1; transform: none; }
                }
                @keyframes lockPop {
                    0%   { transform: scale(1); }
                    40%  { transform: scale(1.4); }
                    68%  { transform: scale(0.88); }
                    100% { transform: scale(1); }
                }
                @keyframes numFlip {
                    0%   { opacity: 0; transform: translateY(-8px) scaleY(0.4); }
                    100% { opacity: 1; transform: none; }
                }
                :host {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: white;
                    background: var(--ball-bg, radial-gradient(circle at 35% 35%, #ccc, #888));
                    box-shadow: 0 4px 12px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.3);
                    animation: dropIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both;
                    transition: transform 0.22s ease, box-shadow 0.22s ease;
                }
                :host(.locked):hover {
                    transform: scale(1.15) translateY(-4px);
                    box-shadow: 0 10px 24px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.35);
                }
                :host(.popping) {
                    animation: lockPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }
                .num {
                    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
                    user-select: none;
                }
                .num.flip {
                    animation: numFlip 0.09s ease both;
                }
            </style>
            <span class="num">?</span>
        `;
    }

    roll(finalNumber, startDelay, rollDuration) {
        const numEl = this.shadowRoot.querySelector('.num');
        const finalColor = this.getColorForNumber(finalNumber);

        const flip = (text) => {
            numEl.classList.remove('flip');
            void numEl.offsetWidth;
            numEl.textContent = text;
            numEl.classList.add('flip');
        };

        setTimeout(() => {
            let ms = 60;
            let elapsed = 0;

            const tick = () => {
                if (elapsed >= rollDuration) {
                    flip(finalNumber);
                    this.style.setProperty('--ball-bg',
                        `radial-gradient(circle at 35% 35%, color-mix(in srgb, ${finalColor} 55%, white), ${finalColor})`
                    );
                    this.classList.add('popping', 'locked');
                    spawnConfetti(this.getBoundingClientRect());
                    setTimeout(() => this.classList.remove('popping'), 500);
                    return;
                }
                flip(Math.floor(Math.random() * 45) + 1);
                elapsed += ms;
                ms = Math.min(ms * 1.13, 240);
                setTimeout(tick, ms);
            };

            tick();
        }, startDelay);
    }

    getColorForNumber(number) {
        const num = parseInt(number, 10);
        if (num <= 10) return '#fbc400';
        if (num <= 20) return '#69c8f2';
        if (num <= 30) return '#ff7272';
        if (num <= 40) return '#aaa';
        return '#b0d840';
    }
}

customElements.define('lotto-ball', LottoBall);

// ── Confetti burst ────────────────────────────────────────────────────────────
function spawnConfetti(rect) {
    const colors = ['#fbc400', '#69c8f2', '#ff7272', '#b0d840', '#fff', '#4a90e2'];
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const dist = 45 + Math.random() * 45;
        const p = document.createElement('div');
        p.className = 'confetti-particle';
        p.style.cssText = `
            left:${cx}px;
            top:${cy}px;
            width:${5 + Math.random() * 6}px;
            height:${5 + Math.random() * 6}px;
            background:${colors[i % colors.length]};
            border-radius:${Math.random() > 0.4 ? '50%' : '2px'};
            --dx:${(Math.cos(angle) * dist).toFixed(1)}px;
            --dy:${(Math.sin(angle) * dist).toFixed(1)}px;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 750);
    }
}

// ── Dark / Light mode toggle ──────────────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(dark) {
    document.body.classList.toggle('dark-mode', dark);
    themeToggle.textContent = dark ? '☀️' : '🌙';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
}

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme ? savedTheme === 'dark' : prefersDark);

themeToggle.addEventListener('click', () => {
    applyTheme(!document.body.classList.contains('dark-mode'));
});

// ── Lotto number generation ───────────────────────────────────────────────────
const generateBtn = document.getElementById('generate-btn');

generateBtn.addEventListener('click', () => {
    const resultContainer = document.getElementById('result');
    generateBtn.disabled = true;
    generateBtn.textContent = '🎱 Rolling...';
    generateBtn.classList.add('generating');

    const existing = resultContainer.querySelectorAll('lotto-ball');
    if (existing.length > 0) {
        existing.forEach((ball, i) => {
            ball.style.transition = `opacity 0.18s ease ${i * 35}ms, transform 0.18s ease ${i * 35}ms`;
            ball.style.opacity = '0';
            ball.style.transform = 'scale(0.4) translateY(20px)';
        });
        setTimeout(() => buildBalls(resultContainer), existing.length * 35 + 220);
    } else {
        buildBalls(resultContainer);
    }
});

function buildBalls(container) {
    container.innerHTML = '';

    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    const sorted = Array.from(numbers).sort((a, b) => a - b);

    sorted.forEach((number, i) => {
        const ball = document.createElement('lotto-ball');
        ball.setAttribute('number', number);
        ball.setAttribute('delay', i * 80);
        container.appendChild(ball);
        // Start slot-machine rolling after the drop-in animation completes
        ball.roll(number, i * 80 + 520, 900);
    });

    // Re-enable button after last ball locks
    const lastLockAt = 5 * 80 + 520 + 900 + 400;
    setTimeout(() => {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Numbers';
        generateBtn.classList.remove('generating');
    }, lastLockAt);
}
