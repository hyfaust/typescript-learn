/**
 * stream-processing.ts - 流处理示例
 *
 * 本文件演示 Deno 中的流处理：
 * - ReadableStream（可读流）
 * - WritableStream（可写流）
 * - TransformStream（转换流）
 * - 流的管道连接
 * - 大文件处理
 *
 * TypeScript 优势：
 * - 泛型流类型确保类型安全
 * - 接口定义流处理器
 * - 异步迭代器类型支持
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 流处理选项 */
interface StreamOptions {
  readonly highWaterMark?: number;
  readonly encoding?: string;
}

/** 转换函数类型 */
type TransformFunction<I, O> = (chunk: I) => O | Promise<O>;

/** 流统计信息 */
interface StreamStats {
  readonly bytesRead: number;
  readonly bytesWritten: number;
  readonly chunksProcessed: number;
  readonly duration: number;
  readonly throughput: number; // bytes per second
}

/** 行处理回调 */
type LineProcessor = (line: string, lineNumber: number) => string | null;

/** 分块处理选项 */
interface ChunkOptions {
  readonly chunkSize?: number;
  readonly overlap?: number;
}

// ============================================================================
// 可读流创建
// ============================================================================

/**
 * 从数组创建可读流
 *
 * TypeScript 优势：泛型确保流中的数据类型一致
 */
export function createReadableStream<T>(data: readonly T[]): ReadableStream<T> {
  let index = 0;

  return new ReadableStream<T>({
    pull(controller) {
      if (index < data.length) {
        controller.enqueue(data[index]!);
        index++;
      } else {
        controller.close();
      }
    },
  });
}

/**
 * 从异步迭代器创建可读流
 */
