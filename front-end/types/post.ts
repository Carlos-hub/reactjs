export type PostAuthor =
  | string
  | {
      _id?: string;
      id?: string;
      name?: string;
      email?: string;
      discipline?: string;
    };

export type Post = {
  id?: string;
  _id?: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  discipline?: string;
  likes?: number;
  deslikes?: number;
  authorId: PostAuthor;
};
