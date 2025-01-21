import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

// Dropzone imports
import { useDropzone } from "react-dropzone";
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

    // create Audio object as soon as file exists
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);

    // get Duration
    const getDuration = () => {
      setDuration(audio.duration);
    };

    // wait for loading audio
    audio.addEventListener("durationchange", getDuration, false);

    // cleanup
    return () => {
      audio.removeEventListener("durationchange", getDuration, false);
      URL.revokeObjectURL(url);
    };
  }, [file, setDuration]);

  // Dropzone hooks
  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      if (
        acceptedFiles[0].size >
        (Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 1000000000)
      ) {
        setFileError(
          "Sorry, the selected file is too big. Please try another file",
        );
        setFile(undefined);
        setDuration(undefined);
        return;
      }
      setFileError(undefined);

      setFile(acceptedFiles[0]);
    },
    [setFile, setDuration],
  );

  const onDropRejected = useCallback(() => {
    setFile(undefined);
    setDuration(undefined);
    setFileError("Invalid file type. Please select a valid file type");
  }, [setFile, setDuration]);

  //  Dropzone Configuration
  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted,
    onDropRejected,
    maxFiles: 1,
    accept: acceptedFileTpyes,
  });

  return (
    <section className="my-6 h-full w-full">
      <span className="mb-1 text-sm">Select your recording</span>
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
        <aside className="mt-2 flex items-center justify-between bg-background">
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
            className="rounded-md p-2 hover:cursor-pointer hover:bg-actionlight"
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
        <aside className="mt-2 p-2 text-sm text-warning">{fileError}</aside>
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
