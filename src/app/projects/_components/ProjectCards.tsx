"use server";
import Link from "next/link";

import getTime from "@/utils/getTime";

import { DeleteButton } from "./DeleteButton";
import { ToastWrapper } from "@/components/ui/ToastWrapper";
import { TbClockEdit } from "react-icons/tb";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tables } from "@/lib/supabaseTypes";

/**
 * renders  projects in grid with cards
 * each card will show:
 * - project title with link to individual projet
 * - date created
 * - date of last edit
 * - delete button
 */
export async function ProjectCards({
  projectsData,
}: {
  projectsData: Tables<"transcripts">[];
}) {
  if (!projectsData) {
    return <ToastWrapper type="error" message="Failed to fetch projects" />;
  }

  return (
    <>
      {projectsData.map((item, key) => (
        <div key={key} className="relative">
          <Link href={`/projects/${item.id}`}>
            <Card className="h-60 hover:cursor-pointer hover:shadow-lg">
              <CardHeader>
                <CardTitle className="pt-5">{item.projectname}</CardTitle>
                <CardDescription>
                  {" "}
                  <div className="flex items-center gap-1">
                    <TbClockEdit />
                    <span className="truncate text-sm">
                      last edit: {getTime(item.last_edited || item.date_added)}{" "}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3"> {item.description}</p>
              </CardContent>
            </Card>
          </Link>
          <DeleteButton
            projectId={item.id}
            projectName={item.projectname}
            className="absolute right-0 top-0"
          />
        </div>
      ))}
    </>
  );
}
