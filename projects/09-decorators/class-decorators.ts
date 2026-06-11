/**
 * TypeScript 类装饰器示例
 * 演示类装饰器的各种用法和模式
 * 运行环境: Deno (需要 --unstable 标志)
 */

// 注意：在 Deno 中运行需要使用 --unstable 标志
// deno run --unstable class-decorators.ts

// 1. 基础类装饰器
function Logger<T extends new (...args: any[]) => any>(constructor: T) {
  console.log(`Logger: 类 ${constructor.name} 被装饰`);
  
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      console.log(`Logger: 创建了 ${constructor.name} 的实例`);
    }
  };
}

@Logger
class MyClass {
  constructor(public name: string) {
    console.log(`MyClass 构造函数: ${name}`);
  }
}

// 2. 类装饰器工厂
function WithTimestamp(format: string = "YYYY-MM-DD") {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    return class extends constructor {
      createdAt: Date = new Date();
      
      getFormattedTimestamp(): string {
        // 简单的日期格式化
        const date = this.createdAt;
        if (format === "YYYY-MM-DD") {
          return date.toISOString().split("T")[0];
        } else if (format === "YYYY-MM-DD HH:mm:ss") {
          return date.toISOString().replace("T", " ").split(".")[0];
        }
        return date.toISOString();
      }
    };
  };
}

@WithTimestamp("YYYY-MM-DD HH:mm:ss")
class User {
  constructor(public name: string, public email: string) {}
}

// 3. 单例模式装饰器
function Singleton<T extends new (...args: any[]) => any>(constructor: T) {
  let instance: InstanceType<T>;
  
  return class extends constructor {
    constructor(...args: any[]) {
      if (instance) {
        console.log("Singleton: 返回现有实例");
        return instance;
      }
      super(...args);
      instance = this;
      console.log("Singleton: 创建新实例");
    }
  } as T;
}

@Singleton
class Database {
  constructor(public connectionString: string) {
    console.log(`Database: 连接到 ${connectionString}`);
  }
  
  query(sql: string): any {
    console.log(`Database: 执行查询 ${sql}`);
    return { rows: [] };
  }
}

// 4. 混入模式装饰器
type Constructor<T = {}> = new (...args: any[]) => T;

function Serializable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    serialize(): string {
      return JSON.stringify(this);
    }
    
    static deserialize<T>(json: string): T {
      return JSON.parse(json);
    }
  };
}

function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
    
    updateTimestamp(): void {
      this.updatedAt = new Date();
    }
  };
}

@Serializable
@Timestamped
class Product {
  constructor(public name: string, public price: number) {}
}

// 5. 验证装饰器
function ValidateClass(validator: (instance: any) => boolean) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        if (!validator(this)) {
          throw new Error(`类 ${constructor.name} 验证失败`);
        }
      }
    } as T;
  };
}

@ValidateClass((instance: any) => {
  if (!instance.name || instance.name.length < 2) {
    return false;
  }
  if (instance.age < 0 || instance.age > 150) {
    return false;
  }
  return true;
})
class Person {
  constructor(public name: string, public age: number) {}
}

// 6. 依赖注入装饰器
const DI_CONTAINER = new Map<string, any>();

function Injectable(token?: string) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const identifier = token || constructor.name;
    DI_CONTAINER.set(identifier, constructor);
    console.log(`Injectable: 注册 ${identifier}`);
    return constructor;
  };
}

function Inject(token: string) {
  return function (target: any, propertyKey: string) {
    // 在实例创建时注入依赖
    const originalConstructor = target.constructor;
    const newConstructor = class extends originalConstructor {
      constructor(...args: any[]) {
        super(...args);
        const dependency = DI_CONTAINER.get(token);
        if (dependency) {
          (this as any)[propertyKey] = new dependency();
        }
      }
    };
    // 复制原构造函数的属性
    Object.defineProperty(newConstructor, 'name', { value: originalConstructor.name });
    target.constructor = newConstructor;
  };
}

@Injectable("Logger")
class AppLogger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

@Injectable("UserService")
class UserService {
  private logger: AppLogger;

  constructor() {
    // 简化依赖注入：直接创建 logger 实例
    this.logger = new AppLogger();
  }

  getUsers(): string[] {
    this.logger.log("获取用户列表");
    return ["Alice", "Bob", "Charlie"];
  }
}

// 7. 性能监控装饰器
function PerformanceMonitor<T extends new (...args: any[]) => any>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      const startTime = performance.now();
      super(...args);
      const endTime = performance.now();
      console.log(`PerformanceMonitor: ${constructor.name} 构造耗时 ${(endTime - startTime).toFixed(2)}ms`);
    }
  };
}

@PerformanceMonitor
class HeavyComputation {
  constructor() {
    // 模拟重计算
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += i;
    }
    console.log(`HeavyComputation: 计算结果 ${sum}`);
  }
}

