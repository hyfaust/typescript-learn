/**
 * TypeScript 类定义示例
 * 本文件演示 TypeScript 中类的定义和基本特性
 */

// ==================== 基本类定义 ====================
console.log("=== 基本类定义 ===");

// 基本类定义
class Person {
    // 属性声明
    name: string;
    age: number;
    
    // 构造函数
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
    
    // 方法
    greet(): string {
        return `Hello, my name is ${this.name} and I am ${this.age} years old.`;
    }
    
    // 静态方法
    static createAnonymous(): Person {
        return new Person("Anonymous", 0);
    }
}

// 使用类
const person1 = new Person("Alice", 25);
const person2 = new Person("Bob", 30);
const anonymous = Person.createAnonymous();

console.log(person1.greet());
console.log(person2.greet());
console.log(anonymous.greet());

// ==================== 参数属性 ====================
console.log("\n=== 参数属性 ===");

// 参数属性：在构造函数参数前添加访问修饰符
class User {
    constructor(
        public name: string,
        public age: number,
        private email: string,
        protected isActive: boolean = true
    ) {}
    
    getInfo(): string {
        return `${this.name} (${this.age}) - ${this.email}`;
    }
    
    isUserActive(): boolean {
        return this.isActive;
    }
}

const user = new User("Charlie", 35, "charlie@example.com");
console.log(user.getInfo());
console.log("是否活跃:", user.isUserActive());
console.log("姓名:", user.name); // 公共属性可以访问
// console.log(user.email); // 错误：私有属性不能访问

// ==================== 访问修饰符 ====================
console.log("\n=== 访问修饰符 ===");

// 访问修饰符示例
class AccessExample {
    public publicProperty: string = "public";
    private privateProperty: string = "private";
    protected protectedProperty: string = "protected";
    
    public publicMethod(): string {
        return "public method";
    }
    
    private privateMethod(): string {
        return "private method";
    }
    
    protected protectedMethod(): string {
        return "protected method";
    }
    
    // 公共方法可以访问所有成员
    testAccess(): void {
        console.log(this.publicProperty); // 可以访问
        console.log(this.privateProperty); // 可以访问
        console.log(this.protectedProperty); // 可以访问
        console.log(this.publicMethod()); // 可以访问
        console.log(this.privateMethod()); // 可以访问
        console.log(this.protectedMethod()); // 可以访问
    }
}

const access = new AccessExample();
console.log(access.publicProperty); // 可以访问
// console.log(access.privateProperty); // 错误：私有属性不能访问
// console.log(access.protectedProperty); // 错误：受保护属性不能访问
console.log(access.publicMethod()); // 可以访问
// console.log(access.privateMethod()); // 错误：私有方法不能访问
// console.log(access.protectedMethod()); // 错误：受保护方法不能访问

// ==================== getter 和 setter ====================
console.log("\n=== getter 和 setter ===");

// getter 和 setter 示例
class Temperature {
    private _celsius: number;
    
    constructor(celsius: number) {
        this._celsius = celsius;
    }
    
    // getter
    get fahrenheit(): number {
        return this._celsius * 9/5 + 32;
    }
    
    // setter
    set fahrenheit(value: number) {
        this._celsius = (value - 32) * 5/9;
    }
    
    get celsius(): number {
        return this._celsius;
    }
    
    set celsius(value: number) {
        if (value < -273.15) {
            throw new Error("Temperature below absolute zero is not possible");
        }
        this._celsius = value;
    }
}

const temp = new Temperature(100);
console.log("摄氏温度:", temp.celsius); // 100
console.log("华氏温度:", temp.fahrenheit); // 212

temp.fahrenheit = 32;
console.log("摄氏温度:", temp.celsius); // 0

temp.celsius = 37;
console.log("华氏温度:", temp.fahrenheit); // 98.6

// ==================== 静态成员 ====================
console.log("\n=== 静态成员 ===");

// 静态成员示例
class MathUtils {
    // 静态属性
    static PI: number = 3.14159;
    static E: number = 2.71828;
    
    // 静态方法
    static add(a: number, b: number): number {
        return a + b;
    }
    
    static multiply(a: number, b: number): number {
        return a * b;
    }
    
    static factorial(n: number): number {
        if (n <= 1) return 1;
        return n * this.factorial(n - 1);
    }
}

// 通过类名访问静态成员
console.log("PI:", MathUtils.PI);
console.log("E:", MathUtils.E);
console.log("加法:", MathUtils.add(5, 3));
console.log("乘法:", MathUtils.multiply(4, 6));
console.log("阶乘:", MathUtils.factorial(5));

// ==================== 抽象类 ====================
console.log("\n=== 抽象类 ===");

// 抽象类示例
abstract class Shape {
    abstract area(): number; // 抽象方法
    abstract perimeter(): number; // 抽象方法
    
    // 具体方法
    describe(): string {
        return `This shape has area ${this.area()} and perimeter ${this.perimeter()}`;
    }
}

// 不能实例化抽象类
// const shape = new Shape(); // 错误

class Circle extends Shape {
    constructor(private radius: number) {
        super();
    }
    
