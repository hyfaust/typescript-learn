# 项目7：异步编程

## 概述

异步编程是现代 JavaScript 和 TypeScript 开发的核心概念。本项目深入探讨 TypeScript 中的异步编程模式，包括回调函数、Promise、async/await、异步迭代器和生成器。TypeScript 为这些异步模式提供了强大的类型支持，使得异步代码更加安全和可维护。

## TypeScript 异步编程的优势

TypeScript 为异步编程提供了以下优势：

1. **类型安全的 Promise**：可以指定 Promise 解析的类型
2. **async/await 类型推断**：自动推断异步函数的返回类型
3. **泛型 Promise**：`Promise<T>` 明确指定解析值的类型
4. **异步迭代器类型**：`AsyncIterable<T>` 和 `AsyncIterator<T>` 接口
5. **更好的错误处理**：类型化的错误处理

## 1. 回调函数和回调地狱

### 回调函数基础

回调函数是最早期的异步编程模式，将函数作为参数传递给另一个函数。

```typescript
// 基础回调函数示例
function fetchData(callback: (data: string) => void): void {
  setTimeout(() => {
    callback("数据加载完成");
  }, 1000);
}

fetchData((data) => {
  console.log(data); // 1秒后输出："数据加载完成"
});
```

### 回调地狱（Callback Hell）

当多个异步操作需要顺序执行时，会形成深层嵌套的回调函数，称为"回调地狱"。

```typescript
// 回调地狱示例
function getUser(userId: number, callback: (user: any) => void): void {
  setTimeout(() => {
    callback({ id: userId, name: "Alice" });
  }, 1000);
}

function getOrders(userId: number, callback: (orders: any[]) => void): void {
  setTimeout(() => {
    callback([{ id: 1, product: "Laptop" }]);
  }, 1000);
}

function getOrderDetails(orderId: number, callback: (details: any) => void): void {
  setTimeout(() => {
    callback({ orderId, price: 999 });
  }, 1000);
}

// 回调地狱
getUser(1, (user) => {
  getOrders(user.id, (orders) => {
    getOrderDetails(orders[0].id, (details) => {
      console.log(`用户 ${user.name} 的订单价格: ${details.price}`);
      // 更多嵌套...
    });
  });
});
```

### TypeScript 与 JavaScript 的区别

TypeScript 通过类型注解使回调函数更安全：

```typescript
// TypeScript 类型安全的回调
function fetchData<T>(
  url: string,
  callback: (error: Error | null, data: T | null) => void
): void {
  // 模拟异步操作
  setTimeout(() => {
    if (url.includes("error")) {
      callback(new Error("请求失败"), null);
    } else {
      callback(null, { message: "成功" } as T);
    }
  }, 1000);
}

// 使用类型化的回调
interface UserData {
  id: number;
  name: string;
}

fetchData<UserData>("/api/user", (error, data) => {
  if (error) {
    console.error("错误:", error.message);
    return;
  }
  if (data) {
    console.log("用户:", data.name); // 类型安全访问
  }
});
```

## 2. Promise 基础

Promise 是处理异步操作的现代方式，表示一个最终会完成或失败的操作。

### Promise 的三种状态

1. **Pending（待定）**：初始状态
2. **Fulfilled（已完成）**：操作成功完成
3. **Rejected（已拒绝）**：操作失败

### 创建 Promise

```typescript
// 创建 Promise
function delay(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ms < 0) {
      reject(new Error("延迟时间不能为负数"));
      return;
    }
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

// 使用 Promise
delay(1000)
  .then(() => {
    console.log("1秒后执行");
  })
  .catch((error) => {
    console.error("错误:", error.message);
  });
```

### TypeScript Promise 类型

```typescript
// 带类型的 Promise
interface User {
  id: number;
  name: string;
  email: string;
}

function fetchUser(id: number): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) {
        resolve({
          id,
          name: "Alice",
          email: "alice@example.com",
        });
      } else {
        reject(new Error("无效的用户ID"));
      }
    }, 1000);
  });
}

// 类型安全的使用
fetchUser(1).then((user) => {
  console.log(user.name); // 类型推断为 string
  console.log(user.email); // 类型安全
});
```

## 3. Promise 链式调用

Promise 支持链式调用，避免回调地狱。

