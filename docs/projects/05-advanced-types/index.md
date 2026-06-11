# TypeScript 高级类型

## 目录
1. [联合类型（Union Types）](#联合类型union-types)
2. [交叉类型（Intersection Types）](#交叉类型intersection-types)
3. [类型守卫（Type Guards）](#类型守卫type-guards)
4. [可辨识联合（Discriminated Unions）](#可辨识联合discriminated-unions)
5. [类型别名 vs 接口](#类型别名-vs-接口)
6. [映射类型（Mapped Types）](#映射类型mapped-types)
7. [条件类型（Conditional Types）](#条件类型conditional-types)
8. [示例代码说明](#示例代码说明)
9. [练习题](#练习题)

## 联合类型（Union Types）

### 什么是联合类型？

联合类型表示一个值可以是几种类型之一。我们使用竖线（`|`）分隔每个类型。

### 基本语法

```typescript
// 基本联合类型
let value: string | number;
value = "hello";  // 有效
value = 42;       // 有效
// value = true;  // 错误，boolean不在联合类型中

// 函数参数使用联合类型
function processValue(value: string | number): string {
    if (typeof value === "string") {
        return value.toUpperCase();
    } else {
        return value.toFixed(2);
    }
}
```

### 联合类型的实际应用

```typescript
// API响应类型
type ApiResponse = 
    | { status: "success"; data: any }
    | { status: "error"; error: string }
    | { status: "loading" };

function handleResponse(response: ApiResponse): void {
    switch (response.status) {
        case "success":
            console.log("Data:", response.data);
            break;
        case "error":
            console.log("Error:", response.error);
            break;
        case "loading":
            console.log("Loading...");
            break;
    }
}

// 字面量联合类型
type Direction = "up" | "down" | "left" | "right";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type StatusCode = 200 | 201 | 400 | 404 | 500;

function move(direction: Direction): void {
    console.log(`Moving ${direction}`);
}

move("up");    // 有效
move("right"); // 有效
// move("forward"); // 错误
```

### 联合类型与数组

```typescript
// 数组元素可以是联合类型
let mixedArray: (string | number)[] = [1, "two", 3, "four"];

// 只能使用联合类型中包含的方法
mixedArray.forEach(item => {
    if (typeof item === "string") {
        console.log(item.toUpperCase());  // 可以使用string方法
    } else {
        console.log(item.toFixed(2));     // 可以使用number方法
    }
});
```

## 交叉类型（Intersection Types）

### 什么是交叉类型？

交叉类型将多个类型合并为一个类型。新类型具有所有类型的特性。我们使用 `&` 符号创建交叉类型。

### 基本语法

```typescript
// 基本交叉类型
interface HasName {
    name: string;
}

interface HasAge {
    age: number;
}

type Person = HasName & HasAge;

const person: Person = {
    name: "Alice",
    age: 30
};

// 交叉类型具有所有类型的属性
console.log(person.name);  // "Alice"
console.log(person.age);   // 30
```

### 交叉类型的实际应用

```typescript
// 混入模式（Mixin Pattern）
type Constructor<T = {}> = new (...args: any[]) => T;

function Timestamped<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        timestamp = new Date();
    };
}

function Activatable<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        isActive = false;
        
        activate() {
            this.isActive = true;
        }
        
        deactivate() {
            this.isActive = false;
        }
    };
}

class User {
    constructor(public name: string) {}
}

// 使用混入创建新类
const TimestampedUser = Timestamped(User);
const ActivatableUser = Activatable(User);
const TimestampedActivatableUser = Timestamped(Activatable(User));

const user = new TimestampedActivatableUser("Alice");
user.activate();
console.log(user.timestamp);
console.log(user.isActive);
```

### 交叉类型与联合类型的区别

```typescript
// 联合类型：A | B - 值可以是A或B
// 交叉类型：A & B - 值同时是A和B

interface Circle {
    kind: "circle";
    radius: number;
}

interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}

// 联合类型：可以是圆形或矩形
type Shape = Circle | Rectangle;

// 交叉类型：同时是圆形和矩形（通常不太合理，但用于演示）
type HybridShape = Circle & Rectangle;

// 实际使用中，交叉类型更常用于组合多个接口
interface Printable {
    print(): void;
}

interface Loggable {
    log(message: string): void;
}

type PrintableAndLoggable = Printable & Loggable;

class Document implements PrintableAndLoggable {
    print(): void {
        console.log("Printing document...");
    }
    
    log(message: string): void {
        console.log(`[LOG] ${message}`);
    }
}
```

## 类型守卫（Type Guards）

### 什么是类型守卫？

类型守卫是一种表达式，它在运行时检查类型，并在特定作用域内缩小类型的范围。

### typeof 类型守卫

```typescript
// typeof 类型守卫
function processValue(value: string | number | boolean): string {
    if (typeof value === "string") {
        // 这里value被缩小为string类型
        return value.toUpperCase();
    } else if (typeof value === "number") {
        // 这里value被缩小为number类型
        return value.toFixed(2);
    } else {
        // 这里value被缩小为boolean类型
        return value ? "true" : "false";
    }
}
```

### instanceof 类型守卫

```typescript
// instanceof 类型守卫
class Bird {
    fly() {
        console.log("Flying...");
    }
    
    layEggs() {
        console.log("Laying eggs...");
    }
}

class Fish {
    swim() {
        console.log("Swimming...");
    }
    
    layEggs() {
        console.log("Laying eggs...");
    }
}

function moveAnimal(animal: Bird | Fish): void {
    if (animal instanceof Bird) {
        animal.fly();  // 类型被缩小为Bird
    } else {
        animal.swim(); // 类型被缩小为Fish
    }
}
```

### 自定义类型守卫

```typescript
// 自定义类型守卫函数
interface Cat {
    meow(): void;
    purr(): void;
}

interface Dog {
    bark(): void;
    fetch(): void;
}

// 自定义类型守卫
function isCat(animal: Cat | Dog): animal is Cat {
    return (animal as Cat).meow !== undefined;
}

function handleAnimal(animal: Cat | Dog): void {
    if (isCat(animal)) {
        animal.meow();  // 类型被缩小为Cat
        animal.purr();
    } else {
        animal.bark();  // 类型被缩小为Dog
        animal.fetch();
    }
}
```

### in 操作符类型守卫

```typescript
// in 操作符类型守卫
interface Fish {
    swim(): void;
}

interface Bird {
    fly(): void;
}

function move(animal: Fish | Bird): void {
    if ("swim" in animal) {
        animal.swim();  // 类型被缩小为Fish
    } else {
        animal.fly();   // 类型被缩小为Bird
    }
}
```

## 可辨识联合（Discriminated Unions）

### 什么是可辨识联合？

可辨识联合是TypeScript中一种模式，它结合了联合类型、字面量类型和类型守卫，用于创建可区分的类型联合。

### 基本语法

```typescript
// 可辨识联合的基本结构
interface Circle {
    kind: "circle";  // 可辨识属性（标签）
    radius: number;
}

interface Rectangle {
    kind: "rectangle";  // 可辨识属性（标签）
    width: number;
    height: number;
}

interface Triangle {
    kind: "triangle";  // 可辨识属性（标签）
    base: number;
    height: number;
}

type Shape = Circle | Rectangle | Triangle;
```

### 使用可辨识联合

```typescript
// 使用可辨识联合
function calculateArea(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2;
        case "rectangle":
            return shape.width * shape.height;
        case "triangle":
            return (shape.base * shape.height) / 2;
        default:
            // 穷尽性检查
            const _exhaustiveCheck: never = shape;
            return _exhaustiveCheck;
    }
}

// 使用示例
const circle: Circle = { kind: "circle", radius: 5 };
const rectangle: Rectangle = { kind: "rectangle", width: 10, height: 20 };
const triangle: Triangle = { kind: "triangle", base: 10, height: 15 };

console.log("Circle area:", calculateArea(circle));
console.log("Rectangle area:", calculateArea(rectangle));
console.log("Triangle area:", calculateArea(triangle));
```

### 可辨识联合的实际应用

```typescript
// 动作系统
interface LoadAction {
    type: "LOAD";
    payload: { url: string };
}

interface SuccessAction {
    type: "SUCCESS";
    payload: { data: any };
}

interface ErrorAction {
    type: "ERROR";
    payload: { error: string };
}

type Action = LoadAction | SuccessAction | ErrorAction;

function reducer(state: any, action: Action): any {
    switch (action.type) {
        case "LOAD":
            return { ...state, loading: true };
        case "SUCCESS":
            return { ...state, loading: false, data: action.payload.data };
        case "ERROR":
            return { ...state, loading: false, error: action.payload.error };
        default:
            const _exhaustiveCheck: never = action;
            return _exhaustiveCheck;
    }
}
```

## 类型别名 vs 接口

### 类型别名（Type Alias）

```typescript
// 类型别名
type StringOrNumber = string | number;
type Point = { x: number; y: number };
type Callback = (data: string) => void;
type Pair<T> = [T, T];

// 类型别名可以使用联合类型、交叉类型等
type Shape = 
    | { kind: "circle"; radius: number }
    | { kind: "rectangle"; width: number; height: number };

// 类型别名可以定义函数类型
type MathOperation = (a: number, b: number) => number;
const add: MathOperation = (a, b) => a + b;
const subtract: MathOperation = (a, b) => a - b;
```

### 接口（Interface）

```typescript
// 接口
interface Point {
    x: number;
    y: number;
}

// 接口可以扩展
interface ThreeDPoint extends Point {
    z: number;
}

// 接口可以合并声明
interface Window {
    title: string;
}

interface Window {
    size: number;
}

// 合并后的Window接口
// { title: string; size: number }
```

### 主要区别

```typescript
// 1. 类型别名可以定义联合类型，接口不行
type StringOrNumber = string | number;
// interface 不能这样写

// 2. 接口可以合并声明，类型别名不行
interface User {
    name: string;
}

interface User {
    age: number;
}

// 3. 类型别名可以定义元组类型
type Tuple = [string, number];

// 4. 类型别名可以使用typeof操作符
const obj = { x: 10, y: 20 };
type ObjType = typeof obj;

// 5. 接口可以extends，类型别名使用交叉类型
interface Base {
    id: number;
}

interface Extended extends Base {
    name: string;
}

// 类型别名使用交叉类型
type ExtendedType = Base & { name: string };
```

### 何时使用哪个？

```typescript
// 使用接口的情况：
// 1. 定义对象形状
interface User {
    id: number;
    name: string;
    email: string;
}

// 2. 需要声明合并
interface Window {
    myCustomProperty: string;
}

// 3. 需要扩展
interface Admin extends User {
    permissions: string[];
}

// 使用类型别名的情况：
// 1. 联合类型
type Status = "pending" | "active" | "inactive";

// 2. 元组类型
type Pair = [number, number];

// 3. 函数类型
type Handler = (event: Event) => void;

// 4. 复杂类型组合
type Result<T> = 
    | { success: true; data: T }
    | { success: false; error: string };
```

## 映射类型（Mapped Types）

### 什么是映射类型？

映射类型允许你通过映射现有类型来创建新类型。它们基于索引签名语法。

### 基本语法

```typescript
// 基本映射类型
type Keys = "a" | "b" | "c";
type Flags = { [K in Keys]: boolean };

// 等价于：
// type Flags = {
//     a: boolean;
//     b: boolean;
//     c: boolean;
// }

const flags: Flags = {
    a: true,
    b: false,
    c: true
};
```

### 内置映射类型

```typescript
// Partial<T> - 所有属性变为可选
interface User {
    id: number;
    name: string;
    email: string;
}

type PartialUser = Partial<User>;
// {
//     id?: number;
//     name?: string;
//     email?: string;
// }

// Required<T> - 所有属性变为必需
interface PartialUser {
    id?: number;
    name?: string;
}

type RequiredUser = Required<PartialUser>;
// {
//     id: number;
//     name: string;
// }

// Readonly<T> - 所有属性变为只读
type ReadonlyUser = Readonly<User>;
// {
//     readonly id: number;
//     readonly name: string;
//     readonly email: string;
// }

// Pick<T, K> - 选取指定属性
type UserBasic = Pick<User, "id" | "name">;
// {
//     id: number;
//     name: string;
// }

// Omit<T, K> - 排除指定属性
type UserWithoutEmail = Omit<User, "email">;
// {
//     id: number;
//     name: string;
// }
```

### 自定义映射类型

```typescript
// 自定义映射类型
type Nullable<T> = { [K in keyof T]: T[K] | null };
type Optional<T> = { [K in keyof T]?: T[K] };
type ReadonlyDeep<T> = { readonly [K in keyof T]: T[K] };

interface User {
    id: number;
    name: string;
    address: {
        city: string;
        zip: string;
    };
}

type NullableUser = Nullable<User>;
// {
//     id: number | null;
//     name: string | null;
//     address: { city: string; zip: string; } | null;
// }

type ReadonlyUser = Readonly<User>;
// {
//     readonly id: number;
//     readonly name: string;
//     readonly address: { city: string; zip: string; };
// }
```

### 条件映射类型

```typescript
// 条件映射类型
type NullableProperties<T> = {
    [K in keyof T]: T[K] extends string | number ? T[K] | null : T[K];
};

interface Data {
    id: number;
    name: string;
    active: boolean;
    tags: string[];
}

type NullableData = NullableProperties<Data>;
// {
//     id: number | null;
//     name: string | null;
//     active: boolean;  // 保持不变
//     tags: string[];   // 保持不变
// }
```

## 条件类型（Conditional Types）

### 什么是条件类型？

条件类型根据条件选择类型，类似于三元运算符。

### 基本语法

```typescript
// 基本条件类型
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
type C = IsString<"hello">; // true
```

### 条件类型的实际应用

```typescript
// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

function getString(): string {
    return "hello";
}

function getNumber(): number {
    return 42;
}

type StringReturn = ReturnType<typeof getString>;  // string
type NumberReturn = ReturnType<typeof getNumber>;  // number

// 提取函数参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : any;

function greet(name: string, age: number): void {
    console.log(`Hello, ${name}. You are ${age} years old.`);
}

type GreetParams = Parameters<typeof greet>;  // [name: string, age: number]

// 提取Promise的类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type A = UnwrapPromise<Promise<string>>;  // string
type B = UnwrapPromise<Promise<number>>;  // number
type C = UnwrapPromise<string>;          // string（不是Promise）
```

### 分布式条件类型

```typescript
// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;

type A = ToArray<string | number>;  // string[] | number[]

// 等价于：
// ToArray<string> | ToArray<number>
// string[] | number[]

// 更复杂的例子
type NonNullable<T> = T extends null | undefined ? never : T;

type A = NonNullable<string | null | undefined>;  // string
type B = NonNullable<number | null>;              // number

// 提取联合类型中的特定类型
type Extract<T, U> = T extends U ? T : never;

type A = Extract<string | number | boolean, string>;  // string
type B = Extract<string | number | boolean, number>;  // number

// 排除联合类型中的特定类型
type Exclude<T, U> = T extends U ? never : T;

type A = Exclude<string | number | boolean, string>;  // number | boolean
type B = Exclude<string | number | boolean, boolean>; // string | number
```

### 条件类型与映射类型结合

```typescript
// 条件类型与映射类型结合
type NullableStringProperties<T> = {
    [K in keyof T]: T[K] extends string ? T[K] | null : T[K];
};

interface User {
    id: number;
    name: string;
    email: string;
    active: boolean;
}

type NullableStringUser = NullableStringProperties<User>;
// {
//     id: number;
//     name: string | null;
//     email: string | null;
//     active: boolean;
// }

// 提取对象中的函数类型
type FunctionProperties<T> = {
    [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

interface Example {
    id: number;
    name: string;
    greet(): void;
    calculate(x: number): number;
}

type ExampleFunctions = FunctionProperties<Example>;
// {
//     greet(): void;
//     calculate(x: number): number;
// }
```

## 示例代码说明

本项目包含以下示例代码文件：

1. **union-types.ts** - 联合类型的各种用法示例
2. **type-guards.ts** - 类型守卫的实现和应用
3. **mapped-types.ts** - 映射类型和条件类型示例

### 运行示例

```bash
# 运行联合类型示例
deno run union-types.ts

# 运行类型守卫示例
deno run type-guards.ts

# 运行映射类型示例
deno run mapped-types.ts
```

## 练习题

### 练习1：联合类型

定义一个函数 `formatValue`，它接受 `string | number | boolean` 类型的参数，并根据类型返回格式化的字符串：

```typescript
function formatValue(value: string | number | boolean): string {
    // 你的实现
}

// 测试用例
formatValue("hello")    // "String: hello"
formatValue(42)         // "Number: 42.00"
formatValue(true)       // "Boolean: true"
```

### 练习2：可辨识联合

实现一个处理不同形状的系统：

```typescript
interface Circle {
    kind: "circle";
    radius: number;
}

interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}

interface Triangle {
    kind: "triangle";
    base: number;
    height: number;
}

type Shape = Circle | Rectangle | Triangle;

// 1. 实现计算面积函数
function calculateArea(shape: Shape): number {
    // 你的实现
}

// 2. 实现计算周长函数
function calculatePerimeter(shape: Shape): number {
    // 你的实现
}

// 3. 实现形状描述函数
function describeShape(shape: Shape): string {
    // 你的实现
}
```

### 练习3：类型守卫

实现自定义类型守卫函数：

```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

interface Admin extends User {
    permissions: string[];
}

interface Guest {
    sessionId: string;
}

type Person = User | Admin | Guest;

// 1. 实现isAdmin类型守卫
function isAdmin(person: Person): person is Admin {
    // 你的实现
}

// 2. 实现isUser类型守卫
function isUser(person: Person): person is User {
    // 你的实现
}

// 3. 实现处理函数
function handlePerson(person: Person): void {
    // 使用类型守卫处理不同类型的Person
}
```

### 练习4：映射类型

使用映射类型创建工具类型：

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
}

// 1. 创建UserPreview类型（只包含id, name, email）
type UserPreview = Pick<User, "id" | "name" | "email">;

// 2. 创建UserUpdate类型（所有属性可选，除了id）
type UserUpdate = Partial<Omit<User, "id">> & Pick<User, "id">;

// 3. 创建UserCreate类型（排除id和createdAt）
type UserCreate = Omit<User, "id" | "createdAt">;

// 4. 创建NullableUser类型（所有属性可为null）
type NullableUser = { [K in keyof User]: User[K] | null };
```

### 练习5：条件类型

使用条件类型实现类型工具：

```typescript
// 1. 实现IsArray类型
type IsArray<T> = T extends Array<any> ? true : false;

// 2. 实现ElementType类型（提取数组元素类型）
type ElementType<T> = T extends Array<infer E> ? E : never;

// 3. 实现Flatten类型（扁平化嵌套数组）
type Flatten<T> = T extends Array<infer E> ? Flatten<E> : T;

// 4. 实现RequiredKeys类型（提取必需属性的键）
type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

// 测试用例
type A = IsArray<string[]>;      // true
type B = IsArray<string>;        // false
type C = ElementType<number[]>;  // number
type D = Flatten<number[][][]>;  // number
type E = RequiredKeys<{ a?: string; b: number; c?: boolean }>;  // "b"
```

## 总结

高级类型是TypeScript类型系统的核心特性，它们提供了：

1. **联合类型**：表示多种可能的类型
2. **交叉类型**：组合多个类型
3. **类型守卫**：在运行时缩小类型范围
4. **可辨识联合**：创建可区分的类型联合
5. **映射类型**：基于现有类型创建新类型
6. **条件类型**：根据条件选择类型

掌握这些高级类型特性对于编写健壮、可维护的TypeScript代码至关重要。

## 下一步

- 学习 [模块和命名空间](../06-modules/)
- 了解 [泛型编程](../04-generics/)
- 探索 [异步编程](../07-async/)


---

## 项目导航

[上一个项目：泛型编程](/projects/04-generics/)

[下一个项目：模块和命名空间](/projects/06-modules/)

[返回学习路径](/learning-path/)
