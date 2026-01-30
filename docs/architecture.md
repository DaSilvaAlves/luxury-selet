# Luxury Selet Fullstack Architecture Document

**Version:** 1.0
**Date:** 2026-01-30
**Author:** Assistente de IA

## Change Log

| Date         | Version | Description                                                                                                   | Author          |
|--------------|---------|---------------------------------------------------------------------------------------------------------------|-----------------|
| 2026-01-30   | 1.0     | Documento inicial baseado na análise do estado atual e plano de ação para integração da base de dados Supabase. | Assistente de IA |

---

## 1. High-Level Architecture

### 1.1. Technical Summary

A arquitetura do "Luxury Selet" consiste num frontend moderno desenvolvido com **React (Vite), TypeScript e Tailwind CSS**, e um backend robusto em **Node.js com Express.js e TypeScript**. O desafio arquitetónico principal é a transição de uma base de dados em memória (adequada para o MVP inicial) para uma solução de base de dados persistente e escalável, utilizando **Supabase (PostgreSQL)** como o sistema de gestão de base de dados e **Prisma** como ORM. Este plano foca-se em resolver os bloqueios de conectividade atuais para habilitar esta transição e solidificar a fundação para a Fase 2 (Admin).

### 1.2. Platform and Infrastructure Choice

*   **Platform:** Supabase e infraestrutura de hosting a ser definida (ex: Vercel/Netlify para frontend, Render/Fly.io para backend).
*   **Key Services:**
    *   **Supabase:** Utilizado para a base de dados PostgreSQL.
    *   **Prisma:** ORM para a comunicação entre o backend e a base de dados.
    *   **Vercel/Netlify (Recomendado):** Para deployment contínuo e otimizado do frontend React.
    *   **Render/Fly.io (Recomendado):** Para containerização e deployment do backend Node.js.
*   **Deployment Host and Regions:**
    *   **Desenvolvimento:** Local (localhost).
    *   **Produção:** A ser definido, com recomendação para `us-east-1` (N. Virginia) ou `eu-west-1` (Irlanda) para baixa latência global.

### 1.3. Repository Structure

*   **Structure:** Multi-Package Repository (Projetos co-localizados). O código do frontend e do backend está contido no mesmo repositório, mas em pastas separadas (`app/` e `backend/`), permitindo desenvolvimento e deployment independentes.
*   **Monorepo Tool:** N/A (configuração manual).
*   **Package Organization:**
    *   `app/`: Contém todo o código-fonte do frontend React.
    *   `backend/`: Contém todo o código-fonte do backend Node.js, incluindo a configuração do Prisma.

### 1.4. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph User
        A[Browser]
    end

    subgraph Frontend (Vercel/Local)
        B[React App - Vite]
    end

    subgraph Backend (Render/Local)
        C[API Node.js/Express]
        D[Prisma ORM]
    end

    subgraph Cloud
        E[Supabase - PostgreSQL DB]
    end

    A -- HTTP/S --> B
    B -- API Calls (REST) --> C
    C -- Prisma Client --> D
    D -- DATABASE_URL --> E

    linkStyle 3 stroke:#ff0000,stroke-width:2px,stroke-dasharray: 5 5;
    note right of E
     **Blocker Atual (P1001)**
     A conexão entre o Prisma e o Supabase está a falhar.
     Credenciais ou regras de firewall são as causas prováveis.
    end
```

---

## 2. Tech Stack

| Category           | Technology        | Version                  | Purpose                                        | Rationale                                        |
|--------------------|-------------------|--------------------------|------------------------------------------------|--------------------------------------------------|
| Frontend Language  | TypeScript        | `~5.2.2`                 | Tipagem estática e escalabilidade para o frontend. | Padrão da indústria para aplicações React robustas. |
| Frontend Framework | React             | `^18.2.0`                | Construção da interface de utilizador.           | Escolhido pelo projeto; ecossistema maduro.      |
| UI Component Library| Radix UI / Shadcn | `latest`                 | Componentes de UI acessíveis e sem estilo.      | Flexibilidade e acessibilidade.                  |
| CSS Framework      | Tailwind CSS      | `^3.4.1`                 | Estilização utilitária rápida.                 | Escolhido pelo projeto; alta produtividade.      |
| Build Tool         | Vite              | `^5.2.0`                 | Build e desenvolvimento rápido para o frontend. | Padrão moderno com excelente performance.        |
| Backend Language   | TypeScript        | `^5.4.5`                 | Tipagem estática para o backend.               | Consistência com o frontend e robustez.          |
| Backend Framework  | Express.js        | `^4.19.2`                | Framework para a construção da API REST.       | Simples, flexível e amplamente utilizado.        |
| Database           | PostgreSQL        | `(Supabase)`             | Base de dados relacional persistente.          | Solução robusta e escalável para dados estruturados. |
| ORM                | Prisma            | `^5.14.0`                | Camada de acesso à base de dados.              | Segurança de tipos e geração automática de cliente. |
| API Style          | REST              | `N/A`                    | Comunicação entre frontend e backend.        | Padrão simples e bem compreendido.               |

---

## 3. Plano de Ação Arquitetónico

Este plano detalha os passos para resolver o bloqueador atual e estabilizar a arquitetura do backend.

### Fase 1: Resolução da Conectividade da Base de Dados (Bloqueador Crítico)

**Objetivo:** Resolver o erro `P1001` e estabelecer uma conexão bem-sucedida entre o backend e a base de dados Supabase.

*   **Passo 1.1 (Ação do Utilizador):**
    *   **Tarefa:** Fornecer a `DATABASE_URL` correta e completa do Supabase. É crucial que a senha seja verificada ou redefinida no painel do Supabase.
    *   **Formato esperado:** `postgresql://postgres:[SUA-SENHA-AQUI]@[referencia-do-host].supabase.co:5432/postgres`
    *   **Ação:** O assistente irá aguardar que forneça esta string de conexão no próximo prompt.

