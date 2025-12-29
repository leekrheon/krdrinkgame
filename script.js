const dice = document.getElementById("dice");
const result = document.getElementById("result");
const permissionBtn = document.getElementById("permissionBtn");

let canShake = false;
let isRolling = false;

// 주령구 벌칙 14개
const penalties = [
  "자작삼배 – 혼자 3잔",
  "중인음 – 모두 한 잔",
  "일인음 – 한 사람만",
  "벌주",
  "급수진배 – 바로 원샷",
  "재척 – 다시 던져라",
  "물음 – 마시지 말라",
  "좌인음 – 왼쪽 사람",
  "우인음 – 오른쪽 사람",
  "우인음 – 오른쪽 사람",
  "주인음 – 주최자",
  "대작 – 큰 잔으로",
  "소작 – 작은 잔으로",
  "가무 – 노래나 춤",
  "자유 – 원하는 사람"
];

// iOS 센서 권한 요청
permissionBtn.addEventListener("click", async () => {
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    try {
      const response = await DeviceMotionEvent.requestPermission();
      if (response === "granted") {
        canShake = true;
        permissionBtn.style.display = "none";
        result.textContent = "휴대폰을 흔들어 주세요";
      }
    } catch (e) {
      alert("센서 권한을 허용해주세요");
    }
  } else {
    // Android
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
  dice.classList.add("rolling");
  result.textContent = "주령구가 굴러갑니다…";

  setTimeout(() => {
    const pick =
      penalties[Math.floor(Math.random() * penalties.length)];
    result.textContent = pick;
    dice.classList.remove("rolling");

    // 연속 흔들기 방지
    setTimeout(() => {
      isRolling = false;
    }, 1000);
  }, 800);
}

