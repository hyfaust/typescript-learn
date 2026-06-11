/**
 * TypeScript 类型守卫示例
 * 本文件演示了类型守卫的各种用法和实际应用场景
 * 运行环境：Deno
 */

// ==================== typeof 类型守卫 ====================

/**
 * typeof 类型守卫
 * @param value - 字符串、数字或布尔值
 * @returns 类型描述
 */
function describeType(value: string | number | boolean): string {
    if (typeof value === "string") {
        // 这里value被缩小为string类型
        return `String: ${value.toUpperCase()}`;
    } else if (typeof value === "number") {
        // 这里value被缩小为number类型
        return `Number: ${value.toFixed(2)}`;
    } else {
        // 这里value被缩小为boolean类型
        return `Boolean: ${value ? "true" : "false"}`;
    }
}

console.log("=== typeof 类型守卫 ===");
console.log(describeType("hello"));
console.log(describeType(42));
console.log(describeType(true));

/**
 * 处理多种类型
 * @param value - 字符串、数字或布尔值
 * @returns 处理后的结果
 */
function processValue(value: string | number | boolean): string | number {
    if (typeof value === "string") {
        // 字符串处理
        return value.trim().toLowerCase();
    } else if (typeof value === "number") {
        // 数字处理
        return Math.abs(value);
    } else {
        // 布尔值处理
        return value ? 1 : 0;
    }
}

console.log("\n=== 处理多种类型 ===");
console.log("processValue('  Hello  '):", processValue("  Hello  "));
console.log("processValue(-42):", processValue(-42));
console.log("processValue(false):", processValue(false));

// ==================== instanceof 类型守卫 ====================

/**
 * 基类
 */
class Animal {
    constructor(public name: string) {}
    
    speak(): string {
        return `${this.name} makes a sound`;
    }
}

/**
 * 派生类 - 狗
 */
class Dog extends Animal {
    constructor(name: string) {
        super(name);
    }
    
    speak(): string {
        return `${this.name} barks`;
    }
    
    fetch(): string {
        return `${this.name} fetches the ball`;
    }
}

/**
 * 派生类 - 猫
 */
class Cat extends Animal {
    constructor(name: string) {
        super(name);
    }
    
    speak(): string {
        return `${this.name} meows`;
    }
    
    purr(): string {
        return `${this.name} purrs`;
    }
}

/**
 * 使用instanceof类型守卫
 * @param animal - 动物对象
 * @returns 动物的行为描述
 */
function describeAnimal(animal: Animal): string {
    if (animal instanceof Dog) {
        // 这里animal被缩小为Dog类型
        return `${animal.speak()} and ${animal.fetch()}`;
    } else if (animal instanceof Cat) {
        // 这里animal被缩小为Cat类型
        return `${animal.speak()} and ${animal.purr()}`;
    } else {
        // 这里animal是Animal类型
        return animal.speak();
    }
}

console.log("\n=== instanceof 类型守卫 ===");

const dog = new Dog("Buddy");
const cat = new Cat("Whiskers");
const animal = new Animal("Generic Animal");

console.log(describeAnimal(dog));
console.log(describeAnimal(cat));
console.log(describeAnimal(animal));

// ==================== 自定义类型守卫 ====================

/**
 * 自定义类型守卫函数
 * 使用类型谓词 animal is Cat
 */
function isCat(animal: Animal): animal is Cat {
    return (animal as Cat).purr !== undefined;
}

/**
 * 自定义类型守卫函数
 * 使用类型谓词 animal is Dog
 */
function isDog(animal: Animal): animal is Dog {
    return (animal as Dog).fetch !== undefined;
}

/**
 * 使用自定义类型守卫
 * @param animal - 动物对象
 */
function handleAnimal(animal: Animal): void {
    if (isCat(animal)) {
        // 这里animal被缩小为Cat类型
        console.log("Cat:", animal.purr());
    } else if (isDog(animal)) {
        // 这里animal被缩小为Dog类型
        console.log("Dog:", animal.fetch());
    } else {
        console.log("Animal:", animal.speak());
    }
}

console.log("\n=== 自定义类型守卫 ===");

handleAnimal(dog);
handleAnimal(cat);
handleAnimal(animal);

// ==================== in 操作符类型守卫 ====================

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

