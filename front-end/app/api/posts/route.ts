import { NextResponse } from "next/server";
import { requestBackend } from "@/lib/server/backendClient";
import { getSessionUserFromCookie, getTokenFromCookie } from "@/lib/server/session";

export async function GET(): Promise<NextResponse> {
  const token = await getTokenFromCookie();
  if (!token) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const { status, payload } = await requestBackend<unknown[]>("/posts", {
    token,
  });
  return NextResponse.json(payload, { status });
}

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

  const body = (await request.json()) as { title?: string; content?: string };
  const payloadBody = {
    title: body.title?.trim(),
    content: body.content?.trim(),
  };

  if (!payloadBody.title || !payloadBody.content) {
    return NextResponse.json(
      { success: false, error: { message: "Título e conteúdo são obrigatórios." } },
      { status: 400 }
    );
  }

  const { status, payload } = await requestBackend<unknown>("/posts", {
    method: "POST",
    token,
    body: payloadBody,
  });
  return NextResponse.json(payload, { status });
}
