// Open AI call

"use server";
import { OpenAiResponse } from "@/lib/types";
import getErrorMessage from "@/utils/getErrorMessage";
import { createReadStream } from "fs";
import { OpenAI } from "openai";

export default async function fetchTranscript(
  filePath: string,
  openAiKey: string,
) {
  try {
    // create OpenAI client with API Key provided by app or user
    const openai = new OpenAI({ apiKey: openAiKey });

    // create stream from audio file
    const audioStream = createReadStream(filePath);

    // make API call
    const response = (await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
      response_format: "verbose_json", // get transcript with segments
    })) as unknown as OpenAiResponse;

    if (!response) throw new Error("Failed to fetch transcript");
    return { data: response };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}
