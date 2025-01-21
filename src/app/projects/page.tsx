/* Page shows cards of existing projects and a button to create a new project */

import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

import { getProjects } from "@/lib/supabase/actions";
import { createSupaseServerClient } from "@/lib/supabase/server";

import PageTitleAnimated from "@/components/ui/PageTitleAnimated";
import { ProjectCards } from "./_components/ProjectCards";
import { LoadingComponent } from "@/components/ui/LoadingComponent";
import { SiReaddotcv } from "react-icons/si";
import { ToastWrapper } from "@/components/ui/ToastWrapper";

export default async function Projects() {
  const supabase = await createSupaseServerClient();

  // get userId
  const { data: user, error: errorUser } = await supabase.auth.getUser();

  const userId = user.user?.id;
  if (errorUser || !userId) {
    redirect("/");
  }

  // get list of projects
  const { data: projectsData, error: errorProjects } =
    await getProjects(userId);

  // show alert if fetch project fails
  if (errorProjects) {
    return <ToastWrapper type="error" message={errorProjects} />;
  }
  if (!projectsData) {
    return <ToastWrapper type="error" message="Failed to fetch projects" />;
  }

  return (
    <div className="mb-12">
      <PageTitleAnimated>Your Projects 🤝</PageTitleAnimated>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        <div className="max-h-22 flex items-start justify-center p-4 text-white">
          {/* Start new project */}
          <Link
            href="/upload"
            className="w-full rounded-xl bg-action p-4 hover:underline hover:shadow-xl"
          >
            <div className="flex items-center gap-1">
              <SiReaddotcv className="h-14 w-14" />
              <h3>Start a new project</h3>
            </div>
          </Link>
        </div>

        {/* Project cards */}
        <Suspense fallback={<LoadingComponent text="projects" />}>
          <ProjectCards projectsData={projectsData} />
        </Suspense>
      </div>
    </div>
  );
}
