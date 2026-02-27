import type { Post } from "@/types/post";
import { getAuthorLabel, toExcerpt } from "@/lib/posts";

type RawPost = {
  _id?: string;
  id?: string;
  title?: string;
  content?: string;
  author?: string;
  authorId?: Post["authorId"];
  createdAt?: string;
  updatedAt?: string;
  discipline?: string;
  likes?: number;
  deslikes?: number;
};

export const toPostSummary = (post: RawPost): Post => {
  const title = post.title?.trim() || "Post sem título";
  const sourceText = post.content || "Sem descrição.";

  return {
    id: post.id,
    _id: post._id,
    title,
    content: toExcerpt(sourceText),
    authorId: post.authorId ?? post.author ?? getAuthorLabel(post),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    discipline: post.discipline,
    likes: post.likes,
    deslikes: post.deslikes,
  };
};
