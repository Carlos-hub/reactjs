import type { SessionUser, UserRole } from "@/types/auth";

import { requestAppApi } from "@/lib/requests/http";

export const loginRequest = async (payload: {
  email: string;
  password: string;
  role: UserRole;
}) => {
  await requestAppApi<undefined>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
};

export const getSessionRequest = async (): Promise<SessionUser> => {
  const response = await requestAppApi<SessionUser>("/api/auth/me");
  if (!response.data) {
    throw new Error("Sessão inválida.");
  }
  return response.data;
};

export const logoutRequest = async () => {
  await requestAppApi<undefined>("/api/auth/logout", {
    method: "POST",
  });
};
