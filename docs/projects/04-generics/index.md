# TypeScript 泛型编程

## 泛型概念介绍

### 什么是泛型？

泛型（Generics）是TypeScript中一种强大的类型系统特性，它允许我们在定义函数、接口或类时，不预先指定具体的类型，而是在使用时再指定类型。泛型可以理解为类型的"参数化"。

### 为什么需要泛型？

在JavaScript中，我们经常需要编写能够处理多种类型的函数。例如：

```javascript
// JavaScript - 没有类型检查
function identity(value) {
    return value;
}

// 可能导致运行时错误
const result = identity("hello").length;  // 正常
const numResult = identity(42).length;    // 运行时错误！
```

在TypeScript中，如果没有泛型，我们可能会这样写：

```typescript
// TypeScript - 使用any类型，失去类型安全
function identity(value: any): any {
    return value;
}

// 编译器无法帮助我们检查类型
const result = identity("hello");  // result类型是any
console.log(result.length);        // 无法检查length是否存在
```

### 泛型的优势

1. **类型安全**：在编译时检查类型，避免运行时错误
2. **代码复用**：编写一次，适用于多种类型
3. **类型推断**：编译器可以自动推断类型参数
4. **可读性**：代码意图更清晰

### TypeScript与JavaScript的区别

| 特性 | JavaScript | TypeScript |
|------|------------|------------|
| 类型系统 | 动态类型 | 静态类型 |
| 泛型支持 | 不支持 | 完全支持 |
| 类型检查 | 运行时 | 编译时 |
| 代码复用 | 通过any或手动检查 | 通过泛型 |

## 泛型函数

### 基本泛型函数

泛型函数使用类型参数 `<T>` 来表示函数参数和返回值的类型关系：

```typescript
// 基本的泛型函数
function identity<T>(value: T): T {
    return value;
}

// 使用方式1：显式指定类型
const stringResult = identity<string>("hello");  // string
const numberResult = identity<number>(42);       // number

// 使用方式2：类型推断（推荐）
const inferredString = identity("hello");  // TypeScript推断为string
const inferredNumber = identity(42);       // TypeScript推断为number
```

### 多个类型参数

函数可以有多个类型参数：

```typescript
// 两个类型参数的函数
function pair<T, U>(first: T, second: U): [T, U] {
    return [first, second];
}

const pair1 = pair("hello", 42);      // [string, number]
const pair2 = pair(true, "world");    // [boolean, string]

// 显式指定类型
const pair3 = pair<number, string>(100, "test");
```

### 泛型函数的实际应用

```typescript
// 数组处理函数
function firstElement<T>(arr: T[]): T | undefined {
    return arr[0];
}

function lastElement<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
}

// 使用示例
const numbers = [1, 2, 3, 4, 5];
const first = firstElement(numbers);  // number | undefined
const last = lastElement(numbers);   // number | undefined

const strings = ["apple", "banana", "cherry"];
const firstString = firstElement(strings);  // string | undefined

// 映射函数
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
    return arr.map(fn);
}

const doubled = map([1, 2, 3], x => x * 2);  // number[]
const lengths = map(["hello", "world"], s => s.length);  // number[]
```

## 泛型接口

### 定义泛型接口

泛型接口可以用来定义对象的形状，其中包含类型参数：

```typescript
// 泛型接口定义
interface GenericIdentityFn<T> {
    (value: T): T;
}

// 使用泛型接口
function identity<T>(value: T): T {
    return value;
}

// 将函数赋值给泛型接口
const myIdentity: GenericIdentityFn<number> = identity;

// 泛型接口用于对象
interface Box<T> {
    value: T;
    getValue(): T;
    setValue(newValue: T): void;
}

// 实现泛型接口
class NumberBox implements Box<number> {
    private _value: number = 0;
    
    getValue(): number {
        return this._value;
    }
    
    setValue(newValue: number): void {
        this._value = newValue;
    }
}
```

### 多类型参数的接口

