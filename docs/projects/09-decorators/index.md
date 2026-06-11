# 项目9：装饰器和元数据

## 概述

装饰器（Decorators）是 TypeScript 的一项强大特性，允许你通过声明式的方式修改类、方法、属性和参数的行为。本项目深入探讨 TypeScript 装饰器的各种类型和用法，以及元数据反射（reflect-metadata）的高级应用。

## TypeScript 装饰器概述

### 装饰器概念

装饰器是一种特殊类型的声明，可以附加到类声明、方法、访问器、属性或参数上。装饰器使用 `@expression` 形式，其中 `expression` 必须求值为一个函数，该函数将在运行时被调用，被装饰的声明信息作为参数传入。

### 装饰器类型

TypeScript 支持以下装饰器类型：

1. **类装饰器（Class Decorators）**
2. **方法装饰器（Method Decorators）**
3. **属性装饰器（Property Decorators）**
4. **参数装饰器（Parameter Decorators）**
5. **访问器装饰器（Accessor Decorators）**

### Deno 中的装饰器支持

**重要说明**：在 Deno 中，装饰器支持是实验性的。要使用装饰器，你需要在 `tsconfig.json` 或 `deno.json` 中启用实验性装饰器支持：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

或者使用 Deno 的 `--unstable` 标志：

```bash
deno run --unstable my-file.ts
```

### TypeScript 与 JavaScript 的区别

TypeScript 装饰器与 JavaScript 装饰器的主要区别：

1. **类型安全**：TypeScript 装饰器提供完整的类型检查
2. **元数据反射**：通过 `emitDecoratorMetadata` 选项自动生成元数据
3. **编译时检查**：装饰器参数和返回值在编译时被检查
4. **接口支持**：可以定义装饰器工厂的接口
5. **泛型支持**：装饰器可以使用泛型

## 1. 类装饰器

类装饰器在类声明之前被声明，应用于类构造函数，可以用来监视、修改或替换类定义。

### 基础类装饰器

```typescript
// 基础类装饰器
function Logger<T extends new (...args: any[]) => any>(
  constructor: T
) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      console.log(`创建实例: ${constructor.name}`);
    }
  };
}

@Logger
class MyClass {
  constructor(public name: string) {
    console.log(`MyClass 构造函数: ${name}`);
  }
}

const instance = new MyClass("测试");
// 输出:
// MyClass 构造函数: 测试
// 创建实例: MyClass
```

### 类装饰器工厂

```typescript
// 类装饰器工厂
function WithTimestamp<T extends new (...args: any[]) => any>(
  timestampFormat: string = "YYYY-MM-DD"
) {
  return function (constructor: T) {
    return class extends constructor {
      createdAt: Date = new Date();
      
      getFormattedTimestamp(): string {
        // 简单的日期格式化
        return this.createdAt.toISOString().split("T")[0];
      }
    };
  };
}

@WithTimestamp("YYYY-MM-DD")
class User {
  constructor(public name: string) {}
}

const user = new User("Alice");
console.log(user.createdAt); // 当前时间
console.log(user.getFormattedTimestamp()); // 格式化的时间
```

### 类装饰器替换

```typescript
// 类装饰器替换
function Singleton<T extends new (...args: any[]) => any>(constructor: T) {
  let instance: InstanceType<T>;
  
  return class extends constructor {
    constructor(...args: any[]) {
      if (instance) {
        return instance;
      }
      super(...args);
      instance = this;
    }
  };
}

@Singleton
class Database {
  constructor(public connectionString: string) {
    console.log("数据库连接已创建");
  }
}

const db1 = new Database("mongodb://localhost:27017");
const db2 = new Database("mongodb://localhost:27017");
console.log(db1 === db2); // true - 单例模式
```

## 2. 方法装饰器

方法装饰器在方法声明之前被声明，应用于方法的属性描述符，可以用来监视、修改或替换方法定义。

### 基础方法装饰器

```typescript
// 基础方法装饰器
function Log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    console.log(`调用方法: ${propertyKey}`);
    console.log(`参数: ${JSON.stringify(args)}`);
    
    const result = originalMethod.apply(this, args);
    
    console.log(`返回值: ${JSON.stringify(result)}`);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @Log
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(1, 2);
// 输出:
// 调用方法: add
// 参数: [1,2]
// 返回值: 3
```

### 方法装饰器工厂

```typescript
// 方法装饰器工厂
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

class SearchService {
  @Debounce(500)
  search(query: string): void {
    console.log(`搜索: ${query}`);
  }
}

const searchService = new SearchService();
searchService.search("a");
searchService.search("ab");
searchService.search("abc"); // 只会执行最后一次
```

