/**
 * cli.ts - 文件搜索工具 (CLI 主程序)
 *
 * 实战项目：构建一个功能完整的文件搜索工具
 * 支持：
 * - 按文件名搜索
 * - 按文件内容搜索（grep 风格）
 * - 正则表达式支持
 * - 文件类型过滤
 * - 结果格式化输出
 * - 进度显示
 *
 * TypeScript 优势：
 * - 类型安全的命令行参数解析
 * - 接口定义清晰的数据结构
 * - 泛型工具函数的复用性
 */

import { ArgumentParser, stringOption, booleanOption, numberOption, positional, ParseError } from "./parser.ts";
import {
  Logger,
  ProgressBar,
  formatTable,
  formatFileSize,
  formatDuration,
  red,
  green,
  yellow,
  cyan,
  bold,
  dim,
  title,
  separator,
  type TableColumn,
} from "./utils.ts";

// ============================================================================
// 类型定义
// ============================================================================

/** 搜索结果 */
interface SearchResult {
  readonly path: string;
  readonly name: string;
  readonly size: number;
  readonly modified: Date;
  readonly isDirectory: boolean;
  readonly matchType: "name" | "content";
  readonly matchLine?: number;
  readonly matchText?: string;
  readonly score: number;
}

/** 搜索配置 */
interface SearchConfig {
  readonly pattern: string;
  readonly root: string;
  readonly contentSearch: boolean;
  readonly regex: boolean;
  readonly caseSensitive: boolean;
  readonly fileTypes: readonly string[];
  readonly maxDepth: number;
  readonly maxResults: number;
  readonly ignorePatterns: readonly string[];
  readonly showHidden: boolean;
}

/** 搜索统计 */
interface SearchStats {
  readonly totalFiles: number;
  readonly matchedFiles: number;
  readonly totalDirs: number;
  readonly duration: number;
  readonly errors: number;
}

/** 文件信息 */
interface FileInfo {
  readonly path: string;
  readonly name: string;
  readonly size: number;
  readonly modified: Date;
  readonly isDirectory: boolean;
  readonly extension: string;
}

// ============================================================================
// 搜索引擎
// ============================================================================

/**
 * 文件搜索引擎
 *
 * TypeScript 优势：
 * - 使用 readonly 确保配置不可变
 * - 类型断言处理异步操作结果
 */
class FileSearchEngine {
  private logger: Logger;
  private config: SearchConfig;
  private results: SearchResult[] = [];
  private stats: SearchStats = {
    totalFiles: 0,
    matchedFiles: 0,
    totalDirs: 0,
    duration: 0,
    errors: 0,
  };

  /** 默认忽略的目录和文件 */
  private static readonly DEFAULT_IGNORE = [
    "node_modules",
    ".git",
    ".svn",
    ".hg",
    "__pycache__",
    ".DS_Store",
    "Thumbs.db",
  ];

  constructor(config: SearchConfig) {
    this.config = config;
    this.logger = new Logger("Search", "info");
  }

  /**
   * 检查路径是否应该被忽略
   */
  private shouldIgnore(path: string): boolean {
    const name = path.split(/[/\\]/).pop() ?? "";

    // 检查隐藏文件
    if (!this.config.showHidden && name.startsWith(".")) {
      return true;
    }

    // 检查忽略模式
    const allIgnore = [...FileSearchEngine.DEFAULT_IGNORE, ...this.config.ignorePatterns];
    return allIgnore.some((pattern) => name === pattern);
  }

  /**
   * 获取文件信息
   */
  private async getFileInfo(path: string): Promise<FileInfo | null> {
    try {
      const stat = await Deno.stat(path);
      const name = path.split(/[/\\]/).pop() ?? "";
      const ext = name.includes(".") ? name.split(".").pop()?.toLowerCase() ?? "" : "";

      return {
        path,
        name,
        size: stat.size,
        modified: stat.mtime ?? new Date(),
        isDirectory: stat.isDirectory,
        extension: ext,
      };
    } catch (error) {
      this.logger.debug(`无法读取文件信息: ${path} - ${error}`);
      this.stats = { ...this.stats, errors: this.stats.errors + 1 };
      return null;
    }
  }

