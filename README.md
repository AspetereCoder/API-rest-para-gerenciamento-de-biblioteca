# API de Biblioteca

API REST para gerenciar autores, livros e empréstimos de uma biblioteca.

## Tecnologias

- Node.js (ES Modules)
- Express 5
- PostgreSQL 16, com o driver `pg` (sem ORM, SQL escrito à mão)
- dotenv
- Docker Compose (apenas para subir o banco)

## Pré-requisitos

- Node.js 20 ou superior
- Docker e Docker Compose

## Como rodar

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:init
npm run dev
```

A API fica disponível em `http://localhost:3000`.

O `npm run db:init` cria as tabelas e, se o banco estiver vazio, insere 3 autores e 6 livros de exemplo. Rodar o comando de novo não duplica os dados.

### Scripts

| Script | O que faz |
|---|---|
| `npm start` | Inicia o servidor |
| `npm run dev` | Inicia o servidor reiniciando a cada alteração no código |
| `npm run db:init` | Cria as tabelas e insere os dados de exemplo |

### Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL | sem padrão (veja `.env.example`) |
| `PORT` | Porta do servidor | `3000` |

## Endpoints

Todas as respostas são JSON (exceto os `204`, que não têm corpo). Erros seguem o formato `{ "error": "mensagem" }`. Qualquer rota inexistente responde `404`, e erros inesperados respondem `500` sem expor detalhes internos.

### Autores

| Método | Rota | Descrição | Status possíveis |
|---|---|---|---|
| GET | `/api/authors` | Lista os autores | 200 |
| GET | `/api/authors/:id` | Busca um autor | 200, 400, 404 |
| GET | `/api/authors/:id/books` | Lista os livros de um autor | 200, 400, 404 |
| POST | `/api/authors` | Cria um autor | 201, 400 |
| PUT | `/api/authors/:id` | Atualiza um autor | 200, 400, 404 |
| DELETE | `/api/authors/:id` | Remove um autor | 204, 400, 404, 409 |

### Livros

| Método | Rota | Descrição | Status possíveis |
|---|---|---|---|
| GET | `/api/books` | Lista os livros, com filtros e paginação opcionais | 200, 400 |
| GET | `/api/books/:id` | Busca um livro | 200, 400, 404 |
| POST | `/api/books` | Cria um livro | 201, 400 |
| PUT | `/api/books/:id` | Atualiza um livro | 200, 400, 404 |
| DELETE | `/api/books/:id` | Remove um livro | 204, 400, 404, 409 |

Parâmetros opcionais de `GET /api/books`:

| Parâmetro | Exemplo | Efeito |
|---|---|---|
| `available` | `?available=true` | Só livros disponíveis (ou `false` para os emprestados) |
| `author_id` | `?author_id=1` | Só livros desse autor |
| `title` | `?title=casmurro` | Busca parcial no título, sem diferenciar maiúsculas de minúsculas |
| `page` | `?page=2` | Página (começa em 1) |
| `limit` | `?limit=10` | Itens por página (de 1 a 100; 10 se só `page` for enviado) |

Os filtros podem ser combinados. Sem `page` e `limit`, todos os livros que combinam com os filtros são retornados. Com paginação, o corpo continua sendo uma lista e o total de itens vem no header `X-Total-Count`.

### Empréstimos

| Método | Rota | Descrição | Status possíveis |
|---|---|---|---|
| GET | `/api/loans` | Lista os empréstimos (`?active=true` só os não devolvidos) | 200, 400 |
| GET | `/api/loans/:id` | Busca um empréstimo | 200, 400, 404 |
| POST | `/api/loans` | Empresta um livro | 201, 400, 404, 409 |
| POST | `/api/loans/:id/return` | Devolve um livro | 200, 400, 404, 409 |

### Significado dos status

| Status | Quando acontece |
|---|---|
| 400 | Dados inválidos no corpo, na query string ou em `:id`; JSON malformado |
| 404 | Registro ou rota não encontrado |
| 409 | Conflito com o estado atual: livro já emprestado, empréstimo já devolvido, ou remoção de autor/livro que ainda tem registros ligados |
| 500 | Erro inesperado no servidor |

### Campos aceitos

