import  {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
  type JSX,
} from "react";

// Dropzone imports
import { useDropzone, FileRejection } from "react-dropzone";
import { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";

// Icons
import { BiTrash, BiCloudUpload as CloudArrowUpIcon } from "react-icons/bi";

interface FileUploaderProps {
  file: File | undefined;
  setFile: Dispatch<SetStateAction<File | undefined>>;
  duration: number | undefined;
  setDuration: Dispatch<SetStateAction<number | undefined>>;
}

/**
 * Dropzone component to upload audio files
 */

export default function FileUploader({
  file,
  setFile,
  duration,
  setDuration,
}: FileUploaderProps): JSX.Element {
  // File rejection warning
  const [fileError, setFileError] = useState<string | undefined>(undefined);

  // Get duration of file to upload
  useEffect(() => {
    if (!file) return;
    setDuration(undefined);

    let cancelled = false;

    // create Audio object as soon as file exists
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);

    // get Duration via native Audio element
    const getDuration = () => {
      const d = audio.duration;
      if (d && isFinite(d) && !isNaN(d)) {
        if (!cancelled) setDuration(d);
        console.log("Audio duration (native): ", d);
      }
    };

    // Fallback: use FFmpeg to read duration when the browser can't decode the
    // file (e.g. Safari + MKV / unsupported container)
    const handleError = async () => {
      console.log(
        "Native Audio element failed, falling back to FFmpeg for duration",
      );
      try {
        const d = await getDurationViaFFmpeg(file);
        if (!cancelled && d !== undefined) {
          setDuration(d);
          console.log("Audio duration (FFmpeg): ", d);
        }
      } catch (e) {
        console.warn("FFmpeg duration extraction failed:", e);
      }
    };

    // wait for loading audio
    audio.addEventListener("durationchange", getDuration, false);
    audio.addEventListener("error", handleError, false);

    // cleanup
    return () => {
      cancelled = true;
      audio.removeEventListener("durationchange", getDuration, false);
      audio.removeEventListener("error", handleError, false);
      URL.revokeObjectURL(url);
    };
  }, [file, setDuration]);

  // max file size in bytes (default 50 MB)
  const maxFileSize =
    Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 52_428_800;

  // Dropzone hooks
  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      setFileError(undefined);
      setFile(acceptedFiles[0]);
    },
    [setFile],
  );

  const onDropRejected = useCallback(
    (rejectedFiles: FileRejection[]) => {
      setFile(undefined);
      setDuration(undefined);
      const error = rejectedFiles[0]?.errors[0];
      if (error?.code === "file-too-large") {
        const limitMB = (maxFileSize / (1024 * 1024)).toFixed(0);
        setFileError(
          `File is too large. Maximum allowed size is ${limitMB} MB.`,
        );
      } else {
        setFileError(
          "Invalid file type. Please select a valid audio or video file.",
        );
      }
    },
    [setFile, setDuration, maxFileSize],
  );

  //  Dropzone Configuration
  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted,
    onDropRejected,
    maxFiles: 1,
    maxSize: maxFileSize,
    accept: acceptedFileTpyes,
  });

  return (
    <section className="my-6 h-full w-full">
      <span className="mb-1 text-sm">
        Select your recording (max file size is 50 MB in this demo)
      </span>
      <div
        {...getRootProps({ className: "dropzone" } as DropzoneRootProps)}
        className="flex h-36 flex-col items-center justify-center bg-gray-50"
      >
        <input {...(getInputProps() as DropzoneInputProps)} />
        <CloudArrowUpIcon className="h-24 w-auto text-gray-500" />
        <p className="text-sm text-gray-500">
          Select your recording or drag and drop it here
        </p>
      </div>

      {file && (
        <aside className="bg-background mt-2 flex items-center justify-between">
          <div className="flex">
            {" "}
            <>
              <p className="text-sm italic">
                Selected File:{" "}
                <span>
                  {file?.name}, size:{" "}
                  {file && Number(file?.size / (1024 * 1024)).toFixed(2)} MB
                  {duration && `, duration: ${formatDuration(duration)}`}
                </span>
              </p>
            </>
          </div>
          <div
            className="hover:bg-actionlight rounded-md p-2 hover:cursor-pointer"
            onClick={() => {
              setFile(undefined);
              setDuration(undefined);
            }}
          >
            <BiTrash className="h-4 w-auto" />
          </div>
        </aside>
      )}
      {fileError && (
        <aside className="text-warning mt-2 p-2 text-sm">{fileError}</aside>
      )}
    </section>
  );
}

const acceptedFileTpyes = {
  // //Supported audio formats by OpenAI: ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm']
  "audio/flac": [".flac"],
  "audio/m4a": [".m4a"],
  "audio/mpeg": [".mp3"],
  "audio/mp4": [".mp4"],
  "audio/mp3": [".mpga"],
  "audio/oga": [".oga"],
  "audio/ogg": [".ogg", ".oga"],
  "audio/wav": [".wav"],
  // Optional: Add Audio file types that can be converted

  // // Video files that can be converted
  "video/mp4": [".mp4", ".m4a", ".m4p", ".m4b", ".m4r", ".m4v"],
  "video/quicktime": [".mov", ".qt"],
  "video/webm": [".webm"],
  "video/x-sgi-movie": [".mv", ".movie", ".sgi"],
  "video/ogg": [".ogg", ".ogv"],
  "video/mpeg": [".mpeg", ".mpg", ".mpe"],
  "video/x-msvideo": [".avi"],
  "video/x-ms-wmv": [".wmv"],
  "video/x-flv": [".flv"],
  "video/x-matroska": [".mkv"],
  "video/3gpp": [".3gp"],
};

function formatDuration(duration: number) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor((duration % 3600) % 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} (hh:mm:ss)`;
}

/**
 * Use FFmpeg to extract the duration from files that the browser cannot
 * decode natively (e.g. MKV in Safari).  FFmpeg always logs the container
 * duration during input analysis, so we capture it from the log output.
 */
async function getDurationViaFFmpeg(file: File): Promise<number | undefined> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { toBlobURL, fetchFile } = await import("@ffmpeg/util");
  const baseURL = "/ffmpeg";

  const ffmpeg = new FFmpeg();
  let duration: number | undefined;

  try {
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

    const extension = file.name.split(".").pop() || "bin";
    const inputFileName = `input.${extension}`;
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));

    // Capture duration from FFmpeg's input-analysis log line, e.g.:
    //   "Duration: 01:23:45.67, start: ..."
    ffmpeg.on("log", ({ message }) => {
      const match = message.match(
        /Duration:\s*(\d{2}):(\d{2}):(\d{2})\.(\d{2})/,
      );
      if (match) {
        duration =
          parseInt(match[1]) * 3600 +
          parseInt(match[2]) * 60 +
          parseInt(match[3]) +
          parseInt(match[4]) / 100;
      }
    });

    // Run with no real output – FFmpeg will fail but still emit the duration
    // in its input-analysis output before bailing out.
    await ffmpeg.exec(["-i", inputFileName]).catch(() => {});

    return duration;
  } finally {
    ffmpeg.terminate();
  }
}
