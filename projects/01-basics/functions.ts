/**
 * TypeScript 函数示例
 * 本文件演示 TypeScript 中函数的类型定义和高级特性
 */

// ==================== 基本函数类型 ====================
console.log("=== 基本函数类型 ===");

// 函数参数和返回值类型注解
function add(a: number, b: number): number {
    return a + b;
}

// 箭头函数
const subtract = (a: number, b: number): number => a - b;

// 函数表达式
const multiply: (a: number, b: number) => number = function(a, b) {
    return a * b;
};

console.log("加法:", add(5, 3));
console.log("减法:", subtract(10, 4));
console.log("乘法:", multiply(6, 7));

// ==================== 可选参数 ====================
console.log("\n=== 可选参数 ===");

// 可选参数使用 ? 标记
function greet(name: string, greeting?: string): string {
    return `${greeting || "Hello"}, ${name}!`;
}

// 可选参数必须在必需参数之后
function createUser(firstName: string, lastName?: string, age?: number): object {
    return {
        firstName,
        lastName: lastName || "",
        age: age || 0
    };
}

console.log(greet("Alice")); // "Hello, Alice!"
console.log(greet("Bob", "Hi")); // "Hi, Bob!"
console.log(createUser("Charlie", "Brown", 30));
console.log(createUser("David"));

// ==================== 默认参数 ====================
console.log("\n=== 默认参数 ===");

// 默认参数
function buildName(firstName: string, lastName: string = "Smith"): string {
    return `${firstName} ${lastName}`;
}

// 默认参数可以放在必需参数之前（但调用时需要传入 undefined）
function buildName2(firstName: string = "John", lastName: string): string {
    return `${firstName} ${lastName}`;
}

console.log(buildName("Alice")); // "Alice Smith"
console.log(buildName("Bob", "Johnson")); // "Bob Johnson"
console.log(buildName2(undefined, "Doe")); // "John Doe"

// 复杂默认值
interface Config {
    host: string;
    port: number;
    debug: boolean;
}

function createServer(config: Config = {
    host: "localhost",
    port: 3000,
    debug: false
}): void {
    console.log(`服务器配置: ${config.host}:${config.port}, 调试模式: ${config.debug}`);
}

createServer();
createServer({ host: "0.0.0.0", port: 8080, debug: true });

// ==================== 剩余参数 ====================
console.log("\n=== 剩余参数 ===");

// 剩余参数使用 ... 语法
function sum(...numbers: number[]): number {
    return numbers.reduce((total, num) => total + num, 0);
}

// 剩余参数可以与其他参数结合
function log(level: string, ...messages: string[]): void {
    console.log(`[${level.toUpperCase()}]`, ...messages);
}

console.log("求和:", sum(1, 2, 3)); // 6
console.log("求和:", sum(10, 20, 30, 40, 50)); // 150

log("info", "服务器启动", "端口: 3000");
log("error", "连接失败", "超时");

// ==================== 函数重载 ====================
console.log("\n=== 函数重载 ===");

// 函数重载 - 多个函数签名
function reverse(value: string): string;
function reverse(value: number[]): number[];
function reverse(value: string | number[]): string | number[] {
    if (typeof value === "string") {
        return value.split("").reverse().join("");
    } else {
        return [...value].reverse();
    }
}

console.log("字符串反转:", reverse("hello")); // "olleh"
console.log("数组反转:", reverse([1, 2, 3])); // [3, 2, 1]

// 更复杂的重载示例
interface Coordinate {
    x: number;
    y: number;
}

function createCoordinate(x: number, y: number): Coordinate;
function createCoordinate(point: { x: number; y: number }): Coordinate;
function createCoordinate(xOrPoint: number | { x: number; y: number }, y?: number): Coordinate {
    if (typeof xOrPoint === "number") {
        return { x: xOrPoint, y: y! };
    } else {
        return xOrPoint;
    }
}

console.log("坐标1:", createCoordinate(10, 20));
console.log("坐标2:", createCoordinate({ x: 30, y: 40 }));

// ==================== 函数类型 ====================
console.log("\n=== 函数类型 ===");