### 方法装饰器验证

```typescript
// 方法装饰器验证
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
          throw new Error(`验证失败: ${propertyKey}`);
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

class MathService {
  @Validate(isNumber, isPositive)
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error("除数不能为零");
    }
    return a / b;
  }
}

const mathService = new MathService();
try {
  mathService.divide(10, 2); // 正常
  mathService.divide(-10, 2); // 抛出错误
} catch (error) {
  console.error((error as Error).message);
}
```

## 3. 属性装饰器

属性装饰器在属性声明之前被声明，应用于类的属性。

### 基础属性装饰器

```typescript
// 基础属性装饰器
function Required(
  target: any,
  propertyKey: string
) {
  let value: any;
  
  const getter = () => value;
  const setter = (newVal: any) => {
    if (newVal === undefined || newVal === null) {
      throw new Error(`${propertyKey} 是必需的属性`);
    }
    value = newVal;
  };
  
  Object.defineProperty(target, propertyKey, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true,
  });
}

class User {
  @Required
  name!: string;
  
  @Required
  email!: string;
  
  age?: number;
}

const user = new User();
user.name = "Alice"; // 正常
user.email = "alice@example.com"; // 正常
// user.name = null; // 抛出错误
```

### 属性装饰器验证

```typescript
// 属性装饰器验证
function MinLength(min: number) {
  return function (target: any, propertyKey: string) {
    let value: string;
    
    const getter = () => value;
    const setter = (newVal: string) => {
      if (newVal.length < min) {
        throw new Error(`${propertyKey} 长度不能少于 ${min} 个字符`);
      }
      value = newVal;
    };
    
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}

function MaxLength(max: number) {
  return function (target: any, propertyKey: string) {
    let value: string;
    
    const getter = () => value;
    const setter = (newVal: string) => {
      if (newVal.length > max) {
        throw new Error(`${propertyKey} 长度不能超过 ${max} 个字符`);
      }
      value = newVal;
    };
    
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}

class UserProfile {
  @MinLength(2)
  @MaxLength(50)
  username!: string;
  
  @MinLength(5)
  @MaxLength(100)
  bio!: string;
}

const profile = new UserProfile();
profile.username = "alice"; // 正常
profile.bio = "Hello World"; // 正常
// profile.username = "a"; // 抛出错误
```

## 4. 参数装饰器

参数装饰器在参数声明之前被声明，应用于类构造函数或方法的参数。

### 基础参数装饰器

```typescript
// 基础参数装饰器
function LogParam(
  target: any,
  propertyKey: string,
  parameterIndex: number
) {
  console.log(`参数装饰器: ${propertyKey} 的第 ${parameterIndex} 个参数`);
}

class Example {
  greet(@LogParam name: string, @LogParam age: number): string {
    return `Hello, ${name}. You are ${age} years old.`;
  }
}
```

### 参数验证装饰器

```typescript
// 参数验证装饰器
function ValidateParam(validator: (value: any) => boolean, errorMessage: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // 存储验证规则
    const existingValidators: Map<number, Array<{ validator: (value: any) => boolean; message: string }>> = 
      Reflect.getOwnMetadata("validators", target, propertyKey) || new Map();
    
    const paramValidators = existingValidators.get(parameterIndex) || [];
    paramValidators.push({ validator, message: errorMessage });
    existingValidators.set(parameterIndex, paramValidators);
    
    Reflect.defineMetadata("validators", existingValidators, target, propertyKey);
  };
}

// 验证器函数
function IsString(value: any): boolean {
  return typeof value === "string";
}

function IsNumber(value: any): boolean {
  return typeof value === "number" && !isNaN(value);
}

function IsPositive(value: any): boolean {
  return value > 0;
}

class UserService {
  createUser(
    @ValidateParam(IsString, "用户名必须是字符串") username: string,
    @ValidateParam(IsNumber, "年龄必须是数字") @ValidateParam(IsPositive, "年龄必须是正数") age: number
  ): void {
    console.log(`创建用户: ${username}, 年龄: ${age}`);
  }
}
```

## 5. 访问器装饰器

访问器装饰器在访问器声明之前被声明，应用于访问器的属性描述符。

### 基础访问器装饰器

