/**
 * TypeScript 综合装饰器示例
 * 演示装饰器组合、元数据反射和实际应用案例
 * 运行环境: Deno (需要 --unstable 标志)
 */

// 注意：在 Deno 中运行需要使用 --unstable 标志
// deno run --unstable decorators.ts

// 元数据存储系统（替代 Reflect.defineMetadata）
class MetadataStorage {
  private static instance: MetadataStorage;
  private metadata: Map<string, Map<string, any>> = new Map();

  static getInstance(): MetadataStorage {
    if (!MetadataStorage.instance) {
      MetadataStorage.instance = new MetadataStorage();
    }
    return MetadataStorage.instance;
  }

  private getKey(target: any, propertyKey?: string): string {
    const targetKey = target.name || target.constructor?.name || String(target);
    return propertyKey ? `${targetKey}:${propertyKey}` : targetKey;
  }

  define(key: string, value: any, target: any, propertyKey?: string): void {
    const fullKey = this.getKey(target, propertyKey);
    if (!this.metadata.has(fullKey)) {
      this.metadata.set(fullKey, new Map());
    }
    this.metadata.get(fullKey)!.set(key, value);
  }

  get(key: string, target: any, propertyKey?: string): any {
    const fullKey = this.getKey(target, propertyKey);
    return this.metadata.get(fullKey)?.get(key);
  }
}

// 全局元数据存储实例
const metadataStorage = MetadataStorage.getInstance();

// 1. 元数据反射装饰器
function DefineMetadata(key: string, value: any) {
  return function (target: any, propertyKey?: string) {
    metadataStorage.define(key, value, target, propertyKey);
  };
}

function GetMetadata(key: string) {
  return function (target: any, propertyKey?: string) {
    return metadataStorage.get(key, target, propertyKey);
  };
}

// 2. 路由装饰器（MVC 模式）
interface RouteDefinition {
  path: string;
  method: string;
  handler: string;
}

function Controller(path: string) {
  return function (target: Function) {
    metadataStorage.define("basePath", path, target);
    console.log(`Controller: 注册控制器路径 ${path}`);
  };
}

function Route(path: string, method: string = "GET") {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const routes: RouteDefinition[] = metadataStorage.get("routes", target.constructor) || [];
    routes.push({ path, method, handler: propertyKey });
    metadataStorage.define("routes", routes, target.constructor);
    console.log(`Route: 注册路由 ${method} ${path} -> ${propertyKey}`);
  };
}

// HTTP 方法装饰器
function Get(path: string) {
  return Route(path, "GET");
}

function Post(path: string) {
  return Route(path, "POST");
}

function Put(path: string) {
  return Route(path, "PUT");
}

function Delete(path: string) {
  return Route(path, "DELETE");
}

// 3. 中间件装饰器
function Middleware(...middleware: Function[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const middlewares: Map<string, Function[]> =
      metadataStorage.get("middlewares", target.constructor) || new Map();
    middlewares.set(propertyKey, middleware);
    metadataStorage.define("middlewares", middlewares, target.constructor);
    console.log(`Middleware: 为 ${propertyKey} 注册中间件`);
  };
}

// 4. 参数装饰器
function Param(name: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const params: Map<number, { type: string; name: string }> =
      metadataStorage.get("params", target, propertyKey) || new Map();
    params.set(parameterIndex, { type: "param", name });
    metadataStorage.define("params", params, target, propertyKey);
    console.log(`Param: 注册参数 ${name} 在位置 ${parameterIndex}`);
  };
}

function Query(name: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const params: Map<number, { type: string; name: string }> =
      metadataStorage.get("params", target, propertyKey) || new Map();
    params.set(parameterIndex, { type: "query", name });
    metadataStorage.define("params", params, target, propertyKey);
    console.log(`Query: 注册查询参数 ${name} 在位置 ${parameterIndex}`);
  };
}

function Body() {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const params: Map<number, { type: string; name: string }> =
      metadataStorage.get("params", target, propertyKey) || new Map();
    params.set(parameterIndex, { type: "body", name: "body" });
    metadataStorage.define("params", params, target, propertyKey);
    console.log(`Body: 注册请求体在位置 ${parameterIndex}`);
  };
}

