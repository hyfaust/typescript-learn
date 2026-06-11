/**
 * TypeScript 数学工具模块示例
 * 本文件演示了ES模块的各种导出方式
 * 运行环境：Deno
 */

// ==================== 常量导出 ====================

/**
 * 数学常量
 */
export const PI = 3.141592653589793;
export const E = 2.718281828459045;
export const PHI = 1.618033988749895;  // 黄金比例
export const SQRT2 = 1.4142135623730951;
export const SQRT1_2 = 0.7071067811865476;

// ==================== 接口导出 ====================

/**
 * 数学运算结果接口
 */
export interface MathResult {
    value: number;
    operation: string;
    operands: number[];
    timestamp: Date;
}

/**
 * 统计数据接口
 */
export interface Statistics {
    mean: number;
    median: number;
    mode: number[];
    standardDeviation: number;
    variance: number;
    min: number;
    max: number;
    range: number;
    count: number;
}

/**
 * 向量接口
 */
export interface Vector2D {
    x: number;
    y: number;
}

export interface Vector3D extends Vector2D {
    z: number;
}

// ==================== 基本数学函数导出 ====================

/**
 * 加法运算
 * @param a - 第一个操作数
 * @param b - 第二个操作数
 * @returns 运算结果
 */
export function add(a: number, b: number): MathResult {
    return {
        value: a + b,
        operation: "add",
        operands: [a, b],
        timestamp: new Date()
    };
}

/**
 * 减法运算
 * @param a - 第一个操作数
 * @param b - 第二个操作数
 * @returns 运算结果
 */
export function subtract(a: number, b: number): MathResult {
    return {
        value: a - b,
        operation: "subtract",
        operands: [a, b],
        timestamp: new Date()
    };
}

/**
 * 乘法运算
 * @param a - 第一个操作数
 * @param b - 第二个操作数
 * @returns 运算结果
 */
export function multiply(a: number, b: number): MathResult {
    return {
        value: a * b,
        operation: "multiply",
        operands: [a, b],
        timestamp: new Date()
    };
}

/**
 * 除法运算
 * @param a - 被除数
 * @param b - 除数
 * @returns 运算结果
 * @throws 当除数为零时抛出错误
 */
export function divide(a: number, b: number): MathResult {
    if (b === 0) {
        throw new Error("Division by zero");
    }
    
    return {
        value: a / b,
        operation: "divide",
        operands: [a, b],
        timestamp: new Date()
    };
}

// ==================== 高级数学函数导出 ====================

/**
 * 幂运算
 * @param base - 底数
 * @param exponent - 指数
 * @returns 运算结果
 */
export function power(base: number, exponent: number): MathResult {
    return {
        value: Math.pow(base, exponent),
        operation: "power",
        operands: [base, exponent],
        timestamp: new Date()
    };
}

/**
 * 平方根
 * @param value - 输入值
 * @returns 平方根结果
 * @throws 当输入为负数时抛出错误
 */
export function sqrt(value: number): MathResult {
    if (value < 0) {
        throw new Error("Cannot calculate square root of negative number");
    }
    
    return {
        value: Math.sqrt(value),
        operation: "sqrt",
        operands: [value],
        timestamp: new Date()
    };
}

/**
 * 绝对值
 * @param value - 输入值
 * @returns 绝对值结果
 */
export function abs(value: number): MathResult {
    return {
        value: Math.abs(value),
        operation: "abs",
        operands: [value],
        timestamp: new Date()
    };
}

/**
 * 四舍五入
 * @param value - 输入值
 * @param decimals - 小数位数
 * @returns 四舍五入后的结果
 */
export function round(value: number, decimals: number = 0): MathResult {
    const factor = Math.pow(10, decimals);
    return {
        value: Math.round(value * factor) / factor,
        operation: "round",
        operands: [value, decimals],
        timestamp: new Date()
    };
}

// ==================== 三角函数导出 ====================

