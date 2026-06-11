/**
 * TypeScript 方法装饰器示例
 * 演示方法装饰器的各种用法和模式
 * 运行环境: Deno (需要 --unstable 标志)
 */

// 注意：在 Deno 中运行需要使用 --unstable 标志
// deno run --unstable method-decorators.ts

// 1. 基础方法装饰器
function Log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    console.log(`[LOG] 调用方法: ${propertyKey}`);
    console.log(`[LOG] 参数: ${JSON.stringify(args)}`);
    
    const startTime = performance.now();
    const result = originalMethod.apply(this, args);
    const endTime = performance.now();
    
    console.log(`[LOG] 返回值: ${JSON.stringify(result)}`);
    console.log(`[LOG] 执行时间: ${(endTime - startTime).toFixed(2)}ms`);
    
    return result;
  };
  
  return descriptor;
}

// 2. 方法装饰器工厂
function Debounce(delay: number = 300) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    let timeoutId: number;
    
    descriptor.value = function (...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        originalMethod.apply(this, args);
      }, delay);
    };
    
    return descriptor;
  };
}

// 3. 节流装饰器
function Throttle(limit: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    let lastCall = 0;
    
    descriptor.value = function (...args: any[]) {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        return originalMethod.apply(this, args);
      }
      console.log(`[THROTTLE] 方法 ${propertyKey} 被节流`);
    };
    
    return descriptor;
  };
}

// 4. 验证装饰器
function Validate(...validators: Array<(args: any[]) => boolean>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      for (const validator of validators) {
        if (!validator(args)) {
          throw new Error(`[VALIDATE] 验证失败: ${propertyKey}`);
        }
      }
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

// 验证器函数
const isNumber = (args: any[]) => args.every((arg) => typeof arg === "number");
const isPositive = (args: any[]) => args.every((arg) => arg > 0);
const isString = (args: any[]) => args.every((arg) => typeof arg === "string");
const isNonEmpty = (args: any[]) => args.every((arg) => arg && arg.length > 0);

// 5. 缓存装饰器
function Cache(ttl: number = 5000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cache = new Map<string, { value: any; timestamp: number }>();
    
    descriptor.value = function (...args: any[]) {
      const key = JSON.stringify(args);
      const cached = cache.get(key);
      const now = Date.now();
      
      if (cached && now - cached.timestamp < ttl) {
        console.log(`[CACHE] 缓存命中: ${propertyKey}`);
        return cached.value;
      }
      
      const result = originalMethod.apply(this, args);
      cache.set(key, { value: result, timestamp: now });
      
      console.log(`[CACHE] 缓存更新: ${propertyKey}`);
      return result;
    };
    
    return descriptor;
  };
}

// 6. 重试装饰器
function Retry(maxRetries: number = 3, delay: number = 1000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.log(`[RETRY] 尝试 ${attempt} 失败: ${lastError.message}`);
          
          if (attempt === maxRetries) {
            throw new Error(`[RETRY] 操作失败，已重试 ${maxRetries} 次: ${lastError.message}`);
          }
          
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
      
      throw lastError;
    };
    
    return descriptor;
  };
}

