/**
 * TypeScript 泛型函数示例
 * 本文件演示了泛型函数的各种用法和实际应用场景
 * 运行环境：Deno
 */

// ==================== 基本泛型函数 ====================

/**
 * 基本的泛型函数 - 恒等函数
 * @param value - 任意类型的值
 * @returns 相同类型的值
 */
function identity<T>(value: T): T {
    return value;
}

// 显式指定类型
const stringResult = identity<string>("hello");
const numberResult = identity<number>(42);
const booleanResult = identity<boolean>(true);

// 类型推断（推荐）
const inferredString = identity("hello");  // TypeScript推断为string
const inferredNumber = identity(42);       // TypeScript推断为number

console.log("=== 基本泛型函数 ===");
console.log("stringResult:", stringResult);
console.log("numberResult:", numberResult);
console.log("booleanResult:", booleanResult);
console.log("inferredString:", inferredString);
console.log("inferredNumber:", inferredNumber);

// ==================== 多个类型参数 ====================

/**
 * 接受两个参数的泛型函数，返回元组
 * @param first - 第一个参数
 * @param second - 第二个参数
 * @returns 包含两个参数的元组
 */
function pair<T, U>(first: T, second: U): [T, U] {
    return [first, second];
}

const pair1 = pair("hello", 42);      // [string, number]
const pair2 = pair(true, "world");    // [boolean, string]
const pair3 = pair(100, false);       // [number, boolean]

console.log("\n=== 多个类型参数 ===");
console.log("pair1:", pair1);
console.log("pair2:", pair2);
console.log("pair3:", pair3);

// ==================== 泛型数组函数 ====================

/**
 * 获取数组的第一个元素
 * @param arr - 泛型数组
 * @returns 数组的第一个元素或undefined
 */
function firstElement<T>(arr: T[]): T | undefined {
    return arr[0];
}

/**
 * 获取数组的最后一个元素
 * @param arr - 泛型数组
 * @returns 数组的最后一个元素或undefined
 */
function lastElement<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
}

/**
 * 映射数组中的每个元素
 * @param arr - 原始数组
 * @param fn - 映射函数
 * @returns 映射后的新数组
 */
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
    return arr.map(fn);
}

/**
 * 过滤数组中的元素
 * @param arr - 原始数组
 * @param predicate - 过滤谓词函数
 * @returns 过滤后的新数组
 */
function filter<T>(arr: T[], predicate: (item: T) => boolean): T[] {
    return arr.filter(predicate);
}

/**
 * 查找数组中满足条件的第一个元素
 * @param arr - 原始数组
 * @param predicate - 查找谓词函数
 * @returns 找到的元素或undefined
 */
function find<T>(arr: T[], predicate: (item: T) => boolean): T | undefined {
    return arr.find(predicate);
}

console.log("\n=== 泛型数组函数 ===");

// 使用示例
const numbers = [1, 2, 3, 4, 5];
const strings = ["apple", "banana", "cherry", "date"];
const mixed = [1, "hello", true, 42, "world"];

console.log("firstElement(numbers):", firstElement(numbers));
console.log("lastElement(strings):", lastElement(strings));

// 映射操作
const doubled = map(numbers, x => x * 2);
const lengths = map(strings, s => s.length);
console.log("doubled:", doubled);
console.log("lengths:", lengths);

// 过滤操作
const evenNumbers = filter(numbers, x => x % 2 === 0);
const longStrings = filter(strings, s => s.length > 5);
console.log("evenNumbers:", evenNumbers);
console.log("longStrings:", longStrings);

// 查找操作
const foundNumber = find(numbers, x => x > 3);
const foundString = find(strings, s => s.startsWith("b"));
console.log("foundNumber (>3):", foundNumber);
console.log("foundString (starts with 'b'):", foundString);

// ==================== 泛型约束 ====================

/**
 * 具有length属性的类型约束
 */
interface HasLength {
    length: number;
}

/**
 * 获取具有length属性的值的长度
 * @param value - 具有length属性的值
 * @returns 原始值（用于链式调用）
 */
function logLength<T extends HasLength>(value: T): T {
    console.log(`Length: ${value.length}`);
    return value;
}

console.log("\n=== 泛型约束 ===");

// 有效调用
logLength("hello");           // string有length属性
logLength([1, 2, 3]);        // 数组有length属性
logLength({ length: 10 });   // 对象有length属性