/**
 * 正弦函数
 * @param radians - 弧度值
 * @returns 正弦值
 */
export function sin(radians: number): MathResult {
    return {
        value: Math.sin(radians),
        operation: "sin",
        operands: [radians],
        timestamp: new Date()
    };
}

/**
 * 余弦函数
 * @param radians - 弧度值
 * @returns 余弦值
 */
export function cos(radians: number): MathResult {
    return {
        value: Math.cos(radians),
        operation: "cos",
        operands: [radians],
        timestamp: new Date()
    };
}

/**
 * 正切函数
 * @param radians - 弧度值
 * @returns 正切值
 */
export function tan(radians: number): MathResult {
    return {
        value: Math.tan(radians),
        operation: "tan",
        operands: [radians],
        timestamp: new Date()
    };
}

/**
 * 角度转弧度
 * @param degrees - 角度值
 * @returns 弧度值
 */
export function degreesToRadians(degrees: number): number {
    return degrees * (PI / 180);
}

/**
 * 弧度转角度
 * @param radians - 弧度值
 * @returns 角度值
 */
export function radiansToDegrees(radians: number): number {
    return radians * (180 / PI);
}

// ==================== 统计函数导出 ====================

/**
 * 计算平均值
 * @param numbers - 数字数组
 * @returns 平均值
 */
export function mean(numbers: number[]): number {
    if (numbers.length === 0) {
        throw new Error("Cannot calculate mean of empty array");
    }
    
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    return sum / numbers.length;
}

/**
 * 计算中位数
 * @param numbers - 数字数组
 * @returns 中位数
 */
export function median(numbers: number[]): number {
    if (numbers.length === 0) {
        throw new Error("Cannot calculate median of empty array");
    }
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
        return sorted[middle];
    }
}

/**
 * 计算众数
 * @param numbers - 数字数组
 * @returns 众数数组
 */
export function mode(numbers: number[]): number[] {
    if (numbers.length === 0) {
        throw new Error("Cannot calculate mode of empty array");
    }
    
    const frequency: Map<number, number> = new Map();
    let maxFrequency = 0;
    
    for (const num of numbers) {
        const count = (frequency.get(num) || 0) + 1;
        frequency.set(num, count);
        maxFrequency = Math.max(maxFrequency, count);
    }
    
    const modes: number[] = [];
    for (const [num, count] of frequency.entries()) {
        if (count === maxFrequency) {
            modes.push(num);
        }
    }
    
    return modes;
}

/**
 * 计算标准差
 * @param numbers - 数字数组
 * @returns 标准差
 */
export function standardDeviation(numbers: number[]): number {
    if (numbers.length === 0) {
        throw new Error("Cannot calculate standard deviation of empty array");
    }
    
    const avg = mean(numbers);
    const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2));
    const variance = mean(squaredDiffs);
    
    return Math.sqrt(variance);
}

/**
 * 计算方差
 * @param numbers - 数字数组
 * @returns 方差
 */
export function variance(numbers: number[]): number {
    if (numbers.length === 0) {
        throw new Error("Cannot calculate variance of empty array");
    }
    
    const avg = mean(numbers);
    const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2));
    
    return mean(squaredDiffs);
}

/**
 * 计算完整统计数据
 * @param numbers - 数字数组
 * @returns 统计数据对象
 */
export function calculateStatistics(numbers: number[]): Statistics {
    if (numbers.length === 0) {
        throw new Error("Cannot calculate statistics of empty array");
    }
    
    const sorted = [...numbers].sort((a, b) => a - b);
    
    return {
        mean: mean(numbers),
        median: median(numbers),
        mode: mode(numbers),
        standardDeviation: standardDeviation(numbers),
        variance: variance(numbers),
        min: sorted[0],
        max: sorted[sorted.length - 1],
        range: sorted[sorted.length - 1] - sorted[0],
        count: numbers.length
    };
}

// ==================== 向量运算导出 ====================

/**
 * 向量加法
 * @param v1 - 第一个向量
 * @param v2 - 第二个向量
 * @returns 相加后的向量
 */
