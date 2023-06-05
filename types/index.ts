export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo",
  FINE_TUNING = "davinci:ft-jd:mentalcare-2023-05-14-20-25-37"
}

export interface Message {
  role: Role;
  content: string;
}

export type Role = "assistant" | "user";
