import { cn } from "@/lib/utils";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";

export default function SubmitButton({
  pendingText = "Please wait",
  buttonText = "Submit",
}: {
  pendingText?: string;
  buttonText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      className={cn("my-4 rounded-md border-action  ", {
        "border-slate-400 bg-slate-400": pending}
      )}
     
      disabled={pending ? true : false}
    >
      {pending ? pendingText : buttonText}
    </Button>
  );
}
