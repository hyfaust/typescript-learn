# 项目11：文件处理工具 - 日志分析工具

## 概述

本项目将带你构建一个功能完整的日志分析工具。通过这个实战项目，你将学习 Deno 文件系统 API、流处理、数据转换等核心技能，并深入理解 TypeScript 在文件处理中的优势。

### 项目特色

- **多格式日志解析**：支持 Apache、Nginx、JSON、Syslog 格式
- **流式处理**：高效处理大文件，内存占用低
- **类型安全**：使用接口和泛型确保数据结构一致
- **统计分析**：请求数、错误率、响应时间等指标
- **报告生成**：自动生成可读的分析报告

## 1. Deno 文件系统 API

### 1.1 基本文件操作

Deno 提供了简洁的文件系统 API：

```typescript
// 读取文本文件
const content = await Deno.readTextFile("path/to/file.txt");

// 写入文本文件
await Deno.writeTextFile("path/to/file.txt", "Hello, Deno!");

// 追加内容
const file = await Deno.open("path/to/file.txt", { write: true, append: true });
await file.write(new TextEncoder().encode("Appended text\n"));
file.close();

// 获取文件信息
const stat = await Deno.stat("path/to/file.txt");
console.log(stat.size);      // 文件大小
console.log(stat.mtime);     // 修改时间
console.log(stat.isFile);    // 是否为文件
console.log(stat.isDirectory); // 是否为目录
```

### 1.2 目录操作

```typescript
// 创建目录（递归）
await Deno.mkdir("path/to/dir", { recursive: true });

// 删除目录（递归）
await Deno.remove("path/to/dir", { recursive: true });

// 遍历目录
for await (const entry of Deno.readDir("path/to/dir")) {
  console.log(entry.name);       // 文件名
  console.log(entry.isFile);     // 是否为文件
  console.log(entry.isDirectory); // 是否为目录
}
```

### 1.3 TypeScript 优势

```typescript
// 定义文件元数据接口
interface FileMetadata {
  readonly path: string;
  readonly name: string;
  readonly size: number;
  readonly created: Date | null;
  readonly modified: Date | null;
  readonly isDirectory: boolean;
  readonly isFile: boolean;
}

// 类型安全的文件信息获取
async function getFileMetadata(path: string): Promise<FileMetadata> {
  const stat = await Deno.stat(path);
  return {
    path,
    name: path.split("/").pop() ?? path,
    size: stat.size,
    created: stat.birthtime,
    modified: stat.mtime,
    isDirectory: stat.isDirectory,
    isFile: stat.isFile,
  };
}
```

## 2. 文件读写

### 2.1 文本文件

```typescript
// 按行读取文件
async function readLines(path: string): Promise<string[]> {
  const content = await Deno.readTextFile(path);
  return content.split("\n").filter(line => line.length > 0);
}

// 写入多行
async function writeLines(path: string, lines: string[]): Promise<void> {
  await Deno.writeTextFile(path, lines.join("\n") + "\n");
}
```

### 2.2 JSON 文件

```typescript
// 读取 JSON 文件
async function readJsonFile<T>(path: string): Promise<T> {
  const content = await Deno.readTextFile(path);
  return JSON.parse(content) as T;
}

// 写入 JSON 文件
async function writeJsonFile<T>(path: string, data: T): Promise<void> {
  await Deno.writeTextFile(path, JSON.stringify(data, null, 2));
}

// 使用示例
interface Config {
  name: string;
  version: string;
  debug: boolean;
}

const config = await readJsonFile<Config>("config.json");
console.log(config.name);  // 类型安全
```

### 2.3 CSV 文件

```typescript
// CSV 解析选项
interface CsvParseOptions {
  delimiter?: string;
  hasHeader?: boolean;
  skipEmptyLines?: boolean;
  trimValues?: boolean;
}

// 解析 CSV
function parseCsv<T extends Record<string, string>>(
  content: string,
  options: CsvParseOptions = {}
): T[] {
  const { delimiter = ",", hasHeader = true } = options;
  const lines = content.split("\n");
  const result: T[] = [];

  let headers: string[] = [];
  let startIndex = 0;

  if (hasHeader && lines.length > 0) {
    headers = lines[0].split(delimiter).map(h => h.trim());
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim());
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    result.push(row as T);
  }

  return result;
}

// 使用示例
interface User {
  name: string;
  age: string;
  email: string;
}

const users = parseCsv<User>(csvContent);
users.forEach(user => {
  console.log(user.name, user.age, user.email);  // 类型安全
});
```