export function addVectors2D(v1: Vector2D, v2: Vector2D): Vector2D {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    };
}

/**
 * 向量减法
 * @param v1 - 第一个向量
 * @param v2 - 第二个向量
 * @returns 相减后的向量
 */
export function subtractVectors2D(v1: Vector2D, v2: Vector2D): Vector2D {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    };
}

/**
 * 向量点积
 * @param v1 - 第一个向量
 * @param v2 - 第二个向量
 * @returns 点积结果
 */
export function dotProduct2D(v1: Vector2D, v2: Vector2D): number {
    return v1.x * v2.x + v1.y * v2.y;
}

/**
 * 向量长度
 * @param v - 向量
 * @returns 向量长度
 */
export function vectorLength2D(v: Vector2D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * 向量归一化
 * @param v - 向量
 * @returns 归一化后的向量
 */
export function normalizeVector2D(v: Vector2D): Vector2D {
    const length = vectorLength2D(v);
    
    if (length === 0) {
        throw new Error("Cannot normalize zero vector");
    }
    
    return {
        x: v.x / length,
        y: v.y / length
    };
}

/**
 * 两点间距离
 * @param p1 - 第一个点
 * @param p2 - 第二个点
 * @returns 距离
 */
export function distance2D(p1: Vector2D, p2: Vector2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    
    return Math.sqrt(dx * dx + dy * dy);
}

// ==================== 数论函数导出 ====================

/**
 * 最大公约数
 * @param a - 第一个数
 * @param b - 第二个数
 * @returns 最大公约数
 */
export function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    
    while (b) {
        [a, b] = [b, a % b];
    }
    
    return a;
}

/**
 * 最小公倍数
 * @param a - 第一个数
 * @param b - 第二个数
 * @returns 最小公倍数
 */
export function lcm(a: number, b: number): number {
    if (a === 0 || b === 0) {
        return 0;
    }
    
    return Math.abs(a * b) / gcd(a, b);
}

/**
 * 判断是否为质数
 * @param n - 要判断的数
 * @returns 是否为质数
 */
export function isPrime(n: number): boolean {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    
    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) {
            return false;
        }
    }
    
    return true;
}

/**
 * 获取质数列表
 * @param max - 最大值
 * @returns 质数数组
 */
export function getPrimes(max: number): number[] {
    const primes: number[] = [];
    
    for (let i = 2; i <= max; i++) {
        if (isPrime(i)) {
            primes.push(i);
        }
    }
    
    return primes;
}

/**
 * 阶乘
 * @param n - 输入值
 * @returns 阶乘结果
 * @throws 当输入为负数时抛出错误
 */
export function factorial(n: number): number {
    if (n < 0) {
        throw new Error("Factorial is not defined for negative numbers");
    }
    
    if (n === 0 || n === 1) {
        return 1;
    }
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    
    return result;
}

/**
 * 斐波那契数列
 * @param n - 项数
 * @returns 斐波那契数列数组
 */
export function fibonacci(n: number): number[] {
    if (n <= 0) {
        return [];
    }
    
    if (n === 1) {
        return [0];
    }
    
    const sequence = [0, 1];
    
    for (let i = 2; i < n; i++) {
        sequence.push(sequence[i - 1] + sequence[i - 2]);
    }
    
    return sequence;
}

// ==================== 工具函数导出 ====================

/**
 * 限制数值在指定范围内
 * @param value - 输入值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 限制后的值
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * 线性插值
 * @param start - 起始值
 * @param end - 结束值
 * @param t - 插值参数（0-1）
 * @returns 插值结果
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * clamp(t, 0, 1);
}

/**
 * 将值从一个范围映射到另一个范围
 * @param value - 输入值
 * @param inMin - 输入范围最小值
 * @param inMax - 输入范围最大值
 * @param outMin - 输出范围最小值
 * @param outMax - 输出范围最大值
 * @returns 映射后的值
 */
