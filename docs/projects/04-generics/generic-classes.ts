/**
 * TypeScript 泛型类示例
 * 本文件演示了泛型类的定义、实现和实际应用场景
 * 运行环境：Deno
 */

// ==================== 基本泛型类 ====================

/**
 * 基本的泛型类 - 泛型数字类
 * @param T - 数字类型
 */
class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
    
    constructor(zeroValue: T, addFn: (x: T, y: T) => T) {
        this.zeroValue = zeroValue;
        this.add = addFn;
    }
}

console.log("=== 基本泛型类 ===");

// 使用泛型类
const myGenericNumber = new GenericNumber<number>(0, (x, y) => x + y);
console.log("myGenericNumber.add(5, 10):", myGenericNumber.add(5, 10));

const stringNumeric = new GenericNumber<string>("", (x, y) => x + y);
console.log("stringNumeric.add('Hello', ' World'):", stringNumeric.add("Hello", " World"));

// ==================== 泛型栈实现 ====================

/**
 * 泛型栈实现
 * @param T - 栈元素的类型
 */
class Stack<T> {
    private items: T[] = [];
    
    /**
     * 将元素压入栈顶
     * @param item - 要压入的元素
     */
    push(item: T): void {
        this.items.push(item);
    }
    
    /**
     * 弹出栈顶元素
     * @returns 栈顶元素或undefined
     */
    pop(): T | undefined {
        return this.items.pop();
    }
    
    /**
     * 查看栈顶元素但不弹出
     * @returns 栈顶元素或undefined
     */
    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }
    
    /**
     * 检查栈是否为空
     * @returns 是否为空
     */
    isEmpty(): boolean {
        return this.items.length === 0;
    }
    
    /**
     * 获取栈的大小
     * @returns 栈中元素的数量
     */
    size(): number {
        return this.items.length;
    }
    
    /**
     * 清空栈
     */
    clear(): void {
        this.items = [];
    }
    
    /**
     * 将栈转换为数组
     * @returns 包含栈中所有元素的数组
     */
    toArray(): T[] {
        return [...this.items];
    }
    
    /**
     * 检查栈是否包含某个元素
     * @param item - 要检查的元素
     * @returns 是否包含
     */
    contains(item: T): boolean {
        return this.items.includes(item);
    }
    
    /**
     * 遍历栈中的元素
     * @param callback - 回调函数
     */
    forEach(callback: (item: T, index: number) => void): void {
        this.items.forEach(callback);
    }
}

console.log("\n=== 泛型栈实现 ===");

// 使用数字栈
const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
numberStack.push(3);
numberStack.push(4);

console.log("Number stack size:", numberStack.size());
console.log("Peek:", numberStack.peek());
console.log("Pop:", numberStack.pop());
console.log("Contains 2:", numberStack.contains(2));
console.log("Array:", numberStack.toArray());

// 使用字符串栈
const stringStack = new Stack<string>();
stringStack.push("hello");
stringStack.push("world");
stringStack.push("typescript");

console.log("\nString stack:");
stringStack.forEach((item, index) => {
    console.log(`  ${index}: ${item}`);
});

// ==================== 泛型队列实现 ====================

/**
 * 泛型队列实现
 * @param T - 队列元素的类型
 */
class Queue<T> {
    private items: T[] = [];
    
    /**
     * 将元素加入队列尾部
     * @param item - 要加入的元素
     */
    enqueue(item: T): void {
        this.items.push(item);
    }
    
    /**
     * 从队列头部移除元素
     * @returns 移除的元素或undefined
     */
    dequeue(): T | undefined {
        return this.items.shift();
    }
    
    /**
     * 查看队列头部元素
     * @returns 队列头部元素或undefined
     */
    front(): T | undefined {
        return this.items[0];
    }
    
    /**
     * 查看队列尾部元素
     * @returns 队列尾部元素或undefined
     */
    back(): T | undefined {
        return this.items[this.items.length - 1];
    }
    
    /**
     * 检查队列是否为空
     * @returns 是否为空
     */
    isEmpty(): boolean {
        return this.items.length === 0;
    }
    
    /**
     * 获取队列的大小
     * @returns 队列中元素的数量
     */
    size(): number {
        return this.items.length;
    }
    
    /**
     * 清空队列
     */
    clear(): void {
        this.items = [];
    }
    
    /**
     * 将队列转换为数组
     * @returns 包含队列中所有元素的数组
     */
    toArray(): T[] {
        return [...this.items];
    }
}

