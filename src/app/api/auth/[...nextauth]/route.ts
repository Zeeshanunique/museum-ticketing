import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  return new Response(JSON.stringify(session), { 
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

export async function POST() {
  return await getServerSession(authOptions);
}
