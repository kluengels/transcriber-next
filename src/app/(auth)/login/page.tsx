// Login page
import Link from "next/link";
import LoginForm from "./_components/form";

import { Button } from "@/components/ui/button";
import NarrowForm from "@/components/ui/NarrowForm";

export default function Login() {
  return (
    <>
      <NarrowForm title="Please login 👇">
        <LoginForm />
      </NarrowForm>

      <div className="flex flex-col">
        <Button asChild variant="link" className="text-md">
          <Link href="/signup">No account yet? Sign up here!</Link>
        </Button>

        <Button asChild variant="link" className="text-md">
          <Link href="/forgot-password">Forgot your password?</Link>
        </Button>
      </div>
    </>
  );
}
