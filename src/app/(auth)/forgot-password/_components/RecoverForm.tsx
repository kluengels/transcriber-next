"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { resetPassword } from "@/lib/supabase/actions";
import { OneTimeCode } from "@/components/forms/OneTimeCode";
import NewPasswordForm from "./NewPasswordForm";
import toast from "react-hot-toast";
import { EmailField } from "@/components/forms/FormElements";
import SubmitButton from "@/components/forms/SubmitButton";

import { UserSchema } from "@/lib/types";

/**
 * Form lets user set up a new password. Three steps: 1) Form for email address 2) OTP form 3) New password form
 */
export default function RecoverForm() {
  // router
  const router = useRouter();

  // keep track of process with url params
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const otpsuccess = searchParams.has("otpsuccess");

  // sucess state for OTP, will trigger step 3
  const [otpConfirmed, setOtpConfirmed] = useState(false);
  useEffect(() => {
    if (!otpConfirmed || !email) return;
    // trigger step 3
    router.push(`?email=${email}&otpsuccess`);
  }, [otpConfirmed, email, router]);

  // Step 3: Enter new password
  if (otpsuccess && email) {
    return <NewPasswordForm email={email} />;
  }

  // Step 2: Enter OTP
  if (email) {
    return (
      <>
        <p>
          Hans will send you an email with an one-time-code to confirm your
          request. This may take a few minutes. Please check your spam-folder as
          well.
        </p>
        <OneTimeCode
          email={email}
          setOtpConfirmed={setOtpConfirmed}
          type="recovery"
        />
      </>
    );
  }

  // Step 1: Enter email address to get a password reset email
  return (
    <form
      className="flex flex-col"
      action={async (formData) => {
        // get email adress from form
        const email = formData.get("email");

        //client-side input validation with zod
        const result = UserSchema.shape.email.safeParse(email);
        if (!result.success) {
          // create and display errorMessage
          const errorMessage = result.error.issues[0].message;
          return toast.error(errorMessage);
        }

        // form calls server action, pass in ZOD-validated email address
        const { data, error } = await resetPassword(result.data);
        if (error) return toast.error(error);
        if (data && result.data) {
          // trigger step 2
          router.push(`?email=${result.data}`);
        }
      }}
    >
      <EmailField />

      {/* Button has pending logic included, must be server component */}
      <SubmitButton buttonText="Reset password" />
    </form>
  );
}
