import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password !== process.env.PAGE_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();   

  cookieStore.set("auth", "true", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 30, 
  });

  return NextResponse.json({ ok: true });
}
