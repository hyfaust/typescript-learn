/**
 * TypeScript Deno 测试示例
 * 演示 Deno 测试框架、断言和测试最佳实践
 * 运行环境: Deno
 */

// 导入断言库
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
} from "https://deno.land/std@0.208.0/assert/mod.ts";

// 类型定义
interface Calculator {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
  multiply(a: number, b: number): number;
  divide(a: number, b: number): number;
  factorial(n: number): number;
}

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

interface UserService {
  createUser(name: string, email: string, age: number): User;
  validateUser(user: User): boolean;
  findUser(users: User[], id: string): User | undefined;
  filterAdults(users: User[]): User[];
}

// 1. 基础测试
Deno.test("基础测试示例", () => {
  // 简单断言
  assert(1 === 1, "1 应该等于 1");
  assert(true, "true 应该为真");
  
  // 相等断言
  assertEquals(1 + 1, 2, "1 + 1 应该等于 2");
  assertEquals("hello", "hello", "字符串应该相等");
  assertEquals([1, 2, 3], [1, 2, 3], "数组应该深度相等");
  assertEquals({ a: 1, b: 2 }, { a: 1, b: 2 }, "对象应该深度相等");
  
  // 不相等断言
  assertNotEquals(1, 2, "1 和 2 不应该相等");
  assertNotEquals("hello", "world", "字符串不应该相等");
  
  // 严格相等（引用相同）
  const obj = { a: 1 };
  assertStrictEquals(obj, obj, "相同引用应该严格相等");
});

// 2. 类型断言
Deno.test("类型断言示例", () => {
  // 类型检查
  assertInstanceOf(new Error(), Error, "应该是 Error 实例");
  assertInstanceOf(new TypeError(), TypeError, "应该是 TypeError 实例");
  assertInstanceOf(new Date(), Date, "应该是 Date 实例");
  assertInstanceOf([], Array, "应该是 Array 实例");
  assertInstanceOf({}, Object, "应该是 Object 实例");
});

// 3. 集合断言
Deno.test("集合断言示例", () => {
  // 数组包含
  assertArrayIncludes([1, 2, 3], [1, 2], "数组应该包含 [1, 2]");
  assertArrayIncludes(["a", "b", "c"], ["a"], "数组应该包含 'a'");
  assertArrayIncludes(
    [{ id: 1 }, { id: 2 }, { id: 3 }],
    [{ id: 1 }],
    "数组应该包含对象"
  );
  
  // 字符串包含
  assertStringIncludes("hello world", "hello", "字符串应该包含 'hello'");
  assertStringIncludes("TypeScript", "Script", "字符串应该包含 'Script'");
  assertStringIncludes("Deno", "Den", "字符串应该包含 'Den'");
});

// 4. 正则表达式断言
Deno.test("正则表达式断言示例", () => {
  // 正则匹配
  assertMatch("hello123", /\d+/, "应该匹配数字");
  assertMatch("test@example.com", /^[\w.-]+@[\w.-]+\.\w+$/, "应该匹配邮箱格式");
  assertMatch("2024-01-01", /^\d{4}-\d{2}-\d{2}$/, "应该匹配日期格式");
  
  // 正则不匹配
  assertNotMatch("hello", /\d+/, "不应该匹配数字");
  assertNotMatch("hello", /^test$/, "不应该匹配 'test'");
});

// 5. 对象匹配断言
Deno.test("对象匹配断言示例", () => {
  // 部分匹配
  assertObjectMatch(
    { a: 1, b: 2, c: 3 },
    { a: 1, b: 2 },
    "对象应该包含指定属性"
  );
  
  assertObjectMatch(
    { name: "Alice", age: 25, email: "alice@example.com" },
    { name: "Alice", age: 25 },
    "用户对象应该包含姓名和年龄"
  );
  
  // 嵌套对象匹配
  assertObjectMatch(
    { user: { name: "Alice", address: { city: "北京" } } },
    { user: { name: "Alice" } },
    "应该匹配嵌套对象"
  );
});

