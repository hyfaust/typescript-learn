/**
 * utils.ts - CLI 工具函数库
 *
 * 本文件包含 CLI 工具的通用工具函数：
 * - 终端颜色输出
 * - 表格格式化
 * - 进度条显示
 * - 交互式提示
 * - 日志记录
 *
 * TypeScript 优势：通过接口和泛型确保类型安全
 */

// ============================================================================
// 类型定义
// ============================================================================

/** ANSI 颜色码 */
interface ColorCodes {
  readonly reset: string;
  readonly bold: string;
  readonly dim: string;
  readonly red: string;
  readonly green: string;
  readonly yellow: string;
  readonly blue: string;
  readonly magenta: string;
  readonly cyan: string;
  readonly white: string;
  readonly bgRed: string;
  readonly bgGreen: string;
  readonly bgYellow: string;
  readonly bgBlue: string;
}

/** 表格列配置 */
interface TableColumn {
  readonly header: string;
  readonly key: string;
  readonly width?: number;
  readonly align?: "left" | "center" | "right";
  readonly formatter?: (value: unknown) => string;
}

/** 表格配置选项 */
interface TableOptions {
  readonly border?: boolean;
  readonly padding?: number;
  readonly maxWidth?: number;
}

/** 进度条配置 */
interface ProgressBarOptions {
  readonly width?: number;
  readonly complete?: string;
  readonly incomplete?: string;
  readonly showPercentage?: boolean;
  readonly showCount?: boolean;
}

/** 日志级别 */
type LogLevel = "debug" | "info" | "warn" | "error" | "success";

/** 日志条目 */
interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: Date;
  readonly context?: string;
}

/** 确认提示选项 */
interface ConfirmOptions {
  readonly defaultAnswer?: boolean;
  readonly yesLabel?: string;
  readonly noLabel?: string;
}

/** 选择提示选项 */
interface SelectOptions<T> {
  readonly options: readonly SelectOption<T>[];
  readonly message: string;
  readonly defaultIndex?: number;
}

/** 选择项 */
interface SelectOption<T> {
  readonly label: string;
  readonly value: T;
  readonly description?: string;
}

// ============================================================================
// 颜色工具
// ============================================================================

/** ANSI 颜色码映射 */
const COLORS: ColorCodes = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

/**
 * 给文本添加颜色
 *
 * TypeScript 优势：使用联合类型约束颜色参数
 */
export function colorize(text: string, color: keyof ColorCodes): string {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

/** 便捷颜色函数 */
export const red = (text: string): string => colorize(text, "red");
export const green = (text: string): string => colorize(text, "green");
export const yellow = (text: string): string => colorize(text, "yellow");
export const blue = (text: string): string => colorize(text, "blue");
export const cyan = (text: string): string => colorize(text, "cyan");
export const bold = (text: string): string => colorize(text, "bold");
export const dim = (text: string): string => colorize(text, "dim");

// ============================================================================
// 日志工具
// ============================================================================

/** 日志级别颜色映射 */
const LOG_LEVEL_CONFIG: Record<LogLevel, { color: keyof ColorCodes; icon: string }> = {
  debug: { color: "dim", icon: "🔍" },
  info: { color: "cyan", icon: "ℹ️ " },
  warn: { color: "yellow", icon: "⚠️ " },
  error: { color: "red", icon: "❌" },
  success: { color: "green", icon: "✅" },
};

/**
 * 格式化日志消息
 */
function formatLogMessage(entry: LogEntry): string {
  const config = LOG_LEVEL_CONFIG[entry.level];
  const time = entry.timestamp.toISOString().slice(11, 23);
  const context = entry.context ? ` [${entry.context}]` : "";
  const icon = config.icon;
  const level = colorize(entry.level.toUpperCase().padEnd(7), config.color);
  return `${dim(time)} ${level}${context} ${icon} ${entry.message}`;
}

/**
 * Logger 类 - 结构化日志记录
 *
 * TypeScript 优势：使用类和访问修饰符封装日志逻辑
 */
export class Logger {
  private entries: LogEntry[] = [];
  private minLevel: LogLevel;
  private context: string;

  /** 日志级别优先级 */
  private static readonly LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    success: 1,
  };

  constructor(context: string = "CLI", minLevel: LogLevel = "info") {
    this.context = context;
    this.minLevel = minLevel;
  }

  /**
   * 检查日志级别是否应该输出
   */
  private shouldLog(level: LogLevel): boolean {
    return Logger.LEVEL_PRIORITY[level] >= Logger.LEVEL_PRIORITY[this.minLevel];
  }

  /**
   * 记录日志
   */
  private log(level: LogLevel, message: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: this.context,
    };
    this.entries.push(entry);
    console.log(formatLogMessage(entry));
  }

  /** 调试信息 */
  debug(message: string): void {
    this.log("debug", message);
  }

  /** 普通信息 */
  info(message: string): void {
    this.log("info", message);
  }

  /** 警告 */
  warn(message: string): void {
    this.log("warn", message);
  }

  /** 错误 */
  error(message: string): void {
    this.log("error", message);
  }

  /** 成功 */
  success(message: string): void {
    this.log("success", message);
  }

  /** 获取所有日志条目 */
  getEntries(): readonly LogEntry[] {
    return [...this.entries];
  }

  /** 清除日志 */
  clear(): void {
    this.entries = [];
  }

  /** 设置最小日志级别 */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