/**
 * 使用in操作符检查属性
 * @param animal - 鱼或鸟
 */
function moveAnimal(animal: Fish | Bird): void {
    if ("swim" in animal) {
        // 这里animal被缩小为Fish类型
        animal.swim();
    } else {
        // 这里animal被缩小为Bird类型
        animal.fly();
    }
}

console.log("\n=== in 操作符类型守卫 ===");

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

// ==================== 可辨识联合类型守卫 ====================

/**
 * 可辨识联合类型
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
 * 使用可辨识联合类型守卫
 * @param shape - 形状对象
 * @returns 面积
 */
function calculateArea(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            // 这里shape被缩小为Circle类型
            return Math.PI * shape.radius ** 2;
        case "rectangle":
            // 这里shape被缩小为Rectangle类型
            return shape.width * shape.height;
        case "triangle":
            // 这里shape被缩小为Triangle类型
            return (shape.base * shape.height) / 2;
        default:
            // 穷尽性检查
            const _exhaustiveCheck: never = shape;
            return _exhaustiveCheck;
    }
}

console.log("\n=== 可辨识联合类型守卫 ===");

const circle: Circle = { kind: "circle", radius: 5 };
const rectangle: Rectangle = { kind: "rectangle", width: 10, height: 20 };
const triangle: Triangle = { kind: "triangle", base: 10, height: 15 };

console.log("Circle area:", calculateArea(circle));
console.log("Rectangle area:", calculateArea(rectangle));
console.log("Triangle area:", calculateArea(triangle));

// ==================== 类型守卫与泛型 ====================

/**
 * 泛型类型守卫
 * @param value - 任意值
 * @returns 是否是字符串
 */
function isString<T>(value: T): value is T & string {
    return typeof value === "string";
}

/**
 * 泛型类型守卫
 * @param value - 任意值
 * @returns 是否是数字
 */
function isNumber<T>(value: T): value is T & number {
    return typeof value === "number";
}

/**
 * 使用泛型类型守卫
 * @param value - 任意值
 * @returns 处理后的结果
 */
function processGeneric<T>(value: T): string {
    if (isString(value)) {
        // 这里value被缩小为string类型
        return `String: ${value.toUpperCase()}`;
    } else if (isNumber(value)) {
        // 这里value被缩小为number类型
        return `Number: ${value.toFixed(2)}`;
    } else {
        return `Other: ${value}`;
    }
}

console.log("\n=== 类型守卫与泛型 ===");

console.log(processGeneric("hello"));
console.log(processGeneric(42));
console.log(processGeneric(true));

// ==================== 类型守卫与接口 ====================

/**
 * 接口类型守卫
 */
interface User {
    id: number;
    name: string;
    email: string;
}

interface Admin extends User {
    permissions: string[];
    role: "admin";
}

interface Guest {
    sessionId: string;
    expiresAt: Date;
}

type Person = User | Admin | Guest;

/**
 * 检查是否是Admin
 * @param person - 人员对象
 * @returns 是否是Admin
 */
function isAdmin(person: Person): person is Admin {
    return (person as Admin).role === "admin";
}

/**
 * 检查是否是User
 * @param person - 人员对象
 * @returns 是否是User
 */
function isUser(person: Person): person is User {
    return (person as User).id !== undefined && (person as User).name !== undefined;
}

/**
 * 检查是否是Guest
 * @param person - 人员对象
 * @returns 是否是Guest
 */
function isGuest(person: Person): person is Guest {
    return (person as Guest).sessionId !== undefined;
}

/**
 * 处理不同类型的人员
 * @param person - 人员对象
 */
function handlePerson(person: Person): void {
    if (isAdmin(person)) {
        console.log(`Admin: ${person.name}, Permissions: ${person.permissions.join(", ")}`);
    } else if (isUser(person)) {
        console.log(`User: ${person.name}, Email: ${person.email}`);
    } else if (isGuest(person)) {
        console.log(`Guest: Session ${person.sessionId}`);
    } else {
        console.log("Unknown person type");
    }
}

console.log("\n=== 类型守卫与接口 ===");

const admin: Admin = {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    permissions: ["read", "write", "delete"],
    role: "admin"
};

const user: User = {
    id: 2,
    name: "Regular User",
    email: "user@example.com"
};

const guest: Guest = {
    sessionId: "abc123",
    expiresAt: new Date(Date.now() + 3600000)
};