// 无效调用（编译错误）
// logLength(123);           // number没有length属性
// logLength(true);          // boolean没有length属性

/**
 * keyof约束 - 安全地访问对象属性
 * @param obj - 对象
 * @param key - 对象的键
 * @returns 对应键的值
 */
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

console.log("\n=== keyof约束 ===");

const person = { name: "Alice", age: 30, city: "New York" };

const name = getProperty(person, "name");   // string
const age = getProperty(person, "age");     // number
const city = getProperty(person, "city");   // string

console.log("name:", name);
console.log("age:", age);
console.log("city:", city);

// 无效调用（编译错误）
// const invalid = getProperty(person, "email");  // "email"不存在于person中

// ==================== 泛型默认类型 ====================

/**
 * 带默认类型的泛型函数
 * @param length - 数组长度
 * @param defaultValue - 默认值（默认为字符串"default"）
 * @returns 泛型数组
 */
function createArray<T = string>(length: number, defaultValue: T): T[] {
    return new Array(length).fill(defaultValue);
}

console.log("\n=== 泛型默认类型 ===");

// 使用默认类型
const stringArray = createArray(3, "default");
console.log("stringArray:", stringArray);

// 显式指定类型
const numberArray = createArray<number>(3, 0);
console.log("numberArray:", numberArray);

const booleanArray = createArray<boolean>(2, true);
console.log("booleanArray:", booleanArray);

// ==================== 泛型工具函数 ====================

/**
 * 合并两个对象
 * @param obj1 - 第一个对象
 * @param obj2 - 第二个对象
 * @returns 合并后的新对象
 */
function mergeObjects<T, U>(obj1: T, obj2: U): T & U {
    return { ...obj1, ...obj2 };
}

/**
 * 将对象转换为键值对数组
 * @param obj - 对象
 * @returns 键值对数组
 */
function objectToPairs<T>(obj: Record<string, T>): [string, T][] {
    return Object.entries(obj);
}

/**
 * 将键值对数组转换为对象
 * @param pairs - 键值对数组
 * @returns 对象
 */
function pairsToObject<T>(pairs: [string, T][]): Record<string, T> {
    return Object.fromEntries(pairs);
}

/**
 * 深拷贝对象
 * @param obj - 要拷贝的对象
 * @returns 深拷贝后的新对象
 */
function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

console.log("\n=== 泛型工具函数 ===");

// 合并对象
const obj1 = { name: "Alice" };
const obj2 = { age: 30, city: "New York" };
const merged = mergeObjects(obj1, obj2);
console.log("merged:", merged);

// 对象转换为键值对
const pairs = objectToPairs({ a: 1, b: 2, c: 3 });
console.log("pairs:", pairs);

// 键值对转换为对象
const backToObject = pairsToObject([["x", 10], ["y", 20]]);
console.log("backToObject:", backToObject);

// 深拷贝
const original = { nested: { value: 42 }, array: [1, 2, 3] };
const cloned = deepClone(original);
cloned.nested.value = 100;
cloned.array.push(4);
console.log("original:", original);
console.log("cloned:", cloned);

// ==================== 泛型回调函数 ====================

/**
 * 处理数组并返回处理结果
 * @param arr - 原始数组
 * @param transform - 转换函数
 * @param combine - 组合函数
 * @returns 处理后的结果
 */
function processArray<T, U, R>(
    arr: T[],
    transform: (item: T) => U,
    combine: (items: U[]) => R
): R {
    const transformed = arr.map(transform);
    return combine(transformed);
}

console.log("\n=== 泛型回调函数 ===");

// 使用示例1：计算数字的平方和
const numbers2 = [1, 2, 3, 4, 5];
const squareSum = processArray(
    numbers2,
    x => x * x,  // 平方
    squares => squares.reduce((sum, x) => sum + x, 0)  // 求和
);
console.log("Square sum:", squareSum);

// 使用示例2：获取字符串长度的最大值
const words = ["apple", "banana", "cherry", "date"];
const maxLength = processArray(
    words,
    s => s.length,  // 获取长度
    lengths => Math.max(...lengths)  // 找最大值
);
console.log("Max length:", maxLength);

// ==================== 泛型异步函数 ====================

/**
 * 模拟异步操作
 * @param value - 任意值
 * @param delay - 延迟时间（毫秒）
 * @returns Promise
 */
