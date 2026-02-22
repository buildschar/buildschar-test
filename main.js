class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const number = this.getAttribute('number');
        const color = this.getColorForNumber(number);

        this.shadowRoot.innerHTML = `
            <style>
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
                    background-color: var(--ball-color);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    transform: scale(1);
                    transition: transform 0.3s ease, background-color 0.3s ease;
                }
                :host(:hover) {
                    transform: scale(1.1);
                }
            </style>
            <div>${number}</div>
        `;
    }

    getColorForNumber(number) {
        const num = parseInt(number, 10);
        if (num <= 10) return '#fbc400'; // Yellow
        if (num <= 20) return '#69c8f2'; // Blue
        if (num <= 30) return '#ff7272'; // Red
        if (num <= 40) return '#aaa'; // Gray
        return '#b0d840'; // Green
    }
}

customElements.define('lotto-ball', LottoBall);

document.getElementById('generate-btn').addEventListener('click', () => {
    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = '';
    const numbers = new Set();

    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    sortedNumbers.forEach(number => {
        const lottoBall = document.createElement('lotto-ball');
        lottoBall.setAttribute('number', number);
        resultContainer.appendChild(lottoBall);
    });
});
