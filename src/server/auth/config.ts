import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { env } from "@/env";
import { createTRPCContext } from "../api/trpc";
import { createCaller } from "../api/root";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      imageUrl: string;
      token: string;
      role: string;
      isVerifiedByAdmin?: boolean;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface Account {
    backendUser?: unknown;
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  secret: env.AUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    signOut: "/",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const context = await createTRPCContext({ headers: new Headers() });
        const caller = createCaller(context);
        if (
          Boolean(
            profile?.email_verified && profile?.email?.endsWith("@gmail.com"),
          )
        ) {
          const response = await caller.auth.socialLogin({
            name: profile?.name ?? "",
            email: profile?.email ?? "",
            providerImageUrl: (profile?.picture as string) ?? "",
            authType: "GOOGLE",
          });

          if (response.status && response.user) {
            return true;
          }
          if (response.status && response.user) {
            account.backendUser = response.user;
            return true;
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      if (user) {
        token.id = user.id ?? "";
        token.name = user.name;
        token.email = user.email;
        token.image = user.imageUrl;
        token.token = user.token;
        token.role = user.role;
        token.imageUrl = user.imageUrl;
        token.isVerifiedByAdmin = user.isVerifiedByAdmin;
      }

      if (account?.provider === "google" && profile) {
        const context = await createTRPCContext({ headers: new Headers() });
        const caller = createCaller(context);
        const response = await caller.auth.socialLogin({
          name: profile?.name ?? "",
          email: profile?.email ?? "",
          providerImageUrl: (profile?.picture as string) ?? "",
          authType: "GOOGLE",
        });

        if (response.status && response.user) {
          token.id = response.user.id;
          token.name = response.user.name;
          token.email = response.user.email;
          token.image = response.user.imageUrl;
          token.imageUrl = response.user.imageUrl;
          token.token = response.token;
          token.role = response.user.role;
          token.isVerifiedByAdmin = response.user.isVerifiedByAdmin;
        }
      }

      if (
        trigger === "update" &&
        typeof session === "object" &&
        session !== null
      ) {
        const typedSession = session as {
          user?: { role?: "ADMIN" | "WORKER" | "EMPLOYEE" | "UNDEFINED" };
        };
        if (typedSession.user?.role) {
          token.role = typedSession.user.role;
        }
      }

      // if (trigger === "update" && session?.user?.role) {
      //   token.role = session.user.role;
      // }

      return token;
    },
    async session({ session, token }) {
      const userSession = {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          image: token.image,
          imageUrl: token.imageUrl,
          token: token.token,
          role: token.role,
          isVerifiedByAdmin: token.isVerifiedByAdmin,
        },
      };

      return userSession;
    },
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "name@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials) {
            return null;
          }

          const email = credentials?.email ?? "";
          const password = credentials?.password ?? "";

          if (typeof email !== "string" || typeof password !== "string") {
            throw new Error("Invalid credentials");
          }

          const context = await createTRPCContext({ headers: new Headers() });
          const caller = createCaller(context);

          // ✅ Call the tRPC procedure directly instead of an API request
          const response = await caller.auth.login({ email, password });

          if (response.status) {
            if (!response.user) {
              return null;
            }

            const user: User = {
              ...response.user,
              id: response.user.id.toString(),
              name: response.user.name,
              email: response.user.email,
              imageUrl: response.user.imageUrl,
              providerImageUrl: response.user.imageUrl,
              role: response.user.role,
              token: response.token,
              isVerifiedByAdmin: response.user.isVerifiedByAdmin,
            };
            return user;
          }
          return null;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
