# 项目8：错误处理和测试

## 概述

错误处理和测试是软件开发中至关重要的环节。本项目深入探讨 TypeScript 中的错误处理机制和 Deno 的测试框架，帮助你编写健壮、可维护的代码。TypeScript 的类型系统为错误处理提供了额外的安全性，而 Deno 的内置测试框架使得测试变得简单而强大。

## TypeScript 错误处理的优势

TypeScript 为错误处理提供了以下优势：

1. **类型化的错误处理**：可以指定错误的类型
2. **编译时错误检查**：在编译时捕获潜在的错误
3. **接口定义错误结构**：定义错误的形状和属性
4. **泛型错误处理**：创建通用的错误处理模式
5. **更好的 IDE 支持**：自动补全错误属性和方法

## 1. 错误类型：Error, RangeError, TypeError 等

### 内置错误类型

TypeScript 继承了 JavaScript 的所有内置错误类型：

```typescript
// 基础错误类型
const error = new Error("基础错误");
console.log(error.message); // "基础错误"
console.log(error.name);    // "Error"
console.log(error.stack);   // 错误堆栈

// 范围错误
const rangeError = new RangeError("数值超出范围");
console.log(rangeError instanceof RangeError); // true
console.log(rangeError instanceof Error);      // true

// 类型错误
const typeError = new TypeError("类型不匹配");
console.log(typeError instanceof TypeError); // true

// 引用错误
const referenceError = new ReferenceError("变量未定义");
console.log(referenceError instanceof ReferenceError); // true

// 语法错误
const syntaxError = new SyntaxError("语法错误");
console.log(syntaxError instanceof SyntaxError); // true
```

### TypeScript 错误类型层次结构

```
Error
├── EvalError
├── RangeError
├── ReferenceError
├── SyntaxError
├── TypeError
├── URIError
├── AggregateError (ES2021)
└── 自定义错误类
```

### 错误属性

```typescript
interface Error {
  name: string;      // 错误名称
  message: string;   // 错误消息
  stack?: string;    // 错误堆栈（非标准，但广泛支持）
  cause?: unknown;   // 错误原因（ES2022）
}

// 使用 cause 属性
try {
  try {
    throw new Error("原始错误");
  } catch (originalError) {
    throw new Error("包装错误", { cause: originalError });
  }
} catch (error) {
  console.log(error.message); // "包装错误"
  console.log((error as Error).cause); // Error: 原始错误
}
```

## 2. 自定义错误类

### 基础自定义错误类

```typescript
// 自定义错误基类
class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly timestamp: Date;
  
  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    cause?: Error
  ) {
    super(message, { cause });
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();
    
    // 修复原型链
    Object.setPrototypeOf(this, AppError.prototype);
  }
  
  // 转换为JSON格式
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

// 使用自定义错误
const error = new AppError("用户未找到", "USER_NOT_FOUND", 404);
console.log(error.toJSON());
```

### 特定领域错误类

```typescript
// 验证错误
class ValidationError extends AppError {
  public readonly field: string;
  public readonly value: any;
  public readonly constraint: string;
  
  constructor(
    field: string,
    value: any,
    constraint: string,
    message?: string
  ) {
    super(
      message || `验证失败: ${field} - ${constraint}`,
      "VALIDATION_ERROR",
      400
    );
    this.name = "ValidationError";
    this.field = field;
    this.value = value;
    this.constraint = constraint;
  }
}

// 数据库错误
class DatabaseError extends AppError {
  public readonly query: string;
  public readonly params: any[];
  
  constructor(
    query: string,
    params: any[],
    message: string = "数据库操作失败"
  ) {
    super(message, "DATABASE_ERROR", 500);
    this.name = "DatabaseError";
    this.query = query;
    this.params = params;
  }
}

// 认证错误
class AuthenticationError extends AppError {
  public readonly userId?: string;
  
  constructor(
    message: string = "认证失败",
    userId?: string
  ) {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
    this.userId = userId;
  }
}

// 授权错误
class AuthorizationError extends AppError {
  public readonly requiredPermission: string;
  
  constructor(
    requiredPermission: string,
    message: string = "权限不足"
  ) {
    super(message, "AUTHORIZATION_ERROR", 403);
    this.name = "AuthorizationError";
    this.requiredPermission = requiredPermission;
  }
}
```

