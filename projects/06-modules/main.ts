/**
 * TypeScript 模块导入使用示例
 * 本文件演示了如何导入和使用其他模块
 * 运行环境：Deno
 */

// ==================== 命名导入 ====================

/**
 * 从math模块导入命名导出
 */
import {
    PI,
    E,
    add,
    subtract,
    multiply,
    divide,
    sqrt,
    abs,
    round,
    mean,
    median,
    mode,
    standardDeviation,
    calculateStatistics,
    addVectors2D,
    dotProduct2D,
    vectorLength2D,
    normalizeVector2D,
    distance2D,
    gcd,
    lcm,
    isPrime,
    factorial,
    fibonacci,
    clamp,
    lerp,
    mapRange,
    randomInt,
    randomFloat,
    degreesToRadians,
    radiansToDegrees,
    MathResult,
    Statistics,
    Vector2D
} from "./math.ts";

// ==================== 默认导入 ====================

/**
 * 从math模块导入默认导出
 */
import MathUtils from "./math.ts";

// ==================== 从logger模块导入 ====================

/**
 * 从logger模块导入命名导出
 */
import {
    LogLevel,
    LogFormat,
    LogUtils,
    ConsoleTransport,
    MemoryTransport,
    DEFAULT_CONFIG,
    LOG_COLORS,
    getLogLevelName,
    shouldLog,
    formatLogEntry,
    LoggerConfig,
    LogEntry,
    LogTransport,
    LogHandler,
    LogFilter,
    LogFormatter
} from "./logger.ts";

/**
 * 从logger模块导入默认导出
 */
import Logger from "./logger.ts";

// ==================== 重命名导入 ====================

/**
 * 重命名导入
 */
import {
    add as sum,
    subtract as difference,
    multiply as product,
    divide as quotient
} from "./math.ts";

// ==================== 类型导入 ====================

/**
 * 仅导入类型（TypeScript 3.8+）
 */
import type { MathResult as MathResultType } from "./math.ts";
import type { LoggerConfig as LoggerConfigType } from "./logger.ts";

// ==================== 测试函数 ====================

/**
 * 测试数学模块
 */
function testMathModule(): void {
    console.log("=== Math Module Tests ===");
    
    // 测试基本运算
    console.log("\n--- Basic Operations ---");
    console.log("add(5, 3):", add(5, 3));
    console.log("subtract(10, 4):", subtract(10, 4));
    console.log("multiply(6, 7):", multiply(6, 7));
    console.log("divide(15, 3):", divide(15, 3));
    
    // 测试高级运算
    console.log("\n--- Advanced Operations ---");
    console.log("sqrt(144):", sqrt(144));
    console.log("abs(-42):", abs(-42));
    console.log("round(3.14159, 2):", round(3.14159, 2));
    
    // 测试统计函数
    console.log("\n--- Statistics ---");
    const data = [1, 2, 3, 4, 5, 5, 6, 7, 8, 9, 10];
    console.log("Data:", data);
    console.log("Mean:", mean(data));
    console.log("Median:", median(data));
    console.log("Mode:", mode(data));
    console.log("Standard Deviation:", standardDeviation(data));
    
    // 测试完整统计
    console.log("\n--- Full Statistics ---");
    const stats = calculateStatistics(data);
    console.log("Full statistics:", stats);
    
    // 测试向量运算
    console.log("\n--- Vector Operations ---");
    const v1: Vector2D = { x: 3, y: 4 };
    const v2: Vector2D = { x: 1, y: 2 };
    console.log("v1:", v1);
    console.log("v2:", v2);
    console.log("addVectors2D(v1, v2):", addVectors2D(v1, v2));
    console.log("dotProduct2D(v1, v2):", dotProduct2D(v1, v2));
    console.log("vectorLength2D(v1):", vectorLength2D(v1));
    console.log("normalizeVector2D(v1):", normalizeVector2D(v1));
    console.log("distance2D(v1, v2):", distance2D(v1, v2));
    
    // 测试数论函数
    console.log("\n--- Number Theory ---");
    console.log("gcd(12, 8):", gcd(12, 8));
    console.log("lcm(4, 6):", lcm(4, 6));
    console.log("isPrime(17):", isPrime(17));
    console.log("factorial(5):", factorial(5));
    console.log("fibonacci(10):", fibonacci(10));
    
    // 测试工具函数
    console.log("\n--- Utility Functions ---");
    console.log("clamp(15, 0, 10):", clamp(15, 0, 10));
    console.log("lerp(0, 100, 0.5):", lerp(0, 100, 0.5));
    console.log("mapRange(5, 0, 10, 0, 100):", mapRange(5, 0, 10, 0, 100));
    console.log("randomInt(1, 10):", randomInt(1, 10));
    console.log("randomFloat(0, 1):", randomFloat(0, 1));
    
    // 测试MathUtils类
    console.log("\n--- MathUtils Class ---");
    console.log("evaluate('2 + 3 * 4'):", MathUtils.evaluate("2 + 3 * 4"));
    console.log("formatNumber(3.14159):", MathUtils.formatNumber(3.14159));
    console.log("isInteger(42):", MathUtils.isInteger(42));
    console.log("isEven(4):", MathUtils.isEven(4));
    console.log("isOdd(3):", MathUtils.isOdd(3));
}