**TypeScript 优势**：泛型 `T` 确保返回的数据结构与接口定义一致。

## 3. 流处理

### 3.1 ReadableStream（可读流）

```typescript
// 从数组创建可读流
function createReadableStream<T>(data: T[]): ReadableStream<T> {
  let index = 0;

  return new ReadableStream<T>({
    pull(controller) {
      if (index < data.length) {
        controller.enqueue(data[index]);
        index++;
      } else {
        controller.close();
      }
    },
  });
}

// 从文件创建可读流
function createFileStream(filePath: string): ReadableStream<Uint8Array> {
  const file = Deno.openSync(filePath, { read: true });

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const chunk = new Uint8Array(4096);
      const bytesRead = await file.read(chunk);

      if (bytesRead === null) {
        controller.close();
        file.close();
      } else {
        controller.enqueue(chunk.subarray(0, bytesRead));
      }
    },
  });
}
```

### 3.2 WritableStream（可写流）

```typescript
// 创建收集流
function createCollectorStream<T>(): {
  stream: WritableStream<T>;
  getResults: () => T[];
} {
  const results: T[] = [];

  return {
    stream: new WritableStream<T>({
      write(chunk) {
        results.push(chunk);
      },
    }),
    getResults: () => [...results],
  };
}

// 创建文件写入流
function createFileWriteStream(filePath: string): WritableStream<Uint8Array> {
  const file = Deno.openSync(filePath, { write: true, create: true });

  return new WritableStream<Uint8Array>({
    async write(chunk) {
      await file.write(chunk);
    },
    close() {
      file.close();
    },
  });
}
```

### 3.3 TransformStream（转换流）

```typescript
// 映射转换流
function createMapStream<I, O>(
  transform: (value: I) => O | Promise<O>
): TransformStream<I, O> {
  return new TransformStream<I, O>({
    async transform(chunk, controller) {
      const result = await transform(chunk);
      controller.enqueue(result);
    },
  });
}

// 过滤转换流
function createFilterStream<T>(
  predicate: (value: T) => boolean | Promise<boolean>
): TransformStream<T, T> {
  return new TransformStream<T, T>({
    async transform(chunk, controller) {
      if (await predicate(chunk)) {
        controller.enqueue(chunk);
      }
    },
  });
}

// 批处理转换流
function createBatchStream<T>(batchSize: number): TransformStream<T, T[]> {
  let batch: T[] = [];

  return new TransformStream<T, T[]>({
    transform(chunk, controller) {
      batch.push(chunk);
      if (batch.length >= batchSize) {
        controller.enqueue(batch);
        batch = [];
      }
    },
    flush(controller) {
      if (batch.length > 0) {
        controller.enqueue(batch);
      }
    },
  });
}
```

### 3.4 流的管道连接

```typescript
// 使用 pipeThrough 连接转换流
const source = createReadableStream([1, 2, 3, 4, 5]);
const doubled = source.pipeThrough(createMapStream(x => x * 2));
const evens = doubled.pipeThrough(createFilterStream(x => x % 2 === 0));

// 使用 pipeTo 连接到可写流
const { stream: collector, getResults } = createCollectorStream<number>();
await evens.pipeTo(collector);

console.log(getResults());  // [4, 8]
```

**TypeScript 优势**：泛型确保流转换过程中的类型安全。

## 4. 文件监控

### 4.1 使用 Deno.watchFs

```typescript
// 监控文件变化
async function watchFile(path: string): Promise<void> {
  const watcher = Deno.watchFs(path);

  for await (const event of watcher) {
    console.log("事件类型:", event.kind);  // "create" | "modify" | "remove"
    console.log("影响的文件:", event.paths);
  }
}

// 监控目录
async function watchDirectory(dir: string): Promise<void> {
  const watcher = Deno.watchFs(dir, { recursive: true });

  for await (const event of watcher) {
    switch (event.kind) {
      case "create":
        console.log("新文件:", event.paths);
        break;
      case "modify":
        console.log("修改文件:", event.paths);
        break;
      case "remove":
        console.log("删除文件:", event.paths);
        break;
    }
  }
}
```

