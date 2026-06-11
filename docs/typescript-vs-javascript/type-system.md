# TypeScript 与 JavaScript：类型系统

## 概述

TypeScript 最大的特点是其静态类型系统。本章将深入探讨 TypeScript 类型系统与 JavaScript 动态类型的区别。

## JavaScript 的动态类型

JavaScript 是动态类型语言，变量的类型在运行时确定：

```javascript
// JavaScript 动态类型示例
let value = 42;        // number
value = "hello";       // string
value = true;          // boolean
value = [1, 2, 3];     // array
value = { name: "John" }; // object

// 函数参数类型不确定
function add(a, b) {
  return a + b;
}

add(1, 2);      // 3
add("1", "2");  // "12"
add(1, "2");    // "12"
```

### JavaScript 动态类型的问题

1. **运行时错误**：类型错误在运行时才能发现
2. **难以重构**：没有类型信息，重构困难
3. **代码可读性差**：没有类型注解，代码意图不明确
4. **IDE 支持有限**：自动补全和导航功能受限

## TypeScript 的静态类型

TypeScript 是静态类型语言，变量的类型在编译时确定：

```typescript
// TypeScript 静态类型示例
let value: number = 42;
// value = "hello"; // 错误：不能将 string 赋值给 number

// 函数参数类型明确
function add(a: number, b: number): number {
  return a + b;
}

add(1, 2);      // 3
// add("1", "2"); // 错误：参数类型不匹配
// add(1, "2");   // 错误：参数类型不匹配
```

### TypeScript 静态类型的优势

1. **编译时错误检查**：在代码运行前发现错误
2. **更好的重构支持**：类型信息使重构更安全
3. **代码可读性**：类型注解即文档
4. **强大的 IDE 支持**：自动补全、导航、重构

## 类型系统对比

### 类型检查时机

| 特性 | JavaScript | TypeScript |
|------|------------|------------|
| 类型检查时机 | 运行时 | 编译时 |
| 错误发现时机 | 运行时 | 编译时 |
| 类型安全性 | 低 | 高 |
| 开发效率 | 中 | 高 |

### 类型注解

```javascript
// JavaScript：没有类型注解
function greet(name) {
  return `Hello, ${name}!`;
}
```

```typescript
// TypeScript：有类型注解
function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

### 类型推断

TypeScript 具有强大的类型推断能力：

```typescript
// TypeScript 类型推断
let x = 5;          // 推断为 number
let y = "hello";    // 推断为 string
let z = true;       // 推断为 boolean

// 函数返回值类型推断
function add(a: number, b: number) {
  return a + b; // 推断返回类型为 number
}
```

## 类型注解语法

### 基本类型注解

```typescript
// 原始类型
let name: string = "John";
let age: number = 30;
let isStudent: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;
```

### 数组类型注解

```typescript
// 数组类型
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["Alice", "Bob", "Charlie"];

// 泛型数组
let numbers2: Array<number> = [1, 2, 3, 4, 5];
```

### 元组类型注解

```typescript
// 元组：固定长度和类型的数组
let person: [string, number] = ["John", 30];

// 访问元组元素
console.log(person[0]); // "John"
console.log(person[1]); // 30
```

### 枚举类型注解

```typescript
// 数字枚举
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

let direction: Direction = Direction.Up;
console.log(direction); // 0

// 字符串枚举
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}

let color: Color = Color.Red;
console.log(color); // "RED"
```

### 特殊类型注解

```typescript
// any：任意类型
let anything: any = 4;
anything = "hello";
anything = true;

// unknown：未知类型（比 any 安全）
let unknownValue: unknown = 4;
// 需要类型检查才能使用
if (typeof unknownValue === "number") {
  console.log(unknownValue.toFixed(2));
}

// void：无返回值
function log(message: string): void {
  console.log(message);
}

// never：永不返回
function throwError(message: string): never {
  throw new Error(message);
}
```

## 类型推断

TypeScript 的类型推断是其强大特性之一：

### 基本类型推断

```typescript
// 变量初始化时推断类型
let x = 5;          // number
let y = "hello";    // string
let z = true;       // boolean

// 数组类型推断
let numbers = [1, 2, 3]; // number[]
let mixed = [1, "hello", true]; // (string | number | boolean)[]
```

### 函数返回值推断

```typescript
// 函数返回值类型推断
function add(a: number, b: number) {
  return a + b; // 推断返回类型为 number
}

