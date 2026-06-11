/**
 * TypeScript 继承示例
 * 本文件演示 TypeScript 中类的继承和高级特性
 */

// ==================== 基本继承 ====================
console.log("=== 基本继承 ===");

// 基类
class Animal {
    constructor(public name: string) {}
    
    speak(): string {
        return `${this.name} makes a sound.`;
    }
    
    move(): string {
        return `${this.name} moves.`;
    }
}

// 子类继承
class Dog extends Animal {
    constructor(name: string, public breed: string) {
        super(name); // 调用父类构造函数
    }
    
    // 重写父类方法
    override speak(): string {
        return `${this.name} barks.`;
    }
    
    // 子类特有方法
    fetch(): string {
        return `${this.name} fetches the ball.`;
    }
}

class Cat extends Animal {
    constructor(name: string, public color: string) {
        super(name);
    }
    
    override speak(): string {
        return `${this.name} meows.`;
    }
    
    purr(): string {
        return `${this.name} purrs.`;
    }
}

// 使用继承
const dog = new Dog("Buddy", "Golden Retriever");
const cat = new Cat("Whiskers", "Orange");

console.log(dog.speak()); // "Buddy barks."
console.log(dog.move()); // "Buddy moves." (继承自父类)
console.log(dog.fetch()); // "Buddy fetches the ball."

console.log(cat.speak()); // "Whiskers meows."
console.log(cat.purr()); // "Whiskers purrs."

// ==================== 多级继承 ====================
console.log("\n=== 多级继承 ===");

// 多级继承示例
class Vehicle {
    constructor(public make: string, public model: string, public year: number) {}
    
    getInfo(): string {
        return `${this.year} ${this.make} ${this.model}`;
    }
}

class Car extends Vehicle {
    constructor(
        make: string,
        model: string,
        year: number,
        public doors: number
    ) {
        super(make, model, year);
    }
    
    override getInfo(): string {
        return `${super.getInfo()}, ${this.doors} doors`;
    }
}

class SportsCar extends Car {
    constructor(
        make: string,
        model: string,
        year: number,
        doors: number,
        public horsepower: number
    ) {
        super(make, model, year, doors);
    }
    
    override getInfo(): string {
        return `${super.getInfo()}, ${this.horsepower} HP`;
    }
    
    accelerate(): string {
        return `${this.make} ${this.model} accelerates quickly!`;
    }
}

const car = new Car("Toyota", "Camry", 2023, 4);
const sportsCar = new SportsCar("Ferrari", "488", 2023, 2, 660);

console.log("汽车:", car.getInfo());
console.log("跑车:", sportsCar.getInfo());
console.log("加速:", sportsCar.accelerate());

// ==================== 访问修饰符在继承中的行为 ====================
console.log("\n=== 访问修饰符在继承中的行为 ===");

class Base {
    public publicProp: string = "public";
    private privateProp: string = "private";
    protected protectedProp: string = "protected";

    public publicMethod(): string {
        return "public method";
    }

    // privateMethod 在示例中不使用，仅用于演示
    // private privateMethod(): string {
    //     return "private method";
    // }

    protected protectedMethod(): string {
        return "protected method";
    }

    // 公共方法可以访问所有成员
    testAccess(): void {
        console.log("在基类中访问:");
        console.log("- public:", this.publicProp);
        console.log("- private:", this.privateProp);
        console.log("- protected:", this.protectedProp);
    }
}

class Derived extends Base {
    override testAccess(): void {
        console.log("在派生类中访问:");
        console.log("- public:", this.publicProp); // 可以访问
        // console.log("- private:", this.privateProp); // 错误：私有成员不能访问
        console.log("- protected:", this.protectedProp); // 可以访问
        console.log("- public method:", this.publicMethod()); // 可以访问
        // console.log("- private method:", this.privateMethod()); // 错误：私有方法不能访问
        console.log("- protected method:", this.protectedMethod()); // 可以访问
    }
}

const base = new Base();
base.testAccess();

console.log("\n");
const derived = new Derived();
derived.testAccess();

// ==================== 抽象类和继承 ====================
console.log("\n=== 抽象类和继承 ===");

abstract class Shape {
    abstract area(): number;
    abstract perimeter(): number;
    
    // 具体方法
    describe(): string {
        return `Shape with area ${this.area()} and perimeter ${this.perimeter()}`;
    }
    
    // 模板方法模式
    printInfo(): void {
        console.log("形状信息:");
        console.log("- 面积:", this.area());
        console.log("- 周长:", this.perimeter());
        console.log("- 描述:", this.describe());
    }
}

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
    
    // 可以添加额外方法
    getCircumference(): number {
        return this.perimeter();
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
    
    // 可以添加额外方法
    isSquare(): boolean {
        return this.width === this.height;
    }
}

class Triangle extends Shape {
    constructor(
        private side1: number,
        private side2: number,
        private side3: number
    ) {
        super();
    }
    