### 错误工厂模式

```typescript
// 错误工厂
class ErrorFactory {
  static createUserNotFoundError(userId: string): AppError {
    return new AppError(
      `用户 ${userId} 未找到`,
      "USER_NOT_FOUND",
      404
    );
  }
  
  static createValidationError(field: string, value: any, constraint: string): ValidationError {
    return new ValidationError(field, value, constraint);
  }
  
  static createDatabaseError(query: string, params: any[], originalError?: Error): DatabaseError {
    return new DatabaseError(query, params, originalError?.message);
  }
  
  static createAuthenticationError(userId?: string): AuthenticationError {
    return new AuthenticationError("认证失败", userId);
  }
  
  static createAuthorizationError(permission: string): AuthorizationError {
    return new AuthorizationError(permission);
  }
}

// 使用错误工厂
const userError = ErrorFactory.createUserNotFoundError("123");
const validationError = ErrorFactory.createValidationError("email", "invalid", "必须是有效的邮箱地址");
```

## 3. try/catch/finally

### 基础错误处理

```typescript
// 基础 try/catch
function divide(a: number, b: number): number {
  try {
    if (b === 0) {
      throw new Error("除数不能为零");
    }
    return a / b;
  } catch (error) {
    console.error("除法错误:", (error as Error).message);
    return 0;
  }
}

// try/catch/finally
function processFile(filePath: string): string | null {
  let file: Deno.FsFile | null = null;
  
  try {
    file = Deno.openSync(filePath);
    const content = Deno.readTextFileSync(filePath);
    return content;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error("文件不存在:", filePath);
    } else if (error instanceof Deno.errors.PermissionDenied) {
      console.error("权限不足:", filePath);
    } else {
      console.error("读取文件失败:", (error as Error).message);
    }
    return null;
  } finally {
    // 确保文件被关闭
    if (file) {
      file.close();
    }
    console.log("文件处理完成");
  }
}
```

### 类型化的错误处理

```typescript
// 类型化的错误处理
function parseJSON<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("JSON 语法错误:", error.message);
    } else {
      console.error("未知错误:", error);
    }
    return null;
  }
}

// 使用类型守卫
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

function handleError(error: unknown): void {
  if (isAppError(error)) {
    console.error(`应用错误 [${error.code}]:`, error.message);
    console.error("状态码:", error.statusCode);
  } else if (isError(error)) {
    console.error("系统错误:", error.message);
  } else {
    console.error("未知错误:", error);
  }
}
```

### 错误边界模式

```typescript
// 错误边界类
class ErrorBoundary {
  private static handlers: Map<string, (error: Error) => void> = new Map();
  
  static register(errorType: string, handler: (error: Error) => void): void {
    this.handlers.set(errorType, handler);
  }
  
  static async execute<T>(
    operation: () => Promise<T>,
    context: string = "unknown"
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      // 查找处理器
      const handler = this.handlers.get(context) || this.handlers.get("default");
      if (handler) {
        handler(errorObj);
      } else {
        console.error(`[${context}] 未处理的错误:`, errorObj.message);
      }
      
      throw errorObj;
    }
  }
}

// 注册错误处理器
ErrorBoundary.register("database", (error) => {
  console.error("数据库错误:", error.message);
  // 发送警报、重试等
});

ErrorBoundary.register("network", (error) => {
  console.error("网络错误:", error.message);
  // 重试逻辑
});

ErrorBoundary.register("default", (error) => {
  console.error("默认错误处理:", error.message);
});

// 使用错误边界
await ErrorBoundary.execute(async () => {
  // 数据库操作
  throw new Error("连接失败");
}, "database");
```

## 4. 抛出错误：throw

### 抛出不同类型的错误

