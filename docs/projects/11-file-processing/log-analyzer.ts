/**
 * log-analyzer.ts - 日志分析工具
 *
 * 实战项目：构建一个功能完整的日志分析工具
 * 支持：
 * - 多种日志格式解析（Apache、Nginx、自定义格式）
 * - 统计分析（请求数、错误率、响应时间）
 * - 时间范围过滤
 * - 关键词搜索
 * - 报告生成
 *
 * TypeScript 优势：
 * - 接口定义日志结构
 * - 枚举类型定义日志级别
 * - 泛型支持多种日志格式
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 日志级别 */
enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL",
}

/** 日志级别优先级 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.FATAL]: 4,
};

/** 基础日志条目 */
interface BaseLogEntry {
  readonly timestamp: Date;
  readonly level: LogLevel;
  readonly message: string;
}

/** Apache/Nginx 访问日志 */
interface AccessLogEntry extends BaseLogEntry {
  readonly ip: string;
  readonly method: string;
  readonly path: string;
  readonly protocol: string;
  readonly statusCode: number;
  readonly bytes: number;
  readonly referer: string;
  readonly userAgent: string;
  readonly responseTime?: number;
}

/** 应用日志 */
interface AppLogEntry extends BaseLogEntry {
  readonly source: string;
  readonly thread?: string;
  readonly context?: Record<string, unknown>;
  readonly stackTrace?: string;
}

/** 日志条目联合类型 */
type LogEntry = AccessLogEntry | AppLogEntry;

/** 日志格式类型 */
type LogFormat = "apache" | "nginx" | "json" | "syslog" | "custom";

/** 日志解析配置 */
interface LogParseConfig {
  readonly format: LogFormat;
  readonly customPattern?: RegExp;
  readonly timestampFormat?: string;
  readonly fieldMapping?: Record<string, string>;
}

/** 时间范围 */
interface TimeRange {
  readonly start: Date;
  readonly end: Date;
}

/** 分析过滤条件 */
interface AnalysisFilter {
  readonly timeRange?: TimeRange;
  readonly levels?: readonly LogLevel[];
  readonly keywords?: readonly string[];
  readonly pattern?: RegExp;
  readonly ipFilter?: string;
  readonly statusCodeRange?: { min: number; max: number };
}

/** 统计结果 */
interface LogStatistics {
  readonly totalEntries: number;
  readonly entriesByLevel: Record<LogLevel, number>;
  readonly timeRange: TimeRange;
  readonly averageResponseTime?: number;
  readonly errorRate: number;
  readonly topIPs: readonly { ip: string; count: number }[];
  readonly topPaths: readonly { path: string; count: number }[];
  readonly topStatusCodes: readonly { code: number; count: number }[];
  readonly requestsPerMinute: number;
  readonly bytesTransferred: number;
}

/** 时间序列数据 */
interface TimeSeriesPoint {
  readonly timestamp: Date;
  readonly value: number;
}

/** 分析报告 */
interface AnalysisReport {
  readonly title: string;
  readonly generatedAt: Date;
  readonly statistics: LogStatistics;
  readonly timeSeries: {
    readonly requests: readonly TimeSeriesPoint[];
    readonly errors: readonly TimeSeriesPoint[];
    readonly responseTimes: readonly TimeSeriesPoint[];
  };
  readonly anomalies: readonly string[];
  readonly recommendations: readonly string[];
}

// ============================================================================
// 日志解析器
// ============================================================================

/**
 * Apache 访问日志正则表达式
 *
 * 格式: 127.0.0.1 - - [10/Oct/2000:13:55:36 -0700] "GET /index.html HTTP/1.0" 200 2326
 */
const APACHE_LOG_PATTERN =
  /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d{3}) (\d+|-)( "([^"]*)" "([^"]*)")?/;

/**
 * Nginx 访问日志正则表达式
 */
const NGINX_LOG_PATTERN =
  /^(\S+) - \S+ \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d{3}) (\d+|-) "([^"]*)" "([^"]*)" "([^"]*)"/;

