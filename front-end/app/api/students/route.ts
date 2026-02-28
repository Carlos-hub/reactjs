import { NextResponse } from "next/server";

import { requestBackend } from "@/lib/server/backendClient";

type CreateStudentBody = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as CreateStudentBody;
  const payloadBody = {
    name: body.name?.trim(),
    email: body.email?.trim(),
    password: body.password,
  };

  if (!payloadBody.name || !payloadBody.email || !payloadBody.password) {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Nome, email e senha são obrigatórios." },
      },
      { status: 400 }
    );
  }

  const { status, payload } = await requestBackend("/students/", {
    method: "POST",
    body: payloadBody,
  });

  return NextResponse.json(payload, { status });
}
