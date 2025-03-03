import { type DefaultSession, type DefaultUser } from "next-auth";
import { type DefaultJWT } from "next-auth/jwt"


declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            token: string;
            imageUrl: string;
            role: string;
        } & DefaultSession['user'];
    }

    interface User extends DefaultUser {
        id: string;
        token: string;
        imageUrl: string;
        role: string;
    }
}


declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string;
        token: string;
        imageUrl: string;
        role: string;
    }
}