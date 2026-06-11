# 项目10：CLI 工具 - 构建文件搜索工具

## 概述

本项目将带你构建一个功能完整的命令行文件搜索工具。通过这个实战项目，你将学习 CLI 工具设计、参数解析、用户交互、输出格式化等核心技能，并深入理解 TypeScript 在 CLI 开发中的优势。

### 项目特色

- **类型安全的参数解析**：编译时检查参数类型
- **结构化日志系统**：类型约束的日志级别
- **交互式界面**：选择列表、确认提示、进度条
- **格式化输出**：表格、颜色、分隔线
- **搜索引擎**：文件名和内容搜索，支持正则表达式

## 1. CLI 工具设计原则

### 1.1 设计哲学

优秀的 CLI 工具应遵循以下原则：

1. **最小惊讶原则**：行为符合用户预期
2. **组合性**：可以与其他工具组合使用
3. **幂等性**：重复执行产生相同结果
4. **无状态**：不在本地存储状态（除非必要）
5. **错误友好**：清晰的错误信息和恢复建议

### 1.2 项目结构

```
10-cli-tool/
├── README.md          # 本文件
├── deno.json          # Deno 配置
├── cli.ts             # CLI 主程序
├── parser.ts          # 参数解析器
└── utils.ts           # 工具函数库
```

### 1.3 TypeScript 优势

TypeScript 在 CLI 开发中的关键优势：

1. **类型安全的参数解析**：编译时确保参数类型正确
2. **接口定义命令规范**：使用接口描述命令结构
3. **联合类型处理多种输入**：处理字符串、数字、布尔值
4. **泛型工具函数**：可复用的类型安全工具

## 2. 参数解析

### 2.1 参数类型

CLI 参数分为以下几类：

```typescript
// 位置参数 - 按顺序解析
file-search <pattern>           // pattern 是位置参数

// 命名选项 - 使用 --name 或 -n
file-search --path /home        // --path 是命名选项
file-search -p /home            // -p 是别名

// 布尔标志 - 不需要值
file-search --recursive         // --recursive 是布尔标志
file-search -r                  // -r 是别名

// 长选项带值
file-search --type=ts           // 使用 = 赋值
file-search --type ts           // 空格分隔
```

### 2.2 参数解析器实现

我们的参数解析器使用 TypeScript 接口定义参数规范：

```typescript
// 参数定义接口
interface ArgDef {
  readonly name: string;          // 参数名
  readonly alias?: string;        // 短别名
  readonly description: string;   // 描述
  readonly type: "string" | "number" | "boolean";
  readonly required?: boolean;    // 是否必需
  readonly default?: unknown;     // 默认值
}

// 命令定义接口
interface CommandDef {
  readonly name: string;
  readonly description: string;
  readonly aliases?: readonly string[];
  readonly options?: readonly ArgDef[];
  readonly action: (args: ParsedArgs) => void | Promise<void>;
}
```

**TypeScript 优势**：
- `readonly` 确保参数定义不可变
- 联合类型约束参数类型
- 泛型支持多种参数解析

### 2.3 使用示例

```typescript
import { ArgumentParser, stringOption, booleanOption, numberOption } from "./parser.ts";

const parser = new ArgumentParser("my-cli", "My CLI Tool", "1.0.0");

parser.addOptions([
  stringOption("output", "输出文件", { alias: "o" }),
  booleanOption("verbose", "详细输出", { alias: "v" }),
  numberOption("count", "数量", { alias: "n", default: 10 }),
]);

parser.addPositional({
  name: "input",
  description: "输入文件",
  required: true,
});

const args = parser.parseArgs();
console.log(args.options["output"]);  // string 类型
console.log(args.options["verbose"]); // boolean 类型
```

## 3. 用户交互

### 3.1 交互式提示

Deno 提供了标准输入输出流，我们可以基于此构建交互式提示：

```typescript
// 读取用户输入
async function prompt(message: string): Promise<string> {
  Deno.stdout.writeSync(new TextEncoder().encode(`${message}: `));
  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  return new TextDecoder().decode(buf.subarray(0, n)).trim();
}

// 确认提示
async function confirm(message: string): Promise<boolean> {
  const answer = await prompt(`${message} (y/N)`);
  return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}
```

### 3.2 选择列表

使用终端控制符构建交互式选择列表：

