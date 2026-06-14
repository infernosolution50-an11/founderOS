export const EMBER_MODEL = "gpt-5-mini";
export const RESPONSES_API_URL = "https://api.openai.com/v1/responses";

export function getOpenAIHeaders() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  };
}
