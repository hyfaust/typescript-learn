/**
 * TypeScript 异步迭代器和生成器示例
 * 演示异步迭代器、生成器及其在 Deno 中的应用
 * 运行环境: Deno
 */

// 类型定义
interface DataChunk {
  id: number;
  data: string;
  timestamp: number;
}

interface ProcessResult {
  chunkId: number;
  processed: boolean;
  result: string;
}

// 1. 基础生成器
function* numberGenerator(): Generator<number, void, unknown> {
  console.log("生成器开始");
  yield 1;
  console.log("生成 1 后");
  yield 2;
  console.log("生成 2 后");
  yield 3;
  console.log("生成 3 后");
  console.log("生成器结束");
}

// 2. 无限生成器
function* fibonacci(): Generator<number, never, unknown> {
  let a = 0;
  let b = 1;
  
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// 3. 生成器作为迭代器
function* range(start: number, end: number, step: number = 1): Generator<number, void, unknown> {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

// 4. 生成器组合
function* concat<T>(...iterables: Iterable<T>[]): Generator<T, void, unknown> {
  for (const iterable of iterables) {
    yield* iterable;
  }
}

// 5. 生成器过滤
function* filter<T>(
  iterable: Iterable<T>,
  predicate: (item: T) => boolean
): Generator<T, void, unknown> {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

// 6. 生成器映射
function* map<T, U>(
  iterable: Iterable<T>,
  transform: (item: T) => U
): Generator<U, void, unknown> {
  for (const item of iterable) {
    yield transform(item);
  }
}

// 7. 基础异步生成器
async function* asyncNumberGenerator(): AsyncGenerator<number, void, unknown> {
  console.log("异步生成器开始");
  for (let i = 1; i <= 5; i++) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    yield i;
    console.log(`生成异步值 ${i}`);
  }
  console.log("异步生成器结束");
}

// 8. 异步数据流生成器
async function* dataStreamGenerator(): AsyncGenerator<DataChunk, void, unknown> {
  let id = 0;
  while (id < 10) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    yield {
      id: id++,
      data: `数据块 ${id}`,
      timestamp: Date.now(),
    };
  }
}

// 9. 自定义异步迭代器
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

// 10. 异步迭代器转换
async function asyncToArray<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
}

// 11. 异步迭代器过滤
async function* asyncFilter<T>(
  iterable: AsyncIterable<T>,
  predicate: (item: T) => Promise<boolean> | boolean
): AsyncGenerator<T, void, unknown> {
  for await (const item of iterable) {
    if (await predicate(item)) {
      yield item;
    }
  }
}

// 12. 异步迭代器映射
async function* asyncMap<T, U>(
  iterable: AsyncIterable<T>,
  transform: (item: T) => Promise<U> | U
): AsyncGenerator<U, void, unknown> {
  for await (const item of iterable) {
    yield await transform(item);
  }
}

// 13. 异步迭代器并行处理
async function asyncParallel<T, R>(
  iterable: AsyncIterable<T>,
  processor: (item: T) => Promise<R>,
  concurrency: number = 3
): Promise<R[]> {
  const results: R[] = [];
  const processing: Promise<void>[] = [];
  
  for await (const item of iterable) {
    const processingPromise = processor(item).then((result) => {
      results.push(result);
    });
    
    processing.push(processingPromise);
    
    if (processing.length >= concurrency) {
      await Promise.all(processing);
      processing.length = 0;
    }
  }
  
  // 处理剩余的任务
  if (processing.length > 0) {
    await Promise.all(processing);
  }
  
  return results;
}

// 14. 生成器实现状态机
type TrafficLightState = "red" | "yellow" | "green";

function* trafficLight(): Generator<TrafficLightState, never, unknown> {
  while (true) {
    yield "red";
    yield "yellow";
    yield "green";
    yield "yellow"; // 黄灯亮两次（绿转红，红转绿）
  }
}

// 15. 生成器实现分页
function* paginate<T>(items: T[], pageSize: number): Generator<T[], void, unknown> {
  for (let i = 0; i < items.length; i += pageSize) {
    yield items.slice(i, i + pageSize);
  }
}