/**
 * Syslog 正则表达式
 */
const SYSLOG_PATTERN =
  /^(\w{3}\s+\d+\s+\d+:\d+:\d+)\s+(\S+)\s+(\S+?)(\[\d+\])?:\s+(.*)/;

/**
 * 日志解析器类
 *
 * TypeScript 优势：
 * - 使用泛型方法支持多种日志格式
 * - 类型守卫区分不同日志类型
 * - 枚举类型约束日志级别
 */
class LogParser {
  private config: LogParseConfig;
  private stats = { parsed: 0, errors: 0 };

  constructor(config: LogParseConfig) {
    this.config = config;
  }

  /**
   * 解析时间戳字符串
   */
  private parseTimestamp(timestampStr: string): Date {
    // 处理 Apache/Nginx 格式: 10/Oct/2000:13:55:36 -0700
    const apacheMatch = timestampStr.match(
      /(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2}) ([+-]\d{4})/,
    );

    if (apacheMatch) {
      const months: Record<string, number> = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
      };

      const [, day, month, year, hour, minute, second, timezone] = apacheMatch;
      const tzHours = parseInt(timezone!.slice(1, 3));
      const tzMinutes = parseInt(timezone!.slice(3, 5));
      const tzOffset = (tzHours * 60 + tzMinutes) * (timezone!.startsWith("-") ? -1 : 1);

      const date = new Date(
        parseInt(year!),
        months[month!]!,
        parseInt(day!),
        parseInt(hour!),
        parseInt(minute!),
        parseInt(second!),
      );

