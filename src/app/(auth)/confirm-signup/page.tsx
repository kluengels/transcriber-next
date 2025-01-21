// lets user confirm their account if invited via email

import ConfirmSignupForm from "./_components/ConfirmSignupForm";
import NarrowForm from "@/components/ui/NarrowForm";

export default function ConfirmSignup() {
  return (
    <>
      <NarrowForm title="Confirm signup 👇">
        <ConfirmSignupForm />{" "}
      </NarrowForm>
    </>
  );
}
