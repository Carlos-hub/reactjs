"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getAuthorId, getAuthorLabel, getPostId, toExcerpt } from "@/lib/posts";
import { getSessionRequest, logoutRequest } from "@/lib/requests/auth";
import {
  deletePostRequest,
  listPostsRequest,
  searchPostsRequest,
} from "@/lib/requests/posts";
import type { SessionUser } from "@/types/auth";
import type { Post } from "@/types/post";

const SEARCH_DEBOUNCE_MS = 350;

export default function Page() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessionAndPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentSession = await getSessionRequest();
        setSession(currentSession);
        const list = await listPostsRequest();
        setPosts(list);
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

    loadSessionAndPosts();
  }, [router]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const timeout = setTimeout(async () => {
      const term = search.trim();
      try {
        if (!term) {
          const list = await listPostsRequest();
          setPosts(list);
          return;
        }
        const result = await searchPostsRequest(term);
        setPosts(result);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao buscar postagens.";
        setError(message);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [search, session]);

  const isProfessor = session?.role === "professor";

  const postsView = useMemo(() => {
    return posts.map((post) => {
      const postId = getPostId(post);
      const authorId = getAuthorId(post.authorId);
      const canEdit = isProfessor && session?.id === authorId;
      return {
        ...post,
        postId,
        authorLabel: getAuthorLabel(post),
        excerpt: toExcerpt(post.content ?? ""),
        canEdit,
      };
    });
  }, [isProfessor, posts, session?.id]);

  const handleLogout = async () => {
    await logoutRequest();
    router.push("/login");
  };

  const handleDeletePost = async (postId: string, title: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a postagem "${title}"?`
    );
    if (!confirmed) {
      return;
    }

    setDeletingPostId(postId);
    setError(null);
    try {
      await deletePostRequest(postId);
      setPosts((previousPosts) =>
        previousPosts.filter((post) => getPostId(post) !== postId)
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir postagem.";
      setError(message);
    } finally {
      setDeletingPostId(null);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Lista de Postagens</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {isProfessor
                ? "Você pode criar e editar apenas suas próprias postagens."
                : "Como aluno, você pode apenas visualizar as postagens."}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 md:items-end">
            <input
              type="text"
              placeholder="Buscar postagens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <div className="flex items-center gap-2">
              {isProfessor && (
                <>
                  <Link
                    href="/private/Posts/create"
                    className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    + Nova Postagem
                  </Link>
                  <Link
                    href="/private/Professors/create"
                    className="inline-flex items-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    + Novo Professor
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                type="button"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="text-center text-zinc-500 dark:text-zinc-400">
            Carregando postagens...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </div>
        ) : postsView.length === 0 ? (
          <div className="text-center text-zinc-500 dark:text-zinc-400">
            Nenhuma postagem encontrada.
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {postsView.map((post) => (
              <li
                key={post.postId}
                className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold">{post.title}</h2>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Por {post.authorLabel}
                    </span>
                    {post.discipline && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {post.discipline}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                    {post.excerpt}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Link
                    href={`/private/Posts/${post.postId}`}
                    className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-200"
                  >
                    Ler post
                  </Link>
                  {isProfessor &&
                    (post.canEdit ? (
                      <>
                        <Link
                          href={`/private/Posts/${post.postId}/edit`}
                          className="rounded-md border border-zinc-300 px-2.5 py-1 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.postId, post.title)}
                          disabled={deletingPostId === post.postId}
                          className="rounded-md border border-red-300 px-2.5 py-1 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
                        >
                          {deletingPostId === post.postId
                            ? "Excluindo..."
                            : "Excluir"}
                        </button>
                      </>
                    ) : (
                      <span className="rounded-md border border-zinc-200 px-2.5 py-1 text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
                        Edicao apenas do autor
                      </span>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}