    area(): number {
        // 使用海伦公式
        const s = this.perimeter() / 2;
        return Math.sqrt(
            s * (s - this.side1) * (s - this.side2) * (s - this.side3)
        );
    }
    
    perimeter(): number {
        return this.side1 + this.side2 + this.side3;
    }
}

const shapes: Shape[] = [
    new Circle(5),
    new Rectangle(10, 20),
    new Triangle(3, 4, 5)
];

shapes.forEach((shape, index) => {
    console.log(`\n形状 ${index + 1}:`);
    shape.printInfo();
});

// ==================== 接口实现和继承 ====================
console.log("\n=== 接口实现和继承 ===");

interface Printable {
    print(): void;
}

interface Loggable {
    log(message: string): void;
}

interface Serializable {
    serialize(): string;
    deserialize(data: string): void;
}

// 实现多个接口
class Document implements Printable, Loggable, Serializable {
    private data: any = {};
    
    constructor(public title: string) {}
    
    print(): void {
        console.log(`打印文档: ${this.title}`);
    }
    
    log(message: string): void {
        console.log(`[${this.title}] ${message}`);
    }
    
    serialize(): string {
        return JSON.stringify({
            title: this.title,
            data: this.data
        });
    }
    
    deserialize(data: string): void {
        const parsed = JSON.parse(data);
        this.title = parsed.title;
        this.data = parsed.data;
    }
    
    setData(key: string, value: any): void {
        this.data[key] = value;
    }
    
    getData(key: string): any {
        return this.data[key];
    }
}

const doc = new Document("TypeScript 指南");
doc.setData("version", "1.0");
doc.setData("author", "Alice");

doc.print();
doc.log("文档已创建");

const serialized = doc.serialize();
console.log("序列化:", serialized);

const newDoc = new Document("");
newDoc.deserialize(serialized);
console.log("反序列化后:", newDoc.title);

// ==================== 混合继承模式 ====================
console.log("\n=== 混合继承模式 ===");

// 混合模式示例
type Constructor<T = {}> = new (...args: any[]) => T;

function Timestamped<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        timestamp = Date.now();
        
        getTimestamp(): Date {
            return new Date(this.timestamp);
        }
    };
}

function Activatable<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        isActive = false;
        
        activate() {
            this.isActive = true;
            console.log("已激活");
        }
        
        deactivate() {
            this.isActive = false;
            console.log("已停用");
        }
    };
}

function Disposable<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        isDisposed = false;
        
        dispose() {
            this.isDisposed = true;
            console.log("已释放");
        }
    };
}

// 基类
class BaseEntity {
    id: number;
    
    constructor(id: number) {
        this.id = id;
    }
    
    getId(): number {
        return this.id;
    }
}

// 应用混合
const EnhancedEntity = Timestamped(Activatable(Disposable(BaseEntity)));

class UserEntity extends EnhancedEntity {
    constructor(
        id: number,
        public name: string,
        public email: string
    ) {
        super(id);
    }
    
    getInfo(): string {
        return `${this.name} (${this.email})`;
    }
}

const user = new UserEntity(1, "Alice", "alice@example.com");
console.log("用户信息:", user.getInfo());
console.log("ID:", user.getId());
console.log("时间戳:", user.getTimestamp());

user.activate();
console.log("是否激活:", user.isActive);

user.dispose();
console.log("是否释放:", user.isDisposed);

// ==================== 事件系统示例 ====================
console.log("\n=== 事件系统示例 ===");

// 事件系统基类
abstract class EventEmitter {
    private listeners: Map<string, Function[]> = new Map();
    
    on(event: string, listener: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(listener);
    }
    
    off(event: string, listener: Function): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            const index = eventListeners.indexOf(listener);
            if (index > -1) {
                eventListeners.splice(index, 1);
            }
        }
    }
    
    emit(event: string, ...args: any[]): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(listener => listener(...args));
        }
    }
    
    abstract getEventNames(): string[];
}

// 数据存储类
class DataStore extends EventEmitter {
    private data: Map<string, any> = new Map();
    
    getEventNames(): string[] {
        return ["set", "delete", "clear"];
    }
    
    set(key: string, value: any): void {
        this.data.set(key, value);
        this.emit("set", key, value);
    }
    
    get(key: string): any {
        return this.data.get(key);
    }
    
    delete(key: string): boolean {
        const existed = this.data.has(key);
        if (existed) {
            this.data.delete(key);
            this.emit("delete", key);
        }
        return existed;
    }
    
    clear(): void {
        this.data.clear();
        this.emit("clear");
    }
    
    keys(): string[] {
        return Array.from(this.data.keys());
    }
    
    values(): any[] {
        return Array.from(this.data.values());
    }
}

// 使用事件系统
const store = new DataStore();

// 添加事件监听器
store.on("set", (key: string, value: any) => {
    console.log(`设置: ${key} = ${value}`);
});

