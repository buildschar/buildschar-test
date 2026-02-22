class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const number = this.getAttribute('number');
        const delay = this.getAttribute('delay') || '0';
        const color = this.getColorForNumber(number);

        this.shadowRoot.innerHTML = `
            <style>
                @keyframes rollIn {
                    0%   { opacity: 0; transform: translateY(-20px) scale(0.6); }
                    70%  { transform: translateY(4px) scale(1.08); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                :host {
                    --ball-color: ${color};
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: white;
                    background: radial-gradient(circle at 35% 35%, color-mix(in srgb, ${color} 70%, white), ${color});
                    box-shadow: 0 4px 12px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.3);
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                    animation: rollIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both;
                }
                :host(:hover) {
                    transform: scale(1.15) translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3);
                }
                div {
                    text-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    user-select: none;
                }
            </style>
            <div>${number}</div>
        `;
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

// ── Dark / Light mode toggle ──────────────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(dark) {
    document.body.classList.toggle('dark-mode', dark);
    themeToggle.textContent = dark ? '☀️' : '🌙';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
}

// Restore saved preference (or system preference)
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

    // Shake existing balls out if any
    const existing = resultContainer.querySelectorAll('lotto-ball');
    if (existing.length > 0) {
        existing.forEach((ball, i) => {
            ball.style.transition = `opacity 0.2s ease ${i * 40}ms, transform 0.2s ease ${i * 40}ms`;
            ball.style.opacity = '0';
            ball.style.transform = 'scale(0.5) translateY(20px)';
        });

        setTimeout(() => buildBalls(resultContainer), existing.length * 40 + 220);
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
    const totalDelay = sorted.length * 100 + 450;

    sorted.forEach((number, i) => {
        const ball = document.createElement('lotto-ball');
        ball.setAttribute('number', number);
        ball.setAttribute('delay', i * 100);
        container.appendChild(ball);
    });

    setTimeout(() => { generateBtn.disabled = false; }, totalDelay);
}