// 5. 验证装饰器
function ValidateDto(schema: any) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // 简单的验证逻辑
      const body = args.find((arg) => typeof arg === "object" && arg !== null);
      if (body) {
        for (const key of Object.keys(schema)) {
          if (schema[key].required && !(key in body)) {
            throw new Error(`验证失败: 缺少必需字段 ${key}`);
          }
          if (schema[key].type && typeof body[key] !== schema[key].type) {
            throw new Error(`验证失败: ${key} 类型应为 ${schema[key].type}`);
          }
        }
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// 6. 缓存装饰器（带元数据）
function Cacheable(ttl: number = 5000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cache = new Map<string, { value: any; timestamp: number }>();

    // 存储缓存配置
    metadataStorage.define("cacheable", { ttl }, target, propertyKey);

    descriptor.value = function (...args: any[]) {
      const key = `${propertyKey}:${JSON.stringify(args)}`;
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

// 7. 依赖注入装饰器
const DIContainer = new Map<string, any>();

function Injectable(token?: string) {
  return function (target: Function) {
    const identifier = token || target.name;
    DIContainer.set(identifier, target);
    console.log(`Injectable: 注册 ${identifier}`);
  };
}

function Inject(token: string) {
  return function (target: any, propertyKey: string) {
    const constructor = DIContainer.get(token);
    if (constructor) {
      Object.defineProperty(target, propertyKey, {
        value: new constructor(),
        writable: false,
        enumerable: true,
        configurable: true,
      });
    }
  };
}

// 8. 生命周期装饰器
function OnInit() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    metadataStorage.define("lifecycle", "init", target, propertyKey);
    console.log(`OnInit: 标记 ${propertyKey} 为初始化方法`);
    return descriptor;
  };
}

function OnDestroy() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    metadataStorage.define("lifecycle", "destroy", target, propertyKey);
    console.log(`OnDestroy: 标记 ${propertyKey} 为销毁方法`);
    return descriptor;
  };
}

// 9. 事件装饰器
function OnEvent(eventName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const events: Map<string, string[]> =
      metadataStorage.get("events", target.constructor) || new Map();
    const handlers = events.get(eventName) || [];
    handlers.push(propertyKey);
    events.set(eventName, handlers);
    metadataStorage.define("events", events, target.constructor);
    console.log(`OnEvent: 注册事件处理器 ${eventName} -> ${propertyKey}`);
    return descriptor;
  };
}

// 10. 权限装饰器
function RequiresPermission(permission: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // 模拟权限检查
      const user = (this as any).currentUser;
      if (!user || !user.permissions.includes(permission)) {
        throw new Error(`权限不足: 需要 ${permission} 权限`);
      }

      return originalMethod.apply(this, args);
    };

    // 存储权限要求
    const permissions: Map<string, string> =
      metadataStorage.get("permissions", target.constructor) || new Map();
    permissions.set(propertyKey, permission);
    metadataStorage.define("permissions", permissions, target.constructor);

    return descriptor;
  };
}

// 示例类：MVC 控制器
@Controller("/api/users")
class UserController {
  private users = [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
  ];

  @Get("/")
  @Cacheable(10000)
  getUsers(): any[] {
    console.log("获取所有用户");
    return this.users;
  }

  @Get("/:id")
  getUser(@Param("id") id: string): any {
    console.log(`获取用户: ${id}`);
    return this.users.find((u) => u.id === parseInt(id));
  }

  @Post("/")
  @ValidateDto({
    name: { required: true, type: "string" },
    email: { required: true, type: "string" },
  })
  createUser(@Body() userData: any): any {
    console.log(`创建用户: ${JSON.stringify(userData)}`);
    const newUser = { id: Date.now(), ...userData };
    this.users.push(newUser);
    return newUser;
  }

  @Put("/:id")
  @RequiresPermission("user:update")
  updateUser(@Param("id") id: string, @Body() userData: any): any {
    console.log(`更新用户 ${id}: ${JSON.stringify(userData)}`);
    const index = this.users.findIndex((u) => u.id === parseInt(id));
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...userData };
      return this.users[index];
    }
    throw new Error("用户不存在");
  }

  @Delete("/:id")
  @RequiresPermission("user:delete")
  deleteUser(@Param("id") id: string): void {
    console.log(`删除用户: ${id}`);
    const index = this.users.findIndex((u) => u.id === parseInt(id));
    if (index !== -1) {
      this.users.splice(index, 1);
    } else {
      throw new Error("用户不存在");
    }
  }
}

