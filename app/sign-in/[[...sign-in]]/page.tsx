import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <Suspense fallback={null}>
        <SignIn />
      </Suspense>
    </div>
  );
}
