"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getAuthorId } from "@/lib/posts";
import { getSessionRequest } from "@/lib/requests/auth";
import {
  createPostRequest,
  getPostByIdRequest,
  updatePostRequest,
} from "@/lib/requests/posts";
import type { SessionUser } from "@/types/auth";
import type { Post } from "@/types/post";

export default function CreateOrEditPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get("id");

  const [session, setSession] = useState<SessionUser | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      setBooting(true);
      setError(null);
      try {
        const currentSession = await getSessionRequest();
        if (currentSession.role !== "professor") {
          throw new Error("Apenas professores podem criar ou editar postagens.");
        }

        setSession(currentSession);
        if (!editingId) {
          return;
        }

        const currentPost = await getPostByIdRequest(editingId);
        const authorId = getAuthorId(currentPost.authorId);
        if (authorId !== currentSession.id) {
          throw new Error("Você só pode editar postagens criadas por você.");
        }

        setPost(currentPost);
        setForm({
          title: currentPost.title,
          content: currentPost.content,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao buscar dados da postagem.";
        setError(message);
      } finally {
        setBooting(false);
      }
    };

    bootstrap();
  }, [editingId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    // Validação simples
    if (!form.title.trim() || !form.content.trim()) {
      setError("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      if (editingId) {
        await updatePostRequest(editingId, {
          title: form.title,
          content: form.content,
        });
        setSuccessMsg("Postagem atualizada com sucesso!");
      } else {
        await createPostRequest({
          title: form.title,
          content: form.content,
        });
        setSuccessMsg("Postagem criada com sucesso!");
        setForm({ title: "", content: "" });
      }

      setTimeout(() => {
        router.push("/private/Posts");
      }, 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao enviar dados.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isOwner = useMemo(() => {
    if (!session || !post) {
      return !editingId;
    }
    return getAuthorId(post.authorId) === session.id;
  }, [editingId, post, session]);

  if (booting) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="mx-auto max-w-xl text-center text-zinc-500 dark:text-zinc-400">
          Carregando formulário...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-700">
        <h1 className="text-2xl font-bold mb-4">
          {editingId ? "Editar Postagem" : "Criar Nova Postagem"}
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Título</span>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="rounded-md border px-3 py-2 outline-none border-zinc-300 focus:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-50 dark:border-zinc-600"
              placeholder="Digite o título"
              required
              disabled={Boolean(editingId && !isOwner)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Conteúdo</span>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={5}
              className="rounded-md border px-3 py-2 outline-none border-zinc-300 focus:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-50 dark:border-zinc-600"
              placeholder="Digite o conteúdo da postagem"
              required
              disabled={Boolean(editingId && !isOwner)}
            />
          </label>
          <button
            type="submit"
            disabled={loading || Boolean(editingId && !isOwner)}
            className="mt-4 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold py-2 transition hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-60"
          >
            {loading ? (editingId ? "Salvando..." : "Enviando...") : (editingId ? "Salvar Alterações" : "Criar Postagem")}
          </button>
        </form>
        {error && (
          <div className="mt-4 rounded-md bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200 px-3 py-2 text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        {editingId && !isOwner && (
          <div className="mt-4 rounded-md bg-yellow-100 text-yellow-800 px-3 py-2 text-sm border border-yellow-200">
            Apenas o professor autor pode editar esta postagem.
          </div>
        )}
        {successMsg && (
          <div className="mt-4 rounded-md bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100 px-3 py-2 text-sm border border-green-200 dark:border-green-700">
            {successMsg}
          </div>
        )}
        <button
          onClick={() => router.push("/private/Posts")}
          className="mt-8 text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          Voltar para lista de postagens
        </button>
      </div>
    </main>
  );
}