// 7. 权限检查装饰器
function Authorize(requiredRole: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      // 模拟获取当前用户角色
      const currentUser = (this as any).currentUser || { role: "guest" };
      
      if (currentUser.role !== requiredRole && currentUser.role !== "admin") {
        throw new Error(`[AUTHORIZE] 权限不足: 需要 ${requiredRole} 角色`);
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

// 8. 性能监控装饰器
function Performance(threshold: number = 100) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const startTime = performance.now();
      const result = originalMethod.apply(this, args);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > threshold) {
        console.warn(`[PERFORMANCE] 方法 ${propertyKey} 执行时间过长: ${duration.toFixed(2)}ms`);
      } else {
        console.log(`[PERFORMANCE] 方法 ${propertyKey} 执行时间: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    };
    
    return descriptor;
  };
}

// 9. 异步方法装饰器
function AsyncLog(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function (...args: any[]) {
    console.log(`[ASYNC-LOG] 开始异步方法: ${propertyKey}`);
    
    try {
      const result = await originalMethod.apply(this, args);
      console.log(`[ASYNC-LOG] 异步方法 ${propertyKey} 完成`);
      return result;
    } catch (error) {
      console.error(`[ASYNC-LOG] 异步方法 ${propertyKey} 失败: ${(error as Error).message}`);
      throw error;
    }
  };
  
  return descriptor;
}

// 10. 事件发射装饰器
function Emit(event: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      // 发射事件
      if (typeof (this as any).emit === "function") {
        (this as any).emit(event, { method: propertyKey, args, result });
      }
      
      console.log(`[EMIT] 事件 ${event} 已发射`);
      return result;
    };
    
    return descriptor;
  };
}

// 示例类
class Calculator {
  @Log
  add(a: number, b: number): number {
    return a + b;
  }
  
  @Validate(isNumber, isPositive)
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error("除数不能为零");
    }
    return a / b;
  }
  
  @Cache(2000)
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
  
  @Performance(50)
  heavyComputation(): number {
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += Math.sqrt(i);
    }
    return sum;
  }
}

class SearchService {
  @Debounce(500)
  search(query: string): void {
    console.log(`搜索: ${query}`);
  }
  
  @Throttle(1000)
  scroll(position: number): void {
    console.log(`滚动到位置: ${position}`);
  }
}

class ApiService {
  @Retry(3, 500)
  @AsyncLog
  async fetchData(url: string): Promise<any> {
    // 模拟网络请求
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    if (Math.random() > 0.5) {
      throw new Error("网络错误");
    }
    
    return { data: `来自 ${url} 的数据` };
  }
}

class AdminService {
  private currentUser = { role: "admin", name: "Admin" };
  
  @Authorize("admin")
  deleteUser(userId: string): void {
    console.log(`删除用户: ${userId}`);
  }
  
  @Authorize("user")
  viewProfile(userId: string): void {
    console.log(`查看用户资料: ${userId}`);
  }
}

class EventEmitter {
  private listeners: Map<string, Function[]> = new Map();
  
  on(event: string, listener: Function): void {
    const listeners = this.listeners.get(event) || [];
    listeners.push(listener);
    this.listeners.set(event, listeners);
  }
  
  emit(event: string, data: any): void {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach((listener) => listener(data));
  }
}

class UserService extends EventEmitter {
  @Emit("userCreated")
  createUser(name: string, email: string): any {
    const user = { id: Date.now(), name, email };
    console.log(`创建用户: ${name}`);
    return user;
  }
  
  @Emit("userDeleted")
  deleteUser(userId: string): void {
    console.log(`删除用户: ${userId}`);
  }
}

// 演示函数
async function demonstrateMethodDecorators(): Promise<void> {
  console.log("\n=== 方法装饰器演示 ===");
  
  // 1. 基础日志装饰器
  console.log("\n1. 日志装饰器:");
  const calculator = new Calculator();
  calculator.add(1, 2);
  
  // 2. 验证装饰器
  console.log("\n2. 验证装饰器:");
  try {
    calculator.divide(10, 2);
    calculator.divide(-10, 2); // 会抛出错误
  } catch (error) {
    console.log(`   错误: ${(error as Error).message}`);
  }
  
  // 3. 缓存装饰器
  console.log("\n3. 缓存装饰器:");
  console.log(`   斐波那契(10): ${calculator.fibonacci(10)}`);
  console.log(`   斐波那契(10): ${calculator.fibonacci(10)}`); // 使用缓存
  
  // 4. 性能监控装饰器
  console.log("\n4. 性能监控装饰器:");
  calculator.heavyComputation();
  
  // 5. 防抖装饰器
  console.log("\n5. 防抖装饰器:");
  const searchService = new SearchService();
  searchService.search("a");
  searchService.search("ab");
  searchService.search("abc"); // 只会执行最后一次
  
  // 等待防抖完成
  await new Promise((resolve) => setTimeout(resolve, 600));
  
  // 6. 节流装饰器
  console.log("\n6. 节流装饰器:");
  searchService.scroll(100);
  searchService.scroll(200);
  searchService.scroll(300);
  
  // 7. 重试装饰器
  console.log("\n7. 重试装饰器:");
  const apiService = new ApiService();
  try {
    const data = await apiService.fetchData("https://api.example.com");
    console.log(`   获取数据: ${JSON.stringify(data)}`);
  } catch (error) {
    console.log(`   最终失败: ${(error as Error).message}`);
  }
  
  // 8. 权限检查装饰器
  console.log("\n8. 权限检查装饰器:");
  const adminService = new AdminService();
  try {
    adminService.deleteUser("user123");
    adminService.viewProfile("user123");
  } catch (error) {
    console.log(`   权限错误: ${(error as Error).message}`);
  }
  
  // 9. 事件发射装饰器
  console.log("\n9. 事件发射装饰器:");
  const userService = new UserService();
  
  userService.on("userCreated", (data: any) => {
    console.log(`   事件监听: 用户已创建 - ${JSON.stringify(data)}`);
  });
  
  userService.on("userDeleted", (data: any) => {
    console.log(`   事件监听: 用户已删除 - ${JSON.stringify(data)}`);
  });
  
  userService.createUser("Alice", "alice@example.com");
  userService.deleteUser("user123");
}

// 主函数
async function main(): Promise<void> {
  console.log("TypeScript 方法装饰器示例");
  console.log("==========================");
  
  await demonstrateMethodDecorators();
  
  console.log("\n=== 所有示例执行完成 ===");
}

// 运行示例
if (import.meta.main) {
  main();
}