```typescript
interface SelectOption<T> {
  readonly label: string;
  readonly value: T;
  readonly description?: string;
}

async function select<T>(options: SelectOption<T>[]): Promise<T> {
  console.log("请选择:");
  options.forEach((opt, index) => {
    console.log(`  ${index + 1}. ${opt.label}`);
    if (opt.description) {
      console.log(`     ${opt.description}`);
    }
  });

  const answer = await prompt("输入编号");
  const index = parseInt(answer) - 1;
  return options[index]?.value ?? options[0].value;
}
```

**TypeScript 优势**：泛型 `T` 确保返回值类型与选项值类型一致。

### 3.3 进度显示

```typescript
function formatProgress(current: number, total: number): string {
  const percentage = current / total;
  const width = 30;
  const filled = Math.round(width * percentage);
  const empty = width - filled;

  const bar = "█".repeat(filled) + "░".repeat(empty);
  return `[${bar}] ${(percentage * 100).toFixed(1)}%`;
}
```

## 4. 输出格式化

### 4.1 终端颜色

使用 ANSI 转义码实现终端颜色：

```typescript
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function colorize(text: string, color: keyof typeof COLORS): string {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

console.log(colorize("成功!", "green"));
console.log(colorize("警告!", "yellow"));
```

### 4.2 表格输出

```typescript
interface TableColumn {
  readonly header: string;
  readonly key: string;
  readonly width?: number;
  readonly align?: "left" | "center" | "right";
}

function formatTable<T extends Record<string, unknown>>(
  data: T[],
  columns: TableColumn[]
): string {
  // 计算列宽
  const widths = columns.map(col => {
    const headerLen = col.header.length;
    const dataLens = data.map(row => String(row[col.key]).length);
    return Math.max(headerLen, ...dataLens, col.width ?? 0);
  });

  // 生成分隔线
  const separator = "+" + widths.map(w => "-".repeat(w + 2)).join("+") + "+";

  // 生成表头
  const header = "|" + columns.map((col, i) =>
    ` ${col.header.padEnd(widths[i])} `
  ).join("|") + "|";

  // 生成数据行
  const rows = data.map(row =>
    "|" + columns.map((col, i) =>
      ` ${String(row[col.key]).padEnd(widths[i])} `
    ).join("|") + "|"
  );

  return [separator, header, separator, ...rows, separator].join("\n");
}
```

### 4.3 框线输出

```typescript
function infoBox(title: string, items: string[]): void {
  const maxWidth = Math.max(title.length, ...items.map(s => s.length)) + 4;
  const border = "─".repeat(maxWidth);

  console.log(`┌${border}┐`);
  console.log(`│ ${title}${" ".repeat(maxWidth - title.length - 2)}│`);
  console.log(`├${border}┤`);
  items.forEach(item => {
    console.log(`│ ${item}${" ".repeat(maxWidth - item.length - 2)}│`);
  });
  console.log(`└${border}┘`);
}
```

## 5. 错误处理和用户提示

### 5.1 错误类型定义

```typescript
class CLIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly suggestions?: string[]
  ) {
    super(message);
    this.name = "CLIError";
  }
}

class ParseError extends CLIError {
  constructor(message: string, public readonly arg?: string) {
    super(message, "PARSE_ERROR");
  }
}
```

### 5.2 错误处理策略

```typescript
async function main(): Promise<void> {
  try {
    const args = parser.parseArgs();
    await runCommand(args);
  } catch (error) {
    if (error instanceof ParseError) {
      console.error(`\n参数错误: ${error.message}`);
      if (error.arg) {
        console.error(`  参数: ${error.arg}`);
      }
      console.error("\n使用 --help 查看帮助信息");
    } else if (error instanceof CLIError) {
      console.error(`\n错误: ${error.message}`);
      if (error.suggestions) {
        console.error("\n建议:");
        error.suggestions.forEach(s => console.error(`  - ${s}`));
      }
    } else {
      console.error(`\n未知错误: ${error}`);
    }
    Deno.exit(1);
  }
}
```

### 5.3 用户友好的错误信息

```typescript
function suggestSimilar(input: string, validOptions: string[]): string[] {
  return validOptions.filter(opt =>
    opt.includes(input) || input.includes(opt)
  ).slice(0, 3);
}
```

## 6. 打包和分发

### 6.1 Deno 编译

