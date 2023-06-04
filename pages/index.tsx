import { Chat } from "@/components/Chat/Chat";
import { Footer } from "@/components/Layout/Footer";
import { Navbar } from "@/components/Layout/Navbar";
import { Message } from "@/types";
import Head from "next/head";
import React from "react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Script from "next/script";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showStartButton, setShowStartButton] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  async function callCLOVAAPI(message: string) {
    const response = await axios(`/api/clova?query=${message}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      throw new Error(response.statusText);
    }

    const data = response.data;

    return data;
  }

  const handleSend = async (message: Message) => {
    const updatedMessages = [...messages, message];

    setMessages(updatedMessages);
    setLoading(true);

    //call calova api
    try {
      //Call CLOVA API
      const clovaResponse = await callCLOVAAPI(message.content);
      console.log(clovaResponse);
      const sentimentResult = `Sentiment Result: ${clovaResponse.document.sentiment}\nConfidence - Neutral: ${clovaResponse.document.confidence.neutral}%, Positive: ${clovaResponse.document.confidence.positive}%, Negative: ${clovaResponse.document.confidence.negative}%`;
      setMessages([
        {
        role: "assistant",
        content: sentimentResult,
        }
      ]);

      setMessages(updatedMessages);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        alert(`오류 발생: ${error.message}`);
      } else {
        alert("알 수 없는 오류 발생");
      }
    }

    
    //sending message to GPT
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: updatedMessages,
      }),
    });

    if (!response.ok) {
      setLoading(false);
      alert(`오류 발생: ${response.status} - ${response.statusText}`);
      throw new Error(response.statusText);
    }

    const data = response.body;

    if (!data) {
      return;
    }

    setLoading(false);

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let isFirst = true;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      if (isFirst) {
        isFirst = false;
        setMessages((messages) => [
          ...messages,
          {
            role: "assistant",
            content: chunkValue,
          },
        ]);
      } else {
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const updatedMessage = {
            ...lastMessage,
            content: lastMessage.content + chunkValue,
          };
          return [...messages.slice(0, -1), updatedMessage];
        });
      }
    }
  };

  const handleStart = async () => {
    setShowStartButton(false);
    setLoading(true);
    const prompt = `우리는 심리상담에 필요한 대화를 나눌거야. 너는 친절한 심리상담사가 되어 질문을 하고, 나는 너의 질문에 답할 예정이야. 내가 제시하는 심리상담 질문과 평가 기준으로 심리상담을 진행해줘.
    다음은 심리상태를 파악하기 위한 질문 20가지이다.
    1. 나는 마음이 차분하다.
    2. 나는 마음이 든든하다.
    3. 나는 긴장되어 있다.
    4. 나는 후회스럽고 서운하다.
    5. 나는 마음이 편하다.
    6. 나는 당황해서 어찌할 바를 모르겠다.
    7. 나는 앞으로 불행이 있을까 걱정하고 있다.
    8. 나는 마음이 놓인다.
    9. 나는 불안하다.
    10. 나는 편안하게 느낀다.
    11. 나는 자신감이 있다.
    12. 나는 짜증스럽다.
    13. 나는 마음이 조마조마하다.
    14. 나는 극도로 긴장되어 있다.
    15. 내 마음은 긴장이 풀려 푸근하다.
    16. 나는 만족스럽다.
    17. 나는 걱정하고 있다.
    18. 나는 흥분되어 어쩔 줄 모른다.
    19. 나는 즐겁다.
    20. 나는 기분이 좋다.
    
    위의 질문20개를 나에게 1개씩 제시해줘. 질문 1개를 제시한 뒤 나의 답변을 기다려. 나의 답변이 입력되면, 다음 질문을 묻기 전 나의 답변에 대해 너의 감성적인 피드백을 50자 이상 제시한 후에 다음 질문으로 넘어가줘. 피드백 중 질문이 있다면 그 질문을 추가적으로 물어봐도 되. 모든 문항에 대해 이를 반복해줘. 너는 각 문항의 의미를 이해하여 질문을 가능한 친절하게 바꾸어서 제시해줘. 이 때 원래 문항 말고, 바뀐 문항만 제시해줘. 질문과 답변을 받는 것이 모두 끝나면 아래의 평가 기준에 따라 총점을 계산해줘.
    
    위 문항에 대한 답변의 점수 기준은 다음과 같다.
    - 답변이 문항에 대해 매우 부정적인 경우: 4점
    - 답변이 문항에 대해 조금 부정적인 경우: 3점
    - 답변이 문항에 대해 조금 긍정적인 경우: 2점
    - 답변이 문항에 대해 매우 긍정적인 경우: 1점`;

    // handleSend({
    //   role: "user",
    //   content: prompt
    // });

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [...messages, { role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      setLoading(false);
      alert(`오류 발생: ${response.status} - ${response.statusText}`);
      throw new Error(response.statusText);
    }

    const data = response.body;

    if (!data) {
      return;
    }

    setLoading(false);

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let isFirst = true;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      if (isFirst) {
        isFirst = false;
        setMessages((messages) => [
          ...messages,
          {
            role: "assistant",
            content: chunkValue,
          },
        ]);
      } else {
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const updatedMessage = {
            ...lastMessage,
            content: lastMessage.content + chunkValue,
          };
          return [...messages.slice(0, -1), updatedMessage];
        });
      }
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: `안녕하세요! 당신의 심리 파악을 도와줄 어시스턴트입니다!`,
      },
    ]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `안녕하세요! 당신의 심리 파악을 도와줄 어시스턴트입니다!`,
      },
    ]);
  }, []);

  // useEffect(() => {
  //   let map = null;
  //   const initMap = () => {
  //     const map = new naver.maps.Map("map", {
  //       center: new naver.maps.LatLng(37.511337, 127.012084),
  //       zoom: 13,
  //     });
  //   };
  //   initMap();
  // }, []);

  // //지도 사이즈 관련 스타일
  // const mapStyle = {
  //   width: "80%",
  //   height: "600px",
  // };

  return (
    <>
      <Head>
        <title>심리상담 챗봇</title>
        <meta
          name="description"
          content="A simple chatbot starter kit for OpenAI's chat model using Next.js, TypeScript, and Tailwind CSS."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* <script 
          type="text/javascript" 
          src="//dapi.kakao.com/v2/maps/sdk.js?appkey=0fef5e5a7f59436b8f288891e962e646"
          async
        ></script> */}
        <>
          <Script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=0fef5e5a7f59436b8f288891e962e646" />
        </>

        {/* <>
          <Script src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=AgFhIHOPdq4WeG3CwyMskgTdHkq7ZlYGLrDDsLiu" />
        </> */}

        <script
          type="text/javascript"
          src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=AgFhIHOPdq4WeG3CwyMskgTdHkq7ZlYGLrDDsLiu"
          async
        ></script>
      </Head>

      <div className="flex flex-col h-screen">
        <Navbar />

        <div className="flex-1 overflow-auto sm:px-10 pb-4 sm:pb-10">
          <div className="max-w-[800px] mx-auto mt-4 sm:mt-12">
            <Chat
              messages={messages}
              loading={loading}
              onSend={handleSend}
              onReset={handleReset}
            />

            <button
              onClick={handleStart}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              시작하기
            </button>
            <div ref={messagesEndRef} />
            {/* <React.Fragment>
              <h1>지도</h1>
              <div id="map" style={mapStyle}></div>
            </React.Fragment> */}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