// 6. 错误断言
Deno.test("错误断言示例", () => {
  // 同步错误断言
  assertThrows(
    () => {
      throw new Error("测试错误");
    },
    Error,
    "测试错误",
    "应该抛出错误"
  );
  
  // 指定错误类型
  assertThrows(
    () => {
      throw new TypeError("类型错误");
    },
    TypeError,
    "类型错误",
    "应该抛出 TypeError"
  );
  
  // 范围错误
  assertThrows(
    () => {
      throw new RangeError("数值超出范围");
    },
    RangeError,
    "数值超出范围",
    "应该抛出 RangeError"
  );
  
  // 正则表达式匹配错误消息
  const error = assertThrows(
    () => {
      throw new Error("错误代码: 123");
    },
    Error,
    "错误代码",
    "错误消息应包含错误代码"
  );
  assertMatch(error.message, /错误代码: \d+/, "错误消息应该匹配模式");
});

// 7. 异步错误断言
Deno.test("异步错误断言示例", async () => {
  // 异步错误断言
  await assertRejects(
    async () => {
      throw new Error("异步错误");
    },
    Error,
    "异步错误",
    "应该抛出异步错误"
  );
  
  // Promise 错误
  await assertRejects(
    () => Promise.reject(new Error("Promise 错误")),
    Error,
    "Promise 错误",
    "Promise 应该被拒绝"
  );
  
  // 异步超时错误
  await assertRejects(
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      throw new Error("超时错误");
    },
    Error,
    "超时错误",
    "应该抛出超时错误"
  );
});

// 8. 自定义断言函数
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

function assertValidEmail(email: string, msg?: string): void {
  const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
  if (!emailRegex.test(email)) {
    throw new Error(msg || `Invalid email format: ${email}`);
  }
}

Deno.test("自定义断言示例", () => {
  // 使用自定义断言
  const value: unknown = "hello";
  assertIsString(value, "值应该是字符串");
  console.log(value.toUpperCase()); // 类型安全
  
  const num: unknown = 42;
  assertIsNumber(num, "值应该是数字");
  assertIsPositive(num, "数字应该是正数");
  
  const arr = [1, 2, 3];
  assertArrayNotEmpty(arr, "数组不应为空");
  
  assertValidEmail("test@example.com", "邮箱格式应该有效");
});

// 9. 计算器实现和测试
class CalculatorImpl implements Calculator {
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

// 计算器测试套件
Deno.test("Calculator 测试套件", async (t) => {
  const calculator = new CalculatorImpl();
  
  await t.step("add 方法", () => {
    assertEquals(calculator.add(1, 1), 2);
    assertEquals(calculator.add(-1, 1), 0);
    assertEquals(calculator.add(0, 0), 0);
    assertEquals(calculator.add(1.5, 2.5), 4);
  });
  
  await t.step("subtract 方法", () => {
    assertEquals(calculator.subtract(5, 3), 2);
    assertEquals(calculator.subtract(3, 5), -2);
    assertEquals(calculator.subtract(0, 0), 0);
  });
  
  await t.step("multiply 方法", () => {
    assertEquals(calculator.multiply(2, 3), 6);
    assertEquals(calculator.multiply(-2, 3), -6);
    assertEquals(calculator.multiply(0, 5), 0);
  });
  
  await t.step("divide 方法", () => {
    assertEquals(calculator.divide(6, 3), 2);
    assertEquals(calculator.divide(5, 2), 2.5);
    assertEquals(calculator.divide(0, 5), 0);
    
    // 测试错误情况
    assertThrows(
      () => calculator.divide(5, 0),
      RangeError,
      "除数不能为零"
    );
  });
  
  await t.step("factorial 方法", () => {
    assertEquals(calculator.factorial(0), 1);
    assertEquals(calculator.factorial(1), 1);
    assertEquals(calculator.factorial(5), 120);
    assertEquals(calculator.factorial(10), 3628800);
    
    // 测试错误情况
    assertThrows(
      () => calculator.factorial(-1),
      RangeError,
      "n 不能为负数"
    );
  });
});

// 10. 用户服务实现和测试
class UserServiceImpl implements UserService {
  private users: User[] = [];
  
  createUser(name: string, email: string, age: number): User {
    // 验证输入
    if (!name || name.trim().length === 0) {
      throw new Error("姓名不能为空");
    }
    
    if (!email || !this.isValidEmail(email)) {
      throw new Error("邮箱格式无效");
    }
    
    if (age < 0 || age > 150) {
      throw new RangeError("年龄必须在 0-150 之间");
    }
    
    // 检查邮箱是否已存在
    if (this.users.some((user) => user.email === email)) {
      throw new Error("邮箱已存在");
    }
    
    const user: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      age,
    };
    
