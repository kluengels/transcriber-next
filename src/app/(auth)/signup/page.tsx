// Sign-up form with 2 Steps: 1) Registering 2) Enter OTP


import SignUpForm from "./_components/SignUpForm";
import NarrowForm from "@/components/ui/NarrowForm";

export default function Signup() {
  return (
    <>
      <NarrowForm title="Create an account 🙌">
        <SignUpForm />
      </NarrowForm>
    </>
  );
}
