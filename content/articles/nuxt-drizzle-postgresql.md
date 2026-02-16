---
title: "Nuxt 4 集成 Drizzle ORM (PostgreSQL) 完整教程"
description: "本教程专注于 Drizzle ORM 在 PostgreSQL 数据库上的 Nuxt 4 集成。如果您使用的是 MySQL、SQLite 等其他数据库，部分配置（如连接驱动、数据类型）会有所不同，请参考 Drizzle 官方文档相应部分。"
date: 2026-02-16
tags: [Nuxt, Drizzle, ORM, PostgreSQL]
---

# 🚀 Nuxt 4 集成 Drizzle ORM (PostgreSQL) 完整教程

## 📋 教程范围说明

本教程专注于 Drizzle ORM 在 PostgreSQL 数据库上的 Nuxt 4 集成。如果您使用的是 MySQL、SQLite 等其他数据库，部分配置（如连接驱动、数据类型）会有所不同，请参考 Drizzle 官方文档相应部分。

## ⚠️ 重要提示：Drizzle 官方文档 vs Nuxt 集成

在开始之前，必须先说明一个关键点：

| 对比维度       | Drizzle 官方文档        | 本教程（Nuxt 集成）                      |
| -------------- | ----------------------- | ---------------------------------------- |
| **项目类型**   | 普通 Node.js 项目       | Nuxt 4 项目（基于 Nitro 服务器）         |
| **目录结构**   | `src/` 目录             | `server/` + `server/utils/` 目录         |
| **入口文件**   | `src/index.ts` 手动运行 | `server/api/` 路由 + Nuxt 自动处理       |
| **数据库连接** | 直接导出 `db` 实例      | 通过 `server/utils/` 导出 `useDb()` 函数 |
| **运行方式**   | `npx tsx src/index.ts`  | `npm run dev`（Nuxt 自动处理）           |
| **数据库类型** | 通用（支持多种）        | 本教程聚焦 PostgreSQL                    |

**核心区别**：Drizzle 官方文档面向的是**普通 Node 应用**，而 Nuxt 有自己的**目录规范**和**服务端处理机制**。如果完全照搬官方文档，你会发现 API 路由里根本拿不到数据库连接。

## 📋 前置知识

- 已有一个 Nuxt 4 项目
- 已安装 PostgreSQL（本地开发用）
- 了解基本的 TypeScript 语法

## 第 1 步：安装依赖

```bash
# 安装生产依赖
npm i drizzle-orm pg
# 安装开发依赖
npm i -D drizzle-kit @types/pg dotenv
```

### 🤔 为什么要装这些？

| 包名          | 作用            | 为什么需要                                   |
| ------------- | --------------- | -------------------------------------------- |
| `drizzle-orm` | ORM 核心库      | 提供类型安全的查询构建器                     |
| `pg`          | PostgreSQL 驱动 | 让 Node.js 能连接 PostgreSQL                 |
| `drizzle-kit` | 迁移工具        | 自动生成 SQL 迁移文件，不用手写              |
| `@types/pg`   | TypeScript 类型 | 让 `pg` 有类型提示                           |
| `dotenv`      | 环境变量加载    | 开发时从 `.env` 读配置（生产用系统环境变量） |

> 注意：如果您使用 MySQL，需要安装 mysql2 驱动；使用 SQLite 则安装 better-sqlite3。本教程基于 PostgreSQL，所以使用 pg。

## 第 2 步：配置环境变量

创建 `.env` 文件（**记住要加到 `.gitignore`**）：

```env
# .env - 本地开发用
NUXT_DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/你的数据库名
```

修改 `.gitignore`：

```bash
echo ".env" >> .gitignore
```

### 🤔 为什么要这样做？

- **安全性**：数据库密码是敏感信息，绝对不能提交到 Git
- **环境隔离**：本地开发和生产环境的数据库地址不同，分开配置
- **Nuxt 规范**：`NUXT_` 前缀的环境变量会自动映射到 `runtimeConfig`
- **PostgreSQL 连接格式**：postgresql:// 前缀是 PostgreSQL 的标准连接字符串格式

**踩坑警告**：如果不加 `.env` 到 `.gitignore`，你的数据库密码就会公开在 GitHub 上！

## 第 3 步：配置 Nuxt runtimeConfig

