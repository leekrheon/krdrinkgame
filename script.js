/* ======================
   CARD CONFIG
====================== */

const CARD_IMAGES = Array.from({ length: 14 }, (_, i) => `cards/card${i + 1}.jpg`);
const CARD_WEIGHTS = Array(14).fill(1 / 14);


/* ======================
   ELEMENTS
====================== */

const startScreen = document.getElementById("start-screen");
const dice = document.getElementById("dice");
const card = document.getElementById("card");
const cardImg = document.getElementById("card-img");


/* ======================
   STATE
====================== */

let permissionGranted = false;
let rolling = false;

let x = window.innerWidth / 2;
let y = window.innerHeight - 160;
let vx = 0;
let vy = 0;

let rotation = 0;
let rotationAccum = 0;
let rollStart = 0;


/* ======================
   PERMISSION (🔥 핵심)
====================== */

startScreen.addEventListener("click", async () => {
  try {
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      await DeviceMotionEvent.requestPermission();
      await DeviceOrientationEvent.requestPermission();
    }

    permissionGranted = true;
    startScreen.style.display = "none";

  } catch {
    alert("모션 권한을 허용해야 합니다.");
  }
}, { once: true });


/* ======================
   SENSOR INPUT
====================== */

window.addEventListener("deviceorientation", e => {
  if (!rolling) return;

  vx += (e.gamma || 0) * 0.05;
  vy += (e.beta || 0) * 0.05;
});

window.addEventListener("devicemotion", e => {
  if (!rolling) return;

  const a = e.accelerationIncludingGravity;
  if (!a) return;

  vx += a.x * 2.5;
  vy -= a.y * 2.5;

  rotationAccum += (Math.abs(a.x) + Math.abs(a.y)) * 6;
});


/* ======================
   PHYSICS LOOP
====================== */

function update() {
  if (!rolling) return;

  vy += 0.9;

  x += vx;
  y += vy;

  vx *= 0.985;
  vy *= 0.985;

  rotation += Math.abs(vx) + Math.abs(vy);

  const size = dice.offsetWidth;
  const maxX = window.innerWidth - size;
  const maxY = window.innerHeight - size;

  if (x < 0 || x > maxX) vx *= -0.8;
  if (y < 0 || y > maxY) vy *= -0.8;

  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));

  dice.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;

  if (performance.now() - rollStart >= 4000) {
    rolling = false;
    if (rotationAccum >= 540) showCard();
    return;
  }

  requestAnimationFrame(update);
}


/* ======================
   ROLL
====================== */

dice.addEventListener("click", () => {
  if (!permissionGranted || rolling) return;

  rolling = true;
  rotationAccum = 0;
  rollStart = performance.now();

  requestAnimationFrame(update);
});


/* ======================
   CARD
====================== */

function weightedRandom() {
  let r = Math.random(), sum = 0;
  for (let i = 0; i < CARD_WEIGHTS.length; i++) {
    sum += CARD_WEIGHTS[i];
    if (r <= sum) return i;
  }
  return 0;
}

function showCard() {
  cardImg.src = CARD_IMAGES[weightedRandom()];
  card.classList.add("show");
}

card.addEventListener("click", () => {
  card.classList.remove("show");
});
