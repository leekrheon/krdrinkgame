const dice = document.getElementById("dice");
const card = document.getElementById("card");

let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2;
let velX = 0;
let velY = 0;

const SPEED_MULTIPLIER = 3.0; // 흔들기 반응 속도
const FRICTION = 0.985;      // 굴러가는 지속력
const BOUNCE = 0.9;          // 벽 반발력

let rolling = false;
let rollTimeout = null;

// iOS 권한 요청
function requestMotionPermission() {
  if (
    typeof DeviceMotionEvent !== "undefined" &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          window.addEventListener("devicemotion", handleMotion);
        }
      })
      .catch(console.error);
  } else {
    window.addEventListener("devicemotion", handleMotion);
  }
}

document.body.addEventListener("click", requestMotionPermission, { once: true });

function handleMotion(event) {
  if (!event.accelerationIncludingGravity) return;

  const ax = event.accelerationIncludingGravity.x || 0;
  const ay = event.accelerationIncludingGravity.y || 0;

  velX += ax * SPEED_MULTIPLIER;
  velY += ay * SPEED_MULTIPLIER;

  if (!rolling) {
    rolling = true;
    startRollTimer();
  }
}

function startRollTimer() {
  if (rollTimeout) clearTimeout(rollTimeout);

  rollTimeout = setTimeout(() => {
    dice.style.display = "none";
    card.style.display = "flex";
    rolling = false;
  }, 3000);
}

function animate() {
  posX += velX;
  posY += velY;

  velX *= FRICTION;
  velY *= FRICTION;

  const diceRect = dice.getBoundingClientRect();
  const size = diceRect.width;

  if (posX < 0) {
    posX = 0;
    velX *= -BOUNCE;
  }
  if (posX > window.innerWidth - size) {
    posX = window.innerWidth - size;
    velX *= -BOUNCE;
  }
  if (posY < 0) {
    posY = 0;
    velY *= -BOUNCE;
  }
  if (posY > window.innerHeight - size) {
    posY = window.innerHeight - size;
    velY *= -BOUNCE;
  }

  dice.style.transform = `translate(${posX}px, ${posY}px) rotate(${posX + posY}deg)`;

  requestAnimationFrame(animate);
}

animate();

