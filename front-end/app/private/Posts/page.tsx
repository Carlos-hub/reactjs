"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
};

export default function Page() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const authResponse = await fetch("/api/auth/me");
        if (!authResponse.ok) {
          router.push("/login");
          return;
        }

        // You may need to adjust endpoint
        const response = await fetch("/api/posts", {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error("Falha ao buscar as postagens.");
        }

        const data = await response.json();
        setPosts(data.data || []);
        setFilteredPosts(data.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro inesperado.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [router]);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredPosts(posts);
    } else {
      const lower = search.trim().toLowerCase();
      setFilteredPosts(
        posts.filter(
          (post) =>
            post.title?.toLowerCase().includes(lower) ||
            post.content?.toLowerCase().includes(lower) ||
            post.author?.toLowerCase().includes(lower)
        )
      );
    }
  }, [search, posts]);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Lista de Postagens</h1>
          <input
            type="text"
            placeholder="Buscar postagens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 shadow-sm outline-none focus:border-zinc-600 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
		  <div className="flex justify-end mt-4">
            <a
              href="/private/Posts/create"
              className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-white font-medium shadow transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              + Nova Postagem
            </a>
          </div>
        </header>

        {loading ? (
          <div>
          <div className="text-center text-zinc-500 dark:text-zinc-400">
            Carregando postagens...
          </div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center text-zinc-500 dark:text-zinc-400">
            Nenhuma postagem encontrada.
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {filteredPosts.map((post, index) => (
				<a href={`/private/Posts/create?id=${post?.id ?? post._id}`} key={post?.id ?? post._id}>
              <li
                
                className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold">{post.title}</h2>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Por {post.author}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                    {post.content}
                  </p>
                </div>
              </li>
			  </a>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}