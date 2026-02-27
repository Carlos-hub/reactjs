import { NextResponse } from "next/server";
import { requestBackend } from "@/lib/server/backendClient";
import { getSessionUserFromCookie, getTokenFromCookie } from "@/lib/server/session";
import { getAuthorId } from "@/lib/posts";
import type { Post } from "@/types/post";

type RouteParams = { params: Promise<{ id: string }> };

const ensureId = (id: string) => {
  return Boolean(id && id.trim());
};

const ensurePostOwner = async (id: string, token: string, userId: string) => {
  const { status, payload } = await requestBackend<Post>(`/posts/${id}`, { token });
  if (!payload.success || !payload.data) {
    return NextResponse.json(payload, { status });
  }

  const authorId = getAuthorId(payload.data.authorId);
  if (authorId !== userId) {
    return NextResponse.json(
      { success: false, error: { message: "Forbidden" } },
      { status: 403 }
    );
  }

  return null;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!ensureId(id)) {
    return NextResponse.json(
      { success: false, error: { message: "ID is required" } },
      { status: 400 }
    );
  }

  const token = await getTokenFromCookie();
  if (!token) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const { status, payload } = await requestBackend(`/posts/${id}`, { token });
  return NextResponse.json(payload, { status });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!ensureId(id)) {
    return NextResponse.json(
      { success: false, error: { message: "ID is required" } },
      { status: 400 }
    );
  }

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

  const ownerError = await ensurePostOwner(id, token, user.id);
  if (ownerError) {
    return ownerError;
  }

  const body = (await request.json()) as { title?: string; content?: string };
  const payloadBody = {
    title: body.title?.trim(),
    content: body.content?.trim(),
  };
  const { status, payload } = await requestBackend(`/posts/${id}`, {
    method: "PUT",
    token,
    body: payloadBody,
  });
  return NextResponse.json(payload, { status });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!ensureId(id)) {
    return NextResponse.json(
      { success: false, error: { message: "ID is required" } },
      { status: 400 }
    );
  }

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

  const ownerError = await ensurePostOwner(id, token, user.id);
  if (ownerError) {
    return ownerError;
  }

  const { status, payload } = await requestBackend(`/posts/${id}`, {
    method: "DELETE",
    token,
  });
  return NextResponse.json(payload, { status });
}