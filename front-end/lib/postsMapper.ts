import type { Post } from "@/types/post";

type RawPost = {
  _id?: string;
  id?: string;
  title?: string;
  author?: string;
  description?: string;
  content?: string;
};

const DESCRIPTION_LIMIT = 140;

const truncateText = (value: string, limit: number) => {
  if (value.length <= limit) {
    return value;
  }
  return `${value.slice(0, limit).trim()}...`;
};

export const toPostSummary = (post: RawPost): Post => {
  const title = post.title?.trim() || "Post sem título";
  const author = post.author?.trim() || "Autor desconhecido";
  const sourceText = post.description || post.content || "Sem descrição.";

  return {
    id: post.id,
    _id: post._id,
    title,
    author,
    description: truncateText(sourceText.trim(), DESCRIPTION_LIMIT),
  };
};