console.log("\n=== 泛型队列实现 ===");

const taskQueue = new Queue<string>();
taskQueue.enqueue("Task 1");
taskQueue.enqueue("Task 2");
taskQueue.enqueue("Task 3");

console.log("Queue size:", taskQueue.size());
console.log("Front:", taskQueue.front());
console.log("Back:", taskQueue.back());
console.log("Dequeue:", taskQueue.dequeue());
console.log("After dequeue, front:", taskQueue.front());

// ==================== 泛型链表实现 ====================

/**
 * 链表节点
 * @param T - 节点值的类型
 */
class ListNode<T> {
    value: T;
    next: ListNode<T> | null = null;
    
    constructor(value: T) {
        this.value = value;
    }
}

/**
 * 泛型链表实现
 * @param T - 链表元素的类型
 */
class LinkedList<T> {
    private head: ListNode<T> | null = null;
    private length: number = 0;
    
    /**
     * 在链表头部插入元素
     * @param value - 要插入的值
     */
    prepend(value: T): void {
        const newNode = new ListNode(value);
        newNode.next = this.head;
        this.head = newNode;
        this.length++;
    }
    
    /**
     * 在链表尾部插入元素
     * @param value - 要插入的值
     */
    append(value: T): void {
        const newNode = new ListNode(value);
        
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        
        this.length++;
    }
    
    /**
     * 在指定位置插入元素
     * @param index - 插入位置
     * @param value - 要插入的值
     * @returns 是否成功插入
     */
    insertAt(index: number, value: T): boolean {
        if (index < 0 || index > this.length) {
            return false;
        }
        
        if (index === 0) {
            this.prepend(value);
            return true;
        }
        
        const newNode = new ListNode(value);
        let current = this.head;
        
        for (let i = 0; i < index - 1; i++) {
            if (!current) return false;
            current = current.next;
        }
        
        if (!current) return false;
        
        newNode.next = current.next;
        current.next = newNode;
        this.length++;
        
        return true;
    }
    
    /**
     * 移除指定位置的元素
     * @param index - 要移除的位置
     * @returns 移除的元素或undefined
     */
    removeAt(index: number): T | undefined {
        if (index < 0 || index >= this.length || !this.head) {
            return undefined;
        }
        
        if (index === 0) {
            const value = this.head.value;
            this.head = this.head.next;
            this.length--;
            return value;
        }
        
        let current = this.head;
        
        for (let i = 0; i < index - 1; i++) {
            if (!current.next) return undefined;
            current = current.next;
        }
        
        if (!current.next) return undefined;
        
        const value = current.next.value;
        current.next = current.next.next;
        this.length--;
        
        return value;
    }
    
    /**
     * 获取指定位置的元素
     * @param index - 位置索引
     * @returns 元素或undefined
     */
    get(index: number): T | undefined {
        if (index < 0 || index >= this.length || !this.head) {
            return undefined;
        }
        
        let current = this.head;
        
        for (let i = 0; i < index; i++) {
            if (!current.next) return undefined;
            current = current.next;
        }
        
        return current.value;
    }
    
    /**
     * 查找元素的位置
     * @param value - 要查找的值
     * @returns 元素的位置或-1
     */
    indexOf(value: T): number {
        let current = this.head;
        let index = 0;
        
        while (current) {
            if (current.value === value) {
                return index;
            }
            current = current.next;
            index++;
        }
        
        return -1;
    }
    
    /**
     * 检查链表是否包含某个元素
     * @param value - 要检查的值
     * @returns 是否包含
     */
    contains(value: T): boolean {
        return this.indexOf(value) !== -1;
    }
    
    /**
     * 获取链表的大小
     * @returns 链表中元素的数量
     */
    size(): number {
        return this.length;
    }
    
    /**
     * 检查链表是否为空
     * @returns 是否为空
     */
    isEmpty(): boolean {
        return this.length === 0;
    }
    
    /**
     * 将链表转换为数组
     * @returns 包含链表中所有元素的数组
     */
    toArray(): T[] {
        const result: T[] = [];
        let current = this.head;
        
        while (current) {
            result.push(current.value);
            current = current.next;
        }
        
        return result;
    }
    
    /**
     * 反转链表
     */
    reverse(): void {
        let prev: ListNode<T> | null = null;
        let current = this.head;
        let next: ListNode<T> | null = null;
        
        while (current) {
            next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }
        
        this.head = prev;
    }
}

