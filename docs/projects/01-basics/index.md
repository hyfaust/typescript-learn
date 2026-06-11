# TypeScript 基础入门

## TypeScript 简介

TypeScript 是 JavaScript 的超集，它在 JavaScript 的基础上添加了**静态类型系统**和**其他特性**。TypeScript 代码最终会被编译成 JavaScript 代码在浏览器或 Node.js 环境中运行。

### TypeScript 与 JavaScript 的主要区别

| 特性 | JavaScript | TypeScript |
|------|------------|------------|
| 类型系统 | 动态类型 | 静态类型 |
| 类型检查 | 运行时检查 | 编译时检查 |
| 编译 | 直接运行 | 需要编译 |
| 工具支持 | 基础 | 更好的智能提示和重构 |
| 学习曲线 | 较低 | 稍高 |

### 为什么选择 TypeScript？

1. **更早发现错误**：类型检查在编译时进行，而不是运行时
2. **更好的开发体验**：智能提示、自动补全、重构支持
3. **代码更易维护**：类型注解使代码更易理解
4. **支持最新 JavaScript 特性**：可以使用最新的 ECMAScript 特性

## Deno 简介

Deno 是一个现代的 JavaScript/TypeScript 运行时，由 Node.js 的创始人 Ryan Dahl 创建。它具有以下特点：

- **安全性**：默认情况下不允许文件系统、网络访问
- **TypeScript 支持**：原生支持 TypeScript，无需配置
- **标准化**：使用 Web 标准 API
- **单个可执行文件**：无需 npm 或 node_modules

### 安装 Deno

```bash
# Windows (PowerShell)
iwr https://deno.land/install.ps1 -useb | iex

# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# 使用 Chocolatey (Windows)
choco install deno
```

### 验证安装

```bash
deno --version
```

## 基本类型

TypeScript 提供了多种基本类型，用于定义变量的数据类型。

### 1. 字符串 (string)

```typescript
// 字符串类型
let name: string = "TypeScript";
let greeting: string = `Hello, ${name}!`;
```

### 2. 数字 (number)

```typescript
// 数字类型（包括整数和浮点数）
let age: number = 25;
let price: number = 19.99;
let hex: number = 0xf00d;
let binary: number = 0b1010;
```

### 3. 布尔值 (boolean)

```typescript
// 布尔类型
let isActive: boolean = true;
let isDeleted: boolean = false;
```

### 4. 数组 (array)

```typescript
// 数组类型 - 两种写法
let numbers1: number[] = [1, 2, 3, 4, 5];
let numbers2: Array<number> = [1, 2, 3, 4, 5];

// 字符串数组
let fruits: string[] = ["apple", "banana", "orange"];
```

### 5. 元组 (tuple)

```typescript
// 元组类型 - 固定长度和类型的数组
let person: [string, number] = ["Alice", 25];
let coordinate: [number, number, number] = [10, 20, 30];

// 访问元组元素
console.log(person[0]); // "Alice"
console.log(person[1]); // 25
```

### 6. 枚举 (enum)

```typescript
// 数字枚举
enum Direction {
    Up,    // 0
    Down,  // 1
    Left,  // 2
    Right  // 3
}

let move: Direction = Direction.Up;
console.log(move); // 0

// 字符串枚举
enum Color {
    Red = "RED",
    Green = "GREEN",
    Blue = "BLUE"
}

let favoriteColor: Color = Color.Red;
```

### 7. 任意类型 (any)

```typescript
// any 类型 - 可以存储任意类型的值
let flexible: any = 4;
flexible = "string";
flexible = true;

// 使用场景：动态内容、第三方库
let userInput: any = getUserInput();
```

### 8. 空值 (void)

```typescript
// void 类型 - 通常用于函数没有返回值的情况
function sayHello(): void {
    console.log("Hello!");
}

// void 类型的变量只能赋值为 undefined
let unusable: void = undefined;
```

### 9. null 和 undefined

```typescript
// null 和 undefined 类型
let nothing: null = null;
let notDefined: undefined = undefined;

// 在严格模式下，null 和 undefined 不能赋值给其他类型
let num: number = 10;
// num = null; // 错误：不能将 null 赋值给 number
```

### 10. never

```typescript
// never 类型 - 表示永远不会发生的值
function throwError(message: string): never {
    throw new Error(message);
}

function infiniteLoop(): never {
    while (true) {
        // 无限循环
    }
}
```

### 11. unknown

```typescript
// unknown 类型 - 类型安全的 any
let value: unknown = 4;
value = "string";

// 使用 unknown 时需要先进行类型检查
if (typeof value === "string") {
    console.log(value.toUpperCase()); // 安全
}

// 直接使用会报错
// console.log(value.toUpperCase()); // 错误
```

