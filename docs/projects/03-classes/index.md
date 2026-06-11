# TypeScript 类和面向对象编程

## 类简介

TypeScript 中的类是对 JavaScript 类的扩展，添加了类型注解、访问修饰符、抽象类等面向对象特性。类是创建对象的蓝图，它定义了对象应该具有哪些属性和方法。

### TypeScript 类与 JavaScript 类的区别

| 特性 | JavaScript 类 | TypeScript 类 |
|------|---------------|---------------|
| 类型系统 | 无类型 | 有类型注解 |
| 访问修饰符 | 无 | public, private, protected |
| 抽象类 | 无 | 支持 abstract |
| 接口实现 | 无 | 支持 implements |
| 参数属性 | 无 | 支持 |
| 类型检查 | 运行时 | 编译时 |

## 类定义

### 基本类定义

```typescript
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
}

// 使用类
const person = new Person("Alice", 25);
console.log(person.greet());
```

### 简洁写法（参数属性）

```typescript
class Person {
    // 参数属性：在构造函数参数前添加访问修饰符
    constructor(
        public name: string,
        public age: number,
        private email: string
    ) {}
    
    greet(): string {
        return `Hello, my name is ${this.name}`;
    }
}
```

## 继承

继承是面向对象编程的核心概念之一，它允许子类继承父类的属性和方法。

### 基本继承

```typescript
class Animal {
    constructor(public name: string) {}
    
    speak(): string {
        return `${this.name} makes a sound.`;
    }
}

class Dog extends Animal {
    constructor(name: string, public breed: string) {
        super(name); // 调用父类构造函数
    }
    
    speak(): string {
        return `${this.name} barks.`;
    }
    
    fetch(): string {
        return `${this.name} fetches the ball.`;
    }
}

const dog = new Dog("Buddy", "Golden Retriever");
console.log(dog.speak()); // "Buddy barks."
console.log(dog.fetch()); // "Buddy fetches the ball."
```

## 访问修饰符

TypeScript 提供了三种访问修饰符来控制类成员的可见性。

### public（公共）

```typescript
class PublicExample {
    public name: string; // 公共属性
    
    constructor(name: string) {
        this.name = name;
    }
    
    public greet(): string { // 公共方法
        return `Hello, ${this.name}`;
    }
}

// 可以从任何地方访问
const example = new PublicExample("Alice");
console.log(example.name); // 可以访问
console.log(example.greet()); // 可以访问
```

### private（私有）

```typescript
class PrivateExample {
    private secret: string; // 私有属性
    
    constructor(secret: string) {
        this.secret = secret;
    }
    
    private revealSecret(): string { // 私有方法
        return this.secret;
    }
    
    public getSecret(): string { // 公共方法可以访问私有成员
        return this.revealSecret();
    }
}

const privateExample = new PrivateExample("my secret");
// console.log(privateExample.secret); // 错误：私有属性不能访问
console.log(privateExample.getSecret()); // 可以通过公共方法访问
```

### protected（受保护）

```typescript
class ProtectedExample {
    protected name: string; // 受保护属性
    
    constructor(name: string) {
        this.name = name;
    }
    
    protected greet(): string { // 受保护方法
        return `Hello, ${this.name}`;
    }
}

class Child extends ProtectedExample {
    constructor(name: string) {
        super(name);
    }
    
    public introduce(): string {
        // 可以在子类中访问受保护成员
        return this.greet(); // 可以访问
    }
}

const child = new Child("Alice");
console.log(child.introduce()); // 可以访问
// console.log(child.name); // 错误：受保护属性不能直接访问
```

## 抽象类

抽象类是不能被实例化的类，通常用作其他类的基类。

### 抽象类定义

```typescript
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

const circle = new Circle(5);
console.log(circle.describe());
```

## 静态成员

静态成员属于类本身，而不是类的实例。

### 静态属性和方法

```typescript
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
}

// 通过类名访问静态成员
console.log(MathUtils.PI); // 3.14159
console.log(MathUtils.add(5, 3)); // 8

// 不能通过实例访问
// const math = new MathUtils();
// console.log(math.PI); // 错误
```

## getter 和 setter

getter 和 setter 提供了对属性访问的控制。

### 基本 getter 和 setter

