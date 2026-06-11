# TypeScript 学习路径 - 从入门到精通

[English](README.md) | [简体中文](README_zh.md)

---

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Deno](https://img.shields.io/badge/Deno-2.x-70FFAF?logo=deno&logoColor=black)](https://deno.land/)

> 一套全面的 TypeScript 学习路径，包含 12 个递进式项目，基于 Deno 运行时构建。从基础类型到高级模式，涵盖本地应用和 Web 开发。

## ⚠️ AI 生成内容声明

**本项目的文档和代码示例由 AI（人工智能）生成，仅供参考。** 虽然已尽力确保准确性，但在生产环境中使用前请进行验证。代码示例专为教育目的设计，实际应用中可能需要调整。

## 目录

- [简介](#简介)
- [学习路径概览](#学习路径概览)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [学习阶段](#学习阶段)
- [TypeScript 与 JavaScript 对比](#typescript-与-javascript-对比)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 简介

本项目提供了一条结构化的 TypeScript 学习路径，通过实践项目来掌握 TypeScript。每个项目都旨在教授特定的 TypeScript 概念，同时使用 Deno 作为运行时环境构建实际应用。

### 为什么选择 TypeScript？

TypeScript 是 JavaScript 的超集，添加了静态类型检查和高级特性：

- **静态类型系统** — 在编译时捕获错误，而非运行时
- **更好的 IDE 支持** — 自动补全、重构和导航
- **代码可维护性** — 类型即文档
- **渐进式采用** — 可以逐步添加到现有 JavaScript 项目

### 为什么选择 Deno？

Deno 是一个现代化的 JavaScript/TypeScript 运行时，内置安全性和工具链：

- **原生 TypeScript 支持** — 无需编译步骤
- **默认安全** — 显式权限模型
- **现代化工具链** — 内置测试运行器、格式化器和代码检查器
- **Web 标准** — 使用 Web 标准 API
- **基于 URL 的导入** — 无需 node_modules

## 学习路径概览

学习路径包含 **12 个项目**，分为 **4 个阶段**：

### 阶段一：基础入门（项目 1-3）

| 项目 | 主题 | 核心概念 |
|------|------|----------|
| 01-basics | 基本类型 | string, number, boolean, array, tuple, enum, any, void, null, undefined, never, unknown |
| 02-interfaces | 接口与类型 | 接口定义、类型别名、可选/只读属性、函数类型 |
| 03-classes | 面向对象编程 | 类定义、继承、访问修饰符、抽象类、静态成员 |

### 阶段二：进阶特性（项目 4-6）

| 项目 | 主题 | 核心概念 |
|------|------|----------|
| 04-generics | 泛型编程 | 泛型函数、接口、类、约束、工具类型 |
| 05-advanced-types | 高级类型 | 联合类型、交叉类型、类型守卫、可辨识联合 |
| 06-modules | 模块系统 | ES 模块、导入导出、命名空间、模块解析 |

### 阶段三：高级特性（项目 7-9）

| 项目 | 主题 | 核心概念 |
|------|------|----------|
| 07-async | 异步编程 | Promise、async/await、异步迭代器、生成器 |
| 08-error-testing | 错误处理与测试 | 自定义错误、Deno 测试框架、断言库 |
| 09-decorators | 装饰器与元数据 | 类/方法/属性装饰器、装饰器工厂 |

### 阶段四：实战项目（项目 10-12）

| 项目 | 类型 | 描述 |
|------|------|------|
| 10-cli-tool | 本地应用 | 命令行参数解析、用户交互、输出格式化 |
| 11-file-processing | 本地应用 | 文件系统操作、流处理、数据转换 |
| 12-web-app | Web 应用 | HTTP 服务器、路由、中间件、模板引擎 |

## 环境要求

| 依赖 | 版本 | 是否必需 |
|------|------|----------|
| Deno  | >= 2.0 | 是 |

### 安装 Deno

```bash
# Windows (PowerShell)
iwr https://deno.land/install.ps1 -useb | iex

# macOS / Linux
curl -fsSL https://deno.land/install.sh | sh
```

### 验证安装

```bash
deno --version
```

预期输出：
```
deno 2.x.x (release, x86_64-pc-windows-msvc)
v8 14.x.x
typescript 5.x.x
```

## 快速开始

### 克隆仓库

```bash
git clone <仓库地址>
cd typescript-learn
```

### 运行项目示例

```bash
# 进入项目目录
cd docs/projects/01-basics

# 运行示例
deno run main.ts

# 运行并授予所有权限
deno run --allow-all main.ts
```

### 运行测试

```bash
# 运行特定项目的测试
cd docs/projects/08-error-testing
deno test tests.ts
```

### 启动文档服务器

```bash
# 在项目根目录执行
mkdocs serve

# 在浏览器中打开 http://localhost:8000
```

## 项目结构

```
typescript-learn/
├── mkdocs.yml                    # MkDocs 配置文件
├── LICENSE                       # GPL v3 许可证
├── README.md                     # 英文文档
├── README_zh.md                  # 中文文档（本文件）
├── docs/                         # 文档和源代码
│   ├── index.md                  # 文档首页
│   ├── learning-path/            # 学习路径指南
│   │   ├── index.md              # 概述
│   │   ├── environment-setup.md  # 环境配置指南
│   │   └── learning-tips.md      # 学习建议
│   ├── projects/                 # 12 个学习项目
│   │   ├── 01-basics/            # 基本类型和函数
│   │   ├── 02-interfaces/        # 接口和类型别名
│   │   ├── 03-classes/           # 类和面向对象
│   │   ├── 04-generics/          # 泛型编程
│   │   ├── 05-advanced-types/    # 高级类型系统
│   │   ├── 06-modules/           # 模块系统
│   │   ├── 07-async/             # 异步编程
│   │   ├── 08-error-testing/     # 错误处理和测试
│   │   ├── 09-decorators/        # 装饰器和元数据
│   │   ├── 10-cli-tool/          # CLI 工具项目
│   │   ├── 11-file-processing/   # 文件处理项目
│   │   └── 12-web-app/           # Web 应用项目
│   └── typescript-vs-javascript/ # TS 与 JS 对比
└── site/                         # 构建后的文档（静态文件）
```

## 学习阶段

### 阶段一：基础入门

**项目 1-3** 涵盖 TypeScript 核心基础：

- **01-basics** — 学习 TypeScript 类型系统、变量声明和函数定义
- **02-interfaces** — 掌握接口设计、类型别名和对象结构契约
- **03-classes** — 理解 TypeScript 类的面向对象编程

### 阶段二：进阶特性

**项目 4-6** 介绍 TypeScript 的强大特性：

- **04-generics** — 使用泛型创建可复用的类型安全组件
- **05-advanced-types** — 使用联合类型、交叉类型和类型守卫
- **06-modules** — 使用 ES 模块和命名空间组织代码

### 阶段三：高级特性

**项目 7-9** 涵盖高级 TypeScript 模式：

- **07-async** — 掌握 Promise 和 async/await 异步编程
- **08-error-testing** — 实现正确的错误处理并编写测试
- **09-decorators** — 使用装饰器进行元编程

### 阶段四：实战项目

**项目 10-12** 将知识应用于实际项目：

- **10-cli-tool** — 构建带参数解析的命令行工具
- **11-file-processing** — 使用流和转换处理文件
- **12-web-app** — 创建带路由和中间件的 Web 服务器

## TypeScript 与 JavaScript 对比

本项目包含 TypeScript 和 JavaScript 的详细对比：

- **类型系统** — 静态类型 vs 动态类型、类型注解、类型推断
- **高级特性** — 接口、泛型、装饰器、枚举
- **开发体验** — IDE 支持、错误检测、代码文档

详见 `docs/typescript-vs-javascript/` 目录获取全面对比。

## 贡献指南

欢迎贡献！请随时提交拉取请求（Pull Request）。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '添加一些很棒的特性'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 许可证

本项目基于 GNU 通用公共许可证 v3.0 授权 - 详情请参阅 [LICENSE](LICENSE) 文件。

这意味着您可以自由地：
- 将软件用于任何目的
- 研究软件的工作原理并进行修改
- 重新分发软件
- 分发软件的修改版本

但需满足以下条件：
- 分发时必须包含相同的许可证
- 必须声明对软件所做的更改
- 必须提供完整的源代码

---

**注意：** 本文档及所有代码示例均由 AI 生成，仅供教育目的。请在生产环境中使用前进行充分验证和测试。
