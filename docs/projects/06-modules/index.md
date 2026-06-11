# TypeScript 模块和命名空间

## 目录
1. [ES模块系统](#es模块系统)
2. [导入导出语法](#导入导出语法)
3. [默认导出和命名导出](#默认导出和命名导出)
4. [模块解析策略](#模块解析策略)
5. [命名空间（Namespaces）](#命名空间namespaces)
6. [模块声明（declare module）](#模块声明declare-module)
7. [三斜线指令](#三斜线指令)
8. [示例代码说明](#示例代码说明)
9. [练习题](#练习题)

## ES模块系统

### 什么是模块？

模块是代码组织的基本单元，它将代码分割成独立的、可重用的部分。每个模块都有自己的作用域，不会污染全局命名空间。

### TypeScript模块系统

TypeScript支持两种模块系统：
1. **ES模块**（ES Modules）：现代JavaScript标准
2. **命名空间**（Namespaces）：TypeScript特有的组织方式

### ES模块的优势

```typescript
// ES模块的优势
// 1. 静态分析：编译时确定依赖关系
// 2. 树摇优化：删除未使用的代码
// 3. 作用域隔离：避免全局污染
// 4. 异步加载：支持动态导入
```

### TypeScript与JavaScript的模块区别

| 特性 | JavaScript | TypeScript |
|------|------------|------------|
| 模块系统 | ES模块、CommonJS、AMD | ES模块、命名空间 |
| 类型导出 | 不支持 | 支持接口、类型、枚举 |
| 模块声明 | 不支持 | 支持declare module |
| 三斜线指令 | 不支持 | 支持 |
| 命名空间 | 不支持 | 支持 |

## 导入导出语法

### 基本导出语法

```typescript
// 命名导出
export const PI = 3.14159;
export function add(a: number, b: number): number {
    return a + b;
}
export interface User {
    id: number;
    name: string;
}
export type Status = "active" | "inactive";
export enum Color {
    Red = "red",
    Green = "green",
    Blue = "blue"
}

// 导出声明
const MAX_SIZE = 100;
export { MAX_SIZE };

// 重命名导出
export { add as sum };
```

### 基本导入语法

```typescript
// 命名导入
import { PI, add, User } from "./math";

// 重命名导入
import { add as sum } from "./math";

// 导入整个模块
import * as MathUtils from "./math";

// 默认导入
import Logger from "./logger";

// 混合导入
import Logger, { LogLevel } from "./logger";

// 仅导入副作用
import "./setup";

// 动态导入
const module = await import("./dynamic-module");
```

### 导出默认值

```typescript
// 默认导出
export default class Logger {
    log(message: string): void {
        console.log(message);
    }
}

// 或者
class Logger {
    log(message: string): void {
        console.log(message);
    }
}
export default Logger;

// 默认导出函数
export default function createLogger(): Logger {
    return new Logger();
}

// 默认导出值
export default 42;
export default "Hello";
export default { key: "value" };
```

## 默认导出和命名导出

### 默认导出

每个模块只能有一个默认导出：

```typescript
// logger.ts
export default class Logger {
    private name: string;
    
    constructor(name: string) {
        this.name = name;
    }
    
    log(message: string): void {
        console.log(`[${this.name}] ${message}`);
    }
}

// 导入默认导出
import Logger from "./logger";
const logger = new Logger("App");
logger.log("Hello");
```

### 命名导出

模块可以有多个命名导出：

```typescript
// math.ts
export const PI = 3.14159;
export const E = 2.71828;

export function add(a: number, b: number): number {
    return a + b;
}

export function subtract(a: number, b: number): number {
    return a - b;
}

export interface MathResult {
    value: number;
    operation: string;
}

// 导入命名导出
import { PI, add, MathResult } from "./math";
console.log(PI);
console.log(add(1, 2));
```

### 混合使用

```typescript
// utils.ts
export default function formatDate(date: Date): string {
    return date.toISOString();
}

export function parseDate(dateString: string): Date {
    return new Date(dateString);
}

export function isDateValid(date: Date): boolean {
    return !isNaN(date.getTime());
}

// 导入混合导出
import formatDate, { parseDate, isDateValid } from "./utils";
```

### 重导出

```typescript
// re-export.ts
// 重导出其他模块的内容
export { default as Logger } from "./logger";
export { PI, add } from "./math";

// 重导出整个模块
export * from "./math";
export * from "./logger";

// 重导出并重命名
export { add as sum, subtract as difference } from "./math";
```

## 模块解析策略

### 模块解析策略

TypeScript支持两种模块解析策略：
1. **Node**：模拟Node.js的模块解析
2. **Classic**：TypeScript传统的模块解析（不推荐）

### Node模块解析

```typescript
// 相对路径导入
import { add } from "./math";
import { Logger } from "../utils/logger";
import { Config } from "../../config";

// 非相对路径导入（从node_modules）
import express from "express";
import lodash from "lodash";

// TypeScript文件扩展名
import { add } from "./math.ts";  // Deno支持
import { add } from "./math.js";  // Node.js风格
import { add } from "./math";     // 自动解析
```

### 路径映射

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@utils/*": ["src/utils/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

```typescript
// 使用路径映射
import { add } from "@/utils/math";
import { Logger } from "@utils/logger";
import { Button } from "@components/Button";
```

### Deno模块解析

```typescript
// Deno支持URL导入
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";

// Deno支持npm包
import express from "npm:express@4.18.2";

// Deno支持相对路径
import { add } from "./math.ts";
```

## 命名空间（Namespaces）

### 什么是命名空间？

命名空间是TypeScript特有的代码组织方式，用于将相关的代码分组到一个逻辑单元中。

### 基本命名空间

```typescript
// 基本命名空间
namespace Validation {
    export interface Validator {
        validate(value: string): boolean;
    }
    
    export class EmailValidator implements Validator {
        validate(value: string): boolean {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
    }
    
    export class UrlValidator implements Validator {
        validate(value: string): boolean {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        }
    }
}

// 使用命名空间
const emailValidator = new Validation.EmailValidator();
const urlValidator = new Validation.UrlValidator();

console.log(emailValidator.validate("test@example.com"));  // true
console.log(urlValidator.validate("https://example.com"));  // true
```

### 嵌套命名空间

```typescript
// 嵌套命名空间
namespace App {
    export namespace Models {
        export interface User {
            id: number;
            name: string;
        }
        
        export interface Product {
            id: number;
            name: string;
            price: number;
        }
    }
    
    export namespace Services {
        export class UserService {
            getUsers(): Models.User[] {
                return [];
            }
        }
        
        export class ProductService {
            getProducts(): Models.Product[] {
                return [];
            }
        }
    }
}

// 使用嵌套命名空间
const userService = new App.Services.UserService();
const users = userService.getUsers();
```

### 命名空间与模块的区别

```typescript
// 命名空间（不推荐用于现代项目）
namespace MathUtils {
    export function add(a: number, b: number): number {
        return a + b;
    }
    
    export function subtract(a: number, b: number): number {
        return a - b;
    }
}

// ES模块（推荐）
export function add(a: number, b: number): number {
    return a + b;
}

export function subtract(a: number, b: number): number {
    return a - b;
}
```

### 命名空间合并

```typescript
// 命名空间可以跨文件合并
// validation.ts
namespace Validation {
    export interface Validator {
        validate(value: string): boolean;
    }
}

// email-validator.ts
namespace Validation {
    export class EmailValidator implements Validator {
        validate(value: string): boolean {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
    }
}

// url-validator.ts
namespace Validation {
    export class UrlValidator implements Validator {
        validate(value: string): boolean {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        }
    }
}

// 使用合并后的命名空间
const emailValidator = new Validation.EmailValidator();
const urlValidator = new Validation.UrlValidator();
```

## 模块声明（declare module）

### 什么是模块声明？

模块声明用于为没有类型定义的JavaScript模块提供类型信息。

### 基本模块声明

```typescript
// 为JavaScript模块声明类型
declare module "some-js-module" {
    export function doSomething(value: string): void;
    export function doSomethingElse(value: number): string;
    export const VERSION: string;
}

// 使用声明的模块
import { doSomething, VERSION } from "some-js-module";
doSomething("hello");
console.log(VERSION);
```

### 声明带有默认导出的模块

```typescript
// 声明带有默认导出的模块
declare module "some-other-module" {
    interface Options {
        debug: boolean;
        timeout: number;
    }
    
    export default function createApp(options: Options): App;
    export class App {
        start(): void;
        stop(): void;
    }
}

// 使用声明的模块
import createApp from "some-other-module";
const app = createApp({ debug: true, timeout: 5000 });
app.start();
```

### 声明CSS模块

```typescript
// 声明CSS模块
declare module "*.css" {
    const classes: { [key: string]: string };
    export default classes;
}

declare module "*.scss" {
    const classes: { [key: string]: string };
    export default classes;
}

// 使用CSS模块
import styles from "./App.css";
console.log(styles.container);  // "container_abc123"
```

### 声明图片模块

```typescript
// 声明图片模块
declare module "*.png" {
    const value: string;
    export default value;
}

declare module "*.jpg" {
    const value: string;
    export default value;
}

declare module "*.svg" {
    const value: string;
    export default value;
}

// 使用图片模块
import logo from "./logo.png";
console.log(logo);  // "/assets/logo.png"
```

## 三斜线指令

### 什么是三斜线指令？

三斜线指令是TypeScript特有的指令，用于声明文件间的依赖关系。它们以`///`开头。

### 基本三斜线指令

```typescript
/// <reference path="./types.d.ts" />
/// <reference types="node" />
/// <reference lib="es2015.promise" />
```

### path指令

```typescript
/// <reference path="./utils.d.ts" />

// 这告诉编译器当前文件依赖于utils.d.ts
// 编译器会确保utils.d.ts在编译当前文件之前被处理
```

### types指令

```typescript
/// <reference types="node" />

// 这告诉编译器当前文件使用Node.js类型
// 编译器会自动包含@types/node中的类型定义
```

### lib指令

```typescript
/// <reference lib="es2015.promise" />

// 这告诉编译器当前文件需要ES2015 Promise库
// 编译器会包含相应的lib文件
```

### 三斜线指令的实际应用

```typescript
// types.d.ts
interface User {
    id: number;
    name: string;
    email: string;
}

interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

// api.ts
/// <reference path="./types.d.ts" />

function fetchUser(id: number): Promise<ApiResponse<User>> {
    return fetch(`/api/users/${id}`)
        .then(response => response.json());
}

// 使用三斜线指令引用的类型
const userPromise = fetchUser(1);
```

## 示例代码说明

本项目包含以下示例代码文件：

1. **math.ts** - 数学工具模块示例
2. **logger.ts** - 日志模块示例
3. **main.ts** - 导入使用示例

### 运行示例

```bash
# 运行主模块
deno run main.ts

# 运行数学模块测试
deno run --allow-read --allow-write math.ts

# 运行日志模块测试
deno run --allow-read --allow-write logger.ts
```

## 练习题

### 练习1：基本模块创建

创建一个工具模块 `utils.ts`，包含以下功能：

```typescript
// utils.ts
// 1. 导出一个格式化日期的函数
export function formatDate(date: Date): string {
    // 你的实现
}

// 2. 导出一个验证邮箱的函数
export function isValidEmail(email: string): boolean {
    // 你的实现
}

// 3. 导出一个生成随机ID的函数
export function generateId(): string {
    // 你的实现
}

// 4. 导出一个深拷贝函数
export function deepClone<T>(obj: T): T {
    // 你的实现
}
```

### 练习2：默认导出和命名导出

创建一个配置模块 `config.ts`，同时使用默认导出和命名导出：

```typescript
// config.ts
// 1. 创建一个默认导出的配置对象
export default {
    apiUrl: "https://api.example.com",
    timeout: 5000,
    retryAttempts: 3
};

// 2. 创建命名导出的配置函数
export function getApiUrl(): string {
    // 你的实现
}

export function getTimeout(): number {
    // 你的实现
}

// 3. 创建命名导出的配置验证函数
export function validateConfig(config: any): boolean {
    // 你的实现
}
```

### 练习3：命名空间实现

创建一个验证命名空间 `Validation`，包含不同类型的验证器：

```typescript
// validation.ts
namespace Validation {
    // 1. 创建验证器接口
    export interface Validator {
        validate(value: string): ValidationResult;
    }
    
    // 2. 创建验证结果接口
    export interface ValidationResult {
        valid: boolean;
        errors: string[];
    }
    
    // 3. 创建邮箱验证器
    export class EmailValidator implements Validator {
        // 你的实现
    }
    
    // 4. 创建URL验证器
    export class UrlValidator implements Validator {
        // 你的实现
    }
    
    // 5. 创建密码强度验证器
    export class PasswordValidator implements Validator {
        // 你的实现
    }
}
```

### 练习4：模块声明

为以下JavaScript模块创建类型声明：

```typescript
// types/some-library.d.ts
declare module "some-library" {
    // 1. 声明配置接口
    interface Options {
        // 你的实现
    }
    
    // 2. 声明主类
    export class Library {
        constructor(options: Options);
        // 你的实现
    }
    
    // 3. 声明工具函数
    export function helper(): void;
    
    // 4. 声明常量
    export const VERSION: string;
}
```

### 练习5：模块组合

创建一个完整的模块系统，包含多个相互依赖的模块：

```typescript
// models/user.ts
export interface User {
    id: number;
    name: string;
    email: string;
}

// services/user-service.ts
import { User } from "../models/user";

export class UserService {
    // 你的实现
}

// controllers/user-controller.ts
import { UserService } from "../services/user-service";
import { User } from "../models/user";

export class UserController {
    // 你的实现
}

// main.ts
import { UserController } from "./controllers/user-controller";

// 你的实现
```

## 最佳实践

### 模块组织

```typescript
// 推荐的文件结构
src/
├── models/          # 数据模型
│   ├── user.ts
│   └── product.ts
├── services/        # 业务逻辑
│   ├── user-service.ts
│   └── product-service.ts
├── controllers/     # 控制器
│   ├── user-controller.ts
│   └── product-controller.ts
├── utils/           # 工具函数
│   ├── validation.ts
│   └── formatting.ts
└── types/           # 类型定义
    ├── index.ts
    └── api.d.ts
```

### 导入导出最佳实践

```typescript
// 1. 使用命名导出而不是默认导出（更容易重构）
export function add(a: number, b: number): number {
    return a + b;
}

// 2. 使用重导出组织模块
export * from "./models/user";
export * from "./services/user-service";

// 3. 避免循环依赖
// A.ts -> B.ts -> A.ts  // 不推荐

// 4. 使用类型导入优化性能
import type { User } from "./models/user";
import { UserService } from "./services/user-service";
```

### 命名空间使用场景

```typescript
// 1. 为全局库添加类型
declare global {
    interface Window {
        myCustomProperty: string;
    }
}

// 2. 扩展第三方库类型
declare module "express" {
    interface Request {
        user?: User;
    }
}

// 3. 组织相关的类型定义
namespace API {
    export namespace Users {
        export interface Response {
            data: User[];
            total: number;
        }
    }
    
    export namespace Products {
        export interface Response {
            data: Product[];
            total: number;
        }
    }
}
```

## 总结

模块和命名空间是TypeScript代码组织的核心特性：

1. **ES模块**：现代JavaScript标准，推荐用于所有新项目
2. **导入导出语法**：灵活的导入导出方式，支持重命名、重导出等
3. **默认导出和命名导出**：根据模块的用途选择合适的导出方式
4. **模块解析策略**：理解不同的模块解析方式，确保正确导入
5. **命名空间**：TypeScript特有的组织方式，主要用于类型声明
6. **模块声明**：为没有类型定义的JavaScript模块提供类型信息
7. **三斜线指令**：声明文件间的依赖关系

掌握这些模块系统特性对于构建大型、可维护的TypeScript应用程序至关重要。

## 下一步

- 学习 [泛型编程](../04-generics/)
- 了解 [高级类型](../05-advanced-types/)
- 探索 [异步编程](../07-async/)


---

## 项目导航

[上一个项目：高级类型](/projects/05-advanced-types/)

[下一个项目：异步编程](/projects/07-async/)

[返回学习路径](/learning-path/)
