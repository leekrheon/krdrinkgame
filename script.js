const dice = document.getElementById("dice");
const card = document.getElementById("card");
const permission = document.getElementById("permission");

/* 화면 크기 */
let W = window.innerWidth;
let H = window.innerHeight;

/* 주사위 크기 */
const SIZE = 120;

/* 위치: 처음엔 바닥에 떨어져 있음 */
let x = (W - SIZE) / 2;
let y = H - SIZE;

/* 속도 */
let vx = 0;
let vy = 0;

/* 물리 상수 */
const GRAVITY = 0.6;        // 아래로 끌어당기는 중력
const FRICTION = 0.99;      // 공기 저항
const BOUNCE = 0.85;        // 벽/바닥 반발력
const SHAKE_POWER = 1.8;    // 흔들기 세기 반영 비율
const THRESHOLD = 1.2;      // 약한 흔들림 무시

let rolling = false;
let rollTimer = null;

/* iOS 권한 */
function requestPermission() {
  if (
    typeof DeviceMotionEvent !== "undefined" &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission().then((res) => {
      if (res === "granted") {
        permission.style.display = "none";
        window.addEventListener("devicemotion", onMotion);
      }
    });
  } else {
    permission.style.display = "none";
    window.addEventListener("devicemotion", onMotion);
  }
}

document.body.addEventListener("click", requestPermission, { once: true });

/* 흔들기 처리 */
function onMotion(e) {
  if (!e.acceleration) return;

  const ax = e.acceleration.x || 0;
  const ay = e.acceleration.y || 0;

  const power = Math.abs(ax) + Math.abs(ay);
  if (power < THRESHOLD) return;

  /* 실제 흔든 방향 그대로 속도에 반영 */
  vx += ax * SHAKE_POWER;
  vy -= ay * SHAKE_POWER;

  if (!rolling) {
    rolling = true;
    startRollEnd();
  }
}

/* 3초 후 카드 표시 */
function startRollEnd() {
  clearTimeout(rollTimer);
  rollTimer = setTimeout(() => {
    dice.style.display = "none";
    card.style.display = "flex";
    rolling = false;
  }, 3000);
}

/* 애니메이션 루프 */
function animate() {
  /* 중력 */
  vy += GRAVITY;

  /* 이동 */
  x += vx;
  y += vy;

  /* 마찰 */
  vx *= FRICTION;
  vy *= FRICTION;

  /* 좌우 벽 */
  if (x < 0) {
    x = 0;
    vx *= -BOUNCE;
  }
  if (x > W - SIZE) {
    x = W - SIZE;
    vx *= -BOUNCE;
  }

  /* 천장 */
  if (y < 0) {
    y = 0;
    vy *= -BOUNCE;
  }

  /* 바닥 */
  if (y > H - SIZE) {
    y = H - SIZE;
    vy *= -BOUNCE;

    /* 바닥에 닿으면 조금 더 감쇠 */
    vx *= 0.95;
  }

  dice.style.transform = `
    translate(${x}px, ${y}px)
    rotate(${(vx + vy) * 4}deg)
  `;

  requestAnimationFrame(animate);
}

/* 리사이즈 대응 */
window.addEventListener("resize", () => {
  W = window.innerWidth;
  H = window.innerHeight;
});

animate();

