import { eventSource, event_types } from '../../../../script.js';

const canvas = document.createElement('canvas');
canvas.id = 'white-splash-canvas';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '999999';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let splashes = [];
let animationFrame = null;

class Splatter {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.alpha = 1.0;
        this.fadeRate = 0.015 + Math.random() * 0.01;
        this.mainRadius = 20 + Math.random() * 35;
        this.droplets = [];

        const dropletCount = 10 + Math.floor(Math.random() * 12);
        for (let i = 0; i < dropletCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = this.mainRadius * (0.8 + Math.random() * 2.0);
            this.droplets.push({
                offsetX: Math.cos(angle) * distance,
                offsetY: Math.sin(angle) * distance,
                radius: 2 + Math.random() * (this.mainRadius * 0.2),
                dripSpeed: 0.3 + Math.random() * 0.7
            });
        }
    }

    update() {
        this.alpha -= this.fadeRate;
        for (const drop of this.droplets) {
            drop.offsetY += drop.dripSpeed;
        }
    }

    draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, this.alpha)})`;
        ctx.shadowColor = `rgba(230, 230, 255, ${Math.max(0, this.alpha * 0.6)})`;
        ctx.shadowBlur = 4;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.mainRadius, 0, Math.PI * 2);
        ctx.arc(this.x + this.mainRadius * 0.2, this.y + this.mainRadius * 0.15, this.mainRadius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        for (const drop of this.droplets) {
            ctx.beginPath();
            ctx.arc(this.x + drop.offsetX, this.y + drop.offsetY, drop.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

function triggerSplashEffect() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const splashCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < splashCount; i++) {
        splashes.push(new Splatter(Math.random() * w, Math.random() * h));
    }
    if (!animationFrame) render();
}

function render() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.update();
        s.draw(ctx);
        if (s.alpha <= 0) splashes.splice(i, 1);
    }
    if (splashes.length > 0) {
        animationFrame = requestAnimationFrame(render);
    } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        animationFrame = null;
    }
}

jQuery(() => {
    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, triggerSplashEffect);
    eventSource.on(event_types.USER_MESSAGE_RENDERED, triggerSplashEffect);
});
