import { Message } from "@/types";
import { FC, useEffect, useState } from "react";
import { ChatInput } from "./ChatInput";
import { ChatLoader } from "./ChatLoader";
import { ChatMessage } from "./ChatMessage";
import { ResetChat } from "./ResetChat";

interface Props {
  sentimentMessage: Message[];
  messages: Message[];
  conclusionMessage: Message[];
  loading: boolean;
  onSend: (message: Message) => void;
  onReset: () => void;
}

declare global{
  interface Window{
    kakao: any;
  }
}

export const Chat: FC<Props> = ({ sentimentMessage, messages, conclusionMessage, loading, onSend, onReset }) => {
  const KAKAO_KEY = `0fef5e5a7f59436b8f288891e962e646`

  // useEffect(() => {
  //   const mapScript = document.createElement('script');

  //   mapScript.async = true;
  //   mapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;

  //   document.head.appendChild(mapScript);

  //   const onLoadKakaoMap = () => {
  //     window.kakao.maps.load(() => {
  //       const mapContainer = document.getElementById('map');
  //       const mapOption = {
  //         center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
  //         level: 3, // 지도의 확대 레벨
  //       };
  //       new window.kakao.maps.Map(mapContainer, mapOption);
  //     });
  //   };
  //   mapScript.addEventListener('load', onLoadKakaoMap);
  // }, []);

  return (
    <>
      <div className="flex flex-row justify-between items-center mb-4 sm:mb-8">
        <ResetChat onReset={onReset} />
      </div>

      <div className="flex flex-col rounded-lg px-2 sm:p-4 sm:border border-neutral-300">
        {messages.map((message, index) => (
          <div
            key={index}
            className="my-1 sm:my-1.5"
          >
            <ChatMessage message={message} />
          </div>
        ))}

        {sentimentMessage.map((message, index) => (
          <div
            key={index}
            className="my-1 sm:my-1.5"
          >
            <ChatMessage message={message} />
          </div>
        ))}

        {conclusionMessage.map((message, index) => (
          <div
            key={index}
            className="my-1 sm:my-1.5"
          >
            <ChatMessage message={message} />
          </div>
        ))}


        {/* kakaoMap */}
        {/* <div className="my-1 sm:my-1.5">
          <div
            className={`flex items-center bg-neutral-200 text-neutral-900 rounded-2xl px-4 py-2 w-fit`}
            style={{ overflowWrap: "anywhere" }}
          >
            <p>지도</p>
            <div id="map" className="w-96 h-96"></div>
          </div>
        </div> */}

        {loading && (
          <div className="my-1 sm:my-1.5">
            <ChatLoader />
          </div>
        )}

        <div className="mt-4 sm:mt-8 bottom-[56px] left-0 w-full">
          <ChatInput onSend={onSend} />
        </div>
      </div>
    </>
  );
};
