# TypeScript 接口和类型

## 接口简介

接口是 TypeScript 中定义对象结构的核心方式。它描述了对象应该具有哪些属性和方法，是类型检查的重要工具。

### 接口与类型别名的区别

| 特性 | 接口 (interface) | 类型别名 (type) |
|------|------------------|-----------------|
| 定义方式 | `interface` 关键字 | `type` 关键字 |
| 扩展方式 | 使用 `extends` | 使用交叉类型 `&` |
| 声明合并 | 支持 | 不支持 |
| 适用范围 | 主要用于对象 | 可用于任何类型 |
| 性能 | 稍好 | 相同 |

## 接口定义

### 基本接口

```typescript
// 定义一个用户接口
interface User {
    id: number;
    name: string;
    email: string;
    age?: number; // 可选属性
}

// 使用接口
const user: User = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
};
```

### 只读属性

```typescript
interface Point {
    readonly x: number;
    readonly y: number;
}

const point: Point = { x: 10, y: 20 };
// point.x = 30; // 错误：只读属性不能修改
```

### 函数类型接口

```typescript
interface SearchFunc {
    (source: string, subString: string): boolean;
}

const mySearch: SearchFunc = (source, subString) => {
    return source.search(subString) > -1;
};
```

### 索引签名

```typescript
interface StringArray {
    [index: number]: string;
}

interface Dictionary {
    [key: string]: any;
}
```

## 类型别名

类型别名使用 `type` 关键字定义，可以为任何类型创建新名称。

### 基本类型别名

```typescript
type StringOrNumber = string | number;
type Coordinate = [number, number];
type Callback = (data: any) => void;
```

### 对象类型别名

```typescript
type User = {
    id: number;
    name: string;
    email: string;
};

type Point = {
    x: number;
    y: number;
};
```

### 联合类型和交叉类型

```typescript
// 联合类型
type ID = string | number;
type Shape = "circle" | "square" | "triangle";

// 交叉类型
type Employee = Person & {
    employeeId: number;
    department: string;
};
```

## 可选属性和只读属性

### 可选属性

```typescript
interface Config {
    host: string;
    port: number;
    debug?: boolean; // 可选
    timeout?: number; // 可选
}

// 使用可选属性
const config: Config = {
    host: "localhost",
    port: 3000
};
```

### 只读属性

```typescript
interface Database {
    readonly host: string;
    readonly port: number;
    readonly credentials: {
        username: string;
        password: string;
    };
}

const db: Database = {
    host: "localhost",
    port: 5432,
    credentials: {
        username: "admin",
        password: "secret"
    }
};

// db.host = "other"; // 错误
```

## 函数类型接口

```typescript
interface MathOperation {
    (a: number, b: number): number;
}

interface EventHandler {
    (event: string, data: any): void;
}

// 使用函数类型接口
const add: MathOperation = (a, b) => a + b;
const handleEvent: EventHandler = (event, data) => {
    console.log(event, data);
};
```

## 接口继承

接口可以通过 `extends` 关键字继承其他接口。

### 单继承

```typescript
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
```

### 多继承

```typescript
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
        console.log(this.title);
    },
    log() {
        console.log(`Document: ${this.title}`);
    }
};
```

## 示例代码说明

本目录包含以下示例文件：

1. **interfaces.ts** - 接口定义和使用示例
2. **types.ts** - 类型别名和高级类型示例
3. **deno.json** - Deno 配置文件

### 运行示例

```bash
# 运行接口示例
deno run interfaces.ts

# 运行类型示例
deno run types.ts

# 类型检查
deno check interfaces.ts types.ts
```

## 练习题

### 练习1：定义接口

定义一个 `Product` 接口，包含以下属性：
- `id`: 数字类型
- `name`: 字符串类型
- `price`: 数字类型
- `description`: 可选字符串类型
- `tags`: 字符串数组

```typescript
interface Product {
    // 实现代码
}
```

### 练习2：接口继承

创建一个 `DiscountedProduct` 接口，继承 `Product` 接口，并添加：
- `originalPrice`: 数字类型
- `discount`: 数字类型（0-1之间）

```typescript
interface DiscountedProduct extends Product {
    // 实现代码
}
```

### 练习3：函数类型接口

定义一个 `Validator` 接口，用于验证数据：
```typescript
interface Validator<T> {
    validate(data: T): ValidationResult;
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
```

### 练习4：索引签名

创建一个 `StringMap` 接口，使用索引签名：
```typescript
interface StringMap {
    // 实现代码
}

// 使用示例
const map: StringMap = {
    key1: "value1",
    key2: "value2"
};
```

### 练习5：混合接口

创建一个 `Repository` 接口，包含：
- 方法：`findById(id: number): T`
- 方法：`findAll(): T[]`
- 方法：`create(item: T): T`
- 方法：`update(id: number, item: Partial<T>): T`
- 方法：`delete(id: number): boolean`

```typescript
interface Repository<T> {
    // 实现代码
}
```

## 实际应用示例

### API 响应接口

```typescript
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp: number;
}

interface User {
    id: number;
    name: string;
    email: string;
}

// 使用示例
const response: ApiResponse<User> = {
    success: true,
    data: {
        id: 1,
        name: "Alice",
        email: "alice@example.com"
    },
    timestamp: Date.now()
};
```

### 配置管理接口

```typescript
interface AppConfig {
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

// 使用示例
const config: AppConfig = {
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
```

## 最佳实践

1. **使用接口定义对象结构**：接口更适合定义对象的形状
2. **使用类型别名定义联合类型**：当需要定义联合类型或交叉类型时使用 `type`
3. **保持接口简单**：避免创建过于复杂的接口
4. **使用可选属性**：对于可能不存在的属性使用 `?` 标记
5. **使用只读属性**：对于不应该被修改的属性使用 `readonly`

## 下一步

完成本项目后，你将掌握：

1. TypeScript 接口的定义和使用
2. 类型别名的定义和使用
3. 可选属性和只读属性的使用
4. 函数类型接口的定义
5. 接口的继承和组合

接下来，我们将学习 **类和面向对象编程**，这是 TypeScript 中另一个重要的概念。

---

## 项目导航

[上一个项目：基础入门](/projects/01-basics/)

[下一个项目：类和面向对象](/projects/03-classes/)

[返回学习路径](/learning-path/)
