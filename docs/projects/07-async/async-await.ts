/**
 * TypeScript async/await 示例
 * 演示 async/await 语法、错误处理和复杂异步流程
 * 运行环境: Deno
 */

// 类型定义
interface User {
  id: number;
  name: string;
  email: string;
  premium: boolean;
}

interface Order {
  id: number;
  userId: number;
  product: string;
  price: number;
  status: "pending" | "processing" | "completed";
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

// 模拟异步 API
async function fetchUser(id: number): Promise<User> {
  await delay(1000);
  if (id <= 0) throw new Error("无效的用户ID");
  return {
    id,
    name: `用户${id}`,
    email: `user${id}@example.com`,
    premium: id % 2 === 0,
  };
}

async function fetchOrders(userId: number): Promise<Order[]> {
  await delay(800);
  return [
    { id: 1, userId, product: "笔记本电脑", price: 9999, status: "completed" },
    { id: 2, userId, product: "键盘", price: 599, status: "processing" },
    { id: 3, userId, product: "鼠标", price: 299, status: "pending" },
  ];
}

async function fetchProducts(): Promise<Product[]> {
  await delay(600);
  return [
    { id: 1, name: "笔记本电脑", price: 9999, stock: 10 },
    { id: 2, name: "键盘", price: 599, stock: 50 },
    { id: 3, name: "鼠标", price: 299, stock: 100 },
  ];
}

async function updateInventory(orderId: number, productId: number): Promise<void> {
  await delay(500);
  console.log(`更新库存: 订单 ${orderId}, 产品 ${productId}`);
}

async function applyDiscount(userId: number, discount: number): Promise<number> {
  await delay(300);
  console.log(`为用户 ${userId} 应用 ${discount}% 折扣`);
  return discount;
}

// 辅助函数
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 1. 基础 async/await
async function basicAsyncAwait(): Promise<void> {
  console.log("\n=== 基础 async/await 示例 ===");
  
  // 基本用法
  const user = await fetchUser(1);
  console.log("获取用户:", user.name);
  
  // 等价于 Promise 链
  fetchUser(2).then((user) => {
    console.log("Promise 链方式:", user.name);
  });
}

// 2. 顺序执行异步操作
async function sequentialOperations(): Promise<void> {
  console.log("\n=== 顺序执行示例 ===");
  
  const user = await fetchUser(1);
  console.log("1. 获取用户:", user.name);
  
  const orders = await fetchOrders(user.id);
  console.log("2. 获取订单数量:", orders.length);
  
  const products = await fetchProducts();
  console.log("3. 获取产品数量:", products.length);
  
  // 处理每个订单
  for (const order of orders) {
    await updateInventory(order.id, order.id);
    console.log(`4. 处理订单: ${order.product} - ${order.status}`);
  }
}

// 3. 并行执行异步操作
async function parallelOperations(): Promise<void> {
  console.log("\n=== 并行执行示例 ===");
  
  // 并行获取数据
  const [user, orders, products] = await Promise.all([
    fetchUser(1),
    fetchOrders(1),
    fetchProducts(),
  ]);
  
  console.log(`用户: ${user.name}`);
  console.log(`订单: ${orders.length} 个`);
  console.log(`产品: ${products.length} 个`);
  
  // 并行处理订单
  const updatePromises = orders.map((order) =>
    updateInventory(order.id, order.id)
  );
  await Promise.all(updatePromises);
  console.log("所有订单处理完成");
}

// 4. 错误处理最佳实践
async function errorHandlingBestPractices(): Promise<void> {
  console.log("\n=== 错误处理最佳实践 ===");
  
  // try/catch 处理单个操作
  try {
    const user = await fetchUser(-1);
    console.log("用户:", user.name);
  } catch (error) {
    console.error("获取用户失败:", (error as Error).message);
  }
  
  // 处理多个操作
  try {
    const user = await fetchUser(1);
    const orders = await fetchOrders(user.id);
    
    // 可能失败的操作
    await updateInventory(orders[0].id, 999);
  } catch (error) {
    console.error("处理失败:", (error as Error).message);
  }
  
  // 错误边界模式
  const result = await safeAsyncOperation(
    () => fetchUser(-1),
    { id: 0, name: "默认用户", email: "", premium: false }
  );
  console.log("安全操作结果:", result.name);
}

// 5. 安全异步操作包装器
async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error("操作失败，使用默认值:", (error as Error).message);
    return fallback;
  }
}

// 6. 带超时的异步操作
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

// 7. 异步队列处理
async function processQueue<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 3
): Promise<R[]> {
  const results: R[] = [];
  const chunks: T[][] = [];
  
  // 分块处理
  for (let i = 0; i < items.length; i += concurrency) {
    chunks.push(items.slice(i, i + concurrency));
  }
  
  // 顺序处理每个块，块内并行
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map((item) => processor(item))
    );
    results.push(...chunkResults);
  }
  
  return results;
}

// 8. 条件异步操作
async function conditionalAsync(): Promise<void> {
  console.log("\n=== 条件异步操作示例 ===");
  
  const user = await fetchUser(2);
  console.log("用户:", user.name, "是否高级用户:", user.premium);
  
  // 条件执行
  if (user.premium) {
    const discount = await applyDiscount(user.id, 20);
    console.log(`高级用户获得 ${discount}% 折扣`);
  } else {
    console.log("普通用户无折扣");
  }
  
  // 条件并行操作
  const operations: Promise<any>[] = [
    fetchOrders(user.id),
  ];
  
  if (user.premium) {
    operations.push(applyDiscount(user.id, 10));
  }
  
  const results = await Promise.all(operations);
  console.log("操作结果数量:", results.length);
}