// ============================================================================
// 表格工具
// ============================================================================

/**
 * 获取字符串的显示宽度（处理中文字符）
 */
function getStringWidth(str: string): number {
  let width = 0;
  for (const char of str) {
    // CJK 字符占 2 个宽度
    width += char.charCodeAt(0) > 0x7f ? 2 : 1;
  }
  return width;
}

/**
 * 截断字符串到指定宽度
 */
function truncateToWidth(str: string, maxWidth: number): string {
  let width = 0;
  let result = "";
  for (const char of str) {
    const charWidth = char.charCodeAt(0) > 0x7f ? 2 : 1;
    if (width + charWidth > maxWidth - 2) {
      result += "..";
      break;
    }
    result += char;
    width += charWidth;
  }
  return result;
}

/**
 * 填充字符串到指定宽度
 */
function padString(str: string, width: number, align: "left" | "center" | "right" = "left"): string {
  const currentWidth = getStringWidth(str);
  const padding = Math.max(0, width - currentWidth);

  switch (align) {
    case "right":
      return " ".repeat(padding) + str;
    case "center": {
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return " ".repeat(leftPad) + str + " ".repeat(rightPad);
    }
    default:
      return str + " ".repeat(padding);
  }
}

/**
 * 格式化表格输出
 *
 * TypeScript 优势：使用泛型确保数据和列配置的类型一致性
 */
export function formatTable<T extends Record<string, unknown>>(
  data: readonly T[],
  columns: readonly TableColumn[],
  options: TableOptions = {},
): string {
  const { border = true, padding = 1 } = options;
  const pad = " ".repeat(padding);

  // 计算列宽
  const columnWidths = columns.map((col) => {
    const headerWidth = getStringWidth(col.header);
    const dataWidths = data.map((row) => {
      const value = col.formatter ? col.formatter(row[col.key]) : String(row[col.key] ?? "");
      return getStringWidth(value);
    });
    return Math.max(headerWidth, ...dataWidths, col.width ?? 0);
  });

  const separator = border
    ? "+" + columnWidths.map((w) => "-".repeat(w + padding * 2)).join("+") + "+"
    : "";

  const lines: string[] = [];

  // 表头
  if (border) lines.push(separator);
  const headerLine = columns
    .map((col, i) => padString(col.header, columnWidths[i], "center"))
    .join(`${pad}${border ? "|" : " "}${pad}`);
  lines.push(border ? `|${pad}${headerLine}${pad}|` : headerLine);
  if (border) lines.push(separator);

  // 数据行
  for (const row of data) {
    const cells = columns.map((col, i) => {
      const value = col.formatter ? col.formatter(row[col.key]) : String(row[col.key] ?? "");
      return padString(value, columnWidths[i], col.align ?? "left");
    });
    const line = cells.join(`${pad}${border ? "|" : " "}${pad}`);
    lines.push(border ? `|${pad}${line}${pad}|` : line);
  }

  if (border) lines.push(separator);

  return lines.join("\n");
}

// ============================================================================
// 进度条
// ============================================================================

/**
 * 格式化进度条
 *
 * TypeScript 优势：精确的参数类型约束
 */
export function formatProgress(
  current: number,
  total: number,
  options: ProgressBarOptions = {},
): string {
  const {
    width = 30,
    complete = "█",
    incomplete = "░",
    showPercentage = true,
    showCount = true,
  } = options;

  const percentage = Math.min(1, Math.max(0, current / total));
  const filled = Math.round(width * percentage);
  const empty = width - filled;

  const bar = complete.repeat(filled) + incomplete.repeat(empty);

  const parts: string[] = [`[${bar}]`];
  if (showPercentage) parts.push(`${(percentage * 100).toFixed(1)}%`);
  if (showCount) parts.push(`(${current}/${total})`);

  return parts.join(" ");
}

/**
 * 创建进度条显示器
 */
export class ProgressBar {
  private current = 0;
  private total: number;
  private options: ProgressBarOptions;
  private lastLine = "";

  constructor(total: number, options: ProgressBarOptions = {}) {
    this.total = total;
    this.options = options;
  }