修改 `nuxt.config.ts`：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // 服务端私密变量 - 必须从环境变量读取，不留默认值
    databaseUrl: "", // 对应 NUXT_DATABASE_URL

    // 公开变量（可安全暴露给前端）
    public: {
      siteUrl: process.env.SITE_URL,
    },
  },

  // 其他配置...
});
```

### 🤔 为什么要这样配？

- `runtimeConfig` 是 Nuxt 官方推荐的环境变量管理方式
- `database: ''` 不留默认值，强制从环境变量读取，避免生产环境误用本地数据库
- `public` 下的变量会暴露给前端，所以只能放非敏感信息

**踩坑警告**：千万不要在 `database` 给默认值！否则生产环境可能悄悄连上你的本地数据库。

## 第 4 步：定义数据表 Schema

创建 `server/db/schema.ts`：

```typescript
// server/db/schema.ts
import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  githubId: varchar("github_id", { length: 39 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
// 导出类型，后面会用到
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### 🤔 为什么要这样设计？

| 字段        | 说明           | 为什么这么设计                                        |
| ----------- | -------------- | ----------------------------------------------------- |
| `id`        | 自增主键       | 内部关联用，和外部的 GitHub 无关                      |
| `githubId`  | GitHub 数字 ID | **唯一不变**，即使用户改名也能识别                    |
| `username`  | GitHub 登录名  | 用户可能改名，所以不加 `UNIQUE`                       |
| `isAdmin`   | 管理员标识     | 区分普通用户和站长                                    |
| `createdAt` | 注册时间       | 自动记录，方便统计（withTimezone: true 确保时区正确） |

> 注意：这里使用的是 PostgreSQL 专用的数据类型。如果是 MySQL，需要从 drizzle-orm/mysql-core 导入不同的类型。

## 第 5 步：配置 Drizzle Kit

在根目录创建 `drizzle.config.ts`：

```typescript
// drizzle.config.ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  out: "./server/db/migrations",
  schema: "./server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NUXT_DATABASE_URL!,
  },
});
```

### 🤔 为什么需要这个文件？

- `drizzle-kit` 需要知道你的数据库连接和 schema 位置
- `dialect: 'postgresql'` 明确指定使用 PostgreSQL，这样生成的迁移语句会符合 PostgreSQL 语法

- `out` 目录存放自动生成的迁移文件，方便版本控制
- 开发时用 `push` 直接同步，生产环境用 `migrate` 安全更新

## 第 6 步：创建数据库连接工具

**这是和 Drizzle 官方文档最大的区别**！官方文档直接导出 `db` 实例，但在 Nuxt 中，我们需要：

创建 `server/utils/db.ts`：

```typescript
// server/utils/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "~/../server/db/schema";

const config = useRuntimeConfig();

// 创建连接池
const pool = new Pool({
  connectionString: config.databaseUrl,
});

// 导出获取数据库实例的函数
export const useDb = () => drizzle(pool, { schema });
```

### 🤔 为什么要这样写？

- **drizzle-orm/node-postgres**：这是 Drizzle 针对 PostgreSQL 的专用驱动包

- **放在 `server/utils/` 下**：Nuxt 会自动导入到所有 API 路由，无需手动 `import`
- **返回函数而不是直接导出实例**：确保每次请求都获取新连接（避免连接泄漏）
- **和官方文档的区别**：官方是 `const db = drizzle(pool)`，但在 Nuxt 中需要用函数包装，配合自动导入机制

**踩坑警告**：千万不要把数据库连接文件放在根目录的 `utils/`！那里是给前端用的，在 API 中无法访问。也**不要直接导出单例**，否则可能在高并发下出问题。

## 第 7 步：应用数据库变更

```bash
# 开发环境：直接推送（方便快速迭代）
npx drizzle-kit push
# 或者生成迁移文件（适合团队协作）
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 🤔 `push` vs `generate` 怎么选？

| 命令                   | 适用场景          | 原理                                   |
| ---------------------- | ----------------- | -------------------------------------- |
| `push`                 | 本地开发          | 直接对比 schema 和数据库，自动执行变更 |
| `generate` + `migrate` | 生产环境/团队协作 | 生成 SQL 文件，审核后再执行，更安全    |

**注意**：生成的 SQL 迁移文件会使用 PostgreSQL 语法（如 SERIAL PRIMARY KEY、TIMESTAMP WITH TIME ZONE 等），确保与您的数据库兼容。

**踩坑警告**：生产环境千万别用 `push`！它会直接修改数据库，万一出错没法回滚。

## 第 8 步：在 API 中使用 Drizzle

创建一个简单的测试 API：

```typescript
// server/api/users.get.ts
import { users } from "~/server/db/schema";
export default defineEventHandler(async (event) => {
  const db = useDb(); // ✅ 直接使用，无需 import

  const allUsers = await db.select().from(users);
  return allUsers;
});
```

创建用户的 API：

```typescript
// server/api/user.post.ts
import { users, type NewUser } from "~/server/db/schema";
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const db = useDb();

  const newUser: NewUser = {
    githubId: body.githubId,
    username: body.username,
    isAdmin: false,
  };

  const [inserted] = await db.insert(users).values(newUser).returning();

  return inserted;
});
```

### 🤔 为什么能直接用 `useDb()`？

因为 `server/utils/` 下的导出会自动注册到 Nuxt 的自动导入系统，在 `server/api/` 中可以直接使用，不需要 `import`。这是 Nuxt 和普通 Node 项目的又一区别。

## 第 9 步：测试数据库连接

创建测试接口验证一切正常：

```typescript
// server/api/test.db.get.ts
import { sql } from "drizzle-orm";
export default defineEventHandler(async (event) => {
  try {
    const db = useDb();
    // 执行简单查询测试连接
    const result = await db.execute(sql`SELECT 1+1 as result`);
    return {
      success: true,
      message: "数据库连接成功",
      data: result.rows[0],
    };
  } catch (error) {
    console.error("数据库连接失败:", error);
    return {
      success: false,
      message: "数据库连接失败",
      error: String(error),
    };
  }
});
```

访问 `http://localhost:3000/api/test.db` 看到 `{"result":2}` 就说明一切正常。

