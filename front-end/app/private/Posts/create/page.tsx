"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Tipo base de Post (ajuste de acordo com seu backend se necessário)
type Post = {
  _id?: string;
  title: string;
  content: string;
  author: string;
  createdAt?: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
  error?: { message: string };
};

export default function CreateOrEditPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get("id");

  // Formulário controlado
  const [form, setForm] = useState<Post>({
    title: "",
    content: "",
    author: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Se estiver editando, buscar os dados do post
  useEffect(() => {
    const fetchPost = async () => {
      if (!editingId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/posts/${editingId}`);
        if (!res.ok) throw new Error("Não foi possível carregar a postagem.");
        const apiData: ApiResponse = await res.json();
        if (!apiData.success || !apiData.data) {
          throw new Error(apiData.error?.message || "Não foi possível carregar a postagem.");
        }
        setForm({
          title: apiData.data.title,
          content: apiData.data.content,
          author: apiData.data.author,
          _id: apiData.data._id,
          createdAt: apiData.data.createdAt,
        });
      } catch (err: any) {
        setError(err.message || "Erro ao buscar dados da postagem.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [editingId]);

  // Função para lidar com mudanças nos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submissão do formulário (criar ou editar)
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
        // Atualizar postagem existente
        const res = await fetch(`/api/posts/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: form.title, content: form.content }),
        });
        const data: ApiResponse = await res.json();
        if (!data.success) throw new Error(data.error?.message || "Falha ao atualizar postagem.");
        setSuccessMsg("Postagem atualizada com sucesso!");
      } else {
        // Criar nova postagem
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: form.title, content: form.content }),
        });
        const data: ApiResponse = await res.json();
        if (!data.success) throw new Error(data.error?.message || "Falha ao criar postagem.");
        setSuccessMsg("Postagem criada com sucesso!");
        // Limpar formulário após criação
        setForm({ title: "", content: "", author: "" });
      }

      // Opcional: Redirecionar para lista de posts após sucesso
      setTimeout(() => {
        router.push("/private/Posts");
      }, 1200);

    } catch (err: any) {
      setError(err.message || "Erro ao enviar dados.");
    } finally {
      setLoading(false);
    }
  };
  console.log("CreateOrEditPostPage", editingId);
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
            />
          </label>
          <button
            type="submit"
            disabled={loading}
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