// Open API에서 발급받은 key를 `` 사이에 입력하세요.
const YOUR_OPEN_AI_API_KEY = `sk-S-35bMRDMPv9I2FxKMZDw-YkeVKGOURXMtxGE01FqCT3BlbkFJQjBJs-wWuA7KjZxi_BhIVvqDRJHZKWyoLCLrLkiJUA`;
// 강의에서 설명한 대로 URI를 `` 사이에 입력하세요.
const OPENAI_API = `https://api.openai.com/v1/chat/completions`;
// OpenAI API에 메시지를 보내고 응답을 받는 함수
export async function callOpenAiApi(messagesToSend) {
  const response = await fetch(OPENAI_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${YOUR_OPEN_AI_API_KEY}`, // Bearer YOUR_OPEN_AI_API_KEY - 실제 배포시에는 api 키 노출 방지를 위하여 백엔드 서버를 통해 api에 접근하는것이 일반적인 방법입니다.
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // 사용할 GPT 모델 지정
      messages: messagesToSend, // API에 보낼 메시지 배열
      max_tokens: 1000, // 생성할 응답의 최대 토큰 수
      temperature: 0.7, // 생성되는 텍스트의 창의성 조절 (0.0-2.0)
    }),
  });

  if (!response.ok) {
    throw new Error("HTTP error, status = " + response.status);
  }

  return response.json();
}