```typescript
// 基础访问器装饰器
function Enumerable(value: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.enumerable = value;
    return descriptor;
  };
}

class Person {
  private _name: string;
  
  constructor(name: string) {
    this._name = name;
  }
  
  @Enumerable(true)
  get name(): string {
    return this._name;
  }
  
  @Enumerable(false)
  get secret(): string {
    return "这是秘密";
  }
}
```

## 6. 装饰器工厂

装饰器工厂是一个返回装饰器函数的函数，允许你自定义装饰器的行为。

### 参数化工厂

```typescript
// 参数化工厂
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
      console.log(`方法 ${propertyKey} 被节流`);
    };
    
    return descriptor;
  };
}

class EventHandler {
  @Throttle(1000)
  handleClick(): void {
    console.log("点击事件处理");
  }
}
```

### 配置化工厂

```typescript
// 配置化工厂
interface CacheOptions {
  ttl: number; // 缓存时间（毫秒）
  maxSize: number; // 最大缓存大小
}

function Cache(options: CacheOptions) {
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
      
      if (cached && now - cached.timestamp < options.ttl) {
        console.log(`缓存命中: ${propertyKey}`);
        return cached.value;
      }
      
      // 清理过期缓存
      if (cache.size >= options.maxSize) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey) {
          cache.delete(oldestKey);
        }
      }
      
      const result = originalMethod.apply(this, args);
      cache.set(key, { value: result, timestamp: now });
      
      console.log(`缓存更新: ${propertyKey}`);
      return result;
    };
    
    return descriptor;
  };
}

class DataService {
  @Cache({ ttl: 5000, maxSize: 100 })
  fetchData(id: string): any {
    console.log(`获取数据: ${id}`);
    return { id, data: `数据 ${id}` };
  }
}
```

## 7. 元数据反射（reflect-metadata）

元数据反射允许你在运行时访问和操作装饰器附加的元数据。

### 安装和配置

```typescript
// 安装 reflect-metadata
// npm install reflect-metadata
// 或在 Deno 中:
// import "https://deno.land/x/reflect_metadata/mod.ts";

// 在 deno.json 中配置:
// {
//   "compilerOptions": {
//     "emitDecoratorMetadata": true,
//     "experimentalDecorators": true
//   }
// }
```

### 基础元数据操作

```typescript
// 基础元数据操作
import "https://deno.land/x/reflect_metadata/mod.ts";

// 定义元数据
function Role(role: string) {
  return function (target: any) {
    Reflect.defineMetadata("role", role, target);
  };
}

@Role("admin")
class AdminService {
  // ...
}

// 读取元数据
const role = Reflect.getMetadata("role", AdminService);
console.log(role); // "admin"
```

### 方法元数据

```typescript
// 方法元数据
function Route(path: string, method: string = "GET") {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata("route", { path, method }, target, propertyKey);
  };
}

function Middleware(...middleware: Function[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata("middleware", middleware, target, propertyKey);
  };
}

class UserController {
  @Route("/users", "GET")
  @Middleware(authMiddleware, loggingMiddleware)
  getUsers(): void {
    // ...
  }
  
  @Route("/users/:id", "GET")
  getUser(): void {
    // ...
  }
}

// 读取路由信息
const routes = Object.getOwnPropertyNames(UserController.prototype)
  .filter((key) => key !== "constructor")
  .map((key) => {
    const route = Reflect.getMetadata("route", UserController.prototype, key);
    const middleware = Reflect.getMetadata("middleware", UserController.prototype, key);
    return { method: key, route, middleware };
  });

console.log(routes);
```

## 8. 装饰器组合

装饰器可以组合使用，从下往上执行。

### 装饰器执行顺序

```typescript
// 装饰器执行顺序示例
function First() {
  console.log("First(): 工厂求值");
  return function (target: any) {
    console.log("First(): 装饰器应用");
  };
}

function Second() {
  console.log("Second(): 工厂求值");
  return function (target: any) {
    console.log("Second(): 装饰器应用");
  };
}

@First()
@Second()
class Example {
  // 输出顺序:
  // Second(): 工厂求值
  // First(): 工厂求值
  // Second(): 装饰器应用
  // First(): 装饰器应用
}
```

### 组合装饰器

```typescript
// 组合装饰器
function Compose(...decorators: Array<ClassDecorator>) {
  return function (target: Function) {
    for (const decorator of decorators) {
      decorator(target);
    }
  };
}

// 使用组合装饰器
const EnhancedClass = Compose(
  Logger,
  WithTimestamp(),
  Singleton
);

@EnhancedClass
class EnhancedService {
  constructor(public name: string) {}
}
```

## 9. 示例代码说明

本项目包含以下示例文件：

