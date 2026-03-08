import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "repo",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        const githubLogin = (profile as any)?.login || (user as any)?.login;
        (user as any).username = githubLogin;

        if (!githubLogin || !account.access_token) {
          (user as any).isNewUser = false;
          return true;
        }

        try {
          const repoCheck = await fetch(`https://api.github.com/repos/${githubLogin}/devvault-notes`, {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
            },
          });

          if (repoCheck.status === 404) {
            (user as any).isNewUser = true;
          } else {
            (user as any).isNewUser = false;
          }
        } catch {
          (user as any).isNewUser = false;
        }
      }

      return true;
    },
    async jwt({ token, account, user, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }

      if (user) {
        token.isNewUser = (user as any).isNewUser || false;
        token.username = (user as any).username || token.username;
      }

      if (!token.username && profile) {
        token.username = (profile as any)?.login;
      }

      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).user = {
        ...session.user,
        isNewUser: token.isNewUser || false,
        username: token.username,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