console.log("\n=== 泛型链表实现 ===");

const numberList = new LinkedList<number>();
numberList.append(1);
numberList.append(2);
numberList.append(3);
numberList.prepend(0);

console.log("LinkedList:", numberList.toArray());
console.log("Size:", numberList.size());
console.log("Get index 2:", numberList.get(2));
console.log("Index of 3:", numberList.indexOf(3));
console.log("Contains 2:", numberList.contains(2));

numberList.reverse();
console.log("After reverse:", numberList.toArray());

// ==================== 泛型树实现 ====================

/**
 * 树节点
 * @param T - 节点值的类型
 */
class TreeNode<T> {
    value: T;
    children: TreeNode<T>[] = [];
    
    constructor(value: T) {
        this.value = value;
    }
    
    /**
     * 添加子节点
     * @param child - 子节点
     */
    addChild(child: TreeNode<T>): void {
        this.children.push(child);
    }
    
    /**
     * 移除子节点
     * @param child - 要移除的子节点
     * @returns 是否成功移除
     */
    removeChild(child: TreeNode<T>): boolean {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * 检查是否是叶子节点
     * @returns 是否是叶子节点
     */
    isLeaf(): boolean {
        return this.children.length === 0;
    }
}

/**
 * 泛型树实现
 * @param T - 树节点值的类型
 */
class Tree<T> {
    root: TreeNode<T> | null = null;
    
    /**
     * 设置根节点
     * @param value - 根节点的值
     */
    setRoot(value: T): void {
        this.root = new TreeNode(value);
    }
    
    /**
     * 深度优先遍历
     * @param callback - 访问节点的回调函数
     */
    depthFirstTraversal(callback: (value: T) => void): void {
        if (!this.root) return;
        
        const traverse = (node: TreeNode<T>) => {
            callback(node.value);
            
            for (const child of node.children) {
                traverse(child);
            }
        };
        
        traverse(this.root);
    }
    
    /**
     * 广度优先遍历
     * @param callback - 访问节点的回调函数
     */
    breadthFirstTraversal(callback: (value: T) => void): void {
        if (!this.root) return;
        
        const queue: TreeNode<T>[] = [this.root];
        
        while (queue.length > 0) {
            const node = queue.shift()!;
            callback(node.value);
            
            for (const child of node.children) {
                queue.push(child);
            }
        }
    }
    
    /**
     * 查找节点
     * @param value - 要查找的值
     * @returns 找到的节点或null
     */
    find(value: T): TreeNode<T> | null {
        if (!this.root) return null;
        
        const search = (node: TreeNode<T>): TreeNode<T> | null => {
            if (node.value === value) {
                return node;
            }
            
            for (const child of node.children) {
                const found = search(child);
                if (found) return found;
            }
            
            return null;
        };
        
        return search(this.root);
    }
    
    /**
     * 获取树的高度
     * @returns 树的高度
     */
    getHeight(): number {
        if (!this.root) return 0;
        
        const calculateHeight = (node: TreeNode<T>): number => {
            if (node.isLeaf()) return 1;
            
            let maxHeight = 0;
            for (const child of node.children) {
                maxHeight = Math.max(maxHeight, calculateHeight(child));
            }
            
            return maxHeight + 1;
        };
        
        return calculateHeight(this.root);
    }
}

console.log("\n=== 泛型树实现 ===");

// 创建树
const tree = new Tree<string>();
tree.setRoot("Root");

const root = tree.root!;
const child1 = new TreeNode("Child 1");
const child2 = new TreeNode("Child 2");
const child3 = new TreeNode("Child 3");

root.addChild(child1);
root.addChild(child2);
root.addChild(child3);

child1.addChild(new TreeNode("Grandchild 1.1"));
child1.addChild(new TreeNode("Grandchild 1.2"));

child2.addChild(new TreeNode("Grandchild 2.1"));

console.log("Depth-first traversal:");
tree.depthFirstTraversal(value => console.log(`  ${value}`));

console.log("\nBreadth-first traversal:");
tree.breadthFirstTraversal(value => console.log(`  ${value}`));

console.log("\nTree height:", tree.getHeight());

const found = tree.find("Grandchild 2.1");
console.log("Found 'Grandchild 2.1':", found ? "Yes" : "No");

// ==================== 泛型字典实现 ====================

/**
 * 泛型字典实现
 * @param K - 键类型
 * @param V - 值类型
 */
class Dictionary<K, V> {
    private items: Map<K, V> = new Map();
    
