# 🔥 LumeFood — Clone do iFood para Ensino de QA

Sistema de delivery de comida inspirado no iFood, desenvolvido para ensino de **planejamento e execução de testes de software**.

---

## 🚀 Setup rápido

### Pré-requisitos
- Node.js 20.9+
- npm

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco de dados
```bash
# Gerar cliente Prisma
npx prisma generate

# Criar tabelas
npx prisma migrate dev --name init

# Popular com dados mocados
npm run db:seed
```

### 3. Iniciar servidor
```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 👤 Credenciais dos usuários mocados

### Clientes
| Email | Senha | Nome |
|-------|-------|------|
| `joao@lumefood.com` | `senha123` | João Silva |
| `maria@lumefood.com` | `senha123` | Maria Santos |
| `pedro@lumefood.com` | `senha123` | Pedro Oliveira |

### Admins de Restaurante
| Email | Senha | Restaurante |
|-------|-------|-------------|
| `admin.pizzaria@lumefood.com` | `admin123` | Pizzaria do Chef |
| `admin.burguer@lumefood.com` | `admin123` | Burguer King Premium |

### Cupom de desconto
- Código: `LUMEFOOD10` — 10% de desconto

---

## 🗺️ Rotas do sistema

### Páginas (Frontend)
| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Home — lista de restaurantes | Público |
| `/login` | Login | Público |
| `/register` | Cadastro | Público |
| `/restaurante/:id` | Cardápio do restaurante | Público |
| `/carrinho` | Carrinho de compras | Autenticado |
| `/checkout` | Finalizar pedido | Autenticado |
| `/pedidos` | Meus pedidos | Autenticado |
| `/pedidos/:id` | Detalhe do pedido | Autenticado |
| `/admin` | Dashboard admin | RESTAURANT_ADMIN |
| `/admin/cardapio` | Gerenciar cardápio | RESTAURANT_ADMIN |
| `/admin/pedidos` | Gerenciar pedidos | RESTAURANT_ADMIN |

### API REST
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/restaurantes` | Listar restaurantes |
| GET | `/api/restaurantes/:id` | Detalhe do restaurante |
| GET | `/api/restaurantes/:id/cardapio` | Cardápio com categorias |
| POST | `/api/register` | Cadastrar usuário |
| GET | `/api/pedidos` | Meus pedidos |
| POST | `/api/pedidos` | Criar pedido |
| GET | `/api/pedidos/:id` | Detalhe do pedido |
| PATCH | `/api/pedidos/:id/status` | Atualizar status (admin) |
| GET | `/api/carrinho` | Ver carrinho |
| POST | `/api/carrinho/items` | Adicionar ao carrinho |
| PATCH | `/api/carrinho/items/:id` | Alterar quantidade |
| DELETE | `/api/carrinho/items/:id` | Remover item |
| POST | `/api/cupons/validar` | Validar cupom |
| POST | `/api/avaliacoes` | Enviar avaliação |
| GET | `/api/admin/cardapio` | Listar itens (admin) |
| POST | `/api/admin/cardapio` | Criar item (admin) |
| PATCH | `/api/admin/cardapio/:id` | Editar item (admin) |
| DELETE | `/api/admin/cardapio/:id` | Excluir item (admin) |
| GET | `/api/admin/pedidos` | Todos os pedidos (admin) |
| GET | `/api/admin/restaurante` | Info do restaurante (admin) |
| PUT | `/api/admin/restaurante` | Editar restaurante (admin) |

---

## 🧪 Casos de Teste — Guia para a Aula

### CT-001: Login com credenciais válidas
**Pré-condição:** Usuário cadastrado
**Passos:** `/login` → `joao@lumefood.com` / `senha123` → "Entrar"
**Resultado esperado:** Redirecionado para `/`, nome do usuário no header

### CT-002: Login com senha inválida
**Passos:** `/login` → email válido + senha errada → "Entrar"
**Resultado esperado:** Toast de erro, permanece na página de login

### CT-003: Cadastro de novo usuário
**Passos:** `/register` → nome, email único, senha → "Cadastrar"
**Resultado esperado:** Redirecionado para `/login`, usuário criado no banco

### CT-004: Adicionar item ao carrinho
**Pré-condição:** Usuário logado
**Passos:** Página de restaurante → "+ Adicionar" em um item
**Resultado esperado:** Toast de sucesso, contador do carrinho atualizado

### CT-005: Aplicar cupom de desconto
**Pré-condição:** Carrinho com itens
**Passos:** `/carrinho` → inserir `LUMEFOOD10` → "Aplicar"
**Resultado esperado:** 10% de desconto no resumo

### CT-006: Finalizar pedido
**Pré-condição:** Carrinho com itens, usuário logado
**Passos:** `/checkout` → endereço → pagamento → "Confirmar Pedido"
**Resultado esperado:** Pedido criado, redirecionado para `/pedidos/:id`

### CT-007: Fluxo de status (Admin)
**Pré-condição:** Logado como admin (`admin.pizzaria@lumefood.com`)
**Passos:** `/admin/pedidos` → avançar status: PENDING → ACCEPTED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
**Resultado esperado:** Cada transição persiste no banco

### CT-008: Avaliação de pedido entregue
**Pré-condição:** Pedido com status DELIVERED, sem avaliação
**Passos:** `/pedidos/:id` → nota (1-5) + comentário → "Enviar avaliação"
**Resultado esperado:** Avaliação salva, formulário oculto, rating do restaurante atualizado

---

## 🔧 Exemplos para Postman

### Listar restaurantes (sem autenticação)
```
GET http://localhost:3000/api/restaurantes
```

### Validar cupom (requer sessão)
```
POST http://localhost:3000/api/cupons/validar
Content-Type: application/json

{"code": "LUMEFOOD10", "subtotal": 5000}
```

### Criar pedido (requer sessão)
```
POST http://localhost:3000/api/pedidos
Content-Type: application/json

{
  "restaurantId": "<id>",
  "deliveryAddress": "Rua Teste, 123",
  "paymentMethod": "PIX",
  "couponCode": "LUMEFOOD10"
}
```

---

## 🏗️ Stack tecnológica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 16 | Framework full-stack |
| React | 19 | UI |
| Prisma | 7 | ORM |
| SQLite (LibSQL) | — | Banco de dados |
| NextAuth.js | 5 | Autenticação JWT |
| Tailwind CSS | 4 | Estilização |
| Shadcn/ui | — | Componentes |
| Zod | — | Validação |
| bcryptjs | — | Hash de senhas |
| Sonner | — | Notificações |

---

## 📁 Estrutura do projeto

```
lumefood/
├── app/
│   ├── api/              # REST API (Route Handlers)
│   ├── admin/            # Painel administrativo
│   ├── carrinho/         # Carrinho
│   ├── checkout/         # Checkout
│   ├── login/            # Login
│   ├── pedidos/          # Pedidos
│   ├── register/         # Cadastro
│   ├── restaurante/      # Página do restaurante
│   ├── layout.tsx        # Layout raiz
│   └── page.tsx          # Home
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── header.tsx        # Header global
│   ├── add-to-cart-button.tsx
│   └── category-filters.tsx
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # PrismaClient
│   └── utils.ts          # Helpers + constantes
├── prisma/
│   ├── schema.prisma     # Schema do banco
│   └── seed.ts           # Dados mocados
└── proxy.ts              # Middleware de rotas (Next.js 16)
```

---

## 🔄 Reset do banco de dados

```bash
npm run db:reset
```

Apaga tudo e repopula com os dados mocados originais.