    area(): number {
        return Math.PI * this.radius * this.radius;
    }
    
    perimeter(): number {
        return 2 * Math.PI * this.radius;
    }
}

class Rectangle extends Shape {
    constructor(private width: number, private height: number) {
        super();
    }
    
    area(): number {
        return this.width * this.height;
    }
    
    perimeter(): number {
        return 2 * (this.width + this.height);
    }
}

const circle = new Circle(5);
const rectangle = new Rectangle(10, 20);

console.log("圆形:", circle.describe());
console.log("矩形:", rectangle.describe());

// ==================== 接口实现 ====================
console.log("\n=== 接口实现 ===");

// 接口实现示例
interface Printable {
    print(): void;
}

interface Loggable {
    log(message: string): void;
}

class Document implements Printable, Loggable {
    constructor(
        public title: string,
        public content: string
    ) {}
    
    print(): void {
        console.log(`打印文档: ${this.title}`);
        console.log(`内容: ${this.content}`);
    }
    
    log(message: string): void {
        console.log(`[${this.title}] ${message}`);
    }
}

const doc = new Document("TypeScript 入门", "这是一本关于 TypeScript 的书");
doc.print();
doc.log("文档已创建");

// ==================== 类作为类型 ====================
console.log("\n=== 类作为类型 ===");

// 类可以作为类型使用
class Point {
    constructor(public x: number, public y: number) {}
    
    distanceTo(other: Point): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// 使用类作为类型
const point1: Point = new Point(0, 0);
const point2: Point = new Point(3, 4);
console.log("距离:", point1.distanceTo(point2));

// ==================== 构造函数重载 ====================
console.log("\n=== 构造函数重载 ===");

// 构造函数重载示例
class DateWrapper {
    private date: Date;
    
    constructor();
    constructor(timestamp: number);
    constructor(dateString: string);
    constructor(year: number, month: number, day: number);
    constructor(
        yearOrTimestampOrString?: number | string,
        month?: number,
        day?: number
    ) {
        if (yearOrTimestampOrString === undefined) {
            this.date = new Date();
        } else if (typeof yearOrTimestampOrString === "number") {
            if (month !== undefined && day !== undefined) {
                this.date = new Date(yearOrTimestampOrString, month - 1, day);
            } else {
                this.date = new Date(yearOrTimestampOrString);
            }
        } else {
            this.date = new Date(yearOrTimestampOrString);
        }
    }
    
    toString(): string {
        return this.date.toISOString();
    }
}

const date1 = new DateWrapper();
const date2 = new DateWrapper(1234567890000);
const date3 = new DateWrapper("2023-01-01");
const date4 = new DateWrapper(2023, 1, 1);

console.log("当前日期:", date1.toString());
console.log("时间戳日期:", date2.toString());
console.log("字符串日期:", date3.toString());
console.log("年月日日期:", date4.toString());

// ==================== 混合类 ====================
console.log("\n=== 混合类 ===");

// 混合类示例
type Constructor<T = {}> = new (...args: any[]) => T;

function Timestamped<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        timestamp = Date.now();
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

class BaseClass {
    name = "base";
}

const MixedClass = Timestamped(Activatable(BaseClass));
const mixed = new MixedClass();
console.log("混合类:", mixed.name);
console.log("时间戳:", mixed.timestamp);
mixed.activate();
console.log("是否激活:", mixed.isActive);

// ==================== 实际应用示例 ====================
console.log("\n=== 实际应用示例 ===");

// 数据库实体基类
abstract class BaseEntity {
    abstract id: number;
    
    abstract toJSON(): object;
    
    toString(): string {
        return JSON.stringify(this.toJSON());
    }
}

// 用户实体
class UserEntity extends BaseEntity {
    constructor(
        public id: number,
        public name: string,
        public email: string,
        public createdAt: Date = new Date()
    ) {
        super();
    }
    
    toJSON(): object {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            createdAt: this.createdAt.toISOString()
        };
    }
    
    // 静态工厂方法
    static create(name: string, email: string): UserEntity {
        return new UserEntity(Date.now(), name, email);
    }
    
    // 静态验证方法
    static validate(user: UserEntity): boolean {
        return user.name.length > 0 && user.email.includes("@");
    }
}

// 服务类
class UserService {
    private users: UserEntity[] = [];
    
    add(user: UserEntity): void {
        if (UserEntity.validate(user)) {
            this.users.push(user);
        } else {
            throw new Error("Invalid user data");
        }
    }
    
    findById(id: number): UserEntity | undefined {
        return this.users.find(u => u.id === id);
    }
    
    findAll(): UserEntity[] {
        return [...this.users];
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

// 使用示例
const userService = new UserService();
const user1 = UserEntity.create("Alice", "alice@example.com");
const user2 = UserEntity.create("Bob", "bob@example.com");

userService.add(user1);
userService.add(user2);

console.log("所有用户:", userService.findAll());
console.log("查找用户:", userService.findById(user1.id));

// ==================== 运行说明 ====================
console.log("\n=== 运行说明 ===");
console.log("使用以下命令运行此文件:");
console.log("deno run classes.ts");
console.log("deno run --allow-all classes.ts");