handlePerson(admin);
handlePerson(user);
handlePerson(guest);

// ==================== 类型守卫与联合类型 ====================

/**
 * 联合类型守卫
 */
type StringOrNumber = string | number;
type StringOrBoolean = string | boolean;
type ComplexUnion = StringOrNumber | StringOrBoolean;

/**
 * 使用类型守卫处理复杂联合类型
 * @param value - 复杂联合类型
 * @returns 类型描述
 */
function describeComplex(value: ComplexUnion): string {
    if (typeof value === "string") {
        return `String: ${value}`;
    } else if (typeof value === "number") {
        return `Number: ${value}`;
    } else if (typeof value === "boolean") {
        return `Boolean: ${value}`;
    } else {
        return `Unknown: ${value}`;
    }
}

console.log("\n=== 类型守卫与联合类型 ===");

console.log(describeComplex("hello"));
console.log(describeComplex(42));
console.log(describeComplex(true));

// ==================== 类型守卫与类型断言 ====================

/**
 * 类型断言与类型守卫的区别
 */
interface ApiResponse {
    data: any;
    status: number;
}

/**
 * 使用类型守卫（安全）
 * @param response - API响应
 * @returns 是否成功
 */
function isSuccessResponse(response: ApiResponse): response is ApiResponse & { data: any } {
    return response.status >= 200 && response.status < 300;
}

/**
 * 使用类型断言（不安全）
 * @param response - API响应
 * @returns 数据
 */
function getDataUnsafe(response: ApiResponse): any {
    // 类型断言，如果response.data不存在会返回undefined
    return (response as any).data;
}

console.log("\n=== 类型守卫与类型断言 ===");

const response: ApiResponse = { data: { id: 1 }, status: 200 };

if (isSuccessResponse(response)) {
    console.log("Success:", response.data);
}

// 类型断言可能不安全
console.log("Unsafe data:", getDataUnsafe(response));

// ==================== 类型守卫与null/undefined ====================

/**
 * 处理null和undefined
 * @param value - 可能为null或undefined的值
 * @returns 处理后的结果
 */
function processNullable(value: string | null | undefined): string {
    if (value === null) {
        return "Value is null";
    } else if (value === undefined) {
        return "Value is undefined";
    } else {
        // 这里value被缩小为string类型
        return `Value: ${value}`;
    }
}

console.log("\n=== 类型守卫与null/undefined ===");

console.log(processNullable("hello"));
console.log(processNullable(null));
console.log(processNullable(undefined));

/**
 * 使用非空断言操作符
 * @param value - 可能为null的值
 * @returns 值的长度
 */
function getLength(value: string | null): number {
    // 非空断言操作符，假设value不为null
    return value!.length;
}

// 安全版本
function getLengthSafe(value: string | null): number {
    if (value === null) {
        return 0;
    }
    return value.length;
}

console.log("\n=== 非空断言 ===");

console.log("getLengthSafe('hello'):", getLengthSafe("hello"));
console.log("getLengthSafe(null):", getLengthSafe(null));

// ==================== 类型守卫与类型缩窄 ====================

/**
 * 类型缩窄
 */
function padLeft(value: string | number, padding: string | number): string {
    // 类型缩窄
    if (typeof padding === "number") {
        // 这里padding被缩小为number类型
        return " ".repeat(padding) + value;
    }
    
    // 这里padding被缩小为string类型
    if (typeof value === "number") {
        // 这里value被缩小为number类型
        return padding + value.toString();
    }
    
    // 这里value和padding都是string类型
    return padding + value;
}

console.log("\n=== 类型缩窄 ===");

console.log("padLeft('hello', 4):", padLeft("hello", 4));
console.log("padLeft('hello', '>>'):", padLeft("hello", ">>"));
console.log("padLeft(42, '>>'):", padLeft(42, ">>"));

// ==================== 类型守卫与条件类型 ====================

/**
 * 条件类型与类型守卫
 */
type IsString<T> = T extends string ? true : false;
type IsNumber<T> = T extends number ? true : false;

/**
 * 条件类型守卫
 * @param value - 任意值
 * @returns 是否是字符串
 */
function isStringConditional<T>(value: T): value is T & string {
    return typeof value === "string";
}

