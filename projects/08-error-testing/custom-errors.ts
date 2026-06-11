/**
 * TypeScript 自定义错误类示例
 * 演示错误类层次结构、错误工厂和错误处理模式
 * 运行环境: Deno
 */

// 1. 基础自定义错误类
class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly timestamp: Date;
  public readonly context: Record<string, any>;
  
  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context: Record<string, any> = {},
    cause?: Error
  ) {
    super(message, { cause });
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();
    this.context = context;
    
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
      context: this.context,
      stack: this.stack,
      cause: this.cause instanceof Error ? {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack,
      } : this.cause,
    };
  }
  
  // 格式化输出
  toString(): string {
    return `[${this.code}] ${this.message}`;
  }
}

// 2. 验证错误
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
      400,
      { field, value, constraint }
    );
    this.name = "ValidationError";
    this.field = field;
    this.value = value;
    this.constraint = constraint;
  }
  
  // 创建特定验证错误
  static required(field: string): ValidationError {
    return new ValidationError(field, undefined, "不能为空");
  }
  
  static invalidFormat(field: string, value: any, format: string): ValidationError {
    return new ValidationError(field, value, `格式无效，应为 ${format}`);
  }
  
  static outOfRange(field: string, value: number, min: number, max: number): ValidationError {
    return new ValidationError(field, value, `超出范围 [${min}, ${max}]`);
  }
  
  static tooLong(field: string, value: string, maxLength: number): ValidationError {
    return new ValidationError(field, value, `长度超过 ${maxLength} 个字符`);
  }
  
  static tooShort(field: string, value: string, minLength: number): ValidationError {
    return new ValidationError(field, value, `长度少于 ${minLength} 个字符`);
  }
}

// 3. 数据库错误
class DatabaseError extends AppError {
  public readonly query: string;
  public readonly params: any[];
  public readonly table?: string;
  
  constructor(
    query: string,
    params: any[],
    message: string = "数据库操作失败",
    table?: string,
    cause?: Error
  ) {
    super(message, "DATABASE_ERROR", 500, { query, params, table }, cause);
    this.name = "DatabaseError";
    this.query = query;
    this.params = params;
    this.table = table;
  }
  
  // 创建特定数据库错误
  static connectionFailed(host: string, port: number, cause?: Error): DatabaseError {
    return new DatabaseError(
      "CONNECTION",
      [],
      `无法连接到数据库 ${host}:${port}`,
      undefined,
      cause
    );
  }
  
  static queryFailed(query: string, params: any[], cause?: Error): DatabaseError {
    return new DatabaseError(query, params, "查询执行失败", undefined, cause);
  }
  
  static notFound(table: string, id: string): DatabaseError {
    return new DatabaseError(
      `SELECT * FROM ${table} WHERE id = ?`,
      [id],
      `${table} 中未找到 ID 为 ${id} 的记录`,
      table
    );
  }
  
  static duplicateEntry(table: string, field: string, value: any): DatabaseError {
    return new DatabaseError(
      `INSERT INTO ${table} (...)`,
      [],
      `${table} 中 ${field} = ${value} 已存在`,
      table
    );
  }
}

// 4. 认证和授权错误
class AuthenticationError extends AppError {
  public readonly userId?: string;
  public readonly reason: string;
  
  constructor(
    reason: string = "认证失败",
    userId?: string
  ) {
    super(reason, "AUTHENTICATION_ERROR", 401, { userId, reason });
    this.name = "AuthenticationError";
    this.userId = userId;
    this.reason = reason;
  }
  
  // 创建特定认证错误
  static invalidCredentials(): AuthenticationError {
    return new AuthenticationError("用户名或密码错误");
  }
  
  static tokenExpired(): AuthenticationError {
    return new AuthenticationError("令牌已过期");
  }
  
  static tokenInvalid(): AuthenticationError {
    return new AuthenticationError("令牌无效");
  }
  
  static accountLocked(userId: string): AuthenticationError {
    return new AuthenticationError("账户已被锁定", userId);
  }
  
  static accountDisabled(userId: string): AuthenticationError {
    return new AuthenticationError("账户已被禁用", userId);
  }
}