    this.users.push(user);
    return user;
  }
  
  validateUser(user: User): boolean {
    return (
      user.id.length > 0 &&
      user.name.length > 0 &&
      this.isValidEmail(user.email) &&
      user.age >= 0 &&
      user.age <= 150
    );
  }
  
  findUser(users: User[], id: string): User | undefined {
    return users.find((user) => user.id === id);
  }
  
  filterAdults(users: User[]): User[] {
    return users.filter((user) => user.age >= 18);
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
    return emailRegex.test(email);
  }
}

// 用户服务测试套件
Deno.test("UserService 测试套件", async (t) => {
  let userService: UserServiceImpl;
  
  // 测试前设置
  const setup = () => {
    userService = new UserServiceImpl();
  };
  
  await t.step("createUser - 成功创建", () => {
    setup();
    const user = userService.createUser("Alice", "alice@example.com", 25);
    
    assertEquals(user.name, "Alice");
    assertEquals(user.email, "alice@example.com");
    assertEquals(user.age, 25);
    assert(user.id.length > 0, "应该生成 ID");
  });
  
  await t.step("createUser - 邮箱自动小写", () => {
    setup();
    const user = userService.createUser("Bob", "Bob@Example.COM", 30);
    
    assertEquals(user.email, "bob@example.com");
  });
  
  await t.step("createUser - 姓名不能为空", () => {
    setup();
    assertThrows(
      () => userService.createUser("", "test@example.com", 25),
      Error,
      "姓名不能为空"
    );
    
    assertThrows(
      () => userService.createUser("   ", "test@example.com", 25),
      Error,
      "姓名不能为空"
    );
  });
  
  await t.step("createUser - 邮箱格式验证", () => {
    setup();
    assertThrows(
      () => userService.createUser("Alice", "invalid-email", 25),
      Error,
      "邮箱格式无效"
    );
    
    assertThrows(
      () => userService.createUser("Alice", "", 25),
      Error,
      "邮箱格式无效"
    );
  });
  
  await t.step("createUser - 年龄范围验证", () => {
    setup();
    assertThrows(
      () => userService.createUser("Alice", "alice@example.com", -1),
      RangeError,
      "年龄必须在 0-150 之间"
    );
    
    assertThrows(
      () => userService.createUser("Alice", "alice@example.com", 151),
      RangeError,
      "年龄必须在 0-150 之间"
    );
  });
  
  await t.step("createUser - 邮箱重复检查", () => {
    setup();
    userService.createUser("Alice", "alice@example.com", 25);
    
    assertThrows(
      () => userService.createUser("Bob", "alice@example.com", 30),
      Error,
      "邮箱已存在"
    );
  });
  
  await t.step("validateUser - 有效用户", () => {
    setup();
    const user = userService.createUser("Alice", "alice@example.com", 25);
    
    assert(userService.validateUser(user), "有效用户应该通过验证");
  });
  
  await t.step("validateUser - 无效用户", () => {
    setup();
    
    // 无效邮箱
    const invalidEmailUser: User = {
      id: "123",
      name: "Alice",
      email: "invalid",
      age: 25,
    };
    assert(!userService.validateUser(invalidEmailUser), "无效邮箱应该失败");
    
    // 空姓名
    const emptyNameUser: User = {
      id: "123",
      name: "",
      email: "alice@example.com",
      age: 25,
    };
    assert(!userService.validateUser(emptyNameUser), "空姓名应该失败");
    
    // 无效年龄
    const invalidAgeUser: User = {
      id: "123",
      name: "Alice",
      email: "alice@example.com",
      age: -1,
    };
    assert(!userService.validateUser(invalidAgeUser), "无效年龄应该失败");
  });
  
  await t.step("findUser - 找到用户", () => {
    setup();
    const user = userService.createUser("Alice", "alice@example.com", 25);
    const users = [user];
    
    const found = userService.findUser(users, user.id);
    assertEquals(found?.name, "Alice");
  });
  
  await t.step("findUser - 未找到用户", () => {
    setup();
    const users: User[] = [];
    
    const found = userService.findUser(users, "nonexistent");
    assertEquals(found, undefined);
  });
  
  await t.step("filterAdults - 过滤成年人", () => {
    setup();
    const users: User[] = [
      { id: "1", name: "Alice", email: "alice@example.com", age: 25 },
      { id: "2", name: "Bob", email: "bob@example.com", age: 17 },
      { id: "3", name: "Charlie", email: "charlie@example.com", age: 18 },
      { id: "4", name: "David", email: "david@example.com", age: 16 },
    ];
    
    const adults = userService.filterAdults(users);
    assertEquals(adults.length, 2);
    assertEquals(adults[0]!.name, "Alice");
    assertEquals(adults[1]!.name, "Charlie");
  });
});