```typescript
// 多个类型参数的接口
interface KeyValuePair<K, V> {
    key: K;
    value: V;
}

// 使用示例
const pair1: KeyValuePair<string, number> = { key: "age", value: 25 };
const pair2: KeyValuePair<number, boolean> = { key: 1, value: true };

// 泛型接口继承
interface NumericKeyValuePair<V> extends KeyValuePair<number, V> {
    // 自动继承key: number, value: V
    precision?: number;
}

const numericPair: NumericKeyValuePair<string> = {
    key: 1,
    value: "test",
    precision: 2
};
```

### 泛型接口的实际应用

```typescript
// 响应接口
interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
    timestamp: Date;
}

// 用户数据接口
interface User {
    id: number;
    name: string;
    email: string;
}

// 产品数据接口
interface Product {
    id: number;
    name: string;
    price: number;
}

// 使用泛型接口
const userResponse: ApiResponse<User> = {
    data: { id: 1, name: "Alice", email: "alice@example.com" },
    status: 200,
    message: "Success",
    timestamp: new Date()
};

const productResponse: ApiResponse<Product> = {
    data: { id: 101, name: "Laptop", price: 999.99 },
    status: 200,
    message: "Success",
    timestamp: new Date()
};
```

## 泛型类

### 基本泛型类

泛型类使用类型参数来定义类的属性和方法的类型：

```typescript
// 泛型类定义
class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
    
    constructor(zeroValue: T, addFn: (x: T, y: T) => T) {
        this.zeroValue = zeroValue;
        this.add = addFn;
    }
}

// 使用泛型类
const myGenericNumber = new GenericNumber<number>(0, (x, y) => x + y);
console.log(myGenericNumber.add(5, 10));  // 15

const stringNumeric = new GenericNumber<string>("", (x, y) => x + y);
console.log(stringNumeric.add("Hello", " World"));  // "Hello World"
```

### 泛型类的实际应用

```typescript
// 泛型栈实现
class Stack<T> {
    private items: T[] = [];
    
    push(item: T): void {
        this.items.push(item);
    }
    
    pop(): T | undefined {
        return this.items.pop();
    }
    
    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }
    
    isEmpty(): boolean {
        return this.items.length === 0;
    }
    
    size(): number {
        return this.items.length;
    }
    
    clear(): void {
        this.items = [];
    }
}

// 使用泛型栈
const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
numberStack.push(3);
console.log(numberStack.pop());  // 3

const stringStack = new Stack<string>();
stringStack.push("hello");
stringStack.push("world");
console.log(stringStack.peek());  // "world"

// 泛型队列实现
class Queue<T> {
    private items: T[] = [];
    
    enqueue(item: T): void {
        this.items.push(item);
    }
    
    dequeue(): T | undefined {
        return this.items.shift();
    }
    
    front(): T | undefined {
        return this.items[0];
    }
    
    isEmpty(): boolean {
        return this.items.length === 0;
    }
    
    size(): number {
        return this.items.length;
    }
}
```

### 泛型类与继承

```typescript
// 基类
class Base<T> {
    protected data: T;
    
    constructor(data: T) {
        this.data = data;
    }
    
    getData(): T {
        return this.data;
    }
}

// 继承泛型类
class Derived<T> extends Base<T> {
    private extra: string;
    
    constructor(data: T, extra: string) {
        super(data);
        this.extra = extra;
    }
    
    getExtra(): string {
        return this.extra;
    }
    
    // 可以重写方法
    getData(): T {
        console.log("Derived getData called");
        return this.data;
    }
}

// 使用
const derived = new Derived<number>(42, "extra info");
console.log(derived.getData());   // 42
console.log(derived.getExtra());  // "extra info"
```

## 泛型约束（extends）

### 基本泛型约束

有时候我们需要限制泛型参数必须具有某些属性或方法，这时可以使用泛型约束：