### 4.2 防抖处理

```typescript
// 防抖文件监控
function createDebouncedWatcher(
  path: string,
  callback: (events: Deno.FsEvent[]) => void,
  delay = 100
): void {
  let events: Deno.FsEvent[] = [];
  let timer: number | null = null;

  Deno.watchFs(path).then(async (watcher) => {
    for await (const event of watcher) {
      events.push(event);

      if (timer !== null) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        callback(events);
        events = [];
        timer = null;
      }, delay);
    }
  });
}
```

## 5. 批量处理

### 5.1 并发控制

```typescript
// 并发处理文件
async function processFilesConcurrently(
  files: string[],
  processor: (file: string) => Promise<void>,
  concurrency = 5
): Promise<void> {
  const queue = [...files];
  const running = new Set<Promise<void>>();

  while (queue.length > 0 || running.size > 0) {
    // 填充工作队列
    while (running.size < concurrency && queue.length > 0) {
      const file = queue.shift()!;
      const promise = processor(file).then(() => {
        running.delete(promise);
      });
      running.add(promise);
    }

    // 等待一个任务完成
    if (running.size > 0) {
      await Promise.race(running);
    }
  }
}

// 使用示例
await processFilesConcurrently(
  ["file1.txt", "file2.txt", "file3.txt"],
  async (file) => {
    const content = await Deno.readTextFile(file);
    await Deno.writeTextFile(`${file}.processed`, content.toUpperCase());
  },
  3  // 最多3个并发
);
```

### 5.2 进度跟踪

```typescript
// 带进度的批量处理
async function processWithProgress<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  let completed = 0;

  for (const item of items) {
    await processor(item);
    completed++;
    onProgress?.(completed, items.length);
  }
}

// 使用示例
await processWithProgress(
  files,
  async (file) => await processFile(file),
  (completed, total) => {
    const percentage = (completed / total * 100).toFixed(1);
    console.log(`进度: ${percentage}% (${completed}/${total})`);
  }
);
```

## 6. 数据转换

### 6.1 JSON 到 CSV

```typescript
// JSON 转 CSV
function jsonToCsv<T extends Record<string, unknown>>(
  data: T[],
  options: { delimiter?: string; includeHeader?: boolean } = {}
): string {
  const { delimiter = ",", includeHeader = true } = options;

  if (data.length === 0) return "";

  // 获取所有键
  const keys = Object.keys(data[0]);
  const lines: string[] = [];

  // 表头
  if (includeHeader) {
    lines.push(keys.join(delimiter));
  }

  // 数据行
  for (const item of data) {
    const values = keys.map(key => {
      const value = String(item[key] ?? "");
      // 转义包含分隔符的值
      return value.includes(delimiter) ? `"${value}"` : value;
    });
    lines.push(values.join(delimiter));
  }

  return lines.join("\n");
}
```

### 6.2 CSV 到 JSON

```typescript
// CSV 转 JSON
function csvToJson<T>(csvContent: string): T[] {
  const lines = csvContent.split("\n").filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim());
  const result: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim());
    const obj: Record<string, string> = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] ?? "";
    });

    result.push(obj as T);
  }

  return result;
}
```

### 6.3 数据格式转换器

```typescript
// 通用数据转换器
interface DataConverter<I, O> {
  convert(input: I): O;
}

// JSON 到 CSV 转换器
class JsonToCsvConverter<T extends Record<string, unknown>>
  implements DataConverter<T[], string>
{
  constructor(private options: CsvStringifyOptions = {}) {}

  convert(data: T[]): string {
    return jsonToCsv(data, this.options);
  }
}

// CSV 到 JSON 转换器
class CsvToJsonConverter<T> implements DataConverter<string, T[]> {
  constructor(private options: CsvParseOptions = {}) {}

  convert(csvContent: string): T[] {
    return parseCsv<T>(csvContent, this.options);
  }
}
```

**TypeScript 优势**：泛型接口确保转换器的类型安全。

