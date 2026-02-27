import type { Post } from "@/types/post";

import { requestAppApi } from "@/lib/requests/http";

export const listPostsRequest = async (): Promise<Post[]> => {
  const response = await requestAppApi<Post[]>("/api/posts");
  return response.data ?? [];
};

export const searchPostsRequest = async (term: string): Promise<Post[]> => {
  const query = encodeURIComponent(term.trim());
  const response = await requestAppApi<Post[]>(`/api/posts/search?q=${query}`);
  return response.data ?? [];
};

export const getPostByIdRequest = async (id: string): Promise<Post> => {
  const response = await requestAppApi<Post>(`/api/posts/${id}`);
  if (!response.data) {
    throw new Error("Post não encontrado.");
  }
  return response.data;
};

export const createPostRequest = async (payload: {
  title: string;
  content: string;
}): Promise<Post> => {
  const response = await requestAppApi<Post>("/api/posts", {
    method: "POST",
    body: payload,
  });
  if (!response.data) {
    throw new Error("Não foi possível criar o post.");
  }
  return response.data;
};

export const updatePostRequest = async (
  id: string,
  payload: { title: string; content: string }
): Promise<Post> => {
  const response = await requestAppApi<Post>(`/api/posts/${id}`, {
    method: "PUT",
    body: payload,
  });
  if (!response.data) {
    throw new Error("Não foi possível atualizar o post.");
  }
  return response.data;
};

export const deletePostRequest = async (id: string): Promise<void> => {
  await requestAppApi<{ deleted?: boolean }>(`/api/posts/${id}`, {
    method: "DELETE",
  });
};
