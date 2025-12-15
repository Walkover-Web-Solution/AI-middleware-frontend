"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useCustomSelector } from "@/customHooks/customSelector";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, ChevronDown, ChevronRight } from "lucide-react";
import { formatRelativeTime, formatDate } from "@/utils/utility";
import Protected from "../Protected";

function getOrgIdFromPath(pathname) {
  const parts = (pathname || "").split("/").filter(Boolean);
  const orgIdx = parts.indexOf("org");
  if (orgIdx !== -1 && parts[orgIdx + 1]) return parts[orgIdx + 1];
  return null;
}

function getCurrentCategoryGroup(currentCategory) {
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
  const [collapsedLandingCategories, setCollapsedLandingCategories] = useState(new Set());
  const [collapsedSearchCategories, setCollapsedSearchCategories] = useState(new Set());

  const orgId = useMemo(() => getOrgIdFromPath(pathname), [pathname]);
  
  const currentCategory = useMemo(() => {
    if (!pathname) return null;
    const parts = pathname.split("/").filter(Boolean);
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

  // Build category items with proper formatting
  const buildCategoryItems = useCallback((categoryKey) => {
    switch(categoryKey) {
      case 'agents':
        return agentList.filter(agent => !agent.deletedAt).map((a) => ({
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
                    <span className="group-hover:hidden">{formatRelativeTime(a.last_used)}</span>
                    <span className="hidden group-hover:inline text-xs">{formatDate(a.last_used)}</span>
                  </div>
                </>
              )}
            </div>
          ),
          type: "agents",
          published_version_id: a.published_version_id,
          versions: a.versions
        }));
      case 'apikeys':
        return apikeys.map((k) => ({
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
                    <span className="group-hover:hidden">{formatRelativeTime(k.last_used)}</span>
                    <span className="hidden group-hover:inline text-xs">{formatDate(k.last_used)}</span>
                  </div>
                </>
              )}
            </div>
          ),
          type: "apikeys",
        }));
      case 'docs':
        return knowledgeBase.map((d) => ({
          id: d._id,
          title: d.name || d._id,
          subtitle: "Knowledge Base",
          type: "docs",
        }));
      case 'integrations':
        return integrationData.map((d) => ({
          id: d._id,
          title: d.name || d._id,
          subtitle: "Integration",
          type: "integrations",
        }));
      case 'Auths':
        return authData.map((d) => ({
          id: d.id,
          title: d.name || d.id,
          subtitle: "Auth Key",
          type: "Auths",
        }));
      default:
        return [];
    }
  }, [agentList, apikeys, knowledgeBase, integrationData, authData]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filterBy = (list, fields) => {
      if (!q) return [];
      return list.filter((it) =>
        fields.some((f) => String(it?.[f] || "").toLowerCase().includes(q))
      );
    };
    console.log(agentList,"hello")
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
                <span className="group-hover:hidden">{formatRelativeTime(a.last_used)}</span>
                <span className="hidden group-hover:inline text-xs">{formatDate(a.last_used)}</span>
              </div>
            </>
          )}
        </div>
      ),
      type: "agents",
      published_version_id: a.published_version_id,
      versions: a.versions
    }));

    const agentsVersionMatches = !q ? [] : (agentList || []).filter(agent => !agent.deletedAt).flatMap((a) => {
      const versionsArr = Array.isArray(a?.versions) ? a.versions : [];
      const published = a?.published_version_id ? [a.published_version_id] : [];
      const candidates = [...versionsArr, ...published].map((v) => String(v || ""));
      const matches = candidates.filter((v) => v.toLowerCase() === q.toLowerCase());
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
                <span className="group-hover:hidden">{formatRelativeTime(k.last_used)}</span>
                <span className="hidden group-hover:inline text-xs">{formatDate(k.last_used)}</span>
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
      agents: [...new Set([...agentsGroup, ...agentsVersionMatches])],
      apikeys: apikeysGroup,
      docs: kbGroup,
      integrations: integrationGroup,
      auths: authGroup,
    };
  }, [query, agentList, apikeys, knowledgeBase, functions, integrationData, authData]);

  const allResults = useMemo(() => [
    ...items.agents.map((it) => ({ group: "Agents", ...it })),
    ...items.apikeys.map((it) => ({ group: "API Keys", ...it })),
    ...items.docs.map((it) => ({ group: "Knowledge Base", ...it })),
    ...items.integrations.map((it) => ({ group: "Integrations", ...it })),
    ...items.auths.map((it) => ({ group: "Auth Keys", ...it })),
  ], [items]);

  const groupedResults = useMemo(() => {
    const groups = {};
    allResults.forEach((r) => {
      if (!groups[r.group]) groups[r.group] = [];
      groups[r.group].push(r);
    });
    
    const sortedGroups = {};
    const currentCategoryGroup = getCurrentCategoryGroup(currentCategory);
    
    if (currentCategoryGroup && groups[currentCategoryGroup]) {
      sortedGroups[currentCategoryGroup] = groups[currentCategoryGroup];
    }
    
    Object.keys(groups)
      .filter(group => group !== currentCategoryGroup)
      .sort()
      .forEach(group => {
        sortedGroups[group] = groups[group];
      });
    
    return sortedGroups;
  }, [allResults, currentCategory]);

  // Build flat list for keyboard navigation in search mode
  const flatResults = useMemo(() => {
    const sortedResults = [];
    Object.entries(groupedResults).forEach(([group, rows]) => {
      if (!collapsedSearchCategories.has(group)) {
        sortedResults.push(...rows);
      }
    });
    return sortedResults;
  }, [groupedResults, collapsedSearchCategories]);

  // Categories array for landing navigation
  const categories = useMemo(() => {
    const allCategories = [
      { key: 'agents', label: 'Agents', desc: 'Manage and configure agents' },
      { key: 'apikeys', label: 'API Keys', desc: 'Credentials and providers' },
      { key: 'Auths', label: 'Auth Keys', desc: 'Configure Auth Keys' },
      { key: 'docs', label: 'Knowledge Base', desc: 'Documents and sources' },
      { key: 'integrations', label: 'Gtwy as Embed', desc: 'Configure integrations' },
    ];
    
    const currentCategoryIndex = allCategories.findIndex(cat => cat.key === currentCategory);
    if (currentCategoryIndex > -1) {
      const currentCat = allCategories[currentCategoryIndex];
      const otherCats = allCategories.filter((_, index) => index !== currentCategoryIndex);
      return [currentCat, ...otherCats];
    }
    
    return allCategories;
  }, [currentCategory]);

  // Build flat navigation list for landing mode (categories + visible items)
  const landingFlatList = useMemo(() => {
    const list = [];
    categories.forEach((cat) => {
      list.push({ type: 'category', key: cat.key, data: cat });
      
      // Only add items if category is not collapsed
      if (!collapsedLandingCategories.has(cat.key)) {
        const items = buildCategoryItems(cat.key);
        items.forEach(item => {
          list.push({ type: 'item', key: cat.key, data: item });
        });
      }
    });
    return list;
  }, [categories, buildCategoryItems, collapsedLandingCategories]);

  const openPalette = useCallback(() => {
    const openModals = document.querySelectorAll('.modal-open, dialog[open]');
    if (openModals.length > 0) return;
    
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
    
    // Collapse all categories except the first one (current category)
    const allCategoryKeys = categories.map(c => c.key);
    const firstCategoryKey = allCategoryKeys[0];
    const collapsedSet = new Set(allCategoryKeys.filter(key => key !== firstCategoryKey));
    setCollapsedLandingCategories(collapsedSet);
    
    // For search mode, collapse all except first group
    setCollapsedSearchCategories(new Set());
  }, [categories]);

  const closePalette = useCallback(() => setOpen(false), []);

  const toggleLandingCategory = useCallback((categoryKey) => {
    lastNavigationMethod.current = 'click';
    setCollapsedLandingCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
    // Reset to keyboard mode after a short delay
    setTimeout(() => {
      lastNavigationMethod.current = 'keyboard';
    }, 100);
  }, []);

  const toggleSearchCategory = useCallback((categoryGroup) => {
    setCollapsedSearchCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryGroup)) {
        newSet.delete(categoryGroup);
      } else {
        newSet.add(categoryGroup);
      }
      return newSet;
    });
  }, []);

  const navigateTo = useCallback((item) => {
    if (!orgId) {
      router.push("/");
      return;
    }
    switch (item.type) {
      case "agents":
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
    const routes = {
      'agents': `/org/${orgId}/agents`,
      'apikeys': `/org/${orgId}/apikeys`,
      'docs': `/org/${orgId}/knowledge_base`,
      'integrations': `/org/${orgId}/integration`,
      'Auths': `/org/${orgId}/pauthkey`,
      'flows': `/org/${orgId}/orchestratal_model`,
    };
    router.push(routes[key] || "/");
    closePalette();
  }, [orgId, router, closePalette]);

  useEffect(() => {
    const handler = (e) => {
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && !isEmbedUser && !pathname.endsWith("/org") && !pathname.endsWith('/login'))) {
        e.preventDefault();
        openPalette();
      }
      if (e.key === "Escape") {
        closePalette();
      }
      
      if (open) {
        if (query === "") {
          // Landing mode - navigate through flat list
          if (e.key === "ArrowDown") {
            e.preventDefault();
            lastNavigationMethod.current = 'keyboard';

            // Ctrl/Cmd + ArrowDown: jump to next category header
            if (e.ctrlKey || e.metaKey) {
              setActiveIndex(prev => {
                if (landingFlatList.length === 0) return prev;
                const currentIdx = prev;
                for (let offset = 1; offset < landingFlatList.length; offset++) {
                  const idx = (currentIdx + offset) % landingFlatList.length;
                  if (landingFlatList[idx]?.type === 'category') return idx;
                }
                return prev;
              });
            } else {
              // Normal ArrowDown: linear navigation over categories + items
              setActiveIndex(prev => (prev < landingFlatList.length - 1 ? prev + 1 : 0));
            }
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            lastNavigationMethod.current = 'keyboard';

            // Ctrl/Cmd + ArrowUp: jump to previous category header
            if (e.ctrlKey || e.metaKey) {
              setActiveIndex(prev => {
                if (landingFlatList.length === 0) return prev;
                const currentIdx = prev;
                for (let offset = 1; offset < landingFlatList.length; offset++) {
                  const idx = (currentIdx - offset + landingFlatList.length) % landingFlatList.length;
                  if (landingFlatList[idx]?.type === 'category') return idx;
                }
                return prev;
              });
            } else {
              // Normal ArrowUp: linear navigation over categories + items
              setActiveIndex(prev => (prev > 0 ? prev - 1 : landingFlatList.length - 1));
            }
          } else if (e.key === "Enter") {
            e.preventDefault();
            const current = landingFlatList[activeIndex];
            if (current?.type === 'category') {
              navigateCategory(current.key);
            } else if (current?.type === 'item') {
              navigateTo(current.data);
            }
          }
        } else {
          // Search mode - navigate through search results
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : 0));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : flatResults.length - 1));
          } else if (e.key === "Enter" && flatResults[activeIndex]) {
            e.preventDefault();
            navigateTo(flatResults[activeIndex]);
          }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, query, activeIndex, landingFlatList, flatResults, navigateCategory, navigateTo, openPalette, closePalette, pathname, isEmbedUser]);

  // Auto-expand category when navigating to it with keyboard
  const lastNavigationMethod = React.useRef('keyboard');
  
  useEffect(() => {
    if (!open || query !== "" || lastNavigationMethod.current !== 'keyboard') return;
    
    const current = landingFlatList[activeIndex];
    if (current?.type === 'category') {
      const categoryKey = current.key;
      // Collapse all categories except the current one
      const allCategoryKeys = categories.map(c => c.key);
      const collapsedSet = new Set(allCategoryKeys.filter(key => key !== categoryKey));
      setCollapsedLandingCategories(collapsedSet);
    } else if (current?.type === 'item') {
      // If navigating to an item, ensure its category is expanded
      const categoryKey = current.key;
      setCollapsedLandingCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryKey);
        return newSet;
      });
    }
  }, [activeIndex, open, query, landingFlatList, categories]);

  // Scroll active item into view
  useEffect(() => {
    if (!open) return;
    
    setTimeout(() => {
      const activeElement = document.querySelector(`[data-nav-index="${activeIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }, 0);
  }, [activeIndex, open]);

  // Initialize collapsed state for search mode when query changes
  useEffect(() => {
    if (query.trim() !== "" && open) {
      const groupKeys = Object.keys(groupedResults);
      if (groupKeys.length > 0) {
        const firstGroup = groupKeys[0];
        const collapsedSet = new Set(groupKeys.filter(group => group !== firstGroup));
        setCollapsedSearchCategories(collapsedSet);
      }
    }
  }, [query, open, groupedResults]);

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
            <div className="space-y-1 p-2">
              {categories.map((cat, catIndex) => {
                const categoryItems = buildCategoryItems(cat.key);
                const isCategoryCollapsed = collapsedLandingCategories.has(cat.key);
                const categoryNavIndex = landingFlatList.findIndex(item => item.type === 'category' && item.key === cat.key);
                const isCategoryActive = activeIndex === categoryNavIndex;

                return (
                  <div key={cat.key} className="mb-1">
                    <div
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        isCategoryActive ? 'bg-primary text-primary-content' : 'bg-base-200 hover:bg-base-300'
                      }`}
                    >
                      <button
                        data-nav-index={categoryNavIndex}
                        onClick={() => navigateCategory(cat.key)}
                        className="flex-1 flex items-center justify-between"
                      >
                        <div className="font-medium truncate">{cat.label}</div>
                        <span className="text-xs opacity-70 truncate">{cat.desc}</span>
                      </button>
                      
                      {categoryItems.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLandingCategory(cat.key);
                          }}
                          className="ml-2 p-1 rounded hover:bg-base-300/60"
                        >
                          {isCategoryCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {categoryItems.length > 0 && !isCategoryCollapsed && (
                      <div className="mt-1 ml-2 border border-base-300 rounded-md bg-base-200/40">
                        <ul className="pb-1">
                          {categoryItems.map((item, itemIndex) => {
                            const itemNavIndex = landingFlatList.findIndex(
                              navItem => navItem.type === 'item' && navItem.key === cat.key && navItem.data.id === item.id
                            );
                            const isItemActive = activeIndex === itemNavIndex;

                            return (
                              <li
                                key={`${item.type}-${item.id}`}
                                data-nav-index={itemNavIndex}
                                onClick={() => navigateTo(item)}
                                className={`cursor-pointer px-3 py-2 flex items-center w-full justify-between text-sm rounded-md ${
                                  isItemActive ? 'bg-primary/20 border border-primary/40' : 'hover:bg-base-200'
                                }`}
                              >
                                <div className="font-medium truncate">{item.title}</div>
                                <span className="text-xs opacity-70 truncate">{item.subtitle}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              {Object.keys(groupedResults).length === 0 ? (
                <div className="p-6 text-center text-sm opacity-70">No results</div>
              ) : (
                <div className="space-y-1 p-2">
                  {Object.entries(groupedResults).map(([group, rows]) => {
                    const isCollapsed = collapsedSearchCategories.has(group);
                    if (rows.length === 0) return null;
                    
                    return (
                      <div key={group} className="mb-1">
                        <div 
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                            'bg-base-200 hover:bg-base-300'
                          }`}
                          onClick={() => toggleSearchCategory(group)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{group}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs opacity-70">{rows.length} results</span>
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                        
                        {!isCollapsed && (
                          <div className="mt-1 ml-2 border border-base-300 rounded-md bg-base-200/40">
                            <ul className="pb-1">
                              {rows.map((row) => {
                                const globalIdx = flatResults.findIndex((r) => r.id === row.id && r.type === row.type);
                                const active = globalIdx === activeIndex;
                                return (
                                  <li
                                    key={`${row.type}-${row.id}`}
                                    data-nav-index={globalIdx}
                                    onClick={() => navigateTo(row)}
                                    className={`cursor-pointer px-3 py-2 flex items-center w-full justify-between text-sm rounded-md ${
                                      active ? "bg-primary/20 border border-primary/40" : "hover:bg-base-200"
                                    }`}
                                  >
                                    <div className="font-medium truncate">{row.title}</div>
                                    <span className="text-xs opacity-70 truncate">{row.subtitle}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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