    /**
     * 设置键值对
     * @param key - 键
     * @param value - 值
     */
    set(key: K, value: V): void {
        this.items.set(key, value);
    }
    
    /**
     * 获取值
     * @param key - 键
     * @returns 值或undefined
     */
    get(key: K): V | undefined {
        return this.items.get(key);
    }
    
    /**
     * 检查是否包含键
     * @param key - 键
     * @returns 是否包含
     */
    has(key: K): boolean {
        return this.items.has(key);
    }
    
    /**
     * 删除键值对
     * @param key - 键
     * @returns 是否成功删除
     */
    delete(key: K): boolean {
        return this.items.delete(key);
    }
    
    /**
     * 清空字典
     */
    clear(): void {
        this.items.clear();
    }
    
    /**
     * 获取字典大小
     * @returns 键值对的数量
     */
    size(): number {
        return this.items.size;
    }
    
    /**
     * 获取所有键
     * @returns 键数组
     */
    keys(): K[] {
        return Array.from(this.items.keys());
    }
    
    /**
     * 获取所有值
     * @returns 值数组
     */
    values(): V[] {
        return Array.from(this.items.values());
    }
    
    /**
     * 获取所有键值对
     * @returns 键值对数组
     */
    entries(): [K, V][] {
        return Array.from(this.items.entries());
    }
    
    /**
     * 遍历字典
     * @param callback - 回调函数
     */
    forEach(callback: (value: V, key: K) => void): void {
        this.items.forEach(callback);
    }
    
    /**
     * 映射字典
     * @param callback - 映射函数
     * @returns 新数组
     */
    map<U>(callback: (value: V, key: K) => U): U[] {
        const result: U[] = [];
        
        this.items.forEach((value, key) => {
            result.push(callback(value, key));
        });
        
        return result;
    }
    
    /**
     * 过滤字典
     * @param predicate - 过滤谓词
     * @returns 新的字典
     */
    filter(predicate: (value: V, key: K) => boolean): Dictionary<K, V> {
        const result = new Dictionary<K, V>();
        
        this.items.forEach((value, key) => {
            if (predicate(value, key)) {
                result.set(key, value);
            }
        });
        
        return result;
    }
}

console.log("\n=== 泛型字典实现 ===");

// 使用字符串键的字典
const stringDict = new Dictionary<string, number>();
stringDict.set("one", 1);
stringDict.set("two", 2);
stringDict.set("three", 3);

console.log("Dictionary size:", stringDict.size());
console.log("Get 'two':", stringDict.get("two"));
console.log("Keys:", stringDict.keys());
console.log("Values:", stringDict.values());

// 映射操作
const doubledValues = stringDict.map((value, key) => ({
    key,
    value: value * 2
}));
console.log("Doubled values:", doubledValues);

// 过滤操作
const largeValues = stringDict.filter(value => value > 1);
console.log("Large values keys:", largeValues.keys());

// ==================== 泛型类与继承 ====================

/**
 * 基础泛型类
 * @param T - 数据类型
 */
class Base<T> {
    protected data: T;
    
    constructor(data: T) {
        this.data = data;
    }
    
    /**
     * 获取数据
     * @returns 数据
     */
    getData(): T {
        return this.data;
    }
    
    /**
     * 设置数据
     * @param newData - 新数据
     */
    setData(newData: T): void {
        this.data = newData;
    }
}

/**
 * 继承泛型类
 * @param T - 数据类型
 */
class Derived<T> extends Base<T> {
    private extra: string;
    
    constructor(data: T, extra: string) {
        super(data);
        this.extra = extra;
    }
    
    /**
     * 获取额外信息
     * @returns 额外信息
     */
    getExtra(): string {
        return this.extra;
    }
    
    /**
     * 重写getData方法
     * @returns 数据
     */
    getData(): T {
        console.log("Derived getData called");
        return this.data;
    }
}

console.log("\n=== 泛型类继承 ===");

const derived = new Derived<number>(42, "extra info");
console.log("getData():", derived.getData());
console.log("getExtra():", derived.getExtra());

// ==================== 泛型工厂类 ====================

/**
 * 泛型工厂类
 * @param T - 创建的产品类型
 */
class Factory<T> {
    private creators: Map<string, () => T> = new Map();
    
