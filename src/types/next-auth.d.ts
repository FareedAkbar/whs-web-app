import { type DefaultSession, type DefaultUser } from "next-auth";
import { type DefaultJWT } from "next-auth/jwt"


declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            token: string;
            image: string;
            imageUrl: string;
            role: "ADMIN" | "WORKER" | "EMPLOYEE" | "UNDEFINED";
            isVerifiedByAdmin?: boolean;
        } & DefaultSession['user'];
    }

    interface User extends DefaultUser {
        id: string;
        token: string;
        image: string;
        imageUrl: string;
        role: "ADMIN" | "WORKER" | "EMPLOYEE" | "UNDEFINED";
        isVerifiedByAdmin?: boolean;
    }
}


declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string;
        token: string;
        image: string;
        imageUrl: string;
        role: "ADMIN" | "WORKER" | "EMPLOYEE" | "UNDEFINED";
        isVerifiedByAdmin?: boolean;
    }
}