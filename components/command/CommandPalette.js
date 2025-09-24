"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useCustomSelector } from "@/customHooks/customSelector";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

function getOrgIdFromPath(pathname) {
  const parts = (pathname || "").split("/").filter(Boolean);
  const orgIdx = parts.indexOf("org");
  if (orgIdx !== -1 && parts[orgIdx + 1]) return parts[orgIdx + 1];
  return null;
}

const CommandPalette = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const orgId = useMemo(() => getOrgIdFromPath(pathname), [pathname]);

  const { agentList, apikeys, knowledgeBase, functionData, integrationData, authData, orchestralFlowData } = useCustomSelector((state) => ({
    agentList: state?.bridgeReducer?.org?.[orgId]?.orgs || [],
    apikeys: state?.bridgeReducer?.apikeys?.[orgId] || [],
    knowledgeBase: state?.knowledgeBaseReducer?.knowledgeBaseData?.[orgId] || [],
    functionData: state?.bridgeReducer?.org?.[orgId]?.functionData || {},
    integrationData: state?.integrationReducer?.integrationData?.[orgId] || [],
    authData: state?.authDataReducer?.authData || [],
    orchestralFlowData: state?.orchestralFlowReducer?.orchetralFlowData?.[orgId] || [],
  }));

  const functions = useMemo(() => Object.values(functionData || {}), [functionData]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filterBy = (list, fields) => {
      if (!q) return [];
      return list.filter((it) =>
        fields.some((f) => String(it?.[f] || "").toLowerCase().includes(q))
      );
    };
    const agentsGroup = filterBy(agentList, ["name", "slugName", "service"]).map((a) => ({
      id: a._id,
      title: a.name || a.slugName || a._id,
      subtitle: `${a.service || ""}${a.configuration?.model ? " · " + a.configuration?.model : ""}`,
      type: "agents",
    }));

    const apikeysGroup = filterBy(apikeys, ["name", "service", "_id"]).map((k) => ({
      id: k._id,
      title: k.name || k._id,
      subtitle: k.service || "API Key",
      type: "apikeys",
    }));

    const kbGroup = filterBy(knowledgeBase, ["name", "_id"]).map((d) => ({
      id: d._id,
      title: d.name || d._id,
      subtitle: "Knowledge Base",
      type: "docs",
    }));

    const functionsGroup = filterBy(functions, ["endpoint_name", "_id"]).map((fn) => ({
      id: fn._id,
      title: fn.endpoint_name || fn._id,
      subtitle: "Function",
      type: "functions",
    }));

    const integrationGroup = filterBy(integrationData, ["name", "service", "_id"]).map((d) => ({
      id: d._id,
      title: d.name || d._id,
      subtitle: "Integration",
      type: "integrations",
    }));

    const authGroup = filterBy(authData, ["name", "service", "_id"]).map((d) => ({
      id: d._id,
      title: d.name || d._id,
      subtitle: "Auth Key",
      type: "auths",
    }));

    const orchestralFlowGroup = filterBy(orchestralFlowData, ["name", "_id"]).map((d) => ({
      id: d._id,
      title: d.name || d._id,
      subtitle: "Orchestral Flow",
      type: "flows",
    }));

    return {
      agents: agentsGroup,
      apikeys: apikeysGroup,
      docs: kbGroup,
      functions: functionsGroup,
      integrations: integrationGroup,
      auths: authGroup,
      flows: orchestralFlowGroup,
    };
  }, [query, agentList, apikeys, knowledgeBase, functions]);

  const flatResults = useMemo(() => {
    return [
      ...items.agents.map((it) => ({ group: "Agents", ...it })),
      ...items.apikeys.map((it) => ({ group: "API Keys", ...it })),
      ...items.docs.map((it) => ({ group: "Knowledge Base", ...it })),
      ...items.functions.map((it) => ({ group: "Functions", ...it })),
      ...items.integrations.map((it) => ({ group: "Integrations", ...it })),
      ...items.auths.map((it) => ({ group: "Auth Keys", ...it })),
      ...items.flows.map((it) => ({ group: "Orchestral Flows", ...it })),
    ];
  }, [items]);

  const groupedResults = useMemo(() => {
    const groups = {};
    flatResults.forEach((r) => {
      if (!groups[r.group]) groups[r.group] = [];
      groups[r.group].push(r);
    });
    return groups;
  }, [flatResults]);

  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
  }, []);
  const closePalette = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openPalette();
      }
      if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        openPalette();
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openPalette]);

  const navigateTo = useCallback((item) => {
    if (!orgId) {
      router.push("/");
      return;
    }
    switch (item.type) {
      case "agents":
        router.push(`/org/${orgId}/agents/configure/${item.id}`);
        break;
      case "apikeys":
        router.push(`/org/${orgId}/apikeys`);
        break;
      case "docs":
        router.push(`/org/${orgId}/knowledge_base`);
        break;
      case "functions":
        router.push(`/org/${orgId}/agents/configure`);
        break;
      case "integrations":
        router.push(`/org/${orgId}/integration`);
        break;
      case "auths":
        router.push(`/org/${orgId}/pauthkey`);
        break;
      case "flows":
        router.push(`/org/${orgId}/orchestratal_model/${item.id}`);
        break;
      default:
        router.push("/");
    }
    closePalette();
  }, [router, orgId, closePalette]);

  const navigateCategory = useCallback((key) => {
    if (!orgId) {
      router.push("/");
      return;
    }
    switch (key) {
      case 'agents':
        router.push(`/org/${orgId}/agents`);
        break;
      case 'apikeys':
        router.push(`/org/${orgId}/apikeys`);
        break;
      case 'docs':
        router.push(`/org/${orgId}/knowledge_base`);
        break;
      case 'functions':
        router.push(`/org/${orgId}/agents`);
        break;
      case 'integrations':
        router.push(`/org/${orgId}/integration`);
        break;
      case 'auths':
        router.push(`/org/${orgId}/pauthkey`);
        break;
      case 'flows':
        router.push(`/org/${orgId}/orchestratal_model`);
        break;
      default:
        router.push("/");
    }
    closePalette();
  }, [orgId, router, closePalette]);

  const onKeyNav = useCallback((e) => {
    if (!open) return;
    const results = flatResults;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = results[activeIndex];
      if (sel) navigateTo(sel);
    }
  }, [open, flatResults, activeIndex, navigateTo]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => onKeyNav(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onKeyNav]);

  const showLanding = open && query.trim() === "";
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/40 p-4" onClick={closePalette}>
      <div className="w-full max-w-2xl rounded-xl bg-base-100 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-base-300 p-3">
          <Search className="w-4 h-4 opacity-70" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents, bridges, API keys, docs, functions..."
            className="flex-1 bg-transparent outline-none"
          />
          <button className="btn btn-xs" onClick={closePalette}><X className="w-4 h-4" /></button>
        </div>
        <div className="max-h-[60vh] overflow-auto p-2">
          {showLanding ? (
            <div className="p-4">
              <div className="px-2 py-3">
                <h3 className="text-base font-semibold">Search everything</h3>
                <p className="text-sm opacity-70">Type to find Agents, API Keys, Knowledge Base, and Functions. Or pick a category to jump in.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
                {[
                  { key: 'agents', label: 'Agents', desc: 'Manage and configure agents' },
                  { key: 'apikeys', label: 'API Keys', desc: 'Credentials and providers' },
                  { key: 'docs', label: 'Knowledge Base', desc: 'Documents and sources' },
                  { key: 'functions', label: 'Functions', desc: 'Tools and endpoints' },
                  { key: 'integrations', label: 'Gtwy as Embed', desc: 'Configure integrations' },
                  { key: 'auths', label: 'Pauth Keys', desc: 'Configure Pauth Keys' },
                  { key: 'flows', label: 'Orchestral Flows', desc: 'Configure Orchestral Flows' },
                ].map((c) => (
                  <button
                    key={c.key}
                    onClick={() => navigateCategory(c.key)}
                    className="text-left card bg-base-200 hover:bg-base-300 transition-colors"
                  >
                    <div className="card-body p-3">
                      <div className="font-medium">{c.label}</div>
                      <div className="text-xs opacity-70">{c.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 px-2 text-xs opacity-70">
                <span className="badge">Cmd/Ctrl + K</span>
                <span className="badge">Shift + ?</span>
                <span className="badge">Enter to open</span>
                <span className="badge">Esc to close</span>
              </div>
            </div>
          ) : (
            <>
              {flatResults.length === 0 ? (
                <div className="p-6 text-center text-sm opacity-70">No results</div>
              ) : (
                Object.entries(groupedResults).map(([group, rows]) => (
                  <div key={group} className="mb-3">
                    <div className="px-2 py-1 text-xs uppercase tracking-wide opacity-60">{group}</div>
                    <ul>
                      {rows.map((row) => {
                        const globalIdx = flatResults.findIndex((r) => r === row);
                        const active = globalIdx === activeIndex;
                        return (
                          <li
                            key={`${row.type}-${row.id}`}
                            onClick={() => navigateTo(row)}
                            className={`cursor-pointer rounded px-3 py-2 ${active ? "bg-base-200" : "hover:bg-base-200"}`}
                          >
                            <div className="text-sm font-medium">{row.title}</div>
                            <div className="text-xs opacity-70">{row.subtitle}</div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-base-300 p-2 text-xs opacity-70">
          <div>Navigate with ↑ ↓ · Enter to open · Esc to close</div>
          <div>Cmd/Ctrl + K · Shift + ?</div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
