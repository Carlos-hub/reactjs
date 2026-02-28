## Blog FIAP - Guia rapido

Projeto full stack com:
- **Back-end** em Node.js + Express + MongoDB
- **Front-end** em Next.js
- **Autenticacao** com JWT (aluno e professor)

### Como rodar

Na raiz do projeto:

```bash
docker compose up --build
```

Servicos e portas:
- Front-end: `http://localhost:3005`
- API Back-end: `http://localhost:3001`
- MongoDB: `localhost:27017`

> O `docker-compose` ja instala dependencias e sobe tudo em modo desenvolvimento.

### Como o sistema funciona

1. O usuario faz login no front como **aluno** ou **professor**.
2. O front autentica na API e guarda o token em cookie.
3. Com token valido:
   - **Aluno**: pode listar, buscar e ler posts.
   - **Professor**: pode listar, buscar, ler, criar, editar e excluir **somente os proprios posts**.
4. A API valida permissao pelo JWT e garante regras de autoria no back-end.

### Fluxos principais

- `GET /posts` e `GET /posts/search?q=...`: lista/busca de posts autenticada
- `GET /posts/:id`: leitura de um post
- `POST /posts`: criacao (professor)
- `PUT /posts/:id`: edicao (somente professor autor)
- `DELETE /posts/:id`: exclusao (somente professor autor)

### Arquitetura da aplicacao

#### Back-end (Node.js + Express)
- **Routes**: definem endpoints e middlewares de autorizacao.
- **Services**: aplicam regras de negocio.
- **Repositories**: acesso ao MongoDB via Mongoose.
- **Auth JWT**: valida token e injeta usuario autenticado (`req.user`).
- **Regra de autoria**: edicao/exclusao permitidas apenas ao professor dono do post.

Estrutura principal:
- `back-end/Blog-FIAP/src/Domain/*` (Posts, Auth, Student, Professor)
- `back-end/Blog-FIAP/src/infra/*` (Mongo, Auth, HTTP)

#### Front-end (Next.js)
- **Pages (UI)**: telas de login, listagem, detalhe, criacao e edicao.
- **Requests**: camada de chamadas HTTP para API interna (`lib/requests`).
- **API Routes (BFF)**: rotas em `app/api/*` que fazem proxy para o back-end e aplicam regras de sessao no front.
- **Sessao**: token JWT guardado em cookie `httpOnly`.

Estrutura principal:
- `front-end/app/private/Posts/*`
- `front-end/app/public/Login/*`
- `front-end/app/api/*`
- `front-end/lib/requests/*`

### Guia de uso

1. Acesse `http://localhost:3005`.
2. Faça login como:
   - **Aluno**: pode listar, buscar e ler posts.
   - **Professor**: pode listar, buscar, ler, criar, editar e excluir posts proprios.
3. Na tela de posts:
   - Use o campo de busca para filtrar por titulo/conteudo.
   - Clique em **Ler post** para abrir detalhes.
4. Se for professor:
   - Clique em **+ Nova Postagem** para criar.
   - Clique em **Editar** para alterar seu post.
   - Clique em **Excluir** para remover seu post.
5. Se tentar editar/excluir post de outro professor, a API retorna `403 Forbidden`.
