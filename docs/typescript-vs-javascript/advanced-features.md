# TypeScript 与 JavaScript：高级特性

## 概述

TypeScript 提供了许多 JavaScript 没有的高级特性，如接口、泛型、装饰器等。本章将深入探讨这些高级特性。

## 接口

接口是 TypeScript 的核心特性之一，用于定义对象的结构契约：

### 基本接口

```typescript
// 定义接口
interface User {
  name: string;
  age: number;
  email: string;
}

// 使用接口
const user: User = {
  name: "John",
  age: 30,
  email: "john@example.com",
};

// 错误：缺少必需属性
// const user2: User = {
//   name: "Jane",
//   age: 25,
// };
```

### 可选属性

```typescript
interface User {
  name: string;
  age: number;
  email?: string; // 可选属性
}

const user1: User = {
  name: "John",
  age: 30,
};

const user2: User = {
  name: "Jane",
  age: 25,
  email: "jane@example.com",
};
```

### 只读属性

```typescript
interface User {
  readonly id: number;
  name: string;
  age: number;
}

const user: User = {
  id: 1,
  name: "John",
  age: 30,
};

// user.id = 2; // 错误：只读属性不能修改
```

### 函数类型接口

```typescript
interface SearchFunc {
  (source: string, subString: string): boolean;
}

const mySearch: SearchFunc = function (
  source: string,
  subString: string
): boolean {
  return source.search(subString) > -1;
};
```

### 索引签名

```typescript
interface StringArray {
  [index: number]: string;
}

const myArray: StringArray = ["Alice", "Bob", "Charlie"];
console.log(myArray[0]); // "Alice"
```

## 类型别名

类型别名用于给类型起一个新名字：

### 基本类型别名

```typescript
type StringOrNumber = string | number;
type Callback = (data: string) => void;
type User = {
  name: string;
  age: number;
};
```

### 联合类型

```typescript
type Result = Success | Error;

interface Success {
  success: true;
  data: any;
}

interface Error {
  success: false;
  message: string;
}

function handleResult(result: Result) {
  if (result.success) {
    console.log(result.data);
  } else {
    console.log(result.message);
  }
}
```

### 交叉类型

```typescript
type Person = {
  name: string;
  age: number;
};

type Employee = {
  employeeId: number;
  department: string;
};

type PersonEmployee = Person & Employee;

const employee: PersonEmployee = {
  name: "John",
  age: 30,
  employeeId: 12345,
  department: "Engineering",
};
```

## 泛型

泛型是 TypeScript 的强大特性，用于创建可重用的类型安全组件：

### 泛型函数

```typescript
function identity<T>(arg: T): T {
  return arg;
}

const num = identity<number>(42);
const str = identity<string>("hello");
const bool = identity<boolean>(true);
```

### 泛型接口

```typescript
interface Box<T> {
  value: T;
}

const numberBox: Box<number> = { value: 42 };
const stringBox: Box<string> = { value: "hello" };
```

### 泛型类

```typescript
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;

  constructor(zeroValue: T, add: (x: T, y: T) => T) {
    this.zeroValue = zeroValue;
    this.add = add;
  }
}

const myGenericNumber = new GenericNumber<number>(0, (x, y) => x + y);
```

### 泛型约束

```typescript
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

loggingIdentity("hello"); // OK
loggingIdentity([1, 2, 3]); // OK
// loggingIdentity(3); // 错误：number 没有 length 属性
```

## 高级类型

### 联合类型

```typescript
function padLeft(value: string | number, padding: string | number) {
  // ...
}

padLeft("hello", 4); // OK
padLeft(4, "hello"); // OK
// padLeft(true, 4); // 错误
```

### 交叉类型

```typescript
function extend<T, U>(first: T, second: U): T & U {
  const result = {} as T & U;
  for (let id in first) {
    (result as any)[id] = (first as any)[id];
  }
  for (let id in second) {
    if (!result.hasOwnProperty(id)) {
      (result as any)[id] = (second as any)[id];
    }
  }
  return result;
}
```

### 可辨识联合

```typescript
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
  }
}
```

### 映射类型

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  name: string;
  age: number;
}

const readonlyUser: Readonly<User> = {
  name: "John",
  age: 30,
};
// readonlyUser.name = "Jane"; // 错误：只读属性

const partialUser: Partial<User> = {
  name: "John",
};
```

### 条件类型

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false
```

## 装饰器

装饰器是 TypeScript 的高级特性，用于修改类和方法的行为：

### 类装饰器

```typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    return "Hello, " + this.greeting;
  }
}
```

### 方法装饰器

```typescript
function enumerable(value: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.enumerable = value;
  };
}

class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}
```

