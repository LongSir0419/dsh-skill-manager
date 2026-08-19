import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { join, dirname } from "node:path";
import { readFile, writeFile, readdir } from "node:fs/promises";
import * as yaml from "js-yaml";

//#region decorator helpers (must precede the decorated class)
var __runInitializers = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? {
      get: descriptor.get,
      set: descriptor.set
    } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
    else descriptor[key] = _;
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};
//#endregion

/** Find the active profile's directory through the Loader baseUrl. */
function profileDir(ctx) {
  const base = ctx.loader?.ctx?.baseUrl;
  if (base === void 0) throw new Error("skill-manager: loader baseUrl unavailable");
  const url = base instanceof URL ? base : new URL(base);
  if (url.protocol !== "file:") throw new Error(`skill-manager: loader baseUrl is not a file URL: ${url.href}`);
  const dir = url.pathname;
  // Windows file URLs keep a leading slash before the drive letter.
  return /^\/[A-Za-z]:\//.test(dir) ? dir.slice(1) : dir;
}

/** Resolve the user-level skills directory (`$DSH_HOME/skills`). */
function profileSkillsDir(ctx) {
  // profileDir = $DSH_HOME/profiles/<name>; skills live at $DSH_HOME/skills,
  // i.e. two levels up from the profile directory.
  return join(dirname(dirname(profileDir(ctx))), "skills");
}

/** Extract the leading YAML frontmatter block `---\n...\n---`; returns null when absent. */
function extractFrontmatter(text) {
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 4);
  if (end === -1) return null;
  return { body: text.slice(4, end), end };
}

/**
 * Set or remove `disable-model-invocation` in the frontmatter by text surgery,
 * preserving all other fields and original formatting.
 */
function setDisableModelInvocation(text, disabled) {
  const fm = extractFrontmatter(text);
  if (fm === null) {
    if (!disabled) return text;
    return `---\ndisable-model-invocation: true\n---\n\n${text}`;
  }
  const body = fm.body;
  const lines = body.split("\n");
  const flagRe = /^\s*disable-model-invocation\s*:\s*.*$/;
  const hasFlag = lines.some((l) => flagRe.test(l));
  let editedBody;
  if (disabled && !hasFlag) {
    editedBody = `disable-model-invocation: true\n${body}`;
  } else if (!disabled && hasFlag) {
    editedBody = lines.filter((l) => !flagRe.test(l)).join("\n");
  } else {
    return text;
  }
  return `---\n${editedBody}${text.slice(fm.end)}`;
}

/**
 * Remote-only service exposing user-level skill management: list every skill
 * with its enabled state, and toggle it via frontmatter edits. DSH's
 * skill-filesystem watcher picks up the change, so a disabled skill leaves
 * the model catalog without a restart.
 */
let SkillManagerGateway = (() => {
  let _classSuper = TypertRemoteService;
  let _instanceExtraInitializers = [];
  let _list_decorators;
  let _set_decorators;
  return class SkillManagerGateway extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      _list_decorators = [Remote("skillList")];
      _set_decorators = [Remote("skillSet")];
      __esDecorate(this, null, _list_decorators, {
        kind: "method", name: "skillList", static: false, private: false,
        access: { has: (obj) => "skillList" in obj, get: (obj) => obj.skillList },
        metadata: _metadata
      }, null, _instanceExtraInitializers);
      __esDecorate(this, null, _set_decorators, {
        kind: "method", name: "skillSet", static: false, private: false,
        access: { has: (obj) => "skillSet" in obj, get: (obj) => obj.skillSet },
        metadata: _metadata
      }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, {
        enumerable: true, configurable: true, writable: true, value: _metadata
      });
    }
    static inject = ["loader"];
    constructor(ctx) {
      super(ctx, "skillManager");
      __runInitializers(this, _instanceExtraInitializers);
    }
    /**
     * List all user-level skills with their enabled state. A skill is enabled
     * unless its SKILL.md frontmatter carries `disable-model-invocation: true`
     * (which DSH's skill-filesystem provider excludes from model catalogs).
     */
    async skillList() {
      const dir = profileSkillsDir(this.ctx);
      let names = [];
      try {
        names = (await readdir(dir, { withFileTypes: true }))
          .filter((e) => e.isDirectory())
          .map((e) => e.name)
          .filter((n) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(n));
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
        return { dir, skills: [] };
      }
      const skills = [];
      for (const name of names) {
        const skillFile = join(dir, name, "SKILL.md");
        let description = "";
        let enabled = true;
        try {
          const text = await readFile(skillFile, "utf8");
          const fm = extractFrontmatter(text);
          if (fm !== null) {
            try {
              const data = yaml.load(fm.body, { schema: yaml.JSON_SCHEMA });
              if (data !== null && typeof data === "object") {
                if (typeof data.description === "string") description = data.description;
                enabled = !(data["disable-model-invocation"] === true || data["disable-model-invocation"] === "true" || data["disable-model-invocation"] === "yes" || data["disable-model-invocation"] === "on" || data["disable-model-invocation"] === "1");
              }
            } catch { /* malformed frontmatter: treat as enabled with no description */ }
          }
        } catch { /* unreadable skill: keep defaults */ }
        skills.push({ name, description, enabled });
      }
      skills.sort((a, b) => a.name.localeCompare(b.name));
      return { dir, skills };
    }
    /** Enable or disable a user-level skill by editing its frontmatter. */
    async skillSet(spec) {
      const { name, enabled } = spec;
      if (typeof name !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) throw new Error("skill-manager: invalid skill name");
      if (typeof enabled !== "boolean") throw new Error("skill-manager: enabled must be a boolean");
      const dir = profileSkillsDir(this.ctx);
      const skillFile = join(dir, name, "SKILL.md");
      const text = await readFile(skillFile, "utf8");
      const edited = setDisableModelInvocation(text, !enabled);
      if (edited !== text) await writeFile(skillFile, edited, "utf8");
      return { ok: true, name, enabled };
    }
  };
})();
//#endregion

export { SkillManagerGateway, SkillManagerGateway as default };