```typescript
// 抛出内置错误
function validateAge(age: number): void {
  if (typeof age !== "number") {
    throw new TypeError("年龄必须是数字");
  }
  
  if (age < 0 || age > 150) {
    throw new RangeError("年龄必须在 0-150 之间");
  }
}

// 抛出自定义错误
function findUser(id: string): User {
  if (!id) {
    throw new ValidationError("id", id, "不能为空");
  }
  
  const user = database.find(id);
  if (!user) {
    throw ErrorFactory.createUserNotFoundError(id);
  }
  
  return user;
}

// 重新抛出错误
async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`尝试 ${attempt} 失败:`, lastError.message);
      
      if (attempt === maxRetries) {
        throw new AppError(
          `请求失败，已重试 ${maxRetries} 次`,
          "FETCH_FAILED",
          500,
          lastError
        );
      }
      
      // 等待后重试
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw lastError!; // 这行代码不会执行，但 TypeScript 需要它
}
```

### 异步错误抛出

```typescript
// 异步函数中的错误
async function asyncOperation(): Promise<string> {
  // 模拟异步错误
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  if (Math.random() > 0.5) {
    throw new Error("异步操作失败");
  }
  
  return "成功";
}

// 处理异步错误
try {
  const result = await asyncOperation();
  console.log(result);
} catch (error) {
  console.error("异步错误:", (error as Error).message);
}
```

## 5. Deno 测试框架：Deno.test

### 基础测试

```typescript
// 基础测试
Deno.test("基础测试", () => {
  const result = 1 + 1;
  if (result !== 2) {
    throw new Error("1 + 1 应该等于 2");
  }
});

// 异步测试
Deno.test("异步测试", async () => {
  const result = await Promise.resolve(42);
  if (result !== 42) {
    throw new Error("Promise 应该解析为 42");
  }
});

// 测试名称和函数
Deno.test({
  name: "详细测试",
  fn: () => {
    // 测试逻辑
  },
  ignore: false, // 是否忽略
  only: false,   // 是否只运行此测试
  sanitizeOps: true,   // 检查操作泄漏
  sanitizeResources: true, // 检查资源泄漏
});
```

### 测试组织

```typescript
// 测试套件
Deno.test("用户管理", async (t) => {
  // 子测试
  await t.step("创建用户", () => {
    const user = createUser("Alice");
    assertEquals(user.name, "Alice");
  });
  
  await t.step("验证用户", () => {
    const user = createUser("Alice");
    assert(validateUser(user));
  });
  
  await t.step("删除用户", async () => {
    await deleteUser("Alice");
    const user = await findUser("Alice");
    assertEquals(user, null);
  });
});
```

### 测试生命周期

```typescript
// 测试前后的设置和清理
Deno.test("数据库测试", async (t) => {
  // 测试前设置
  const db = await setupTestDatabase();
  
  try {
    await t.step("插入数据", async () => {
      await db.insert("users", { name: "Alice" });
      const users = await db.findAll("users");
      assertEquals(users.length, 1);
    });
    
    await t.step("查询数据", async () => {
      const user = await db.find("users", { name: "Alice" });
      assertEquals(user?.name, "Alice");
    });
  } finally {
    // 测试后清理
    await db.cleanup();
  }
});
```

## 6. 断言库：assertEquals, assertThrows 等

### Deno 标准断言

