/**
 * TypeScript 日志模块示例
 * 本文件演示了模块的各种导出方式，包括默认导出和命名导出
 * 运行环境：Deno
 */

// ==================== 枚举导出 ====================

/**
 * 日志级别枚举
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}

/**
 * 日志输出格式枚举
 */
export enum LogFormat {
    SIMPLE = "simple",
    DETAILED = "detailed",
    JSON = "json"
}

// ==================== 接口导出 ====================

/**
 * 日志配置接口
 */
export interface LoggerConfig {
    level: LogLevel;
    format: LogFormat;
    output: "console" | "file" | "both";
    filePath?: string;
    timestamp: boolean;
    colors: boolean;
    maxFileSize?: number;
    maxFiles?: number;
}

/**
 * 日志条目接口
 */
export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
    data?: any;
    source?: string;
    correlationId?: string;
}

/**
 * 日志传输接口
 */
export interface LogTransport {
    log(entry: LogEntry): void;
    close(): void;
}

// ==================== 类型导出 ====================

/**
 * 日志处理器类型
 */
export type LogHandler = (entry: LogEntry) => void;

/**
 * 日志过滤器类型
 */
export type LogFilter = (entry: LogEntry) => boolean;

/**
 * 日志格式化器类型
 */
export type LogFormatter = (entry: LogEntry) => string;

// ==================== 常量导出 ====================

/**
 * 默认日志配置
 */
export const DEFAULT_CONFIG: LoggerConfig = {
    level: LogLevel.INFO,
    format: LogFormat.SIMPLE,
    output: "console",
    timestamp: true,
    colors: true
};

/**
 * 日志颜色映射
 */
export const LOG_COLORS: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: "\x1b[36m",  // 青色
    [LogLevel.INFO]: "\x1b[32m",   // 绿色
    [LogLevel.WARN]: "\x1b[33m",   // 黄色
    [LogLevel.ERROR]: "\x1b[31m",  // 红色
    [LogLevel.FATAL]: "\x1b[35m"   // 紫色
};

/**
 * 重置颜色
 */
export const RESET_COLOR = "\x1b[0m";

// ==================== 工具函数导出 ====================

/**
 * 获取日志级别名称
 * @param level - 日志级别
 * @returns 级别名称
 */
export function getLogLevelName(level: LogLevel): string {
    return LogLevel[level];
}

/**
 * 检查日志级别是否应该被记录
 * @param currentLevel - 当前日志级别
 * @param configLevel - 配置的日志级别
 * @returns 是否应该记录
 */
export function shouldLog(currentLevel: LogLevel, configLevel: LogLevel): boolean {
    return currentLevel >= configLevel;
}

/**
 * 格式化时间戳
 * @param date - 日期对象
 * @returns 格式化的时间字符串
 */
export function formatTimestamp(date: Date): string {
    return date.toISOString();
}

/**
 * 格式化日志消息
 * @param entry - 日志条目
 * @param format - 日志格式
 * @param colors - 是否使用颜色
 * @returns 格式化后的日志字符串
 */
export function formatLogEntry(
    entry: LogEntry,
    format: LogFormat = LogFormat.SIMPLE,
    colors: boolean = false
): string {
    const timestamp = formatTimestamp(entry.timestamp);
    const levelName = getLogLevelName(entry.level);
    
    let message = "";
    
    switch (format) {
        case LogFormat.SIMPLE:
            message = `[${levelName}] ${entry.message}`;
            break;
            
        case LogFormat.DETAILED:
            message = `[${timestamp}] [${levelName}] ${entry.message}`;
            if (entry.source) {
                message += ` (${entry.source})`;
            }
            if (entry.data) {
                message += ` ${JSON.stringify(entry.data)}`;
            }
            break;
            
        case LogFormat.JSON:
            const logObject: Record<string, any> = {
                timestamp,
                level: levelName,
                message: entry.message
            };
            
            if (entry.data) {
                logObject.data = entry.data;
            }
            
            if (entry.source) {
                logObject.source = entry.source;
            }
            
            if (entry.correlationId) {
                logObject.correlationId = entry.correlationId;
            }
            
            message = JSON.stringify(logObject);
            break;
    }
    
    if (colors && format !== LogFormat.JSON) {
        const color = LOG_COLORS[entry.level] || "";
        message = `${color}${message}${RESET_COLOR}`;
    }
    
    return message;
}

// ==================== 控制台传输类 ====================

/**
 * 控制台日志传输
 */
export class ConsoleTransport implements LogTransport {
    private config: LoggerConfig;
    