export function createStreamFromAsyncIterator<T>(
  iterator: AsyncIterable<T>,
): ReadableStream<T> {
  const iter = iterator[Symbol.asyncIterator]();

  return new ReadableStream<T>({
    async pull(controller) {
      try {
        const { value, done } = await iter.next();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * 从文件创建可读流
 */
export function createFileStream(filePath: string): ReadableStream<Uint8Array> {
  const file = Deno.openSync(filePath, { read: true });
  let closed = false;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const chunk = new Uint8Array(4096);
      try {
        const bytesRead = await file.read(chunk);
        if (bytesRead === null) {
          controller.close();
          if (!closed) {
            closed = true;
            file.close();
          }
        } else {
          controller.enqueue(chunk.subarray(0, bytesRead));
        }
      } catch (error) {
        controller.error(error);
        if (!closed) {
          closed = true;
          file.close();
        }
      }
    },
    cancel() {
      if (!closed) {
        closed = true;
        file.close();
      }
    },
  });
}

/**
 * 创建行读取流
 *
 * TypeScript 优势：使用 TextDecoderStream 处理文本编码
 */
export function createLineStream(filePath: string): ReadableStream<string> {
  const fileStream = createFileStream(filePath);
  const textStream = fileStream.pipeThrough(new TextDecoderStream());

  // 分割为行
  let buffer = "";

  return textStream.pipeThrough(
    new TransformStream<string, string>({
      transform(chunk, controller) {
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          controller.enqueue(line);
        }
      },
      flush(controller) {
        if (buffer.length > 0) {
          controller.enqueue(buffer);
        }
      },
    }),
  );
}

// ============================================================================
// 可写流创建
// ============================================================================

/**
 * 创建收集流 - 将流数据收集到数组
 */
export function createCollectorStream<T>(): {
  stream: WritableStream<T>;
  getResults: () => readonly T[];
} {
  const results: T[] = [];

  const stream = new WritableStream<T>({
    write(chunk) {
      results.push(chunk);
    },
  });

  return {
    stream,
    getResults: () => [...results],
  };
}

/**
 * 创建文件写入流
 */
export function createFileWriteStream(filePath: string): WritableStream<Uint8Array> {
  const file = Deno.openSync(filePath, { write: true, create: true });
  let closed = false;

  return new WritableStream<Uint8Array>({
    async write(chunk) {
      await file.write(chunk);
    },
    close() {
      if (!closed) {
        closed = true;
        file.close();
      }
    },
    abort() {
      if (!closed) {
        closed = true;
        file.close();
      }
    },
  });
}

/**
 * 创建控制台输出流
 */
export function createConsoleStream<T>(
  formatter: (value: T) => string = String,
): WritableStream<T> {
  return new WritableStream<T>({
    write(chunk) {
      console.log(formatter(chunk));
    },
  });
}

// ============================================================================
// 转换流
// ============================================================================

/**
 * 创建映射转换流
 *
 * TypeScript 优势：泛型参数确保输入输出类型
 */
export function createMapStream<I, O>(
  transform: TransformFunction<I, O>,
): TransformStream<I, O> {
  return new TransformStream<I, O>({
    async transform(chunk, controller) {
      try {
        const result = await transform(chunk);
        controller.enqueue(result);
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * 创建过滤转换流
 */
export function createFilterStream<T>(
  predicate: (value: T) => boolean | Promise<boolean>,
): TransformStream<T, T> {
  return new TransformStream<T, T>({
    async transform(chunk, controller) {
      try {
        if (await predicate(chunk)) {
          controller.enqueue(chunk);
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * 创建批处理转换流
 *
 * TypeScript 优势：泛型确保批次元素类型一致
 */
export function createBatchStream<T>(batchSize: number): TransformStream<T, T[]> {
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

/**
 * 创建去重转换流
 */
export function createDistinctStream<T>(
  keySelector: (value: T) => string = String,
): TransformStream<T, T> {
  const seen = new Set<string>();

  return new TransformStream<T, T>({
    transform(chunk, controller) {
      const key = keySelector(chunk);
      if (!seen.has(key)) {
        seen.add(key);
        controller.enqueue(chunk);
      }
    },
  });
}

/**
 * 创建行处理转换流
 */
export function createLineTransformStream(
  processor: LineProcessor,
): TransformStream<string, string> {
  let lineNumber = 0;

  return new TransformStream<string, string>({
    transform(line, controller) {
      lineNumber++;
      const result = processor(line, lineNumber);
      if (result !== null) {
        controller.enqueue(result);
      }
    },
  });
}

/**
 * 创建 JSON 行解析流（NDJSON 格式）
 *
 * TypeScript 优势：泛型确保解析后的类型
 */
export function createJsonLineStream<T>(): TransformStream<string, T> {
  return new TransformStream<string, T>({
    transform(line, controller) {
      const trimmed = line.trim();
      if (trimmed.length === 0) return;

      try {
        const parsed = JSON.parse(trimmed) as T;
        controller.enqueue(parsed);
      } catch (error) {
        console.warn(`JSON 解析失败: ${trimmed.slice(0, 50)}...`);
      }
    },
  });
}

/**
 * 创建 CSV 行解析流
 */
export function createCsvParseStream(
  delimiter = ",",
  hasHeader = true,
): TransformStream<string, Record<string, string>> {
  let headers: string[] = [];
  let isFirstLine = true;

  return new TransformStream<string, Record<string, string>>({
    transform(line, controller) {
      const trimmed = line.trim();
      if (trimmed.length === 0) return;

      const values = trimmed.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ""));

      if (isFirstLine && hasHeader) {
        headers = values;
        isFirstLine = false;
        return;
      }

      if (isFirstLine) {
        headers = values.map((_, i) => `column_${i}`);
        isFirstLine = false;
      }

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ?? "";
      });

      controller.enqueue(row);
    },
  });
}

// ============================================================================
// 流管道操作
// ============================================================================

/**
 * 流统计包装器
 */
export async function pipeWithStats<T>(
  source: ReadableStream<T>,
  destination: WritableStream<T>,
): Promise<StreamStats> {
  const startTime = performance.now();
  let chunksProcessed = 0;
  let bytesRead = 0;

  const trackingSource = source.pipeThrough(
    new TransformStream<T, T>({
      transform(chunk, controller) {
        chunksProcessed++;
        bytesRead += new TextEncoder().encode(JSON.stringify(chunk)).length;
        controller.enqueue(chunk);
      },
    }),
  );

  await trackingSource.pipeTo(destination);

  const duration = performance.now() - startTime;

  return {
    bytesRead,
    bytesWritten: bytesRead,
    chunksProcessed,
    duration,
    throughput: bytesRead / (duration / 1000),
  };
}

/**
 * 将流转换为数组
 */
export async function streamToArray<T>(stream: ReadableStream<T>): Promise<T[]> {
  const results: T[] = [];
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      results.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return results;
}

/**
 * 流式处理文件
 */
export async function processFileStream(
  inputPath: string,
  outputPath: string,
  processor: LineProcessor,
): Promise<StreamStats> {
  const lineStream = createLineStream(inputPath);
  const transformedStream = lineStream.pipeThrough(createLineTransformStream(processor));

  const outputFile = await Deno.open(outputPath, { write: true, create: true });
  const encoder = new TextEncoder();

  const writeStream = new WritableStream<string>({
    write(line) {
      outputFile.writeSync(encoder.encode(line + "\n"));
    },
    close() {
      outputFile.close();
    },
  });

  const stats = await pipeWithStats(transformedStream, writeStream);
  return stats;
}

// ============================================================================
// 大文件处理示例
// ============================================================================

/**
 * 分块读取大文件
 */
export async function* readFileInChunks(
  filePath: string,
  chunkSize = 1024 * 1024, // 1MB
): AsyncGenerator<Uint8Array> {
  const file = await Deno.open(filePath, { read: true });

  try {
    while (true) {
      const buffer = new Uint8Array(chunkSize);
      const bytesRead = await file.read(buffer);

      if (bytesRead === null) break;

      yield bytesRead === chunkSize ? buffer : buffer.subarray(0, bytesRead);
    }
  } finally {
    file.close();
  }
}

/**
 * 流式复制大文件
 */
export async function streamCopyFile(
  source: string,
  destination: string,
  options: { bufferSize?: number } = {},
): Promise<StreamStats> {
  const { bufferSize = 64 * 1024 } = options;
  const startTime = performance.now();
  let totalBytes = 0;
  let chunks = 0;

  const sourceFile = await Deno.open(source, { read: true });
  const destFile = await Deno.open(destination, { write: true, create: true });

  try {
    const buffer = new Uint8Array(bufferSize);

    while (true) {
      const bytesRead = await sourceFile.read(buffer);
      if (bytesRead === null) break;

      await destFile.write(buffer.subarray(0, bytesRead));
      totalBytes += bytesRead;
      chunks++;
    }
  } finally {
    sourceFile.close();
    destFile.close();
  }

  const duration = performance.now() - startTime;

  return {
    bytesRead: totalBytes,
    bytesWritten: totalBytes,
    chunksProcessed: chunks,
    duration,
    throughput: totalBytes / (duration / 1000),
  };
}

/**
 * 流式搜索文件内容
 */
export async function* streamSearch(
  filePath: string,
  pattern: RegExp,
): AsyncGenerator<{ line: string; lineNumber: number; matches: RegExpMatchArray[] }> {
  let lineNumber = 0;

  for await (const line of createLineStream(filePath)) {
    lineNumber++;
    const matches = [...line.matchAll(pattern)];
    if (matches.length > 0) {
      yield { line, lineNumber, matches };
    }
  }
}

// ============================================================================
// 示例演示
// ============================================================================

/**
 * 演示基本流操作
 */
async function demoBasicStreams(): Promise<void> {
  console.log("\n=== 基本流操作示例 ===\n");

  // 1. 创建可读流
  console.log("1. 从数组创建可读流");
  const data = [1, 2, 3, 4, 5];
  const readable = createReadableStream(data);

  // 2. 创建收集流
  const { stream: writable, getResults } = createCollectorStream<number>();

  // 3. 管道连接
  await readable.pipeTo(writable);
  console.log("   收集结果:", getResults());

  // 4. 映射转换
  console.log("\n2. 映射转换流");
  const mappedStream = createReadableStream([1, 2, 3, 4, 5])
    .pipeThrough(createMapStream((x: number) => x * 2));

  const mappedResults = await streamToArray(mappedStream);
  console.log("   映射结果:", mappedResults);

  // 5. 过滤转换
  console.log("\n3. 过滤转换流");
  const filteredStream = createReadableStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .pipeThrough(createFilterStream((x: number) => x % 2 === 0));

  const filteredResults = await streamToArray(filteredStream);
  console.log("   过滤结果:", filteredResults);
}

/**
 * 演示批处理流
 */
async function demoBatchStream(): Promise<void> {
  console.log("\n=== 批处理流示例 ===\n");

  const data = Array.from({ length: 10 }, (_, i) => i + 1);
  console.log("输入数据:", data);

  const batchedStream = createReadableStream(data)
    .pipeThrough(createBatchStream(3));

  const batches = await streamToArray(batchedStream);
  console.log("批处理结果:");
  batches.forEach((batch, i) => console.log(`   批次 ${i + 1}:`, batch));
}

/**
 * 演示行处理流
 */
async function demoLineProcessing(): Promise<void> {
  console.log("\n=== 行处理流示例 ===\n");

  const testFile = "./test_lines.txt";
  const outputFile = "./test_output.txt";

  // 创建测试文件
  const lines = [
    "Hello World",
    "TypeScript is great",
    "Deno is awesome",
    "Stream processing rocks",
    "",
    "  Extra spaces  ",
    "FINAL LINE",
  ];
  await Deno.writeTextFile(testFile, lines.join("\n"));

  console.log("原始文件内容:");
  console.log(lines.map((l) => `   "${l}"`).join("\n"));

  // 处理行：转小写、去除空行、去除首尾空格
  const stats = await processFileStream(testFile, outputFile, (line) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return null;
    return trimmed.toLowerCase();
  });

  console.log("\n处理后的文件:");
  const output = await Deno.readTextFile(outputFile);
  console.log(output.split("\n").filter(Boolean).map((l) => `   "${l}"`).join("\n"));

  console.log("\n流统计:");
  console.log(`   处理块数: ${stats.chunksProcessed}`);
  console.log(`   处理时间: ${stats.duration.toFixed(2)}ms`);

  // 清理
  await Deno.remove(testFile);
  await Deno.remove(outputFile);
}

/**
 * 演示 CSV 流处理
 */
async function demoCsvStream(): Promise<void> {
  console.log("\n=== CSV 流处理示例 ===\n");

  const csvContent = [
    "name,age,city",
    "Alice,30,Beijing",
    "Bob,25,Shanghai",
    "Charlie,35,Guangzhou",
    "David,28,Shenzhen",
  ].join("\n");

  const csvStream = createReadableStream(csvContent.split("\n"))
    .pipeThrough(createCsvParseStream(","));

  const records = await streamToArray(csvStream);

  console.log("解析的 CSV 记录:");
  records.forEach((record, i) => {
    console.log(`   记录 ${i + 1}:`, record);
  });
}

/**
 * 演示流统计
 */
async function demoStreamStats(): Promise<void> {
  console.log("\n=== 流统计示例 ===\n");

  // 创建大量数据
  const data = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    value: Math.random(),
    timestamp: new Date().toISOString(),
  }));

  const source = createReadableStream(data);
  const { stream: destination, getResults } = createCollectorStream<typeof data[0]>();

  const stats = await pipeWithStats(source, destination);

  console.log("流处理统计:");
  console.log(`   处理块数: ${stats.chunksProcessed}`);
  console.log(`   读取字节: ${stats.bytesRead}`);
  console.log(`   处理时间: ${stats.duration.toFixed(2)}ms`);
  console.log(`   吞吐量: ${(stats.throughput / 1024 / 1024).toFixed(2)} MB/s`);
  console.log(`   结果数量: ${getResults().length}`);
}

// ============================================================================
// 主程序
// ============================================================================

async function main(): Promise<void> {
  console.log("Deno 流处理示例");
  console.log("=".repeat(50));

  await demoBasicStreams();
  await demoBatchStream();
  await demoLineProcessing();
  await demoCsvStream();
  await demoStreamStats();

  console.log("\n" + "=".repeat(50));
  console.log("所有示例执行完成！");
}

// 运行示例
if (import.meta.main) {
  await main();
}

// ============================================================================
// 导出
// ============================================================================

export type {
  StreamOptions,
  TransformFunction,
  StreamStats,
  LineProcessor,
  ChunkOptions,
};
