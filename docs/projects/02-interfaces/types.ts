/**
 * TypeScript 类型别名示例
 * 本文件演示 TypeScript 中类型别名的定义和使用
 */

// ==================== 基本类型别名 ====================
console.log("=== 基本类型别名 ===");

// 简单类型别名
type StringOrNumber = string | number;
type Coordinate = [number, number];
type Callback = (data: any) => void;
type Nullable<T> = T | null;

// 使用类型别名
let value: StringOrNumber = "hello";
value = 42; // 也可以赋值为数字

const point: Coordinate = [10, 20];
const callback: Callback = (data) => console.log(data);
const nullableString: Nullable<string> = null;

console.log("值:", value);
console.log("坐标:", point);
console.log("回调函数:", callback);
console.log("可空字符串:", nullableString);

// ==================== 对象类型别名 ====================
console.log("\n=== 对象类型别名 ===");

// 对象类型别名
type User = {
    id: number;
    name: string;
    email: string;
    age?: number;
};

type Point = {
    x: number;
    y: number;
};

type Rectangle = {
    width: number;
    height: number;
};

// 使用对象类型别名
const user: User = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
};

const point2D: Point = { x: 10, y: 20 };
const rect: Rectangle = { width: 100, height: 50 };

console.log("用户:", user);
console.log("点:", point2D);
console.log("矩形:", rect);

// ==================== 联合类型 ====================
console.log("\n=== 联合类型 ===");

// 联合类型
type ID = string | number;
type Shape = "circle" | "square" | "triangle";
type Status = "active" | "inactive" | "pending";

// 使用联合类型
let userId: ID = 123;
userId = "abc123"; // 也可以赋值为字符串

let shape: Shape = "circle";
let status: Status = "active";

console.log("用户ID:", userId);
console.log("形状:", shape);
console.log("状态:", status);

// 联合类型与类型守卫
function processId(id: ID): string {
    if (typeof id === "string") {
        return id.toUpperCase();
    } else {
        return id.toFixed(2);
    }
}

console.log("处理ID:", processId(123));
console.log("处理ID:", processId("abc"));

// ==================== 交叉类型 ====================
console.log("\n=== 交叉类型 ===");

// 交叉类型
type Person = {
    name: string;
    age: number;
};

type Employee = Person & {
    employeeId: number;
    department: string;
};

type Manager = Employee & {
    subordinates: Employee[];
};

// 使用交叉类型
const person: Person = {
    name: "Alice",
    age: 30
};

const employee: Employee = {
    name: "Bob",
    age: 35,
    employeeId: 12345,
    department: "Engineering"
};

const manager: Manager = {
    name: "Charlie",
    age: 40,
    employeeId: 67890,
    department: "Management",
    subordinates: [employee]
};

console.log("人:", person);
console.log("员工:", employee);
console.log("经理:", manager);

// ==================== 映射类型 ====================
console.log("\n=== 映射类型 ===");

// 映射类型
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

type Partial<T> = {
    [P in keyof T]?: T[P];
};

type Required<T> = {
    [P in keyof T]-?: T[P];
};

// 使用映射类型
interface UserInterface {
    id: number;
    name: string;
    email?: string;
}

type ReadonlyUser = Readonly<UserInterface>;
type PartialUser = Partial<UserInterface>;
type RequiredUser = Required<UserInterface>;

const readonlyUser: ReadonlyUser = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
};

// readonlyUser.id = 2; // 错误：只读属性

const partialUser: PartialUser = {
    id: 1
    // 其他属性可选
};

const requiredUser: RequiredUser = {
    id: 1,
    name: "Alice",
    email: "alice@example.com" // 必需
};

console.log("只读用户:", readonlyUser);
console.log("部分用户:", partialUser);
console.log("必需用户:", requiredUser);

// ==================== 条件类型 ====================
console.log("\n=== 条件类型 ===");

