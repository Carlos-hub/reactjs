import { NextResponse } from "next/server";

import { requestBackend } from "@/lib/server/backendClient";
import { getSessionUserFromCookie, getTokenFromCookie } from "@/lib/server/session";

type CreateProfessorBody = {
  name?: string;
  email?: string;
  password?: string;
  discipline?: string;
};

export async function POST(request: Request): Promise<NextResponse> {
  const user = await getSessionUserFromCookie();
  const token = await getTokenFromCookie();

  if (!token || !user) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthorized" } },
      { status: 401 }
    );
  }

  if (user.role !== "professor") {
    return NextResponse.json(
      { success: false, error: { message: "Forbidden" } },
      { status: 403 }
    );
  }

  const body = (await request.json()) as CreateProfessorBody;
  const payloadBody = {
    name: body.name?.trim(),
    email: body.email?.trim(),
    password: body.password,
    discipline: body.discipline?.trim(),
  };

  if (
    !payloadBody.name ||
    !payloadBody.email ||
    !payloadBody.password ||
    !payloadBody.discipline
  ) {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Nome, email, senha e disciplina são obrigatórios." },
      },
      { status: 400 }
    );
  }

  const { status, payload } = await requestBackend("/professors", {
    method: "POST",
    token,
    body: payloadBody,
  });

  return NextResponse.json(payload, { status });
}
