import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublic = createRouteMatcher(["/sign-in(.*)", "/unauthorized"]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublic(request)) return;

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    const signIn = new URL("/sign-in", request.url);
    return NextResponse.redirect(signIn);
  }

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "superadmin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
