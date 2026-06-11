/**
 * parser.ts - 命令行参数解析器
 *
 * 本文件实现了一个功能完整的命令行参数解析器，支持：
 * - 位置参数（positional arguments）
 * - 命名选项（named options）
 * - 布尔标志（boolean flags）
 * - 子命令（subcommands）
 * - 帮助文档自动生成
 *
 * TypeScript 优势：
 * - 使用接口定义参数规范，编译时检查
 * - 泛型支持类型安全的参数解析
 * - 联合类型处理多种参数类型
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 参数类型 */
type ArgType = "string" | "number" | "boolean";

/** 参数定义基础接口 */
interface BaseArgDef {
  readonly name: string;
  readonly alias?: string;
  readonly description: string;
  readonly required?: boolean;
  readonly default?: unknown;
  readonly hidden?: boolean;
}

/** 字符串参数定义 */
interface StringArgDef extends BaseArgDef {
  readonly type: "string";
  readonly choices?: readonly string[];
  readonly default?: string;
}

/** 数字参数定义 */
interface NumberArgDef extends BaseArgDef {
  readonly type: "number";
  readonly min?: number;
  readonly max?: number;
  readonly default?: number;
}

/** 布尔参数定义 */
interface BooleanArgDef extends BaseArgDef {
  readonly type: "boolean";
  readonly default?: boolean;
}

/** 参数定义联合类型 */
type ArgDef = StringArgDef | NumberArgDef | BooleanArgDef;

/** 位置参数定义 */
interface PositionalArgDef {
  readonly name: string;
  readonly description: string;
  readonly required?: boolean;
  readonly variadic?: boolean;
}

/** 命令定义 */
interface CommandDef {
  readonly name: string;
  readonly description: string;
  readonly aliases?: readonly string[];
  readonly options?: readonly ArgDef[];
  readonly positional?: readonly PositionalArgDef[];
  readonly action: (args: ParsedArgs) => void | Promise<void>;
  readonly subcommands?: readonly CommandDef[];
}

/** 解析后的参数 */
interface ParsedArgs {
  readonly command?: string;
  readonly positional: readonly string[];
  readonly options: Record<string, string | number | boolean | string[]>;
  readonly flags: Record<string, boolean>;
  readonly raw: readonly string[];
}

/** 解析错误 */
class ParseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly arg?: string,
  ) {
    super(message);
    this.name = "ParseError";
  }
}

// ============================================================================
// 参数解析器类
// ============================================================================

/**
 * CLI 参数解析器
 *
 * TypeScript 优势：
 * - 使用 Map 和 Record 进行类型安全的数据存储
 * - 严格的访问修饰符保护内部状态
 */
export class ArgumentParser {
  private programName: string;
  private programDescription: string;
  private version: string;
  private options: Map<string, ArgDef> = new Map();
  private optionAliases: Map<string, string> = new Map();
  private positionalArgs: PositionalArgDef[] = [];
  private commands: Map<string, CommandDef> = new Map();
  private commandAliases: Map<string, string> = new Map();

  constructor(name: string, description: string, version = "1.0.0") {
    this.programName = name;
    this.programDescription = description;
    this.version = version;
  }

  /**
   * 添加命名选项
   *
   * TypeScript 优势：函数重载根据类型参数返回正确的解析器实例
   */
  addOption(def: ArgDef): this {
    this.options.set(def.name, def);
    if (def.alias) {
      this.optionAliases.set(def.alias, def.name);
    }
    return this;
  }

  /**
   * 添加多个选项
   */
  addOptions(defs: readonly ArgDef[]): this {
    for (const def of defs) {
      this.addOption(def);
    }
    return this;
  }

  /**
   * 添加位置参数
   */
  addPositional(def: PositionalArgDef): this {
    this.positionalArgs.push(def);
    return this;
  }

  /**
   * 添加子命令
   */
  addCommand(def: CommandDef): this {
    this.commands.set(def.name, def);
    if (def.aliases) {
      for (const alias of def.aliases) {
        this.commandAliases.set(alias, def.name);
      }
    }
    return this;
  }

  /**
   * 添加多个子命令
   */
  addCommands(defs: readonly CommandDef[]): this {
    for (const def of defs) {
      this.addCommand(def);
    }
    return this;
  }

  /**
   * 查找选项定义（支持别名）
   */
  private findOption(name: string): ArgDef | undefined {
    const realName = this.optionAliases.get(name) ?? name;
    return this.options.get(realName);
  }

  /**
   * 查找命令定义（支持别名）
   */
  private findCommand(name: string): CommandDef | undefined {
    const realName = this.commandAliases.get(name) ?? name;
    return this.commands.get(realName);
  }

