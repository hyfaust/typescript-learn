/**
 * TypeScript 基本类型示例
 * 本文件演示 TypeScript 中所有基本数据类型的使用方法
 */

// ==================== 字符串类型 ====================
console.log("=== 字符串类型 ===");

let greeting: string = "Hello, TypeScript!";
let name: string = "Deno";
let template: string = `Welcome to ${name}!`;

console.log(greeting);
console.log(template);

// ==================== 数字类型 ====================
console.log("\n=== 数字类型 ===");

let integer: number = 42;
let float: number = 3.14159;
let hex: number = 0xff;
let binary: number = 0b1010;
let octal: number = 0o744;

console.log(`整数: ${integer}`);
console.log(`浮点数: ${float}`);
console.log(`十六进制: ${hex}`);
console.log(`二进制: ${binary}`);
console.log(`八进制: ${octal}`);

// ==================== 布尔类型 ====================
console.log("\n=== 布尔类型 ===");

let isTrue: boolean = true;
let isFalse: boolean = false;

console.log(`真值: ${isTrue}`);
console.log(`假值: ${isFalse}`);

// ==================== 数组类型 ====================
console.log("\n=== 数组类型 ===");

// 方式1: 类型[]
let numbers1: number[] = [1, 2, 3, 4, 5];
let fruits1: string[] = ["apple", "banana", "orange"];

// 方式2: Array<类型>
let numbers2: Array<number> = [10, 20, 30];

console.log("数字数组:", numbers1);
console.log("字符串数组:", fruits1);
console.log("Array<类型> 写法:", numbers2);

// ==================== 元组类型 ====================
console.log("\n=== 元组类型 ===");

// 元组：固定长度和类型的数组
let person: [string, number] = ["Alice", 25];
let coordinate: [number, number, number] = [10, 20, 30];
let mixed: [string, number, boolean] = ["Bob", 30, true];

console.log("个人信息:", person);
console.log("三维坐标:", coordinate);
console.log("混合元组:", mixed);

// 访问元组元素
console.log("姓名:", person[0]);
console.log("年龄:", person[1]);

// ==================== 枚举类型 ====================
console.log("\n=== 枚举类型 ===");

// 数字枚举
enum Direction {
    Up,    // 0
    Down,  // 1
    Left,  // 2
    Right  // 3
}

let move: Direction = Direction.Up;
console.log("方向枚举值:", move); // 0
console.log("方向名称:", Direction[move]); // "Up"

// 字符串枚举
enum Color {
    Red = "RED",
    Green = "GREEN",
    Blue = "BLUE"
}

let favoriteColor: Color = Color.Red;
console.log("颜色:", favoriteColor); // "RED"

// 异构枚举
enum Boolean {
    No = 0,
    Yes = "YES"
}

console.log("异构枚举:", Boolean.No, Boolean.Yes);

// ==================== any 类型 ====================
console.log("\n=== any 类型 ===");

// any 类型可以存储任意类型的值
let flexible: any = 4;
console.log("初始值 (数字):", flexible);

flexible = "现在是字符串";
console.log("修改后 (字符串):", flexible);

flexible = true;
console.log("再次修改 (布尔):", flexible);

// 使用场景：动态内容、第三方库、迁移 JavaScript 代码
let userInput: any = getUserInput();
console.log("用户输入:", userInput);

function getUserInput(): any {
    return { id: 1, name: "测试" };
}

// ==================== void 类型 ====================
console.log("\n=== void 类型 ===");

// void 用于函数没有返回值的情况
function logMessage(message: string): void {
    console.log("日志:", message);
}

logMessage("这是一条日志");

// void 类型的变量只能赋值为 undefined
let unusable: void = undefined;
console.log("void 变量:", unusable);

// ==================== null 和 undefined ====================
console.log("\n=== null 和 undefined ===");

let nothing: null = null;
let notDefined: undefined = undefined;

console.log("null:", nothing);
console.log("undefined:", notDefined);

// 在严格模式下，null 和 undefined 不能赋值给其他类型
// let num: number = null; // 错误
// let str: string = undefined; // 错误

// ==================== never 类型 ====================
console.log("\n=== never 类型 ===");

// never 表示永远不会发生的值
export function throwError(message: string): never {
    throw new Error(message);
}

export function infiniteLoop(): never {
    while (true) {
        // 无限循环
    }
}

// 注意：throwError 和 infiniteLoop 函数演示了 never 类型
// 在实际代码中，这些函数会导致程序终止或无限循环
// 这里只是展示 never 类型的用法，不实际调用

// never 用于穷举检查
type Shape = "circle" | "square" | "triangle";

function getArea(shape: Shape): number {
    switch (shape) {
        case "circle":
            return Math.PI * 10 * 10;
        case "square":
            return 10 * 10;
        case "triangle":
            return 0.5 * 10 * 10;
        default:
            // 如果所有情况都处理了，这里的类型就是 never
            const exhaustiveCheck: never = shape;
            return exhaustiveCheck;
    }
}

console.log("圆形面积:", getArea("circle"));
console.log("正方形面积:", getArea("square"));

// ==================== unknown 类型 ====================
console.log("\n=== unknown 类型 ===");

// unknown 是类型安全的 any
let value: unknown = 4;
console.log("初始值 (数字):", value);

value = "现在是字符串";
console.log("修改后 (字符串):", value);

// 使用 unknown 时需要先进行类型检查
if (typeof value === "string") {
    console.log("字符串长度:", value.length); // 安全访问
}

// 直接使用会报错
// console.log(value.toUpperCase()); // 错误：类型不安全

// unknown 类型的函数参数
function processValue(input: unknown): string {
    if (typeof input === "string") {
        return input.toUpperCase();
    } else if (typeof input === "number") {
        return input.toFixed(2);
    } else {
        return String(input);
    }
}

console.log("处理字符串:", processValue("hello"));
console.log("处理数字:", processValue(3.14159));

// ==================== 类型注解与类型推断 ====================
console.log("\n=== 类型注解与类型推断 ===");

// 显式类型注解
let explicitString: string = "TypeScript";
let explicitNumber: number = 5.0;
let explicitBoolean: boolean = true;

// 类型推断
let inferredString = "JavaScript"; // 推断为 string
let inferredNumber = 10;           // 推断为 number
let inferredBoolean = false;       // 推断为 boolean

// 数组推断
let inferredArray = [1, 2, 3];     // 推断为 number[]
let mixedArray = [1, "two"];       // 推断为 (string | number)[]

console.log("显式注解:", explicitString, explicitNumber, explicitBoolean);
console.log("类型推断:", inferredString, inferredNumber, inferredBoolean);
console.log("数组推断:", inferredArray, mixedArray);

// ==================== 综合示例 ====================
console.log("\n=== 综合示例 ===");

// 定义一个复杂的数据结构
interface User {
    id: number;
    name: string;
    email: string;
    age?: number; // 可选属性
    isActive: boolean;
}

// 使用类型注解创建用户
let currentUser: User = {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    isActive: true
};

console.log("当前用户:", currentUser);
console.log("用户名:", currentUser.name);
console.log("是否活跃:", currentUser.isActive);

// 类型推断创建用户
let anotherUser = {
    id: 2,
    name: "Bob",
    email: "bob@example.com",
    age: 25,
    isActive: false
};

console.log("另一个用户:", anotherUser);

// ==================== 运行说明 ====================
console.log("\n=== 运行说明 ===");
console.log("使用以下命令运行此文件:");
console.log("deno run main.ts");
console.log("deno run --allow-all main.ts");
