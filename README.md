# dsh-skill-manager

DeepSeek Harness (DSH) 的 Skill 管理插件——在 Web 设置里查看所有用户级 Skill，一键启用/停用。停用的 Skill 会从模型目录中排除（不再加载）。

## 功能

- **Skill 列表**：进入设置 → "Skills"，列出 `$DSH_HOME/skills` 下全部 Skill（名称 + 描述）
- **启用 / 停用**：每个 Skill 一个开关，切换即生效
- **关闭即不加载**：停用时修改 SKILL.md frontmatter 加 `disable-model-invocation: true`，DSH 的 skill-filesystem watcher 检测到后立即从模型目录排除该 Skill，无需重启

## 架构

单包双半的 DSH bundle：

| 半 | 入口 | 角色 |
|---|---|---|
| Host | `lib/index.js` | `skillManager` Remote 服务：skillList / skillSet，编辑 SKILL.md frontmatter |
| Client | `lib/client.js` | 设置面板 "Skills" 分区（`dsh.client` bundle） |

## 安装

```bash
dsh plugin --profile web add @wanghailong0419/dsh-skill-manager
dsh web   # 重启生效
```

### 本地开发 / 未发布时

```bash
dsh plugin --profile web add file:/path/to/dsh-skill-manager
dsh web
```

### 升级 / 移除

```bash
dsh plugin --profile web update @wanghailong0419/dsh-skill-manager
dsh plugin --profile web remove @wanghailong0419/dsh-skill-manager
```

## 使用

1. 启动 `dsh web`，打开**设置 → Skills**
2. 列表显示每个 Skill：状态点（绿=启用 / 灰=停用）、名称、描述
3. 点右侧开关切换启用/停用

> 停用效果：修改 SKILL.md frontmatter 加 `disable-model-invocation: true`。DSH 的 skill-filesystem 提供方会将该 Skill 从模型目录和 loader 中排除（watcher 自动刷新，无需重启）。

## 工作原理

- `skillList`：扫描 `$DSH_HOME/skills/<name>/SKILL.md`，解析 frontmatter 的 `description` 和 `disable-model-invocation`
- `skillSet`：文本级编辑 frontmatter（保留 `name`/`description`/`origin` 等原有字段和格式），加/删 `disable-model-invocation: true`
- 幂等：重复切换不会重复修改

## License

MIT