// 函数类型定义
type MathOperation = (a: number, b: number) => number;

// 使用函数类型
const operations: Record<string, MathOperation> = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => a / b
};

console.log("加法:", operations.add(10, 5));
console.log("除法:", operations.divide(10, 3));

// 函数作为参数
function calculate(a: number, b: number, operation: MathOperation): number {
    return operation(a, b);
}

console.log("计算结果:", calculate(8, 2, operations.subtract));

// 回调函数类型
interface EventHandler {
    (event: string, data: any): void;
}

function onEvent(handler: EventHandler): void {
    handler("click", { x: 100, y: 200 });
}

onEvent((event, data) => {
    console.log(`事件: ${event}, 数据:`, data);
});

// ==================== 高阶函数 ====================
console.log("\n=== 高阶函数 ===");

// 返回函数的函数
function createMultiplier(factor: number): (x: number) => number {
    return (x: number) => x * factor;
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log("双倍:", double(5)); // 10
console.log("三倍:", triple(5)); // 15

// 函数组合
type Transformer<T> = (input: T) => T;

function compose<T>(...fns: Transformer<T>[]): Transformer<T> {
    return (input: T) => fns.reduce((acc, fn) => fn(acc), input);
}

const addOne = (x: number) => x + 1;
const multiplyByTwo = (x: number) => x * 2;
const square = (x: number) => x * x;

const transform = compose(addOne, multiplyByTwo, square);
console.log("组合函数结果:", transform(3)); // ((3 + 1) * 2)^2 = 64

// ==================== 泛型函数 ====================
console.log("\n=== 泛型函数 ===");

// 泛型函数
function identity<T>(arg: T): T {
    return arg;
}

console.log("泛型字符串:", identity<string>("hello"));
console.log("泛型数字:", identity<number>(42));
console.log("泛型推断:", identity(true)); // 自动推断为 boolean

// 泛型约束
interface Lengthwise {
    length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
    console.log("长度:", arg.length);
    return arg;
}

logLength("hello"); // 有 length 属性
logLength([1, 2, 3]); // 有 length 属性
// logLength(123); // 错误：number 没有 length 属性

// ==================== 异步函数 ====================
console.log("\n=== 异步函数 ===");

// 异步函数返回 Promise
async function fetchData(url: string): Promise<string> {
    // 模拟异步操作
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`来自 ${url} 的数据`);
        }, 100);
    });
}

// 使用 async/await
async function processData(): Promise<void> {
    try {
        const data = await fetchData("https://api.example.com");
        console.log("获取的数据:", data);
    } catch (error) {
        console.error("错误:", error);
    }
}

processData();

// ==================== 函数最佳实践 ====================
console.log("\n=== 函数最佳实践 ===");

// 1. 使用明确的返回类型
function calculateArea(radius: number): number {
    return Math.PI * radius * radius;
}

// 2. 使用类型别名简化复杂函数类型
type Predicate<T> = (item: T) => boolean;
type Comparator<T> = (a: T, b: T) => number;

function filter<T>(array: T[], predicate: Predicate<T>): T[] {
    return array.filter(predicate);
}

function sort<T>(array: T[], comparator: Comparator<T>): T[] {
    return [...array].sort(comparator);
}

// 3. 使用函数重载处理多种输入类型
function format(input: Date): string;
function format(input: number, decimals: number): string;
function format(input: Date | number, decimals?: number): string {
    if (input instanceof Date) {
        return input.toISOString();
    } else {
        return input.toFixed(decimals || 0);
    }
}

console.log("圆形面积:", calculateArea(5));
console.log("过滤:", filter([1, 2, 3, 4, 5], (x) => x > 3));
console.log("排序:", sort([3, 1, 4, 1, 5], (a, b) => a - b));
console.log("格式化日期:", format(new Date()));
console.log("格式化数字:", format(3.14159, 2));

// ==================== 运行说明 ====================
console.log("\n=== 运行说明 ===");
console.log("使用以下命令运行此文件:");
console.log("deno run functions.ts");
console.log("deno run --allow-all functions.ts");
