import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UploadButton({
  pending,
  duration,
  file,
}: {
  pending: boolean;
  duration: number | undefined;
  file: File | undefined
}) {
  return (
    <Button
      className={cn("my-4", {
        "border-slate-400 bg-slate-400": pending || !duration && file,
      })}
      disabled={pending || !duration && file ? true : false}
    >
      {pending ? "Uploading" : !duration && file ? "Calculating size" : "Upload"}
    </Button>
  );
}
