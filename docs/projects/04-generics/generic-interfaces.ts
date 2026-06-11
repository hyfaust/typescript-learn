/**
 * TypeScript 泛型接口示例
 * 本文件演示了泛型接口的定义、使用和实际应用场景
 * 运行环境：Deno
 */

// ==================== 基本泛型接口 ====================

/**
 * 基本的泛型接口 - 恒等函数接口
 * @param T - 类型参数
 */
interface GenericIdentityFn<T> {
    (value: T): T;
}

/**
 * 实现泛型接口的函数
 */
function identity<T>(value: T): T {
    return value;
}

// 将函数赋值给泛型接口
const myIdentity: GenericIdentityFn<number> = identity;

console.log("=== 基本泛型接口 ===");
console.log("myIdentity(42):", myIdentity(42));

/**
 * 带有多个方法的泛型接口
 * @param T - 元素类型
 */
interface Collection<T> {
    add(item: T): void;
    remove(item: T): boolean;
    contains(item: T): boolean;
    size(): number;
    clear(): void;
    toArray(): T[];
}

/**
 * 实现Collection接口的类
 */
class ArrayCollection<T> implements Collection<T> {
    private items: T[] = [];
    
    add(item: T): void {
        if (!this.contains(item)) {
            this.items.push(item);
        }
    }
    
    remove(item: T): boolean {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }
    
    contains(item: T): boolean {
        return this.items.includes(item);
    }
    
    size(): number {
        return this.items.length;
    }
    
    clear(): void {
        this.items = [];
    }
    
    toArray(): T[] {
        return [...this.items];
    }
}

console.log("\n=== 泛型集合接口 ===");

const numberCollection = new ArrayCollection<number>();
numberCollection.add(1);
numberCollection.add(2);
numberCollection.add(3);
numberCollection.add(2);  // 重复，不会添加

console.log("Size:", numberCollection.size());
console.log("Contains 2:", numberCollection.contains(2));
console.log("Array:", numberCollection.toArray());

// ==================== 泛型接口与继承 ====================

/**
 * 基础的键值对接口
 * @param K - 键类型
 * @param V - 值类型
 */
interface KeyValuePair<K, V> {
    key: K;
    value: V;
}

/**
 * 扩展的键值对接口
 * @param V - 值类型
 */
interface NumericKeyValuePair<V> extends KeyValuePair<number, V> {
    precision?: number;
}

/**
 * 带有额外功能的键值对接口
 * @param K - 键类型
 * @param V - 值类型
 */
interface AdvancedKeyValuePair<K, V> extends KeyValuePair<K, V> {
    timestamp: Date;
    metadata?: Record<string, any>;
}

console.log("\n=== 泛型接口继承 ===");

const pair1: KeyValuePair<string, number> = { key: "age", value: 25 };
const pair2: NumericKeyValuePair<string> = { key: 1, value: "test", precision: 2 };
const pair3: AdvancedKeyValuePair<number, boolean> = {
    key: 1,
    value: true,
    timestamp: new Date(),
    metadata: { source: "user input" }
};

console.log("pair1:", pair1);
console.log("pair2:", pair2);
console.log("pair3:", pair3);

// ==================== 泛型接口的实际应用 ====================

/**
 * API响应接口
 * @param T - 响应数据的类型
 */
interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
    timestamp: Date;
}

/**
 * 分页响应接口
 * @param T - 列表项的类型
 */
interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

/**
 * 错误响应接口
 */
interface ErrorResponse {
    error: {
        code: string;
        message: string;
        details?: Record<string, any>;
    };
    status: number;
    timestamp: Date;
}

console.log("\n=== API响应接口 ===");

// 用户数据接口
interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

// 产品数据接口
interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
}

// 使用泛型接口
const userResponse: ApiResponse<User> = {
    data: { id: 1, name: "Alice", email: "alice@example.com" },
    status: 200,
    message: "Success",
    timestamp: new Date()
};

const productResponse: ApiResponse<Product> = {
    data: { id: 101, name: "Laptop", price: 999.99, category: "Electronics", inStock: true },
    status: 200,
    message: "Success",
    timestamp: new Date()
};

const paginatedUsers: PaginatedResponse<User> = {
    data: [
        { id: 1, name: "Alice", email: "alice@example.com" },
        { id: 2, name: "Bob", email: "bob@example.com" }
    ],
    status: 200,
    message: "Success",
    timestamp: new Date(),
    pagination: {
        page: 1,
        pageSize: 10,
        total: 50,
        totalPages: 5
    }
};

console.log("userResponse:", userResponse);
console.log("productResponse:", productResponse);
console.log("paginatedUsers:", paginatedUsers);

// ==================== 泛型接口与函数类型 ====================

/**
 * 比较函数接口
 * @param T - 比较元素的类型
 */
interface Comparator<T> {
    compare(a: T, b: T): number;
}

/**
 * 转换函数接口
 * @param T - 输入类型
 * @param U - 输出类型
 */
interface Transformer<T, U> {
    transform(input: T): U;
}

/**
 * 验证函数接口
 * @param T - 验证元素的类型
 */
