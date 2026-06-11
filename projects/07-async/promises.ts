/**
 * TypeScript Promise 示例
 * 演示 Promise 的基础用法、链式调用和错误处理
 * 运行环境: Deno
 */

// 类型定义
interface User {
  id: number;
  name: string;
  email: string;
}

interface Order {
  id: number;
  userId: number;
  product: string;
  price: number;
}

// 1. 基础 Promise 创建
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

// 2. 带类型的 Promise
function fetchUser(id: number): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) {
        resolve({
          id,
          name: `用户${id}`,
          email: `user${id}@example.com`,
        });
      } else {
        reject(new Error("无效的用户ID"));
      }
    }, 1000);
  });
}

function fetchOrders(userId: number): Promise<Order[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, userId, product: "笔记本电脑", price: 9999 },
        { id: 2, userId, product: "键盘", price: 599 },
      ]);
    }, 1000);
  });
}

// 3. Promise 链式调用
function demonstratePromiseChaining(): Promise<void> {
  console.log("\n=== Promise 链式调用示例 ===");
  
  return fetchUser(1)
    .then((user) => {
      console.log("1. 获取用户:", user.name);
      return fetchOrders(user.id); // 返回新的 Promise
    })
    .then((orders) => {
      console.log("2. 获取订单数量:", orders.length);
      console.log("   第一个订单:", orders[0].product);
      return orders[0]; // 返回普通值
    })
    .then((firstOrder) => {
      console.log("3. 订单价格:", firstOrder.price);
    })
    .catch((error) => {
      console.error("链式调用错误:", error.message);
    });
}

// 4. Promise.all - 并行执行
function demonstratePromiseAll(): Promise<void> {
  console.log("\n=== Promise.all 示例 ===");
  
  const userPromise = fetchUser(1);
  const ordersPromise = fetchOrders(1);
  const delayPromise = delay(500);
  
  return Promise.all([userPromise, ordersPromise, delayPromise])
    .then(([user, orders, _]) => {
      console.log(`用户 ${user.name} 有 ${orders.length} 个订单`);
      orders.forEach((order) => {
        console.log(`  - ${order.product}: ¥${order.price}`);
      });
    })
    .catch((error) => {
      console.error("Promise.all 错误:", error.message);
    });
}

// 5. Promise.race - 竞争模式
function demonstratePromiseRace(): Promise<void> {
  console.log("\n=== Promise.race 示例 ===");
  
  const fetchPromise = fetchUser(1);
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error("请求超时"));
    }, 500); // 500ms 超时
  });
  
  return Promise.race([fetchPromise, timeoutPromise])
    .then((user) => {
      console.log("获取用户成功:", user.name);
    })
    .catch((error) => {
      console.log("竞争结果:", error.message);
    });
}

// 6. Promise.allSettled - 等待所有结果
function demonstratePromiseAllSettled(): Promise<void> {
  console.log("\n=== Promise.allSettled 示例 ===");
  
  const promises = [
    fetchUser(1),    // 成功
    fetchUser(-1),   // 失败
    fetchUser(3),    // 成功
  ];
  
  return Promise.allSettled(promises)
    .then((results) => {
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          console.log(`请求 ${index + 1} 成功:`, result.value.name);
        } else {
          console.log(`请求 ${index + 1} 失败:`, result.reason.message);
        }
      });
    });
}

// 7. Promise.resolve 和 Promise.reject
function demonstrateStaticMethods(): Promise<void> {
  console.log("\n=== Promise 静态方法示例 ===");
  
  // Promise.resolve
  const resolvedPromise = Promise.resolve(42);
  resolvedPromise.then((value) => {
    console.log("Promise.resolve:", value);
  });
  
  // Promise.reject
  const rejectedPromise = Promise.reject(new Error("立即拒绝"));
  rejectedPromise.catch((error) => {
    console.log("Promise.reject:", error.message);
  });
  
  // 等待所有 Promise 完成
  return delay(100);
}

// 8. 错误处理最佳实践
function demonstrateErrorHandling(): Promise<void> {
  console.log("\n=== 错误处理最佳实践 ===");
  
  // 捕获特定错误
  return fetchUser(-1)
    .catch((error) => {
      if (error instanceof Error) {
        console.log("捕获到错误:", error.message);
        return { id: 0, name: "默认用户", email: "" } as User;
      }
      throw error; // 重新抛出未知错误
    })
    .then((user) => {
      console.log("最终用户:", user.name);
    });
}

// 9. Promise 封装传统回调
function readFileCallback(
  path: string,
  callback: (error: Error | null, data: string | null) => void
): void {
  // 模拟文件读取
  setTimeout(() => {
    if (path.includes("error")) {
      callback(new Error("文件读取失败"), null);
    } else {
      callback(null, `文件内容: ${path}`);
    }
  }, 1000);
}

// 封装为 Promise
function readFilePromise(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    readFileCallback(path, (error, data) => {
      if (error) {
        reject(error);
      } else if (data) {
        resolve(data);
      } else {
        reject(new Error("无数据"));
      }
    });
  });
}

// 10. 带重试的 Promise
function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const attempt = () => {
      attempts++;
      operation()
        .then(resolve)
        .catch((error) => {
          if (attempts < maxRetries) {
            console.log(`尝试 ${attempts} 失败，${delayMs}ms 后重试...`);
            setTimeout(attempt, delayMs);
          } else {
            reject(new Error(`操作失败，已重试 ${maxRetries} 次: ${error.message}`));
          }
        });
    };
    
    attempt();
  });
}

// 主函数
async function main(): Promise<void> {
  console.log("TypeScript Promise 示例");
  console.log("========================");
  
  try {
    await demonstratePromiseChaining();
    await demonstratePromiseAll();
    await demonstratePromiseRace();
    await demonstratePromiseAllSettled();
    await demonstrateStaticMethods();
    await demonstrateErrorHandling();
    
    // 测试 Promise 封装
    console.log("\n=== Promise 封装示例 ===");
    const content = await readFilePromise("test.txt");
    console.log(content);
    
    // 测试重试机制
    console.log("\n=== 重试机制示例 ===");
    let attempts = 0;
    const unreliableOperation = () => {
      attempts++;
      if (attempts < 3) {
        return Promise.reject(new Error(`尝试 ${attempts} 失败`));
      }
      return Promise.resolve(`成功! 尝试了 ${attempts} 次`);
    };
    
    const result = await withRetry(unreliableOperation, 3, 500);
    console.log(result);
    
  } catch (error) {
    console.error("主函数错误:", error);
  }
}

// 运行示例
if (import.meta.main) {
  main();
}