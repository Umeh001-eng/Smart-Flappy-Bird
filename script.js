const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("startBtn");
const container = document.getElementById("gameContainer");

let W, H;
function resize() {
  W = container.clientWidth;
  H = container.clientHeight;
  canvas.width = W;
  canvas.height = H;
}
resize();
window.addEventListener("resize", resize);

// === Load Bird Image ===
const birdImg = new Image();
birdImg.src = "https://i.postimg.cc/8Cv6mw7F/IMG-2780.png";


// === Load Pipe Image ===
const PipeImg = new Image();
PipeImg.src = "https://i.postimg.cc/rmLtnW4K/IMG-2783.png";

// === Game Variables ===
let bird, pipes, frame, score, gravity, playing;

// === Audio ===
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, dur, type = "sine", vol = 0.1) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = vol;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + dur);
}

function resetGame() {
  bird = { x: 80, y: H / 2, vy: 0, size: 30 };
  pipes = [];
  frame = 0;
  score = 0;
  gravity = 0.28;
  scoreEl.textContent = "0";
}

// === Start / End ===
function startGame() {
  overlay.classList.remove("visible");
  resetGame();
  playing = true;
  audioCtx.resume();
  requestAnimationFrame(loop);
}

function endGame() {
  playSound(180, 0.3, "square", 0.2);
  playing = false;
  overlay.classList.add("visible");
}

// === Input ===
function flap() {
  if (!playing) return;
  bird.vy = -7;
  playSound(700, 0.08, "triangle", 0.1);
}
window.addEventListener("keydown", e => {
  if (e.code === "Space") flap();
  if (e.code === "Enter" && !playing) startGame();
});
canvas.addEventListener("pointerdown", flap);
startBtn.onclick = startGame;

// === Pipes ===
function createPipe() {
  const gap = 150;
  const topHeight = Math.random() * (H - gap - 100) + 40;
  pipes.push({
    x: W,
    top: topHeight,
    bottom: topHeight + gap,
    w: 15
  });
}

// === Loop ===
function loop() {
  if (!playing) return;
  frame++;

  // Background
  ctx.fillStyle = ctx.createLinearGradient(0, 0, W, H);
  ctx.fillStyle = "#9ae66e";
  ctx.fillRect(0, 0, W, H);

  // Bird physics
  bird.vy += gravity;
  bird.y += bird.vy;

  // Create pipes
  if (frame % 90 === 0) createPipe();

  // Move and draw pipes
  for (let i = pipes.length -1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= 2.5;

    ctx.fillStyle = "#38761d";
    ctx.fillRect(p.x, 0, p.w, p.top);
    ctx.fillRect(p.x, p.bottom, p.w, H - p.bottom);

    // Collision check
    if (
      bird.x + bird.size / 2 > p.x &&
      bird.x - bird.size / 2 < p.x + p.w &&
      (bird.y - bird.size / 2 < p.top ||
        bird.y + bird.size / 2 > p.bottom)
    ) {
      endGame();
    }

    // Scoring
    if (p.x + p.w === Math.floor(bird.x)) {
      score++;
      playSound(500, 0.1, "square", 0.15);
      scoreEl.textContent = score;
    }

    // Remove offscreen pipes
    if (p.x + p.w < 0) pipes.splice(i, 1);
  }

  // Ground & Ceiling
  if (bird.y + bird.size / 2 > H || bird.y - bird.size / 2 < 0) {
    endGame();
  }

  // Bird
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.drawImage(birdImg, -bird.size / 2, -bird.size / 2, bird.size, bird.size);
  ctx.restore();

  // Loop
  requestAnimationFrame(loop);
}
// ⚠️ Do not copy or reuse without permission — God's Own 
// © 2025 God's Own. All rights reserved.
// Unauthorized use prohibited — contact author first (umehnonso60@gmail.com)
// Created by God's Own — do not steal