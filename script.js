const dice = document.getElementById("dice");
const card = document.getElementById("card");
const cardImg = card.querySelector("img");
const permission = document.getElementById("permission");

/* ===== 카드 설정 ===== */
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

/* ===== 화면 ===== */
let W = window.innerWidth;
let H = window.innerHeight;
const SIZE = 120;

/* ===== 위치 / 속도 ===== */
let x = (W - SIZE) / 2;
let y = H - SIZE;
let vx = 0;
let vy = 0;

/* ===== 물리 ===== */
const GRAVITY = 0.8;
const FRICTION = 0.98;
const BOUNCE = 0.85;
const MOVE_POWER = 1.2;
const TILT_POWER = 0.6;

let rolling = false;
let rollTimer = null;

/* ===== iOS 권한 ===== */
function requestPermission() {
  if (
    typeof DeviceMotionEvent !== "undefined" &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission().then((res) => {
      if (res === "granted") startSensors();
    });
  } else {
    startSensors();
  }
}

document.body.addEventListener("click", requestPermission, { once: true });

function startSensors() {
  permission.style.display = "none";
  window.addEventListener("devicemotion", onMotion);
  window.addEventListener("deviceorientation", onTilt);
}

/* ===== 실제 기기 이동 ===== */
function onMotion(e) {
  if (!e.acceleration) return;

  const ax = e.acceleration.x || 0;
  const ay = e.acceleration.y || 0;

  vx += ax * MOVE_POWER;
  vy -= ay * MOVE_POWER;

  triggerRoll();
}

/* ===== 기울임 ===== */
function onTilt(e) {
  const gamma = e.gamma || 0; // 좌우 기울기
  const beta = e.beta || 0;  // 앞뒤 기울기

  vx += gamma * TILT_POWER * 0.05;
  vy += beta * TILT_POWER * 0.05;
}

/* ===== 굴림 시작 ===== */
function triggerRoll() {
  if (rolling) return;
  rolling = true;

  clearTimeout(rollTimer);
  rollTimer = setTimeout(showRandomCard, 3000);
}

/* ===== 카드 랜덤 ===== */
function pickCard() {
  const total = cards.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * total;

  for (const c of cards) {
    r -= c.weight;
    if (r <= 0) return c.src;
  }
}

function showRandomCard() {
  dice.style.display = "none";
  cardImg.src = pickCard();
  card.style.display = "flex";
}

/* ===== 카드 클릭 → 다시 시작 ===== */
card.addEventListener("click", () => {
  card.style.display = "none";
  dice.style.display = "block";

  x = (W - SIZE) / 2;
  y = H - SIZE;
  vx = 0;
  vy = 0;
  rolling = false;
});

/* ===== 애니메이션 ===== */
function animate() {
  vy += GRAVITY;

  x += vx;
  y += vy;

  vx *= FRICTION;
  vy *= FRICTION;

  if (x < 0) {
    x = 0;
    vx *= -BOUNCE;
  }
  if (x > W - SIZE) {
    x = W - SIZE;
    vx *= -BOUNCE;
  }
  if (y < 0) {
    y = 0;
    vy *= -BOUNCE;
  }
  if (y > H - SIZE) {
    y = H - SIZE;
    vy *= -BOUNCE;
    vx *= 0.95;
  }

  dice.style.transform = `
    translate(${x}px, ${y}px)
    rotate(${(vx + vy) * 4}deg)
  `;

  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  W = window.innerWidth;
  H = window.innerHeight;
});

animate();
