import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requestBackend } from "@/lib/server/backendClient";
import type { UserRole } from "@/types/auth";

type LoginBody = {
  email?: string;
  password?: string;
  role?: UserRole;
};

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as LoginBody;
  const email = body.email?.trim();
  const password = body.password;
  const role = body.role;

  if (!email || !password || (role !== "student" && role !== "professor")) {
    return NextResponse.json(
      { success: false, error: { message: "Email, senha e perfil são obrigatórios." } },
      { status: 400 }
    );
  }

  const endpoint = role === "student" ? "/auth/student/login" : "/auth/login";
  const { status, payload } = await requestBackend<{ token: string }>(endpoint, {
    method: "POST",
    body: { email, password },
  });

  if (!payload.success || !payload.data?.token) {
    return NextResponse.json(payload, { status });
  }

  const cookieStore = await cookies();
  cookieStore.set("token", payload.data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  return NextResponse.json({ success: true }, { status: 200 });
}