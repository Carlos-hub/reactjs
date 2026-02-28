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
