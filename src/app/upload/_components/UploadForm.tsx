/* Upload form, will check if user has set an API key or sufficient free credits,
will extract audio from video file locally,
triggers server action to fetch transcript
*/

"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UploadButton from "./buttons";
import { ProjectSchema } from "@/lib/types";

// toast
import { toast } from "react-hot-toast";

// modals
import HtmlModal from "@/components/ui/modals/HtmlModal";
import { SetOpenAiKeyModal } from "./_modals/SetOpenAiKeyModal";
import { OpenAiPricingModal } from "./_modals/OpenAiPricingModal";
import { FreeCreditsModal } from "./_modals/FreeCreditsModal";

// server actions
import { uploadServerAction } from "./_server/uploadServerAction";
import { getCredits, getOpenAiKey } from "@/lib/supabase/actions";

import FileUploader from "./fileUploader";
import getErrorMessage from "@/utils/getErrorMessage";
import { convertAudio } from "./convertToMp3";

// size config
const maxInputSize: number =
  Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 1e9; // 1000 MB ( 1e9) - max file size upload

function UploadForm({ userId }: { userId: string }) {
  // redirect to other routes
  const router = useRouter();

  // error states in form
  const [descriptionWarning, setDescriptionWarning] = useState(false);
  const [projectNameWarning, setProjectNameWarning] = useState(false);

  // state for input file
  const [file, setFile] = useState<File | undefined>();
  const [duration, setDuration] = useState<number>();

  // project-text-input states
  const [descriptionValue, setDescriptionValue] = useState("");
  const [projectameValue, setProjectnameValue] = useState("");

  // user credits
  const [userCredits, setUserCredits] = useState<number>();

  // pending state for form
  const [pending, setPending] = useState(false);

  // modals will be shown onSubmit
  const [showOpenAiKeyModal, setShowOpenAiKeyModal] = useState(false);
  const [showOpenAiPricingModal, setShowOpenAiPricingModal] = useState(false);
  const [showFreeCreditsModal, setShowFreeCreditsModal] = useState(false);

  // state that triggers file conversion
  const [confirmedModal, setConfirmedModal] = useState(false);

  // use Effect triggers API call after user confirmed Pricing
  useEffect(() => {
    if (!file || !confirmedModal) return;

    // define async server Action function
    const runServerAction = async (formData: FormData, file: File) => {
      // prepare Server action
      setPending(true);

      const fileExtension = "." + file.name.split(".").pop();

      // run local conversion if file is not an mp3
      if (fileExtension !== ".mp3") {
        const convertToast = toast.loading(
          "Converting to MP3. Please wait. This may take a few minutes.",
        );

        // try to convert
        try {
         
          const converted = await convertAudio({
            inputFile: file,
            targetFormat: "mp3",

            // show progress in toast
            onProgress: (progress) => {
              toast.loading(
                <div className="mt-4">
                  <span className="text-sm">
                    Converting your recording into a mp3-file.
                  </span>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-action"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="mt-1 text-sm">{progress}%</span>
                </div>,
                { id: convertToast },
              );
            },
          });

          if (!converted) throw "Could not convert file";
          if (converted.size > maxInputSize)
            throw "The selected file is too large, please try a smaller one";

          formData.append("file", converted);
          toast.success("Extracted the audio from your file", {
            id: convertToast,
          });
        } catch (error) {
          console.error("Conversion failed", error);
          const errorMessage = getErrorMessage(error);
          toast.error(errorMessage, { id: convertToast });

          // reset states
          setFile(undefined);
          setDuration(undefined);
          setConfirmedModal(false);
          setPending(false);
          return;
        }
      } else {
        if (file.size > maxInputSize) {
          toast.error("You're file is too large");

          // resset states
          setConfirmedModal(false);
          setPending(false);
          setFile(undefined);
          setDuration(undefined);
          return;
        }
        formData.append("file", file);
      }

      // create toast for server action
      const toastId = toast.loading(
        "Getting your transcript. This may take a few minutes...",
      );

      //  server action
      
      const { error, data: projectId } = await uploadServerAction(formData);
      if (error || !projectId) {
        // update toast
        toast.error(error ?? "Something went wrong", { id: toastId });
        // reset states
        setPending(false);
        setConfirmedModal(false);
        return;
      }
      setPending(false);
      //  update toast
      toast.success(`Your project "${projectameValue}" is ready`, {
        id: toastId,
      });
      //redirect user to new project if still on upload page
      if (window.location.pathname === "/upload") {
        router.push(`/projects/${projectId}`);
      }
    };

    if (!confirmedModal || !file || !projectameValue)
      return setConfirmedModal(false);

    // create form data
    const formData = new FormData();

    formData.append("projectname", projectameValue);
    formData.append("description", descriptionValue);

    // run server action function
    runServerAction(formData, file);
  }, [confirmedModal, file, projectameValue, descriptionValue, router]);

  // Button will trigger confirm modals
  async function handleUploadButton(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) return toast.error("Please select a file");
    if (!duration)
      return toast.error(
        "Please wait until we calculated the duration of your audio file",
      );

    // validation of projectName
    const resultProjectName =
      ProjectSchema.shape.projectname.safeParse(projectameValue);
    if (!resultProjectName.success) {
      setProjectNameWarning(true);
      return;
    }
    setProjectnameValue(resultProjectName.data);

    // validation of description
    const resultDescription =
      ProjectSchema.shape.description.safeParse(descriptionValue);
    if (!resultDescription.success) {
      // const errorMessage = resultDescription.error.issues[0].message;
      setDescriptionWarning(true);
      return;
    }
    setDescriptionValue(resultDescription.data);

    // **** check if user has enough credits or an API key set (will be done on sever-side as well)
    // get credits
    const { data: credits, error: errorCredits } = await getCredits(userId);
    if (errorCredits || credits === undefined || credits === null) {
      return toast.error("Failed to fetch free credits");
    }
    setUserCredits(credits);

    // get openAiKey
    const { data: openAiKey, error: errorKEy } = await getOpenAiKey(userId);

    // open modal to let user enter his own OpenAi key if free credits are unsufficent and no key is set yet
    if (credits - duration < 0 && (!openAiKey || errorKEy)) {
      setShowOpenAiKeyModal(true);
      // open modal with pricing info if free credits are unsufficent but a key is set
    } else if (credits - duration < 0 && openAiKey) {
      setShowOpenAiPricingModal(true);
      // open modal with info about free credits if they are suffienct
    } else if (credits - duration > 0) {
      setShowFreeCreditsModal(true);
    } else {
      toast.error(
        "You do not have enough free credits and an API-key for OpenAI could not be found",
      );
    }
    return;
  }

  return (
    <>
      <div className="flex w-full flex-col border-[1px] border-dotted border-accent p-5 shadow-sm">
        {/* Form */}
        <form className="flex flex-col" onSubmit={handleUploadButton}>
          <label htmlFor="projectname" className="mt-4 flex flex-col">
            <div className="mb-1 text-sm">Choose a projectname</div>
            <input
              required
              type="string"
              placeholder="projectname"
              name="projectname"
              id="projectname"
              autoComplete="off"
              minLength={1}
              maxLength={25}
              value={projectameValue}
              onChange={(e) => {
                const projectname = e.target.value;
                setProjectnameValue(projectname);
              }}
              className={`peer bg-gray-50 p-1 focus:border-action focus:outline-none focus:ring ${
                projectNameWarning &&
                "border-solid [&:not(:placeholder-shown):not(:focus)]:border-2 [&:not(:placeholder-shown):not(:focus)]:border-warning"
              } `}
            ></input>
            {projectNameWarning && (
              <span
                className={`mt-2 hidden text-sm text-warning peer-[&:not(:placeholder-shown):not(:focus)]:block`}
              >
                Your projectname can be 1 to 25 characters, please avoid special
                characters.
              </span>
            )}
          </label>

          <label htmlFor="description" className="mt-4 flex flex-col">
            <span className="mb-1 text-sm">What is your recording about?</span>
            <textarea
              className={`peer bg-gray-50 p-1 focus:border-action focus:outline-none focus:ring ${
                descriptionWarning &&
                "border-solid [&:not(:placeholder-shown):not(:focus)]:border-2 [&:not(:placeholder-shown):not(:focus)]:border-warning"
              } `}
              name="description"
              placeholder="description (300 chararcters max, no special characters)"
              maxLength={300}
              id="description"
              onChange={(e) => {
                setDescriptionValue(e.target.value);
              }}
              value={descriptionValue}
              rows={5}
            />
            {descriptionWarning && (
              <span
                className={`mt-2 hidden text-sm text-warning peer-[&:not(:placeholder-shown):not(:focus)]:block`}
              >
                Your description may be up to 300 characters long, please avoid
                special characters.
              </span>
            )}
          </label>
          <div className="flex flex-col gap-1">
            <FileUploader
              file={file}
              setFile={setFile}
              duration={duration}
              setDuration={setDuration}
            />
          </div>

          <label htmlFor="checkbox" className="mt-4">
            <input
              type="checkbox"
              name="checkbox"
              id="checkbox"
              required
              className="peer bg-gray-50"
            />
            <span className="flex-1 break-after-column">
              {" "}
              I am aware that Hans is a non-commercial demo project and{" "}
              <Link href="/legal" className="underline decoration-action">
                should not be used with sensitive data
              </Link>
              .
            </span>

            <span className="mt-2 flex text-sm text-warning peer-checked:invisible">
              You need to agree before you can continue.
            </span>
          </label>

          <UploadButton pending={pending} duration={duration} file={file} />
        </form>

        {/* modals  */}
        {showOpenAiKeyModal && duration && (
          <HtmlModal
            showModal={showOpenAiKeyModal}
            setShowModal={setShowOpenAiKeyModal}
          >
            <SetOpenAiKeyModal
              setShowModal={setShowOpenAiKeyModal}
              duration={duration}
              setConfirmedModal={setConfirmedModal}
            />
          </HtmlModal>
        )}
        {showOpenAiPricingModal && duration && (
          <HtmlModal
            showModal={showOpenAiPricingModal}
            setShowModal={setShowOpenAiPricingModal}
          >
            <OpenAiPricingModal
              setShowModal={setShowOpenAiPricingModal}
              duration={duration}
              setConfirmedModal={setConfirmedModal}
            />
          </HtmlModal>
        )}
        {showFreeCreditsModal && duration && userCredits && (
          <HtmlModal
            showModal={showFreeCreditsModal}
            setShowModal={setShowFreeCreditsModal}
          >
            <FreeCreditsModal
              setShowModal={setShowFreeCreditsModal}
              duration={duration}
              credits={userCredits}
              setConfirmedModal={setConfirmedModal}
            />
          </HtmlModal>
        )}
      </div>
    </>
  );
}

export default UploadForm;