// 9. 异步迭代处理
async function asyncIteration(): Promise<void> {
  console.log("\n=== 异步迭代处理示例 ===");
  
  const userIds = [1, 2, 3, 4, 5];
  
  // 顺序处理
  console.log("顺序处理:");
  for (const userId of userIds) {
    try {
      const user = await fetchUser(userId);
      console.log(`  用户 ${user.name}`);
    } catch (error) {
      console.log(`  用户 ${userId} 获取失败`);
    }
  }
  
  // 并行处理
  console.log("并行处理:");
  const userPromises = userIds.map(async (userId) => {
    try {
      return await fetchUser(userId);
    } catch {
      return null;
    }
  });
  
  const users = await Promise.all(userPromises);
  users.filter(Boolean).forEach((user) => {
    console.log(`  用户 ${(user as User).name}`);
  });
}

// 10. 复杂业务流程
async function complexBusinessLogic(): Promise<void> {
  console.log("\n=== 复杂业务流程示例 ===");
  
  try {
    // 1. 获取用户信息
    const user = await fetchUser(1);
    console.log("步骤1: 获取用户信息完成");
    
    // 2. 并行获取订单和产品信息
    const [orders, products] = await Promise.all([
      fetchOrders(user.id),
      fetchProducts(),
    ]);
    console.log("步骤2: 获取订单和产品信息完成");
    
    // 3. 处理每个订单
    const processedOrders = await Promise.all(
      orders.map(async (order) => {
        const product = products.find((p) => p.name === order.product);
        if (product) {
          await updateInventory(order.id, product.id);
          return { ...order, processed: true };
        }
        return { ...order, processed: false };
      })
    );
    console.log("步骤3: 订单处理完成");
    
    // 4. 计算总价
    const totalPrice = processedOrders.reduce((sum, order) => sum + order.price, 0);
    console.log(`步骤4: 总价计算完成: ¥${totalPrice}`);
    
    // 5. 应用折扣（如果是高级用户）
    let finalPrice = totalPrice;
    if (user.premium) {
      const discount = await applyDiscount(user.id, 15);
      finalPrice = totalPrice * (1 - discount / 100);
      console.log(`步骤5: 应用 ${discount}% 折扣后: ¥${finalPrice.toFixed(2)}`);
    }
    
    // 6. 生成报告
    const report = {
      user: user.name,
      orderCount: orders.length,
      totalPrice,
      finalPrice,
      processedAt: new Date().toISOString(),
    };
    
    console.log("步骤6: 业务流程完成");
    console.log("报告:", JSON.stringify(report, null, 2));
    
  } catch (error) {
    console.error("业务流程失败:", (error as Error).message);
    throw error;
  }
}

// 11. 异步函数类型
type AsyncFunction<T> = () => Promise<T>;
type AsyncCallback<T> = (result: T) => Promise<void>;
type AsyncErrorHandler = (error: Error) => Promise<void>;

// 异步执行器
async function executeAsync<T>(
  operation: AsyncFunction<T>,
  onSuccess?: AsyncCallback<T>,
  onError?: AsyncErrorHandler
): Promise<T | undefined> {
  try {
    const result = await operation();
    if (onSuccess) {
      await onSuccess(result);
    }
    return result;
  } catch (error) {
    if (onError) {
      await onError(error instanceof Error ? error : new Error(String(error)));
    }
    return undefined;
  }
}

// 12. 异步缓存
class AsyncCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private ttl: number;
  
  constructor(ttlMs: number = 60000) {
    this.ttl = ttlMs;
  }
  
  async get(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < this.ttl) {
      console.log(`缓存命中: ${key}`);
      return cached.value;
    }
    
    console.log(`缓存未命中: ${key}`);
    const value = await fetcher();
    this.cache.set(key, { value, timestamp: now });
    return value;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// 主函数
async function main(): Promise<void> {
  console.log("TypeScript async/await 示例");
  console.log("============================");
  
  try {
    await basicAsyncAwait();
    await sequentialOperations();
    await parallelOperations();
    await errorHandlingBestPractices();
    await conditionalAsync();
    await asyncIteration();
    
    // 测试超时
    console.log("\n=== 超时示例 ===");
    try {
      await withTimeout(fetchUser(1), 500, "用户获取超时");
      console.log("用户获取成功");
    } catch (error) {
      console.log("超时结果:", (error as Error).message);
    }
    
    // 测试队列处理
    console.log("\n=== 队列处理示例 ===");
    const userIds = [1, 2, 3, 4, 5];
    const users = await processQueue(userIds, fetchUser, 2);
    console.log("队列处理结果:", users.map((u) => u.name).join(", "));
    
    // 测试缓存
    console.log("\n=== 异步缓存示例 ===");
    const cache = new AsyncCache<User>(5000);
    
    const user1 = await cache.get("user:1", () => fetchUser(1));
    console.log("第一次获取:", user1.name);
    
    const user2 = await cache.get("user:1", () => fetchUser(1));
    console.log("第二次获取:", user2.name);
    
    // 测试复杂业务逻辑
    await complexBusinessLogic();
    
  } catch (error) {
    console.error("主函数错误:", error);
  }
}

// 运行示例
if (import.meta.main) {
  main();
}