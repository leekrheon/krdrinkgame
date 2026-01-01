const dice = document.getElementById("dice");
const card = document.getElementById("card");
const cardImg = card.querySelector("img");
const permission = document.getElementById("permission");

/* ================= 카드 개별 설정 ================= */
/* 여기서 14개 전부 직접 지정 가능 */
const cards = [
  { src: "card1.png", weight: 1 },
  { src: "card2.png", weight: 1 },
  { src: "card3.png", weight: 1 },
  { src: "card4.png", weight: 1 },
  { src: "card5.png", weight: 1 },
  { src: "card6.png", weight: 1 },
  { src: "card7.png", weight: 1 },
  { src: "card8.png", weight: 1 },
  { src: "card9.png", weight: 1 },
  { src: "card10.png", weight: 1 },
  { src: "card11.png", weight: 1 },
  { src: "card12.png", weight: 1 },
  { src: "card13.png", weight: 1 },
  { src: "card14.png", weight: 1 }
];

/* ================= 화면 ================= */
let W = window.innerWidth;
let H = window.innerHeight;
const SIZE = 120;

/* ================= 상태 ================= */
let x = (W - SIZE) / 2;
let y = H - SIZE;
let vx = 0;
let vy = 0;

/* ================= 센서 상태 ================= */
let beta = 0;
let gamma = 0;
let filtAX = 0;
let filtAY = 0;

/* ================= 물리 상수 ================= */
const GRAVITY_STRENGTH = 1.2;
const TILT_GAIN = 0.035;
const MOVE_GAIN = 1.8;
const FRICTION = 0.985;
const BOUNCE = 0.85;
const LPF = 0.9;
const MOVE_THRESHOLD = 0.08;

/* ================= 굴림 상태 ================= */
let rolling = false;
let rollTimer = null;
const ROLL_DURATION = 4000; // ⭐ 4초

/* ================= 권한 ================= */
function requestPermission() {
  if (
    typeof DeviceMotionEvent !== "undefined" &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission().then(res => {
      if (res === "granted") startSensors();
    });
  } else {
    startSensors();
  }
}

document.body.addEventListener("click", requestPermission, { once: true });

function startSensors() {
  permission.style.display = "none";
  window.addEventListener("deviceorientation", onOrientation, true);
  window.addEventListener("devicemotion", onMotion, true);
}

/* ================= 기울기 ================= */
function onOrientation(e) {
  beta = (e.beta || 0) * Math.PI / 180;
  gamma = (e.gamma || 0) * Math.PI / 180;
}

/* ================= 실제 이동 ================= */
function onMotion(e) {
  if (!e.acceleration) return;

  const ax = e.acceleration.x || 0;
  const ay = e.acceleration.y || 0;

  filtAX = filtAX * LPF + ax * (1 - LPF);
  filtAY = filtAY * LPF + ay * (1 - LPF);

  if (Math.abs(filtAX) > MOVE_THRESHOLD) vx += filtAX * MOVE_GAIN;
  if (Math.abs(filtAY) > MOVE_THRESHOLD) vy -= filtAY * MOVE_GAIN;

  triggerRoll();
}

/* ================= 굴림 시작 ================= */
function triggerRoll() {
  if (rolling) return;
  rolling = true;

  clearTimeout(rollTimer);
  rollTimer = setTimeout(showRandomCard, ROLL_DURATION);
}

/* ================= 카드 랜덤 (가중치) ================= */
function pickCard() {
  const totalWeight = cards.reduce((sum, c) => sum + c.weight, 0);
  let r = Math.random() * totalWeight;

  for (const c of cards) {
    r -= c.weight;
    if (r <= 0) return c.src;
  }
}

/* ================= 카드 표시 ================= */
function showRandomCard() {
  dice.style.display = "none";
  cardImg.src = pickCard();
  card.style.display = "flex";
}

/* ================= 카드 클릭 → 리셋 ================= */
card.addEventListener("click", () => {
  card.style.display = "none";
  dice.style.display = "block";

  x = (W - SIZE) / 2;
  y = H - SIZE;
  vx = 0;
  vy = 0;
  rolling = false;
});

/* ================= 애니메이션 ================= */
function animate() {
  const gx = Math.sin(gamma) * GRAVITY_STRENGTH;
  const gy = Math.sin(beta) * GRAVITY_STRENGTH;

  vx += gx * TILT_GAIN;
  vy += gy * TILT_GAIN;

  x += vx;
  y += vy;

  vx *= FRICTION;
  vy *= FRICTION;

  if (x < 0) { x = 0; vx *= -BOUNCE; }
  if (x > W - SIZE) { x = W - SIZE; vx *= -BOUNCE; }

  if (y < 0) { y = 0; vy *= -BOUNCE; }
  if (y > H - SIZE) {
    y = H - SIZE;
    vy *= -BOUNCE;
    vx *= 0.96;
  }

  dice.style.transform = `
    translate(${x}px, ${y}px)
    rotate(${(vx + vy) * 3}deg)
  `;

  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  W = window.innerWidth;
  H = window.innerHeight;
});

animate();
