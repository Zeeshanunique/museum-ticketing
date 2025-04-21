import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth, 
            credentials.email, 
            credentials.password
          );
          
          const user = userCredential.user;
          
          // Check if user has admin role
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();
          const role = userData?.role || "user";
          
          return {
            id: user.uid,
            name: user.displayName || userData?.name || null,
            email: user.email,
            role: role
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

export async function GET(_req: Request) {
  const session = await getServerSession(authOptions);
  return new Response(JSON.stringify(session), { 
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

export async function POST(_req: Request) {
  return await getServerSession(authOptions);
}
