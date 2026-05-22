import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/src/lib/prisma";

export const auth: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        }),
    ],

    pages: {
        signIn: "/",
    },

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                if (!user.email) return false;

                const admin = await prisma.administrator.findUnique({
                    where: { email: user.email },
                });

                if (!admin || !admin.active) return false;

                await prisma.administrator.update({
                    where: { id: admin.id },
                    data: { lastLogin: new Date() },
                });

                return true;
            }
            return true;
        },

        async jwt({ token, account }) {
            if (account?.provider === "google" && token.email) {
                const admin = await prisma.administrator.findUnique({
                    where: { email: token.email },
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: { permission: true },
                                },
                            },
                        },
                    },
                });

                if (admin) {
                    token.id = String(admin.id);
                    token.tipo = "ADMINISTRATOR";
                    if (admin.role?.name === "Admin") {
                        token.permissions = ["all:all"];
                    } else {
                        token.permissions = admin.role
                            ? admin.role.permissions.map(
                                (p) => `${p.permission.resource}:${p.permission.action}`
                            )
                            : ["all:all"];
                    }
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.tipo = token.tipo as "ADMINISTRATOR";
                session.user.permissions = token.permissions as string[];
            }
            return session;
        },
    },

    session: {
        strategy: "jwt",
        maxAge: 35 * 60,
        updateAge: 30 * 60,
    },
};