// 8. 事件发射器装饰器
function EventEmitter<T extends new (...args: any[]) => any>(constructor: T) {
  return class extends constructor {
    private listeners: Map<string, Function[]> = new Map();
    
    on(event: string, listener: Function): void {
      const listeners = this.listeners.get(event) || [];
      listeners.push(listener);
      this.listeners.set(event, listeners);
    }
    
    emit(event: string, ...args: any[]): void {
      const listeners = this.listeners.get(event) || [];
      listeners.forEach((listener) => listener(...args));
    }
    
    off(event: string, listener: Function): void {
      const listeners = this.listeners.get(event) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };
}

@EventEmitter
class Button {
  constructor(public text: string) {}
  
  click(): void {
    console.log(`Button: ${this.text} 被点击`);
    (this as any).emit("click", this.text);
  }
}

// 9. 缓存装饰器
function CacheClass<T extends new (...args: any[]) => any>(constructor: T) {
  const cache = new Map<string, any>();
  
  return class extends constructor {
    constructor(...args: any[]) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        console.log("CacheClass: 返回缓存实例");
        return cache.get(key);
      }
      super(...args);
      cache.set(key, this);
      console.log("CacheClass: 创建并缓存新实例");
    }
  } as T;
}

@CacheClass
class Configuration {
  constructor(public env: string, public debug: boolean) {}
  
  getConnectionString(): string {
    return `server=localhost;env=${this.env};debug=${this.debug}`;
  }
}

// 10. 序列化装饰器
function SerializableClass<T extends new (...args: any[]) => any>(constructor: T) {
  return class extends constructor {
    toJSON(): Record<string, any> {
      const result: Record<string, any> = {};
      for (const key of Object.keys(this)) {
        const value = (this as any)[key];
        if (typeof value !== "function") {
          result[key] = value;
        }
      }
      return result;
    }
    
    static fromJSON<T>(json: Record<string, any>): T {
      return new constructor(...Object.values(json)) as T;
    }
  };
}

@SerializableClass
class Settings {
  constructor(
    public theme: string,
    public language: string,
    public notifications: boolean
  ) {}
}

// 演示函数
function demonstrateClassDecorators(): void {
  console.log("\n=== 类装饰器演示 ===");
  
  // 1. 基础类装饰器
  console.log("\n1. 基础类装饰器:");
  const myClass = new MyClass("测试");
  console.log(`   实例名称: ${myClass.name}`);
  
  // 2. 类装饰器工厂
  console.log("\n2. 类装饰器工厂:");
  const user = new User("Alice", "alice@example.com");
  console.log(`   用户名: ${user.name}`);
  console.log(`   创建时间: ${(user as any).getFormattedTimestamp()}`);
  
  // 3. 单例模式
  console.log("\n3. 单例模式:");
  const db1 = new Database("mongodb://localhost:27017");
  const db2 = new Database("mongodb://localhost:27017");
  console.log(`   是同一个实例: ${db1 === db2}`);
  
  // 4. 混入模式
  console.log("\n4. 混入模式:");
  const product = new Product("笔记本电脑", 9999);
  console.log(`   产品名: ${product.name}`);
  console.log(`   序列化: ${(product as any).serialize()}`);
  console.log(`   创建时间: ${(product as any).createdAt}`);
  
  // 5. 验证装饰器
  console.log("\n5. 验证装饰器:");
  try {
    const person1 = new Person("Alice", 25);
    console.log(`   有效人物: ${person1.name}, ${person1.age}`);
    
    const person2 = new Person("", 25); // 这会抛出错误
  } catch (error) {
    console.log(`   验证错误: ${(error as Error).message}`);
  }
  
  // 6. 依赖注入
  console.log("\n6. 依赖注入:");
  const userService = new UserService();
  const users = userService.getUsers();
  console.log(`   用户列表: ${users.join(", ")}`);
  
  // 7. 性能监控
  console.log("\n7. 性能监控:");
  const heavy = new HeavyComputation();
  
  // 8. 事件发射器
  console.log("\n8. 事件发射器:");
  const button = new Button("点击我");
  (button as any).on("click", (text: string) => {
    console.log(`   事件监听器: ${text} 被点击`);
  });
  button.click();
  
  // 9. 缓存装饰器
  console.log("\n9. 缓存装饰器:");
  const config1 = new Configuration("production", false);
  const config2 = new Configuration("production", false);
  console.log(`   是同一个实例: ${config1 === config2}`);
  
  // 10. 序列化装饰器
  console.log("\n10. 序列化装饰器:");
  const settings = new Settings("dark", "zh-CN", true);
  const json = (settings as any).toJSON();
  console.log(`   JSON: ${JSON.stringify(json)}`);
  
  const settings2 = (Settings as any).fromJSON(json);
  console.log(`   反序列化: ${settings2.theme}, ${settings2.language}`);
}

// 主函数
function main(): void {
  console.log("TypeScript 类装饰器示例");
  console.log("========================");
  
  demonstrateClassDecorators();
  
  console.log("\n=== 所有示例执行完成 ===");
}

// 运行示例
if (import.meta.main) {
  main();
}