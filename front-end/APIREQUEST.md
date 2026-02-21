## Blog FIAP

Repositorio: https://github.com/Carlos-hub/Blog-FIAP

#### Requisitos funcionais:

- GET /posts - Lista de Posts:
Este endpoint permitirá aos alunos visualizarem uma lista de
todos os posts disponíveis na página principal.

- GET /posts/:id - Leitura de Posts:
  Ao acessar este endpoint com um ID específico de post, os
alunos poderão ler o conteúdo completo desse post.

- POST /posts - Criação de Postagens:
▪ Permite que docentes criem novas postagens. Este
endpoint aceitará dados como título, conteúdo e autor no
corpo da requisição.

- PUT /posts/:id - Edição de Postagens:
▪ Usado para editar uma postagem existente. Professores
deverão fornecer o ID do post que desejam editar e os novos
dados no corpo da requisição.

- GET /posts - Listagem de Todas as Postagens:
▪ Este endpoint permitirá que professores vejam todas as
postagens criadas, facilitando a gestão do conteúdo.

- DELETE /posts/:id - Exclusão de Postagens:
▪ Permite que docentes excluam uma postagem específica,
usando o ID do post como parâmetro.

- GET /posts/search?q=searchParam - Busca de Posts:
▪ Este endpoint permitirá a busca de posts por palavraschave. Os usuários poderão passar uma query string com o
termo de busca e o sistema retornará uma lista de posts que
contêm esse termo no título ou conteúdo.


Requisitos técnicos
● Back-end em Node.js:
▪   Implementação do servidor usando Node.js.
▪  Utilização de frameworks como Express para roteamento e
middleware.
● Persistência de Dados:
▪ Utilização de um sistema de banco de dados (por exemplo,
MongoDB, PostgreSQL).
▪ Implementação de modelos de dados adequados para as
postagens.
● Containerização com Docker:
▪ Desenvolvimento e implantação usando contêineres Docker
para garantir consistência entre ambientes de
desenvolvimento e produção.
● Automação com GitHub Actions:
▪ Configuração de workflows de CI/CD para automação de
testes e deploy.
● Documentação:
▪ Documentação técnica detalhada do projeto, incluindo setup
inicial, arquitetura da aplicação e guia de uso das APIs.
● Cobertura de Testes:
▪ O projeto deve garantir que pelo menos 20% do código seja
coberto por testes unitários. Essa medida é essencial para
assegurar a qualidade e a estabilidade do código,
especialmente em funções críticas como criação, edição e
exclusão de postagens.


## Arquitetura do Sistema

### Visão Geral
O back-end é uma API REST construída com Node.js e Express, organizada em camadas para promover baixo acoplamento, alta coesão e facilidade de testes:
- Camada de Roteamento (Routes) controla endpoints HTTP.
- Camada de Serviço (Services) concentra as regras de negócio.
- Camada de Repositório (Repositories) encapsula o acesso a dados.
- Camada de Infra (infra) provê integrações transversais (MongoDB, Auth, Respostas HTTP).
- DTOs/Interfaces/Mapper definem contratos de dados e conversões entre domínio e persistência.

O sistema persiste dados no MongoDB via Mongoose e utiliza JWT para autenticação. Todas as respostas seguem um padrão consistente com metadados de sucesso/erro.

### Camadas e Responsabilidades
- Routes (`src/Domain/*/Routes`):
  - Registram endpoints Express.
  - Validam parâmetros mínimos do request (ex.: campos obrigatórios).
  - Chamam Services e padronizam as respostas via `ApiResponse`.
  - Ex.: `PostRouter`, `StudentRoute`, `ProfessorRoute`.
- Services (`src/Domain/*/Services`):
  - Regras de negócio e orquestração.
  - Ex.: hashing de senha de professor/aluno; validação de existência; políticas de edição (apenas autor edita).
- Repositories (`src/Domain/*/Repositories`):
  - CRUD e queries específicas.
  - Baseados em `AbstractRepository`, recebem um `Model` Mongoose e um `Mapper`.
- Mappers/DTOs/Interfaces:
  - `RepositoryMapper` traduz entre entidade persistida e `DTO`.
  - DTOs (`*DTO.ts`) são contratos de dados usados em services/rotas.
  - Interfaces de entidades (`Interfaces`) descrevem o modelo de domínio.
- Infra (`src/infra`):
  - Database: conexão MongoDB (`infra/Database/MongoDB/Connect`), `Models` Mongoose.
  - Auth: helpers de JWT e middleware (`infra/Auth`).
  - HTTP: `ApiResponse` com funções `ok`, `created`, `fail`, `handleError`.

### Fluxos Principais
- Autenticação
  - Professor: `POST /auth/login` → retorna JWT com `role: 'professor'`.
  - Estudante: `POST /auth/student/login` → retorna JWT com `role: 'student'`.
