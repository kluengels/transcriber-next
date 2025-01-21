/* allows users to edit Transcript in Rich Text editor
 */

"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ProjectSchema } from "@/lib/types";
import HtmlModal from "@/components/ui/modals/HtmlModal";
import parse from "html-react-parser";
import { updateProject } from "@/lib/supabase/actions";
import { DeleteProjectModal } from "../../_components/DeleteProjectModal";
import { revalidate } from "@/components/revalidate";

// Text editor imports
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import History from "@tiptap/extension-history";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

//Icons
import {
  BiUndo,
  BiHighlight,
  BiRedo,
  BiItalic,
  BiBold,
  BiPrinter,
} from "react-icons/bi";
import { LiaUndoAltSolid } from "react-icons/lia";
import { AiOutlineDelete } from "react-icons/ai";
import { LoadingComponent } from "@/components/ui/LoadingComponent";
import { BsExclamationTriangle } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { BiFontColor } from "react-icons/bi";
import { cn } from "@/lib/utils";

// define extension array for TipTap
const extensions = [
  History,
  Document,
  Paragraph,
  Text,
  Highlight,
  TextStyle,
  Color,
  Bold,
  Italic,
];

type TipTapProps = {
  oldText: string;
  projectId: string;
  userId: string;
  uneditedText: string;
  projectname: string;
};

// tiptap component
const Tiptap = ({
  oldText,
  projectId,
  userId,
  uneditedText,
  projectname,
}: TipTapProps) => {
  // Modal to confirm back-to-unedited-version
  const [showDiscardChangesModal, setShowDiscardChangesModal] = useState(false);

  // Modal to confirm deletion of project
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);

  // Alerts
  const [warning, setWarning] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // keep trackl of changes
  const [lastText, setLastText] = useState(oldText);

  // initialize editor
  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    content: oldText,
    editorProps: {
      attributes: {
        class: "focus:outline-none focus:ring focus:border-blue-500 p-1",
      },
    },
    onFocus: () => {
      // reset all alerts
      setWarning("");
      setSuccess("");
    },
    onDestroy() {
      // reset all alerts
      setWarning("");
      setSuccess("");
      // refetch data
      revalidate(`/projects/${projectId}`);
    },
    onBlur: async ({ editor }) => {
      // reset alerts
      setWarning("");
      setSuccess("");

      // get current text
      const newText = editor.getHTML();

      // fire only if changes were made
      if (newText === lastText) return;

      // input sanitization
      const result = ProjectSchema.shape.edited.safeParse(newText);

      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        return setWarning(errorMessage);
      }
      const sanitized = result.data;

      // keep track of changes
      setLastText(result.data);

      const error = await updateProject({
        edited: sanitized,
        userId: userId,
        projectId: projectId,
      });
      if (error) {
        setWarning("Failed to save. Please make a local copy");
        return;
      }
      // set success alert
      setSuccess("Changes saved");
      setTimeout(() => setSuccess(""), 2000);
    },
  });

  // make sure editor starts with latest version from database
  useEffect(() => {
    if (!editor || !oldText) return;
    editor.commands.setContent(oldText);
  }, [editor, oldText]);

  // return latest text while TipTap is loading
  if (!editor) {
    return (
      <div>
        {/* Menu bar placeholder*/}

        <div className="p-4">
          {" "}
          <LoadingComponent text="editor" />
        </div>

        <div> {parse(lastText)}</div>
      </div>
    );
  }

  return (
    <>
      <MenuBar
        {...{
          projectId,
          projectname,
          editor,
          setShowDiscardChangesModal,
          showDiscardChangesModal,
          setShowDeleteProjectModal,
          showDeleteProjectModal,
          uneditedText,
        }}
        className="sticky top-48 z-10 mt-4 border-b-2 border-gray-200 bg-white"
      />

      {/* The editor itself */}
      <EditorContent
        editor={editor}
        className={`mb-6 w-full bg-white p-1 font-mono print:ml-0 print:border-none print:text-sm`}
      />
      {/* status messages */}

      {warning && (
        <div className="fixed bottom-0 left-0 z-30 flex w-screen items-center justify-center bg-warning text-sm text-white">
          {warning}
        </div>
      )}
      {success && (
        <div className="fixed bottom-0 left-0 z-30 flex w-screen items-center justify-center bg-green-500 text-sm text-white">
          {success}
        </div>
      )}
    </>
  );
};

interface MenuBarProps {
  editor: Editor;
  setShowDiscardChangesModal: Dispatch<SetStateAction<boolean>>;
  setShowDeleteProjectModal: Dispatch<SetStateAction<boolean>>;
  showDiscardChangesModal: boolean;
  showDeleteProjectModal: boolean;
  projectId: string;
  projectname: string;
  uneditedText: string;
  className?: string;
}

/**
 * Renders a menu bar for TipTap editor
 */
