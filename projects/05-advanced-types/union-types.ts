/**
 * TypeScript 联合类型示例
 * 本文件演示了联合类型的各种用法和实际应用场景
 * 运行环境：Deno
 */

// ==================== 基本联合类型 ====================

/**
 * 基本联合类型示例
 */
let value: string | number;
value = "hello";  // 有效
value = 42;       // 有效
// value = true;  // 错误，boolean不在联合类型中

console.log("=== 基本联合类型 ===");
console.log("value:", value);

/**
 * 函数参数使用联合类型
 * @param value - 字符串或数字
 * @returns 格式化后的字符串
 */
function processValue(value: string | number): string {
    if (typeof value === "string") {
        return value.toUpperCase();
    } else {
        return value.toFixed(2);
    }
}

console.log("processValue('hello'):", processValue("hello"));
console.log("processValue(42):", processValue(42));

// ==================== 字面量联合类型 ====================

/**
 * 字面量联合类型
 */
type Direction = "up" | "down" | "left" | "right";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type StatusCode = 200 | 201 | 400 | 404 | 500;
type Color = "red" | "green" | "blue" | "yellow";

/**
 * 使用字面量联合类型
 * @param direction - 方向
 */
function move(direction: Direction): void {
    console.log(`Moving ${direction}`);
}

/**
 * 处理HTTP请求
 * @param method - HTTP方法
 * @param url - 请求URL
 */
function makeRequest(method: HttpMethod, url: string): void {
    console.log(`Making ${method} request to ${url}`);
}

console.log("\n=== 字面量联合类型 ===");

move("up");
move("right");
// move("forward"); // 错误

makeRequest("GET", "/api/users");
makeRequest("POST", "/api/users");

// ==================== 联合类型与数组 ====================

/**
 * 数组元素可以是联合类型
 */
let mixedArray: (string | number)[] = [1, "two", 3, "four"];
let flexibleArray: Array<string | number | boolean> = [1, "hello", true, 42, "world"];

console.log("\n=== 联合类型与数组 ===");

// 只能使用联合类型中包含的方法
mixedArray.forEach(item => {
    if (typeof item === "string") {
        console.log(`String: ${item.toUpperCase()}`);
    } else {
        console.log(`Number: ${item.toFixed(2)}`);
    }
});

// ==================== 联合类型与对象 ====================

/**
 * 对象联合类型
 */
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

/**
 * 计算形状的面积
 * @param shape - 形状对象
 * @returns 面积
 */
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

console.log("\n=== 联合类型与对象 ===");

const circle: Circle = { kind: "circle", radius: 5 };
const rectangle: Rectangle = { kind: "rectangle", width: 10, height: 20 };
const triangle: Triangle = { kind: "triangle", base: 10, height: 15 };

console.log("Circle area:", calculateArea(circle));
console.log("Rectangle area:", calculateArea(rectangle));
console.log("Triangle area:", calculateArea(triangle));

// ==================== 可辨识联合 ====================

/**
 * API响应类型
 */
interface SuccessResponse {
    status: "success";
    data: any;
    timestamp: Date;
}

interface ErrorResponse {
    status: "error";
    error: string;
    code: number;
    timestamp: Date;
}

interface LoadingResponse {
    status: "loading";
    timestamp: Date;
}

type ApiResponse = SuccessResponse | ErrorResponse | LoadingResponse;

/**
 * 处理API响应
 * @param response - API响应
 */
function handleResponse(response: ApiResponse): void {
    switch (response.status) {
        case "success":
            console.log("Success:", response.data);
            break;
        case "error":
            console.log(`Error ${response.code}: ${response.error}`);
            break;
        case "loading":
            console.log("Loading...");
            break;
        default:
            const _exhaustiveCheck: never = response;
            return _exhaustiveCheck;
    }
}

console.log("\n=== 可辨识联合 ===");

const successResponse: ApiResponse = {
    status: "success",
    data: { id: 1, name: "Alice" },
    timestamp: new Date()
};

const errorResponse: ApiResponse = {
    status: "error",
    error: "Not Found",
    code: 404,
    timestamp: new Date()
};

const loadingResponse: ApiResponse = {
    status: "loading",
    timestamp: new Date()
};

handleResponse(successResponse);
handleResponse(errorResponse);
handleResponse(loadingResponse);

// ==================== 联合类型与函数重载 ====================

/**
 * 使用联合类型模拟函数重载
 * @param value - 字符串或数字
 * @returns 处理后的结果
 */
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
    if (typeof value === "string") {
        return value.toUpperCase();
    } else {
        return value.toFixed(2);
    }
}

console.log("\n=== 联合类型与函数重载 ===");

console.log("format('hello'):", format("hello"));
console.log("format(42):", format(42));

// ==================== 联合类型与类型守卫 ====================

/**
 * 使用typeof类型守卫
 * @param value - 字符串、数字或布尔值
 * @returns 类型描述
 */
function describeType(value: string | number | boolean): string {
    if (typeof value === "string") {
        return `String: ${value}`;
    } else if (typeof value === "number") {
        return `Number: ${value}`;
    } else {
        return `Boolean: ${value}`;
    }
}

console.log("\n=== 联合类型与类型守卫 ===");

console.log(describeType("hello"));
console.log(describeType(42));
console.log(describeType(true));

/**
 * 使用in操作符类型守卫
 */
interface Fish {
    swim(): void;
    name: string;
}

interface Bird {
    fly(): void;
    name: string;
}

function moveAnimal(animal: Fish | Bird): void {
    if ("swim" in animal) {
        animal.swim();
    } else {
        animal.fly();
    }
}

const fish: Fish = {
    name: "Nemo",
    swim() {
        console.log(`${this.name} is swimming`);
    }
};