### 属性装饰器

```typescript
function validate(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    if (args.some((arg) => arg === null || arg === undefined)) {
      throw new Error("Arguments cannot be null or undefined");
    }
    return originalMethod.apply(this, args);
  };
}

class Calculator {
  @validate
  add(a: number, b: number): number {
    return a + b;
  }
}
```

## 模块系统

TypeScript 支持 ES 模块系统：

### 导出

```typescript
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export const PI = 3.14159;
```

### 导入

```typescript
// main.ts
import { add, subtract, PI } from "./math.ts";

console.log(add(1, 2)); // 3
console.log(subtract(5, 3)); // 2
console.log(PI); // 3.14159
```

### 默认导出

```typescript
// logger.ts
export default class Logger {
  log(message: string) {
    console.log(message);
  }
}

// main.ts
import Logger from "./logger.ts";

const logger = new Logger();
logger.log("Hello, World!");
```

## 异步编程

TypeScript 对异步编程有很好的支持：

### Promise

```typescript
function fetchData(): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Data fetched");
    }, 1000);
  });
}

fetchData().then((data) => {
  console.log(data); // "Data fetched"
});
```

### async/await

```typescript
async function fetchData(): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Data fetched");
    }, 1000);
  });
}

async function main() {
  const data = await fetchData();
  console.log(data); // "Data fetched"
}

main();
```

### 异步迭代器

```typescript
async function* asyncGenerator() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
  yield await Promise.resolve(3);
}

async function main() {
  for await (const value of asyncGenerator()) {
    console.log(value);
  }
}

main();
```

## 枚举

TypeScript 支持枚举类型：

### 数字枚举

```typescript
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

let direction: Direction = Direction.Up;
console.log(direction); // 0
```

### 字符串枚举

```typescript
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}

let color: Color = Color.Red;
console.log(color); // "RED"
```

### 异构枚举

```typescript
enum BooleanLikeHeterogeneousEnum {
  No = 0,
  Yes = "YES",
}
```

## 类型推断

TypeScript 具有强大的类型推断能力：

### 基本类型推断

```typescript
let x = 5; // number
let y = "hello"; // string
let z = true; // boolean
```

### 函数返回值推断

```typescript
function add(a: number, b: number) {
  return a + b; // number
}
```

### 上下文类型推断

```typescript
window.onmousedown = function (mouseEvent) {
  console.log(mouseEvent.button); // MouseEvent
};
```

## 类型保护

类型保护用于在运行时检查类型：

### typeof 类型守卫

```typescript
function padLeft(value: string | number, padding: string | number) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value;
  }
  if (typeof padding === "string") {
    return padding + value;
  }
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
    animal.fly();
  } else {
    animal.swim();
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
    console.log(value.toUpperCase());
  }
}
```

## 实际应用示例

### API 客户端

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}

// 使用
const api = new ApiClient("https://api.example.com");
interface User {
  id: number;
  name: string;
  email: string;
}

api.get<User>("/users/1").then((response) => {
  console.log(response.data.name);
});
```

### 状态管理

```typescript
interface State {
  count: number;
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface User {
  id: number;
  name: string;
  email: string;
}

type Action =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    case "DECREMENT":
      return { ...state, count: state.count - 1 };
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}
```

## 最佳实践

### 1. 使用接口定义对象结构

```typescript
// 推荐
interface User {
  name: string;
  age: number;
}

// 不推荐
type User = {
  name: string;
  age: number;
};
```

### 2. 使用类型别名定义联合类型和交叉类型

```typescript
// 推荐
type StringOrNumber = string | number;
type PersonEmployee = Person & Employee;

// 不推荐
interface StringOrNumber = string | number;
```

### 3. 使用泛型提高复用性

```typescript
// 推荐
function identity<T>(arg: T): T {
  return arg;
}

// 不推荐
function identity(arg: any): any {
  return arg;
}
```

### 4. 使用可辨识联合处理复杂类型

```typescript
// 推荐
type Shape = Circle | Square | Triangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}
```

## 总结

TypeScript 的高级特性提供了许多 JavaScript 没有的功能：

1. **接口**：定义对象的结构契约
2. **泛型**：创建可重用的类型安全组件
3. **高级类型**：联合类型、交叉类型、可辨识联合等
4. **装饰器**：修改类和方法的行为
5. **模块系统**：ES 模块支持
6. **异步编程**：Promise、async/await、异步迭代器

这些特性使得 TypeScript 在大型项目和团队协作中具有显著优势。

## 下一步

继续学习 TypeScript 的实际应用：

[项目3：类和面向对象](/projects/03-classes/)