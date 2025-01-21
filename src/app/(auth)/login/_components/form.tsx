"use client";

import {
  CurrentPasswordField,
  EmailField,
} from "@/components/forms/FormElements";
import signInUser from "@/lib/supabase/actions";
import { UserSchema, createZodErrorMessage } from "@/lib/types";
import toast from "react-hot-toast";
import SubmitButton from "@/components/forms/SubmitButton";

/**
 * Login-form, will display error toast if not successfull
 */
export default function LoginForm() {
  return (
    <form
      className="flex flex-col"
      action={async (formData) => {
        // constuct new user Object
        const existingUser = {
          email: formData.get("email"),
          password: formData.get("password"),
        };

        // client-side input validation
        const result = UserSchema.safeParse(existingUser);
        if (!result.success) {
          // create and display errorMessage
          const errorMessage = createZodErrorMessage(result.error);
          toast.error(errorMessage);
          return;
        }

        // form calls server action, pass in validated data
        const { error } = await signInUser(result.data);
        if (error) toast.error(error);
      }}
    >
      <EmailField />
      <CurrentPasswordField />

      {/* Button has pending logic included, must be server component */}
      <SubmitButton />
    </form>
  );
}