```bash
# 编译为可执行文件
deno compile --allow-read --allow-write --allow-env cli.ts

# 交叉编译
deno compile --target x86_64-unknown-linux-gnu cli.ts
deno compile --target x86_64-pc-windows-msvc cli.ts
deno compile --target x86_64-apple-darwin cli.ts
```

### 6.2 Deno Deploy

```bash
# 发布到 Deno Deploy
deployctl deploy --project=my-cli cli.ts
```

### 6.3 使用 deno.json 管理任务

```json
{
  "tasks": {
    "start": "deno run --allow-read --allow-write cli.ts",
    "build": "deno compile --allow-read --allow-write cli.ts",
    "test": "deno test",
    "lint": "deno lint",
    "fmt": "deno fmt"
  }
}
```

## 7. 实战项目：文件搜索工具

### 7.1 功能特性

我们的文件搜索工具支持：

1. **文件名搜索**：按文件名模式匹配
2. **内容搜索**：搜索文件内容（类似 grep）
3. **正则表达式**：支持正则表达式匹配
4. **类型过滤**：按文件扩展名过滤
5. **深度控制**：限制搜索深度
6. **结果格式化**：表格或详细列表输出

### 7.2 使用示例

```bash
# 搜索文件名包含 "config" 的文件
deno run --allow-read cli.ts config

# 搜索 TypeScript 文件
deno run --allow-read cli.ts --type=ts src

# 搜索文件内容
deno run --allow-read cli.ts --content "import React"

# 使用正则表达式
deno run --allow-read cli.ts --regex "\d{4}-\d{2}-\d{2}"

# 表格格式输出
deno run --allow-read cli.ts --table README

# 显示帮助
deno run --allow-read cli.ts --help
```

### 7.3 核心实现

搜索引擎核心类：

```typescript
class FileSearchEngine {
  private config: SearchConfig;
  private results: SearchResult[] = [];

  constructor(config: SearchConfig) {
    this.config = config;
  }

  // 检查文件名是否匹配
  private matchFileName(name: string): number {
    const pattern = this.config.caseSensitive
      ? this.config.pattern
      : this.config.pattern.toLowerCase();
    const target = this.config.caseSensitive ? name : name.toLowerCase();

    if (target === pattern) return 1;       // 完全匹配
    if (target.includes(pattern)) return 0.8; // 包含匹配
    return 0;
  }

  // 递归搜索目录
  private async searchDirectory(dir: string, depth: number): Promise<void> {
    if (depth > this.config.maxDepth) return;

    for await (const entry of Deno.readDir(dir)) {
      const fullPath = `${dir}/${entry.name}`;

      if (entry.isFile) {
        const score = this.matchFileName(entry.name);
        if (score > 0) {
          this.results.push({ path: fullPath, score });
        }
      } else if (entry.isDirectory) {
        await this.searchDirectory(fullPath, depth + 1);
      }
    }
  }

  async search(): Promise<SearchResult[]> {
    await this.searchDirectory(this.config.root, 0);
    return this.results.sort((a, b) => b.score - a.score);
  }
}
```

## 8. 示例代码说明

### 8.1 parser.ts - 参数解析器

**核心功能**：
- `ArgumentParser` 类：完整的参数解析器
- `stringOption`、`numberOption`、`booleanOption`：便捷的选项创建函数
- `positional`：位置参数定义
- `ParseError`：自定义错误类型

**TypeScript 亮点**：
- 联合类型处理多种参数类型
- 泛型函数确保类型安全
- readonly 保护配置不可变

### 8.2 utils.ts - 工具函数库

**核心功能**：
- `Logger` 类：结构化日志记录
- `ProgressBar` 类：进度条显示
- `formatTable`：表格格式化
- `colorize`：颜色输出
- `prompt`、`confirm`、`select`：交互式提示

**TypeScript 亮点**：
- 接口定义日志配置
- 泛型表格函数
- 联合类型日志级别

### 8.3 cli.ts - 主程序

**核心功能**：
- `FileSearchEngine`：搜索引擎实现
- `createSearchCLI`：CLI 配置
- `handleSearch`：搜索命令处理
- `handleStats`：统计命令处理

**TypeScript 亮点**：
- 接口定义搜索配置
- readonly 确保配置不变
- 类型断言处理参数

## 9. 练习题

### 练习1：扩展参数解析器