store.on("delete", (key: string) => {
    console.log(`删除: ${key}`);
});

store.on("clear", () => {
    console.log("清空所有数据");
});

// 触发事件
store.set("name", "Alice");
store.set("age", 25);
store.delete("age");
store.clear();

// ==================== 工厂模式示例 ====================
console.log("\n=== 工厂模式示例 ===");

// 产品接口
interface Product {
    name: string;
    price: number;
    getDescription(): string;
}

// 具体产品
class Electronics implements Product {
    constructor(
        public name: string,
        public price: number,
        public warranty: number
    ) {}
    
    getDescription(): string {
        return `${this.name} - $${this.price} (${this.warranty}年保修)`;
    }
}

class Clothing implements Product {
    constructor(
        public name: string,
        public price: number,
        public size: string
    ) {}
    
    getDescription(): string {
        return `${this.name} - $${this.price} (尺寸: ${this.size})`;
    }
}

class Book implements Product {
    constructor(
        public name: string,
        public price: number,
        public author: string
    ) {}
    
    getDescription(): string {
        return `${this.name} - $${this.price} (作者: ${this.author})`;
    }
}

// 工厂基类
abstract class ProductFactory {
    abstract createProduct(name: string, price: number, ...args: any[]): Product;
    
    createProductWithDiscount(
        name: string,
        price: number,
        discount: number,
        ...args: any[]
    ): Product {
        const product = this.createProduct(name, price * (1 - discount), ...args);
        return product;
    }
}

// 具体工厂
class ElectronicsFactory extends ProductFactory {
    createProduct(name: string, price: number, warranty: number = 1): Product {
        return new Electronics(name, price, warranty);
    }
}

class ClothingFactory extends ProductFactory {
    createProduct(name: string, price: number, size: string = "M"): Product {
        return new Clothing(name, price, size);
    }
}

class BookFactory extends ProductFactory {
    createProduct(name: string, price: number, author: string = "Unknown"): Product {
        return new Book(name, price, author);
    }
}

// 使用工厂
const electronicsFactory = new ElectronicsFactory();
const clothingFactory = new ClothingFactory();
const bookFactory = new BookFactory();

const laptop = electronicsFactory.createProduct("笔记本电脑", 999, 2);
const tshirt = clothingFactory.createProduct("T恤", 29.99, "L");
const typescriptBook = bookFactory.createProduct("TypeScript 入门", 39.99, "Alice");

console.log("电子产品:", laptop.getDescription());
console.log("服装:", tshirt.getDescription());
console.log("书籍:", typescriptBook.getDescription());

// 使用折扣
const discountedLaptop = electronicsFactory.createProductWithDiscount(
    "笔记本电脑",
    999,
    0.1,
    2
);
console.log("折扣电子产品:", discountedLaptop.getDescription());

// ==================== 观察者模式示例 ====================
console.log("\n=== 观察者模式示例 ===");

// 观察者接口
interface Observer {
    update(subject: Subject): void;
}

// 主题接口
interface Subject {
    attach(observer: Observer): void;
    detach(observer: Observer): void;
    notify(): void;
}

// 具体主题
class TemperatureSensor implements Subject {
    private observers: Observer[] = [];
    private temperature: number = 0;
    
    attach(observer: Observer): void {
        this.observers.push(observer);
    }
    
    detach(observer: Observer): void {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }
    
    notify(): void {
        this.observers.forEach(observer => observer.update(this));
    }
    
    setTemperature(temperature: number): void {
        this.temperature = temperature;
        this.notify();
    }
    
    getTemperature(): number {
        return this.temperature;
    }
}

// 具体观察者
class TemperatureDisplay implements Observer {
    private name: string;
    
    constructor(name: string) {
        this.name = name;
    }
    
    update(subject: Subject): void {
        if (subject instanceof TemperatureSensor) {
            console.log(`${this.name}: 温度更新为 ${subject.getTemperature()}°C`);
        }
    }
}

class TemperatureAlert implements Observer {
    private threshold: number;
    
    constructor(threshold: number) {
        this.threshold = threshold;
    }
    
    update(subject: Subject): void {
        if (subject instanceof TemperatureSensor) {
            const temp = subject.getTemperature();
            if (temp > this.threshold) {
                console.log(`警报: 温度 ${temp}°C 超过阈值 ${this.threshold}°C`);
            }
        }
    }
}

// 使用观察者模式
const sensor = new TemperatureSensor();
const display1 = new TemperatureDisplay("显示器1");
const display2 = new TemperatureDisplay("显示器2");
const alert = new TemperatureAlert(30);

sensor.attach(display1);
sensor.attach(display2);
sensor.attach(alert);

sensor.setTemperature(25);
sensor.setTemperature(35);

// ==================== 运行说明 ====================
console.log("\n=== 运行说明 ===");
console.log("使用以下命令运行此文件:");
console.log("deno run inheritance.ts");
console.log("deno run --allow-all inheritance.ts");
