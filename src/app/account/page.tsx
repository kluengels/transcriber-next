import Link from "next/link";
import { createSupaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { User } from "@supabase/supabase-js";
import { getCredits, getOpenAiKey } from "@/lib/supabase/actions";

//  UI
import { LoadingComponent } from "@/components/ui/LoadingComponent";
import { BiEdit, BiTrash } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import NarrowForm from "@/components/ui/NarrowForm";

// Modals
import HtmlModalFromServer from "@/components/ui/modals/ModalFromServer";
import { ChangeEmail } from "./_components/ChangeEmail";
import ConfirmEmailChange from "./_components/ConfirmEmailChange";
import { ChangeUserName } from "./_components/ChangeUserName";
import { ChangePassword } from "./_components/ChangePassword";
import { ChangeApiKey } from "./_components/ChangeApiKey";
import { DeleteAccount } from "./_components/DeleteAccount";
import { DeleteApiKey } from "./_components/DeleteApiKey";

interface AccountProps {
  searchParams: Promise<{
    modal?: string;
    newEmail?: string;
  }>;
}

/**
 * Account page with settings for user
 */

export default async function Account({ searchParams }: AccountProps) {
  // get url params for opening modals
  const { modal, newEmail } = await searchParams;

  // get user from supabase auth
  const supabase = await createSupaseServerClient();
  const { error, data: user } = await supabase.auth.getUser();
  if (error || !user) redirect("/error");

  // get API key from supabase
  const { data: apiKeyData } = await getOpenAiKey(user.user.id);
  let apiKey = "";
  if (apiKeyData) {
    apiKey = apiKeyData;
  }

  // get number of free credits
  const { data: credits } = await getCredits(user.user.id);

  return (
    <>
      <Suspense fallback={<LoadingComponent text="settings" />}>
        <NarrowForm title="Settings 🤝">
          <h2 className="mb-2">Your HANS-Account</h2>

          {/* Email */}
          <EmailSettings modal={modal} newEmail={newEmail} user={user.user} />
          {/* Username */}
          <UserNameSettings
            modal={modal}
            user_metadata={user.user.user_metadata}
          />
          {/* Password */}
          <PassswordSettings modal={modal} user={user.user} />

          {/* OpenAiKey */}
          <h2 className="mb-2 mt-4">Credits</h2>

          <div className="mb-2">
            As soon as you consumed your free credits you need an{" "}
            <Link href={"/support"} className="underline decoration-action">
              API-key from OpenAI
            </Link>{" "}
            to fuel Hans&apos; transcription capabilites.
          </div>
          <div className="flex flex-row items-center gap-1">
            <span className="font-bold">Free credits:</span>
            <span>{credits}</span>
          </div>
          <ApiKeySettings modal={modal} apiKey={apiKey} />
          {/* Delete account button */}
          <DeleteAccountButton modal={modal} user={user.user} />
        </NarrowForm>
      </Suspense>
    </>
  );
}

interface EmailSettingsProps {
  modal?: string;
  newEmail?: string;
  user: User;
}

function EmailSettings({ modal, newEmail, user }: EmailSettingsProps) {
  return (
    <div className="flex flex-row items-center gap-1">
      <span className="font-bold">E-Mail:</span>
      <span className="">{user.email}</span>
      <Link
        className="rounded-md p-1 hover:bg-actionlight"
        href={`/account?modal=email`}
      >
        <BiEdit />
      </Link>

      {modal === "email" && (
        <HtmlModalFromServer>
          {newEmail && user.email ? (
            <ConfirmEmailChange oldEmail={user.email} newEmail={newEmail} />
          ) : (
            <ChangeEmail oldEmail={user.email} />
          )}
        </HtmlModalFromServer>
      )}
    </div>
  );
}

interface UserMetadata {
  username?: string;
}

interface UserNameSettingsProps {
  modal?: string;
  user_metadata: UserMetadata;
}

function UserNameSettings({ modal, user_metadata }: UserNameSettingsProps) {
  return (
    <div className="flex flex-row items-center gap-1">
      <span className="font-bold">Username:</span>
      <span className="">{user_metadata.username ?? "not set"}</span>
      <Link
        className="rounded-md p-1 hover:bg-actionlight"
        href={`/account?modal=username`}
      >
        <BiEdit />
      </Link>
      {modal === "username" && (
        <HtmlModalFromServer>
          <ChangeUserName oldUsername={user_metadata.username} />
        </HtmlModalFromServer>
      )}
    </div>
  );
}

interface PasswordSettingsProps {
  modal?: string;
  user: User;
}

function PassswordSettings({ modal, user }: PasswordSettingsProps) {
  return (
    <div className="flex flex-row items-center gap-1">
      <span className="font-bold">Password:</span>
      <span className="">&#183;&#183;&#183;&#183;&#183;&#183;&#183;</span>
      <Link
        className="rounded-md p-1 hover:bg-actionlight"
        href={`/account?modal=password`}
      >
        <BiEdit />
      </Link>
      {modal === "password" && user.email && (
        <HtmlModalFromServer>
          <ChangePassword email={user.email} />
        </HtmlModalFromServer>
      )}
    </div>
  );
}

interface ApiKeySettingsProps {
  modal?: string;
  apiKey: string;
}

function ApiKeySettings({ modal, apiKey }: ApiKeySettingsProps) {
  return (
    <div className="flex flex-row items-center gap-1">
      <span className="font-bold">API-Key:</span>
      <span className="">
        {apiKey ? (
          apiKey.slice(0, 5) + "·······················" + apiKey.slice(-5)
        ) : (
          <span className="italic"> no key set yet</span>
        )}
      </span>
      <Link
        className="rounded-md p-1 hover:bg-actionlight"
        href={`/account?modal=apikey`}
      >
        <BiEdit />
      </Link>
      {apiKey.length > 0 && (
        <Link
          className="rounded-md p-1 hover:bg-actionlight"
          href={`/account?modal=deleteapikey`}
        >
          {" "}
          <BiTrash />
        </Link>
      )}
      {modal === "apikey" && (
        <HtmlModalFromServer>
          <ChangeApiKey oldApiKey={apiKey} />
        </HtmlModalFromServer>
      )}
      {modal === "deleteapikey" && (
        <HtmlModalFromServer>
          <DeleteApiKey />
        </HtmlModalFromServer>
      )}
    </div>
  );
}

interface DeleteAccountButtonProps {
  modal?: string;
  user: User;
}

function DeleteAccountButton({ modal, user }: DeleteAccountButtonProps) {
  return (
    <div className="mt-6 flex justify-end">
      <Button variant={"destructive"}>
        <Link
          className="flex flex-row items-center gap-1"
          href={`/account?modal=delete`}
        >
          Delete account
          <BiTrash />
        </Link>
      </Button>

      {modal === "delete" && user.email && (
        <HtmlModalFromServer>
          <DeleteAccount userEmail={user.email} />
        </HtmlModalFromServer>
      )}
    </div>
  );
}