// 16. 异步文件读取生成器
async function* readFileLines(filePath: string): AsyncGenerator<string, void, unknown> {
  try {
    const content = await Deno.readTextFile(filePath);
    const lines = content.split("\n");
    
    for (const line of lines) {
      yield line;
    }
  } catch (error) {
    console.error("读取文件失败:", error);
  }
}

// 17. 异步数据库查询生成器（模拟）
async function* queryDatabase<T>(
  query: string,
  batchSize: number = 10
): AsyncGenerator<T[], void, unknown> {
  // 模拟数据库查询
  console.log(`执行查询: ${query}`);
  
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    // 模拟批量结果
    const batch: T[] = [];
    for (let i = 0; i < batchSize; i++) {
      batch.push({ id: offset + i, data: `记录 ${offset + i}` } as T);
    }
    
    yield batch;
    
    offset += batchSize;
    hasMore = offset < 50; // 模拟50条记录
  }
}

// 18. 生成器实现协程
function* coroutine1(): Generator<string, void, unknown> {
  yield "协程1: 步骤1";
  yield "协程1: 步骤2";
  yield "协程1: 步骤3";
}

function* coroutine2(): Generator<string, void, unknown> {
  yield "协程2: 步骤A";
  yield "协程2: 步骤B";
  yield "协程2: 步骤C";
}

function* mergeCoroutines<T>(...coroutines: Generator<T, void, unknown>[]): Generator<T, void, unknown> {
  const iterators = coroutines.map((c) => c[Symbol.iterator]());
  let active = iterators.length;
  
  while (active > 0) {
    for (let i = 0; i < iterators.length; i++) {
      const result = iterators[i].next();
      if (!result.done) {
        yield result.value;
      } else {
        active--;
      }
    }
  }
}

// 演示函数
async function demonstrateGenerators(): Promise<void> {
  console.log("\n=== 生成器演示 ===");
  
  // 基础生成器
  console.log("1. 基础生成器:");
  const gen = numberGenerator();
  let result = gen.next();
  while (!result.done) {
    console.log(`   值: ${result.value}`);
    result = gen.next();
  }
  
  // 斐波那契生成器
  console.log("\n2. 斐波那契生成器:");
  const fib = fibonacci();
  for (let i = 0; i < 10; i++) {
    console.log(`   F(${i}) = ${fib.next().value}`);
  }
  
  // 范围生成器
  console.log("\n3. 范围生成器:");
  for (const i of range(0, 5)) {
    console.log(`   ${i}`);
  }
  
  // 组合生成器
  console.log("\n4. 组合生成器:");
  const combined = concat([1, 2], [3, 4], [5, 6]);
  for (const value of combined) {
    console.log(`   ${value}`);
  }
  
  // 过滤和映射
  console.log("\n5. 过滤和映射:");
  const numbers = range(1, 10);
  const evens = filter(numbers, (n) => n % 2 === 0);
  const doubled = map(evens, (n) => n * 2);
  for (const value of doubled) {
    console.log(`   ${value}`);
  }
  
  // 分页生成器
  console.log("\n6. 分页生成器:");
  const items = Array.from({ length: 10 }, (_, i) => `项目 ${i + 1}`);
  const pages = paginate(items, 3);
  let pageNum = 1;
  for (const page of pages) {
    console.log(`   页 ${pageNum}:`, page.join(", "));
    pageNum++;
  }
  
  // 状态机
  console.log("\n7. 交通灯状态机:");
  const light = trafficLight();
  for (let i = 0; i < 6; i++) {
    console.log(`   状态: ${light.next().value}`);
  }
  
  // 协程合并
  console.log("\n8. 协程合并:");
  const merged = mergeCoroutines(coroutine1(), coroutine2());
  for (const value of merged) {
    console.log(`   ${value}`);
  }
}

