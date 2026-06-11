# 环境准备

在开始学习之前，我们需要准备好开发环境。本章将指导你安装和配置 Deno 以及相关的开发工具。

## 安装 Deno

### Windows

#### 方法一：PowerShell（推荐）
```powershell
iwr https://deno.land/install.ps1 -useb | iex
```

#### 方法二：Scoop
```powershell
scoop install deno
```

#### 方法三：Chocolatey
```powershell
choco install deno
```

### macOS

#### 方法一：Shell（推荐）
```bash
curl -fsSL https://deno.land/install.sh | sh
```

#### 方法二：Homebrew
```bash
brew install deno
```

### Linux

#### 方法一：Shell（推荐）
```bash
curl -fsSL https://deno.land/install.sh | sh
```

#### 方法二：Snap
```bash
sudo snap install deno
```

## 验证安装

安装完成后，打开终端并运行以下命令验证安装：

```bash
deno --version
```

你应该看到类似以下的输出：

```
deno 1.40.0 (release, x86_64-pc-windows-msvc)
v8 12.1.285.6
typescript 5.3.3
```

## 配置环境变量

### Windows

1. 打开“系统属性” -> “高级” -> “环境变量”
2. 在“系统变量”中找到“Path”
3. 添加 Deno 的安装路径（通常是 `%USERPROFILE%\.deno\bin`）

### macOS/Linux

将以下内容添加到你的 shell 配置文件（`~/.bashrc`、`~/.zshrc` 等）：

```bash
export DENO_INSTALL="$HOME/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"
```

然后重新加载配置文件：

```bash
source ~/.bashrc  # 或 source ~/.zshrc
```

## 配置 IDE

### VS Code（推荐）

1. 安装 [VS Code](https://code.visualstudio.com/)
2. 安装以下扩展：
   - **Deno**：官方 Deno 扩展
   - **TypeScript Vue Plugin (Volar)**：TypeScript 支持
   - **ESLint**：代码检查
   - **Prettier**：代码格式化

3. 配置 VS Code 设置：

创建或编辑 `.vscode/settings.json`：

```json
{
  "deno.enable": true,
  "deno.lint": true,
  "deno.unstable": true,
  "editor.defaultFormatter": "denoland.vscode-deno",
  "[typescript]": {
    "editor.defaultFormatter": "denoland.vscode-deno"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "denoland.vscode-deno"
  }
}
```

### JetBrains IDEs（WebStorm、IntelliJ IDEA）

1. 打开设置 -> Languages & Frameworks -> TypeScript
2. 选择“Manual TypeScript configuration”
3. 指向 Deno 的 TypeScript 版本

## Deno 配置文件

### deno.json

在项目根目录创建 `deno.json` 文件：

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "lib": ["deno.window"]
  },
  "lint": {
    "rules": {
      "tags": ["recommended"]
    }
  },
  "fmt": {
    "options": {
      "useTabs": false,
      "indentWidth": 2,
      "singleQuote": true,
      "semiColons": false
    }
  }
}
```

### 配置选项说明

#### compilerOptions
- `strict`：启用所有严格类型检查
- `noUnusedLocals`：禁止未使用的局部变量
- `noUnusedParameters`：禁止未使用的参数
- `noFallthroughCasesInSwitch`：禁止 switch 语句中的 fallthrough
- `lib`：指定可用的库

#### lint
- `tags`：启用推荐的 lint 规则

#### fmt
- `useTabs`：使用空格而不是制表符
- `indentWidth`：缩进宽度
- `singleQuote`：使用单引号
- `semiColons`：不使用分号

## 权限配置

Deno 默认采用安全模型，需要显式授权。常用的权限标志：

### 文件系统权限
```bash
deno run --allow-read main.ts      # 允许读取文件
deno run --allow-write main.ts     # 允许写入文件
deno run --allow-read --allow-write main.ts  # 允许读写文件
```

### 网络权限
```bash
deno run --allow-net main.ts       # 允许网络访问
deno run --allow-net=localhost:8000 main.ts  # 允许特定主机和端口
```

### 环境变量权限
```bash
deno run --allow-env main.ts       # 允许访问环境变量
deno run --allow-env=HOME main.ts  # 允许访问特定环境变量
```

### 运行子进程权限
```bash
deno run --allow-run main.ts       # 允许运行子进程
deno run --allow-run=git main.ts   # 允许运行特定命令
```

### 所有权限（不推荐）
```bash
deno run -A main.ts                # 允许所有权限
```

## 测试环境

创建一个简单的测试文件来验证环境：

```typescript
// test.ts
console.log("Hello, Deno!");
console.log("TypeScript version:", Deno.version.typescript);
console.log("Deno version:", Deno.version.deno);
console.log("V8 version:", Deno.version.v8);
```

运行测试：

```bash
deno run test.ts
```

## 常见问题

### Q: 安装后找不到 deno 命令
A: 检查环境变量是否正确配置，重新启动终端。

### Q: 权限被拒绝
A: 使用相应的权限标志，如 `--allow-read`、`--allow-net` 等。

### Q: TypeScript 版本不匹配
A: 运行 `deno upgrade` 更新 Deno 到最新版本。

### Q: IDE 没有 TypeScript 支持
A: 确保安装了 Deno 扩展，并启用了 `deno.enable` 设置。

## 下一步

环境准备完成后，你可以开始学习第一个项目了！

[开始第一个项目：基础入门](/projects/01-basics/)