/**
 * 测试重命名导入
 */
function testRenamedImports(): void {
    console.log("\n=== Renamed Imports Tests ===");
    
    console.log("sum(5, 3):", sum(5, 3));
    console.log("difference(10, 4):", difference(10, 4));
    console.log("product(6, 7):", product(6, 7));
    console.log("quotient(15, 3):", quotient(15, 3));
}

/**
 * 测试日志模块
 */
function testLoggerModule(): void {
    console.log("\n=== Logger Module Tests ===");
    
    // 创建日志器
    const logger = new Logger("MainModule", {
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
}

/**
 * 测试日志工具函数
 */
function testLoggerUtils(): void {
    console.log("\n=== Logger Utils Tests ===");
    
    // 测试日志级别名称
    console.log("\n--- Log Level Names ---");
    console.log("LogLevel.DEBUG:", getLogLevelName(LogLevel.DEBUG));
    console.log("LogLevel.INFO:", getLogLevelName(LogLevel.INFO));
    console.log("LogLevel.WARN:", getLogLevelName(LogLevel.WARN));
    console.log("LogLevel.ERROR:", getLogLevelName(LogLevel.ERROR));
    console.log("LogLevel.FATAL:", getLogLevelName(LogLevel.FATAL));
    
    // 测试日志级别检查
    console.log("\n--- Log Level Check ---");
    console.log("shouldLog(DEBUG, INFO):", shouldLog(LogLevel.DEBUG, LogLevel.INFO));
    console.log("shouldLog(INFO, INFO):", shouldLog(LogLevel.INFO, LogLevel.INFO));
    console.log("shouldLog(ERROR, INFO):", shouldLog(LogLevel.ERROR, LogLevel.INFO));
    
    // 测试日志格式化
    console.log("\n--- Log Formatting ---");
    const entry: LogEntry = {
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: "Test message",
        data: { key: "value" },
        source: "TestModule",
        correlationId: "req-456"
    };
    
    console.log("Simple format:", formatLogEntry(entry, LogFormat.SIMPLE, false));
    console.log("Detailed format:", formatLogEntry(entry, LogFormat.DETAILED, false));
    console.log("JSON format:", formatLogEntry(entry, LogFormat.JSON, false));
    
    // 测试默认配置
    console.log("\n--- Default Config ---");
    console.log("DEFAULT_CONFIG:", DEFAULT_CONFIG);
    
    // 测试日志颜色
    console.log("\n--- Log Colors ---");
    console.log("LOG_COLORS:", LOG_COLORS);
}

/**
 * 测试模块组合
 */
function testModuleComposition(): void {
    console.log("\n=== Module Composition Tests ===");
    
    // 创建计算器应用
    class Calculator {
        private logger: Logger;
        
        constructor() {
            this.logger = new Logger("Calculator", {
                level: LogLevel.DEBUG,
                format: LogFormat.DETAILED,
                colors: true
            });
        }
        
        /**
         * 执行计算
         * @param operation - 操作类型
         * @param a - 第一个操作数
         * @param b - 第二个操作数
         * @returns 计算结果
         */
        calculate(operation: string, a: number, b: number): MathResult {
            this.logger.info(`Calculating ${operation}`, { a, b });
            
            let result: MathResult;
            
            switch (operation) {
                case "add":
                    result = add(a, b);
                    break;
                case "subtract":
                    result = subtract(a, b);
                    break;
                case "multiply":
                    result = multiply(a, b);
                    break;
                case "divide":
                    result = divide(a, b);
                    break;
                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }
            
            this.logger.info(`Result: ${result.value}`, result);
            return result;
        }
        
        /**
         * 计算统计信息
         * @param data - 数据数组
         * @returns 统计信息
         */
        getStatistics(data: number[]): Statistics {
            this.logger.info("Calculating statistics", { dataLength: data.length });
            
            const stats = calculateStatistics(data);
            this.logger.info("Statistics calculated", stats);
            
            return stats;
        }
        
        /**
         * 关闭计算器
         */
        close(): void {
            this.logger.close();
        }
    }
    
    // 使用计算器
    const calculator = new Calculator();
    
    console.log("\n--- Calculator Operations ---");
    const result1 = calculator.calculate("add", 10, 5);
    console.log("10 + 5 =", result1.value);
    
    const result2 = calculator.calculate("multiply", 3, 7);
    console.log("3 * 7 =", result2.value);
    
    const result3 = calculator.calculate("divide", 20, 4);
    console.log("20 / 4 =", result3.value);
    
    console.log("\n--- Statistics ---");
    const data = [1, 2, 3, 4, 5, 5, 6, 7, 8, 9, 10];
    const stats = calculator.getStatistics(data);
    console.log("Data:", data);
    console.log("Mean:", stats.mean);
    console.log("Median:", stats.median);
    console.log("Mode:", stats.mode);
    console.log("Standard Deviation:", stats.standardDeviation);
    
    // 关闭计算器
    calculator.close();
}

/**
 * 测试错误处理
 */
function testErrorHandling(): void {
    console.log("\n=== Error Handling Tests ===");
    
    const logger = new Logger("ErrorTest", {
        level: LogLevel.DEBUG,
        format: LogFormat.DETAILED,
        colors: true
    });
    
    // 测试除零错误
    console.log("\n--- Division by Zero ---");
    try {
        const result = divide(10, 0);
        console.log("Result:", result.value);
    } catch (error) {
        logger.error("Division by zero error", { error: (error as Error).message });
    }
    
    // 测试负数平方根
    console.log("\n--- Negative Square Root ---");
    try {
        const result = sqrt(-16);
        console.log("Result:", result.value);
    } catch (error) {
        logger.error("Square root of negative number", { error: (error as Error).message });
    }
    
    // 测试空数组统计
    console.log("\n--- Empty Array Statistics ---");
    try {
        const stats = calculateStatistics([]);
        console.log("Stats:", stats);
    } catch (error) {
        logger.error("Empty array statistics", { error: (error as Error).message });
    }
    
    // 测试负数阶乘
    console.log("\n--- Negative Factorial ---");
    try {
        const result = factorial(-5);
        console.log("Result:", result);
    } catch (error) {
        logger.error("Negative factorial", { error: (error as Error).message });
    }
    
    logger.close();
}

/**
 * 测试性能
 */
function testPerformance(): void {
    console.log("\n=== Performance Tests ===");
    
    const logger = new Logger("PerformanceTest", {
        level: LogLevel.INFO,
        format: LogFormat.SIMPLE,
        colors: false
    });
    
    // 测试大量计算
    console.log("\n--- Large Calculation ---");
    const startTime = performance.now();
    
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
        sum += Math.sqrt(i);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    logger.info(`Calculated sum of 1,000,000 square roots`, {
        sum,
        duration: `${duration.toFixed(2)}ms`
    });
    
    // 测试大量日志
    console.log("\n--- Large Logging ---");
    const logStartTime = performance.now();
    
    for (let i = 0; i < 1000; i++) {
        logger.info(`Log message ${i}`, { index: i });
    }
    
    const logEndTime = performance.now();
    const logDuration = logEndTime - logStartTime;
    
    logger.info(`Logged 1,000 messages`, {
        duration: `${logDuration.toFixed(2)}ms`
    });
    
    logger.close();
}

/**
 * 测试模块信息
 */
function testModuleInfo(): void {
    console.log("\n=== Module Information ===");
    
    // 显示导入的常量
    console.log("\n--- Constants ---");
    console.log("PI:", PI);
    console.log("E:", E);
    
    // 显示默认配置
    console.log("\n--- Default Config ---");
    console.log("DEFAULT_CONFIG:", DEFAULT_CONFIG);
    
    // 显示日志颜色
    console.log("\n--- Log Colors ---");
    console.log("LOG_COLORS keys:", Object.keys(LOG_COLORS));
    
    // 显示枚举值
    console.log("\n--- Enum Values ---");
    console.log("LogLevel values:", Object.values(LogLevel));
    console.log("LogFormat values:", Object.values(LogFormat));
}

// ==================== 主函数 ====================

/**
 * 主函数
 */
function main(): void {
    console.log("=== TypeScript Module System Demo ===");
    console.log("This demo shows how to import and use TypeScript modules");
    console.log("Running in Deno environment");
    console.log("");
    
    // 运行所有测试
    testMathModule();
    testRenamedImports();
    testLoggerModule();
    testLoggerUtils();
    testModuleComposition();
    testErrorHandling();
    testPerformance();
    testModuleInfo();
    
    console.log("\n=== All tests completed ===");
    console.log("Module system demo finished successfully!");
}

// 运行主函数
if (import.meta.main) {
    main();
}