  /**
   * 更新进度
   */
  update(current: number): void {
    this.current = Math.min(current, this.total);
    const line = formatProgress(this.current, this.total, this.options);

    // 清除上一行并输出新进度
    if (this.lastLine) {
      Deno.stdout.writeSync(new TextEncoder().encode("\r" + " ".repeat(this.lastLine.length)));
    }
    Deno.stdout.writeSync(new TextEncoder().encode("\r" + line));
    this.lastLine = line;
  }

  /**
   * 增加进度
   */
  increment(amount = 1): void {
    this.update(this.current + amount);
  }

  /**
   * 完成进度条
   */
  finish(message?: string): void {
    this.update(this.total);
    Deno.stdout.writeSync(new TextEncoder().encode("\n"));
    if (message) {
      console.log(green(`✓ ${message}`));
    }
  }
}

// ============================================================================
// 交互工具
// ============================================================================

/**
 * 读取用户输入
 */
export async function prompt(message: string, defaultValue?: string): Promise<string> {
  const suffix = defaultValue ? ` (${dim(defaultValue)})` : "";
  Deno.stdout.writeSync(new TextEncoder().encode(`${cyan("?")} ${message}${suffix}: `));

  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  if (n === null) return defaultValue ?? "";

  const input = new TextDecoder().decode(buf.subarray(0, n)).trim();
  return input || defaultValue || "";
}

/**
 * 确认提示
 */
export async function confirm(message: string, options: ConfirmOptions = {}): Promise<boolean> {
  const { defaultAnswer = true, yesLabel = "Y/n", noLabel = "y/N" } = options;
  const suffix = defaultAnswer ? yesLabel : noLabel;

  Deno.stdout.writeSync(
    new TextEncoder().encode(`${cyan("?")} ${message} (${suffix}): `),
  );

  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  if (n === null) return defaultAnswer;

  const input = new TextDecoder().decode(buf.subarray(0, n)).trim().toLowerCase();
  if (!input) return defaultAnswer;

  return input === "y" || input === "yes";
}

/**
 * 选择列表
 *
 * TypeScript 优势：泛型确保返回类型与选项值类型一致
 */
export async function select<T>(options: SelectOptions<T>): Promise<T> {
  console.log(`${cyan("?")} ${options.message}`);

  options.options.forEach((opt, index) => {
    const indicator = index === (options.defaultIndex ?? 0) ? green("❯") : " ";
    const label = index === (options.defaultIndex ?? 0) ? bold(opt.label) : opt.label;
    console.log(`  ${indicator} ${label}`);
    if (opt.description) {
      console.log(`    ${dim(opt.description)}`);
    }
  });

  Deno.stdout.writeSync(new TextEncoder().encode(`  Enter number (1-${options.options.length}): `));

  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  if (n === null) return options.options[options.defaultIndex ?? 0].value;

  const input = new TextDecoder().decode(buf.subarray(0, n)).trim();
  const index = parseInt(input, 10) - 1;

  if (isNaN(index) || index < 0 || index >= options.options.length) {
    return options.options[options.defaultIndex ?? 0].value;
  }

  return options.options[index].value;
}

// ============================================================================
// 输出格式化
// ============================================================================

/**
 * 输出分隔线
 */
export function separator(char = "─", length = 60): void {
  console.log(dim(char.repeat(length)));
}

/**
 * 输出标题
 */
export function title(text: string): void {
  console.log();
  console.log(bold(cyan("┌" + "─".repeat(text.length + 2) + "┐")));
  console.log(bold(cyan("│ ")) + bold(text) + bold(cyan(" │")));
  console.log(bold(cyan("└" + "─".repeat(text.length + 2) + "┘")));
  console.log();
}

/**
 * 输出信息框
 */
export function infoBox(titleText: string, items: readonly string[]): void {
  const maxWidth = Math.max(titleText.length, ...items.map(getStringWidth)) + 4;
  const border = "─".repeat(maxWidth);

  console.log(cyan(`┌${border}┐`));
  console.log(cyan("│ ") + bold(titleText) + " ".repeat(maxWidth - titleText.length - 2) + cyan("│"));
  console.log(cyan(`├${border}┤`));
  for (const item of items) {
    const padding = maxWidth - getStringWidth(item) - 2;
    console.log(cyan("│ ") + item + " ".repeat(Math.max(0, padding)) + cyan("│"));
  }
  console.log(cyan(`└${border}┘`));
}

/**
 * 格式化文件大小
 *
 * TypeScript 优势：函数重载签名
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * 格式化持续时间
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`;
  return `${Math.floor(ms / 3_600_000)}h ${Math.floor((ms % 3_600_000) / 60_000)}m`;
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 19);
}

// ============================================================================
// 导出所有工具
// ============================================================================

export type {
  TableColumn,
  TableOptions,
  ProgressBarOptions,
  LogLevel,
  ConfirmOptions,
  SelectOptions,
  SelectOption,
  ColorCodes,
};
