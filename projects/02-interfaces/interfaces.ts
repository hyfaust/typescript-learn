/**
 * TypeScript 接口示例
 * 本文件演示 TypeScript 中接口的定义和使用
 */

// ==================== 基本接口定义 ====================
console.log("=== 基本接口定义 ===");

// 定义一个用户接口
interface User {
    id: number;
    name: string;
    email: string;
    age?: number; // 可选属性
}

// 使用接口
const user1: User = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
};

const user2: User = {
    id: 2,
    name: "Bob",
    email: "bob@example.com",
    age: 25
};

console.log("用户1:", user1);
console.log("用户2:", user2);

// ==================== 只读属性 ====================
console.log("\n=== 只读属性 ===");

interface Point {
    readonly x: number;
    readonly y: number;
}

const point: Point = { x: 10, y: 20 };
console.log("坐标点:", point);
console.log("X坐标:", point.x);

// point.x = 30; // 错误：只读属性不能修改

// 只读数组
interface ReadonlyArrayExample {
    readonly numbers: readonly number[];
    readonly names: readonly string[];
}

const readonlyExample: ReadonlyArrayExample = {
    numbers: [1, 2, 3],
    names: ["Alice", "Bob"]
};

console.log("只读数组:", readonlyExample);
// readonlyExample.numbers.push(4); // 错误：只读数组不能修改

// ==================== 函数类型接口 ====================
console.log("\n=== 函数类型接口 ===");

// 定义函数类型接口
interface SearchFunc {
    (source: string, subString: string): boolean;
}

// 使用函数类型接口
const mySearch: SearchFunc = (source, subString) => {
    return source.search(subString) > -1;
};

console.log("搜索结果:", mySearch("Hello World", "World")); // true
console.log("搜索结果:", mySearch("Hello World", "TypeScript")); // false

// 更复杂的函数类型
interface MathOperation {
    (a: number, b: number): number;
}

interface EventHandler {
    (event: string, data: any): void;
}

const add: MathOperation = (a, b) => a + b;
const subtract: MathOperation = (a, b) => a - b;

const handleEvent: EventHandler = (event, data) => {
    console.log(`事件: ${event}`, data);
};

console.log("加法:", add(5, 3));
console.log("减法:", subtract(10, 4));
handleEvent("click", { x: 100, y: 200 });

// ==================== 索引签名 ====================
console.log("\n=== 索引签名 ===");

// 数字索引签名
interface StringArray {
    [index: number]: string;
}

const myArray: StringArray = ["Alice", "Bob", "Charlie"];
console.log("数组元素:", myArray[0]); // "Alice"

// 字符串索引签名
interface Dictionary {
    [key: string]: any;
}

const dict: Dictionary = {
    name: "Alice",
    age: 25,
    isActive: true
};

console.log("字典:", dict);
console.log("字典值:", dict["name"]); // "Alice"

// 混合索引签名
interface MixedIndex {
    [index: number]: string;
    [key: string]: string | number;
    length: number; // 具名属性
}

const mixedArray: MixedIndex = {
    0: "zero",
    1: "one",
    length: 2,
    name: "mixed"
};

console.log("混合索引:", mixedArray);

// ==================== 接口继承 ====================
console.log("\n=== 接口继承 ===");

// 单继承
interface Animal {
    name: string;
    age: number;
}

interface Dog extends Animal {
    breed: string;
    bark(): void;
}

const myDog: Dog = {
    name: "Buddy",
    age: 3,
    breed: "Golden Retriever",
    bark() {
        console.log("Woof!");
    }
};

console.log("狗:", myDog);
myDog.bark();

// 多继承
interface Printable {
    print(): void;
}

interface Loggable {
    log(): void;
}

interface Document extends Printable, Loggable {
    title: string;
    content: string;
}

const doc: Document = {
    title: "My Document",
    content: "Hello World",
    print() {
        console.log(`打印: ${this.title}`);
    },
    log() {
        console.log(`日志: ${this.title}`);
    }
};

console.log("文档:", doc);
doc.print();
doc.log();

// ==================== 接口合并 ====================
console.log("\n=== 接口合并 ===");

// 接口可以自动合并
interface MergeInterface {
    name: string;
}

interface MergeInterface {
    age: number;
}

// 合并后的接口包含两个属性
const merged: MergeInterface = {
    name: "Alice",
    age: 25
};

console.log("合并接口:", merged);

// ==================== 接口实现 ====================
console.log("\n=== 接口实现 ===");