```typescript
// Promise 链式调用
function getUser(userId: number): Promise<{ id: number; name: string }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: userId, name: "Alice" }), 1000);
  });
}

function getOrders(userId: number): Promise<{ id: number; product: string }[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([{ id: 1, product: "Laptop" }]), 1000);
  });
}

function getOrderDetails(orderId: number): Promise<{ orderId: number; price: number }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ orderId, price: 999 }), 1000);
  });
}

// 链式调用 - 避免回调地狱
getUser(1)
  .then((user) => {
    console.log("获取用户:", user.name);
    return getOrders(user.id); // 返回新的 Promise
  })
  .then((orders) => {
    console.log("获取订单:", orders[0].product);
    return getOrderDetails(orders[0].id); // 返回新的 Promise
  })
  .then((details) => {
    console.log("订单价格:", details.price);
  })
  .catch((error) => {
    console.error("错误:", error);
  });
```

### 链式调用中的类型推断

```typescript
// TypeScript 自动推断链式调用中的类型
fetchUser(1)
  .then((user) => {
    // user 类型为 { id: number; name: string }
    return user.name; // 返回 string
  })
  .then((name) => {
    // name 类型为 string
    return name.toUpperCase(); // 返回 string
  })
  .then((upperName) => {
    // upperName 类型为 string
    console.log(upperName); // "ALICE"
  });
```

## 4. async/await 语法

async/await 是基于 Promise 的语法糖，使异步代码看起来像同步代码。

### 基本语法

```typescript
// async 函数
async function fetchUserData(): Promise<User> {
  const user = await fetchUser(1); // 等待 Promise 解析
  return user; // 返回类型自动推断为 User
}

// 等价于
function fetchUserDataPromise(): Promise<User> {
  return fetchUser(1).then((user) => user);
}
```

### 错误处理

```typescript
// 使用 try/catch 处理错误
async function safeFetchUser(id: number): Promise<User | null> {
  try {
    const user = await fetchUser(id);
    return user;
  } catch (error) {
    console.error("获取用户失败:", error);
    return null;
  }
}

// 多个异步操作的错误处理
async function processOrder(userId: number): Promise<void> {
  try {
    const user = await fetchUser(userId);
    const orders = await getOrders(user.id);
    const details = await getOrderDetails(orders[0].id);
    
    console.log(`处理订单完成，价格: ${details.price}`);
  } catch (error) {
    console.error("处理订单失败:", error);
    throw error; // 重新抛出错误
  }
}
```

### async/await 的优势

```typescript
// 复杂的异步流程变得清晰
async function complexOperation(): Promise<void> {
  // 并行执行多个异步操作
  const [user, orders, products] = await Promise.all([
    fetchUser(1),
    getOrders(1),
    fetchProducts(),
  ]);
  
  // 顺序处理
  for (const order of orders) {
    const details = await getOrderDetails(order.id);
    await updateInventory(details.orderId, products);
  }
  
  // 条件异步操作
  if (user.premium) {
    await applyPremiumDiscount(user.id);
  }
}
```

## 5. 错误处理：try/catch

### 传统错误处理

```typescript
// 传统错误处理
function parseJSON<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("JSON 解析错误:", error.message);
    } else {
      console.error("未知错误:", error);
    }
    return null;
  }
}
```

### 异步错误处理

```typescript
// 异步错误处理最佳实践
async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error("异步操作失败:", error);
    return fallback;
  }
}

// 使用示例
const userData = await safeAsyncOperation(
  () => fetchUser(1),
  { id: 0, name: "默认用户", email: "" }
);
```

### 错误边界模式

```typescript
// 错误边界模式
class AsyncErrorBoundary {
  static async execute<T>(
    operation: () => Promise<T>,
    errorHandler: (error: Error) => T
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      return errorHandler(error instanceof Error ? error : new Error(String(error)));
    }
  }
}

// 使用示例
const result = await AsyncErrorBoundary.execute(
  () => fetchUser(1),
  (error) => {
    console.error("使用默认值:", error.message);
    return { id: 0, name: "默认用户", email: "" };
  }
);
```

## 6. Promise.all, Promise.race, Promise.allSettled

### Promise.all

并行执行多个 Promise，所有都成功才成功。

```typescript
// Promise.all - 并行执行
async function fetchAllData(): Promise<[User, Order[], Product[]]> {
  const [user, orders, products] = await Promise.all([
    fetchUser(1),
    getOrders(1),
    fetchProducts(),
  ]);
  
  return [user, orders, products];
}

// 类型安全的 Promise.all
interface DataBundle {
  user: User;
  orders: Order[];
  products: Product[];
}

async function fetchDataBundle(): Promise<DataBundle> {
  const [user, orders, products] = await Promise.all([
    fetchUser(1),
    getOrders(1),
    fetchProducts(),
  ]);
  
  return { user, orders, products };
}
```

