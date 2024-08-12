function submitDetails(event) {
  // 기본 제출 동작 막기
  event.preventDefault();

  // 사용자 입력값 가져오기
  const relationship = document.getElementById("relationshipInput").value;
  const durationYears = document.getElementById("durationYears").value || 0;
  const durationMonths = document.getElementById("durationMonths").value || 0;
  const story = document.getElementById("storyInput").value;
  let myMbti = document.getElementById("myMbtiInput").value;
  let partnerMbti = document.getElementById("youMbtiInput").value;

  // 입력 값 확인
  console.log("Relationship:", relationship);
  console.log("Duration (years):", durationYears);
  console.log("Duration (months):", durationMonths);
  console.log("Story:", story);
  console.log("My MBTI:", myMbti);
  console.log("Partner MBTI:", partnerMbti);

  // MBTI 형식 유효성 검사
  const mbtiPattern = /^[A-Z]{4}$/;
  if (!mbtiPattern.test(myMbti) || !mbtiPattern.test(partnerMbti)) {
    alert("정확한 MBTI 형식을 입력해 주세요.");
    return;
  }

  // 입력된 값을 대문자로 변환
  myMbti = myMbti.toUpperCase();
  partnerMbti = partnerMbti.toUpperCase();

  // 기간 데이터 처리
  let duration = `${durationYears}년 ${durationMonths}개월`;

  // 로컬 스토리지에 데이터 저장
  localStorage.setItem("relationship", relationship);
  localStorage.setItem("duration", duration);
  localStorage.setItem("story", story);
  localStorage.setItem("myMbti", myMbti);
  localStorage.setItem("partnerMbti", partnerMbti);

  // chat.html로 이동
  window.location.href = "chat.html";
}

// 무료 세미나 배너 이동 링크
function navigateTo() {
  window.location.href = "https://ozcodingschool.com/ozcoding/lovecoachseminar";
}

document.addEventListener("DOMContentLoaded", () => {
  function setVh() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }

  window.addEventListener("resize", setVh);
  window.addEventListener("orientationchange", setVh);
  setVh();

  document.querySelectorAll("input, textarea, select").forEach((element) => {
    element.addEventListener("focus", setVh);
    element.addEventListener("blur", setVh);
  });

  document.getElementById("splashScreen").addEventListener("click", () => {
    document.getElementById("splashScreen").classList.add("hidden");
    document.getElementById("mainContent").classList.remove("hidden");
  });

  document
    .getElementById("detailsForm")
    .addEventListener("submit", submitDetails);
});

function changeValue(id, delta) {
  const input = document.getElementById(id);
  const min = parseInt(input.min);
  const max = parseInt(input.max);
  let value = parseInt(input.value) || 0;

  let newValue = value + delta;

  if (newValue < min) {
    newValue = min;
  } else if (newValue > max) {
    newValue = max;
  }

  input.value = newValue;

  togglePlaceholder(input);
}

function togglePlaceholder(input) {
  if (input.value === "" || input.value === "0") {
    input.classList.add("placeholder-visible");
    if (input.value === "") {
      input.value = "0";
    }
  } else {
    input.classList.remove("placeholder-visible");
  }
}

document.querySelectorAll('input[type="number"]').forEach((input) => {
  input.addEventListener("focus", () => {
    if (input.value === "0") {
      input.value = "";
    }
    input.classList.remove("placeholder-visible");
  });
  input.addEventListener("blur", () => {
    if (input.value === "") {
      input.value = "0";
      input.classList.add("placeholder-visible");
    }
  });
  togglePlaceholder(input);
});
