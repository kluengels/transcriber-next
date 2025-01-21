import PageTitleAnimated from "@/components/ui/PageTitleAnimated";
import UploadForm from "./_components/UploadForm";
import { createSupaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";


export default async function Upload() {
  const supabase = await createSupaseServerClient();

  // check if user is logged in
  const { data: user, error: errorUser } = await supabase.auth.getUser();
  if (errorUser || !user) {
    redirect("/");
  }
  const userId = user.user?.id;

  return (
    <>
      <div className="mx-auto max-w-[50rem]">
        <PageTitleAnimated>Create new project ✌️</PageTitleAnimated>
        
            <UploadForm userId={userId}/>
        
      </div>
    </>
  );
}