function MenuBar({
  editor,
  setShowDiscardChangesModal,
  setShowDeleteProjectModal,
  showDiscardChangesModal,
  showDeleteProjectModal,
  projectId,
  projectname,
  uneditedText,
  className,
}: MenuBarProps) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto bg-card p-2 print:hidden",
        className,
      )}
    >
      {/* Button bold  */}
      <Toggle
        aria-label="Bold"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <BiBold className="h-4 w-4" />
      </Toggle>

      {/* Button italic  */}
      <Toggle
        aria-label="Italic"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <BiItalic className="h-4 w-4" />
      </Toggle>
      {/* Button highlight  */}
      <Toggle
        aria-label="Highlight"
        pressed={editor.isActive("highlight")}
        onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
      >
        <BiHighlight className="h-4 w-4" />
      </Toggle>

      {/*  Text Color Button  */}
      <Select
        defaultValue="black"
        onValueChange={(value) => editor.chain().focus().setColor(value).run()}
      >
        <SelectTrigger className="w-fit border-none bg-inherit">
          <BiFontColor className="mx-1 h-4 w-4" />
        </SelectTrigger>
        <SelectContent className="">
          <div className="grid grid-cols-3 items-center justify-center gap-1">
            <SelectItem value="blue">
              <div className="h-4 w-4 bg-blue-600"></div>
            </SelectItem>
            <SelectItem value="red">
              <div className="h-4 w-4 bg-red-600"></div>
            </SelectItem>
            <SelectItem value="fuchsia">
              <div className="h-4 w-4 bg-fuchsia-600"></div>
            </SelectItem>

            <SelectItem value="gold">
              <div className="h-4 w-4 bg-yellow-600"></div>
            </SelectItem>
            <SelectItem value="cyan">
              <div className="h-4 w-4 bg-cyan-400"></div>
            </SelectItem>
            <SelectItem value="black">
              <div className="h-4 w-4 bg-black"></div>
            </SelectItem>
          </div>
        </SelectContent>
      </Select>
      <div className="m-2 border border-r-gray-400"></div>

      {/* Undo Button  */}
      <Button
        variant="ghost"
        size={"icon"}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
        className="flex-shrink-0"
      >
        <BiUndo className="h-4 w-4" />
      </Button>

      {/* Redo Button  */}
      <Button
        variant="ghost"
        size={"icon"}
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
        disabled={!editor.can().redo()}
        className="flex-shrink-0"
      >
        <BiRedo className="h-4 w-4" />
      </Button>

      {/* Reset Button  */}
      <Button
        variant={"ghost"}
        size="icon"
        title="!!! Discard all edits"
        className="flex-shrink-0 hover:bg-warning hover:text-white"
        onClick={() => {
          setShowDiscardChangesModal(true);
          // editor.commands.setContent(uneditedText);
          // editor.chain().focus().run();
        }}
      >
        <LiaUndoAltSolid className="h-4 w-4" />
      </Button>

      {showDiscardChangesModal && (
        <HtmlModal
          showModal={showDiscardChangesModal}
          setShowModal={() => setShowDiscardChangesModal(false)}
        >
          <div className="flex items-center gap-1">
            <BsExclamationTriangle className="h-6 w-6 text-warning" />
            <h2 className="text-text">Discard all changes</h2>{" "}
          </div>
          <div className="my-2">
            Are you sure that you want to discard all edits and restore the
            original version?{" "}
            <span className="font-bold text-warning">
              That can not be undone.
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              className="w-1/2 rounded-md border border-accent p-2 hover:bg-accent hover:text-white"
              onClick={() => {
                setShowDiscardChangesModal(false);
              }}
            >
              Cancel
            </button>
            <button
              className="flex-auto rounded-md border border-warning p-2 hover:bg-warning hover:text-white"
              onClick={() => {
                editor.commands.setContent(uneditedText);
                editor.chain().focus().run();
                setShowDiscardChangesModal(false);
              }}
            >
              Continue
            </button>
          </div>
        </HtmlModal>
      )}

      <div className="m-2 border border-r-gray-400"></div>

      {/* Print view button */}
      <Button
        variant="ghost"
        size={"icon"}
        onClick={() => {
          print();
        }}
        title="Print"
        className="flex-shrink-0"
      >
        <BiPrinter className="h-4 w-4" />
      </Button>

      {/* Delete-project-button will open modal to confirm */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setShowDeleteProjectModal(true);
        }}
        className="flex-shrink-0 hover:bg-destructive hover:text-white"
        title="!!! Delete Project"
      >
        <AiOutlineDelete className="h-4 w-4" />
      </Button>
      {showDeleteProjectModal && (
        <HtmlModal
          showModal={showDeleteProjectModal}
          setShowModal={() => setShowDeleteProjectModal(false)}
        >
          <DeleteProjectModal
            setShowDeleteModal={setShowDeleteProjectModal}
            projectId={projectId}
            projectName={projectname}
          />
        </HtmlModal>
      )}
    </div>
  );
}

export default Tiptap;