interface Validator<T> {
    validate(value: T): ValidationResult;
}

interface ValidationResult {
    valid: boolean;
    errors: string[];
}

console.log("\n=== 泛型函数接口 ===");

// 实现Comparator接口
class NumberComparator implements Comparator<number> {
    compare(a: number, b: number): number {
        return a - b;
    }
}

class StringComparator implements Comparator<string> {
    compare(a: string, b: string): number {
        return a.localeCompare(b);
    }
}

// 实现Transformer接口
class UpperCaseTransformer implements Transformer<string, string> {
    transform(input: string): string {
        return input.toUpperCase();
    }
}

class NumberToStringTransformer implements Transformer<number, string> {
    transform(input: number): string {
        return input.toString();
    }
}

// 使用示例
const numberComp = new NumberComparator();
console.log("numberComp.compare(5, 3):", numberComp.compare(5, 3));

const stringComp = new StringComparator();
console.log("stringComp.compare('apple', 'banana'):", stringComp.compare("apple", "banana"));

const upperTransformer = new UpperCaseTransformer();
console.log("upperTransformer.transform('hello'):", upperTransformer.transform("hello"));

const numToString = new NumberToStringTransformer();
console.log("numToString.transform(42):", numToString.transform(42));

// ==================== 泛型接口与策略模式 ====================

/**
 * 策略接口
 * @param T - 上下文类型
 * @param R - 结果类型
 */
interface Strategy<T, R> {
    execute(context: T): R;
}

/**
 * 排序策略接口
 * @param T - 排序元素的类型
 */
interface SortStrategy<T> {
    sort(items: T[]): T[];
}

/**
 * 过滤策略接口
 * @param T - 过滤元素的类型
 */
interface FilterStrategy<T> {
    filter(items: T[]): T[];
}

console.log("\n=== 泛型策略模式 ===");

// 实现排序策略
class BubbleSortStrategy<T> implements SortStrategy<T> {
    constructor(private comparator: Comparator<T>) {}
    
    sort(items: T[]): T[] {
        const result = [...items];
        const n = result.length;
        
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (this.comparator.compare(result[j], result[j + 1]) > 0) {
                    // 交换元素
                    [result[j], result[j + 1]] = [result[j + 1], result[j]];
                }
            }
        }
        
        return result;
    }
}

// 实现过滤策略
class EvenNumberFilter implements FilterStrategy<number> {
    filter(items: number[]): number[] {
        return items.filter(x => x % 2 === 0);
    }
}

class LongStringFilter implements FilterStrategy<string> {
    constructor(private minLength: number = 5) {}
    
    filter(items: string[]): string[] {
        return items.filter(s => s.length >= this.minLength);
    }
}

// 使用策略模式
const numbers = [5, 2, 8, 1, 9, 3, 7, 4, 6];
const strings = ["apple", "banana", "cherry", "date", "elderberry"];

const numberSorter = new BubbleSortStrategy<number>(new NumberComparator());
const sortedNumbers = numberSorter.sort(numbers);
console.log("Sorted numbers:", sortedNumbers);

const evenFilter = new EvenNumberFilter();
const evenNumbers = evenFilter.filter(numbers);
console.log("Even numbers:", evenNumbers);

const longStringFilter = new LongStringFilter(6);
const longStrings = longStringFilter.filter(strings);
console.log("Long strings:", longStrings);

// ==================== 泛型接口与工厂模式 ====================

/**
 * 工厂接口
 * @param T - 创建的产品类型
 */
interface Factory<T> {
    create(): T;
}

/**
 * 带参数的工厂接口
 * @param T - 创建的产品类型
 * @param P - 参数类型
 */
interface ParameterizedFactory<T, P> {
    create(params: P): T;
}

/**
 * 抽象工厂接口
 */
interface AbstractFactory {
    createUser(): User;
    createProduct(): Product;
}

console.log("\n=== 泛型工厂模式 ===");

// 实现工厂接口
class UserFactory implements Factory<User> {
    private idCounter = 0;
    
    create(): User {
        this.idCounter++;
        return {
            id: this.idCounter,
            name: `User ${this.idCounter}`,
            email: `user${this.idCounter}@example.com`
        };
    }
}

class ProductFactory implements ParameterizedFactory<Product, { name: string; price: number }> {
    private idCounter = 0;
    
    create(params: { name: string; price: number }): Product {
        this.idCounter++;
        return {
            id: this.idCounter,
            name: params.name,
            price: params.price,
            category: "General",
            inStock: true
        };
    }
}

// 使用工厂
const userFactory = new UserFactory();
const user1 = userFactory.create();
const user2 = userFactory.create();

const productFactory = new ProductFactory();
const product1 = productFactory.create({ name: "Widget", price: 9.99 });
const product2 = productFactory.create({ name: "Gadget", price: 19.99 });

console.log("user1:", user1);
console.log("user2:", user2);
console.log("product1:", product1);
console.log("product2:", product2);

// ==================== 泛型接口与观察者模式 ====================

/**
 * 观察者接口
 * @param T - 事件数据的类型
 */
interface Observer<T> {
    update(data: T): void;
}

/**
 * 可观察对象接口
 * @param T - 事件数据的类型
 */