| Recurso | Campo | Regra |
|---|---|---|
| Autor | `name` | obrigatório, texto de até 120 caracteres |
| Autor | `nationality` | opcional, texto de até 60 caracteres |
| Livro | `title` | obrigatório, texto de até 200 caracteres |
| Livro | `author_id` | obrigatório, inteiro positivo de um autor existente |
| Livro | `release_date` | opcional, inteiro (o ano) |
| Livro | `available` | opcional, booleano |
| Empréstimo | `book_id` | obrigatório, inteiro positivo |
| Empréstimo | `borrower_name` | obrigatório, texto de até 120 caracteres |
| Empréstimo | `due_date` | opcional, data real no formato `YYYY-MM-DD`, não pode estar no passado (padrão: hoje + 14 dias) |

## Exemplos

Os valores de `id` e as datas abaixo são ilustrativos.

Criar um autor:

```bash
curl -i -X POST http://localhost:3000/api/authors \
  -H "Content-Type: application/json" \
  -d '{"name":"Lima Barreto","nationality":"Brasileira"}'
```

```
HTTP/1.1 201 Created
{"id":4,"name":"Lima Barreto","nationality":"Brasileira"}
```

Buscar livros disponíveis com paginação:

```bash
curl -i "http://localhost:3000/api/books?available=true&limit=2"
```

```
HTTP/1.1 200 OK
X-Total-Count: 6
[{"id":1,"title":"Dom Casmurro","release_date":1899,"available":true,"author_id":1},
 {"id":2,"title":"Memórias Póstumas de Brás Cubas","release_date":1881,"available":true,"author_id":1}]
```

Emprestar um livro:

```bash
curl -i -X POST http://localhost:3000/api/loans \
  -H "Content-Type: application/json" \
  -d '{"book_id":1,"borrower_name":"Maria"}'
```

```
HTTP/1.1 201 Created
{"id":1,"book_id":1,"borrower_name":"Maria","borrowed_at":"2026-10-27T14:00:00.000Z","due_date":"2026-11-10T00:00:00.000Z","returned_at":null}
```

Tentar emprestar o mesmo livro de novo:

```bash
curl -i -X POST http://localhost:3000/api/loans \
  -H "Content-Type: application/json" \
  -d '{"book_id":1,"borrower_name":"João"}'
```

```
HTTP/1.1 409 Conflict
{"error":"Book is not available"}
```

Devolver o livro:

```bash
curl -i -X POST http://localhost:3000/api/loans/1/return
```

```
HTTP/1.1 200 OK
{"id":1,"book_id":1,"borrower_name":"Maria","borrowed_at":"...","due_date":"...","returned_at":"2026-10-27T15:00:00.000Z"}
```

## Regras de negócio

- **Empréstimo atômico:** emprestar e devolver são feitos em um único comando SQL com CTE (`WITH ... UPDATE ... INSERT`). O livro é marcado como indisponível e o empréstimo é criado no mesmo passo, então duas requisições simultâneas não conseguem emprestar o mesmo livro.
- **`available` acompanha os empréstimos:** vira `false` ao emprestar e volta a `true` ao devolver. No `PUT /api/books/:id`, se `available` não for enviado, o valor atual é mantido.
- **`ON DELETE RESTRICT`:** o banco impede apagar um autor que tem livros e um livro que tem histórico de empréstimos. A API traduz isso em `409` com uma mensagem clara.
- **Queries parametrizadas:** todos os valores vindos do cliente passam por parâmetros (`$1`, `$2`, ...), inclusive nos filtros montados dinamicamente. Nenhum valor é concatenado no SQL.
- **Tratamento central de erros:** um middleware traduz erros do PostgreSQL (valor com formato inválido, data inválida, chave estrangeira) em respostas `400` ou `409`, e erros inesperados viram `500` sem expor o stack trace.

## Estrutura

```
src/
  app.js              cria e exporta o app Express
  server.js           inicia o servidor
  routes/             rotas de cada recurso
  controllers/        lógica de cada rota
  validators/         validação dos dados de entrada
  middlewares/        validação de :id, rota não encontrada, tratamento de erros
  data/               conexão, schema.sql e script de inicialização
```