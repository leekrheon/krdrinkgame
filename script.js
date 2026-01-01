/* ===============================
   CONFIG
================================ */

// 카드 이미지 개별 설정 (14개)
const CARD_IMAGES = [
  "cards/card1.jpg",
  "cards/card2.jpg",
  "cards/card3.jpg",
  "cards/card4.jpg",
  "cards/card5.jpg",
  "cards/card6.jpg",
  "cards/card7.jpg",
  "cards/card8.jpg",
  "cards/card9.jpg",
  "cards/card10.jpg",
  "cards/card11.jpg",
  "cards/card12.jpg",
  "cards/card13.jpg",
  "cards/card14.jpg"
];

// 카드 등장 확률 (합 = 1)
const CARD_WEIGHTS = Array(14).fill(1 / 14);

// 굴림 시간
const ROLL_DURATION = 4000;

// 카드 등장 최소 누적 회전량
const REQUIRED_ROTATION = 540; // 1.5바퀴 이상

// 물리 계수
const GRAVITY = 0.9;
const FRICTION = 0.985;
const SHAKE_MULTIPLIER = 2.8;


/* ===============================
   ELEMENTS
================================ */

const dice = document.getElementById("dice");
const card = document.getElementById("card");
const cardImg = document.getElementById("card-img");

let x = window.innerWidth / 2;
let y = window.innerHeight - 160;
let vx = 0;
let vy = 0;

let rotation = 0;
let rotationAccum = 0;

let rolling = false;
let rollStartTime = 0;


/* ===============================
   PERMISSION
================================ */

if (
  typeof DeviceMotionEvent !== "undefined" &&
  typeof DeviceMotionEvent.requestPermission === "function"
) {
  document.body.addEventListener("click", async () => {
    await DeviceMotionEvent.requestPermission();
    await DeviceOrientationEvent.requestPermission();
  }, { once: true });
}


/* ===============================
   SENSOR INPUT
================================ */

window.addEventListener("deviceorientation", (e) => {
  if (!rolling) return;

  const tiltX = e.gamma || 0;
  const tiltY = e.beta || 0;

  vx += tiltX * 0.08;
  vy += tiltY * 0.08;
});

window.addEventListener("devicemotion", (e) => {
  if (!rolling) return;

  const acc = e.accelerationIncludingGravity;
  if (!acc) return;

  const ax = acc.x || 0;
  const ay = acc.y || 0;

  vx += ax * SHAKE_MULTIPLIER;
  vy -= ay * SHAKE_MULTIPLIER;

  const spin = Math.abs(ax) + Math.abs(ay);
  rotationAccum += spin * 6;
});


/* ===============================
   PHYSICS LOOP
================================ */

function update() {
  if (!rolling) return;

  vy += GRAVITY;

  x += vx;
  y += vy;

  vx *= FRICTION;
  vy *= FRICTION;

  rotation += Math.abs(vx) + Math.abs(vy);

  const size = dice.offsetWidth;
  const maxX = window.innerWidth - size;
  const maxY = window.innerHeight - size;

  if (x < 0) { x = 0; vx *= -0.8; }
  if (x > maxX) { x = maxX; vx *= -0.8; }
  if (y < 0) { y = 0; vy *= -0.8; }
  if (y > maxY) { y = maxY; vy *= -0.8; }

  dice.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;

  if (performance.now() - rollStartTime >= ROLL_DURATION) {
    finishRoll();
    return;
  }

  requestAnimationFrame(update);
}


/* ===============================
   ROLL CONTROL
================================ */

function startRoll() {
  if (rolling) return;

  rolling = true;
  rotationAccum = 0;
  rollStartTime = performance.now();

  card.classList.remove("show");
  requestAnimationFrame(update);
}

function finishRoll() {
  rolling = false;

  if (rotationAccum >= REQUIRED_ROTATION) {
    showCard();
  }
}


/* ===============================
   CARD LOGIC
================================ */

function weightedRandom() {
  const r = Math.random();
  let sum = 0;

  for (let i = 0; i < CARD_WEIGHTS.length; i++) {
    sum += CARD_WEIGHTS[i];
    if (r <= sum) return i;
  }
  return 0;
}

function showCard() {
  const index = weightedRandom();
  cardImg.src = CARD_IMAGES[index];
  card.classList.add("show");
}

card.addEventListener("click", () => {
  card.classList.remove("show");
});


/* ===============================
   START
================================ */

dice.addEventListener("click", startRoll);
