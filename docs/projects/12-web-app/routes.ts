/**
 * routes.ts - 路由定义
 *
 * 本文件定义了博客系统的路由：
 * - 首页路由
 * - 文章路由
 * - 用户路由
 * - API 路由
 *
 * TypeScript 优势：
 * - 接口定义路由结构
 * - 类型安全的请求处理
 * - 泛型支持通用路由逻辑
 */

import {
  Router,
  jsonResponse,
  htmlResponse,
  type User,
} from "./server.ts";

// ============================================================================
// 类型定义
// ============================================================================

/** 文章 */
interface Article {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly author: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly tags: readonly string[];
  readonly status: "draft" | "published";
}

/** 文章创建请求 */
interface CreateArticleRequest {
  readonly title: string;
  readonly content: string;
  readonly tags?: readonly string[];
  readonly status?: "draft" | "published";
}

/** 文章更新请求 */
interface UpdateArticleRequest {
  readonly title?: string;
  readonly content?: string;
  readonly tags?: readonly string[];
  readonly status?: "draft" | "published";
}

/** 分页参数 */
interface PaginationParams {
  readonly page: number;
  readonly limit: number;
}

/** 分页结果 */
interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

/** API 响应 */
interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
}

// ============================================================================
// 模拟数据库
// ============================================================================

/**
 * 内存数据库（演示用）
 *
 * TypeScript 优势：使用 Map 确保类型安全的数据存储
 */
class InMemoryDatabase {
  private articles: Map<string, Article> = new Map();
  private users: Map<string, User> = new Map();
  private nextId = 1;

  constructor() {
    // 初始化测试数据
    this.seedData();
  }

  /**
   * 初始化测试数据
   */
  private seedData(): void {
    // 添加测试用户
    this.users.set("1", {
      id: "1",
      username: "admin",
      email: "admin@example.com",
      role: "admin",
    });

    this.users.set("2", {
      id: "2",
      username: "user1",
      email: "user1@example.com",
      role: "user",
    });

    // 添加测试文章
    const articles: Omit<Article, "id">[] = [
      {
        title: "TypeScript 入门指南",
        content: "# TypeScript 入门\n\nTypeScript 是 JavaScript 的超集...",
        author: "1",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        tags: ["typescript", "javascript", "programming"],
        status: "published",
      },
      {
        title: "Deno 简介",
        content: "# Deno 简介\n\nDeno 是一个现代化的 JavaScript/TypeScript 运行时...",
        author: "1",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
        tags: ["deno", "typescript", "runtime"],
        status: "published",
      },
      {
        title: "Web 开发最佳实践",
        content: "# Web 开发最佳实践\n\n本文介绍 Web 开发中的一些最佳实践...",
        author: "2",
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01"),
        tags: ["web", "development", "best-practices"],
        status: "published",
      },
    ];

    for (const article of articles) {
      const id = String(this.nextId++);
      this.articles.set(id, { ...article, id });
    }
  }

  /**
   * 获取所有文章
   */
  getArticles(params: PaginationParams & { status?: string; tag?: string }): PaginatedResult<Article> {
    let articles = Array.from(this.articles.values());

    // 过滤状态
    if (params.status) {
      articles = articles.filter((a) => a.status === params.status);
    }

    // 过滤标签
    if (params.tag) {
      articles = articles.filter((a) => a.tags.includes(params.tag!));
    }

    // 排序（按创建时间倒序）
    articles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 分页
    const total = articles.length;
    const start = (params.page - 1) * params.limit;
    const end = start + params.limit;
    const data = articles.slice(start, end);

    return {
      data,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  /**
   * 获取单个文章
   */
  getArticle(id: string): Article | undefined {
    return this.articles.get(id);
  }

  /**
   * 创建文章
   */
  createArticle(data: CreateArticleRequest, authorId: string): Article {
    const id = String(this.nextId++);
    const now = new Date();

    const article: Article = {
      id,
      title: data.title,
      content: data.content,
      author: authorId,
      createdAt: now,
      updatedAt: now,
      tags: data.tags ?? [],
      status: data.status ?? "draft",
    };

    this.articles.set(id, article);
    return article;
  }

  /**
   * 更新文章
   */
  updateArticle(id: string, data: UpdateArticleRequest): Article | undefined {
    const article = this.articles.get(id);
    if (!article) return undefined;

    const updated: Article = {
      ...article,
      ...data,
      updatedAt: new Date(),
    };

    this.articles.set(id, updated);
    return updated;
  }

  /**
   * 删除文章
   */
  deleteArticle(id: string): boolean {
    return this.articles.delete(id);
  }

  /**
   * 获取用户
   */
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  /**
   * 根据用户名获取用户
   */
  getUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }
}

// ============================================================================
// 路由处理器
// ============================================================================

/**
 * 创建 API 响应
 */
function apiResponse<T>(data: T, message?: string): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return jsonResponse(body);
}

/**
 * 创建 API 错误响应
 */
function apiError(error: string, status = 400): Response {
  const body: ApiResponse = {
    success: false,
    error,
  };
  return jsonResponse(body, status);
}

/**
 * 解析分页参数
 */
function parsePagination(params: Record<string, string>): PaginationParams {
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(params.limit ?? "10", 10)));
  return { page, limit };
}

// ============================================================================
// 路由定义
// ============================================================================

/**
 * 创建 API 路由器
 *
 * TypeScript 优势：使用类型安全的路由定义
 */
