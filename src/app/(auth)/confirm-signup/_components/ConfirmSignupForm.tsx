"use client";

import { OneTimeCode } from "@/components/forms/OneTimeCode";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ConfirmSignupForm() {
  // get users email address from url params
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  // success state for OTP
  const [otpConfirmed, setOtpConfirmed] = useState<boolean>(false);

  // redirect user to set new password modal as soon as OTP has been entered
  useEffect(() => {
    if (!otpConfirmed) return;

    redirect("/account?modal=password");
  }, [otpConfirmed]);

  // redirect user to home page if this route is accessed by accident
  if (!email) redirect("/");

  // let user enter OTP from invitation email
  return (
    <>
      <p>
        Congratulations! You have been invited to HANS. To confirm your signup
        please enter the code you received in you invitation email. Afterwards
        you will be asked to set a password.
      </p>
      <OneTimeCode
        email={email}
        setOtpConfirmed={setOtpConfirmed}
        type={"invite"}
      />
    </>
  );
}