// 11. 异步测试示例
Deno.test("异步测试示例", async (t) => {
  // 模拟异步操作
  const asyncOperation = async (value: number): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return value * 2;
  };
  
  const asyncErrorOperation = async (): Promise<never> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    throw new Error("异步操作失败");
  };
  
  await t.step("异步操作成功", async () => {
    const result = await asyncOperation(5);
    assertEquals(result, 10);
  });
  
  await t.step("异步操作失败", async () => {
    await assertRejects(
      () => asyncErrorOperation(),
      Error,
      "异步操作失败"
    );
  });
  
  await t.step("多个异步操作", async () => {
    const results = await Promise.all([
      asyncOperation(1),
      asyncOperation(2),
      asyncOperation(3),
    ]);
    
    assertEquals(results, [2, 4, 6]);
  });
});

// 12. Mock 和 Stub 示例
Deno.test("Mock 和 Stub 示例", async (t) => {
  // Mock 数据库
  class MockDatabase {
    private data = new Map<string, any>();
    
    async get(key: string): Promise<any> {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return this.data.get(key);
    }
    
    async set(key: string, value: any): Promise<void> {
      await new Promise((resolve) => setTimeout(resolve, 50));
      this.data.set(key, value);
    }
    
    async delete(key: string): Promise<boolean> {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return this.data.delete(key);
    }
    
    async keys(): Promise<string[]> {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return Array.from(this.data.keys());
    }
  }
  
  // 使用 Mock 进行测试
  await t.step("Mock 数据库操作", async () => {
    const db = new MockDatabase();
    
    // 测试设置和获取
    await db.set("user:1", { name: "Alice" });
    const user = await db.get("user:1");
    assertEquals(user, { name: "Alice" });
    
    // 测试删除
    const deleted = await db.delete("user:1");
    assertEquals(deleted, true);
    
    const afterDelete = await db.get("user:1");
    assertEquals(afterDelete, undefined);
  });
  
  // Mock API 客户端
  class MockApiClient {
    private responses = new Map<string, any>();
    
    mockResponse(url: string, response: any): void {
      this.responses.set(url, response);
    }
    
    async fetch(url: string): Promise<any> {
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      const response = this.responses.get(url);
      if (!response) {
        throw new Error(`未模拟的 URL: ${url}`);
      }
      
      return response;
    }
  }
  
  await t.step("Mock API 客户端", async () => {
    const api = new MockApiClient();
    
    // 模拟响应
    api.mockResponse("https://api.example.com/users/1", {
      id: 1,
      name: "Alice",
    });
    
    // 测试 API 调用
    const user = await api.fetch("https://api.example.com/users/1");
    assertEquals(user.name, "Alice");
    
    // 测试未模拟的 URL
    await assertRejects(
      () => api.fetch("https://api.example.com/unknown"),
      Error,
      "未模拟的 URL"
    );
  });
});

// 13. 测试工具函数
function createTestUser(overrides?: Partial<User>): User {
  return {
    id: crypto.randomUUID(),
    name: "Test User",
    email: "test@example.com",
    age: 25,
    ...overrides,
  };
}

function createTestUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) =>
    createTestUser({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: 20 + i,
    })
  );
}

Deno.test("测试工具函数", () => {
  // 测试 createTestUser
  const user = createTestUser();
  assertEquals(user.name, "Test User");
  assertEquals(user.email, "test@example.com");
  assertEquals(user.age, 25);
  assert(user.id.length > 0, "应该生成 ID");
  
  // 测试覆盖默认值
  const customUser = createTestUser({ name: "Custom Name", age: 30 });
  assertEquals(customUser.name, "Custom Name");
  assertEquals(customUser.age, 30);
  assertEquals(customUser.email, "test@example.com"); // 保持默认值
  
  // 测试 createTestUsers
  const users = createTestUsers(5);
  assertEquals(users.length, 5);
  assertEquals(users[0]!.name, "User 1");
  assertEquals(users[4]!.name, "User 5");
  assertEquals(users[0]!.age, 20);
  assertEquals(users[4]!.age, 24);
});

