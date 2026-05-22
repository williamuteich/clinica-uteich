import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            tipo: "ADMINISTRATOR";
            permissions: string[];
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        tipo: "ADMINISTRATOR";
        permissions: string[];
    }
}