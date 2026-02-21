"use client";

import { useEffect, useMemo, useState } from "react";
import type { Post } from "@/types/post";

const SEARCH_DEBOUNCE_MS = 350;

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasQuery = query.trim().length > 0;

  const fetchPosts = async (search: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const url = search
        ? `/api/posts/search?q=${encodeURIComponent(search)}`
        : "/api/posts";
      const response = await fetch(url, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        const message =
          payload?.error?.message || "Falha ao buscar as postagens.";
        throw new Error(message);
      }
      setPosts(payload.data ?? []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado.";
      setErrorMessage(message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPosts(query.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  const emptyStateMessage = useMemo(() => {
    if (loading) {
      return "Carregando postagens...";
    }
    if (errorMessage) {
      return errorMessage;
    }
    if (hasQuery) {
      return "Nenhuma postagem encontrada para essa busca.";
    }
    return "Nenhuma postagem disponível no momento.";
  }, [errorMessage, hasQuery, loading]);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold">Blog FIAP</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Explore as postagens recentes e encontre conteúdos por assunto.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <label htmlFor="search" className="text-sm font-medium">
            Buscar posts
          </label>
          <input
            id="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Digite um termo para buscar..."
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              {emptyStateMessage}
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id ?? post._id ?? `${post.title}-${post.author}`}
                className="flex h-full flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold leading-snug">
                    {post.title}
                  </h2>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {post.author}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  {post.description}
                </p>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