  /**
   * 检查文件名是否匹配
   */
  private matchFileName(name: string): number {
    const pattern = this.config.caseSensitive
      ? this.config.pattern
      : this.config.pattern.toLowerCase();
    const target = this.config.caseSensitive ? name : name.toLowerCase();

    if (this.config.regex) {
      try {
        const regex = new RegExp(pattern, this.config.caseSensitive ? "" : "i");
        return regex.test(target) ? 1 : 0;
      } catch {
        this.logger.warn(`无效的正则表达式: ${pattern}`);
        return 0;
      }
    }

    // 简单的模糊匹配评分
    if (target === pattern) return 1;
    if (target.includes(pattern)) return 0.8;
    return 0;
  }

  /**
   * 搜索文件内容
   */
  private async searchFileContent(path: string): Promise<SearchResult | null> {
    try {
      const content = await Deno.readTextFile(path);
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const matched = this.config.regex
          ? new RegExp(this.config.pattern, this.config.caseSensitive ? "" : "i").test(line)
          : (this.config.caseSensitive
            ? line.includes(this.config.pattern)
            : line.toLowerCase().includes(this.config.pattern.toLowerCase()));

        if (matched) {
          const stat = await Deno.stat(path);
          return {
            path,
            name: path.split(/[/\\]/).pop() ?? "",
            size: stat.size,
            modified: stat.mtime ?? new Date(),
            isDirectory: false,
            matchType: "content",
            matchLine: i + 1,
            matchText: line.trim().slice(0, 100),
            score: 0.9,
          };
        }
      }
    } catch {
      // 跳过无法读取的文件（二进制文件等）
    }
    return null;
  }

  /**
   * 递归搜索目录
   */
  private async searchDirectory(dirPath: string, depth: number): Promise<void> {
    if (depth > this.config.maxDepth) return;
    if (this.results.length >= this.config.maxResults) return;

    this.stats = { ...this.stats, totalDirs: this.stats.totalDirs + 1 };

    try {
      for await (const entry of Deno.readDir(dirPath)) {
        if (this.results.length >= this.config.maxResults) break;

        const fullPath = `${dirPath}/${entry.name}`;

        // 检查是否忽略
        if (this.shouldIgnore(fullPath)) continue;

        const fileInfo = await this.getFileInfo(fullPath);
        if (!fileInfo) continue;

        this.stats = { ...this.stats, totalFiles: this.stats.totalFiles + 1 };

        // 递归搜索子目录
        if (fileInfo.isDirectory) {
          await this.searchDirectory(fullPath, depth + 1);
          continue;
        }

        // 检查文件类型过滤
        if (this.config.fileTypes.length > 0) {
          if (!this.config.fileTypes.includes(fileInfo.extension)) continue;
        }

        // 文件名匹配
        const nameScore = this.matchFileName(fileInfo.name);
        if (nameScore > 0) {
          this.results.push({
            ...fileInfo,
            matchType: "name",
            score: nameScore,
          });
          this.stats = { ...this.stats, matchedFiles: this.stats.matchedFiles + 1 };
          continue;
        }

        // 内容搜索
        if (this.config.contentSearch) {
          const contentResult = await this.searchFileContent(fullPath);
          if (contentResult) {
            this.results.push(contentResult);
            this.stats = { ...this.stats, matchedFiles: this.stats.matchedFiles + 1 };
          }
        }
      }
    } catch (error) {
      this.logger.debug(`无法读取目录: ${dirPath} - ${error}`);
      this.stats = { ...this.stats, errors: this.stats.errors + 1 };
    }
  }

  /**
   * 执行搜索
   */
  async search(): Promise<{ results: readonly SearchResult[]; stats: SearchStats }> {
    const startTime = performance.now();

    this.logger.info(`开始搜索: "${this.config.pattern}"`);
    this.logger.info(`搜索路径: ${this.config.root}`);

    await this.searchDirectory(this.config.root, 0);

    // 按分数排序
    this.results.sort((a, b) => b.score - a.score);

    const endTime = performance.now();
    this.stats = {
      ...this.stats,
      duration: endTime - startTime,
    };

    return { results: this.results, stats: this.stats };
  }
}

// ============================================================================
// 结果格式化
// ============================================================================

