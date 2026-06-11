/**
 * file-ops.ts - 文件操作示例
 *
 * 本文件演示 Deno 文件系统 API 的各种操作：
 * - 文本文件读写
 * - JSON 文件操作
 * - CSV 文件处理
 * - 文件信息获取
 * - 目录操作
 *
 * TypeScript 优势：
 * - 类型安全的文件数据处理
 * - 接口定义文件结构
 * - 泛型支持通用文件操作
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 文件元数据 */
interface FileMetadata {
  readonly path: string;
  readonly name: string;
  readonly size: number;
  readonly created: Date | null;
  readonly modified: Date | null;
  readonly isDirectory: boolean;
  readonly isFile: boolean;
  readonly isSymlink: boolean;
}

/** CSV 解析选项 */
interface CsvParseOptions {
  readonly delimiter?: string;
  readonly hasHeader?: boolean;
  readonly skipEmptyLines?: boolean;
  readonly trimValues?: boolean;
}

/** CSV 序列化选项 */
interface CsvStringifyOptions {
  readonly delimiter?: string;
  readonly includeHeader?: boolean;
  readonly lineEnding?: string;
}

/** JSON 文件操作选项 */
interface JsonFileOptions {
  readonly pretty?: boolean;
  readonly indent?: number;
  readonly replacer?: (key: string, value: unknown) => unknown;
}

/** 文件读取选项 */
interface ReadFileOptions {
  readonly encoding?: string;
  readonly flag?: string;
}

/** 目录遍历选项 */
interface WalkOptions {
  readonly maxDepth?: number;
  readonly includeFiles?: boolean;
  readonly includeDirs?: boolean;
  readonly followSymlinks?: boolean;
  readonly match?: RegExp[];
  readonly skip?: RegExp[];
}

/** 遍历结果条目 */
interface WalkEntry {
  readonly path: string;
  readonly name: string;
  readonly isFile: boolean;
  readonly isDirectory: boolean;
  readonly isSymlink: boolean;
  readonly size?: number;
  readonly depth: number;
}

// ============================================================================
// 文本文件操作
// ============================================================================

/**
 * 读取文本文件
 *
 * TypeScript 优势：返回类型明确为 Promise<string>
 */
export async function readTextFile(path: string): Promise<string> {
  try {
    return await Deno.readTextFile(path);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(`文件不存在: ${path}`);
    }
    if (error instanceof Deno.errors.PermissionDenied) {
      throw new Error(`没有权限读取文件: ${path}`);
    }
    throw error;
  }
}

/**
 * 写入文本文件
 */
export async function writeTextFile(path: string, content: string): Promise<void> {
  try {
    await Deno.writeTextFile(path, content);
  } catch (error) {
    if (error instanceof Deno.errors.PermissionDenied) {
      throw new Error(`没有权限写入文件: ${path}`);
    }
    throw error;
  }
}

/**
 * 追加文本到文件
 */
export async function appendTextFile(path: string, content: string): Promise<void> {
  const file = await Deno.open(path, { write: true, append: true });
  try {
    const encoder = new TextEncoder();
    await file.write(encoder.encode(content));
  } finally {
    file.close();
  }
}

/**
 * 按行读取文件
 *
 * TypeScript 优势：返回 readonly 数组确保不可变
 */
export async function readLines(path: string): Promise<readonly string[]> {
  const content = await readTextFile(path);
  return content.split("\n").filter((line) => line.length > 0);
}

/**
 * 写入多行到文件
 */
export async function writeLines(path: string, lines: readonly string[]): Promise<void> {
  await writeTextFile(path, lines.join("\n") + "\n");
}

// ============================================================================
// JSON 文件操作
// ============================================================================

/**
 * 读取 JSON 文件
 *
 * TypeScript 优势：泛型确保返回类型安全
 */
export async function readJsonFile<T = unknown>(
  path: string,
): Promise<T> {
  const content = await readTextFile(path);
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`JSON 解析失败: ${path} - ${error}`);
  }
}

/**
 * 写入 JSON 文件
 */
export async function writeJsonFile<T>(
  path: string,
  data: T,
  options: JsonFileOptions = {},
): Promise<void> {
  const { pretty = true, indent = 2, replacer } = options;
  const content = pretty
    ? JSON.stringify(data, replacer as (key: string, value: unknown) => unknown, indent)
    : JSON.stringify(data, replacer as (key: string, value: unknown) => unknown);
  await writeTextFile(path, content);
}

/**
 * 更新 JSON 文件中的特定字段
 *
 * TypeScript 优势：使用递归类型处理嵌套对象
 */
