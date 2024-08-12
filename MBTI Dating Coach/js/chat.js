import { callOpenAiApi } from "./api.js";

document.addEventListener("DOMContentLoaded", function () {
  displayInitialMessages(); // 초기 메시지 표시
  autoResizeTextarea(); // 텍스트 영역 자동 크기 조정 초기화
});

// 모든 대화 내역을 저장하는 배열
let messages = [];
const initialMessages = []; // 초기 메시지를 저장하는 배열
let includeAllMessages = true; // 모든 대화 내용을 포함시키는 경우, false인 경우는 대화 내용을 포함하지 않은 하나의 입력값만 api로 전송

// 초기 메시지 표시 함수
function displayInitialMessages() {
  // 로컬 스토리지에서 사용자 입력값 가져오기 - 사용자가 입력한 관계, 기간, 사연, MBTI 정보를 로컬 스토리지에서 가져옵니다.
  const relationship = localStorage.getItem("relationship");
  const duration = localStorage.getItem("duration");
  const story = localStorage.getItem("story");
  const partnerMbti = localStorage.getItem("partnerMbti");
  const myMbti = localStorage.getItem("myMbti");

  // 역할 설정
  const coachAge = 30;
  const coachGender = "여성";

  console.log(relationship, duration, story, partnerMbti, myMbti);
  // 역할(role) 메시지 생성 - 모델에게 주어질 역할을 설명하는 메시지를 생성합니다. 이 메시지는 system 역할로 설정되며, 모델이 사용자에게 어떻게 답변할지에 대한 지침을 제공합니다.
  if (partnerMbti && relationship && duration && story) {
    const initialRoleMessage = `연애상담 전문가, ${coachAge}대 ${coachGender}의 연애 코치. 
    휴대폰으로 메시지를 주고받는 것처럼 가능한 짧게 대답하고 꼭 가벼운 존댓말을 사용해야해.
    인사는 생략해줘.
    아래의 내용을 토대로 연애 상담을 해줘.
    관계: ${relationship}, 기간: ${duration}, 사연: ${story}, 사용자 MBTI: ${myMbti}, 상대방 MBTI: ${partnerMbti}`;

    initialMessages.length = 0;
    initialMessages.push({ role: "system", content: initialRoleMessage });

    if (includeAllMessages) {
      messages = [{ role: "system", content: initialRoleMessage }];
    }

    fetchInitialResponse(initialRoleMessage);
  }
}

// 초기 응답을 가져오는 함수
async function fetchInitialResponse(roleMessage) {
  const userInputElement = document.getElementById("userInput");
  const sendButton = document.getElementById("sendButton");
  const sendButtonText = document.getElementById("sendButtonText");
  const loadingMessage = document.getElementById("loadingMessage");
  const originalPlaceholder = "자유롭게 질문해보세요.";

  // 입력창 비활성화 및 로딩 메시지 표시
  userInputElement.placeholder = "최대 1분 정도 소요될 수 있습니다.";
  userInputElement.disabled = true;
  sendButtonText.style.display = "none";
  loadingMessage.style.display = "block";
  sendButton.disabled = true;

  // 로딩 말풍선 추가
  const loadingMessageElement = displayMessage("", "left");
  loadingMessageElement
    .querySelector(".bubble")
    .classList.add("typing-animation");

  // 채팅목록의 가장 아래로 스크롤
  scrollToBottom();

  // 시스템 메시지를 API로 보낼 메시지 배열에 추가
  const messagesToSend = [{ role: "system", content: roleMessage }];

  try {
    // OpenAI API 호출
    const data = await callOpenAiApi(messagesToSend);
    const answer = data.choices[0].message.content;
    const initialMessage = `안녕하세요! 오즈코딩스쿨 AI 연애코치입니다 :)<br><br>${answer}`;
    chatList.removeChild(loadingMessageElement); // 로딩 메시지 제거
    displayMessage(initialMessage, "left");

    // 응답 메시지를 messages 배열에 추가
    if (includeAllMessages) {
      messages.push({ role: "assistant", content: answer });
    }
  } catch (error) {
    console.error(error);
    chatList.removeChild(loadingMessageElement); // 로딩 메시지 제거
    displayMessage("오류가 발생했습니다. 다시 시도해주세요.", "left");
  } finally {
    //로딩 상태 해제
    loadingMessage.style.display = "none";
    sendButtonText.style.display = "inline";
    sendButton.disabled = false;
    userInputElement.disabled = false;
    userInputElement.placeholder = originalPlaceholder;

    // 채팅목록의 가장 아래로 스크롤
    scrollToBottom();
  }
}