const bird: Bird = {
    name: "Tweety",
    fly() {
        console.log(`${this.name} is flying`);
    }
};

moveAnimal(fish);
moveAnimal(bird);

// ==================== 联合类型与泛型 ====================

/**
 * 泛型联合类型
 * @param value - 联合类型的值
 * @returns 处理后的结果
 */
function processGeneric<T extends string | number>(value: T): string {
    if (typeof value === "string") {
        return value.toUpperCase();
    } else {
        return (value as number).toFixed(2);
    }
}

console.log("\n=== 联合类型与泛型 ===");

console.log("processGeneric('hello'):", processGeneric("hello"));
console.log("processGeneric(42):", processGeneric(42));

/**
 * 泛型联合类型约束
 */
type StringOrNumber = string | number;
type StringOrBoolean = string | boolean;
type ComplexUnion = StringOrNumber | StringOrBoolean;

function processComplex(value: ComplexUnion): string {
    if (typeof value === "string") {
        return `String: ${value}`;
    } else if (typeof value === "number") {
        return `Number: ${value}`;
    } else {
        return `Boolean: ${value}`;
    }
}

console.log("processComplex('hello'):", processComplex("hello"));
console.log("processComplex(42):", processComplex(42));
console.log("processComplex(true):", processComplex(true));

// ==================== 联合类型与条件类型 ====================

/**
 * 条件类型与联合类型
 */
type IsString<T> = T extends string ? true : false;
type IsNumber<T> = T extends number ? true : false;

type A = IsString<string>;      // true
type B = IsString<number>;      // false
type C = IsNumber<42>;          // true

/**
 * 分布式条件类型
 */
type ToArray<T> = T extends any ? T[] : never;

type D = ToArray<string | number>;  // string[] | number[]

// 等价于：
// ToArray<string> | ToArray<number>
// string[] | number[]

console.log("\n=== 联合类型与条件类型 ===");

// 类型级别的操作，运行时无法直接演示
console.log("条件类型是类型级别的操作，主要用于编译时类型检查");

// ==================== 联合类型与映射类型 ====================

/**
 * 映射类型与联合类型
 */
type Nullable<T> = { [K in keyof T]: T[K] | null };
type Optional<T> = { [K in keyof T]?: T[K] };

interface User {
    id: number;
    name: string;
    email: string;
}

type NullableUser = Nullable<User>;
type OptionalUser = Optional<User>;

console.log("\n=== 联合类型与映射类型 ===");

const nullableUser: NullableUser = {
    id: 1,
    name: "Alice",
    email: null
};

const optionalUser: OptionalUser = {
    id: 1
    // name和email是可选的
};

console.log("nullableUser:", nullableUser);
console.log("optionalUser:", optionalUser);

// ==================== 联合类型的实际应用 ====================

/**
 * 状态机实现
 */
type State = "idle" | "loading" | "success" | "error";
type Action = "start" | "success" | "error" | "reset";

interface StateMachine {
    state: State;
    transition(action: Action): State;
}

function createStateMachine(): StateMachine {
    let currentState: State = "idle";
    
    const transitions: Record<State, Partial<Record<Action, State>>> = {
        idle: {
            start: "loading"
        },
        loading: {
            success: "success",
            error: "error"
        },
        success: {
            reset: "idle"
        },
        error: {
            reset: "idle"
        }
    };
    
    return {
        get state() {
            return currentState;
        },
        transition(action: Action): State {
            const nextState = transitions[currentState][action];
            if (nextState) {
                currentState = nextState;
            }
            return currentState;
        }
    };
}

console.log("\n=== 联合类型的实际应用 ===");

const machine = createStateMachine();
console.log("Initial state:", machine.state);
console.log("After start:", machine.transition("start"));
console.log("After success:", machine.transition("success"));
console.log("After reset:", machine.transition("reset"));

/**
 * 事件系统实现
 */
type EventType = "click" | "hover" | "scroll" | "resize";
type EventHandler = (event: { type: EventType; data: any }) => void;

class EventEmitter {
    private handlers: Map<EventType, EventHandler[]> = new Map();
    
    on(event: EventType, handler: EventHandler): void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event)!.push(handler);
    }
    
    emit(event: EventType, data: any): void {
        const handlers = this.handlers.get(event) || [];
        handlers.forEach(handler => handler({ type: event, data }));
    }
}

const emitter = new EventEmitter();
emitter.on("click", (event) => {
    console.log(`Click event:`, event.data);
});

emitter.emit("click", { x: 10, y: 20 });

/**
 * 配置系统实现
 */
type ConfigValue = string | number | boolean | string[];
type Config = Record<string, ConfigValue>;

function processConfig(config: Config): void {
    for (const [key, value] of Object.entries(config)) {
        if (typeof value === "string") {
            console.log(`${key}: String - ${value}`);
        } else if (typeof value === "number") {
            console.log(`${key}: Number - ${value}`);
        } else if (typeof value === "boolean") {
            console.log(`${key}: Boolean - ${value}`);
        } else if (Array.isArray(value)) {
            console.log(`${key}: Array - [${value.join(", ")}]`);
        }
    }
}

console.log("\n=== 配置系统 ===");

const config: Config = {
    appName: "MyApp",
    port: 3000,
    debug: true,
    allowedOrigins: ["localhost", "example.com"]
};

processConfig(config);

// ==================== 总结 ====================

console.log("\n=== 联合类型示例完成 ===");
console.log("联合类型的主要特点：");
console.log("1. 表示多种可能的类型");
console.log("2. 字面量联合类型提供精确的类型约束");
console.log("3. 可辨识联合实现类型安全的分支逻辑");
console.log("4. 与类型守卫结合实现运行时类型检查");
console.log("5. 支持分布式条件类型和映射类型");