export async function updateJsonFile<T extends Record<string, unknown>>(
  path: string,
  updates: Partial<T>,
): Promise<T> {
  const data = await readJsonFile<T>(path);
  const updated = { ...data, ...updates } as T;
  await writeJsonFile(path, updated);
  return updated;
}

// ============================================================================
// CSV 文件操作
// ============================================================================

/**
 * 解析 CSV 行
 */
function parseCsvLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // 转义的引号
        current += '"';
        i++;
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // 分隔符
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

/**
 * 解析 CSV 内容
 *
 * TypeScript 优势：泛型返回类型确保数据结构一致
 */
export function parseCsv<T extends Record<string, string>>(
  content: string,
  options: CsvParseOptions = {},
): T[] {
  const {
    delimiter = ",",
    hasHeader = true,
    skipEmptyLines = true,
    trimValues = true,
  } = options;

  const lines = content.split("\n");
  const result: T[] = [];

  let headers: string[] = [];
  let startIndex = 0;

  if (hasHeader && lines.length > 0) {
    headers = parseCsvLine(lines[0]!, delimiter);
    if (trimValues) {
      headers = headers.map((h) => h.trim());
    }
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]!;

    if (skipEmptyLines && line.trim().length === 0) continue;

    const values = parseCsvLine(line, delimiter);
    const trimmedValues = trimValues ? values.map((v) => v.trim()) : values;

    if (hasHeader) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = trimmedValues[index] ?? "";
      });
      result.push(row as T);
    } else {
      // 没有表头时，使用索引作为键
      const row: Record<string, string> = {};
      trimmedValues.forEach((value, index) => {
        row[String(index)] = value;
      });
      result.push(row as T);
    }
  }

  return result;
}

/**
 * 序列化为 CSV 格式
 */
export function stringifyCsv<T extends Record<string, unknown>>(
  data: readonly T[],
  options: CsvStringifyOptions = {},
): string {
  const {
    delimiter = ",",
    includeHeader = true,
    lineEnding = "\n",
  } = options;

  if (data.length === 0) return "";

  // 获取所有键
  const keys = Object.keys(data[0]!);

  const lines: string[] = [];

  // 添加表头
  if (includeHeader) {
    lines.push(keys.map((key) => escapeCsvValue(key, delimiter)).join(delimiter));
  }

  // 添加数据行
  for (const row of data) {
    const values = keys.map((key) => {
      const value = row[key];
      return escapeCsvValue(String(value ?? ""), delimiter);
    });
    lines.push(values.join(delimiter));
  }

  return lines.join(lineEnding);
}

/**
 * 转义 CSV 值
 */
