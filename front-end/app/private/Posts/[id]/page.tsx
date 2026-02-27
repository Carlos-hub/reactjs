"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getAuthorId, getAuthorLabel, getPostId } from "@/lib/posts";
import { getSessionRequest } from "@/lib/requests/auth";
import { getPostByIdRequest } from "@/lib/requests/posts";
import type { SessionUser } from "@/types/auth";
import type { Post } from "@/types/post";

export default function PostDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [session, setSession] = useState<SessionUser | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [currentSession, currentPost] = await Promise.all([
          getSessionRequest(),
          getPostByIdRequest(id),
        ]);
        setSession(currentSession);
        setPost(currentPost);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro inesperado.";
        setError(message);
        if (message.toLowerCase().includes("unauthorized")) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, router]);

  const canEdit = useMemo(() => {
    if (!session || !post || session.role !== "professor") {
      return false;
    }
    return session.id === getAuthorId(post.authorId);
  }, [post, session]);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="mx-auto max-w-3xl text-center text-zinc-500 dark:text-zinc-400">
          Carregando postagem...
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-200">
          <p>{error || "Post não encontrado."}</p>
          <Link href="/private/Posts" className="font-medium underline">
            Voltar para listagem
          </Link>
        </div>
      </main>
    );
  }

  const postId = getPostId(post);
  const authorLabel = getAuthorLabel(post);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{authorLabel}</span>
            {post.discipline && <span>{post.discipline}</span>}
            {post.createdAt && (
              <span>{new Date(post.createdAt).toLocaleDateString("pt-BR")}</span>
            )}
          </div>
        </header>

        <p className="whitespace-pre-line text-zinc-700 dark:text-zinc-200">
          {post.content}
        </p>

        <footer className="flex items-center gap-4">
          <Link href="/private/Posts" className="text-sm font-medium hover:underline">
            Voltar
          </Link>
          {canEdit && (
            <Link
              href={`/private/Posts/${postId}/edit`}
              className="text-sm font-medium hover:underline"
            >
              Editar postagem
            </Link>
          )}
        </footer>
      </article>
    </main>
  );
}