// 示例类：依赖注入
@Injectable("Logger")
class AppLogger {
  log(message: string): void {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
  }

  error(message: string): void {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
  }
}

@Injectable("UserService")
class UserService {
  private logger: AppLogger;

  private users: Map<string, any> = new Map();

  constructor() {
    // 简化依赖注入：直接创建 logger 实例
    this.logger = new AppLogger();
  }

  @OnInit()
  initialize(): void {
    this.logger.log("UserService 初始化");
    this.users.set("1", { id: "1", name: "Alice" });
    this.users.set("2", { id: "2", name: "Bob" });
  }

  @OnDestroy()
  cleanup(): void {
    this.logger.log("UserService 清理");
    this.users.clear();
  }

  getUsers(): any[] {
    this.logger.log("获取用户列表");
    return Array.from(this.users.values());
  }

  getUser(id: string): any {
    this.logger.log(`获取用户: ${id}`);
    return this.users.get(id);
  }

  createUser(user: any): any {
    this.logger.log(`创建用户: ${JSON.stringify(user)}`);
    this.users.set(user.id, user);
    return user;
  }
}

// 示例类：事件处理
class Application extends EventTarget {
  private eventHandlers: Map<string, Function[]> = new Map();

  @OnEvent("app:start")
  onStart(): void {
    console.log("应用程序启动");
  }

  @OnEvent("app:stop")
  onStop(): void {
    console.log("应用程序停止");
  }

  @OnEvent("user:login")
  onUserLogin(user: any): void {
    console.log(`用户登录: ${user.name}`);
  }

  @OnEvent("user:logout")
  onUserLogout(user: any): void {
    console.log(`用户登出: ${user.name}`);
  }

  emitEvent(eventName: string, data?: any): void {
    const events: Map<string, string[]> =
      metadataStorage.get("events", Application) || new Map();
    const handlers = events.get(eventName) || [];

    for (const handler of handlers) {
      (this as any)[handler](data);
    }
  }
}

// 示例类：配置管理
class ConfigManager {
  private config: Map<string, any> = new Map();
  
  @DefineMetadata("configurable", true)
  set(key: string, value: any): void {
    this.config.set(key, value);
    console.log(`配置设置: ${key} = ${value}`);
  }
  
  @GetMetadata("configurable")
  get(key: string): any {
    return this.config.get(key);
  }
  
  getAll(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of this.config) {
      result[key] = value;
    }
    return result;
  }
}

// 路由器类
class Router {
  private controllers: Map<string, any> = new Map();

  registerController(controller: any): void {
    const basePath = metadataStorage.get("basePath", controller);
    this.controllers.set(basePath, new controller());
    console.log(`Router: 注册控制器 ${basePath}`);
  }

  getRoutes(): RouteDefinition[] {
    const routes: RouteDefinition[] = [];

    for (const [basePath, controller] of this.controllers) {
      const controllerRoutes: RouteDefinition[] =
        metadataStorage.get("routes", controller.constructor) || [];

      for (const route of controllerRoutes) {
        routes.push({
          path: `${basePath}${route.path}`,
          method: route.method,
          handler: `${controller.constructor.name}.${route.handler}`,
        });
      }
    }

    return routes;
  }

  printRoutes(): void {
    const routes = this.getRoutes();
    console.log("\n已注册路由:");
    for (const route of routes) {
      console.log(`  ${route.method} ${route.path} -> ${route.handler}`);
    }
  }
}