### class-decorators.ts
- 类装饰器基础
- 类装饰器工厂
- 类装饰器替换
- 单例模式
- 混入模式

### method-decorators.ts
- 方法装饰器基础
- 方法装饰器工厂
- 验证装饰器
- 缓存装饰器
- 日志装饰器

### decorators.ts
- 综合装饰器示例
- 元数据反射
- 装饰器组合
- 实际应用案例

## 10. 练习题

### 练习1：类装饰器
实现一个类装饰器，自动为类添加序列化方法：

```typescript
// 要求：
// 1. 创建 Serializable 装饰器
// 2. 自动添加 toJSON() 方法
// 3. 自动添加 fromJSON() 静态方法
// 4. 支持嵌套对象序列化

@Serializable
class User {
  constructor(public name: string, public age: number) {}
}

const user = new User("Alice", 25);
const json = user.toJSON(); // { name: "Alice", age: 25 }
const user2 = User.fromJSON(json); // User { name: "Alice", age: 25 }
```

### 练习2：方法装饰器
实现一个重试装饰器：

```typescript
// 要求：
// 1. 创建 Retry 装饰器工厂
// 2. 支持配置最大重试次数
// 3. 支持配置重试延迟
// 4. 支持条件重试（只在特定错误时重试）

class ApiService {
  @Retry({ maxRetries: 3, delay: 1000 })
  async fetchData(url: string): Promise<any> {
    // 可能失败的网络请求
  }
}
```

### 练习3：属性装饰器
实现一个计算属性装饰器：

```typescript
// 要求：
// 1. 创建 Computed 装饰器
// 2. 自动计算属性值
// 3. 支持依赖追踪
// 4. 支持缓存

class Circle {
  radius: number = 5;
  
  @Computed()
  get area(): number {
    return Math.PI * this.radius * this.radius;
  }
  
  @Computed()
  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }
}
```

### 练习4：装饰器组合
实现一个完整的 MVC 框架装饰器：

```typescript
// 要求：
// 1. 创建 Controller 装饰器
// 2. 创建 Get, Post, Put, Delete 装饰器
// 3. 创建 Param, Query, Body 装饰器
// 4. 支持中间件
// 5. 支持参数验证

@Controller("/users")
class UserController {
  @Get("/")
  @Middleware(authMiddleware)
  getUsers(@Query("page") page: number): User[] {
    // ...
  }
  
  @Post("/")
  @Validate(CreateUserSchema)
  createUser(@Body() userData: CreateUserDto): User {
    // ...
  }
}
```

### 练习5：元数据反射
实现一个依赖注入容器：

```typescript
// 要求：
// 1. 创建 Injectable 装饰器
// 2. 创建 Inject 装饰器
// 3. 实现依赖解析
// 4. 支持单例和瞬态生命周期

@Injectable()
class UserService {
  constructor(@Inject(Database) private db: Database) {}
  
  async getUsers(): Promise<User[]> {
    return this.db.query("SELECT * FROM users");
  }
}

@Injectable()
class UserController {
  constructor(@Inject(UserService) private userService: UserService) {}
  
  @Get("/users")
  async getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }
}
```

## 运行示例

```bash
# 运行类装饰器示例
deno run --unstable class-decorators.ts

# 运行方法装饰器示例
deno run --unstable method-decorators.ts

# 运行综合装饰器示例
deno run --unstable decorators.ts

# 检查类型
deno check --unstable *.ts

# 格式化代码
deno fmt
```

## 总结

TypeScript 装饰器提供了强大的元编程能力：

1. **类装饰器**：修改类的行为，实现单例、混入等模式
2. **方法装饰器**：添加日志、验证、缓存等横切关注点
3. **属性装饰器**：实现属性验证和计算属性
4. **参数装饰器**：实现参数验证和依赖注入
5. **装饰器工厂**：创建可配置的装饰器
6. **元数据反射**：在运行时访问和操作元数据
7. **装饰器组合**：组合多个装饰器实现复杂功能

掌握装饰器对于开发大型 TypeScript 应用程序至关重要，特别是在实现框架、库和中间件时。装饰器使得代码更加声明式、可维护和可扩展。

**注意**：在 Deno 中使用装饰器时，需要启用实验性装饰器支持。随着 TypeScript 装饰器标准的演进，API 可能会发生变化。

---

## 项目导航

[上一个项目：错误处理和测试](/projects/08-error-testing/)

[下一个项目：CLI工具](/projects/10-cli-tool/)

[返回学习路径](/learning-path/)