- Posts
  - Leitura: `GET /posts`, `GET /posts/:id`, `GET /posts/search` exigem token de estudante.
  - Criação: `POST /posts` exige token de professor; `authorId` e `discipline` são derivados do token; bloqueia disciplina divergente.
  - Edição/Exclusão: somente o autor (professor) pode editar/excluir seus posts.
- Students/Professors
  - CRUD com validações de campos obrigatórios e erros padronizados.

### Padrões Aplicados
- SOLID
  - SRP: rotas, serviços e repositórios têm papéis bem definidos.
  - OCP: novos endpoints e modelos podem ser adicionados sem alterar os existentes graças a abstrações (`AbstractRepository`, `Mapper`).
  - DIP: services dependem de abstrações de repositório (via classes específicas com contrato comum).
- DRY
  - `AbstractRepository` centraliza operações CRUD comuns.
  - `ApiResponse` centraliza padrão de resposta/erros.

### Tratamento de Erros
- Erros de domínio usam `CustomError` (com `statusCode`).
- Erros não previstos retornam 500 via middleware global.
- Rotas retornam:
  - Sucesso: `{"success": true, "data": ...}`
  - Falha: `{"success": false, "error": {"message": "...", "details"?: ...}}`

### Autenticação e Autorização (JWT)
- `infra/Auth/Jwt.ts` assina/verifica tokens.
- `infra/Auth/Middleware.ts`:
  - `requireProfessorAuth`: valida token e injeta `req.user` com `{id, discipline, role}`.
  - `requireStudentAuth`: valida token e injeta `req.user` com `{id, role}`.
- Regras:
  - Professores criam, editam e removem apenas seus próprios posts.
  - Estudantes apenas leem posts (com token).

### Persistência de Dados (MongoDB/Mongoose)
- Schemas em `infra/Database/Models/*` (ex.: `PostModel`, `StudentsModel`, `ProfessorModel`).
- Repositórios operam com `AbstractRepository`:
  - `findAll`, `findById`, `create`, `update`, `delete`.
  - Específicos: `PostsRepository.searchByTerm`.

### Estrutura de Pastas (resumo)
```
src/
  app.ts
  server.ts
  Domain/
    Abstract/
      DTOs/RepositoryMapperInterface.ts
      Repository/AbstractRepository.ts
    Posts/
      Routes/PostRouter.ts
      Services/PostService.ts
      Repositories/...
      DTOs/...
      Interfaces/...
    Student/
      Routes/StudentRoute.ts
      Services/StudentService.ts
      Repositories/...
    Professor/
      Routes/ProfessorRoute.ts
      Services/ProfessorService.ts
      Repositories/...
    Auth/
      Routes/AuthRoute.ts
  infra/
    Auth/ (Jwt.ts, Middleware.ts)
    Http/ (ApiResponse.ts)
    Database/
      MongoDB/Connect.ts
      Models/ (Post, Students, Professor)
```

### Configuração e Variáveis de Ambiente
- `PORT` (padrão 3000)
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (ex.: `1h`)

### Containerização (Docker)
- `docker-compose.yml`:
  - `app`: Node + ts-node com `npm run dev` (nodemon), mount do volume do código.
  - `mongo`: MongoDB 7 com healthcheck.
  - Portas: `3001:3000` (app), `27017:27017` (mongodb).

### Padrão de Resposta
- Sucesso:
```
HTTP 200/201
{
  "success": true,
  "data": { ... },
  "message"?: "..."
}
```
- Erro:
```
HTTP 4xx/5xx
{
  "success": false,
  "error": {
    "message": "Descrição do erro",
    "details"?: { ... }
  }
}
```

### Testes e Qualidade
- Ferramentas:
  - Jest + ts-jest (unit e integração)
  - supertest (integração HTTP)
  - mongodb-memory-server (banco em memória)
- Cobertura:
  - Threshold global: 70% (branches/functions/lines/statements) configurado em `jest.config.ts`.
- Onde estão:
  - Unit: `tests/unit/*`
  - Integração: `tests/integration/*`
  - Repositórios: `tests/repositories/*`
  - Abstrações: `tests/abstract/*`

### Execução
- Desenvolvimento:
  - `docker compose up -d` (inicia Mongo e app com auto-reload)
  - Endereços:
    - API: `http://localhost:3001`
- Testes:
  - `npm run test`
  - `npm run test:coverage`

### Decisões de Projeto
- Express 5 para roteamento simples e compatível com middlewares.
- Mongoose pela produtividade com MongoDB.
- JWT para autenticação stateless.
- Abordagem em camadas com `AbstractRepository` e mapeadores para reduzir boilerplate e manter SRP/DRY.