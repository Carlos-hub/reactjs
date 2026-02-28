"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getSessionRequest, registerProfessorRequest } from "@/lib/requests/auth";

export default function CreateProfessorPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const validateAccess = async () => {
      try {
        const session = await getSessionRequest();
        if (session.role !== "professor") {
          setAccessDenied(true);
          setError("Apenas professor pode cadastrar outro professor.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Acesso não autorizado.";
        if (message.toLowerCase().includes("unauthorized")) {
          router.push("/login");
          return;
        }
        setAccessDenied(true);
        setError(message);
      } finally {
        setCheckingAccess(false);
      }
    };

    validateAccess();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      await registerProfessorRequest({ name, email, password, discipline });
      setSuccess("Professor cadastrado com sucesso.");
      setName("");
      setEmail("");
      setDiscipline("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao cadastrar professor.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="mx-auto max-w-xl text-center text-zinc-500 dark:text-zinc-400">
          Validando acesso...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Cadastro de professor</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Apenas professores autenticados podem criar novos professores.
          </p>
        </header>

        {!accessDenied && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Nome
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              E-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Disciplina
              <input
                type="text"
                value={discipline}
                onChange={(event) => setDiscipline(event.target.value)}
                required
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Senha
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Confirmar senha
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? "Cadastrando..." : "Cadastrar professor"}
            </button>
          </form>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-200">
            {success}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link
            href="/private/Posts"
            className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-300"
          >
            Voltar para posts
          </Link>
          <button
            type="button"
            onClick={() => router.push("/private/Posts")}
            className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            Ir para listagem
          </button>
        </div>
      </div>
    </main>
  );
}