/**
 * 格式化搜索结果为表格
 */
function formatResultsAsTable(results: readonly SearchResult[]): string {
  const columns: TableColumn[] = [
    { header: "类型", key: "matchType", width: 8, align: "center" },
    { header: "文件名", key: "name", width: 30 },
    { header: "大小", key: "sizeFormatted", width: 10, align: "right" },
    { header: "修改时间", key: "modifiedFormatted", width: 20 },
    { header: "路径", key: "path" },
  ];

  // 格式化数据
  const formattedData = results.map((r) => ({
    ...r,
    matchType: r.matchType === "name" ? "文件名" : "内容",
    sizeFormatted: r.isDirectory ? "<DIR>" : formatFileSize(r.size),
    modifiedFormatted: r.modified.toISOString().slice(0, 19).replace("T", " "),
    path: r.path,
  }));

  return formatTable(formattedData, columns, { border: true });
}

/**
 * 格式化匹配详情
 */
function formatMatchDetails(result: SearchResult): string {
  const parts: string[] = [];

  parts.push(cyan(result.path));

  if (result.matchType === "content" && result.matchLine !== undefined) {
    parts.push(dim(`  第 ${result.matchLine} 行:`));
    if (result.matchText) {
      parts.push(dim(`  ${result.matchText}`));
    }
  }

  parts.push(dim(`  大小: ${formatFileSize(result.size)} | 修改: ${result.modified.toISOString().slice(0, 10)}`));

  return parts.join("\n");
}

// ============================================================================
// CLI 主程序
// ============================================================================

/**
 * 创建文件搜索 CLI
 */
function createSearchCLI(): ArgumentParser {
  const parser = new ArgumentParser(
    "file-search",
    "一个功能强大的文件搜索工具",
    "1.0.0",
  );

  // 添加选项
  parser.addOptions([
    stringOption("path", "搜索路径", { alias: "p", default: "." }),
    booleanOption("content", "搜索文件内容", { alias: "c" }),
    booleanOption("regex", "使用正则表达式", { alias: "r" }),
    booleanOption("case-sensitive", "区分大小写", { alias: "s" }),
    stringOption("type", "文件类型过滤（逗号分隔）", { alias: "t" }),
    numberOption("depth", "最大搜索深度", { alias: "d", default: 10, min: 0, max: 100 }),
    numberOption("limit", "最大结果数量", { alias: "l", default: 50, min: 1, max: 1000 }),
    booleanOption("hidden", "包含隐藏文件", { alias: "a" }),
    stringOption("ignore", "忽略模式（逗号分隔）", { alias: "i" }),
    booleanOption("table", "表格格式输出"),
    booleanOption("verbose", "详细输出", { alias: "v" }),
    booleanOption("quiet", "安静模式", { alias: "q" }),
  ]);

  // 添加位置参数
  parser.addPositional({
    name: "pattern",
    description: "搜索模式（文件名或内容关键词）",
    required: true,
  });

  // 添加子命令
  parser.addCommands([
    {
      name: "search",
      description: "执行搜索",
      aliases: ["s"],
      action: handleSearch,
    },
    {
      name: "stats",
      description: "显示搜索统计",
      action: handleStats,
    },
  ]);

  return parser;
}

/**
 * 处理搜索命令
 */