export function createApiRouter(db: InMemoryDatabase): Router {
  const router = new Router();

  // ----- 文章路由 -----

  // 获取文章列表
  router.get("/api/articles", (_request, params) => {
    const pagination = parsePagination(params.query);
    const status = params.query.status;
    const tag = params.query.tag;

    const result = db.getArticles({ ...pagination, status, tag });
    return apiResponse(result);
  });

  // 获取单个文章
  router.get("/api/articles/:id", (_request, params) => {
    const article = db.getArticle(params.path.id);

    if (!article) {
      return apiError("Article not found", 404);
    }

    return apiResponse(article);
  });

  // 创建文章
  router.post("/api/articles", async (request, params) => {
    const body = params.body as CreateArticleRequest;

    if (!body?.title || !body.content) {
      return apiError("Title and content are required");
    }

    // 从请求头获取用户 ID（由认证中间件设置）
    const userId = request.headers.get("x-user-id") ?? "1";

    const article = db.createArticle(body, userId);
    return apiResponse(article, "Article created successfully");
  });

  // 更新文章
  router.put("/api/articles/:id", async (_request, params) => {
    const body = params.body as UpdateArticleRequest;
    const article = db.updateArticle(params.path.id, body);

    if (!article) {
      return apiError("Article not found", 404);
    }

    return apiResponse(article, "Article updated successfully");
  });

  // 删除文章
  router.delete("/api/articles/:id", (_request, params) => {
    const deleted = db.deleteArticle(params.path.id);

    if (!deleted) {
      return apiError("Article not found", 404);
    }

    return apiResponse(null, "Article deleted successfully");
  });

  // ----- 用户路由 -----

  // 获取用户信息
  router.get("/api/users/:id", (_request, params) => {
    const user = db.getUser(params.path.id);

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiResponse(user);
  });

  // ----- 搜索路由 -----

  // 搜索文章
  router.get("/api/search", (_request, params) => {
    const query = params.query.q ?? "";
    const pagination = parsePagination(params.query);

    const result = db.getArticles({
      ...pagination,
      status: "published",
    });

    // 简单的搜索过滤
    const filtered = {
      ...result,
      data: result.data.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.content.toLowerCase().includes(query.toLowerCase()),
      ),
    };

    return apiResponse(filtered);
  });

  // ----- 标签路由 -----

  // 获取所有标签
  router.get("/api/tags", (_request, _params) => {
    const result = db.getArticles({ page: 1, limit: 1000, status: "published" });
    const tagSet = new Set<string>();

    for (const article of result.data) {
      for (const tag of article.tags) {
        tagSet.add(tag);
      }
    }

    return apiResponse(Array.from(tagSet));
  });

  return router;
}

/**
 * 创建页面路由
 */
export function createPageRouter(db: InMemoryDatabase, templateDir: string): Router {
  const router = new Router();

  // 简单的模板渲染函数
  const renderTemplate = async (name: string, context: Record<string, unknown> = {}): Promise<string> => {
    try {
      let template = await Deno.readTextFile(`${templateDir}/${name}`);

      // 替换变量
      template = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const value = context[key];
        return value !== undefined ? String(value) : "";
      });

      return template;
    } catch {
      return `<h1>Template not found: ${name}</h1>`;
    }
  };

  // 首页
  router.get("/", async (_request, _params) => {
    const articles = db.getArticles({ page: 1, limit: 10, status: "published" });

    const articleList = articles.data
      .map(
        (article) => `
      <article>
        <h2><a href="/articles/${article.id}">${article.title}</a></h2>
        <p class="meta">作者: ${article.author} | 发布时间: ${article.createdAt.toISOString().slice(0, 10)}</p>
        <p class="tags">标签: ${article.tags.join(", ")}</p>
      </article>
    `,
      )
      .join("\n");

    const html = await renderTemplate("index.html", {
      title: "首页",
      articles: articleList,
      totalArticles: articles.total,
    });

    return htmlResponse(html);
  });

  // 文章详情页
  router.get("/articles/:id", async (_request, params) => {
    const article = db.getArticle(params.path.id);

    if (!article) {
      return htmlResponse("<h1>文章不存在</h1>", 404);
    }

    const html = await renderTemplate("article.html", {
      title: article.title,
      content: article.content,
      author: article.author,
      createdAt: article.createdAt.toISOString().slice(0, 10),
      tags: article.tags.join(", "),
    });

    return htmlResponse(html);
  });

  // 文章列表页
  router.get("/articles", async (_request, params) => {
    const pagination = parsePagination(params.query);
    const articles = db.getArticles({ ...pagination, status: "published" });

    const articleList = articles.data
      .map(
        (article) => `
      <tr>
        <td><a href="/articles/${article.id}">${article.title}</a></td>
        <td>${article.author}</td>
        <td>${article.createdAt.toISOString().slice(0, 10)}</td>
        <td>${article.tags.join(", ")}</td>
      </tr>
    `,
      )
      .join("\n");

    const html = await renderTemplate("articles.html", {
      title: "文章列表",
      articles: articleList,
      page: String(articles.page),
      totalPages: String(articles.totalPages),
    });

    return htmlResponse(html);
  });

  // 404 页面
  router.get("/404", async (_request, _params) => {
    const html = await renderTemplate("404.html", { title: "页面不存在" });
    return htmlResponse(html, 404);
  });

  return router;
}

// ============================================================================
// 导出
// ============================================================================

export { InMemoryDatabase };
export type {
  Article,
  CreateArticleRequest,
  UpdateArticleRequest,
  PaginationParams,
  PaginatedResult,
  ApiResponse,
};