```typescript
import {
  assert,
  assertEquals,
  assertNotEquals,
  assertStrictEquals,
  assertThrows,
  assertRejects,
  assertInstanceOf,
  assertArrayIncludes,
  assertStringIncludes,
  assertMatch,
  assertNotMatch,
  assertObjectMatch,
  assertSnapshot,
  fail,
  unreachable,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

// 基础断言
Deno.test("断言示例", () => {
  // assert - 检查值是否为真
  assert(1 === 1, "1 应该等于 1");
  assert(true);
  
  // assertEquals - 深度相等
  assertEquals({ a: 1, b: 2 }, { a: 1, b: 2 });
  assertEquals([1, 2, 3], [1, 2, 3]);
  assertEquals("hello", "hello");
  
  // assertNotEquals - 不相等
  assertNotEquals({ a: 1 }, { a: 2 });
  
  // assertStrictEquals - 严格相等（引用相同）
  const obj = { a: 1 };
  assertStrictEquals(obj, obj); // 同一个引用
  // assertStrictEquals({ a: 1 }, { a: 1 }); // 会失败，不同引用
  
  // assertInstanceOf - 类型检查
  assertInstanceOf(new Error(), Error);
  assertInstanceOf(new TypeError(), TypeError);
  
  // assertArrayIncludes - 数组包含
  assertArrayIncludes([1, 2, 3], [1, 2]);
  assertArrayIncludes(["a", "b", "c"], ["a"]);
  
  // assertStringIncludes - 字符串包含
  assertStringIncludes("hello world", "hello");
  assertStringIncludes("TypeScript", "Script");
  
  // assertMatch - 正则匹配
  assertMatch("hello123", /\d+/);
  assertMatch("test@example.com", /^[\w.-]+@[\w.-]+\.\w+$/);
  
  // assertNotMatch - 正则不匹配
  assertNotMatch("hello", /\d+/);
  
  // assertObjectMatch - 对象匹配
  assertObjectMatch(
    { a: 1, b: 2, c: 3 },
    { a: 1, b: 2 } // 部分匹配
  );
});
```

### 错误断言

```typescript
// assertThrows - 同步错误
Deno.test("同步错误断言", () => {
  // 基础用法
  assertThrows(() => {
    throw new Error("测试错误");
  });
  
  // 指定错误类型
  assertThrows(
    () => {
      throw new TypeError("类型错误");
    },
    TypeError,
    "类型错误"
  );
  
  // 自定义错误类
  assertThrows(
    () => {
      throw new ValidationError("email", "invalid", "格式错误");
    },
    ValidationError
  );
  
  // 错误消息匹配
  assertThrows(
    () => {
      throw new Error("包含数字 123 的错误");
    },
    Error,
    /数字 \d+/
  );
});

// assertRejects - 异步错误
Deno.test("异步错误断言", async () => {
  // 基础用法
  await assertRejects(async () => {
    throw new Error("异步错误");
  });
  
  // 指定错误类型
  await assertRejects(
    async () => {
      throw new AppError("应用错误", "APP_ERROR", 500);
    },
    AppError,
    "应用错误"
  );
  
  // Promise 错误
  await assertRejects(
    () => Promise.reject(new Error("Promise 错误")),
    Error,
    "Promise 错误"
  );
});
```

### 自定义断言

```typescript
// 自定义断言函数
function assertIsString(value: unknown, msg?: string): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(msg || `Expected string, got ${typeof value}`);
  }
}

function assertIsNumber(value: unknown, msg?: string): asserts value is number {
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error(msg || `Expected number, got ${typeof value}`);
  }
}

function assertIsPositive(value: number, msg?: string): void {
  if (value <= 0) {
    throw new Error(msg || `Expected positive number, got ${value}`);
  }
}

function assertArrayNotEmpty<T>(array: T[], msg?: string): void {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error(msg || "Expected non-empty array");
  }
}

// 使用自定义断言
Deno.test("自定义断言示例", () => {
  const value: unknown = "hello";
  assertIsString(value, "值应该是字符串");
  console.log(value.toUpperCase()); // 类型安全
  
  const num: unknown = 42;
  assertIsNumber(num, "值应该是数字");
  assertIsPositive(num, "数字应该是正数");
  
  const arr = [1, 2, 3];
  assertArrayNotEmpty(arr, "数组不应为空");
});
```

## 7. 测试覆盖率

### 生成测试覆盖率报告

```bash
# 运行测试并生成覆盖率报告
deno test --coverage=coverage

# 生成 HTML 报告
deno coverage --html=coverage

# 生成 LCOV 报告（用于 CI/CD）
deno coverage --lcov=coverage.lcov

# 查看覆盖率摘要
deno coverage coverage
```

### 覆盖率配置

```json
// deno.json 中的覆盖率配置
{
  "test": {
    "coverage": true
  },
  "coverage": {
    "exclude": [
      "test_*.ts",
      "**/*_test.ts",
      "node_modules/"
    ]
  }
}
```

### 覆盖率最佳实践