```typescript
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
console.log(temp.celsius); // 100
console.log(temp.fahrenheit); // 212

temp.fahrenheit = 32;
console.log(temp.celsius); // 0
```

## 示例代码说明

本目录包含以下示例文件：

1. **classes.ts** - 类定义和基本特性示例
2. **inheritance.ts** - 继承和高级特性示例
3. **deno.json** - Deno 配置文件

### 运行示例

```bash
# 运行类示例
deno run classes.ts

# 运行继承示例
deno run inheritance.ts

# 类型检查
deno check classes.ts inheritance.ts
```

## 练习题

### 练习1：基本类

定义一个 `Student` 类，包含以下属性和方法：
- 属性：`name`, `age`, `grade`
- 方法：`study()` 返回学习信息
- 方法：`getGrade()` 返回年级

```typescript
class Student {
    // 实现代码
}
```

### 练习2：继承

创建一个 `GraduateStudent` 类，继承 `Student` 类，并添加：
- 属性：`researchTopic`
- 方法：`research()` 返回研究信息

```typescript
class GraduateStudent extends Student {
    // 实现代码
}
```

### 练习3：访问修饰符

创建一个 `BankAccount` 类，使用适当的访问修饰符：
- 私有属性：`balance`
- 公共方法：`deposit()`, `withdraw()`, `getBalance()`
- 受保护方法：`calculateInterest()`

```typescript
class BankAccount {
    // 实现代码
}
```

### 练习4：抽象类

定义一个抽象类 `Vehicle`，包含：
- 抽象方法：`start()`, `stop()`
- 具体方法：`describe()`
- 然后创建 `Car` 和 `Motorcycle` 类实现它

```typescript
abstract class Vehicle {
    // 实现代码
}

class Car extends Vehicle {
    // 实现代码
}

class Motorcycle extends Vehicle {
    // 实现代码
}
```

### 练习5：静态成员

创建一个 `Calculator` 类，包含：
- 静态属性：`PI`, `E`
- 静态方法：`add()`, `subtract()`, `multiply()`, `divide()`
- 实例方法：`calculate()` 接收操作符和两个数字

```typescript
class Calculator {
    // 实现代码
}
```

### 练习6：getter 和 setter

创建一个 `Rectangle` 类，使用 getter 和 setter：
- 属性：`width`, `height`
- getter：`area`, `perimeter`
- setter：带有验证逻辑

```typescript
class Rectangle {
    // 实现代码
}
```

## 最佳实践

1. **使用访问修饰符**：明确指定成员的可见性
2. **优先使用组合而非继承**：继承应该用于"is-a"关系
3. **使用抽象类定义契约**：当多个类有共同行为时
4. **避免过度使用静态成员**：静态成员应该用于工具方法
5. **使用参数属性简化构造函数**：减少样板代码
6. **实现接口**：使用 `implements` 关键字实现接口

## 设计模式示例

### 单例模式

```typescript
class Database {
    private static instance: Database;
    
    private constructor() {}
    
    static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    
    query(sql: string): void {
        console.log(`Executing: ${sql}`);
    }
}

const db = Database.getInstance();
db.query("SELECT * FROM users");
```

### 工厂模式

```typescript
abstract class Creator {
    abstract createProduct(): Product;
    
    someOperation(): string {
        const product = this.createProduct();
        return `Creator: ${product.operation()}`;
    }
}

interface Product {
    operation(): string;
}

class ConcreteCreatorA extends Creator {
    createProduct(): Product {
        return new ConcreteProductA();
    }
}

class ConcreteProductA implements Product {
    operation(): string {
        return "ConcreteProductA";
    }
}
```

## 下一步

完成本项目后，你将掌握：

1. TypeScript 类的定义和使用
2. 继承和 super 关键字的使用
3. 访问修饰符（public, private, protected）的区别和使用
4. 抽象类的定义和实现
5. 静态成员的使用
6. getter 和 setter 的实现

接下来，我们将学习 **泛型**，这是 TypeScript 中另一个强大的特性。

---

## 项目导航

[上一个项目：接口和类型](/projects/02-interfaces/)

[下一个项目：泛型编程](/projects/04-generics/)

[返回学习路径](/learning-path/)