## 7. 实战项目：日志分析工具

### 7.1 功能特性

我们的日志分析工具支持：

1. **多格式解析**：Apache、Nginx、JSON、Syslog 格式
2. **统计分析**：请求数、错误率、响应时间
3. **时间范围过滤**：按时间段分析
4. **关键词搜索**：搜索特定内容
5. **异常检测**：自动发现异常模式
6. **报告生成**：生成可读的分析报告

### 7.2 使用示例

```bash
# 分析 Apache 日志
deno run --allow-read log-analyzer.ts access.log

# 指定日志格式
deno run --allow-read log-analyzer.ts --format=nginx nginx.log

# 时间范围过滤
deno run --allow-read log-analyzer.ts --start="2024-01-01" --end="2024-01-31"

# 生成报告
deno run --allow-read --allow-write log-analyzer.ts --output=report.txt access.log
```

### 7.3 核心实现

日志解析器核心类：

```typescript
class LogParser {
  private config: LogParseConfig;

  constructor(config: LogParseConfig) {
    this.config = config;
  }

  // 解析 Apache/Nginx 日志
  private parseAccessLog(line: string): AccessLogEntry | null {
    const pattern = /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d{3}) (\d+)/;
    const match = line.match(pattern);

    if (!match) return null;

    return {
      timestamp: new Date(match[2]),
      level: parseInt(match[6]) >= 400 ? "ERROR" : "INFO",
      message: `${match[3]} ${match[4]} ${match[6]}`,
      ip: match[1],
      method: match[3],
      path: match[4],
      statusCode: parseInt(match[6]),
      bytes: parseInt(match[7]),
    };
  }

  // 解析 JSON 日志
  private parseJsonLog(line: string): LogEntry | null {
    try {
      const data = JSON.parse(line);
      return {
        timestamp: new Date(data.timestamp),
        level: data.level,
        message: data.message,
        source: data.source,
      };
    } catch {
      return null;
    }
  }
}
```

### 7.4 统计分析

```typescript
class LogAnalyzer {
  calculateStatistics(): LogStatistics {
    const entriesByLevel: Record<LogLevel, number> = {
      DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, FATAL: 0
    };

    let errorCount = 0;

    for (const entry of this.entries) {
      entriesByLevel[entry.level]++;
      if (entry.level === "ERROR" || entry.level === "FATAL") {
        errorCount++;
      }
    }

    return {
      totalEntries: this.entries.length,
      entriesByLevel,
      errorRate: (errorCount / this.entries.length) * 100,
    };
  }
}
```

## 8. 示例代码说明

### 8.1 file-ops.ts - 文件操作示例

**核心功能**：
- `readTextFile`、`writeTextFile`：文本文件操作
- `readJsonFile`、`writeJsonFile`：JSON 文件操作
- `parseCsv`、`stringifyCsv`：CSV 文件操作
- `walkDirectory`：递归目录遍历

**TypeScript 亮点**：
- 泛型函数确保类型安全
- 接口定义文件元数据
- 异步生成器实现惰性遍历

### 8.2 stream-processing.ts - 流处理示例

**核心功能**：
- `createReadableStream`：创建可读流
- `createMapStream`、`createFilterStream`：转换流
- `createBatchStream`：批处理流
- `streamToArray`：流转数组

**TypeScript 亮点**：
- 泛型流类型确保类型安全
- 接口定义流处理器
- 异步迭代器类型支持

### 8.3 log-analyzer.ts - 日志分析工具

**核心功能**：
- `LogParser`：日志解析器
- `LogAnalyzer`：日志分析器
- `formatReportText`：报告格式化

**TypeScript 亮点**：
- 枚举类型定义日志级别
- 接口定义日志结构
- 类型守卫区分不同日志类型

## 9. 练习题

### 练习1：扩展文件操作

为 `file-ops.ts` 添加以下功能：
1. 文件压缩/解压缩（使用 Deno 的 CompressionStream）
2. 文件加密/解密
3. 文件哈希计算（MD5、SHA256）
4. 文件差异比较

### 练习2：构建文件同步工具