function greet(name: string) {
  return `Hello, ${name}!`; // 推断返回类型为 string
}
```

### 上下文类型推断

```typescript
// 上下文类型推断
window.onmousedown = function (mouseEvent) {
  console.log(mouseEvent.button); // 推断 mouseEvent 为 MouseEvent
};
```

## 类型断言

当 TypeScript 无法推断类型时，可以使用类型断言：

### as 语法

```typescript
let someValue: unknown = "this is a string";
let strLength: number = (someValue as string).length;
```

### 尖括号语法

```typescript
let someValue: unknown = "this is a string";
let strLength: number = (<string>someValue).length;
```

## 类型守卫

类型守卫用于在运行时检查类型：

### typeof 类型守卫

```typescript
function padLeft(value: string | number, padding: string | number) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value; // padding 是 number
  }
  if (typeof padding === "string") {
    return padding + value; // padding 是 string
  }
  throw new Error(`Expected string or number, got '${padding}'.`);
}
```

### instanceof 类型守卫

```typescript
class Bird {
  fly() {
    console.log("flying");
  }
}

class Fish {
  swim() {
    console.log("swimming");
  }
}

function move(animal: Bird | Fish) {
  if (animal instanceof Bird) {
    animal.fly(); // animal 是 Bird
  } else {
    animal.swim(); // animal 是 Fish
  }
}
```

### 自定义类型守卫

```typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function example(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase()); // value 是 string
  }
}
```

## 类型兼容性

TypeScript 的类型兼容性基于结构化类型系统：

### 结构化类型系统

```typescript
interface Point {
  x: number;
  y: number;
}

function logPoint(p: Point) {
  console.log(`${p.x}, ${p.y}`);
}

const point = { x: 12, y: 26 };
logPoint(point); // 兼容，因为结构相同
```

### 类型兼容性规则

```typescript
interface Named {
  name: string;
}

class Person {
  name: string = "";
}

let p: Named;
p = new Person(); // 兼容，因为 Person 有 name 属性
```

## 类型保护与类型缩窄

### 类型缩窄

```typescript
function example(value: string | number | boolean) {
  // 类型缩窄
  if (typeof value === "string") {
    // 这里 value 是 string
    console.log(value.toUpperCase());
  } else if (typeof value === "number") {
    // 这里 value 是 number
    console.log(value.toFixed(2));
  } else {
    // 这里 value 是 boolean
    console.log(value);
  }
}
```

### 真值缩窄

```typescript
function printAll(strs: string | string[] | null) {
  if (strs && typeof strs === "object") {
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === "string") {
    console.log(strs);
  }
}
```

### 相等性缩窄

```typescript
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // 这里 x 和 y 都是 string
    console.log(x.toUpperCase());
    console.log(y.toUpperCase());
  }
}
```

## 实际应用示例

### API 响应处理

```typescript
// JavaScript 方式
function processResponse(response) {
  if (response.success) {
    console.log(response.data);
  } else {
    console.log(response.error);
  }
}

// TypeScript 方式
interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

function processResponse(response: ApiResponse) {
  if (response.success) {
    console.log(response.data);
  } else {
    console.log(response.error);
  }
}
```

### 配置对象

```typescript
// JavaScript 方式
function createServer(config) {
  const port = config.port || 3000;
  const host = config.host || "localhost";
  // ...
}

// TypeScript 方式
interface ServerConfig {
  port?: number;
  host?: string;
  debug?: boolean;
}

function createServer(config: ServerConfig) {
  const port = config.port || 3000;
  const host = config.host || "localhost";
  // ...
}
```

## 最佳实践

### 1. 避免使用 any

```typescript
// 不推荐
let value: any = 4;
value = "hello";
value = true;

// 推荐
let value: string | number | boolean = 4;
```

### 2. 使用 unknown 代替 any

```typescript
// 不推荐
let value: any = 4;

// 推荐
let value: unknown = 4;
if (typeof value === "number") {
  console.log(value.toFixed(2));
}
```

### 3. 使用类型别名和接口

```typescript
// 使用类型别名
type StringOrNumber = string | number;

// 使用接口
interface User {
  name: string;
  age: number;
}
```

### 4. 使用泛型提高复用性

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

// 泛型接口
interface Box<T> {
  value: T;
}
```

## 总结

TypeScript 的静态类型系统提供了许多优势：

1. **编译时错误检查**：减少运行时错误
2. **更好的开发体验**：自动补全、重构、导航
3. **代码可维护性**：类型即文档
4. **渐进式采用**：可以逐步添加到现有项目

虽然 TypeScript 增加了开发时的复杂性，但它显著提高了代码质量和开发效率。对于大型项目和团队协作，TypeScript 的类型系统是必不可少的。

## 下一步

继续学习 TypeScript 的高级特性：

[项目2：接口和类型](/projects/02-interfaces/)