interface Observable<T> {
    subscribe(observer: Observer<T>): void;
    unsubscribe(observer: Observer<T>): void;
    notify(data: T): void;
}

console.log("\n=== 泛型观察者模式 ===");

// 实现可观察对象
class EventEmitter<T> implements Observable<T> {
    private observers: Observer<T>[] = [];
    
    subscribe(observer: Observer<T>): void {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
        }
    }
    
    unsubscribe(observer: Observer<T>): void {
        const index = this.observers.indexOf(observer);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
    }
    
    notify(data: T): void {
        for (const observer of this.observers) {
            observer.update(data);
        }
    }
}

// 实现观察者
class Logger<T> implements Observer<T> {
    update(data: T): void {
        console.log(`[Logger] Received:`, data);
    }
}

class Validator<T> implements Observer<T> {
    private errors: string[] = [];
    
    update(data: T): void {
        console.log(`[Validator] Validating:`, data);
        // 这里可以添加验证逻辑
    }
    
    getErrors(): string[] {
        return this.errors;
    }
}

// 使用观察者模式
interface UserEvent {
    type: "created" | "updated" | "deleted";
    user: User;
    timestamp: Date;
}

const userEmitter = new EventEmitter<UserEvent>();
const logger = new Logger<UserEvent>();
const validator = new Validator<UserEvent>();

userEmitter.subscribe(logger);
userEmitter.subscribe(validator);

// 触发事件
userEmitter.notify({
    type: "created",
    user: { id: 1, name: "Alice", email: "alice@example.com" },
    timestamp: new Date()
});

// ==================== 泛型接口与状态管理 ====================

/**
 * 状态接口
 * @param T - 状态值的类型
 */
interface State<T> {
    value: T;
    readonly timestamp: Date;
}

/**
 * 状态管理器接口
 * @param T - 状态值的类型
 */
interface StateManager<T> {
    getState(): State<T>;
    setState(value: T): void;
    subscribe(listener: (state: State<T>) => void): () => void;
}

console.log("\n=== 泛型状态管理 ===");

// 实现状态管理器
class SimpleStateManager<T> implements StateManager<T> {
    private state: State<T>;
    private listeners: ((state: State<T>) => void)[] = [];
    
    constructor(initialValue: T) {
        this.state = {
            value: initialValue,
            timestamp: new Date()
        };
    }
    
    getState(): State<T> {
        return { ...this.state };
    }
    
    setState(value: T): void {
        this.state = {
            value,
            timestamp: new Date()
        };
        
        // 通知所有监听器
        for (const listener of this.listeners) {
            listener(this.getState());
        }
    }
    
    subscribe(listener: (state: State<T>) => void): () => void {
        this.listeners.push(listener);
        
        // 返回取消订阅函数
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index !== -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
}

// 使用状态管理器
interface AppState {
    user: User | null;
    theme: "light" | "dark";
    language: string;
}

const appStateManager = new SimpleStateManager<AppState>({
    user: null,
    theme: "light",
    language: "zh-CN"
});

// 订阅状态变化
const unsubscribe = appStateManager.subscribe(state => {
    console.log("State changed:", state);
});

// 更新状态
appStateManager.setState({
    user: { id: 1, name: "Alice", email: "alice@example.com" },
    theme: "dark",
    language: "en-US"
});

// 取消订阅
unsubscribe();

// ==================== 泛型接口与缓存 ====================

/**
 * 缓存接口
 * @param K - 键类型
 * @param V - 值类型
 */
interface Cache<K, V> {
    get(key: K): V | undefined;
    set(key: K, value: V, ttl?: number): void;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    size(): number;
}

console.log("\n=== 泛型缓存接口 ===");

// 实现缓存
class MemoryCache<K, V> implements Cache<K, V> {
    private cache = new Map<K, { value: V; expiry: number }>();
    
    get(key: K): V | undefined {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return undefined;
        }
        
        // 检查是否过期
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return undefined;
        }
        
        return entry.value;
    }
    
    set(key: K, value: V, ttl: number = 60000): void {
        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });
    }
    
    has(key: K): boolean {
        return this.get(key) !== undefined;
    }
    
    delete(key: K): boolean {
        return this.cache.delete(key);
    }
    
    clear(): void {
        this.cache.clear();
    }
    
    size(): number {
        return this.cache.size;
    }
}

// 使用缓存
const userCache = new MemoryCache<number, User>();

// 缓存用户数据
userCache.set(1, { id: 1, name: "Alice", email: "alice@example.com" }, 5000);
userCache.set(2, { id: 2, name: "Bob", email: "bob@example.com" }, 10000);

console.log("Cache size:", userCache.size());
console.log("User 1:", userCache.get(1));
console.log("User 2:", userCache.get(2));

// ==================== 总结 ====================

console.log("\n=== 泛型接口示例完成 ===");
console.log("泛型接口的主要特点：");
console.log("1. 类型参数化：可以处理多种类型");
console.log("2. 接口继承：支持扩展和组合");
console.log("3. 实际应用：API响应、策略模式、工厂模式等");
console.log("4. 类型安全：编译时检查类型一致性");