创建一个文件同步工具：
1. 比较源目录和目标目录的差异
2. 支持增量同步（只同步变化的文件）
3. 支持删除目标目录中多余的文件
4. 显示同步进度和统计信息

### 练习3：构建日志收集器

扩展日志分析工具：
1. 实时监控日志文件变化
2. 支持多日志文件同时分析
3. 支持自定义日志格式解析
4. 生成图表报告（HTML 格式）

### 练习4：构建数据管道

创建一个数据处理管道：
1. 支持多种数据源（文件、URL、stdin）
2. 支持多种转换操作（过滤、映射、聚合）
3. 支持多种输出目标（文件、stdout、数据库）
4. 使用流式处理，支持大文件

### 练习5：构建文件搜索工具

创建一个高级文件搜索工具：
1. 支持正则表达式搜索
2. 支持文件内容搜索（类似 grep）
3. 支持文件类型过滤
4. 支持结果高亮显示

## 10. TypeScript 与 JavaScript 的区别

### 10.1 类型安全的文件操作

**JavaScript**:
```javascript
async function readJsonFile(path) {
  const content = await Deno.readTextFile(path);
  return JSON.parse(content);
  // 返回类型是 any
  // 无法在编译时检查数据结构
}

const config = await readJsonFile("config.json");
console.log(config.name);  // 可能是 undefined
```

**TypeScript**:
```typescript
interface Config {
  name: string;
  version: string;
  debug: boolean;
}

async function readJsonFile<T>(path: string): Promise<T> {
  const content = await Deno.readTextFile(path);
  return JSON.parse(content) as T;
}

const config = await readJsonFile<Config>("config.json");
console.log(config.name);  // 类型安全，编译时检查
```

### 10.2 泛型流处理

**JavaScript**:
```javascript
function createMapStream(transform) {
  return new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(transform(chunk));
      // 无法保证输入输出类型一致
    },
  });
}
```

**TypeScript**:
```typescript
function createMapStream<I, O>(
  transform: (value: I) => O | Promise<O>
): TransformStream<I, O> {
  return new TransformStream<I, O>({
    async transform(chunk, controller) {
      const result = await transform(chunk);
      controller.enqueue(result);
    },
  });
}
// 泛型确保输入类型 I 和输出类型 O 一致
```

### 10.3 接口定义日志结构

**JavaScript**:
```javascript
// 没有明确的数据结构定义
const logEntry = {
  timestamp: new Date(),
  level: "INFO",
  message: "User login",
  // 可能缺少必需字段
  // 可能有拼写错误
};
```

**TypeScript**:
```typescript
interface LogEntry {
  readonly timestamp: Date;
  readonly level: LogLevel;
  readonly message: string;
  readonly source?: string;
}

const logEntry: LogEntry = {
  timestamp: new Date(),
  level: LogLevel.INFO,
  message: "User login",
  // 缺少必需字段会报错
  // 拼写错误会报错
};
```

## 11. 运行项目

### 11.1 环境准备

```bash
# 确保 Deno 已安装
deno --version

# 进入项目目录
cd 11-file-processing
```

### 11.2 运行示例

```bash
# 运行文件操作示例
deno run --allow-read --allow-write file-ops.ts

# 运行流处理示例
deno run --allow-read --allow-write stream-processing.ts

# 运行日志分析工具
deno run --allow-read --allow-write log-analyzer.ts
```

### 11.3 类型检查

```bash
# 运行类型检查
deno check file-ops.ts stream-processing.ts log-analyzer.ts

# 运行测试
deno test

# 格式化代码
deno fmt
```

## 12. 总结

通过本项目，你学习了：

1. **Deno 文件系统 API**：文件读写、目录操作、文件信息
2. **流处理**：ReadableStream、WritableStream、TransformStream
3. **数据转换**：JSON、CSV 格式转换
4. **批量处理**：并发控制、进度跟踪
5. **日志分析**：解析、统计、报告生成
6. **TypeScript 优势**：类型安全、泛型、接口

这些技能将帮助你处理各种文件处理任务。在下一个项目中，我们将学习 Web 应用开发。


---

## 项目导航

[上一个项目：CLI工具](/projects/10-cli-tool/)

[下一个项目：Web应用](/projects/12-web-app/)

[返回学习路径](/learning-path/)