class AuthorizationError extends AppError {
  public readonly requiredPermission: string;
  public readonly userId?: string;
  public readonly resource?: string;
  
  constructor(
    requiredPermission: string,
    message: string = "权限不足",
    userId?: string,
    resource?: string
  ) {
    super(message, "AUTHORIZATION_ERROR", 403, {
      requiredPermission,
      userId,
      resource,
    });
    this.name = "AuthorizationError";
    this.requiredPermission = requiredPermission;
    this.userId = userId;
    this.resource = resource;
  }
  
  // 创建特定授权错误
  static insufficientPermissions(permission: string, userId?: string): AuthorizationError {
    return new AuthorizationError(permission, `需要权限: ${permission}`, userId);
  }
  
  static resourceNotFound(resource: string, userId?: string): AuthorizationError {
    return new AuthorizationError(
      "resource:read",
      `资源 ${resource} 不存在`,
      userId,
      resource
    );
  }
  
  static accessDenied(resource: string, userId?: string): AuthorizationError {
    return new AuthorizationError(
      "resource:access",
      `无权访问资源 ${resource}`,
      userId,
      resource
    );
  }
}

// 5. 网络错误
class NetworkError extends AppError {
  public readonly url: string;
  public readonly method: string;
  public readonly statusCode?: number;
  
  constructor(
    url: string,
    method: string = "GET",
    message: string = "网络请求失败",
    statusCode?: number,
    cause?: Error
  ) {
    super(message, "NETWORK_ERROR", statusCode || 500, { url, method }, cause);
    this.name = "NetworkError";
    this.url = url;
    this.method = method;
    this.statusCode = statusCode;
  }
  
  // 创建特定网络错误
  static timeout(url: string, method: string = "GET", timeoutMs: number = 30000): NetworkError {
    return new NetworkError(
      url,
      method,
      `请求超时 (${timeoutMs}ms)`,
      408
    );
  }
  
  static connectionRefused(url: string, method: string = "GET"): NetworkError {
    return new NetworkError(url, method, "连接被拒绝", 502);
  }
  
  static notFound(url: string, method: string = "GET"): NetworkError {
    return new NetworkError(url, method, "资源不存在", 404);
  }
  
  static serverError(url: string, method: string = "GET", statusCode: number = 500): NetworkError {
    return new NetworkError(url, method, `服务器错误 (${statusCode})`, statusCode);
  }
}

// 6. 业务逻辑错误
class BusinessError extends AppError {
  public readonly businessRule: string;
  public readonly operation: string;
  
  constructor(
    businessRule: string,
    operation: string,
    message: string = "业务规则违反"
  ) {
    super(message, "BUSINESS_ERROR", 422, { businessRule, operation });
    this.name = "BusinessError";
    this.businessRule = businessRule;
    this.operation = operation;
  }
  
  // 创建特定业务错误
  static insufficientBalance(current: number, required: number): BusinessError {
    return new BusinessError(
      "balance_check",
      "payment",
      `余额不足: 当前 ${current}，需要 ${required}`
    );
  }
  
  static productOutOfStock(productId: string): BusinessError {
    return new BusinessError(
      "stock_check",
      "purchase",
      `产品 ${productId} 已售罄`
    );
  }
  
  static orderAlreadyProcessed(orderId: string): BusinessError {
    return new BusinessError(
      "order_status",
      "update",
      `订单 ${orderId} 已处理完成`
    );
  }
  
  static duplicateOperation(operation: string): BusinessError {
    return new BusinessError(
      "duplicate_check",
      operation,
      `操作 ${operation} 已执行`
    );
  }
}

// 7. 错误工厂
class ErrorFactory {
  // 用户相关错误
  static createUserNotFoundError(userId: string): AppError {
    return new AppError(
      `用户 ${userId} 未找到`,
      "USER_NOT_FOUND",
      404,
      { userId }
    );
  }
  
  static createUserAlreadyExistsError(email: string): AppError {
    return new AppError(
      `用户 ${email} 已存在`,
      "USER_ALREADY_EXISTS",
      409,
      { email }
    );
  }
  