*   **Passo 1.2 (Ação do Assistente - Falha na Conexão):**
    *   **Estado Atual:** A tentativa de conexão com `npx prisma db pull` falhou com o erro `P1001` (Cannot reach database server).
    *   **Ação Necessária do Utilizador:** Por favor, verifique as configurações da sua base de dados no Supabase. Certifique-se de que:
        *   A `DATABASE_URL` fornecida está correta e corresponde exatamente à string de conexão do seu projeto Supabase.
        *   As regras de rede/firewall no Supabase permitem conexões do ambiente de onde está a executar o comando (pode ser o seu IP local).
        *   A base de dados não está em modo de pausa ou desligada.
    *   **Ação Seguinte:** Assim que as configurações no Supabase forem revistas, por favor, forneça novamente a `DATABASE_URL` ou confirme que as verificações foram feitas, para que eu possa tentar novamente.

### Fase 2: Migração e Geração do Prisma

**Objetivo:** Criar a primeira migração da base de dados e gerar o Prisma Client atualizado.

*   **Passo 2.1 (Ação do Assistente):**
    *   **Tarefa:** Executar a migração de desenvolvimento inicial.
    *   **Comando a ser executado no diretório `backend/`:** `npm run prisma:migrate-dev -- --name init`
    *   **Resultado Esperado:** Uma pasta `migrations/` será criada com a definição do schema SQL inicial, e este será aplicado à base de dados Supabase.

*   **Passo 2.2 (Ação do Assistente):**
    *   **Tarefa:** Gerar o Prisma Client.
    *   **Comando a ser executado no diretório `backend/`:** `npm run prisma:generate`
    *   **Resultado Esperado:** O `@prisma/client` dentro de `node_modules` será atualizado para refletir o schema final, fornecendo tipos TypeScript para todas as operações de base de dados.

### Fase 3: Refatoração do Código e Limpeza

**Objetivo:** Remover soluções temporárias e integrar o Prisma Client na lógica de negócio do backend.

*   **Passo 3.1 (Ação do Assistente):**
    *   **Tarefa:** Remover a `DATABASE_URL` hardcoded.
    *   **Localização:** Ficheiro `backend/prisma/schema.prisma`.
    *   **Ação:** A linha `url = "..."` dentro do bloco `datasource db` será removida para garantir que o Prisma utilize a variável de ambiente do ficheiro `.env`.

*   **Passo 3.2 (Ação do Assistente):**
    *   **Tarefa:** Criar uma instância singleton do Prisma Client.
    *   **Ação:** Criar um novo ficheiro `backend/src/lib/prisma.ts` que instancia e exporta o `PrismaClient`, garantindo que apenas uma instância seja usada em toda a aplicação.

*   **Passo 3.3 (Ação do Assistente):**
    *   **Tarefa:** Refatorar os services e controllers do backend.
    *   **Ação:** Substituir toda a lógica que atualmente manipula a base de dados em memória por chamadas assíncronas ao Prisma Client (ex: `prisma.product.findMany()`, `prisma.user.create()`).

---

## 4. Unified Project Structure

```plaintext
luxury-selet/
├── .github/
├── app/                      # Aplicação Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── sections/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Aplicação Backend (Node.js)
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── data/
│   │   ├── types/
│   │   ├── lib/
│   │   │   └── prisma.ts     # Instância do Prisma Client
│   │   └── server.ts
│   ├── .env
│   └── package.json
├── docs/
│   └── architecture.md       # Este documento
└── ...
```
