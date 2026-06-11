---
layout: home

hero:
  name: "TypeScript 从入门到精通"
  text: "Deno 学习路径"
  tagline: 通过一系列精心设计的项目，从 TypeScript 入门到精通
  actions:
    - theme: brand
      text: 开始学习
      link: /learning-path/
    - theme: alt
      text: 查看项目
      link: /projects/

features:
  - icon: 🎯
    title: 渐进式学习
    details: 从基础语法到高级特性，循序渐进的学习路径
  - icon: 🛠️
    title: 实战项目
    details: 12个精心设计的项目，涵盖本地工具和Web应用
  - icon: 🚀
    title: Deno 运行时
    details: 使用现代化的 Deno 运行时，原生 TypeScript 支持
  - icon: 📚
    title: 详细文档
    details: 每个项目都有详细的概念解释和步骤说明
  - icon: 💡
    title: TypeScript 特色
    details: 深入讲解 TypeScript 与 JavaScript 的区别
  - icon: 🧪
    title: 动手实践
    details: 丰富的示例代码和练习题，边学边练
---

## 为什么选择这个学习路径？

### 📈 系统化的学习路径

本学习路径从 TypeScript 基础语法开始，逐步深入到高级特性，最后通过实战项目巩固所学知识。每个项目都经过精心设计，确保知识点的连贯性和递进性。

### 🎯 面向实际应用

所有项目都基于 Deno 运行时，使用真实场景的代码示例。从简单的 CLI 工具到完整的 Web 应用，让你在实际项目中掌握 TypeScript。

### 🔍 深入理解 TypeScript

特别强调 TypeScript 与 JavaScript 的区别，深入讲解类型系统、接口、泛型、装饰器等 TypeScript 特有特性，让你真正理解 TypeScript 的优势。

### 🛠️ 丰富的实践机会

每个项目都包含详细的示例代码和练习题，鼓励你动手实践，通过实际编码加深理解。

## 学习路径概览

### 阶段一：基础入门
- **项目1**：基础入门 - TypeScript 和 Deno 简介
- **项目2**：接口和类型 - 接口定义，类型别名
- **项目3**：类和面向对象 - 类定义，继承，访问修饰符

### 阶段二：进阶特性
- **项目4**：泛型编程 - 泛型函数，泛型接口
- **项目5**：高级类型 - 联合类型，交叉类型
- **项目6**：模块和命名空间 - ES 模块，模块解析

### 阶段三：高级特性
- **项目7**：异步编程 - Promise，async/await
- **项目8**：错误处理和测试 - 自定义错误，测试框架
- **项目9**：装饰器和元数据 - 装饰器工厂，元数据反射

### 阶段四：实战项目
- **项目10**：CLI 工具 - 构建命令行工具
- **项目11**：文件处理工具 - 文件系统操作，流处理
- **项目12**：Web 应用 - 构建完整的 Web 应用

## TypeScript 与 JavaScript 的区别

TypeScript 是 JavaScript 的超集，添加了静态类型系统和其他高级特性：

### 类型系统
- **静态类型检查**：在编译时捕获类型错误
- **类型推断**：自动推断变量类型
- **接口**：定义对象的结构契约
- **泛型**：创建可重用的类型安全组件

### 高级特性
- **联合类型**：变量可以是多种类型之一
- **交叉类型**：组合多个类型
- **类型守卫**：运行时类型检查
- **装饰器**：修改类和方法的行为

### 开发体验
- **更好的 IDE 支持**：自动补全、重构、导航
- **编译时错误检查**：减少运行时错误
- **代码文档化**：类型即文档

## 为什么选择 Deno？

- **原生 TypeScript 支持**：无需编译步骤
- **安全性**：默认无权限，需要显式授权
- **现代化工具链**：内置测试、格式化、检查
- **基于标准**：使用 Web 标准 API
- **模块系统**：基于 URL 的导入

## 快速开始

### 安装 Deno

```bash
# Windows (PowerShell)
iwr https://deno.land/install.ps1 -useb | iex

# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh
```

### 验证安装

```bash
deno --version
```

### 运行示例

```bash
# 运行 TypeScript 文件
deno run main.ts

# 运行测试
deno test

# 格式化代码
deno fmt

# 类型检查
deno check main.ts
```

## 适合谁？

- **JavaScript 开发者**：想要学习 TypeScript
- **TypeScript 初学者**：想要系统学习 TypeScript
- **Deno 用户**：想要在 Deno 中使用 TypeScript
- **全栈开发者**：想要掌握 TypeScript 全栈开发
- **技术爱好者**：想要了解现代前端技术栈

## 开始你的学习之旅

准备好开始了吗？点击下面的按钮，开始你的 TypeScript 学习之旅！

[开始学习](/learning-path/){.action-button}