    /**
     * 注册创建器
     * @param name - 创建器名称
     * @param creator - 创建函数
     */
    register(name: string, creator: () => T): void {
        this.creators.set(name, creator);
    }
    
    /**
     * 创建产品
     * @param name - 创建器名称
     * @returns 创建的产品
     */
    create(name: string): T | undefined {
        const creator = this.creators.get(name);
        
        if (!creator) {
            console.error(`Creator '${name}' not found`);
            return undefined;
        }
        
        return creator();
    }
    
    /**
     * 获取所有注册的创建器名称
     * @returns 名称数组
     */
    getRegisteredNames(): string[] {
        return Array.from(this.creators.keys());
    }
}

console.log("\n=== 泛型工厂类 ===");

// 使用工厂创建不同类型的对象
interface Shape {
    type: string;
    area(): number;
}

class Circle implements Shape {
    type = "circle";
    
    constructor(private radius: number) {}
    
    area(): number {
        return Math.PI * this.radius * this.radius;
    }
}

class Rectangle implements Shape {
    type = "rectangle";
    
    constructor(private width: number, private height: number) {}
    
    area(): number {
        return this.width * this.height;
    }
}

const shapeFactory = new Factory<Shape>();
shapeFactory.register("circle", () => new Circle(5));
shapeFactory.register("rectangle", () => new Rectangle(4, 6));

console.log("Registered shapes:", shapeFactory.getRegisteredNames());

const circle = shapeFactory.create("circle");
const rectangle = shapeFactory.create("rectangle");

console.log("Circle area:", circle?.area());
console.log("Rectangle area:", rectangle?.area());

// ==================== 泛型缓存类 ====================

/**
 * 泛型缓存类
 * @param K - 键类型
 * @param V - 值类型
 */
class Cache<K, V> {
    private cache: Map<K, { value: V; expiry: number }> = new Map();
    private defaultTTL: number;
    
    /**
     * 构造函数
     * @param defaultTTL - 默认的生存时间（毫秒）
     */
    constructor(defaultTTL: number = 60000) {
        this.defaultTTL = defaultTTL;
    }
    
    /**
     * 获取缓存值
     * @param key - 缓存键
     * @returns 缓存值或undefined
     */
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
    
    /**
     * 设置缓存值
     * @param key - 缓存键
     * @param value - 缓存值
     * @param ttl - 生存时间（毫秒）
     */
    set(key: K, value: V, ttl?: number): void {
        const expiry = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, { value, expiry });
    }
    
    /**
     * 检查缓存是否存在且未过期
     * @param key - 缓存键
     * @returns 是否存在
     */
    has(key: K): boolean {
        return this.get(key) !== undefined;
    }
    
    /**
     * 删除缓存
     * @param key - 缓存键
     * @returns 是否成功删除
     */
    delete(key: K): boolean {
        return this.cache.delete(key);
    }
    
    /**
     * 清空所有缓存
     */
    clear(): void {
        this.cache.clear();
    }
    
    /**
     * 获取缓存大小
     * @returns 缓存项数量
     */
    size(): number {
        return this.cache.size;
    }
    
    /**
     * 清理过期缓存
     * @returns 清理的缓存数量
     */
    cleanup(): number {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        
        return cleaned;
    }
}

console.log("\n=== 泛型缓存类 ===");

const userCache = new Cache<string, User>(5000);

// 设置缓存
userCache.set("user:1", { id: 1, name: "Alice", email: "alice@example.com" });
userCache.set("user:2", { id: 2, name: "Bob", email: "bob@example.com" }, 10000);

console.log("Cache size:", userCache.size());
console.log("Get user:1:", userCache.get("user:1"));
console.log("Has user:2:", userCache.has("user:2"));

// 模拟过期
setTimeout(() => {
    console.log("After 6 seconds:");
    console.log("Get user:1:", userCache.get("user:1"));  // 应该过期
    console.log("Get user:2:", userCache.get("user:2"));  // 应该存在
    console.log("Cleanup:", userCache.cleanup());
}, 6000);

// ==================== 总结 ====================

console.log("\n=== 泛型类示例完成 ===");
console.log("泛型类的主要特点：");
console.log("1. 类型参数化：可以处理多种类型");
console.log("2. 数据结构实现：栈、队列、链表、树、字典等");
console.log("3. 设计模式：工厂模式、缓存模式等");
console.log("4. 类型安全：编译时检查类型一致性");
console.log("5. 代码复用：一次编写，适用于多种类型");
