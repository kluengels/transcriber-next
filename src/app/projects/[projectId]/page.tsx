/* Page will fetch project data based on project id passed in via parameters. 
Renders details of the project, with audioplayer and texteditor,
calls different server and client components to do so.  */

import { getProject } from "@/lib/supabase/actions";
import { createSupaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import getTime from "@/utils/getTime";

// components
import Tiptap from "./_components/Tiptap";
import TipTapSmall from "./_components/TiptapSmall";
import { LoadingComponent } from "@/components/ui/LoadingComponent";

//icons
import { TbClockEdit } from "react-icons/tb";


// Types
import { TranscriptSchema } from "@/lib/types";
import Audio from "./_components/Audio";

interface ProjectProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function Project({ params }: ProjectProps) {
  // get projectId from url params
  const { projectId } = await params;

  // connect to supabase
  const supabase = await createSupaseServerClient();

  // get userId
  const { data: user, error: errorUser } = await supabase.auth.getUser();
  const userId = user.user?.id;

  // if no user is detected, redirect to login page
  if (errorUser || !userId) {
    redirect("/login");
  }

  // get project details
  const { data: projectData, error: projectError } =
    await getProject(projectId);
  if (projectError || !projectData) {
    redirect("/error");
  }

  // destructure project data
  const projectname = projectData.projectname;
  const filename = projectData.filename;
  let unedited = projectData.text;
  const description = projectData.description || "";
  const edited = projectData.edited;
  let rawTranscript: TranscriptSchema["segments"] | null = null;

  if (projectData.transcript && typeof projectData.transcript === "string") {
    const jsonData = JSON.parse(projectData.transcript) as TranscriptSchema;
    unedited = jsonData.text;
    rawTranscript = jsonData.segments;
  }

  // get audio stream URl
  const audioStreamUrl = `/api/stream-audio?userId=${userId}&projectId=${projectId}&filename=${filename}`;

  return (
    <>
      {/* Title is editable */}

      <h1 className="font-extrabold">
        <TipTapSmall
          oldText={projectname}
          projectId={projectId}
          userId={user.user.id}
          type={"title"}
        />
      </h1>

      {/* Project details with editable description */}
      <section className="print:hidden">
        <div className="flex flex-col md:flex-row md:gap-1">
          {projectData.last_edited && (
            <div className="flex items-center gap-1 text-text/70">
              <TbClockEdit />
              <span className="truncate text-sm">
                last edit: {getTime(projectData.last_edited)}{" "}
              </span>
            </div>
          )}
        </div>
        <div className="mb-4 mt-2 flex flex-wrap gap-1">
          <div className="font-bold">Description: </div>

          <TipTapSmall
            oldText={description}
            projectId={projectId}
            userId={user.user.id}
            type={"description"}
          />
        </div>
      </section>

      {/* Sticky audio player and OpenAI-Transcript of segment based on playback position */}

      <div className="">
        {userId && projectId && filename && rawTranscript && (
          <>
            <Suspense fallback={<LoadingComponent text="audio" />}>
              <div className="sticky top-0 z-10 h-48 border border-secondary bg-background print:hidden">
                <Audio
                  rawTranscript={rawTranscript}
                  audioUrl={audioStreamUrl}
                />
              </div>
            </Suspense>
          </>
        )}
        {/* Editable transcript */}
        <div className="">
          <Tiptap
            oldText={edited || unedited || ""}
            projectId={projectId}
            userId={user.user.id}
            uneditedText={unedited || ""}
            projectname={projectname}
          />
        </div>
      </div>
    </>
  );
}