为 `parser.ts` 添加以下功能：
1. 数组参数支持（如 `--tags=ts,deno,cli`）
2. 枚举参数支持（如 `--format=table|json|csv`）
3. 互斥参数组（如 `--verbose` 和 `--quiet` 不能同时使用）

### 练习2：添加更多搜索功能

扩展文件搜索工具：
1. 支持 `.gitignore` 规则
2. 添加文件大小过滤（`--min-size`、`--max-size`）
3. 添加修改时间过滤（`--modified-after`）
4. 支持 JSON 格式输出

### 练习3：构建配置管理工具

创建一个新的 CLI 工具，管理 JSON 配置文件：
1. 读取配置：`config get <key>`
2. 设置配置：`config set <key> <value>`
3. 列出配置：`config list`
4. 删除配置：`config delete <key>`
5. 导入导出：`config export/import`

### 练习4：构建任务运行器

创建一个类似 npm scripts 的任务运行器：
1. 从 `deno.json` 读取任务定义
2. 支持任务依赖（如 `build` 依赖 `lint`）
3. 支持并行执行
4. 添加彩色输出和进度显示

### 练习5：构建交互式工具

创建一个交互式的项目脚手架工具：
1. 询问项目名称、描述、作者
2. 选择模板（Web 应用、CLI 工具、库）
3. 选择特性（TypeScript、测试、文档）
4. 生成项目结构和配置文件

## 10. TypeScript 与 JavaScript 的区别

### 10.1 类型安全

**JavaScript**:
```javascript
function addOption(name, description, type) {
  // 无法在编译时检查类型
  // name 可能是数字，type 可能是无效值
}
```

**TypeScript**:
```typescript
function addOption(def: ArgDef): void {
  // 编译时确保类型正确
  // def.name 必须是 string
  // def.type 必须是 "string" | "number" | "boolean"
}
```

### 10.2 接口定义

**JavaScript**:
```javascript
// 没有明确的数据结构定义
const config = {
  name: "file-search",
  // 可能缺少必需字段
  // 可能有拼写错误
};
```

**TypeScript**:
```typescript
interface SearchConfig {
  readonly pattern: string;       // 必需
  readonly root: string;          // 必需
  readonly contentSearch: boolean; // 必需
  readonly maxDepth: number;      // 必需
}

const config: SearchConfig = {
  pattern: "test",
  root: ".",
  contentSearch: false,
  maxDepth: 10,
  // 缺少任何字段都会报错
};
```

### 10.3 泛型复用

**JavaScript**:
```javascript
// 每种类型都需要单独的函数
function formatStringTable(data, columns) { ... }
function formatNumberTable(data, columns) { ... }
```

**TypeScript**:
```typescript
// 一个泛型函数处理所有类型
function formatTable<T extends Record<string, unknown>>(
  data: T[],
  columns: TableColumn[]
): string { ... }
```

## 11. 运行项目

### 11.1 环境准备

```bash
# 确保 Deno 已安装
deno --version

# 进入项目目录
cd 10-cli-tool
```

### 11.2 运行示例

```bash
# 显示帮助
deno run --allow-read cli.ts --help

# 搜索当前目录的 TypeScript 文件
deno run --allow-read cli.ts --type=ts .

# 搜索文件内容
deno run --allow-read cli.ts --content "function" .

# 表格格式输出
deno run --allow-read cli.ts --table --type=ts,js .

# 查看目录统计
deno run --allow-read cli.ts stats --path=.
```

### 11.3 类型检查

```bash
# 运行类型检查
deno check cli.ts parser.ts utils.ts

# 运行测试
deno test

# 格式化代码
deno fmt
```

## 12. 总结

通过本项目，你学习了：

1. **CLI 设计原则**：最小惊讶、组合性、错误友好
2. **参数解析**：位置参数、命名选项、布尔标志
3. **用户交互**：输入提示、确认、选择列表
4. **输出格式化**：表格、颜色、进度条
5. **错误处理**：自定义错误、用户友好提示
6. **TypeScript 优势**：类型安全、接口设计、泛型复用

这些技能将帮助你构建专业级的命令行工具。在下一个项目中，我们将学习文件处理和流操作。


---

## 项目导航

[上一个项目：装饰器和元数据](/projects/09-decorators/)

[下一个项目：文件处理工具](/projects/11-file-processing/)

[返回学习路径](/learning-path/)