```typescript
// 测试所有分支
function calculateDiscount(price: number, isPremium: boolean): number {
  if (price < 0) {
    throw new RangeError("价格不能为负数");
  }
  
  if (isPremium) {
    return price * 0.8; // 20% 折扣
  }
  
  return price;
}

// 测试用例应该覆盖所有分支
Deno.test("calculateDiscount 覆盖率测试", () => {
  // 测试正常情况
  assertEquals(calculateDiscount(100, false), 100);
  assertEquals(calculateDiscount(100, true), 80);
  
  // 测试边界情况
  assertEquals(calculateDiscount(0, false), 0);
  assertEquals(calculateDiscount(0, true), 0);
  
  // 测试错误情况
  assertThrows(
    () => calculateDiscount(-10, false),
    RangeError,
    "价格不能为负数"
  );
});
```

## 8. 测试最佳实践

### 测试原则

1. **FIRST 原则**：
   - **Fast**：测试应该快速运行
   - **Independent**：测试应该相互独立
   - **Repeatable**：测试应该可重复
   - **Self-validating**：测试应该自动验证
   - **Timely**：测试应该及时编写

2. **AAA 模式**：
   - **Arrange**：准备测试数据
   - **Act**：执行被测试的操作
   - **Assert**：验证结果

### 测试结构

```typescript
// 良好的测试结构
Deno.test("UserService.createUser", async (t) => {
  // Arrange - 准备测试数据
  const mockDatabase = createMockDatabase();
  const userService = new UserService(mockDatabase);
  const userData = {
    name: "Alice",
    email: "alice@example.com",
  };
  
  await t.step("应该成功创建用户", async () => {
    // Act - 执行操作
    const user = await userService.createUser(userData);
    
    // Assert - 验证结果
    assertEquals(user.name, userData.name);
    assertEquals(user.email, userData.email);
    assert(user.id); // 应该生成 ID
  });
  
  await t.step("应该拒绝重复邮箱", async () => {
    // Arrange - 设置重复数据
    await userService.createUser(userData);
    
    // Act & Assert - 验证错误
    await assertRejects(
      () => userService.createUser(userData),
      ValidationError,
      "邮箱已存在"
    );
  });
  
  await t.step("应该验证邮箱格式", async () => {
    // Arrange - 准备无效数据
    const invalidUserData = {
      name: "Bob",
      email: "invalid-email",
    };
    
    // Act & Assert - 验证错误
    await assertRejects(
      () => userService.createUser(invalidUserData),
      ValidationError,
      "邮箱格式无效"
    );
  });
});
```

### Mock 和 Stub

```typescript
// Mock 接口
interface MockDatabase {
  find: (id: string) => Promise<User | null>;
  save: (user: User) => Promise<User>;
  delete: (id: string) => Promise<void>;
}

// 创建 Mock
function createMockDatabase(): MockDatabase {
  const users = new Map<string, User>();
  
  return {
    find: async (id: string) => {
      return users.get(id) || null;
    },
    save: async (user: User) => {
      users.set(user.id, user);
      return user;
    },
    delete: async (id: string) => {
      users.delete(id);
    },
  };
}

// 使用 Mock 进行测试
Deno.test("使用 Mock 测试", async () => {
  const mockDb = createMockDatabase();
  const service = new UserService(mockDb);
  
  // 测试保存
  const user = await service.createUser({ name: "Alice", email: "alice@example.com" });
  assertEquals(user.name, "Alice");
  
  // 测试查找
  const found = await service.findUser(user.id);
  assertEquals(found?.email, "alice@example.com");
});
```

### 测试工具函数

```typescript
// 测试工具函数
function createTestUser(overrides?: Partial<User>): User {
  return {
    id: crypto.randomUUID(),
    name: "Test User",
    email: "test@example.com",
    createdAt: new Date(),
    ...overrides,
  };
}

function createTestUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => 
    createTestUser({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
    })
  );
}

// 使用测试工具
Deno.test("使用测试工具", () => {
  const user = createTestUser({ name: "Custom Name" });
  assertEquals(user.name, "Custom Name");
  
  const users = createTestUsers(5);
  assertEquals(users.length, 5);
  assertEquals(users[0].name, "User 1");
});
```

