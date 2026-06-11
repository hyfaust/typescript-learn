/**
 * TypeScript 错误处理最佳实践示例
 * 演示各种错误处理模式和策略
 * 运行环境: Deno
 */

// 类型定义
interface User {
  id: string;
  name: string;
  email: string;
}

interface Database {
  findUser(id: string): Promise<User | null>;
  saveUser(user: User): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// 1. 基础错误处理
function basicErrorHandling(): void {
  console.log("\n=== 基础错误处理 ===");
  
  // try/catch/finally
  try {
    const result = JSON.parse("invalid json");
    console.log("解析成功:", result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("JSON 语法错误:", error.message);
    } else {
      console.error("未知错误:", error);
    }
  } finally {
    console.log("解析操作完成");
  }
  
  // 多层错误处理
  try {
    try {
      throw new Error("内部错误");
    } catch (innerError) {
      console.error("内部捕获:", (innerError as Error).message);
      throw new Error("包装错误");
    }
  } catch (outerError) {
    console.error("外部捕获:", (outerError as Error).message);
  }
}

// 2. 类型化错误处理
function typedErrorHandling(): void {
  console.log("\n=== 类型化错误处理 ===");
  
  // 错误类型守卫
  function isError(error: unknown): error is Error {
    return error instanceof Error;
  }
  
  function isSyntaxError(error: unknown): error is SyntaxError {
    return error instanceof SyntaxError;
  }
  
  function isTypeError(error: unknown): error is TypeError {
    return error instanceof TypeError;
  }
  
  // 使用类型守卫处理错误
  function processError(error: unknown): void {
    if (isSyntaxError(error)) {
      console.error("语法错误:", error.message);
    } else if (isTypeError(error)) {
      console.error("类型错误:", error.message);
    } else if (isError(error)) {
      console.error("一般错误:", error.message);
    } else {
      console.error("未知错误:", String(error));
    }
  }
  
  // 测试不同类型的错误
  processError(new SyntaxError("语法错误"));
  processError(new TypeError("类型错误"));
  processError(new Error("一般错误"));
  processError("字符串错误");
}

// 3. 错误边界模式
class ErrorBoundary {
  private handlers: Map<string, (error: Error) => void> = new Map();
  private fallbackHandler?: (error: Error) => void;
  
  register(errorType: string, handler: (error: Error) => void): void {
    this.handlers.set(errorType, handler);
  }
  
  setFallback(handler: (error: Error) => void): void {
    this.fallbackHandler = handler;
  }
  
  async execute<T>(
    operation: () => Promise<T>,
    context: string = "unknown"
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      // 查找处理器
      const handler = this.handlers.get(context) || this.fallbackHandler;
      if (handler) {
        handler(errorObj);
      } else {
        console.error(`[${context}] 未处理的错误:`, errorObj.message);
      }
      
      throw errorObj;
    }
  }
}

// 4. 安全执行函数
async function safeExecute<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorHandler?: (error: Error) => void
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    if (errorHandler) {
      errorHandler(errorObj);
    } else {
      console.error("操作失败:", errorObj.message);
    }
    
    return fallback;
  }
}

// 5. 重试机制
interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoff: "linear" | "exponential";
  retryIf: (error: Error) => boolean;
}