function escapeCsvValue(value: string, delimiter: string): string {
  if (value.includes(delimiter) || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * 读取 CSV 文件
 */
export async function readCsvFile<T extends Record<string, string>>(
  path: string,
  options?: CsvParseOptions,
): Promise<T[]> {
  const content = await readTextFile(path);
  return parseCsv<T>(content, options);
}

/**
 * 写入 CSV 文件
 */
export async function writeCsvFile<T extends Record<string, unknown>>(
  path: string,
  data: readonly T[],
  options?: CsvStringifyOptions,
): Promise<void> {
  const content = stringifyCsv(data, options);
  await writeTextFile(path, content);
}

// ============================================================================
// 文件信息
// ============================================================================

/**
 * 获取文件元数据
 */
export async function getFileMetadata(path: string): Promise<FileMetadata> {
  const stat = await Deno.stat(path);
  const name = path.split(/[/\\]/).pop() ?? path;

  return {
    path,
    name,
    size: stat.size,
    created: stat.birthtime,
    modified: stat.mtime,
    isDirectory: stat.isDirectory,
    isFile: stat.isFile,
    isSymlink: stat.isSymlink,
  };
}

/**
 * 检查文件是否存在
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取文件大小
 */
export async function getFileSize(path: string): Promise<number> {
  const stat = await Deno.stat(path);
  return stat.size;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

// ============================================================================
// 目录操作
// ============================================================================

/**
 * 创建目录（递归）
 */
export async function ensureDir(path: string): Promise<void> {
  try {
    await Deno.mkdir(path, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }
}

/**
 * 删除目录（递归）
 */
export async function removeDir(path: string): Promise<void> {
  await Deno.remove(path, { recursive: true });
}

/**
 * 列出目录内容
 */
export async function listDir(path: string): Promise<WalkEntry[]> {
  const entries: WalkEntry[] = [];

  for await (const entry of Deno.readDir(path)) {
    entries.push({
      path: `${path}/${entry.name}`,
      name: entry.name,
      isFile: entry.isFile,
      isDirectory: entry.isDirectory,
      isSymlink: entry.isSymlink,
      depth: 0,
    });
  }

  return entries;
}

/**
 * 递归遍历目录
 *
 * TypeScript 优势：使用 async generator 实现惰性遍历
 */
export async function* walkDirectory(
  rootPath: string,
  options: WalkOptions = {},
): AsyncGenerator<WalkEntry> {
  const {
    maxDepth = Infinity,
    includeFiles = true,
    includeDirs = true,
    followSymlinks = false,
    match = [],
    skip = [],
  } = options;

  async function* walk(
    dirPath: string,
    depth: number,
  ): AsyncGenerator<WalkEntry> {
    if (depth > maxDepth) return;

    for await (const entry of Deno.readDir(dirPath)) {
      const fullPath = `${dirPath}/${entry.name}`;

      // 检查是否跳过
      const shouldSkip = skip.some((pattern) => pattern.test(entry.name));
      if (shouldSkip) continue;

      // 检查是否匹配
      const shouldMatch = match.length === 0 || match.some((pattern) => pattern.test(entry.name));
      if (!shouldMatch) continue;

      // 处理符号链接
      if (entry.isSymlink && !followSymlinks) continue;

      const walkEntry: WalkEntry = {
        path: fullPath,
        name: entry.name,
        isFile: entry.isFile,
        isDirectory: entry.isDirectory,
        isSymlink: entry.isSymlink,
        depth,
      };

      if (entry.isFile && includeFiles) {
        yield walkEntry;
      } else if (entry.isDirectory && includeDirs) {
        yield walkEntry;
        yield* walk(fullPath, depth + 1);
      }
    }
  }

  yield* walk(rootPath, 0);
}

// ============================================================================
// 文件复制和移动
// ============================================================================

/**
 * 复制文件
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  await Deno.copyFile(src, dest);
}

/**
 * 移动/重命名文件
 */
export async function moveFile(src: string, dest: string): Promise<void> {
  await Deno.rename(src, dest);
}

/**
 * 删除文件
 */
export async function removeFile(path: string): Promise<void> {
  await Deno.remove(path);
}

// ============================================================================
// 临时文件
// ============================================================================

/**
 * 创建临时文件
 */
export async function createTempFile(
  content: string,
  options: { suffix?: string; dir?: string } = {},
): Promise<string> {
  const { suffix = ".tmp", dir } = options;
  const tempDir = dir ?? Deno.env.get("TMPDIR") ?? Deno.env.get("TEMP") ?? "/tmp";
  const tempFile = await Deno.makeTempFile({ suffix, dir: tempDir });
  await writeTextFile(tempFile, content);
  return tempFile;
}

// ============================================================================
// 示例演示
// ============================================================================

/**
 * 演示文本文件操作
 */
async function demoTextFileOps(): Promise<void> {
  console.log("\n=== 文本文件操作示例 ===\n");

  const testFile = "./test_output.txt";

  // 写入文件
  console.log("1. 写入文本文件...");
  await writeTextFile(testFile, "Hello, Deno!\nTypeScript is great!\n");
  console.log(`   已写入: ${testFile}`);

  // 读取文件
  console.log("\n2. 读取文本文件...");
  const content = await readTextFile(testFile);
  console.log(`   内容: ${content}`);

  // 按行读取
  console.log("\n3. 按行读取...");
  const lines = await readLines(testFile);
  console.log(`   行数: ${lines.length}`);
  lines.forEach((line, i) => console.log(`   ${i + 1}: ${line}`));

  // 追加内容
  console.log("\n4. 追加内容...");
  await appendTextFile(testFile, "Appended line\n");
  const newContent = await readTextFile(testFile);
  console.log(`   新内容: ${newContent}`);

  // 清理
  await removeFile(testFile);
  console.log("\n   已清理测试文件");
}

/**
 * 演示 JSON 文件操作
 */
async function demoJsonFileOps(): Promise<void> {
  console.log("\n=== JSON 文件操作示例 ===\n");

  const testFile = "./test_config.json";

  // 定义类型
  interface Config {
    name: string;
    version: string;
    debug: boolean;
    features: string[];
  }

  // 写入 JSON
  console.log("1. 写入 JSON 文件...");
  const config: Config = {
    name: "my-app",
    version: "1.0.0",
    debug: true,
    features: ["typescript", "deno"],
  };
  await writeJsonFile(testFile, config);
  console.log(`   已写入: ${testFile}`);

  // 读取 JSON
  console.log("\n2. 读取 JSON 文件...");
  const loaded = await readJsonFile<Config>(testFile);
  console.log(`   名称: ${loaded.name}`);
  console.log(`   版本: ${loaded.version}`);
  console.log(`   调试: ${loaded.debug}`);
  console.log(`   特性: ${loaded.features.join(", ")}`);

  // 更新 JSON
  console.log("\n3. 更新 JSON 文件...");
  await updateJsonFile(testFile, { version: "2.0.0" } as Partial<Config>);
  const updated = await readJsonFile<Config>(testFile);
  console.log(`   新版本: ${updated.version}`);

  // 清理
  await removeFile(testFile);
  console.log("\n   已清理测试文件");
}

/**
 * 演示 CSV 文件操作
 */
async function demoCsvFileOps(): Promise<void> {
  console.log("\n=== CSV 文件操作示例 ===\n");

  const testFile = "./test_data.csv";

  // 定义类型
  interface User {
    name: string;
    age: string;
    email: string;
  }

  // 创建测试数据
  const users: User[] = [
    { name: "Alice", age: "30", email: "alice@example.com" },
    { name: "Bob", age: "25", email: "bob@example.com" },
    { name: "Charlie", age: "35", email: "charlie@example.com" },
  ];

  // 写入 CSV
  console.log("1. 写入 CSV 文件...");
  await writeCsvFile(testFile, users);
  console.log(`   已写入: ${testFile}`);

  // 显示 CSV 内容
  console.log("\n2. CSV 内容:");
  const csvContent = await readTextFile(testFile);
  console.log(csvContent);

  // 读取 CSV
  console.log("3. 解析 CSV 文件...");
  const loadedUsers = await readCsvFile<User>(testFile);
  loadedUsers.forEach((user, i) => {
    console.log(`   用户 ${i + 1}: ${user.name}, ${user.age}岁, ${user.email}`);
  });

  // 使用 parseCsv 直接解析
  console.log("\n4. 使用 parseCsv 解析...");
  const parsed = parseCsv<User>(csvContent);
  console.log(`   解析到 ${parsed.length} 条记录`);

  // 序列化为 CSV
  console.log("\n5. 序列化为 CSV...");
  const newCsv = stringifyCsv([
    { name: "David", age: "28", email: "david@example.com" },
    { name: "Eve", age: "32", email: "eve@example.com" },
  ]);
  console.log(newCsv);

  // 清理
  await removeFile(testFile);
  console.log("\n   已清理测试文件");
}

/**
 * 演示目录操作
 */
async function demoDirOps(): Promise<void> {
  console.log("\n=== 目录操作示例 ===\n");

  const testDir = "./test_directory";

  // 创建目录
  console.log("1. 创建目录...");
  await ensureDir(`${testDir}/subdir1`);
  await ensureDir(`${testDir}/subdir2`);
  console.log(`   已创建: ${testDir}`);

  // 创建测试文件
  await writeTextFile(`${testDir}/file1.txt`, "File 1");
  await writeTextFile(`${testDir}/file2.txt`, "File 2");
  await writeTextFile(`${testDir}/subdir1/file3.txt`, "File 3");

  // 列出目录
  console.log("\n2. 列出目录内容...");
  const entries = await listDir(testDir);
  entries.forEach((entry) => {
    const type = entry.isDirectory ? "[DIR]" : "[FILE]";
    console.log(`   ${type} ${entry.name}`);
  });

  // 获取文件信息
  console.log("\n3. 文件信息...");
  const metadata = await getFileMetadata(`${testDir}/file1.txt`);
  console.log(`   路径: ${metadata.path}`);
  console.log(`   大小: ${formatFileSize(metadata.size)}`);
  console.log(`   修改: ${metadata.modified?.toISOString()}`);

  // 递归遍历
  console.log("\n4. 递归遍历...");
  for await (const entry of walkDirectory(testDir, { includeDirs: false })) {
    console.log(`   ${"  ".repeat(entry.depth)}${entry.name}`);
  }

  // 清理
  await removeDir(testDir);
  console.log("\n   已清理测试目录");
}

// ============================================================================
// 主程序
// ============================================================================

async function main(): Promise<void> {
  console.log("Deno 文件操作示例");
  console.log("=".repeat(50));

  await demoTextFileOps();
  await demoJsonFileOps();
  await demoCsvFileOps();
  await demoDirOps();

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
  FileMetadata,
  CsvParseOptions,
  CsvStringifyOptions,
  JsonFileOptions,
  WalkOptions,
  WalkEntry,
};