  /**
   * 解析单个值
   *
   * TypeScript 优势：根据类型定义返回正确的值类型
   */
  private parseValue(value: string, def: ArgDef): string | number | boolean {
    switch (def.type) {
      case "boolean":
        return value === "true" || value === "1" || value === "";

      case "number": {
        const num = Number(value);
        if (isNaN(num)) {
          throw new ParseError(
            `选项 --${def.name} 需要数字值，收到: "${value}"`,
            "INVALID_NUMBER",
            def.name,
          );
        }
        const numDef = def as NumberArgDef;
        if (numDef.min !== undefined && num < numDef.min) {
          throw new ParseError(
            `选项 --${def.name} 的最小值为 ${numDef.min}，收到: ${num}`,
            "VALUE_TOO_SMALL",
            def.name,
          );
        }
        if (numDef.max !== undefined && num > numDef.max) {
          throw new ParseError(
            `选项 --${def.name} 的最大值为 ${numDef.max}，收到: ${num}`,
            "VALUE_TOO_LARGE",
            def.name,
          );
        }
        return num;
      }

      case "string": {
        const strDef = def as StringArgDef;
        if (strDef.choices && !strDef.choices.includes(value)) {
          throw new ParseError(
            `选项 --${def.name} 的值必须是以下之一: ${strDef.choices.join(", ")}，收到: "${value}"`,
            "INVALID_CHOICE",
            def.name,
          );
        }
        return value;
      }

      default:
        return value;
    }
  }

  /**
   * 解析命令行参数
   *
   * TypeScript 优势：返回值使用完整的类型定义
   */
  parse(argv: readonly string[]): ParsedArgs {
    const args = [...argv];
    const options: Record<string, string | number | boolean | string[]> = {};
    const flags: Record<string, boolean> = {};
    const positional: string[] = [];
    let command: string | undefined;

    // 处理选项标志
    const optionFlags = new Map<string, boolean>();
    for (const [name, def] of this.options) {
      if (def.type === "boolean") {
        optionFlags.set(name, def.default ?? false);
      }
    }

    let i = 0;
    while (i < args.length) {
      const arg = args[i]!;

      // 帮助和版本
      if (arg === "--help" || arg === "-h") {
        this.printHelp(command);
        Deno.exit(0);
      }
      if (arg === "--version" || arg === "-V") {
        console.log(`${this.programName} ${this.version}`);
        Deno.exit(0);
      }

      // 长选项
      if (arg.startsWith("--")) {
        const eqIndex = arg.indexOf("=");
        let name: string;
        let value: string | undefined;

        if (eqIndex !== -1) {
          name = arg.slice(2, eqIndex);
          value = arg.slice(eqIndex + 1);
        } else {
          name = arg.slice(2);
          value = undefined;
        }

        const def = this.findOption(name);
        if (!def) {
          throw new ParseError(`未知选项: --${name}`, "UNKNOWN_OPTION", name);
        }

        const realName = this.optionAliases.get(name) ?? name;

        if (def.type === "boolean") {
          options[realName] = true;
          flags[realName] = true;
        } else {
          if (value === undefined) {
            i++;
            if (i >= args.length) {
              throw new ParseError(
                `选项 --${name} 需要一个值`,
                "MISSING_VALUE",
                name,
              );
            }
            value = args[i]!;
          }
          options[realName] = this.parseValue(value, def);
        }

        i++;
        continue;
      }

      // 短选项
      if (arg.startsWith("-") && arg.length > 1) {
        const flagName = arg.slice(1);
        const realName = this.optionAliases.get(flagName) ?? flagName;
        const def = this.findOption(flagName);

        if (!def) {
          throw new ParseError(`未知选项: -${flagName}`, "UNKNOWN_OPTION", flagName);
        }

        if (def.type === "boolean") {
          options[realName] = true;
          flags[realName] = true;
        } else {
          i++;
          if (i >= args.length) {
            throw new ParseError(
              `选项 -${flagName} 需要一个值`,
              "MISSING_VALUE",
              flagName,
            );
          }
          options[realName] = this.parseValue(args[i]!, def);
        }

        i++;
        continue;
      }

      // 检查是否为子命令
      if (command === undefined && this.commands.size > 0) {
        const cmd = this.findCommand(arg);
        if (cmd) {
          command = cmd.name;
          i++;
          continue;
        }
      }

      // 位置参数
      positional.push(arg);
      i++;
    }

    // 应用默认值
    for (const [name, def] of this.options) {
      if (!(name in options) && def.default !== undefined) {
        options[name] = def.default as string | number | boolean | string[];
      }
    }

    // 验证必需参数
    for (const [name, def] of this.options) {
      if (def.required && !(name in options)) {
        throw new ParseError(
          `缺少必需选项: --${name}`,
          "MISSING_REQUIRED",
          name,
        );
      }
    }

    // 验证必需的位置参数
    const requiredPositional = this.positionalArgs.filter((p) => p.required !== false);
    const minArgs = requiredPositional.filter((p) => !p.variadic).length;
    if (positional.length < minArgs) {
      const missing = requiredPositional[positional.length];
      throw new ParseError(
        `缺少必需参数: ${missing?.name ?? "unknown"}`,
        "MISSING_POSITIONAL",
        missing?.name,
      );
    }

    return { command, positional, options, flags, raw: argv };
  }