async function handleSearch(args: ParsedArgs): Promise<void> {
  const pattern = args.positional[0];
  if (!pattern) {
    console.error(red("错误: 请提供搜索模式"));
    Deno.exit(1);
  }

  // 解析配置
  const config: SearchConfig = {
    pattern,
    root: args.options["path"] as string ?? ".",
    contentSearch: args.options["content"] as boolean ?? false,
    regex: args.options["regex"] as boolean ?? false,
    caseSensitive: args.options["case-sensitive"] as boolean ?? false,
    fileTypes: (args.options["type"] as string ?? "").split(",").filter(Boolean),
    maxDepth: args.options["depth"] as number ?? 10,
    maxResults: args.options["limit"] as number ?? 50,
    ignorePatterns: (args.options["ignore"] as string ?? "").split(",").filter(Boolean),
    showHidden: args.options["hidden"] as boolean ?? false,
  };

  // 创建搜索引擎
  const engine = new FileSearchEngine(config);

  // 执行搜索
  const { results, stats } = await engine.search();

  // 输出结果
  if (results.length === 0) {
    console.log(yellow("\n未找到匹配的文件"));
    console.log(dim("提示: 尝试使用 --content 搜索文件内容，或使用 --regex 启用正则表达式"));
    return;
  }

  console.log();
  title("搜索结果");

  // 统计信息
  console.log(dim(`扫描: ${stats.totalFiles} 文件, ${stats.totalDirs} 目录`));
  console.log(dim(`匹配: ${stats.matchedFiles} 结果`));
  console.log(dim(`耗时: ${formatDuration(stats.duration)}`));
  separator();

  // 输出结果
  if (args.options["table"]) {
    console.log(formatResultsAsTable(results));
  } else {
    for (const result of results) {
      console.log(formatMatchDetails(result));
      console.log();
    }
  }

  // 最终统计
  separator();
  console.log(bold(`共找到 ${green(String(results.length))} 个匹配结果`));
}

/**
 * 处理统计命令
 */
async function handleStats(args: ParsedArgs): Promise<void> {
  const path = args.options["path"] as string ?? ".";

  try {
    const stat = await Deno.stat(path);

    console.log();
    title("文件/目录统计");

    const info = [
      ["路径", path],
      ["类型", stat.isDirectory ? "目录" : "文件"],
      ["大小", formatFileSize(stat.size)],
      ["创建时间", stat.birthtime?.toISOString() ?? "未知"],
      ["修改时间", stat.mtime?.toISOString() ?? "未知"],
    ];

    for (const [key, value] of info) {
      console.log(`  ${cyan(key?.padEnd(12) ?? "")}: ${value}`);
    }

    if (stat.isDirectory) {
      let fileCount = 0;
      let dirCount = 0;
      let totalSize = 0;

      for await (const entry of Deno.readDir(path)) {
        if (entry.isFile) {
          fileCount++;
          try {
            const entryStat = await Deno.stat(`${path}/${entry.name}`);
            totalSize += entryStat.size;
          } catch {
            // 忽略权限错误
          }
        } else if (entry.isDirectory) {
          dirCount++;
        }
      }

      separator();
      console.log(`  ${cyan("文件数量")}: ${fileCount}`);
      console.log(`  ${cyan("目录数量")}: ${dirCount}`);
      console.log(`  ${cyan("总大小")}: ${formatFileSize(totalSize)}`);
    }
  } catch (error) {
    console.error(red(`错误: ${error}`));
    Deno.exit(1);
  }
}

// ============================================================================
// 程序入口
// ============================================================================

/**
 * 主函数
 *
 * TypeScript 优势：
 * - 类型断言确保参数类型安全
 * - 错误类型捕获提供精确的错误处理
 */
async function main(): Promise<void> {
  const parser = createSearchCLI();

  try {
    const args = parser.parseArgs();

    // 设置日志级别
    if (args.options["verbose"]) {
      // 详细模式在实际使用中需要设置 Logger 的级别
    }

    // 执行命令
    if (args.command) {
      const commands: Record<string, (args: ParsedArgs) => Promise<void>> = {
        search: handleSearch,
        stats: handleStats,
      };

      const handler = commands[args.command];
      if (handler) {
        await handler(args);
      }
    } else {
      // 默认执行搜索
      await handleSearch(args);
    }
  } catch (error) {
    if (error instanceof ParseError) {
      console.error(red(`\n参数错误: ${error.message}`));
      if (error.arg) {
        console.error(dim(`  参数: ${error.arg}`));
      }
      console.error(dim("\n使用 --help 查看帮助信息"));
    } else if (error instanceof Error) {
      console.error(red(`\n错误: ${error.message}`));
    } else {
      console.error(red(`\n未知错误: ${error}`));
    }
    Deno.exit(1);
  }
}

// 运行主程序
if (import.meta.main) {
  await main();
}

// ============================================================================
// 导出（供测试使用）
// ============================================================================

export { FileSearchEngine, createSearchCLI, formatResultsAsTable, formatMatchDetails };
export type { SearchResult, SearchConfig, SearchStats };
