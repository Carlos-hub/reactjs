import { cookies } from "next/headers";

import type { SessionUser } from "@/types/auth";

type JwtPayload = {
  sub?: string;
  role?: SessionUser["role"];
};

const parseJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(normalized, "base64").toString("utf-8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

export const getTokenFromCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value ?? null;
};

export const getSessionUserFromCookie = async (): Promise<SessionUser | null> => {
  const token = await getTokenFromCookie();
  if (!token) {
    return null;
  }

  const payload = parseJwtPayload(token);
  if (!payload?.sub || (payload.role !== "student" && payload.role !== "professor")) {
    return null;
  }

  return {
    id: String(payload.sub),
    role: payload.role,
  };
};