  /**
   * 解析 Deno.args
   */
  parseArgs(): ParsedArgs {
    return this.parse(Deno.args);
  }

  /**
   * 打印帮助信息
   */
  printHelp(commandName?: string): void {
    // 如果指定了命令，显示该命令的帮助
    if (commandName) {
      const cmd = this.commands.get(commandName);
      if (cmd) {
        this.printCommandHelp(cmd);
        return;
      }
    }

    console.log(`\n${this.programName} - ${this.programDescription}\n`);
    console.log("用法:");
    console.log(`  ${this.programName} [选项] [参数]`);
    if (this.commands.size > 0) {
      console.log(`  ${this.programName} <命令> [选项] [参数]\n`);
    }

    // 位置参数
    if (this.positionalArgs.length > 0) {
      console.log("参数:");
      for (const arg of this.positionalArgs) {
        const name = arg.variadic ? `${arg.name}...` : arg.name;
        const required = arg.required !== false ? "" : " (可选)";
        console.log(`  ${name.padEnd(20)}${arg.description}${required}`);
      }
      console.log();
    }

    // 选项
    const visibleOptions = [...this.options.values()].filter((o) => !o.hidden);
    if (visibleOptions.length > 0) {
      console.log("选项:");
      for (const opt of visibleOptions) {
        const alias = opt.alias ? `-${opt.alias}, ` : "    ";
        const type = opt.type === "boolean" ? "" : ` <${opt.type}>`;
        const def = opt.default !== undefined ? ` (默认: ${opt.default})` : "";
        console.log(`  ${alias}--${opt.name}${type}`.padEnd(30) + `${opt.description}${def}`);
      }
      console.log(`  ${"-h, --help".padEnd(30)}显示帮助信息`);
      console.log(`  ${"-V, --version".padEnd(30)}显示版本号`);
      console.log();
    }

    // 子命令
    if (this.commands.size > 0) {
      console.log("命令:");
      for (const [name, cmd] of this.commands) {
        const aliases = cmd.aliases ? ` (${cmd.aliases.join(", ")})` : "";
        console.log(`  ${name}${aliases}`.padEnd(25) + cmd.description);
      }
      console.log();
    }
  }

  /**
   * 打印命令帮助信息
   */
  private printCommandHelp(cmd: CommandDef): void {
    console.log(`\n${this.programName} ${cmd.name} - ${cmd.description}\n`);
    console.log("用法:");
    console.log(`  ${this.programName} ${cmd.name} [选项] [参数]\n`);

    // 位置参数
    if (cmd.positional && cmd.positional.length > 0) {
      console.log("参数:");
      for (const arg of cmd.positional) {
        const name = arg.variadic ? `${arg.name}...` : arg.name;
        const required = arg.required !== false ? "" : " (可选)";
        console.log(`  ${name.padEnd(20)}${arg.description}${required}`);
      }
      console.log();
    }

    // 选项
    if (cmd.options && cmd.options.length > 0) {
      console.log("选项:");
      for (const opt of cmd.options) {
        const alias = opt.alias ? `-${opt.alias}, ` : "    ";
        const type = opt.type === "boolean" ? "" : ` <${opt.type}>`;
        const def = opt.default !== undefined ? ` (默认: ${opt.default})` : "";
        console.log(`  ${alias}--${opt.name}${type}`.padEnd(30) + `${opt.description}${def}`);
      }
      console.log(`  ${"-h, --help".padEnd(30)}显示帮助信息`);
      console.log();
    }
  }
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 快速创建选项定义
 *
 * TypeScript 优势：函数重载提供类型安全的创建方式
 */
export function stringOption(
  name: string,
  description: string,
  options: Partial<Omit<StringArgDef, "name" | "description" | "type">> = {},
): StringArgDef {
  return { type: "string", name, description, ...options };
}

export function numberOption(
  name: string,
  description: string,
  options: Partial<Omit<NumberArgDef, "name" | "description" | "type">> = {},
): NumberArgDef {
  return { type: "number", name, description, ...options };
}

export function booleanOption(
  name: string,
  description: string,
  options: Partial<Omit<BooleanArgDef, "name" | "description" | "type">> = {},
): BooleanArgDef {
  return { type: "boolean", name, description, ...options };
}

export function positional(
  name: string,
  description: string,
  options: Partial<Omit<PositionalArgDef, "name" | "description">> = {},
): PositionalArgDef {
  return { name, description, ...options };
}

// ============================================================================
// 导出类型
// ============================================================================

export { ParseError };
export type {
  ArgDef,
  StringArgDef,
  NumberArgDef,
  BooleanArgDef,
  PositionalArgDef,
  CommandDef,
  ParsedArgs,
};
