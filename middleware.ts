import { useUser } from "@clerk/nextjs";
import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoutes = createRouteMatcher([
  "/sign-in",
  "/sign-up",
  "/api/uploadthing",
  "/api/chatbot",
]);

const isInstructorRoutes = createRouteMatcher([
  "/teacher",
  "/teacher/:path*",
  "/teacher/assessment/create",
  "/teacher/assessment/:assessmentId/edit",
  "/teacher/assessment/:assessmentId/questions/new",
  "/teacher/assessment/:assessmentId/questions",
  "/teacher/assessment/:assessmentId/settings",
  "/teacher/assessment/:assessmentId/candidates",
  "/teacher/assessment/:assessmentId/results",
  "/teacher/assessment/:assessmentId/export-results",
]);

export default clerkMiddleware(async (auth, req) => {
  const data = auth();
  // Fetch the user details from Clerk backend using the userId
  let user;
  if (data.userId) {
    try {
      user = await clerkClient.users.getUser(data.userId); 
      await clerkClient.users.updateUser(data.userId, {
        publicMetadata: {
          role: user.publicMetadata.role
        }
      });
      
      // Check if user is trying to access instructor-only routes
      if (user.publicMetadata.role !== "instructor" && isInstructorRoutes(req)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("Error fetching user: ", error);
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  // If it's an UploadThing request or a public route, allow it
  if (isPublicRoutes(req)) {
    return NextResponse.next();
  }

  // If user is not logged in and trying to access a protected route
  if (!data.userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};