import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isNewUser?: boolean;
      username?: string;
    };
  }

  interface User {
    isNewUser?: boolean;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    isNewUser?: boolean;
    username?: string;
  }
}
