import { Message, OpenAIModel } from "@/types";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

export const SentimentOpenAIStream = async (messages: Message[]) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const body = {
    model: OpenAIModel.DAVINCI_TURBO,
    messages: [
      {
        role: "system",
        content: `You are a helpful, friendly, psychotherapist. tell me in Korean.`,
      },
      {
        role: "assistant",
        content: "안녕하세요! 당신의 심리 파악을 도와줄 어시스턴트입니다!",
      },
      ...messages,
    ],
    max_tokens: 1000,
    temperature: 0.0,
    stream: true,
  };
  console.log(`in sentiments: Request Body: ${JSON.stringify(body)}`);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SENTIMENT_OPENAI_API_KEY}`,
    },
    method: "POST",
    // body: JSON.stringify({
    //   model: OpenAIModel.DAVINCI_TURBO,
    //   messages: [
    //     {
    //       role: "system",
    //       content: `You are a helpful, friendly, psychotherapist. tell me in Korean.`
    //     },
    //     ...messages
    //   ],
    //   max_tokens: 4000,
    //   temperature: 0.0,
    //   stream: true
    // })
    body: JSON.stringify(body),
  });

  console.log(`Response Status: ${res.status}`);
  if (res.status !== 200) {
    const text = await res.text();
    console.error(`Response Body: ${text}`);
    throw new Error("OpenAI API returned an error");
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};