    constructor(config: Partial<LoggerConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    
    /**
     * 输出日志到控制台
     * @param entry - 日志条目
     */
    log(entry: LogEntry): void {
        if (!shouldLog(entry.level, this.config.level)) {
            return;
        }
        
        const message = formatLogEntry(
            entry,
            this.config.format,
            this.config.colors
        );
        
        switch (entry.level) {
            case LogLevel.DEBUG:
            case LogLevel.INFO:
                console.log(message);
                break;
            case LogLevel.WARN:
                console.warn(message);
                break;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(message);
                break;
        }
    }
    
    /**
     * 关闭传输
     */
    close(): void {
        // 控制台传输不需要关闭
    }
}

// ==================== 内存传输类 ====================

/**
 * 内存日志传输（用于测试）
 */
export class MemoryTransport implements LogTransport {
    private entries: LogEntry[] = [];
    private config: LoggerConfig;
    
    constructor(config: Partial<LoggerConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    
    /**
     * 将日志存储到内存
     * @param entry - 日志条目
     */
    log(entry: LogEntry): void {
        if (!shouldLog(entry.level, this.config.level)) {
            return;
        }
        
        this.entries.push({ ...entry });
    }
    
    /**
     * 关闭传输
     */
    close(): void {
        this.entries = [];
    }
    
    /**
     * 获取所有日志条目
     * @returns 日志条目数组
     */
    getEntries(): LogEntry[] {
        return [...this.entries];
    }
    
    /**
     * 获取指定级别的日志条目
     * @param level - 日志级别
     * @returns 日志条目数组
     */
    getEntriesByLevel(level: LogLevel): LogEntry[] {
        return this.entries.filter(entry => entry.level === level);
    }
    
    /**
     * 清空日志
     */
    clear(): void {
        this.entries = [];
    }
    
    /**
     * 获取日志数量
     * @returns 日志数量
     */
    count(): number {
        return this.entries.length;
    }
}

// ==================== 默认导出 - Logger类 ====================

/**
 * 日志器类（默认导出）
 */
export default class Logger {
    private config: LoggerConfig;
    private transports: LogTransport[] = [];
    private context: string;
    private correlationId?: string;
    
    /**
     * 构造函数
     * @param context - 日志上下文（通常是模块或类名）
     * @param config - 日志配置
     */
    constructor(context: string, config: Partial<LoggerConfig> = {}) {
        this.context = context;
        this.config = { ...DEFAULT_CONFIG, ...config };
        
        // 默认添加控制台传输
        if (this.config.output === "console" || this.config.output === "both") {
            this.addTransport(new ConsoleTransport(this.config));
        }
    }
    
    /**
     * 添加日志传输
     * @param transport - 日志传输实例
     */
    addTransport(transport: LogTransport): void {
        this.transports.push(transport);
    }
    
    /**
     * 移除日志传输
     * @param transport - 日志传输实例
     */
    removeTransport(transport: LogTransport): void {
        const index = this.transports.indexOf(transport);
        if (index !== -1) {
            this.transports.splice(index, 1);
        }
    }
    
    /**
     * 设置关联ID
     * @param id - 关联ID
     */
    setCorrelationId(id: string): void {
        this.correlationId = id;
    }
    
    /**
     * 创建子日志器
     * @param childContext - 子上下文
     * @returns 子日志器实例
     */
    child(childContext: string): Logger {
        const childLogger = new Logger(
            `${this.context}:${childContext}`,
            this.config
        );
        
        // 复制父日志器的传输
        for (const transport of this.transports) {
            childLogger.addTransport(transport);
        }
        
        // 复制关联ID
        if (this.correlationId) {
            childLogger.setCorrelationId(this.correlationId);
        }
        
        return childLogger;
    }
    
    /**
     * 记录调试日志
     * @param message - 日志消息
     * @param data - 附加数据
     */
    debug(message: string, data?: any): void {
        this.log(LogLevel.DEBUG, message, data);
    }
    
    /**
     * 记录信息日志
     * @param message - 日志消息
     * @param data - 附加数据
     */
    info(message: string, data?: any): void {
        this.log(LogLevel.INFO, message, data);
    }
    
    /**
     * 记录警告日志
     * @param message - 日志消息
     * @param data - 附加数据
     */
    warn(message: string, data?: any): void {
        this.log(LogLevel.WARN, message, data);
    }
    
    /**
     * 记录错误日志
     * @param message - 日志消息
     * @param data - 附加数据
     */
    error(message: string, data?: any): void {
        this.log(LogLevel.ERROR, message, data);
    }
    
    /**
     * 记录致命错误日志
     * @param message - 日志消息
     * @param data - 附加数据
     */
    fatal(message: string, data?: any): void {
        this.log(LogLevel.FATAL, message, data);
    }
    
    /**
     * 记录日志
     * @param level - 日志级别
     * @param message - 日志消息
     * @param data - 附加数据
     */
    private log(level: LogLevel, message: string, data?: any): void {
        const entry: LogEntry = {
            timestamp: new Date(),
            level,
            message,
            data,
            source: this.context,
            correlationId: this.correlationId
        };
        
        for (const transport of this.transports) {
            try {
                transport.log(entry);
            } catch (error) {
                console.error("Failed to log entry:", error);
            }
        }
    }
    