function delay<T>(value: T, delay: number = 1000): Promise<T> {
    return new Promise(resolve => {
        setTimeout(() => resolve(value), delay);
    });
}

/**
 * 并行执行多个异步操作
 * @param promises - Promise数组
 * @returns 所有Promise的结果数组
 */
async function parallelAll<T>(promises: Promise<T>[]): Promise<T[]> {
    return Promise.all(promises);
}

console.log("\n=== 泛型异步函数 ===");

// 使用示例
async function demoAsync() {
    // 创建多个异步操作
    const promise1 = delay("Hello", 500);
    const promise2 = delay(42, 300);
    const promise3 = delay(true, 200);
    
    // 并行执行
    const results = await parallelAll([promise1, promise2, promise3]);
    console.log("Async results:", results);
}

// 运行异步示例
demoAsync().catch(console.error);

// ==================== 泛型递归函数 ====================

/**
 * 递归地扁平化嵌套数组
 * @param arr - 嵌套数组
 * @returns 扁平化后的数组
 */
function flatten<T>(arr: (T | T[])[]): T[] {
    const result: T[] = [];
    
    for (const item of arr) {
        if (Array.isArray(item)) {
            result.push(...flatten(item));
        } else {
            result.push(item);
        }
    }
    
    return result;
}

/**
 * 递归地深度合并对象
 * @param target - 目标对象
 * @param source - 源对象
 * @returns 合并后的对象
 */
function deepMerge<T extends Record<string, any>>(
    target: T,
    source: Partial<T>
): T {
    const result = { ...target };
    
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const sourceValue = source[key];
            const targetValue = result[key];
            
            if (
                typeof sourceValue === 'object' && sourceValue !== null &&
                typeof targetValue === 'object' && targetValue !== null &&
                !Array.isArray(sourceValue) && !Array.isArray(targetValue)
            ) {
                result[key] = deepMerge(targetValue, sourceValue);
            } else {
                result[key] = sourceValue as T[Extract<keyof T, string>];
            }
        }
    }
    
    return result;
}

console.log("\n=== 泛型递归函数 ===");

// 扁平化数组
const nestedArray = [1, [2, 3], [4, [5, 6]], 7];
const flatArray = flatten(nestedArray);
console.log("flatArray:", flatArray);

// 深度合并对象
const defaultConfig = {
    database: {
        host: "localhost",
        port: 5432,
        credentials: {
            username: "admin",
            password: "password"
        }
    },
    server: {
        port: 3000,
        debug: false
    }
};

const customConfig = {
    database: {
        host: "production-db.example.com",
        credentials: {
            username: "prod_user"
        }
    },
    server: {
        debug: true
    }
};

const mergedConfig = deepMerge(defaultConfig, customConfig);
console.log("mergedConfig:", mergedConfig);

// ==================== 泛型类型推断示例 ====================

/**
 * 条件类型推断
 * @param value - 输入值
 * @returns 根据输入类型返回不同的结果
 */
function processValue<T>(value: T): T extends string ? string : number {
    if (typeof value === "string") {
        return value.toUpperCase() as any;
    } else {
        return (value as any) * 2;
    }
}

console.log("\n=== 泛型类型推断示例 ===");

const processedString = processValue("hello");  // 类型是string
const processedNumber = processValue(42);        // 类型是number

console.log("processedString:", processedString);
console.log("processedNumber:", processedNumber);

/**
 * 泛型工厂函数
 * @param constructor - 类构造函数
 * @param args - 构造函数参数
 * @returns 类实例
 */
function createInstance<T>(
    constructor: new (...args: any[]) => T,
    ...args: any[]
): T {
    return new constructor(...args);
}

class Person {
    constructor(public name: string, public age: number) {}
    
    greet(): string {
        return `Hello, I'm ${this.name} and I'm ${this.age} years old.`;
    }
}

const alice = createInstance(Person, "Alice", 30);
console.log("alice.greet():", alice.greet());

// ==================== 总结 ====================

console.log("\n=== 泛型函数示例完成 ===");
console.log("泛型函数的主要特点：");
console.log("1. 类型安全：在编译时检查类型");
console.log("2. 代码复用：一次编写，适用于多种类型");
console.log("3. 类型推断：编译器可以自动推断类型");
console.log("4. 灵活性：可以添加约束和默认类型");