  // 订单相关错误
  static createOrderNotFoundError(orderId: string): AppError {
    return new AppError(
      `订单 ${orderId} 未找到`,
      "ORDER_NOT_FOUND",
      404,
      { orderId }
    );
  }
  
  static createOrderCannotBeCancelledError(orderId: string, status: string): AppError {
    return new AppError(
      `订单 ${orderId} 无法取消，当前状态: ${status}`,
      "ORDER_CANNOT_BE_CANCELLED",
      400,
      { orderId, status }
    );
  }
  
  // 产品相关错误
  static createProductNotFoundError(productId: string): AppError {
    return new AppError(
      `产品 ${productId} 未找到`,
      "PRODUCT_NOT_FOUND",
      404,
      { productId }
    );
  }
  
  // 通用错误
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
  
  static createNetworkError(url: string, method: string, statusCode?: number): NetworkError {
    return new NetworkError(url, method, undefined, statusCode);
  }
  
  static createBusinessError(rule: string, operation: string): BusinessError {
    return new BusinessError(rule, operation);
  }
}

// 8. 错误处理器
class ErrorHandler {
  private static handlers: Map<string, (error: AppError) => void> = new Map();
  
  static register(errorCode: string, handler: (error: AppError) => void): void {
    this.handlers.set(errorCode, handler);
  }
  
  static handle(error: unknown): void {
    if (error instanceof AppError) {
      const handler = this.handlers.get(error.code);
      if (handler) {
        handler(error);
        return;
      }
    }
    
    // 默认处理
    console.error("未处理的错误:", error);
  }
  
  static async handleAsync<T>(
    operation: () => Promise<T>,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.handle(error);
      return fallback;
    }
  }
}

// 9. 错误日志记录器
class ErrorLogger {
  private static logs: Array<{
    timestamp: Date;
    error: AppError;
    context?: Record<string, any>;
  }> = [];
  
  static log(error: AppError, context?: Record<string, any>): void {
    const entry = {
      timestamp: new Date(),
      error,
      context,
    };
    
    this.logs.push(entry);
    
    // 输出到控制台
    console.error(`[${error.code}] ${error.message}`);
    console.error("时间:", entry.timestamp.toISOString());
    if (context) {
      console.error("上下文:", JSON.stringify(context, null, 2));
    }
    if (error.stack) {
      console.error("堆栈:", error.stack);
    }
  }
  
  static getLogs(): Array<{
    timestamp: Date;
    error: AppError;
    context?: Record<string, any>;
  }> {
    return [...this.logs];
  }
  
  static clearLogs(): void {
    this.logs = [];
  }
  
  static getLogsByCode(code: string): Array<{
    timestamp: Date;
    error: AppError;
    context?: Record<string, any>;
  }> {
    return this.logs.filter((log) => log.error.code === code);
  }
}

// 10. 错误恢复策略
class ErrorRecovery {
  private static strategies: Map<string, (error: AppError) => Promise<boolean>> = new Map();
  
  static registerStrategy(
    errorCode: string,
    strategy: (error: AppError) => Promise<boolean>
  ): void {
    this.strategies.set(errorCode, strategy);
  }
  
