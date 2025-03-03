import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials"
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
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
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
    signOut: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.token = user.token;
        token.role = user.role;
        token.imageUrl = user.imageUrl;
      }
      return token;
    },
    async session({ session, token }) {
      const userSession = {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          imageUrl: token.imageUrl,
          token: token.token,
          role: token.role,
        }
      }
      return userSession;
    },
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
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
              role: response.user.role,
              token: response.token,
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