    /**
     * 关闭所有传输
     */
    close(): void {
        for (const transport of this.transports) {
            try {
                transport.close();
            } catch (error) {
                console.error("Failed to close transport:", error);
            }
        }
        
        this.transports = [];
    }
    
    /**
     * 获取当前配置
     * @returns 日志配置
     */
    getConfig(): LoggerConfig {
        return { ...this.config };
    }
    
    /**
     * 更新配置
     * @param config - 新配置
     */
    updateConfig(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }
}

// ==================== 命名空间导出 ====================

/**
 * 日志工具命名空间
 */
export namespace LogUtils {
    /**
     * 创建简单的日志器
     * @param name - 日志器名称
     * @returns 日志器实例
     */
    export function createSimpleLogger(name: string): Logger {
        return new Logger(name, {
            level: LogLevel.INFO,
            format: LogFormat.SIMPLE,
            timestamp: true,
            colors: true
        });
    }
    
    /**
     * 创建JSON格式的日志器
     * @param name - 日志器名称
     * @returns 日志器实例
     */
    export function createJsonLogger(name: string): Logger {
        return new Logger(name, {
            level: LogLevel.INFO,
            format: LogFormat.JSON,
            timestamp: true,
            colors: false
        });
    }
    
    /**
     * 创建详细格式的日志器
     * @param name - 日志器名称
     * @returns 日志器实例
     */
    export function createDetailedLogger(name: string): Logger {
        return new Logger(name, {
            level: LogLevel.DEBUG,
            format: LogFormat.DETAILED,
            timestamp: true,
            colors: true
        });
    }
    
    /**
     * 创建测试日志器
     * @param name - 日志器名称
     * @returns 包含内存传输的日志器
     */
    export function createTestLogger(name: string): {
        logger: Logger;
        transport: MemoryTransport;
    } {
        const transport = new MemoryTransport();
        const logger = new Logger(name, {
            level: LogLevel.DEBUG
        });
        
        logger.addTransport(transport);
        
        return { logger, transport };
    }
    
    /**
     * 批量创建日志器
     * @param names - 日志器名称数组
     * @param config - 共享配置
     * @returns 日志器映射
     */
    export function createLoggers(
        names: string[],
        config: Partial<LoggerConfig> = {}
    ): Map<string, Logger> {
        const loggers = new Map<string, Logger>();
        
        for (const name of names) {
            loggers.set(name, new Logger(name, config));
        }
        
        return loggers;
    }
}

// ==================== 重导出 ====================

// 重导出相关类型和工具
export { Logger as LoggerClass };
export { ConsoleTransport as Console };
export { MemoryTransport as Memory };

// ==================== 测试代码 ====================

// 如果直接运行此文件，则执行测试
if (import.meta.main) {
    console.log("=== Logger Module Tests ===");
    
    // 创建日志器
    const logger = new Logger("TestModule", {
        level: LogLevel.DEBUG,
        format: LogFormat.DETAILED,
        colors: true
    });
    
    // 测试不同级别的日志
    console.log("\n--- Different Log Levels ---");
    logger.debug("This is a debug message");
    logger.info("This is an info message");
    logger.warn("This is a warning message");
    logger.error("This is an error message", { code: 500 });
    logger.fatal("This is a fatal message", new Error("Critical failure"));
    
    // 测试子日志器
    console.log("\n--- Child Logger ---");
    const childLogger = logger.child("Database");
    childLogger.info("Connected to database");
    childLogger.error("Connection failed", { host: "localhost", port: 5432 });
    
    // 测试关联ID
    console.log("\n--- Correlation ID ---");
    logger.setCorrelationId("req-123");
    logger.info("Processing request");
    logger.info("Request completed");
    
    // 测试内存传输
    console.log("\n--- Memory Transport ---");
    const { logger: testLogger, transport } = LogUtils.createTestLogger("Test");
    testLogger.info("Test message 1");
    testLogger.error("Test error", { code: 404 });
    
    console.log("Memory entries:", transport.count());
    console.log("Error entries:", transport.getEntriesByLevel(LogLevel.ERROR).length);
    
    // 测试配置更新
    console.log("\n--- Config Update ---");
    const config = logger.getConfig();
    console.log("Current config:", config);
    
    logger.updateConfig({ level: LogLevel.WARN });
    console.log("Updated level to WARN");
    logger.debug("This should not appear");
    logger.warn("This should appear");
    
    // 测试日志工具
    console.log("\n--- Log Utils ---");
    const simpleLogger = LogUtils.createSimpleLogger("Simple");
    simpleLogger.info("Simple logger message");
    
    const jsonLogger = LogUtils.createJsonLogger("JSON");
    jsonLogger.info("JSON logger message", { key: "value" });
    
    // 关闭日志器
    logger.close();
    testLogger.close();
    
    console.log("\n=== All tests completed ===");
}