  static async tryRecover(error: AppError): Promise<boolean> {
    const strategy = this.strategies.get(error.code);
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

// 演示函数
function demonstrateCustomErrors(): void {
  console.log("\n=== 自定义错误类演示 ===");
  
  // 验证错误
  console.log("1. 验证错误:");
  const validationError = ValidationError.required("email");
  console.log(`   ${validationError}`);
  console.log(`   字段: ${validationError.field}, 约束: ${validationError.constraint}`);
  
  const formatError = ValidationError.invalidFormat("phone", "123", "手机号码格式");
  console.log(`   ${formatError}`);
  
  // 数据库错误
  console.log("\n2. 数据库错误:");
  const dbError = DatabaseError.notFound("users", "123");
  console.log(`   ${dbError}`);
  console.log(`   表: ${dbError.table}, 查询: ${dbError.query}`);
  
  // 认证错误
  console.log("\n3. 认证错误:");
  const authError = AuthenticationError.tokenExpired();
  console.log(`   ${authError}`);
  
  // 授权错误
  console.log("\n4. 授权错误:");
  const permError = AuthorizationError.insufficientPermissions("admin:write", "user123");
  console.log(`   ${permError}`);
  
  // 网络错误
  console.log("\n5. 网络错误:");
  const networkError = NetworkError.timeout("https://api.example.com", "GET", 5000);
  console.log(`   ${networkError}`);
  
  // 业务错误
  console.log("\n6. 业务错误:");
  const businessError = BusinessError.insufficientBalance(100, 500);
  console.log(`   ${businessError}`);
}

function demonstrateErrorFactory(): void {
  console.log("\n=== 错误工厂演示 ===");
  
  const errors = [
    ErrorFactory.createUserNotFoundError("user123"),
    ErrorFactory.createUserAlreadyExistsError("alice@example.com"),
    ErrorFactory.createOrderNotFoundError("order456"),
    ErrorFactory.createProductNotFoundError("product789"),
    ErrorFactory.createValidationError("age", -5, "必须为正数"),
    ErrorFactory.createBusinessError("stock_check", "purchase"),
  ];
  
  errors.forEach((error, index) => {
    console.log(`${index + 1}. [${error.code}] ${error.message}`);
  });
}

function demonstrateErrorHandling(): void {
  console.log("\n=== 错误处理演示 ===");
  
  // 注册错误处理器
  ErrorHandler.register("VALIDATION_ERROR", (error) => {
    console.log(`验证错误处理: ${error.message}`);
  });
  
  ErrorHandler.register("DATABASE_ERROR", (error) => {
    console.log(`数据库错误处理: ${error.message}`);
  });
  
  // 处理不同类型的错误
  const errors = [
    new ValidationError("email", "invalid", "格式错误"),
    new DatabaseError("SELECT *", [], "连接失败"),
    new AuthenticationError("令牌过期"),
    new Error("未知错误"),
  ];
  
  errors.forEach((error, index) => {
    console.log(`处理错误 ${index + 1}:`);
    ErrorHandler.handle(error);
  });
}

function demonstrateErrorLogging(): void {
  console.log("\n=== 错误日志演示 ===");
  
  // 记录错误
  const errors = [
    new ValidationError("name", "", "不能为空"),
    new DatabaseError("INSERT", [], "重复键"),
    new NetworkError("https://api.example.com", "GET", "超时"),
  ];
  
  errors.forEach((error) => {
    ErrorLogger.log(error, { userId: "user123", action: "test" });
  });
  
  // 获取日志
  const logs = ErrorLogger.getLogs();
  console.log(`日志数量: ${logs.length}`);
  
  // 按错误代码筛选
  const validationLogs = ErrorLogger.getLogsByCode("VALIDATION_ERROR");
  console.log(`验证错误日志数量: ${validationLogs.length}`);
}

function demonstrateErrorRecovery(): void {
  console.log("\n=== 错误恢复演示 ===");
  
  // 注册恢复策略
  ErrorRecovery.registerStrategy("NETWORK_ERROR", async (error) => {
    console.log("尝试网络错误恢复...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("网络错误恢复成功");
    return true;
  });
  
  ErrorRecovery.registerStrategy("DATABASE_ERROR", async (error) => {
    console.log("尝试数据库错误恢复...");
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("数据库错误恢复失败");
    return false;
  });
  
  // 测试恢复
  const networkError = new NetworkError("https://api.example.com", "GET", "超时");
  ErrorRecovery.tryRecover(networkError).then((recovered) => {
    console.log(`网络错误恢复结果: ${recovered}`);
  });
  
  const dbError = new DatabaseError("SELECT", [], "连接失败");
  ErrorRecovery.tryRecover(dbError).then((recovered) => {
    console.log(`数据库错误恢复结果: ${recovered}`);
  });
}

// 主函数
function main(): void {
  console.log("TypeScript 自定义错误类示例");
  console.log("=============================");
  
  demonstrateCustomErrors();
  demonstrateErrorFactory();
  demonstrateErrorHandling();
  demonstrateErrorLogging();
  demonstrateErrorRecovery();
  
  console.log("\n=== 所有示例执行完成 ===");
}

// 运行示例
if (import.meta.main) {
  main();
}