## 🎯 验证清单

部署完成后，务必测试：

- `curl http://localhost:3000/api/test.db`（测试数据库连接）
- `curl http://localhost:3000/api/users`（测试查询）
- 用 Postman 测试 `POST /api/user` 创建用户
- 生产环境没有意外连到本地数据库

## 📚 常见问题

### Q1: 为什么 API 路由返回 404？

A: 构建时环境变量可能缺失。检查构建日志，确保所有依赖环境变量的模块都能正常初始化。也可能是文件没放在正确的 `server/api/` 目录。

### Q2: 为什么 `db.insert` 返回数组而不是单个对象？

A: Drizzle 的 `.returning()` 始终返回数组，即使只插入一条。用 `[newUser] = await db.insert()` 解构。

### Q3: 生产环境该用 `push` 还是 `migrate`？

A: **永远用 `migrate`**！`push` 适合开发，生产环境要用迁移文件，方便回滚和团队协作。

### Q4: 为什么我的 `useDb()` 提示找不到？

A: 确保文件在 `server/utils/db.ts`，而不是根目录的 `utils/`。重启 Nuxt 开发服务器让自动导入生效。

### Q5: 我想用 MySQL 怎么办？

A: 本教程专注于 PostgreSQL。如果要用 MySQL，需要：

- 安装 `mysql2` 替代 `pg`
- 使用 `drizzle-orm/mysql2` 驱动
- 从 `drizzle-orm/mysql-core` 导入数据类型
- 在 `drizzle.config.ts` 中设置 `dialect: 'mysql'`

### Q6: Drizzle 官方文档和 Nuxt 集成的主要区别？

| 对比维度       | Drizzle 官方文档  | 本教程（Nuxt + PostgreSQL） |     |
| -------------- | ----------------- | --------------------------- | --- |
| **项目类型**   | 普通 Node.js 项目 | Nuxt 4 项目                 |     |
| **目录结构**   | `src/` 目录       | `server/` + `server/utils/` |     |
| **数据库驱动** | 多种可选          | **PostgreSQL 专用（pg）**   |     |
| **连接方式**   | 直接导出 `db`     | 导出 `useDb()` 函数         |     |
| **运行环境**   | 手动运行脚本      | Nuxt API 路由自动处理       |     |
| **数据类型**   | 通用              | **PostgreSQL 专用类型**     |     |

## 💡 最后的话

Drizzle ORM 最大的价值是**类型安全**——表结构和 TypeScript 类型永远同步，再也不用手写类型定义，也不用担心数据库和代码不一致。

记住：**不要完全照搬 Drizzle 官方文档**，要根据 Nuxt 的项目结构调整。官方文档针对普通 Node 项目，而 Nuxt 有自己的一套规范。理解了这一点，就能避免 80% 的坑。

如果你按照这篇教程一步步来，应该能顺利跑起来。遇到问题欢迎交流，毕竟技术博客的读者，可能就是未来的你自己 😄
