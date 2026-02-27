"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getAuthorId } from "@/lib/posts";
import { getSessionRequest } from "@/lib/requests/auth";
import { getPostByIdRequest, updatePostRequest } from "@/lib/requests/posts";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const postId = params.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      setBooting(true);
      setError(null);

      try {
        const [session, post] = await Promise.all([
          getSessionRequest(),
          getPostByIdRequest(postId),
        ]);

        if (session.role !== "professor") {
          throw new Error("Apenas professores podem editar postagens.");
        }

        if (getAuthorId(post.authorId) !== session.id) {
          throw new Error("Você só pode editar posts criados por você.");
        }

        setTitle(post.title);
        setContent(post.content);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro inesperado.";
        setError(message);
      } finally {
        setBooting(false);
      }
    };

    if (postId) {
      bootstrap();
    }
  }, [postId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updatePostRequest(postId, { title, content });
      setSuccess("Postagem atualizada com sucesso.");
      setTimeout(() => {
        router.push(`/private/Posts/${postId}`);
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (booting) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="mx-auto max-w-xl text-center text-zinc-500 dark:text-zinc-400">
          Carregando edição...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <h1 className="mb-4 text-2xl font-bold">Editar Postagem</h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Titulo</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-medium">Conteudo</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={6}
              className="rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading || Boolean(error)}
            className="mt-4 rounded-md bg-zinc-900 py-2 font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {loading ? "Salvando..." : "Salvar Alteracoes"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-100 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/50 dark:text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-100 px-3 py-2 text-sm text-green-800 dark:border-green-700 dark:bg-green-900/50 dark:text-green-100">
            {success}
          </div>
        )}

        <button
          onClick={() => router.push(`/private/Posts/${postId}`)}
          className="mt-8 text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          Voltar para o post
        </button>
      </div>
    </main>
  );
}
