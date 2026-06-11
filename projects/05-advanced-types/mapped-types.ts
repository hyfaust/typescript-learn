/**
 * TypeScript 映射类型示例
 * 本文件演示了映射类型和条件类型的各种用法和实际应用场景
 * 运行环境：Deno
 */

// ==================== 基本映射类型 ====================

/**
 * 基本映射类型
 */
type Keys = "a" | "b" | "c";
type Flags = { [K in Keys]: boolean };

console.log("=== 基本映射类型 ===");

const flags: Flags = {
    a: true,
    b: false,
    c: true
};

console.log("flags:", flags);

/**
 * 映射类型与索引签名
 */
type ReadOnly<T> = {
    readonly [K in keyof T]: T[K];
};

type Partial<T> = {
    [K in keyof T]?: T[K];
};

interface User {
    id: number;
    name: string;
    email: string;
}

type ReadonlyUser = ReadOnly<User>;
type PartialUser = Partial<User>;

console.log("\n=== 映射类型与索引签名 ===");

const readonlyUser: ReadonlyUser = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
};

// readonlyUser.id = 2;  // 错误，只读属性

const partialUser: PartialUser = {
    id: 1
    // name和email是可选的
};

console.log("readonlyUser:", readonlyUser);
console.log("partialUser:", partialUser);

// ==================== 内置映射类型 ====================

/**
 * 内置映射类型示例
 */
interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    inStock: boolean;
}

// Partial<T> - 所有属性变为可选
type PartialProduct = Partial<Product>;

// Required<T> - 所有属性变为必需
type RequiredProduct = Required<PartialProduct>;

// Readonly<T> - 所有属性变为只读
type ReadonlyProduct = Readonly<Product>;

// Pick<T, K> - 选取指定属性
type ProductPreview = Pick<Product, "id" | "name" | "price">;

// Omit<T, K> - 排除指定属性
type ProductWithoutDescription = Omit<Product, "description">;

console.log("\n=== 内置映射类型 ===");

const partialProduct: PartialProduct = {
    id: 1,
    name: "Widget"
};

const productPreview: ProductPreview = {
    id: 1,
    name: "Widget",
    price: 9.99
};

console.log("partialProduct:", partialProduct);
console.log("productPreview:", productPreview);

// ==================== 自定义映射类型 ====================

/**
 * 自定义映射类型
 */

// 将所有属性变为可空
type Nullable<T> = {
    [K in keyof T]: T[K] | null;
};

// 将所有属性变为可选且可空
type OptionalNullable<T> = {
    [K in keyof T]?: T[K] | null;
};

// 将所有属性变为只读
type Immutable<T> = {
    readonly [K in keyof T]: T[K];
};

// 将所有属性变为可写
type Mutable<T> = {
    -readonly [K in keyof T]: T[K];
};

// 将所有可选属性变为必需
type RequiredKeys<T> = {
    [K in keyof T]-?: T[K];
};

interface Settings {
    readonly theme: string;
    readonly language: string;
    notifications?: boolean;
    darkMode?: boolean;
}

type NullableSettings = Nullable<Settings>;
type MutableSettings = Mutable<Settings>;
type RequiredSettings = RequiredKeys<Settings>;

console.log("\n=== 自定义映射类型 ===");

const nullableSettings: NullableSettings = {
    theme: "dark",
    language: null,
    notifications: true,
    darkMode: null
};

console.log("nullableSettings:", nullableSettings);

// ==================== 条件映射类型 ====================

/**
 * 条件映射类型
 */

// 只映射字符串属性
type StringProperties<T> = {
    [K in keyof T as T[K] extends string ? K : never]: T[K];
};

// 只映射数字属性
type NumberProperties<T> = {
    [K in keyof T as T[K] extends number ? K : never]: T[K];
};

