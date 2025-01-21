import getErrorMessage from "@/utils/getErrorMessage";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
const baseURL = "/ffmpeg";

export type AudioConversionFormat = "mp3";

export interface AudioConversionOptions {
  inputFile: File;
  targetFormat: AudioConversionFormat;
  onProgress?: (progress: number) => void;
}

/**
 * Convert audio file to target format
 */
export async function convertAudio({
  inputFile,
  targetFormat,
  onProgress,
}: AudioConversionOptions): Promise<File> {
  const ffmpeg = new FFmpeg();

  try {
    // load ffmpeg from public folder
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript",
      ),
    });
    console.log("FFmpeg loaded");

    // listen to progress event and update onProgress callback
    let lastProgress = 0;
    ffmpeg.on("progress", ({ progress }) => {
      if (onProgress) {
        const percentage = Math.min(Math.round(progress * 100), 100);
        if (percentage > lastProgress) {
          lastProgress = percentage;
          onProgress(percentage);
          console.log(`Conversion progress: ${percentage}%`);
        }
      }
    });

    // Write input file to FFmpeg
    console.log("Writing input file to FFmpeg");
    const extension = inputFile.name.split(".").pop();
    if (!extension) throw "Invalid file extension";
    const inputFileName = `input.${extension}`;
    await ffmpeg.writeFile(inputFileName, await fetchFile(inputFile));

    // Get FFmpeg conversion arguments
    const conversionArgs = getFFmpegConversionArgs(extension, targetFormat);
    console.log("FFmpeg conversion arguments:", conversionArgs);

    // Start conversion
    console.log("Starting conversion");
    await ffmpeg.exec(conversionArgs);

    // Read converted file and return it
    const data = await ffmpeg.readFile(`output.${targetFormat}`);
  
    return new File([data], `output.${targetFormat}`, {
      type: `audio/${targetFormat}`,
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw "Failed to convert your file: " + errorMessage;
  } finally {
    // Clean up FFmpeg resources
    ffmpeg.terminate();
  }
}

function getFFmpegConversionArgs(
  extension: string,
  targetFormat: AudioConversionFormat,
): string[] {
  const baseArgs = ["-i", `input.${extension}`];

  switch (targetFormat) {
    // ... can be extended for other formats
    case "mp3":
      return [
        ...baseArgs,
        "-codec:a",
        "libmp3lame",
        "-b:a",
        "96k",
        "-vn",
        `output.${targetFormat}`,
        "-y",
        "-loglevel",
        "error",
      ];

    default:
      throw `Unsupported format: ${targetFormat}`;
  }
}