// 메시지를 보내는 함수
async function sendMessage() {
  const userInputElement = document.getElementById("userInput");
  const userInput = userInputElement.value;

  // 입력값이 비어있을 때 함수 종료
  if (userInput === "") {
    return;
  }

  // 입력값을 messages 배열에 추가 (모든 메시지를 포함시키는 경우)
  if (includeAllMessages) {
    messages.push({ role: "user", content: userInput });
  }

  const originalPlaceholder = "자유롭게 질문해보세요."; // 원래 placeholder 내용 저장

  userInputElement.value = ""; // 입력창 빈값으로 만들기
  userInputElement.placeholder = "최대 1분 정도 소요될 수 있습니다."; // placeholder 내용 변경
  updateSendButtonColor();
  displayMessage(userInput, "right");
  userInputElement.disabled = true; // 입력창 비활성화

  // 입력창 높이 초기화
  userInputElement.style.height = "54px";
  userInputElement.style.overflowY = "hidden";

  // 버튼 텍스트 대신 로딩메시지 표시(로딩)
  const sendButton = document.getElementById("sendButton");
  const sendButtonText = document.getElementById("sendButtonText");
  const loadingMessage = document.getElementById("loadingMessage");
  sendButtonText.style.display = "none";
  loadingMessage.style.display = "block";
  sendButton.disabled = true;

  // 로딩 말풍선 추가
  const loadingMessageElement = displayMessage("", "left");
  loadingMessageElement
    .querySelector(".bubble")
    .classList.add("typing-animation"); // 텍스트 애니메이션 css로 로딩메시지 적용

  // 채팅목록의 가장 아래로 스크롤
  scrollToBottom();

  // API 호출을 위한 메시지 배열 결정
  const messagesToSend = includeAllMessages
    ? [...messages]
    : [...initialMessages, { role: "user", content: userInput }];

  try {
    const data = await callOpenAiApi(messagesToSend);
    const answer = data.choices[0].message.content;
    chatList.removeChild(loadingMessageElement); // 로딩 메시지 제거
    displayMessage(answer, "left");

    // GPT-4의 응답을 messages 배열에 추가 (모든 메시지를 포함시키는 경우)
    if (includeAllMessages) {
      messages.push({ role: "assistant", content: answer });
    }
  } catch (error) {
    console.error(error);
    chatList.removeChild(loadingMessageElement); // 로딩 메시지 제거
    displayMessage("오류가 발생했습니다. 다시 시도해주세요.", "left");
  } finally {
    loadingMessage.style.display = "none";
    sendButton.disabled = false; // 로딩 숨기고 버튼 활성화
    sendButtonText.style.display = "inline"; // 버튼의 텍스트 활성화
    userInputElement.disabled = false; // 입력창 활성화
    userInputElement.placeholder = originalPlaceholder; // placeholder 내용 원래대로 복구

    // 채팅목록의 가장 아래로 스크롤
    scrollToBottom();
  }
}

// 사용자와 코치의 아바타 이미지 URL
const userAvatarUrl = "./images/mbtiChat_oz_icon.png";
const coachAvatarUrl = "./images/mbtiChat_coach.png";

// 메시지를 화면에 표시하는 함수
function displayMessage(message, alignment) {
  const chatList = document.getElementById("chatList");
  // 메시지를 담을 div 생성 및 class 추가
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  messageElement.classList.add(
    alignment === "right" ? "user-message" : "coach-message"
  ); // 메시지 정렬 방향 설정

  // 아바타 이미지를 담을 div 생성 및 class 추가
  const avatarElement = document.createElement("div");
  avatarElement.classList.add("avatar");

  // 아바타 이미지 생성
  const avatarImg = document.createElement("img");
  avatarImg.src = alignment === "right" ? userAvatarUrl : coachAvatarUrl;

  // 아바타 이미지 요소를 아바타 div에 담기
  avatarElement.appendChild(avatarImg);

  // 아바타 div 요소를 메시지 div 앞에 추가
  messageElement.appendChild(avatarElement);

  // 말풍선 생성
  const bubbleElement = document.createElement("div");
  bubbleElement.classList.add("bubble");

  // 줄바꿈을 <br> 태그로 변환하여 HTML로 표시
  bubbleElement.innerHTML = marked.parse(message.replace(/\n/g, "<br>")); // 마크다운 텍스트를 HTML로 변환하여 표시

  // 말풍선 요소를 정렬된 요소에 담기
  messageElement.appendChild(bubbleElement);
  // 마지막으로 요소를 chatList에 담아서 화면에 표시
  chatList.appendChild(messageElement);

  // 로딩메시지에 애니메이션 추가
  if (message === "답변을 작성하는 중입니다") {
    bubbleElement.classList.add("typing-animation");
  }

  return messageElement; // 메시지 요소를 반환하여 나중에 제거할 수 있게 함
}

// 입력창 내용에 따라 버튼 색 변경
function updateSendButtonColor() {
  const sendButton = document.getElementById("sendButton");
  const userInput = document.getElementById("userInput").value;

  // sendButton.style.backgroundColor =
  //   userInput.trim() === "" ? "#808080bf" : "#FF4545";
  // trim으로 앞뒤의 공백을 제거한 후 비어있는지 확인 후 색 변경
  sendButton.disabled = userInput.trim() === "";
  // 비어있을시 버튼 비활성화
}

// 텍스트 영역 자동 크기 조정 함수
function autoResizeTextarea() {
  const textarea = document.getElementById("userInput");
  textarea.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.max(this.scrollHeight, 54) + "px";
    if (this.scrollHeight > 96) {
      this.style.overflowY = "auto";
    } else {
      this.style.overflowY = "hidden";
    }
  });
}

// 채팅 목록을 가져오는 함수 - 로컬 스토리지나 다른 저장소에서 채팅 기록을 불러올 수 있음
function getChatList() {
  // 여기서는 비워둠
}

function scrollToBottom() {
  const chatList = document.getElementById("chatContainer");
  chatList.scrollTop = chatList.scrollHeight;
  console.log("Scroll to bottom called"); // 디버깅을 위해 추가한 로그
}

// 이벤트가 발생했을 때 함수 호출
document
  .getElementById("userInput")
  .addEventListener("input", updateSendButtonColor); // input에 입력값이 생기면 버튼 색상 업데이트
document.getElementById("sendButton").addEventListener("click", sendMessage); // 버튼을 클릭하면 sendMessage 함수 호출
document
  .getElementById("userInput")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // 기본 Enter 키 동작 방지
      sendMessage(); // 메시지 전송
    }
  }); // 키보드의 키를 눌렀을 때, 누른 키가 "Enter"인 경우에만 sendMessage 함수 호출

// 페이지 로드가 끝나면 getChatList 함수를 호출
// 화면이 완전히 준비된 후 채팅리스트 불러옴
window.addEventListener("load", getChatList);