export function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

/**
 * 生成随机整数
 * @param min - 最小值
 * @param max - 最大值
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成随机浮点数
 * @param min - 最小值
 * @param max - 最大值
 * @returns 随机浮点数
 */
export function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

// ==================== 默认导出 ====================

/**
 * 数学工具类
 */
export default class MathUtils {
    /**
     * 计算表达式
     * @param expression - 数学表达式
     * @returns 计算结果
     */
    static evaluate(expression: string): number {
        // 简单的表达式求值（仅支持基本运算）
        try {
            // 使用Function构造器安全地求值
            return new Function(`return (${expression})`)();
        } catch (error) {
            throw new Error(`Invalid expression: ${expression}`);
        }
    }
    
    /**
     * 格式化数字
     * @param value - 数字值
     * @param decimals - 小数位数
     * @returns 格式化后的字符串
     */
    static formatNumber(value: number, decimals: number = 2): string {
        return value.toFixed(decimals);
    }
    
    /**
     * 检查是否为整数
     * @param value - 数字值
     * @returns 是否为整数
     */
    static isInteger(value: number): boolean {
        return Number.isInteger(value);
    }
    
    /**
     * 检查是否为偶数
     * @param value - 数字值
     * @returns 是否为偶数
     */
    static isEven(value: number): boolean {
        return value % 2 === 0;
    }
    
    /**
     * 检查是否为奇数
     * @param value - 数字值
     * @returns 是否为奇数
     */
    static isOdd(value: number): boolean {
        return value % 2 !== 0;
    }
}

// ==================== 测试代码 ====================

// 如果直接运行此文件，则执行测试
if (import.meta.main) {
    console.log("=== Math Module Tests ===");
    
    // 测试基本运算
    console.log("\n--- Basic Operations ---");
    console.log("add(5, 3):", add(5, 3));
    console.log("subtract(10, 4):", subtract(10, 4));
    console.log("multiply(6, 7):", multiply(6, 7));
    console.log("divide(15, 3):", divide(15, 3));
    
    // 测试高级运算
    console.log("\n--- Advanced Operations ---");
    console.log("power(2, 10):", power(2, 10));
    console.log("sqrt(144):", sqrt(144));
    console.log("abs(-42):", abs(-42));
    console.log("round(3.14159, 2):", round(3.14159, 2));
    
    // 测试三角函数
    console.log("\n--- Trigonometry ---");
    console.log("sin(π/2):", sin(degreesToRadians(90)));
    console.log("cos(0):", cos(0));
    console.log("tan(π/4):", tan(degreesToRadians(45)));
    
    // 测试统计函数
    console.log("\n--- Statistics ---");
    const data = [1, 2, 3, 4, 5, 5, 6, 7, 8, 9, 10];
    console.log("Data:", data);
    console.log("Mean:", mean(data));
    console.log("Median:", median(data));
    console.log("Mode:", mode(data));
    console.log("Standard Deviation:", standardDeviation(data));
    
    // 测试向量运算
    console.log("\n--- Vector Operations ---");
    const v1: Vector2D = { x: 3, y: 4 };
    const v2: Vector2D = { x: 1, y: 2 };
    console.log("v1:", v1);
    console.log("v2:", v2);
    console.log("addVectors2D(v1, v2):", addVectors2D(v1, v2));
    console.log("dotProduct2D(v1, v2):", dotProduct2D(v1, v2));
    console.log("vectorLength2D(v1):", vectorLength2D(v1));
    
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
    
    // 测试MathUtils类
    console.log("\n--- MathUtils Class ---");
    console.log("evaluate('2 + 3 * 4'):", MathUtils.evaluate("2 + 3 * 4"));
    console.log("formatNumber(3.14159):", MathUtils.formatNumber(3.14159));
    console.log("isInteger(42):", MathUtils.isInteger(42));
    console.log("isEven(4):", MathUtils.isEven(4));
    
    console.log("\n=== All tests completed ===");
}