## 9. 示例代码说明

本项目包含以下示例文件：

### custom-errors.ts
- 自定义错误类层次结构
- 错误工厂模式
- 错误序列化和日志记录

### error-handling.ts
- try/catch/finally 最佳实践
- 错误边界模式
- 异步错误处理
- 错误恢复策略

### tests.ts
- Deno.test 使用示例
- 各种断言方法
- 测试组织和生命周期
- Mock 和 Stub 技术

## 10. 练习题

### 练习1：自定义错误类
创建一个完整的错误类层次结构：

```typescript
// 要求：
// 1. 创建基础 AppError 类
// 2. 创建 ValidationError, NotFoundError, UnauthorizedError 等子类
// 3. 实现错误工厂方法
// 4. 支持错误序列化
// 5. 支持错误链（cause）
```

### 练习2：错误处理中间件
实现一个错误处理中间件：

```typescript
interface ErrorHandler {
  canHandle(error: Error): boolean;
  handle(error: Error): void;
}

class ErrorMiddleware {
  private handlers: ErrorHandler[] = [];
  
  register(handler: ErrorHandler): void {
    // 实现
  }
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // 实现：捕获错误并使用适当的处理器处理
  }
}
```

### 练习3：测试工具函数
为以下函数编写完整的测试：

```typescript
class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
  
  subtract(a: number, b: number): number {
    return a - b;
  }
  
  multiply(a: number, b: number): number {
    return a * b;
  }
  
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new RangeError("除数不能为零");
    }
    return a / b;
  }
  
  factorial(n: number): number {
    if (n < 0) {
      throw new RangeError("n 不能为负数");
    }
    if (n === 0 || n === 1) {
      return 1;
    }
    return n * this.factorial(n - 1);
  }
}

// 要求：
// 1. 测试所有方法
// 2. 测试边界情况
// 3. 测试错误情况
// 4. 测试覆盖率应该达到 100%
```

### 练习4：异步错误处理
实现一个带重试机制的异步操作：

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries: number;
    delay: number;
    backoff: "linear" | "exponential";
    retryIf: (error: Error) => boolean;
  }
): Promise<T> {
  // 实现
}

// 测试要求：
// 1. 测试成功重试
// 2. 测试达到最大重试次数
// 3. 测试条件重试
// 4. 测试退避策略
```

### 练习5：测试覆盖率提升
选择一个现有的代码文件，分析其测试覆盖率，并编写额外的测试用例以提高覆盖率：

```bash
# 生成覆盖率报告
deno test --coverage=coverage
deno coverage coverage

# 分析未覆盖的代码行
# 编写额外的测试用例
# 验证覆盖率是否达到 90% 以上
```

## 运行示例

```bash
# 运行错误处理示例
deno run error-handling.ts

# 运行自定义错误示例
deno run custom-errors.ts

# 运行测试
deno test tests.ts

# 运行测试并生成覆盖率报告
deno test --coverage=coverage tests.ts
deno coverage --html=coverage

# 检查类型
deno check *.ts

# 格式化代码
deno fmt
```

## 总结

TypeScript 的错误处理和测试是开发现代应用程序的关键技能：

1. **错误处理**：
   - 使用自定义错误类提供有意义的错误信息
   - 实现错误边界模式处理未捕获的错误
   - 使用 TypeScript 类型系统增强错误处理的安全性

2. **测试**：
   - 使用 Deno 内置测试框架编写测试
   - 使用断言库验证代码行为
   - 追求高测试覆盖率确保代码质量
   - 遵循测试最佳实践编写可维护的测试

3. **TypeScript 优势**：
   - 类型化的错误处理减少运行时错误
   - 编译时错误检查提高代码质量
   - 接口定义确保错误结构的一致性

掌握这些技能将帮助你编写更健壮、更可靠的 TypeScript 应用程序。

---

## 项目导航

[上一个项目：异步编程](/projects/07-async/)

[下一个项目：装饰器和元数据](/projects/09-decorators/)

[返回学习路径](/learning-path/)