```typescript
// 定义约束接口
interface HasLength {
    length: number;
}

// 使用extends进行约束
function logLength<T extends HasLength>(value: T): T {
    console.log(`Length: ${value.length}`);
    return value;
}

// 有效调用
logLength("hello");           // string有length属性
logLength([1, 2, 3]);        // 数组有length属性
logLength({ length: 10 });   // 对象有length属性

// 无效调用（编译错误）
// logLength(123);           // number没有length属性
// logLength(true);          // boolean没有length属性
```

### keyof约束

使用keyof操作符进行约束，确保属性名存在于对象中：

```typescript
// keyof约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

// 使用示例
const person = { name: "Alice", age: 30, city: "New York" };

const name = getProperty(person, "name");   // string
const age = getProperty(person, "age");     // number
const city = getProperty(person, "city");   // string

// 无效调用（编译错误）
// const invalid = getProperty(person, "email");  // "email"不存在于person中
```

### 复杂的泛型约束

```typescript
// 多个约束条件
interface Printable {
    print(): void;
}

interface Loggable {
    log(message: string): void;
}

// 同时满足多个约束
function process<T extends Printable & Loggable>(item: T): void {
    item.print();
    item.log("Processing...");
}

// 实现约束接口
class Document implements Printable, Loggable {
    constructor(private content: string) {}
    
    print(): void {
        console.log(`Document: ${this.content}`);
    }
    
    log(message: string): void {
        console.log(`[${new Date().toISOString()}] ${message}`);
    }
}

// 使用
const doc = new Document("Hello World");
process(doc);  // 有效
```

### 条件约束

```typescript
// 条件约束示例
type IsString<T> = T extends string ? true : false;

// 条件类型约束
function processValue<T>(value: T): T extends string ? string : number {
    if (typeof value === "string") {
        return value.toUpperCase() as any;
    } else {
        return (value as any) * 2;
    }
}

// 使用
const result1 = processValue("hello");  // 类型是string
const result2 = processValue(42);       // 类型是number
```

## 泛型默认类型

### 基本默认类型

泛型可以指定默认类型，当没有显式指定类型时使用默认值：

```typescript
// 带默认类型的泛型接口
interface ApiResponse<T = any> {
    data: T;
    status: number;
    message: string;
}

// 使用默认类型
const response1: ApiResponse = {
    data: "any data",
    status: 200,
    message: "Success"
};

// 显式指定类型
const response2: ApiResponse<User> = {
    data: { id: 1, name: "Alice", email: "alice@example.com" },
    status: 200,
    message: "Success"
};

// 泛型函数带默认类型
function createArray<T = string>(length: number, defaultValue: T): T[] {
    return new Array(length).fill(defaultValue);
}

// 使用默认类型
const stringArray = createArray(3, "default");  // string[]
const numberArray = createArray<number>(3, 0);  // number[]
```

### 多个默认类型

```typescript
// 多个类型参数带默认值
interface Pair<T = string, U = number> {
    first: T;
    second: U;
}

// 使用各种组合
const pair1: Pair = { first: "hello", second: 42 };           // Pair<string, number>
const pair2: Pair<boolean> = { first: true, second: 42 };     // Pair<boolean, number>
const pair3: Pair<string, boolean> = { first: "hi", second: true };  // Pair<string, boolean>
```

### 默认类型的实际应用

```typescript
// 配置接口
interface Config<T extends Record<string, any> = Record<string, any>> {
    name: string;
    version: string;
    settings: T;
}

// 默认配置类型
interface DefaultSettings {
    debug: boolean;
    logLevel: string;
    timeout: number;
}

// 使用默认配置
const defaultConfig: Config = {
    name: "MyApp",
    version: "1.0.0",
    settings: { debug: true }
};

// 使用自定义配置
interface CustomSettings {
    theme: string;
    language: string;
    notifications: boolean;
}

const customConfig: Config<CustomSettings> = {
    name: "MyApp",
    version: "1.0.0",
    settings: {
        theme: "dark",
        language: "zh-CN",
        notifications: true
    }
};
```

## 泛型工具类型

TypeScript提供了许多内置的泛型工具类型，用于常见的类型转换：

### Partial&lt;T&gt;

将类型T的所有属性变为可选：

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