### Promise.race

返回第一个完成的 Promise（无论成功或失败）。

```typescript
// Promise.race - 竞争模式
async function fetchWithTimeout<T>(
  fetchPromise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`请求超时: ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([fetchPromise, timeoutPromise]);
}

// 使用示例
try {
  const user = await fetchWithTimeout(fetchUser(1), 3000);
  console.log("获取用户成功:", user.name);
} catch (error) {
  console.error("请求失败:", error.message);
}
```

### Promise.allSettled

等待所有 Promise 完成，无论成功或失败。

```typescript
// Promise.allSettled - 等待所有结果
async function fetchAllSettled(): Promise<PromiseSettledResult<any>[]> {
  const results = await Promise.allSettled([
    fetchUser(1),
    fetchUser(-1), // 这会失败
    fetchUser(3),
  ]);
  
  // 处理结果
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(`请求 ${index} 成功:`, result.value);
    } else {
      console.log(`请求 ${index} 失败:`, result.reason);
    }
  });
  
  return results;
}

// 类型安全的 Promise.allSettled
interface SettledResults {
  successes: User[];
  failures: Error[];
}

async function fetchWithSettled(): Promise<SettledResults> {
  const results = await Promise.allSettled([
    fetchUser(1),
    fetchUser(-1),
    fetchUser(3),
  ]);
  
  const successes: User[] = [];
  const failures: Error[] = [];
  
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      successes.push(result.value);
    } else {
      failures.push(result.reason);
    }
  });
  
  return { successes, failures };
}
```

## 7. 异步迭代器（Async Iterators）

异步迭代器用于处理异步数据流。

### 异步可迭代对象

```typescript
// 异步可迭代对象
async function* asyncGenerator(): AsyncGenerator<number, void, unknown> {
  let i = 0;
  while (i < 5) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    yield i++;
  }
}

// 使用 for await...of
async function consumeAsyncIterable(): Promise<void> {
  for await (const value of asyncGenerator()) {
    console.log("异步值:", value);
  }
}
```

### 异步迭代器接口

```typescript
// 自定义异步迭代器
class AsyncDataStream<T> implements AsyncIterable<T> {
  private data: T[];
  private delay: number;
  
  constructor(data: T[], delay: number = 1000) {
    this.data = data;
    this.delay = delay;
  }
  
  [Symbol.asyncIterator](): AsyncIterator<T> {
    let index = 0;
    const data = this.data;
    const delay = this.delay;
    
    return {
      async next(): Promise<IteratorResult<T>> {
        if (index < data.length) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          return { value: data[index++], done: false };
        }
        return { value: undefined as any, done: true };
      },
    };
  }
}

// 使用异步迭代器
async function processStream(): Promise<void> {
  const stream = new AsyncDataStream([1, 2, 3, 4, 5], 500);
  
  for await (const value of stream) {
    console.log("处理值:", value);
  }
}
```

### 实际应用场景

```typescript
// 数据库查询结果流
async function* queryDatabase<T>(query: string): AsyncGenerator<T, void, unknown> {
  // 模拟数据库查询
  const results = await executeQuery(query);
  
  for (const result of results) {
    await processResult(result); // 异步处理每个结果
    yield result;
  }
}

// 文件逐行读取
async function* readLines(filePath: string): AsyncGenerator<string, void, unknown> {
  const file = await Deno.open(filePath);
  const decoder = new TextDecoder();
  let buffer = "";
  
  for await (const chunk of file.readable) {
    buffer += decoder.decode(chunk);
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    
    for (const line of lines) {
      yield line;
    }
  }
  
  if (buffer) {
    yield buffer;
  }
  
  file.close();
}
```

## 8. 生成器（Generators）

生成器是一种特殊的函数，可以暂停和恢复执行。

### 基本生成器

```typescript
// 基本生成器
function* numberGenerator(): Generator<number, void, unknown> {
  yield 1;
  yield 2;
  yield 3;
}

