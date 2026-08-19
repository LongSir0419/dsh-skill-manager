window.__ModuleLoader__.load({
	id: "@wanghailong0419/dsh-skill-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region skillManager remote descriptor (inlined; the host package is not a client module)
		const skillManagerRemote = {
			package: "@wanghailong0419/dsh-skill-manager",
			descriptors: [
				{
					id: "@wanghailong0419/dsh-skill-manager#skillManager/skillList",
					service: "skillManager",
					namespace: "skillManager",
					method: "skillList",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "@wanghailong0419/dsh-skill-manager#SkillListResult",
						schema: z_object({ dir: z_string(), skills: z_array(z_object({ name: z_string(), description: z_string(), enabled: z_boolean() })) })
					}
				},
				{
					id: "@wanghailong0419/dsh-skill-manager#skillManager/skillSet",
					service: "skillManager",
					namespace: "skillManager",
					method: "skillSet",
					invocation: { kind: "direct" },
					parameters: [{ name: "spec", wire: "spec", source: "json", codec: { mode: "strict", typeSymbol: "@wanghailong0419/dsh-skill-manager#SkillSetSpec", schema: z_object({ name: z_string(), enabled: z_boolean() }) } }],
					result: {
						mode: "strict",
						typeSymbol: "@wanghailong0419/dsh-skill-manager#SkillSetResult",
						schema: z_object({ ok: z_boolean(), name: z_string(), enabled: z_boolean() })
					}
				}
			]
		};
		// Minimal zod-like builders for the strict codecs above (schemastery/zod not guaranteed in the browser table).
		function z_string() { return { mode: "strict", parse: (v) => { if (typeof v !== "string") throw new Error("expected string"); return v; } }; }
		function z_boolean() { return { mode: "strict", parse: (v) => { if (typeof v !== "boolean") throw new Error("expected boolean"); return v; } }; }
		function z_object(schema) { return { mode: "strict", parse: (v) => { if (v === null || typeof v !== "object") throw new Error("expected object"); const out = {}; for (const [k, s] of Object.entries(schema)) { if (v[k] === void 0 && !(k in v)) continue; out[k] = s.parse(v[k]); } return out; } }; }
		function z_array(item) { return { mode: "strict", parse: (v) => { if (!Array.isArray(v)) throw new Error("expected array"); return v.map((x) => item.parse(x)); } }; }
		//#endregion
		//#region css
		const css = ".dshsk_section{width:100%;max-width:760px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:14px;display:flex}.dshsk_heading h3,.dshsk_status,.dshsk_failure p{margin:0}.dshsk_status,.dshsk_failure{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}.dshsk_failure{color:var(--dsw-alias-state-error-primary);align-items:center;gap:10px;display:flex}.dshsk_failure button{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;background:0 0;border-radius:6px;padding:4px 10px}.dshsk_catalog{flex-direction:column;gap:12px;display:flex}.dshsk_heading{align-items:baseline;gap:7px;padding:0 2px;display:flex}.dshsk_heading h3{font-size:13px;font-weight:600;line-height:20px}.dshsk_heading span{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;font-size:12px;line-height:18px}.dshsk_notice{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);margin:0}.dshsk_list{margin:0;padding:0;list-style:none;flex-direction:column;gap:8px;display:flex}.dshsk_row{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;align-items:center;gap:10px;padding:10px 14px;display:flex}.dshsk_row[data-enabled=false]{opacity:.72}.dshsk_dot{width:8px;height:8px;border-radius:50%;flex:none;display:inline-block}.dshsk_dot[data-enabled=true]{background:var(--dsw-alias-state-success-primary)}.dshsk_dot[data-enabled=false]{background:var(--dsw-alias-label-tertiary)}.dshsk_info{flex:1;min-width:0;flex-direction:column;gap:2px;display:flex}.dshsk_name{font-size:13px;font-weight:600;line-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dshsk_desc{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dshsk_toggle{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;background:0 0;border-radius:999px;padding:4px 14px;font-size:12px;line-height:18px;flex:none}.dshsk_toggle[data-enabled=true]{border-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-state-success-primary)}.dshsk_toggle[data-enabled=false]{border-color:var(--dsw-alias-label-tertiary);color:var(--dsw-alias-label-tertiary)}.dshsk_toggle:disabled{opacity:.6;cursor:default}";
		const tagId = "@wanghailong0419/dsh-skill-manager/SkillsSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@wanghailong0419/dsh-skill-manager";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		const SkillsSection_module_css_default = {
			"section": "dshsk_section",
			"failure": "dshsk_failure",
			"status": "dshsk_status",
			"heading": "dshsk_heading",
			"catalog": "dshsk_catalog",
			"notice": "dshsk_notice",
			"list": "dshsk_list",
			"row": "dshsk_row",
			"dot": "dshsk_dot",
			"info": "dshsk_info",
			"name": "dshsk_name",
			"desc": "dshsk_desc",
			"toggle": "dshsk_toggle"
		};
		//#endregion
		//#region SkillsSection
		/** Render the skill management section: every user-level skill with an enable/disable switch. */
		function SkillsSection({ skillList, skillSet, t }) {
			const [request, setRequest] = (0, react.useState)(0);
			const [state, setState] = (0, react.useState)({ status: "loading" });
			const [busy, setBusy] = (0, react.useState)(null);
			const [notice, setNotice] = (0, react.useState)(null);
			const skillListRef = (0, react.useRef)(skillList);
			skillListRef.current = skillList;
			const skillSetRef = (0, react.useRef)(skillSet);
			skillSetRef.current = skillSet;
			const refresh = () => setRequest((value) => value + 1);
			(0, react.useEffect)(() => {
				let current = true;
				Promise.resolve().then(() => skillListRef.current()).then((result) => {
					if (!current) return;
					setState({ status: "ready", result });
				}, () => {
					if (!current) return;
					setState({ status: "error" });
				});
				return () => { current = false; };
			}, [request]);
			const handleToggle = async (name, enabled) => {
				setBusy(name);
				setNotice(null);
				try {
					const result = await skillSetRef.current({ name, enabled });
					if (!result.ok) throw new Error(result.error?.message ?? "toggle failed");
					setNotice(t(enabled ? "skillEnabled" : "skillDisabled"));
					refresh();
				} catch (cause) {
					setNotice(cause instanceof Error ? cause.message : String(cause));
				} finally {
					setBusy(null);
				}
			};
			const skills = state.status === "ready" ? state.result.skills : [];
			return (0, react_jsx_runtime.jsxs)("div", {
				className: SkillsSection_module_css_default.section,
				"aria-busy": state.status === "loading" || busy !== null,
				children: [
					state.status === "loading" ? (0, react_jsx_runtime.jsx)("p", {
						className: SkillsSection_module_css_default.status,
						children: t("loading")
					}) : null,
					state.status === "error" ? (0, react_jsx_runtime.jsxs)("div", {
						className: SkillsSection_module_css_default.failure,
						children: [(0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							children: t("error")
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: refresh,
							children: t("retry")
						})]
					}) : null,
					state.status === "ready" ? (0, react_jsx_runtime.jsxs)("div", {
						className: SkillsSection_module_css_default.catalog,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: SkillsSection_module_css_default.heading,
								children: [(0, react_jsx_runtime.jsx)("h3", { children: t("skillsNav") }), (0, react_jsx_runtime.jsx)("span", {
									"data-skill-count": skills.length,
									children: skills.length
								})]
							}),
							notice !== null ? (0, react_jsx_runtime.jsx)("p", {
								className: SkillsSection_module_css_default.notice,
								role: "status",
								children: notice
							}) : null,
							skills.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: SkillsSection_module_css_default.status,
								children: t("noSkills")
							}) : null,
							(0, react_jsx_runtime.jsx)("ul", {
								className: SkillsSection_module_css_default.list,
								children: skills.map((skill) => {
									const on = skill.enabled;
									return (0, react_jsx_runtime.jsxs)("li", {
										className: SkillsSection_module_css_default.row,
										"data-skill": skill.name,
										"data-enabled": on ? "true" : "false",
										children: [
											(0, react_jsx_runtime.jsx)("span", {
												className: SkillsSection_module_css_default.dot,
												"data-enabled": on ? "true" : "false",
												"aria-hidden": "true"
											}),
											(0, react_jsx_runtime.jsxs)("div", {
												className: SkillsSection_module_css_default.info,
												children: [(0, react_jsx_runtime.jsx)("strong", {
													className: SkillsSection_module_css_default.name,
													children: skill.name
												}), (0, react_jsx_runtime.jsx)("span", {
													className: SkillsSection_module_css_default.desc,
													children: skill.description || t("noDescription")
												})]
											}),
											(0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: SkillsSection_module_css_default.toggle,
												"data-enabled": on ? "true" : "false",
												role: "switch",
												"aria-checked": on,
												"aria-label": `${skill.name} ${on ? t("skillOn") : t("skillOff")}`,
												disabled: busy === skill.name,
												onClick: () => handleToggle(skill.name, !on),
												children: busy === skill.name ? t("saving") : (on ? t("skillOn") : t("skillOff"))
											})
										]
									}, skill.name);
								})
							})
						]
					}) : null
				]
			});
		}
		//#endregion
		//#region locales
		const zh = {
			nav: "Skills",
			loading: "正在读取 Skills…",
			error: "暂时无法读取 Skills。",
			retry: "重试",
			skillsNav: "Skills",
			noSkills: "未发现用户级 Skills。",
			noDescription: "（无描述）",
			skillOn: "已启用",
			skillOff: "已停用",
			skillEnabled: "已启用，即将从模型目录生效。",
			skillDisabled: "已停用，该 Skill 将不再加载。",
			saving: "保存中…"
		};
		const en = {
			nav: "Skills",
			loading: "Reading Skills…",
			error: "Skills are temporarily unavailable.",
			retry: "Retry",
			skillsNav: "Skills",
			noSkills: "No user-level skills found.",
			noDescription: "(no description)",
			skillOn: "Enabled",
			skillOff: "Disabled",
			skillEnabled: "Enabled. Will apply to the model catalog shortly.",
			skillDisabled: "Disabled. This skill will no longer load.",
			saving: "Saving…"
		};
		//#endregion
		//#region apply
		const NS = "settings.skills";
		const inject = [
			"slots",
			"locale",
			"remote"
		];
		async function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ui-settings-skills: dictionaries");
			// Mount the skillManager Remote contribution before registering any
			// surface that calls it.
			await ctx.remote.$mount(skillManagerRemote);
			const manager = ctx.get("remote.skillManager");
			if (manager === void 0) throw new Error("ui-settings-skills: remote.skillManager did not mount");
			const t = ctx.locale.bind(NS);
			const call = async (fn, label) => {
				const result = await fn();
				if (!result.ok) throw new Error(`${label}: ${result.error.code}: ${result.error.message}`);
				return result.value;
			};
			const injected = () => ({
				skillList: () => call(() => manager.skillList(), "skillManager.skillList"),
				skillSet: (spec) => call(() => manager.skillSet(spec), "skillManager.skillSet"),
				t
			});
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "skills",
				order: 30,
				label: () => t("nav"),
				inject: injected
			}, SkillsSection));
		}
		//#endregion
		exports.NS = NS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
