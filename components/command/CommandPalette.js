"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useCustomSelector } from "@/customHooks/customSelector";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, ChevronDown, ChevronRight } from "lucide-react";
import { formatRelativeTime, formatDate } from "@/utils/utility";
import Protected from "../protected";

function getOrgIdFromPath(pathname) {
  const parts = (pathname || "").split("/").filter(Boolean);
  const orgIdx = parts.indexOf("org");
  if (orgIdx !== -1 && parts[orgIdx + 1]) return parts[orgIdx + 1];
  return null;
}

function getCurrentCategoryGroup(currentCategory) {
  // Map current category keys to group names used in search results
  const categoryGroupMap = {
    'agents': 'Agents',
    'apikeys': 'API Keys',
    'Auths': 'Auth Keys',
    'docs': 'Knowledge Base',
    'integrations': 'Integrations'
  };
  
  return categoryGroupMap[currentCategory] || null;
}

const CommandPalette = ({isEmbedUser}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());

  const orgId = useMemo(() => getOrgIdFromPath(pathname), [pathname]);
  
  // Detect current category based on pathname
  const currentCategory = useMemo(() => {
    if (!pathname) return null;
    
    const parts = pathname.split("/").filter(Boolean);
    
    // Check for specific routes in order of specificity
    if (parts.includes("agents")) return "agents";
    if (parts.includes("apikeys")) return "apikeys";
    if (parts.includes("pauthkey")) return "Auths";
    if (parts.includes("knowledge_base")) return "docs";
    if (parts.includes("integration")) return "integrations";
    if (parts.includes("orchestratal_model")) return "flows";
    
    return null;
  }, [pathname]);

  const { agentList, apikeys, knowledgeBase, functionData, integrationData, authData } = useCustomSelector((state) => ({
    agentList: state?.bridgeReducer?.org?.[orgId]?.orgs || [],
    apikeys: state?.apiKeysReducer?.apikeys?.[orgId] || [],
    knowledgeBase: state?.knowledgeBaseReducer?.knowledgeBaseData?.[orgId] || [],
    functionData: state?.bridgeReducer?.org?.[orgId]?.functionData || {},
    integrationData: state?.integrationReducer?.integrationData?.[orgId] || [],
    authData: state?.authDataReducer?.authData || [],
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
    const agentsGroup = filterBy(agentList.filter(agent => !agent.deletedAt), ["name", "slugName", "service", "_id","last_used","total_tokens"]).map((a) => ({
      id: a._id,
      title: a.name || a.slugName || a._id,
      subtitle: (
        <div className="flex items-center gap-2">
          <span>{a.service || ""}{a.configuration?.model ? " · " + a.configuration?.model : ""}{a.total_tokens ? " · " + a.total_tokens + " tokens" : ""}</span>
          {a.last_used && (
            <>
              <span>•</span>
              <span className="text-xs opacity-70">Last used:</span>
              <div className="group cursor-help inline-flex">
                <span className="group-hover:hidden">
                  {formatRelativeTime(a.last_used)}
                </span>
                <span className="hidden group-hover:inline text-xs">
                  {formatDate(a.last_used)}
                </span>
              </div>
            </>
          )}
        </div>
      ),
      type: "agents",
      published_version_id: a.published_version_id,
      versions: a.versions
    }));

    // Also support searching by version_id: include results when the query matches
    // any entry of the agent's versions array or its published_version_id.
    const agentsVersionMatches = !q
      ? []
      : (agentList || []).filter(agent => !agent.deletedAt).flatMap((a) => {
          const versionsArr = Array.isArray(a?.versions) ? a.versions : [];
          const published = a?.published_version_id ? [a.published_version_id] : [];
          const candidates = [...versionsArr, ...published].map((v) => String(v || ""));
          // Filter candidates that contain the query (case-insensitive)
          const matches = candidates.filter((v) => v.toLowerCase() === q.toLowerCase());
          // De-duplicate matches
          const unique = Array.from(new Set(matches));
          return unique.map((v) => ({
            id: a._id,
            title: a.name || a.slugName || a._id,
            subtitle: `Version ${v}`,
            type: "agents",
            versionId: v,
          }));
        });


    const apikeysGroup = filterBy(apikeys, ["name", "service", "_id"]).map((k) => ({
      id: k._id,
      title: k.name || k._id,
      subtitle: (
        <div className="flex items-center gap-2">
          <span>{k.service || "API Key"}</span>
          {k.last_used && (
            <>
              <span>•</span>
              <span className="text-xs opacity-70">Last used:</span>
              <div className="group cursor-help inline-flex">
                <span className="group-hover:hidden">
                  {formatRelativeTime(k.last_used)}
                </span>
                <span className="hidden group-hover:inline text-xs">
                  {formatDate(k.last_used)}
                </span>
              </div>
            </>
          )}
        </div>
      ),
      type: "apikeys",
    }));

    const kbGroup = filterBy(knowledgeBase, ["name", "_id"]).map((d) => ({
      id: d._id,
      title: d.name || d._id,
      subtitle: "Knowledge Base",
      type: "docs",
    }));

    // const functionsGroup = filterBy(functions, ["endpoint_name", "_id"]).map((fn) => ({
    //   id: fn._id,
    //   title: fn.endpoint_name || fn._id,
    //   subtitle: "Function",
    //   type: "functions",
    // }));

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
      type: "Auths",
    }));

    return {
      // Combine normal agent matches with version-id based matches
      agents: [...new Set([...agentsGroup, ...agentsVersionMatches])],
      apikeys: apikeysGroup,
      docs: kbGroup,
      // functions: functionsGroup,
      integrations: integrationGroup,
      auths: authGroup,
    };
  }, [query, agentList, apikeys, knowledgeBase, functions, integrationData, authData]);

  const allResults = useMemo(() => [
    ...items.agents.map((it) => ({ group: "Agents", ...it })),
    ...items.apikeys.map((it) => ({ group: "API Keys", ...it })),
    ...items.docs.map((it) => ({ group: "Knowledge Base", ...it })),
    // ...items.functions.map((it) => ({ group: "Functions", ...it })),
    ...items.integrations.map((it) => ({ group: "Integrations", ...it })),
    ...items.auths.map((it) => ({ group: "Auth Keys", ...it })),
  ], [items, integrationData, authData]);

  const flatResults = useMemo(() => {
    // Create flat results in same order as groupedResults (current category first)
    const groups = {};
    allResults.forEach((r) => {
      if (!groups[r.group]) groups[r.group] = [];
      groups[r.group].push(r);
    });
    
    // Sort groups to show current category first (same as groupedResults)
    const sortedResults = [];
    const currentCategoryGroup = getCurrentCategoryGroup(currentCategory);
    
    // Add current category first if it exists and has results
    if (currentCategoryGroup && groups[currentCategoryGroup] && !collapsedCategories.has(currentCategoryGroup)) {
      sortedResults.push(...groups[currentCategoryGroup]);
    }
    
    // Add all other categories in alphabetical order
    Object.keys(groups)
      .filter(group => group !== currentCategoryGroup)
      .sort()
      .forEach(group => {
        if (!collapsedCategories.has(group)) {
          sortedResults.push(...groups[group]);
        }
      });
    
    return sortedResults;
  }, [allResults, collapsedCategories, currentCategory]);

  const groupedResults = useMemo(() => {
    const groups = {};
    allResults.forEach((r) => {
      if (!groups[r.group]) groups[r.group] = [];
      groups[r.group].push(r);
    });
    
    // Sort groups to show current category first
    const sortedGroups = {};
    const currentCategoryGroup = getCurrentCategoryGroup(currentCategory);
    
    // Add current category first if it exists and has results
    if (currentCategoryGroup && groups[currentCategoryGroup]) {
      sortedGroups[currentCategoryGroup] = groups[currentCategoryGroup];
    }
    
    // Add all other categories
    Object.keys(groups)
      .filter(group => group !== currentCategoryGroup)
      .sort()
      .forEach(group => {
        sortedGroups[group] = groups[group];
      });
    
    return sortedGroups;
  }, [allResults, currentCategory]);

  const openPalette = useCallback(() => {
    // Check if any DaisyUI modal is currently open
    const openModals = document.querySelectorAll('.modal-open, dialog[open]');
    if (openModals.length > 0) {
      return; // Don't open if any modal is already open
    }
    
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
    setActiveCategoryIndex(0);
    setCollapsedCategories(new Set()); // Reset collapsed state when opening
  }, []);
  const closePalette = useCallback(() => setOpen(false), []);

  const toggleCategory = useCallback((categoryGroup) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryGroup)) {
        newSet.delete(categoryGroup);
      } else {
        newSet.add(categoryGroup);
      }
      return newSet;
    });
  }, []);

  // Categories array for navigation - reorder based on current category
  const categories = useMemo(() => {
    const allCategories = [
      { key: 'agents', label: 'Agents', desc: 'Manage and configure agents' },
      { key: 'apikeys', label: 'API Keys', desc: 'Credentials and providers' },
      { key: 'Auths', label: 'Auth Keys', desc: 'Configure Auth Keys' },
      { key: 'docs', label: 'Knowledge Base', desc: 'Documents and sources' },
      { key: 'integrations', label: 'Gtwy as Embed', desc: 'Configure integrations' },
    ];
    
    // Reorder to show current category first
    const currentCategoryIndex = allCategories.findIndex(cat => cat.key === currentCategory);
    if (currentCategoryIndex > -1) {
      const currentCat = allCategories[currentCategoryIndex];
      const otherCats = allCategories.filter((_, index) => index !== currentCategoryIndex);
      return [currentCat, ...otherCats];
    }
    
    return allCategories;
  }, [currentCategory]);

  const navigateTo = useCallback((item) => {
    if (!orgId) {
      router.push("/");
      return;
    }
    switch (item.type) {
      case "agents":
        // If a specific version was matched in search, deep-link to that version
        if (item.versionId) {
          router.push(`/org/${orgId}/agents/configure/${item.id}?version=${item.versionId}`);
        } else {
          router.push(`/org/${orgId}/agents/configure/${item.id}?version=${item.published_version_id || item.versions?.[0]}`);
        }
        break;
      case "apikeys":
        router.push(`/org/${orgId}/apikeys`);
        break;
      case "docs":
        router.push(`/org/${orgId}/knowledge_base`);
        break;
      case "functions":
        router.push(`/org/${orgId}/agents`);
        break;
      case "integrations":
        router.push(`/org/${orgId}/integration`);
        break;
      case "Auths":
        router.push(`/org/${orgId}/pauthkey`);
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
      case 'Auths':
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

  useEffect(() => {
    const handler = (e) => {
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && !isEmbedUser && !pathname.endsWith("/org") && !pathname.endsWith('/login'))) {
        e.preventDefault();
        openPalette();
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
      
      // Handle keyboard navigation when palette is open
      if (open) {
        if (query === "") {
          // Navigate categories when no search query
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveCategoryIndex(prev => 
              prev < categories.length - 1 ? prev + 1 : 0
            );
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveCategoryIndex(prev => 
              prev > 0 ? prev - 1 : categories.length - 1
            );
          } else if (e.key === "Enter") {
            e.preventDefault();
            navigateCategory(categories[activeCategoryIndex].key);
          }
        } else {
          // Navigate search results when there's a query
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => 
              prev < flatResults.length - 1 ? prev + 1 : 0
            );
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => 
              prev > 0 ? prev - 1 : flatResults.length - 1
            );
          } else if (e.key === "Enter" && flatResults[activeIndex]) {
            e.preventDefault();
            navigateTo(flatResults[activeIndex]);
          }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, query, activeCategoryIndex, activeIndex, categories, flatResults, navigateCategory, navigateTo, openPalette, pathname]);

  // Scroll active item into view when activeIndex changes
  useEffect(() => {
    if (!open || query.trim() === "" || flatResults.length === 0) return;
    
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      const activeElement = document.querySelector(`[data-result-index="${activeIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }, 0);
  }, [activeIndex, open, query, flatResults.length]);

  const showLanding = open && query.trim() === "";
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4" onClick={closePalette} style={{zIndex: 999999}}>
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
          <button className="btn btn-sm" onClick={closePalette}><X className="w-4 h-4" /></button>
        </div>
        <div className="max-h-[60vh] overflow-auto p-2">
          {showLanding ? (
            <div className="">

              <div className="space-y-1 p-2">
                {categories.map((c, index) => {
                  const isActiveCategory = index === activeCategoryIndex;
                  
                  return (
                    <button
                      key={c.key}
                      onClick={() => navigateCategory(c.key)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center  justify-between relative ${
                        isActiveCategory 
                          ? 'bg-primary text-primary-content' 
                          : 'bg-base-200 hover:bg-base-300'
                      }`}
                    >
                      <div className="font-medium truncate">{c.label}</div>
                      <span className="text-xs opacity-70 truncate">{c.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {Object.keys(groupedResults).length === 0 ? (
                <div className="p-6 text-center text-sm opacity-70">No results</div>
              ) : (
                Object.entries(groupedResults).map(([group, rows]) => {
                  const isCollapsed = collapsedCategories.has(group);
                  const hasResults = rows.length > 0;
                  
                  if (!hasResults) return null;
                  
                  return (
                    <div key={group} className="mb-3">
                      <div 
                        className="flex items-center w-full justify-between px-2 py-1 cursor-pointer hover:bg-base-200 rounded"
                        onClick={() => toggleCategory(group)}
                      >
                        <div className="flex items-center gap-2">
                          {isCollapsed ? (
                            <ChevronRight className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                          <span className="text-xs uppercase tracking-wide opacity-60">
                            {group} ({rows.length})
                          </span>
                        </div>
                      </div>
                      
                      {!isCollapsed && (
                        <ul className="ml-2">
                          {rows.map((row) => {
                            const globalIdx = flatResults.findIndex((r) => r === row);
                            const active = globalIdx === activeIndex;
                            return (
                              <li
                                key={`${row.type}-${row.id}`}
                                data-result-index={globalIdx}
                                onClick={() => navigateTo(row)}
                                className={`cursor-pointer rounded px-3 py-2 flex items-center w-full justify-between ${
                                  active ? "bg-primary text-primary-content" : "hover:bg-base-200"
                                }`}
                              >
                                <div className="font-medium truncate">{row.title}</div>
                                <span className="text-xs opacity-70 truncate">{row.subtitle}</span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-base-300 p-2 text-xs opacity-70">
          <div>Navigate with ↑ ↓ · Enter to open · Click to collapse/expand · Esc to close</div>
          <div>Cmd/Ctrl + K</div>
        </div>
      </div>
    </div>
  );
};

export default Protected(CommandPalette);