## 变量声明

TypeScript 支持 `let` 和 `const` 两种变量声明方式，与 JavaScript 相同。

### let 声明

```typescript
// let 声明 - 可变变量
let count: number = 0;
count = 10; // 可以重新赋值

// 块级作用域
function example() {
    let x: number = 10;
    if (true) {
        let x: number = 20; // 这是一个新的变量
        console.log(x); // 20
    }
    console.log(x); // 10
}
```

### const 声明

```typescript
// const 声明 - 不可变变量
const PI: number = 3.14159;
// PI = 3.14; // 错误：不能重新赋值

// 对象和数组的 const 声明
const user: { name: string; age: number } = {
    name: "Alice",
    age: 25
};
user.age = 26; // 可以修改对象属性

const numbers: number[] = [1, 2, 3];
numbers.push(4); // 可以修改数组内容
```

## 类型注解和类型推断

### 类型注解

类型注解是显式地为变量指定类型。

```typescript
// 显式类型注解
let message: string = "Hello";
let count: number = 10;
let isActive: boolean = true;
```

### 类型推断

TypeScript 可以根据赋值自动推断变量类型。

```typescript
// 类型推断
let message = "Hello"; // 推断为 string
let count = 10;       // 推断为 number
let isActive = true;  // 推断为 boolean

// 数组推断
let numbers = [1, 2, 3]; // 推断为 number[]
let mixed = [1, "two"];  // 推断为 (string | number)[]
```

## 函数

TypeScript 中的函数有更强大的类型系统。

### 函数类型注解

```typescript
// 函数参数和返回值类型
function add(a: number, b: number): number {
    return a + b;
}

// 箭头函数
const multiply = (a: number, b: number): number => a * b;
```

### 可选参数

```typescript
// 可选参数使用 ? 标记
function greet(name: string, greeting?: string): string {
    return `${greeting || "Hello"}, ${name}!`;
}

greet("Alice"); // "Hello, Alice!"
greet("Bob", "Hi"); // "Hi, Bob!"
```

### 默认参数

```typescript
// 默认参数
function createUser(name: string, age: number = 18): object {
    return { name, age };
}

createUser("Alice"); // { name: "Alice", age: 18 }
createUser("Bob", 25); // { name: "Bob", age: 25 }
```

### 剩余参数

```typescript
// 剩余参数
function sum(...numbers: number[]): number {
    return numbers.reduce((total, num) => total + num, 0);
}

sum(1, 2, 3); // 6
sum(1, 2, 3, 4, 5); // 15
```

### 函数重载

```typescript
// 函数重载 - 多个函数签名
function reverse(value: string): string;
function reverse(value: number[]): number[];
function reverse(value: string | number[]): string | number[] {
    if (typeof value === "string") {
        return value.split("").reverse().join("");
    } else {
        return value.reverse();
    }
}

reverse("hello"); // "olleh"
reverse([1, 2, 3]); // [3, 2, 1]
```

## 示例代码说明

本目录包含以下示例文件：

1. **main.ts** - 基本类型和变量声明示例
2. **functions.ts** - 函数相关示例
3. **deno.json** - Deno 配置文件

### 运行示例

```bash
# 运行基本类型示例
deno run main.ts

# 运行函数示例
deno run functions.ts

# 运行所有示例
deno run --allow-all main.ts
```

## 练习题

### 练习1：类型注解

为以下变量添加正确的类型注解：

```typescript
let name = "TypeScript";
let version = 5.0;
let isAwesome = true;
let features = ["types", "interfaces", "classes"];
```

### 练习2：函数实现

实现一个函数 `calculateArea`，接收一个形状类型（"circle" 或 "rectangle"）和相应的参数，返回面积。

```typescript
function calculateArea(shape: string, ...args: number[]): number {
    // 实现代码
}
```

### 练习3：类型推断

解释以下代码中 TypeScript 推断出的类型：

```typescript
let x = 10;
let y = "hello";
let z = [1, 2, 3];
let w = { name: "Alice", age: 25 };
```

### 练习4：函数重载

实现一个函数 `format`，可以格式化日期或数字：

```typescript
function format(value: Date): string;
function format(value: number, decimals: number): string;
function format(value: Date | number, decimals?: number): string {
    // 实现代码
}
```

## 下一步

完成本项目后，你将掌握：

1. TypeScript 的基本类型系统
2. 变量声明和类型注解
3. 函数的类型定义和高级特性
4. 如何在 Deno 环境中运行 TypeScript 代码

接下来，我们将学习 **接口和类型别名**，这是 TypeScript 类型系统的核心概念。

---

## 项目导航

[下一个项目：接口和类型](/projects/02-interfaces/)

[返回学习路径](/learning-path/)