// 14. 测试覆盖率示例
function calculateDiscount(price: number, isPremium: boolean): number {
  if (price < 0) {
    throw new RangeError("价格不能为负数");
  }
  
  if (isPremium) {
    return price * 0.8; // 20% 折扣
  }
  
  return price;
}

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
  
  assertThrows(
    () => calculateDiscount(-10, true),
    RangeError,
    "价格不能为负数"
  );
});

// 15. 测试生命周期示例
Deno.test("测试生命周期示例", async (t) => {
  // 测试前设置
  let testDatabase: Map<string, any>;
  
  const setup = () => {
    testDatabase = new Map();
    console.log("测试数据库已初始化");
  };
  
  const cleanup = () => {
    testDatabase.clear();
    console.log("测试数据库已清理");
  };
  
  await t.step("测试1 - 插入数据", () => {
    setup();
    try {
      testDatabase.set("key1", "value1");
      assertEquals(testDatabase.get("key1"), "value1");
    } finally {
      cleanup();
    }
  });
  
  await t.step("测试2 - 查询数据", () => {
    setup();
    try {
      testDatabase.set("key1", "value1");
      testDatabase.set("key2", "value2");
      
      assertEquals(testDatabase.size, 2);
      assertEquals(testDatabase.get("key1"), "value1");
      assertEquals(testDatabase.get("key2"), "value2");
    } finally {
      cleanup();
    }
  });
  
  await t.step("测试3 - 删除数据", () => {
    setup();
    try {
      testDatabase.set("key1", "value1");
      testDatabase.delete("key1");
      
      assertEquals(testDatabase.size, 0);
      assertEquals(testDatabase.get("key1"), undefined);
    } finally {
      cleanup();
    }
  });
});

// 16. 性能测试示例
Deno.test("性能测试示例", async (t) => {
  await t.step("数组操作性能", () => {
    const startTime = performance.now();
    
    // 执行一些操作
    const array = Array.from({ length: 10000 }, (_, i) => i);
    const filtered = array.filter((n) => n % 2 === 0);
    const mapped = filtered.map((n) => n * 2);
    const sum = mapped.reduce((acc, n) => acc + n, 0);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`数组操作耗时: ${duration.toFixed(2)}ms`);
    console.log(`结果: ${sum}`);
    
    // 断言性能在合理范围内
    assert(duration < 100, `操作耗时过长: ${duration}ms`);
  });
  
  await t.step("字符串操作性能", () => {
    const startTime = performance.now();
    
    // 执行字符串操作
    let result = "";
    for (let i = 0; i < 1000; i++) {
      result += `item${i},`;
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`字符串拼接耗时: ${duration.toFixed(2)}ms`);
    console.log(`结果长度: ${result.length}`);
    
    // 断言性能在合理范围内
    assert(duration < 50, `操作耗时过长: ${duration}ms`);
  });
});

// 主函数（用于运行所有测试）
async function main(): Promise<void> {
  console.log("TypeScript Deno 测试示例");
  console.log("=========================");
  console.log("");
  console.log("运行测试:");
  console.log("  deno test tests.ts");
  console.log("");
  console.log("运行测试并生成覆盖率:");
  console.log("  deno test --coverage=coverage tests.ts");
  console.log("  deno coverage --html=coverage");
  console.log("");
  console.log("测试用例数量: 16");
  console.log("");
  console.log("测试内容:");
  console.log("  1. 基础测试");
  console.log("  2. 类型断言");
  console.log("  3. 集合断言");
  console.log("  4. 正则表达式断言");
  console.log("  5. 对象匹配断言");
  console.log("  6. 错误断言");
  console.log("  7. 异步错误断言");
  console.log("  8. 自定义断言");
  console.log("  9. 计算器测试套件");
  console.log("  10. 用户服务测试套件");
  console.log("  11. 异步测试");
  console.log("  12. Mock 和 Stub");
  console.log("  13. 测试工具函数");
  console.log("  14. 测试覆盖率");
  console.log("  15. 测试生命周期");
  console.log("  16. 性能测试");
}

// 运行主函数
if (import.meta.main) {
  main();
}