// 条件类型
type IsString<T> = T extends string ? true : false;
type IsNumber<T> = T extends number ? true : false;

// 条件类型示例
const stringCheck: IsString<string> = true;
const numberCheck: IsNumber<string> = false;

console.log("字符串检查:", stringCheck);
console.log("数字检查:", numberCheck);

// 条件类型与泛型
type ArrayOrSingle<T> = T extends any[] ? T : T[];

function ensureArray<T>(value: T): ArrayOrSingle<T> {
    if (Array.isArray(value)) {
        return value as ArrayOrSingle<T>;
    } else {
        return [value] as ArrayOrSingle<T>;
    }
}

const arr1 = ensureArray(1); // number[]
const arr2 = ensureArray([1, 2, 3]); // number[]

console.log("确保数组1:", arr1);
console.log("确保数组2:", arr2);

// ==================== 模板字面量类型 ====================
console.log("\n=== 模板字面量类型 ===");

// 模板字面量类型
type EventName = "click" | "scroll" | "keypress";
type EventHandlerName = `on${Capitalize<EventName>}`;

type CSSProperty = "margin" | "padding" | "border";
type CSSDirection = "top" | "right" | "bottom" | "left";
type CSSClass = `${CSSProperty}-${CSSDirection}`;

// 使用模板字面量类型
const eventHandler: EventHandlerName = "onClick";
const cssClass: CSSClass = "margin-top";

console.log("事件处理器:", eventHandler);
console.log("CSS类:", cssClass);

// ==================== 工具类型 ====================
console.log("\n=== 工具类型 ===");

// TypeScript 内置工具类型
interface UserInterface2 {
    id: number;
    name: string;
    email: string;
    age: number;
}

// Partial - 所有属性变为可选
type PartialUser2 = Partial<UserInterface2>;

// Readonly - 所有属性变为只读
type ReadonlyUser2 = Readonly<UserInterface2>;

// Pick - 选择部分属性
type UserBasicInfo = Pick<UserInterface2, "id" | "name">;

// Omit - 排除部分属性
type UserWithoutAge = Omit<UserInterface2, "age">;

// Record - 创建对象类型
type UserRoles = Record<string, "admin" | "user" | "guest">;

const partialUser2: PartialUser2 = { id: 1 };
const readonlyUser2: ReadonlyUser2 = {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    age: 25
};
const basicInfo: UserBasicInfo = { id: 1, name: "Alice" };
const userWithoutAge: UserWithoutAge = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
};
const userRoles: UserRoles = {
    alice: "admin",
    bob: "user",
    charlie: "guest"
};

console.log("部分用户:", partialUser2);
console.log("只读用户:", readonlyUser2);
console.log("基本信息:", basicInfo);
console.log("无年龄用户:", userWithoutAge);
console.log("用户角色:", userRoles);

// ==================== 自定义工具类型 ====================
console.log("\n=== 自定义工具类型 ===");

// 自定义工具类型
// Nullable2, Optional, Maybe 等类型可以用于实际项目中

// 深度 Readonly
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 深度 Partial
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface NestedObject {
    name: string;
    address: {
        street: string;
        city: string;
        country: string;
    };
    settings: {
        theme: string;
        notifications: boolean;
    };
}

type ReadonlyNested = DeepReadonly<NestedObject>;
type PartialNested = DeepPartial<NestedObject>;

const readonlyNested: ReadonlyNested = {
    name: "Alice",
    address: {
        street: "123 Main St",
        city: "New York",
        country: "USA"
    },
    settings: {
        theme: "dark",
        notifications: true
    }
};

// readonlyNested.name = "Bob"; // 错误：只读
// readonlyNested.address.city = "Boston"; // 错误：只读

const partialNested: PartialNested = {
    name: "Bob"
    // 其他属性可选
};

console.log("深度只读:", readonlyNested);
console.log("深度部分:", partialNested);

// ==================== 类型谓词 ====================
console.log("\n=== 类型谓词 ===");

