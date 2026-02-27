import type { Post, PostAuthor } from "@/types/post";

type RawPost = Partial<Post> & {
  author?: string;
};

const DESCRIPTION_LIMIT = 140;

export const getPostId = (post: RawPost): string => {
  return String(post.id ?? post._id ?? "");
};

export const getAuthorId = (author: PostAuthor | undefined): string => {
  if (!author) {
    return "";
  }
  if (typeof author === "string") {
    return author;
  }
  return String(author._id ?? author.id ?? "");
};

export const getAuthorLabel = (post: RawPost): string => {
  if (post.author?.trim()) {
    return post.author.trim();
  }
  const author = post.authorId;
  if (!author) {
    return "Autor desconhecido";
  }
  if (typeof author === "string") {
    return `Autor ${author.slice(-6)}`;
  }
  return author.name?.trim() || author.email?.trim() || "Autor desconhecido";
};

export const toExcerpt = (content: string): string => {
  const normalized = content.trim();
  if (normalized.length <= DESCRIPTION_LIMIT) {
    return normalized;
  }
  return `${normalized.slice(0, DESCRIPTION_LIMIT).trim()}...`;
};