// 使用生成器
const gen = numberGenerator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }
```

### 生成器与迭代器协议

```typescript
// 生成器实现迭代器协议
function* fibonacci(): Generator<number, never, unknown> {
  let a = 0;
  let b = 1;
  
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// 使用生成器
const fib = fibonacci();
for (let i = 0; i < 10; i++) {
  console.log(fib.next().value); // 0, 1, 1, 2, 3, 5, 8, 13, 21, 34
}
```

### 生成器的高级用法

```typescript
// 生成器作为状态机
function* trafficLight(): Generator<string, never, unknown> {
  while (true) {
    yield "红灯";
    yield "黄灯";
    yield "绿灯";
  }
}

// 生成器组合
function* concat<T>(...iterables: Iterable<T>[]): Generator<T, void, unknown> {
  for (const iterable of iterables) {
    yield* iterable;
  }
}

// 使用示例
const combined = concat([1, 2], [3, 4], [5, 6]);
for (const value of combined) {
  console.log(value); // 1, 2, 3, 4, 5, 6
}
```

### 生成器与异步操作

```typescript
// 使用生成器控制异步流程
function* asyncControlFlow(): Generator<Promise<any>, void, unknown> {
  const user = yield fetchUser(1);
  console.log("用户:", user.name);
  
  const orders = yield getOrders(user.id);
  console.log("订单:", orders.length);
  
  const details = yield getOrderDetails(orders[0].id);
  console.log("价格:", details.price);
}

// 执行生成器
async function runGenerator<T>(generator: Generator<Promise<T>, void, unknown>): Promise<void> {
  let result = generator.next();
  
  while (!result.done) {
    try {
      const value = await result.value;
      result = generator.next(value);
    } catch (error) {
      result = generator.throw(error);
    }
  }
}

// 使用
await runGenerator(asyncControlFlow());
```

## 9. 示例代码说明

本项目包含以下示例文件：

### promises.ts
- Promise 基础创建和使用
- Promise 链式调用
- Promise.all, Promise.race, Promise.allSettled 示例
- 错误处理模式

### async-await.ts
- async/await 基础语法
- 错误处理最佳实践
- 复杂异步流程控制
- 实际应用示例

### async-iterators.ts
- 异步迭代器基础
- 自定义异步可迭代对象
- 生成器基础
- 生成器与异步操作结合

## 10. 练习题

### 练习1：Promise 封装
将传统的回调函数封装为 Promise：

```typescript
// 将以下回调函数封装为 Promise
function readFileCallback(path: string, callback: (error: Error | null, data: string | null) => void): void {
  // 实现
}

// 要求：创建 readFilePromise 函数
function readFilePromise(path: string): Promise<string> {
  // 实现
}
```

### 练习2：异步队列
实现一个异步任务队列，限制并发数量：

```typescript
class AsyncQueue {
  // 实现一个队列，最多同时执行 3 个异步任务
  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    // 实现
  }
}

// 使用示例
const queue = new AsyncQueue();
const results = await Promise.all([
  queue.enqueue(() => fetchUser(1)),
  queue.enqueue(() => fetchUser(2)),
  queue.enqueue(() => fetchUser(3)),
  queue.enqueue(() => fetchUser(4)), // 应该等待前面的任务完成
]);
```

### 练习3：重试机制
实现一个带重试机制的异步函数：

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  // 实现：失败后重试，每次重试前等待指定时间
}
```

### 练习4：异步缓存
实现一个异步函数的结果缓存：

```typescript
class AsyncCache<T> {
  // 缓存异步函数的结果，避免重复调用
  async get(key: string, fetcher: () => Promise<T>): Promise<T> {
    // 实现
  }
}

// 使用示例
const cache = new AsyncCache<User>();
const user1 = await cache.get("user:1", () => fetchUser(1));
const user2 = await cache.get("user:1", () => fetchUser(1)); // 应该返回缓存
```

### 练习5：异步迭代器转换
实现一个将异步迭代器转换为数组的函数：

```typescript
async function asyncToArray<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  // 实现
}

// 使用示例
const stream = new AsyncDataStream([1, 2, 3, 4, 5]);
const array = await asyncToArray(stream);
console.log(array); // [1, 2, 3, 4, 5]
```

## 运行示例

```bash
# 运行 Promise 示例
deno run promises.ts

# 运行 async/await 示例
deno run async-await.ts

# 运行异步迭代器示例
deno run async-iterators.ts

# 运行所有示例
deno run --allow-read --allow-net promises.ts async-await.ts async-iterators.ts
```

## 总结

TypeScript 的异步编程提供了强大的类型安全和现代化的语法：

1. **Promise** 是处理异步操作的基础
2. **async/await** 使异步代码更易读
3. **异步迭代器** 处理异步数据流
4. **生成器** 提供灵活的控制流
5. **TypeScript 类型系统** 确保异步代码的类型安全

掌握这些概念对于开发现代 TypeScript 应用至关重要，特别是在处理网络请求、文件操作、数据库查询等场景中。

---

## 项目导航

[上一个项目：模块和命名空间](/projects/06-modules/)

[下一个项目：错误处理和测试](/projects/08-error-testing/)

[返回学习路径](/learning-path/)