async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // 检查是否应该重试
      if (!options.retryIf(lastError)) {
        throw lastError;
      }
      
      console.warn(`尝试 ${attempt} 失败:`, lastError.message);
      
      if (attempt === options.maxRetries) {
        throw new Error(`操作失败，已重试 ${options.maxRetries} 次: ${lastError.message}`);
      }
      
      // 计算延迟
      const delay = options.backoff === "exponential"
        ? options.delay * Math.pow(2, attempt - 1)
        : options.delay * attempt;
      
      console.log(`等待 ${delay}ms 后重试...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!; // 这行代码不会执行，但 TypeScript 需要它
}

// 6. 超时处理
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = "操作超时"
): Promise<T> {
  let timeoutId: number;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });
  
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// 7. 错误聚合
class AggregateError extends Error {
  public readonly errors: Error[];
  
  constructor(errors: Error[], message: string = "多个错误发生") {
    super(message);
    this.name = "AggregateError";
    this.errors = errors;
  }
  
  getMessages(): string[] {
    return this.errors.map((error) => error.message);
  }
  
  hasErrorType(errorType: new (...args: any[]) => Error): boolean {
    return this.errors.some((error) => error instanceof errorType);
  }
}

// 8. 错误恢复策略
class ErrorRecovery {
  private static strategies: Map<string, (error: Error) => Promise<boolean>> = new Map();
  
  static register(
    errorType: string,
    strategy: (error: Error) => Promise<boolean>
  ): void {
    this.strategies.set(errorType, strategy);
  }
  
  static async recover(error: Error, context: string = "default"): Promise<boolean> {
    const strategy = this.strategies.get(context) || this.strategies.get("default");
    if (strategy) {
      try {
        return await strategy(error);
      } catch (recoveryError) {
        console.error("恢复策略执行失败:", recoveryError);
        return false;
      }
    }
    return false;
  }
}

// 9. 错误日志记录
class ErrorLogger {
  private static logs: Array<{
    timestamp: Date;
    error: Error;
    context: string;
    severity: "low" | "medium" | "high" | "critical";
    metadata?: Record<string, any>;
  }> = [];
  
  static log(
    error: Error,
    context: string,
    severity: "low" | "medium" | "high" | "critical" = "medium",
    metadata?: Record<string, any>
  ): void {
    const entry = {
      timestamp: new Date(),
      error,
      context,
      severity,
      metadata,
    };
    
    this.logs.push(entry);
    
    // 输出到控制台
    const prefix = `[${severity.toUpperCase()}]`;
    console.error(`${prefix} [${context}] ${error.message}`);
    
    if (metadata) {
      console.error("元数据:", JSON.stringify(metadata, null, 2));
    }
    
    if (severity === "critical" || severity === "high") {
      console.error("堆栈:", error.stack);
    }
  }
  
  static getLogs(severity?: string): typeof ErrorLogger.logs {
    if (severity) {
      return this.logs.filter((log) => log.severity === severity);
    }
    return [...this.logs];
  }
  
  static clearLogs(): void {
    this.logs = [];
  }
  
  static getStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const log of this.logs) {
      stats[log.severity] = (stats[log.severity] || 0) + 1;
    }
    return stats;
  }
}

// 10. 异步错误处理最佳实践
async function asyncErrorHandlingBestPractices(): Promise<void> {
  console.log("\n=== 异步错误处理最佳实践 ===");
  
  // 1. 使用 try/catch 处理异步错误
  async function fetchUserSafe(id: string): Promise<User | null> {
    try {
      // 模拟异步操作
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      if (id === "invalid") {
        throw new Error("无效的用户ID");
      }
      
      return { id, name: `用户${id}`, email: `user${id}@example.com` };
    } catch (error) {
      console.error("获取用户失败:", (error as Error).message);
      return null;
    }
  }
  
  // 2. 使用 Promise.allSettled 处理多个异步操作
  async function fetchMultipleUsers(ids: string[]): Promise<(User | null)[]> {
    const promises = ids.map((id) => fetchUserSafe(id));
    const results = await Promise.allSettled(promises);
    
    return results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        console.error("Promise 失败:", result.reason);
        return null;
      }
    });
  }
  
  // 3. 使用错误边界处理异步错误
  const boundary = new ErrorBoundary();
  boundary.setFallback((error) => {
    console.error("错误边界捕获:", error.message);
  });
  
  await boundary.execute(async () => {
    throw new Error("异步错误");
  }, "async");
  
  // 测试示例
  const user = await fetchUserSafe("123");
  console.log("安全获取用户:", user?.name);
  
  const invalidUser = await fetchUserSafe("invalid");
  console.log("无效用户:", invalidUser);
  
  const users = await fetchMultipleUsers(["1", "invalid", "3"]);
  console.log("批量获取用户:", users.filter(Boolean).length);
}

// 11. 错误处理模式示例
async function errorHandlingPatterns(): Promise<void> {
  console.log("\n=== 错误处理模式示例 ===");
  
  // 1. 结果模式 (Result Pattern)
  type Result<T, E = Error> = 
    | { success: true; value: T }
    | { success: false; error: E };
  
  function divide(a: number, b: number): Result<number> {
    if (b === 0) {
      return { success: false, error: new Error("除数不能为零") };
    }
    return { success: true, value: a / b };
  }
  
  const result1 = divide(10, 2);
  if (result1.success) {
    console.log("除法结果:", result1.value);
  } else {
    console.error("除法错误:", result1.error.message);
  }
  
  const result2 = divide(10, 0);
  if (result2.success) {
    console.log("除法结果:", result2.value);
  } else {
    console.error("除法错误:", result2.error.message);
  }
  
  // 2. Option 模式
  type Option<T> = T | null | undefined;
  
  function findUser(id: string): Option<User> {
    const users: User[] = [
      { id: "1", name: "Alice", email: "alice@example.com" },
      { id: "2", name: "Bob", email: "bob@example.com" },
    ];
    
    return users.find((user) => user.id === id) || null;
  }
  
  const user = findUser("1");
  if (user) {
    console.log("找到用户:", user.name);
  } else {
    console.log("用户不存在");
  }
  
  // 3. 管道模式
  function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
    return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
  }
  
  function validateEmail(email: string): string {
    if (!email.includes("@")) {
      throw new Error("邮箱格式无效");
    }
    return email;
  }
  
  function normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }
  
  const processEmail = pipe(validateEmail, normalizeEmail);
  
  try {
    const email = processEmail("  Alice@Example.COM  ");
    console.log("处理后的邮箱:", email);
  } catch (error) {
    console.error("邮箱处理错误:", (error as Error).message);
  }
}

// 12. 实际应用示例
async function practicalExamples(): Promise<void> {
  console.log("\n=== 实际应用示例 ===");
  
  // 1. API 调用错误处理
  async function apiCall<T>(url: string): Promise<ApiResponse<T>> {
    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      if (url.includes("error")) {
        throw new Error("API 错误");
      }
      
      return {
        success: true,
        data: { message: "成功" } as T,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "API_ERROR",
          message: (error as Error).message,
        },
      };
    }
  }
  
  const apiResult = await apiCall<{ message: string }>("https://api.example.com");
  if (apiResult.success) {
    console.log("API 成功:", apiResult.data?.message);
  } else {
    console.error("API 失败:", apiResult.error?.message);
  }
  
  // 2. 文件处理错误处理
  async function processFileSafe(filePath: string): Promise<string | null> {
    return await safeExecute(
      async () => {
        // 模拟文件处理
        await new Promise((resolve) => setTimeout(resolve, 100));
        
        if (filePath.includes("missing")) {
          throw new Error("文件不存在");
        }
        
        return `文件内容: ${filePath}`;
      },
      null,
      (error) => {
        console.error(`文件处理失败 [${filePath}]:`, error.message);
      }
    );
  }
  
  const fileContent = await processFileSafe("test.txt");
  console.log("文件内容:", fileContent);
  
  const missingContent = await processFileSafe("missing.txt");
  console.log("缺失文件:", missingContent);
  
  // 3. 数据库操作错误处理
  async function databaseOperation(): Promise<void> {
    const db: Database = {
      async findUser(id: string): Promise<User | null> {
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (id === "error") {
          throw new Error("数据库连接失败");
        }
        return id === "1" ? { id, name: "Alice", email: "alice@example.com" } : null;
      },
      async saveUser(user: User): Promise<User> {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return user;
      },
      async deleteUser(id: string): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (id === "locked") {
          throw new Error("用户被锁定");
        }
      },
    };
    
    // 使用重试机制
    try {
      const user = await withRetry(
        () => db.findUser("1"),
        {
          maxRetries: 3,
          delay: 100,
          backoff: "linear",
          retryIf: (error) => error.message.includes("连接"),
        }
      );
      console.log("数据库用户:", user?.name);
    } catch (error) {
      console.error("数据库操作失败:", (error as Error).message);
    }
  }
  
  await databaseOperation();
}

// 主函数
async function main(): Promise<void> {
  console.log("TypeScript 错误处理最佳实践");
  console.log("=============================");
  
  try {
    basicErrorHandling();
    typedErrorHandling();
    await asyncErrorHandlingBestPractices();
    await errorHandlingPatterns();
    await practicalExamples();
    
    // 显示错误日志统计
    console.log("\n=== 错误日志统计 ===");
    console.log("日志统计:", ErrorLogger.getStats());
    
    console.log("\n=== 所有示例执行完成 ===");
    
  } catch (error) {
    console.error("主函数错误:", error);
  }
}

// 运行示例
if (import.meta.main) {
  main();
}