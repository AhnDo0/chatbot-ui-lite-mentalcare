import { Message } from "@/types";
import { ConclusionOpenAIStream } from "@/utils/conclusion";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { prompt } = (await req.json()) as {
        prompt: string;
    };

    const charLimit = 12000;
    // Ensure the prompt is not too long
    if (prompt.length > charLimit) {
        throw new Error("Prompt too long");
      }
  
      const stream = await ConclusionOpenAIStream(prompt);
  
      return new Response(stream);
    } catch (error) {
      console.error(error);
      return new Response("Error", { status: 500 });
    }
  };

export default handler;
