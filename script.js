const dice = document.getElementById("dice");
const card = document.getElementById("card");
const hint = document.getElementById("hint");
const permissionBtn = document.getElementById("permissionBtn");

let canShake = false;
let isRolling = false;

// iOS 센서 권한
permissionBtn.addEventListener("click", async () => {
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    try {
      const res = await DeviceMotionEvent.requestPermission();
      if (res === "granted") {
        canShake = true;
        permissionBtn.style.display = "none";
        hint.textContent = "휴대폰을 흔들어 주세요";
      }
    } catch {
      alert("센서 권한을 허용해주세요");
    }
  } else {
    canShake = true;
    permissionBtn.style.display = "none";
  }
});

// 흔들기 감지
window.addEventListener("devicemotion", (event) => {
  if (!canShake || isRolling) return;

  const acc = event.accelerationIncludingGravity;
  if (!acc) return;

  const power =
    Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);

  if (power > 25) {
    rollDice();
  }
});

function rollDice() {
  isRolling = true;
  hint.textContent = "주령구가 굴러갑니다…";

  card.classList.remove("show");

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const randomX = Math.random() * (vw - 200) + 100;
  const randomY = Math.random() * (vh - 200) + 100;
  const rotation = Math.random() * 1440 + 720;

  dice.style.transform = `
    translate(${randomX - vw / 2}px, ${randomY - vh / 2}px)
    rotate(${rotation}deg)
    scale(1.1)
  `;

  // 3초 후 카드 등장
  setTimeout(() => {
    dice.style.transform = `translate(-50%, -50%) scale(0.9)`;
    card.classList.add("show");
    hint.textContent = " ";

    setTimeout(() => {
      isRolling = false;
    }, 800);
  }, 3000);
}