async function demonstrateAsyncIterators(): Promise<void> {
  console.log("\n=== 异步迭代器演示 ===");
  
  // 异步生成器
  console.log("1. 异步生成器:");
  for await (const value of asyncNumberGenerator()) {
    console.log(`   异步值: ${value}`);
  }
  
  // 数据流
  console.log("\n2. 数据流生成器:");
  let count = 0;
  for await (const chunk of dataStreamGenerator()) {
    console.log(`   数据块 ${chunk.id}: ${chunk.data}`);
    count++;
    if (count >= 5) break; // 只显示前5个
  }
  
  // 自定义异步迭代器
  console.log("\n3. 自定义异步迭代器:");
  const stream = new AsyncDataStream([1, 2, 3, 4, 5], 200);
  for await (const value of stream) {
    console.log(`   流值: ${value}`);
  }
  
  // 异步过滤和映射
  console.log("\n4. 异步过滤和映射:");
  const dataStream = new AsyncDataStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 100);
  const filtered = asyncFilter(dataStream, async (n) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return n % 2 === 0;
  });
  const mapped = asyncMap(filtered, async (n) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return `数字 ${n}`;
  });
  
  for await (const value of mapped) {
    console.log(`   ${value}`);
  }
  
  // 异步并行处理
  console.log("\n5. 异步并行处理:");
  const numbersStream = new AsyncDataStream([1, 2, 3, 4, 5], 100);
  const results = await asyncParallel(
    numbersStream,
    async (n) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return `处理结果: ${n * 2}`;
    },
    2
  );
  console.log("   并行结果:", results);
  
  // 数据库查询模拟
  console.log("\n6. 数据库查询模拟:");
  let batchCount = 0;
  for await (const batch of queryDatabase<any>("SELECT * FROM users", 5)) {
    console.log(`   批次 ${batchCount + 1}: ${batch.length} 条记录`);
    batchCount++;
    if (batchCount >= 3) break; // 只显示前3批
  }
}

async function demonstratePracticalExamples(): Promise<void> {
  console.log("\n=== 实际应用示例 ===");
  
  // 1. 异步数据处理管道
  console.log("1. 异步数据处理管道:");
  async function* dataPipeline(): AsyncGenerator<string, void, unknown> {
    // 模拟数据源
    const dataSource = new AsyncDataStream(
      Array.from({ length: 10 }, (_, i) => `原始数据 ${i + 1}`),
      100
    );
    
    // 处理管道
    const filtered = asyncFilter(dataSource, async (data) => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return data.includes("1") || data.includes("3") || data.includes("5");
    });
    
    const transformed = asyncMap(filtered, async (data) => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return `处理: ${data.toUpperCase()}`;
    });
    
    yield* transformed;
  }
  
  for await (const result of dataPipeline()) {
    console.log(`   ${result}`);
  }
  
  // 2. 异步事件流处理
  console.log("\n2. 异步事件流处理:");
  async function* eventStream(): AsyncGenerator<{ type: string; data: any }, void, unknown> {
    const events = [
      { type: "click", data: { x: 100, y: 200 } },
      { type: "scroll", data: { position: 500 } },
      { type: "click", data: { x: 150, y: 250 } },
      { type: "resize", data: { width: 800, height: 600 } },
    ];
    
    for (const event of events) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      yield event;
    }
  }
  
  // 处理特定事件
  const clickEvents = asyncFilter(eventStream(), (event) => event.type === "click");
  for await (const event of clickEvents) {
    console.log(`   点击事件: x=${event.data.x}, y=${event.data.y}`);
  }
  
  // 3. 异步缓存更新
  console.log("\n3. 异步缓存更新:");
  async function* cacheUpdater(): AsyncGenerator<{ key: string; value: any }, void, unknown> {
    const cache = new Map<string, any>();
    
    // 模拟缓存更新
    const updates = [
      { key: "user:1", value: { name: "Alice" } },
      { key: "user:2", value: { name: "Bob" } },
      { key: "user:1", value: { name: "Alice Updated" } },
    ];
    
    for (const update of updates) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      cache.set(update.key, update.value);
      yield { key: update.key, value: update.value };
    }
  }
  
  for await (const update of cacheUpdater()) {
    console.log(`   缓存更新: ${update.key} = ${JSON.stringify(update.value)}`);
  }
}

// 主函数
async function main(): Promise<void> {
  console.log("TypeScript 异步迭代器和生成器示例");
  console.log("==================================");
  
  try {
    await demonstrateGenerators();
    await demonstrateAsyncIterators();
    await demonstratePracticalExamples();
    
    console.log("\n=== 所有示例执行完成 ===");
    
  } catch (error) {
    console.error("主函数错误:", error);
  }
}

// 运行示例
if (import.meta.main) {
  main();
}