import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const isOnLanding = req.nextUrl.pathname === "/";
    const isOnApp = req.nextUrl.pathname.startsWith("/app");

    if (token && isOnLanding) {
      return NextResponse.redirect(new URL("/app", req.url));
    }

    if (!token && isOnApp) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/", "/app/:path*"],
};