/**
 * 使用条件类型守卫
 * @param value - 任意值
 * @returns 处理后的结果
 */
function processConditional<T>(value: T): string {
    if (isStringConditional(value)) {
        // 这里value被缩小为string类型
        return `String: ${value.toUpperCase()}`;
    } else {
        return `Other: ${value}`;
    }
}

console.log("\n=== 类型守卫与条件类型 ===");

console.log(processConditional("hello"));
console.log(processConditional(42));

// ==================== 类型守卫与映射类型 ====================

/**
 * 映射类型与类型守卫
 */
type Nullable<T> = { [K in keyof T]: T[K] | null };

interface User {
    id: number;
    name: string;
    email: string;
}

type NullableUser = Nullable<User>;

/**
 * 检查对象属性是否为null
 * @param obj - 对象
 * @param key - 属性键
 * @returns 属性是否不为null
 */
function isNotNull<T, K extends keyof T>(
    obj: T,
    key: K
): obj is T & { [P in K]: NonNullable<T[P]> } {
    return obj[key] !== null && obj[key] !== undefined;
}

console.log("\n=== 类型守卫与映射类型 ===");

const nullableUser: NullableUser = {
    id: 1,
    name: "Alice",
    email: null
};

if (isNotNull(nullableUser, "email")) {
    // 这里nullableUser.email被缩小为string类型
    console.log("Email:", nullableUser.email.toUpperCase());
} else {
    console.log("Email is null");
}

// ==================== 类型守卫与函数重载 ====================

/**
 * 函数重载与类型守卫
 */
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: "span"): HTMLSpanElement;
function createElement(tag: "p"): HTMLParagraphElement;
function createElement(tag: string): HTMLElement;
function createElement(tag: string): HTMLElement {
    // 实现
    return {} as HTMLElement;
}

console.log("\n=== 类型守卫与函数重载 ===");

// 函数重载是编译时特性，运行时无法演示
console.log("函数重载是编译时特性，用于提供精确的类型信息");

// ==================== 类型守卫与类型断言函数 ====================

/**
 * 类型断言函数
 */
function assertIsString(value: unknown): asserts value is string {
    if (typeof value !== "string") {
        throw new Error(`Expected string, got ${typeof value}`);
    }
}

function assertIsNumber(value: unknown): asserts value is number {
    if (typeof value !== "number") {
        throw new Error(`Expected number, got ${typeof value}`);
    }
}

/**
 * 使用类型断言函数
 * @param value - 未知类型
 */
function processWithAssertion(value: unknown): void {
    assertIsString(value);
    // 这里value被断言为string类型
    console.log("String value:", value.toUpperCase());
}

console.log("\n=== 类型守卫与类型断言函数 ===");

try {
    processWithAssertion("hello");
    processWithAssertion(42);  // 会抛出错误
} catch (error) {
    console.log("Error:", (error as Error).message);
}

// ==================== 类型守卫与类型保护接口 ====================

/**
 * 类型保护接口
 */
interface TypeGuard<T> {
    (value: unknown): value is T;
}

/**
 * 创建类型守卫
 * @param check - 检查函数
 * @returns 类型守卫
 */
function createTypeGuard<T>(
    check: (value: unknown) => boolean
): TypeGuard<T> {
    return (value: unknown): value is T => check(value);
}

const isStringGuard = createTypeGuard<string>(
    (value): value is string => typeof value === "string"
);

const isNumberGuard = createTypeGuard<number>(
    (value): value is number => typeof value === "number"
);

console.log("\n=== 类型守卫与类型保护接口 ===");

console.log("isStringGuard('hello'):", isStringGuard("hello"));
console.log("isStringGuard(42):", isStringGuard(42));
console.log("isNumberGuard(42):", isNumberGuard(42));
console.log("isNumberGuard('hello'):", isNumberGuard("hello"));

// ==================== 总结 ====================

console.log("\n=== 类型守卫示例完成 ===");
console.log("类型守卫的主要特点：");
console.log("1. typeof 类型守卫：检查原始类型");
console.log("2. instanceof 类型守卫：检查类实例");
console.log("3. 自定义类型守卫：使用类型谓词");
console.log("4. in 操作符类型守卫：检查属性存在");
console.log("5. 可辨识联合类型守卫：检查字面量属性");
console.log("6. 类型缩窄：在特定作用域内缩小类型范围");