// Partial<User> 等价于：
// {
//     id?: number;
//     name?: string;
//     email?: string;
//     age?: number;
// }

function updateUser(user: User, updates: Partial<User>): User {
    return { ...user, ...updates };
}

const user: User = { id: 1, name: "Alice", email: "alice@example.com", age: 30 };

// 可以只更新部分属性
const updatedUser = updateUser(user, { name: "Bob", age: 31 });
```

### Required&lt;T&gt;

将类型T的所有属性变为必需：

```typescript
interface PartialUser {
    id?: number;
    name?: string;
    email?: string;
}

// Required<PartialUser> 等价于：
// {
//     id: number;
//     name: string;
//     email: string;
// }

function createUser(user: Required<PartialUser>): void {
    console.log(`Creating user: ${user.name}`);
}

// 必须提供所有属性
createUser({ id: 1, name: "Alice", email: "alice@example.com" });
```

### Pick&lt;T, K&gt;

从类型T中选取指定属性K：

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
    address: string;
}

// Pick<User, "id" | "name"> 等价于：
// {
//     id: number;
//     name: string;
// }

type UserBasicInfo = Pick<User, "id" | "name">;

function getBasicInfo(user: User): UserBasicInfo {
    return { id: user.id, name: user.name };
}

const user: User = {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    age: 30,
    address: "123 Main St"
};

const basicInfo = getBasicInfo(user);  // { id: 1, name: "Alice" }
```

### Omit&lt;T, K&gt;

从类型T中排除指定属性K：

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
    address: string;
}

// Omit<User, "id"> 等价于：
// {
//     name: string;
//     email: string;
//     age: number;
//     address: string;
// }

type UserWithoutId = Omit<User, "id">;

function createUser(userData: UserWithoutId): User {
    return { id: Math.random(), ...userData };
}

const newUser = createUser({
    name: "Bob",
    email: "bob@example.com",
    age: 25,
    address: "456 Oak Ave"
});
```

### Record&lt;K, T&gt;

构造一个对象类型，属性键为K，属性值为T：

```typescript
// Record<string, number> 等价于：
// { [key: string]: number }

type StringMap = Record<string, string>;
type NumberMap = Record<string, number>;

const translations: Record<string, string> = {
    hello: "你好",
    world: "世界",
    goodbye: "再见"
};

// 更复杂的用例
type Role = "admin" | "user" | "guest";
type Permissions = Record<Role, string[]>;

const permissions: Permissions = {
    admin: ["read", "write", "delete"],
    user: ["read", "write"],
    guest: ["read"]
};
```

### Readonly&lt;T&gt;

将类型T的所有属性变为只读：

```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

// Readonly<User> 等价于：
// {
//     readonly id: number;
     readonly name: string;
     readonly email: string;
// }

const user: Readonly<User> = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
};

// 不能修改只读属性
// user.name = "Bob";  // 编译错误
```

### ReturnType&lt;T&gt;

获取函数类型T的返回类型：

```typescript
function createUser(name: string, age: number) {
    return { id: Math.random(), name, age, createdAt: new Date() };
}

// ReturnType<typeof createUser> 等价于：
// { id: number; name: string; age: number; createdAt: Date }

type User = ReturnType<typeof createUser>;

const newUser: User = createUser("Alice", 30);
```

### Parameters&lt;T&gt;

获取函数类型T的参数类型组成的元组：

```typescript
function createUser(name: string, age: number, email?: string) {
    return { id: Math.random(), name, age, email };
}

// Parameters<typeof createUser> 等价于：
// [name: string, age: number, email?: string | undefined]

type CreateUserParams = Parameters<typeof createUser>;

// 使用参数类型
const params: CreateUserParams = ["Alice", 30, "alice@example.com"];
createUser(...params);
```

## 示例代码说明

本项目包含以下示例代码文件：

1. **generic-functions.ts** - 泛型函数的各种用法示例
2. **generic-interfaces.ts** - 泛型接口的定义和使用
3. **generic-classes.ts** - 泛型类的实现和应用

### 运行示例

```bash
# 运行泛型函数示例
deno run generic-functions.ts

