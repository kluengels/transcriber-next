// password recovery page

import RecoverForm from "./_components/RecoverForm";
import NarrowForm from "@/components/ui/NarrowForm";

export default async function ForgotPassword() {
  return (
    <NarrowForm title="Change password ✍️">
      <RecoverForm />
    </NarrowForm>
  );
}