interface Shape {
    area(): number;
    perimeter(): number;
}

interface Circle extends Shape {
    radius: number;
}

interface Rectangle extends Shape {
    width: number;
    height: number;
}

// 实现接口
class CircleImpl implements Circle {
    constructor(public radius: number) {}
    
    area(): number {
        return Math.PI * this.radius * this.radius;
    }
    
    perimeter(): number {
        return 2 * Math.PI * this.radius;
    }
}

class RectangleImpl implements Rectangle {
    constructor(public width: number, public height: number) {}
    
    area(): number {
        return this.width * this.height;
    }
    
    perimeter(): number {
        return 2 * (this.width + this.height);
    }
}

const circle = new CircleImpl(5);
const rectangle = new RectangleImpl(10, 20);

console.log("圆形面积:", circle.area());
console.log("圆形周长:", circle.perimeter());
console.log("矩形面积:", rectangle.area());
console.log("矩形周长:", rectangle.perimeter());

// ==================== 实际应用示例 ====================
console.log("\n=== 实际应用示例 ===");

// API 响应接口
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp: number;
}

interface UserData {
    id: number;
    name: string;
    email: string;
}

const userResponse: ApiResponse<UserData> = {
    success: true,
    data: {
        id: 1,
        name: "Alice",
        email: "alice@example.com"
    },
    timestamp: Date.now()
};

console.log("API 响应:", userResponse);

// 配置接口
interface DatabaseConfig {
    host: string;
    port: number;
    name: string;
    credentials?: {
        username: string;
        password: string;
    };
}

interface ServerConfig {
    port: number;
    host: string;
    cors?: {
        origin: string | string[];
        credentials: boolean;
    };
}

interface AppConfig {
    database: DatabaseConfig;
    server: ServerConfig;
    logging: {
        level: "debug" | "info" | "warn" | "error";
        file?: string;
    };
}

const appConfig: AppConfig = {
    database: {
        host: "localhost",
        port: 5432,
        name: "mydb"
    },
    server: {
        port: 3000,
        host: "0.0.0.0",
        cors: {
            origin: "*",
            credentials: true
        }
    },
    logging: {
        level: "info"
    }
};

console.log("应用配置:", appConfig);

// ==================== 高级接口模式 ====================
console.log("\n=== 高级接口模式 ===");

// 条件接口 - 使用联合类型而不是条件类型
interface UserDataInterface {
    type: "user";
    data: { name: string; email: string };
}

interface AdminDataInterface {
    type: "admin";
    data: { name: string; permissions: string[] };
}

type ConditionalInterface = UserDataInterface | AdminDataInterface;

const userData: ConditionalInterface = {
    type: "user",
    data: {
        name: "Alice",
        email: "alice@example.com"
    }
};

const adminData: ConditionalInterface = {
    type: "admin",
    data: {
        name: "Admin",
        permissions: ["read", "write", "delete"]
    }
};

console.log("用户数据:", userData);
console.log("管理员数据:", adminData);

// 接口与泛型结合
interface Repository<T> {
    findById(id: number): T | undefined;
    findAll(): T[];
    create(item: Omit<T, "id">): T;
    update(id: number, item: Partial<T>): T | undefined;
    delete(id: number): boolean;
}

interface UserEntity {
    id: number;
    name: string;
    email: string;
}

class UserRepository implements Repository<UserEntity> {
    private users: UserEntity[] = [];
    
    findById(id: number): UserEntity | undefined {
        return this.users.find(u => u.id === id);
    }
    
    findAll(): UserEntity[] {
        return [...this.users];
    }
    
    create(item: Omit<UserEntity, "id">): UserEntity {
        const newUser: UserEntity = {
            id: this.users.length + 1,
            ...item
        };
        this.users.push(newUser);
        return newUser;
    }
    
    update(id: number, item: Partial<UserEntity>): UserEntity | undefined {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...item };
            return this.users[index];
        }
        return undefined;
    }
    
    delete(id: number): boolean {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.users.splice(index, 1);
            return true;
        }
        return false;
    }
}

const userRepo = new UserRepository();
userRepo.create({ name: "Alice", email: "alice@example.com" });
userRepo.create({ name: "Bob", email: "bob@example.com" });

console.log("所有用户:", userRepo.findAll());
console.log("查找用户:", userRepo.findById(1));

// ==================== 运行说明 ====================
console.log("\n=== 运行说明 ===");
console.log("使用以下命令运行此文件:");
console.log("deno run interfaces.ts");
console.log("deno run --allow-all interfaces.ts");