// 只映射函数属性
type FunctionProperties<T> = {
    [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

// 排除函数属性
type NonFunctionProperties<T> = {
    [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

interface Example {
    id: number;
    name: string;
    active: boolean;
    greet(): void;
    calculate(x: number): number;
}

type ExampleStrings = StringProperties<Example>;
type ExampleNumbers = NumberProperties<Example>;
type ExampleFunctions = FunctionProperties<Example>;
type ExampleNonFunctions = NonFunctionProperties<Example>;

console.log("\n=== 条件映射类型 ===");

// 类型级别的操作，运行时无法直接演示
console.log("条件映射类型是类型级别的操作，主要用于编译时类型检查");
console.log("ExampleStrings 包含: name (string属性)");
console.log("ExampleNumbers 包含: id (number属性)");
console.log("ExampleFunctions 包含: greet, calculate (函数属性)");
console.log("ExampleNonFunctions 包含: id, name, active (非函数属性)");

// ==================== 键重映射 ====================

/**
 * 键重映射（TypeScript 4.1+）
 */

// 添加前缀
type Prefixed<T, P extends string> = {
    [K in keyof T as `${P}${Capitalize<string & K>}`]: T[K];
};

// 添加后缀
type Suffixed<T, S extends string> = {
    [K in keyof T as `${string & K}${S}`]: T[K];
};

// 过滤键
type FilterByKey<T, F extends string> = {
    [K in keyof T as K extends F ? K : never]: T[K];
};

interface User {
    id: number;
    name: string;
    email: string;
}

type PrefixedUser = Prefixed<User, "user">;
type SuffixedUser = Suffixed<User, "Data">;
type FilteredUser = FilterByKey<User, "id" | "name">;

console.log("\n=== 键重映射 ===");

// 类型级别的操作，运行时无法直接演示
console.log("键重映射是TypeScript 4.1+的特性");
console.log("PrefixedUser: userId, userName, userEmail");
console.log("SuffixedUser: idData, nameData, emailData");
console.log("FilteredUser: id, name");

// ==================== 条件类型 ====================

/**
 * 条件类型
 */

// 基本条件类型
type IsString<T> = T extends string ? true : false;
type IsNumber<T> = number extends number ? true : false;

// 条件类型与联合类型
type ToArray<T> = T extends any ? T[] : never;

type A = ToArray<string | number>;  // string[] | number[]

// 条件类型与infer
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
type Parameters<T> = T extends (...args: infer P) => any ? P : any;

function greet(name: string, age: number): string {
    return `Hello, ${name}. You are ${age} years old.`;
}

type GreetReturn = ReturnType<typeof greet>;  // string
type GreetParams = Parameters<typeof greet>;  // [name: string, age: number]

console.log("\n=== 条件类型 ===");

// 类型级别的操作，运行时无法直接演示
console.log("条件类型是类型级别的操作，主要用于编译时类型检查");
console.log("IsString<string> = true");
console.log("IsString<number> = false");
console.log("ToArray<string | number> = string[] | number[]");

// ==================== 分布式条件类型 ====================

/**
 * 分布式条件类型
 */

// 分布式条件类型
type DistributedTo<T> = T extends any ? T[] : never;
type NonDistributed<T> = [T] extends [any] ? T[] : never;

type B = DistributedTo<string | number>;  // string[] | number[]
type C = NonDistributed<string | number>;  // (string | number)[]

// 提取联合类型中的特定类型
type Extract<T, U> = T extends U ? T : never;
type Exclude<T, U> = T extends U ? never : T;

type D = Extract<string | number | boolean, string>;  // string
type E = Exclude<string | number | boolean, string>;  // number | boolean

// 提取Promise类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type F = UnwrapPromise<Promise<string>>;  // string
type G = UnwrapPromise<Promise<number>>;  // number
type H = UnwrapPromise<string>;          // string

console.log("\n=== 分布式条件类型 ===");

console.log("分布式条件类型是条件类型的重要特性");
console.log("DistributedTo<string | number> = string[] | number[]");
console.log("NonDistributed<string | number> = (string | number)[]");

// ==================== 条件类型与映射类型结合 ====================

/**
 * 条件类型与映射类型结合
 */

// 将字符串属性变为可空
type NullableStringProperties<T> = {
    [K in keyof T]: T[K] extends string ? T[K] | null : T[K];
};

// 将数字属性变为可空
type NullableNumberProperties<T> = {
    [K in keyof T]: T[K] extends number ? T[K] | null : T[K];
};

// 提取对象中的函数类型
type FunctionProperties2<T> = {
    [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

interface Example2 {
    id: number;
    name: string;
    active: boolean;
    greet(): void;
    calculate(x: number): number;
}

type NullableStrings = NullableStringProperties<Example2>;
type NullableNumbers = NullableNumberProperties<Example2>;
type Functions = FunctionProperties2<Example2>;

console.log("\n=== 条件类型与映射类型结合 ===");

// 类型级别的操作，运行时无法直接演示
console.log("NullableStrings: id (number), name (string | null), active (boolean), greet, calculate");
console.log("NullableNumbers: id (number | null), name (string), active (boolean), greet, calculate");
console.log("Functions: greet, calculate");

// ==================== 高级条件类型 ====================

/**
 * 高级条件类型
 */

// 递归条件类型
type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type DeepNullable<T> = {
    [K in keyof T]: T[K] extends object ? DeepNullable<T[K]> : T[K] | null;
};

interface NestedObject {
    id: number;
    name: string;
    address: {
        city: string;
        zip: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    settings: {
        theme: string;
        notifications: boolean;
    };
}

type ReadonlyNested = DeepReadonly<NestedObject>;
type PartialNested = DeepPartial<NestedObject>;
type NullableNested = DeepNullable<NestedObject>;

console.log("\n=== 高级条件类型 ===");

// 类型级别的操作，运行时无法直接演示
console.log("高级条件类型用于处理复杂的类型转换");
console.log("DeepReadonly: 所有嵌套属性都变为只读");
console.log("DeepPartial: 所有嵌套属性都变为可选");
console.log("DeepNullable: 所有嵌套属性都变为可空");

// ==================== 条件类型与类型推断 ====================

/**
 * 条件类型与类型推断
 */

// 推断数组元素类型
type ElementType<T> = T extends Array<infer E> ? E : never;

// 推断函数返回类型
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;

// 推断Promise类型
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

// 掉发函数参数类型
type FirstParam<T> = T extends (first: infer F, ...args: any[]) => any ? F : never;

type I = ElementType<string[]>;  // string
type J = ReturnOf<() => number>;  // number
type K = Awaited<Promise<Promise<string>>>;  // string
type L = FirstParam<(name: string, age: number) => void>;  // string

console.log("\n=== 条件类型与类型推断 ===");

// 类型级别的操作，运行时无法直接演示
console.log("条件类型与类型推断结合使用");
console.log("ElementType<string[]> = string");
console.log("ReturnOf<() => number> = number");
console.log("Awaited<Promise<Promise<string>>> = string");

// ==================== 实际应用示例 ====================

/**
 * 实际应用示例
 */

// API响应类型
type ApiResponse<T> = {
    data: T;
    status: number;
    message: string;
    timestamp: Date;
};

// 分页响应类型
type PaginatedResponse<T> = ApiResponse<T[]> & {
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

// 错误响应类型
type ErrorResponse = {
    error: {
        code: string;
        message: string;
        details?: Record<string, any>;
    };
    status: number;
    timestamp: Date;
};

// 统一响应类型
type UnifiedResponse<T> = ApiResponse<T> | ErrorResponse;

// 类型守卫
function isSuccess<T>(response: UnifiedResponse<T>): response is ApiResponse<T> {
    return "data" in response;
}

console.log("\n=== 实际应用示例 ===");

const successResponse: UnifiedResponse<User> = {
    data: { id: 1, name: "Alice", email: "alice@example.com" },
    status: 200,
    message: "Success",
    timestamp: new Date()
};

const errorResponse: UnifiedResponse<User> = {
    error: {
        code: "NOT_FOUND",
        message: "User not found"
    },
    status: 404,
    timestamp: new Date()
};

if (isSuccess(successResponse)) {
    console.log("Success:", successResponse.data);
}

if (!isSuccess(errorResponse)) {
    console.log("Error:", errorResponse.error.message);
}

// ==================== 类型工具函数 ====================

/**
 * 类型工具函数
 */

// 创建只读对象
function createReadonly<T>(obj: T): Readonly<T> {
    return Object.freeze(obj);
}

// 创建部分对象
function createPartial<T>(obj: T): Partial<T> {
    return { ...obj };
}

// 合并对象
function merge<T, U>(obj1: T, obj2: U): T & U {
    return { ...obj1, ...obj2 };
}

console.log("\n=== 类型工具函数 ===");

const user = { id: 1, name: "Alice", email: "alice@example.com" };
const readonlyUser2 = createReadonly(user);
const partialUser2 = createPartial(user);

console.log("readonlyUser2:", readonlyUser2);
console.log("partialUser2:", partialUser2);

// ==================== 类型安全的事件系统 ====================

/**
 * 类型安全的事件系统
 */

// 事件映射类型
type EventMap = {
    click: { x: number; y: number };
    hover: { x: number; y: number };
    scroll: { deltaX: number; deltaY: number };
    resize: { width: number; height: number };
};

// 事件处理器类型
type EventHandler<T> = (event: T) => void;

// 事件发射器类型
type EventEmitter<T extends Record<string, any>> = {
    on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void;
    off<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void;
    emit<K extends keyof T>(event: K, data: T[K]): void;
};

console.log("\n=== 类型安全的事件系统 ===");

// 实现事件发射器
function createEventEmitter<T extends Record<string, any>>(): EventEmitter<T> {
    const handlers: Map<string, Set<Function>> = new Map();
    
    return {
        on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void {
            if (!handlers.has(event as string)) {
                handlers.set(event as string, new Set());
            }
            handlers.get(event as string)!.add(handler);
        },
        
        off<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void {
            const eventHandlers = handlers.get(event as string);
            if (eventHandlers) {
                eventHandlers.delete(handler);
            }
        },
        
        emit<K extends keyof T>(event: K, data: T[K]): void {
            const eventHandlers = handlers.get(event as string);
            if (eventHandlers) {
                eventHandlers.forEach(handler => handler(data));
            }
        }
    };
}

// 使用类型安全的事件系统
const emitter = createEventEmitter<EventMap>();

emitter.on("click", (event) => {
    console.log(`Click at (${event.x}, ${event.y})`);
});

emitter.on("scroll", (event) => {
    console.log(`Scroll delta: (${event.deltaX}, ${event.deltaY})`);
});

// 触发事件
emitter.emit("click", { x: 10, y: 20 });
emitter.emit("scroll", { deltaX: 0, deltaY: -100 });

// ==================== 类型安全的状态管理 ====================

/**
 * 类型安全的状态管理
 */

// 状态类型
type AppState = {
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    settings: {
        theme: "light" | "dark";
        language: string;
        notifications: boolean;
    };
    ui: {
        sidebarOpen: boolean;
        modalOpen: boolean;
        loading: boolean;
    };
};

// 状态更新类型
type StateUpdate<T> = {
    [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K];
};

// 状态管理器类型
type StateManager<T> = {
    getState(): T;
    setState(update: StateUpdate<T>): void;
    subscribe(listener: (state: T) => void): () => void;
};

console.log("\n=== 类型安全的状态管理 ===");

// 实现状态管理器
function createStateManager<T>(initialState: T): StateManager<T> {
    let state = initialState;
    const listeners: Set<(state: T) => void> = new Set();
    
    return {
        getState(): T {
            return state;
        },
        
        setState(update: StateUpdate<T>): void {
            state = { ...state, ...update } as T;
            listeners.forEach(listener => listener(state));
        },
        
        subscribe(listener: (state: T) => void): () => void {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    };
}

// 使用状态管理器
const initialState: AppState = {
    user: null,
    settings: {
        theme: "light",
        language: "zh-CN",
        notifications: true
    },
    ui: {
        sidebarOpen: false,
        modalOpen: false,
        loading: false
    }
};

const stateManager = createStateManager(initialState);

// 订阅状态变化
const unsubscribe = stateManager.subscribe((state) => {
    console.log("State changed:", state);
});

// 更新状态
stateManager.setState({
    user: { id: 1, name: "Alice", email: "alice@example.com" },
    settings: { theme: "dark" }
});

// 取消订阅
unsubscribe();

// ==================== 总结 ====================

console.log("\n=== 映射类型示例完成 ===");
console.log("映射类型和条件类型的主要特点：");
console.log("1. 映射类型：基于现有类型创建新类型");
console.log("2. 条件类型：根据条件选择类型");
console.log("3. 分布式条件类型：处理联合类型");
console.log("4. 类型推断：从类型中提取信息");
console.log("5. 实际应用：类型安全的事件系统、状态管理等");