// 演示函数
function demonstrateDecorators(): void {
  console.log("\n=== 综合装饰器演示 ===");

  // 1. MVC 控制器演示
  console.log("\n1. MVC 控制器演示:");
  const router = new Router();
  router.registerController(UserController);
  router.printRoutes();

  const userController = new UserController();

  // 获取所有用户
  const users = userController.getUsers();
  console.log(`用户数量: ${users.length}`);

  // 获取单个用户
  const user = userController.getUser("1");
  console.log(`用户: ${JSON.stringify(user)}`);

  // 创建用户
  try {
    const newUser = userController.createUser({
      name: "Charlie",
      email: "charlie@example.com",
    });
    console.log(`新用户: ${JSON.stringify(newUser)}`);
  } catch (error) {
    console.error(`创建用户失败: ${(error as Error).message}`);
  }

  // 验证失败
  try {
    userController.createUser({
      name: "David",
      // 缺少 email 字段
    });
  } catch (error) {
    console.error(`验证失败: ${(error as Error).message}`);
  }

  // 2. 依赖注入演示
  console.log("\n2. 依赖注入演示:");
  const userService = new UserService();
  userService.initialize();

  const allUsers = userService.getUsers();
  console.log(`用户列表: ${JSON.stringify(allUsers)}`);

  userService.cleanup();

  // 3. 事件处理演示
  console.log("\n3. 事件处理演示:");
  const app = new Application();
  app.emitEvent("app:start");
  app.emitEvent("user:login", { name: "Alice" });
  app.emitEvent("user:logout", { name: "Alice" });
  app.emitEvent("app:stop");

  // 4. 配置管理演示
  console.log("\n4. 配置管理演示:");
  const config = new ConfigManager();
  config.set("app.name", "TypeScript App");
  config.set("app.version", "1.0.0");
  config.set("debug", true);

  console.log(`应用名称: ${config.get("app.name")}`);
  console.log(`所有配置: ${JSON.stringify(config.getAll())}`);

  // 5. 元数据反射演示
  console.log("\n5. 元数据反射演示:");

  // 检查路由元数据
  const routes = metadataStorage.get("routes", UserController);
  console.log(`UserController 路由数量: ${routes?.length || 0}`);

  // 检查中间件元数据
  const middlewares = metadataStorage.get("middlewares", UserController);
  console.log(`UserController 中间件: ${middlewares ? "有" : "无"}`);

  // 检查权限元数据
  const permissions = metadataStorage.get("permissions", UserController);
  console.log(`UserController 权限: ${permissions ? "有" : "无"}`);

  // 检查生命周期元数据
  const lifecycleMethods = Object.getOwnPropertyNames(UserService.prototype)
    .filter((key) => {
      const lifecycle = metadataStorage.get("lifecycle", UserService.prototype, key);
      return lifecycle;
    });
  console.log(`UserService 生命周期方法: ${lifecycleMethods.join(", ")}`);
}

// 装饰器组合演示
function demonstrateDecoratorComposition(): void {
  console.log("\n=== 装饰器组合演示 ===");
  
  // 创建一个使用多个装饰器的类
  @Controller("/api/products")
  class ProductController {
    private products = [
      { id: 1, name: "笔记本电脑", price: 9999 },
      { id: 2, name: "键盘", price: 599 },
    ];
    
    @Get("/")
    @Cacheable(5000)
    getProducts(): any[] {
      console.log("获取所有产品");
      return this.products;
    }
    
    @Get("/:id")
    getProduct(@Param("id") id: string): any {
      console.log(`获取产品: ${id}`);
      return this.products.find((p) => p.id === parseInt(id));
    }
    
    @Post("/")
    @RequiresPermission("product:create")
    @ValidateDto({
      name: { required: true, type: "string" },
      price: { required: true, type: "number" },
    })
    createProduct(@Body() productData: any): any {
      console.log(`创建产品: ${JSON.stringify(productData)}`);
      const newProduct = { id: Date.now(), ...productData };
      this.products.push(newProduct);
      return newProduct;
    }
  }
  
  const productController = new ProductController();
  
  // 获取产品
  const products = productController.getProducts();
  console.log(`产品数量: ${products.length}`);
  
  // 创建产品
  try {
    const newProduct = productController.createProduct({
      name: "鼠标",
      price: 299,
    });
    console.log(`新产品: ${JSON.stringify(newProduct)}`);
  } catch (error) {
    console.error(`创建产品失败: ${(error as Error).message}`);
  }
  
  // 验证失败
  try {
    productController.createProduct({
      name: "显示器",
      price: "2999", // 类型错误
    });
  } catch (error) {
    console.error(`验证失败: ${(error as Error).message}`);
  }
}

// 主函数
function main(): void {
  console.log("TypeScript 综合装饰器示例");
  console.log("==========================");
  
  demonstrateDecorators();
  demonstrateDecoratorComposition();
  
  console.log("\n=== 所有示例执行完成 ===");
}

// 运行示例
if (import.meta.main) {
  main();
}