# 运行泛型接口示例
deno run generic-interfaces.ts

# 运行泛型类示例
deno run generic-classes.ts
```

## 练习题

### 练习1：基础泛型函数

编写一个泛型函数 `mergeObjects`，接受两个对象并返回它们的合并结果：

```typescript
function mergeObjects<T, U>(obj1: T, obj2: U): T & U {
    // 你的实现
}

// 测试用例
const obj1 = { name: "Alice" };
const obj2 = { age: 30 };
const merged = mergeObjects(obj1, obj2);  // 应该有name和age属性
```

### 练习2：泛型栈实现

扩展示例中的 `Stack` 类，添加以下方法：

```typescript
class Stack<T> {
    // 现有方法...
    
    // 1. 添加 toArray 方法
    toArray(): T[];
    
    // 2. 添加 contains 方法
    contains(item: T): boolean;
    
    // 3. 添加 forEach 方法
    forEach(callback: (item: T, index: number) => void): void;
}
```

### 练习3：泛型工具类型

使用泛型工具类型完成以下任务：

```typescript
interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    inStock: boolean;
}

// 1. 创建 ProductPreview 类型（只包含id, name, price）
type ProductPreview = Pick<Product, "id" | "name" | "price">;

// 2. 创建 ProductUpdate 类型（所有属性可选，除了id）
type ProductUpdate = Partial<Omit<Product, "id">> & Pick<Product, "id">;

// 3. 创建一个函数，接受 ProductPreview 和 ProductUpdate
function updateProduct(
    preview: ProductPreview,
    updates: ProductUpdate
): Product {
    // 你的实现
}
```

### 练习4：泛型约束

编写一个泛型函数 `getProperty`，它能够安全地访问对象的嵌套属性：

```typescript
function getNestedProperty<T, K1 extends keyof T, K2 extends keyof T[K1]>(
    obj: T,
    key1: K1,
    key2: K2
): T[K1][K2] {
    // 你的实现
}

// 测试用例
const user = {
    profile: {
        name: "Alice",
        address: {
            city: "New York",
            zipCode: "10001"
        }
    },
    settings: {
        theme: "dark"
    }
};

const cityName = getNestedProperty(user, "profile", "address");  // 应该工作
// const invalid = getNestedProperty(user, "profile", "theme");  // 应该报错
```

### 练习5：泛型类应用

实现一个泛型的 `Repository` 类，用于模拟数据库操作：

```typescript
interface Entity {
    id: number;
}

class Repository<T extends Entity> {
    private items: T[] = [];
    
    // 1. 添加 add 方法
    add(item: T): void;
    
    // 2. 添加 findById 方法
    findById(id: number): T | undefined;
    
    // 3. 添加 findAll 方法
    findAll(): T[];
    
    // 4. 添加 update 方法
    update(id: number, updates: Partial<T>): T | undefined;
    
    // 5. 添加 delete 方法
    delete(id: number): boolean;
}

// 测试用例
interface User extends Entity {
    name: string;
    email: string;
}

const userRepo = new Repository<User>();
userRepo.add({ id: 1, name: "Alice", email: "alice@example.com" });
const user = userRepo.findById(1);
```

## 总结

泛型是TypeScript中非常强大的特性，它提供了：

1. **类型安全**：在编译时捕获类型错误
2. **代码复用**：编写通用的、可重用的代码
3. **灵活性**：适用于多种类型
4. **可维护性**：代码更清晰，意图更明确

掌握泛型对于编写高质量的TypeScript代码至关重要。通过练习和实际应用，你将能够熟练使用泛型来构建健壮的、可扩展的应用程序。

## 下一步

- 学习 [高级类型](../05-advanced-types/)
- 了解 [模块和命名空间](../06-modules/)
- 探索 [异步编程](../07-async/)


---

## 项目导航

[上一个项目：类和面向对象](/projects/03-classes/)

[下一个项目：高级类型](/projects/05-advanced-types/)

[返回学习路径](/learning-path/)