// 类型谓词
interface Fish {
    swim(): void;
}

interface Bird {
    fly(): void;
}

function isFish(pet: Fish | Bird): pet is Fish {
    return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird): void {
    if (isFish(pet)) {
        pet.swim();
    } else {
        pet.fly();
    }
}

const fish: Fish = { swim: () => console.log("游泳") };
const bird: Bird = { fly: () => console.log("飞行") };

move(fish);
move(bird);

// ==================== 索引访问类型 ====================
console.log("\n=== 索引访问类型 ===");

// 索引访问类型
interface UserInterface3 {
    id: number;
    name: string;
    address: {
        street: string;
        city: string;
        zip: string;
    };
}

// 访问嵌套属性类型
type UserStreet = UserInterface3["address"]["street"];

// 使用索引访问类型
function getStreet(user: UserInterface3): UserStreet {
    return user.address.street;
}

const user3: UserInterface3 = {
    id: 1,
    name: "Alice",
    address: {
        street: "123 Main St",
        city: "New York",
        zip: "10001"
    }
};

console.log("街道:", getStreet(user3));

// ==================== keyof 操作符 ====================
console.log("\n=== keyof 操作符 ===");

// keyof 操作符
interface UserInterface4 {
    id: number;
    name: string;
    email: string;
}

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const user4: UserInterface4 = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
};

const name = getProperty(user4, "name");
const email = getProperty(user4, "email");

console.log("姓名:", name);
console.log("邮箱:", email);

// ==================== 实际应用示例 ====================
console.log("\n=== 实际应用示例 ===");

// API 响应类型 - 在实际项目中使用
// type ApiResponse<T> = {
//     success: boolean;
//     data: T;
//     message?: string;
//     timestamp: number;
// };

// 事件系统类型
type EventMap = {
    click: { x: number; y: number };
    scroll: { scrollTop: number };
    keypress: { key: string; code: string };
};

type EventHandler2<T extends keyof EventMap> = (event: EventMap[T]) => void;

function addEventListener<T extends keyof EventMap>(
    event: T,
    handler: EventHandler2<T>
): void {
    // 模拟添加事件监听器
    console.log(`添加事件监听器: ${event}`);
    // 在实际应用中，这里会存储handler以便后续调用
    // 这里只是演示，不实际调用handler
    // 为了通过类型检查，我们使用 void 操作符
    void handler;
}

addEventListener("click", (event) => {
    console.log("点击坐标:", event.x, event.y);
});

addEventListener("scroll", (event) => {
    console.log("滚动位置:", event.scrollTop);
});

// 配置类型
type DeepPartial2<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial2<T[P]> : T[P];
};

interface AppConfig2 {
    database: {
        host: string;
        port: number;
        name: string;
    };
    server: {
        port: number;
        host: string;
    };
    logging: {
        level: "debug" | "info" | "warn" | "error";
        file?: string;
    };
}

type PartialConfig = DeepPartial2<AppConfig2>;

function mergeConfig(defaults: AppConfig2, overrides: PartialConfig): AppConfig2 {
    return {
        database: { ...defaults.database, ...overrides.database },
        server: { ...defaults.server, ...overrides.server },
        logging: { ...defaults.logging, ...overrides.logging }
    };
}

const defaultConfig: AppConfig2 = {
    database: {
        host: "localhost",
        port: 5432,
        name: "mydb"
    },
    server: {
        port: 3000,
        host: "0.0.0.0"
    },
    logging: {
        level: "info"
    }
};

const overrides: PartialConfig = {
    database: {
        port: 5433
    },
    server: {
        port: 8080
    }
};

const finalConfig = mergeConfig(defaultConfig, overrides);
console.log("最终配置:", finalConfig);

// ==================== 运行说明 ====================
console.log("\n=== 运行说明 ===");
console.log("使用以下命令运行此文件:");
console.log("deno run types.ts");
console.log("deno run --allow-all types.ts");