      // 应用时区偏移
      date.setMinutes(date.getMinutes() - tzOffset - date.getTimezoneOffset());
      return date;
    }

    // 处理 ISO 格式
    return new Date(timestampStr);
  }

  /**
   * 解析 Apache/Nginx 日志行
   */
  private parseAccessLog(line: string): AccessLogEntry | null {
    const pattern = this.config.format === "nginx" ? NGINX_LOG_PATTERN : APACHE_LOG_PATTERN;
    const match = line.match(pattern);

    if (!match) return null;

    const [, ip, timestamp, method, path, protocol, statusCode, bytes, , referer, userAgent] =
      match;

    return {
      timestamp: this.parseTimestamp(timestamp!),
      level: parseInt(statusCode!) >= 400 ? LogLevel.ERROR : LogLevel.INFO,
      message: `${method} ${path} ${statusCode}`,
      ip: ip!,
      method: method!,
      path: path!,
      protocol: protocol!,
      statusCode: parseInt(statusCode!),
      bytes: bytes === "-" ? 0 : parseInt(bytes!),
      referer: referer ?? "-",
      userAgent: userAgent ?? "-",
    };
  }

  /**
   * 解析 JSON 格式日志
   */
  private parseJsonLog(line: string): LogEntry | null {
    try {
      const data = JSON.parse(line);

      const level = this.parseLogLevel(data.level ?? data.severity ?? "INFO");

      if (data.method && data.path) {
        // 访问日志
        return {
          timestamp: new Date(data.timestamp ?? data.time ?? data.date),
          level,
          message: data.message ?? `${data.method} ${data.path}`,
          ip: data.ip ?? data.remote_addr ?? "unknown",
          method: data.method,
          path: data.path,
          protocol: data.protocol ?? "HTTP/1.1",
          statusCode: data.status ?? data.status_code ?? 200,
          bytes: data.bytes ?? data.body_bytes_sent ?? 0,
          referer: data.referer ?? "-",
          userAgent: data.user_agent ?? "-",
          responseTime: data.response_time ?? data.request_time,
        };
      }

      // 应用日志
      return {
        timestamp: new Date(data.timestamp ?? data.time ?? data.date),
        level,
        message: data.message ?? data.msg ?? "",
        source: data.source ?? data.logger ?? data.module ?? "unknown",
        thread: data.thread ?? data.thread_name,
        context: data.context ?? data.data,
        stackTrace: data.stack_trace ?? data.stack,
      };
    } catch {
      return null;
    }
  }

  /**
   * 解析日志级别
   */
  private parseLogLevel(levelStr: string): LogLevel {
    const upper = levelStr.toUpperCase();
    switch (upper) {
      case "DEBUG":
      case "DBG":
        return LogLevel.DEBUG;
      case "INFO":
      case "INF":
        return LogLevel.INFO;
      case "WARN":
      case "WARNING":
      case "WRN":
        return LogLevel.WARN;
      case "ERROR":
      case "ERR":
        return LogLevel.ERROR;
      case "FATAL":
      case "CRIT":
      case "CRITICAL":
        return LogLevel.FATAL;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * 解析单行日志
   */
  parseLine(line: string): LogEntry | null {
    const trimmed = line.trim();
    if (trimmed.length === 0) return null;

    try {
      let entry: LogEntry | null = null;

      switch (this.config.format) {
        case "apache":
        case "nginx":
          entry = this.parseAccessLog(trimmed);
          break;
        case "json":
          entry = this.parseJsonLog(trimmed);
          break;
        case "syslog":
          // Syslog 解析可以扩展
          entry = this.parseJsonLog(trimmed);
          break;
        case "custom":
          if (this.config.customPattern) {
            const match = trimmed.match(this.config.customPattern);
            if (match) {
              entry = {
                timestamp: new Date(match[1] ?? Date.now()),
                level: this.parseLogLevel(match[2] ?? "INFO"),
                message: match[3] ?? trimmed,
                source: "custom",
              };
            }
          }
          break;
      }

      if (entry) {
        this.stats.parsed++;
      } else {
        this.stats.errors++;
      }

      return entry;
    } catch {
      this.stats.errors++;
      return null;
    }
  }

  /**
   * 获取解析统计
   */
  getStats(): { parsed: number; errors: number } {
    return { ...this.stats };
  }
}

// ============================================================================
// 日志分析器
// ============================================================================

/**
 * 日志分析器类
 *
 * TypeScript 优势：
 * - 使用 readonly 数组确保数据不可变
 * - 类型守卫区分不同日志类型
 */
class LogAnalyzer {
  private entries: LogEntry[] = [];
  private parser: LogParser;

  constructor(config: LogParseConfig) {
    this.parser = new LogParser(config);
  }

  /**
   * 添加日志条目
   */
  addEntry(entry: LogEntry): void {
    this.entries.push(entry);
  }

  /**
   * 从文件加载日志
   */
  async loadFromFile(filePath: string): Promise<void> {
    const content = await Deno.readTextFile(filePath);
    const lines = content.split("\n");

    for (const line of lines) {
      const entry = this.parser.parseLine(line);
      if (entry) {
        this.entries.push(entry);
      }
    }
  }

  /**
   * 过滤日志条目
   *
   * TypeScript 优势：使用类型守卫确保过滤后的类型安全
   */
  filter(predicate: (entry: LogEntry) => boolean): LogEntry[] {
    return this.entries.filter(predicate);
  }

  /**
   * 应用过滤条件
   */
  applyFilter(filter: AnalysisFilter): LogEntry[] {
    return this.entries.filter((entry) => {
      // 时间范围过滤
      if (filter.timeRange) {
        if (entry.timestamp < filter.timeRange.start || entry.timestamp > filter.timeRange.end) {
          return false;
        }
      }

      // 日志级别过滤
      if (filter.levels && filter.levels.length > 0) {
        if (!filter.levels.includes(entry.level)) {
          return false;
        }
      }

      // 关键词过滤
      if (filter.keywords && filter.keywords.length > 0) {
        const message = entry.message.toLowerCase();
        if (!filter.keywords.some((kw) => message.includes(kw.toLowerCase()))) {
          return false;
        }
      }

      // 正则表达式过滤
      if (filter.pattern) {
        if (!filter.pattern.test(entry.message)) {
          return false;
        }
      }

      // IP 过滤
      if (filter.ipFilter && this.isAccessLog(entry)) {
        if (entry.ip !== filter.ipFilter) {
          return false;
        }
      }

      // 状态码范围过滤
      if (filter.statusCodeRange && this.isAccessLog(entry)) {
        if (
          entry.statusCode < filter.statusCodeRange.min ||
          entry.statusCode > filter.statusCodeRange.max
        ) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * 类型守卫：检查是否为访问日志
   */
  private isAccessLog(entry: LogEntry): entry is AccessLogEntry {
    return "ip" in entry && "method" in entry && "statusCode" in entry;
  }

  /**
   * 计算统计信息
   */
  calculateStatistics(filter?: AnalysisFilter): LogStatistics {
    const entries = filter ? this.applyFilter(filter) : this.entries;

    if (entries.length === 0) {
      throw new Error("没有日志条目可供分析");
    }

    // 按级别统计
    const entriesByLevel: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.FATAL]: 0,
    };

    let errorCount = 0;
    let totalBytes = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    const ipCounts = new Map<string, number>();
    const pathCounts = new Map<string, number>();
    const statusCodeCounts = new Map<number, number>();

    for (const entry of entries) {
      entriesByLevel[entry.level]++;

      if (entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL) {
        errorCount++;
      }

      if (this.isAccessLog(entry)) {
        totalBytes += entry.bytes;

        const ipCount = ipCounts.get(entry.ip) ?? 0;
        ipCounts.set(entry.ip, ipCount + 1);

        const pathCount = pathCounts.get(entry.path) ?? 0;
        pathCounts.set(entry.path, pathCount + 1);

        const codeCount = statusCodeCounts.get(entry.statusCode) ?? 0;
        statusCodeCounts.set(entry.statusCode, codeCount + 1);

        if (entry.responseTime !== undefined) {
          totalResponseTime += entry.responseTime;
          responseTimeCount++;
        }
      }
    }

    // 计算时间范围
    const timestamps = entries.map((e) => e.timestamp.getTime());
    const timeRange: TimeRange = {
      start: new Date(Math.min(...timestamps)),
      end: new Date(Math.max(...timestamps)),
    };

    // 计算每分钟请求数
    const durationMinutes = (timeRange.end.getTime() - timeRange.start.getTime()) / 60000;
    const requestsPerMinute = durationMinutes > 0 ? entries.length / durationMinutes : 0;

    // 排序获取 Top N
    const topIPs = [...ipCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    const topPaths = [...pathCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    const topStatusCodes = [...statusCodeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([code, count]) => ({ code, count }));

    return {
      totalEntries: entries.length,
      entriesByLevel,
      timeRange,
      averageResponseTime: responseTimeCount > 0 ? totalResponseTime / responseTimeCount : undefined,
      errorRate: entries.length > 0 ? (errorCount / entries.length) * 100 : 0,
      topIPs,
      topPaths,
      topStatusCodes,
      requestsPerMinute,
      bytesTransferred: totalBytes,
    };
  }

  /**
   * 生成时间序列数据
   */
  generateTimeSeries(
    interval: "minute" | "hour" | "day" = "hour",
    filter?: AnalysisFilter,
  ): {
    requests: TimeSeriesPoint[];
    errors: TimeSeriesPoint[];
    responseTimes: TimeSeriesPoint[];
  } {
    const entries = filter ? this.applyFilter(filter) : this.entries;

    // 按时间分组
    const groups = new Map<number, LogEntry[]>();

    for (const entry of entries) {
      let key: number;
      const time = entry.timestamp.getTime();

      switch (interval) {
        case "minute":
          key = Math.floor(time / 60000) * 60000;
          break;
        case "hour":
          key = Math.floor(time / 3600000) * 3600000;
          break;
        case "day":
          key = Math.floor(time / 86400000) * 86400000;
          break;
      }

      const group = groups.get(key) ?? [];
      group.push(entry);
      groups.set(key, group);
    }

    // 生成时间序列
    const requests: TimeSeriesPoint[] = [];
    const errors: TimeSeriesPoint[] = [];
    const responseTimes: TimeSeriesPoint[] = [];

    for (const [timestamp, groupEntries] of groups) {
      const date = new Date(timestamp);

      requests.push({ timestamp: date, value: groupEntries.length });

      const errorCount = groupEntries.filter(
        (e) => e.level === LogLevel.ERROR || e.level === LogLevel.FATAL,
      ).length;
      errors.push({ timestamp: date, value: errorCount });

      const accessEntries = groupEntries.filter(this.isAccessLog);
      const avgResponseTime =
        accessEntries.length > 0
          ? accessEntries.reduce((sum, e) => sum + (e.responseTime ?? 0), 0) /
            accessEntries.length
          : 0;
      responseTimes.push({ timestamp: date, value: avgResponseTime });
    }

    return { requests, errors, responseTimes };
  }

  /**
   * 检测异常
   */
  detectAnomalies(): string[] {
    const anomalies: string[] = [];

    if (this.entries.length === 0) return anomalies;

    // 检测错误率异常
    const stats = this.calculateStatistics();
    if (stats.errorRate > 10) {
      anomalies.push(`错误率过高: ${stats.errorRate.toFixed(2)}%`);
    }

    // 检测响应时间异常
    if (stats.averageResponseTime !== undefined && stats.averageResponseTime > 1000) {
      anomalies.push(`平均响应时间过长: ${stats.averageResponseTime.toFixed(0)}ms`);
    }

    // 检测单个 IP 请求过多
    for (const { ip, count } of stats.topIPs) {
      if (count > this.entries.length * 0.3) {
        anomalies.push(`IP ${ip} 请求占比过高: ${count} 次 (${((count / this.entries.length) * 100).toFixed(1)}%)`);
      }
    }

    // 检测频繁的 404 错误
    const notFoundCount = stats.topStatusCodes.find((s) => s.code === 404)?.count ?? 0;
    if (notFoundCount > this.entries.length * 0.1) {
      anomalies.push(`404 错误过多: ${notFoundCount} 次`);
    }

    return anomalies;
  }

  /**
   * 生成建议
   */
  generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.calculateStatistics();
    const anomalies = this.detectAnomalies();

    if (stats.errorRate > 5) {
      recommendations.push("建议检查错误日志，排查错误原因");
    }

    if (stats.averageResponseTime !== undefined && stats.averageResponseTime > 500) {
      recommendations.push("建议优化响应时间，考虑使用缓存或优化数据库查询");
    }

    if (anomalies.some((a) => a.includes("IP") && a.includes("请求占比过高"))) {
      recommendations.push("建议检查是否有恶意请求，考虑添加限流");
    }

    if (stats.topStatusCodes.some((s) => s.code === 404 && s.count > 100)) {
      recommendations.push("建议检查是否有死链或过期的 URL");
    }

    return recommendations;
  }

  /**
   * 生成完整分析报告
   */
  generateReport(title: string, filter?: AnalysisFilter): AnalysisReport {
    const statistics = this.calculateStatistics(filter);
    const timeSeries = this.generateTimeSeries("hour", filter);
    const anomalies = this.detectAnomalies();
    const recommendations = this.generateRecommendations();

    return {
      title,
      generatedAt: new Date(),
      statistics,
      timeSeries,
      anomalies,
      recommendations,
    };
  }

  /**
   * 获取条目数量
   */
  get entryCount(): number {
    return this.entries.length;
  }

  /**
   * 获取解析器统计
   */
  getParserStats(): { parsed: number; errors: number } {
    return this.parser.getStats();
  }
}

// ============================================================================
// 报告格式化
// ============================================================================

/**
 * 格式化分析报告为文本
 */
function formatReportText(report: AnalysisReport): string {
  const lines: string[] = [];
  const separator = "=".repeat(60);
  const line = "-".repeat(60);

  lines.push(separator);
  lines.push(`  ${report.title}`);
  lines.push(`  生成时间: ${report.generatedAt.toISOString()}`);
  lines.push(separator);

  // 基本统计
  lines.push("\n📊 基本统计");
  lines.push(line);
  lines.push(`  总条目数: ${report.statistics.totalEntries}`);
  lines.push(`  错误率: ${report.statistics.errorRate.toFixed(2)}%`);
  lines.push(`  每分钟请求数: ${report.statistics.requestsPerMinute.toFixed(1)}`);
  lines.push(`  传输字节数: ${formatBytes(report.statistics.bytesTransferred)}`);

  if (report.statistics.averageResponseTime !== undefined) {
    lines.push(`  平均响应时间: ${report.statistics.averageResponseTime.toFixed(0)}ms`);
  }

  // 日志级别分布
  lines.push("\n📈 日志级别分布");
  lines.push(line);
  for (const [level, count] of Object.entries(report.statistics.entriesByLevel)) {
    const percentage = (count / report.statistics.totalEntries) * 100;
    const bar = "█".repeat(Math.round(percentage / 2));
    lines.push(`  ${level.padEnd(8)} ${bar} ${count} (${percentage.toFixed(1)}%)`);
  }

  // Top IP
  if (report.statistics.topIPs.length > 0) {
    lines.push("\n🌐 Top IP 地址");
    lines.push(line);
    for (const { ip, count } of report.statistics.topIPs.slice(0, 5)) {
      lines.push(`  ${ip.padEnd(20)} ${count} 次`);
    }
  }

  // Top 路径
  if (report.statistics.topPaths.length > 0) {
    lines.push("\n🔗 热门路径");
    lines.push(line);
    for (const { path, count } of report.statistics.topPaths.slice(0, 5)) {
      lines.push(`  ${path.padEnd(30)} ${count} 次`);
    }
  }

  // 状态码分布
  if (report.statistics.topStatusCodes.length > 0) {
    lines.push("\n📋 状态码分布");
    lines.push(line);
    for (const { code, count } of report.statistics.topStatusCodes.slice(0, 5)) {
      lines.push(`  ${code} ${code >= 400 ? "❌" : "✅"} ${count} 次`);
    }
  }

  // 异常
  if (report.anomalies.length > 0) {
    lines.push("\n⚠️  检测到的异常");
    lines.push(line);
    for (const anomaly of report.anomalies) {
      lines.push(`  • ${anomaly}`);
    }
  }

  // 建议
  if (report.recommendations.length > 0) {
    lines.push("\n💡 优化建议");
    lines.push(line);
    for (const recommendation of report.recommendations) {
      lines.push(`  • ${recommendation}`);
    }
  }

  lines.push("\n" + separator);
  return lines.join("\n");
}

/**
 * 格式化字节数
 */
function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// ============================================================================
// 示例演示
// ============================================================================

/**
 * 生成测试日志
 */
function generateTestLogs(count: number): string[] {
  const logs: string[] = [];
  const ips = ["192.168.1.1", "10.0.0.2", "172.16.0.3", "192.168.1.100", "10.0.0.50"];
  const methods = ["GET", "POST", "PUT", "DELETE"];
  const paths = ["/api/users", "/api/products", "/index.html", "/api/orders", "/health"];
  const statusCodes = [200, 200, 200, 201, 301, 400, 404, 500];
  const levels = ["INFO", "INFO", "INFO", "WARN", "ERROR"];

  for (let i = 0; i < count; i++) {
    const ip = ips[Math.floor(Math.random() * ips.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const status = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const bytes = Math.floor(Math.random() * 10000);
    const responseTime = Math.floor(Math.random() * 1000);

    const timestamp = new Date(Date.now() - Math.random() * 86400000);
    const timeStr = timestamp.toISOString().replace("T", " ").slice(0, 19);

    // Apache 格式
    const log = `${ip} - - [${timeStr}] "${method} ${path} HTTP/1.1" ${status} ${bytes}`;
    logs.push(log);
  }

  return logs;
}

/**
 * 演示日志分析
 */
async function demoLogAnalysis(): Promise<void> {
  console.log("\n=== 日志分析工具示例 ===\n");

  // 生成测试日志
  console.log("1. 生成测试日志...");
  const testLogs = generateTestLogs(1000);

  // 写入测试文件
  const testFile = "./test_access.log";
  await Deno.writeTextFile(testFile, testLogs.join("\n"));
  console.log(`   已生成 ${testLogs.length} 条日志`);

  // 创建分析器
  console.log("\n2. 加载并分析日志...");
  const analyzer = new LogAnalyzer({ format: "apache" });
  await analyzer.loadFromFile(testFile);
  console.log(`   已加载 ${analyzer.entryCount} 条日志`);

  // 生成报告
  console.log("\n3. 生成分析报告...");
  const report = analyzer.generateReport("访问日志分析报告");
  console.log(formatReportText(report));

  // 使用过滤条件
  console.log("\n4. 过滤分析（仅错误日志）...");
  const errorFilter: AnalysisFilter = {
    levels: [LogLevel.ERROR, LogLevel.FATAL],
  };

  const errorStats = analyzer.calculateStatistics(errorFilter);
  console.log(`   错误日志数: ${errorStats.totalEntries}`);
  console.log(`   错误率: ${errorStats.errorRate.toFixed(2)}%`);

  // 时间范围过滤
  console.log("\n5. 最近1小时的日志...");
  const recentFilter: AnalysisFilter = {
    timeRange: {
      start: new Date(Date.now() - 3600000),
      end: new Date(),
    },
  };

  const recentStats = analyzer.calculateStatistics(recentFilter);
  console.log(`   最近1小时日志数: ${recentStats.totalEntries}`);

  // 清理
  await Deno.remove(testFile);
  console.log("\n   已清理测试文件");
}

/**
 * 演示 JSON 日志分析
 */
async function demoJsonLogAnalysis(): Promise<void> {
  console.log("\n=== JSON 日志分析示例 ===\n");

  // 生成 JSON 格式日志
  const jsonLogs = [
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: "User login",
      ip: "192.168.1.1",
      method: "POST",
      path: "/api/login",
      status: 200,
      response_time: 45,
    }),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "ERROR",
      message: "Database connection failed",
      source: "database",
      stack_trace: "Error: Connection timeout",
    }),
  ];

  const testFile = "./test_app.log";
  await Deno.writeTextFile(testFile, jsonLogs.join("\n"));

  const analyzer = new LogAnalyzer({ format: "json" });
  await analyzer.loadFromFile(testFile);

  console.log(`已加载 ${analyzer.entryCount} 条 JSON 日志`);

  const stats = analyzer.calculateStatistics();
  console.log("\n统计信息:");
  console.log(`  总数: ${stats.totalEntries}`);
  console.log(`  INFO: ${stats.entriesByLevel[LogLevel.INFO]}`);
  console.log(`  ERROR: ${stats.entriesByLevel[LogLevel.ERROR]}`);

  await Deno.remove(testFile);
}

// ============================================================================
// 主程序
// ============================================================================

async function main(): Promise<void> {
  console.log("Deno 日志分析工具");
  console.log("=".repeat(60));

  await demoLogAnalysis();
  await demoJsonLogAnalysis();

  console.log("\n" + "=".repeat(60));
  console.log("所有示例执行完成！");
}

// 运行示例
if (import.meta.main) {
  await main();
}

// ============================================================================
// 导出
// ============================================================================

export {
  LogLevel,
  LogParser,
  LogAnalyzer,
  formatReportText,
  generateTestLogs,
};

export type {
  BaseLogEntry,
  AccessLogEntry,
  AppLogEntry,
  LogEntry,
  LogFormat,
  LogParseConfig,
  TimeRange,
  AnalysisFilter,
  LogStatistics,
  TimeSeriesPoint,
  AnalysisReport,
};
