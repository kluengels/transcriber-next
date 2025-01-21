// Button opens Modal to let user delete a single project

"use client";

import HtmlModal from "@/components/ui/modals/HtmlModal";
import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { DeleteProjectModal } from "./DeleteProjectModal";
import { cn } from "@/lib/utils";

export function DeleteButton({
  projectId,
  projectName,
  className,
}: {
  projectId: string;
  projectName: string;
  className?: string;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  return (
    <>
      <button
        project-attribute={projectId}
        onClick={() => {
          setShowDeleteModal(true);
        }}
        className={cn(
          "m-2 h-8 w-8 rounded-md p-2 hover:bg-actionlight",
          className,
        )}
      >
        <AiOutlineDelete />
      </button>
      {showDeleteModal && (
        <HtmlModal
          showModal={showDeleteModal}
          setShowModal={setShowDeleteModal}
        >
          <DeleteProjectModal
            setShowDeleteModal={setShowDeleteModal}
            projectId={projectId}
            projectName={projectName}
          />
        </HtmlModal>
      )}
    </>
  );
}
