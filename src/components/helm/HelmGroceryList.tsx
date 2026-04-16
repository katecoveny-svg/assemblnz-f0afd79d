import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2, Check, ShoppingCart, Store, ChevronDown, ChevronUp, ExternalLink, Truck } from "lucide-react";

const CATEGORIES = [
  { value: "produce", label: "Produce", emoji: "🥬" },
  { value: "dairy", label: "Dairy", emoji: "🥛" },
  { value: "meat", label: "Meat", emoji: "🥩" },
  { value: "bakery", label: "Bakery", emoji: "🍞" },
  { value: "pantry", label: "Pantry", emoji: "🥫" },
  { value: "frozen", label: "Frozen", emoji: "🧊" },
  { value: "drinks", label: "Drinks", emoji: "🥤" },
  { value: "household", label: "Household", emoji: "🧹" },
  { value: "health", label: "Health", emoji: "💊" },
  { value: "baby", label: "Baby", emoji: "🍼" },
  { value: "pet", label: "Pet", emoji: "🐾" },
  { value: "other", label: "Other", emoji: "📦" },
] as const;

// NZ online grocery stores with search/order URLs
const NZ_STORES = [
  {
    id: "countdown",
    name: "Countdown",
    color: "#00A651",
    searchUrl: "https://www.countdown.co.nz/shop/searchproducts?search=",
    cartUrl: "https://www.countdown.co.nz/shop/cart",
    logo: "🟢",
  },
  {
    id: "paknsave",
    name: "PAK'nSAVE",
    color: "#FFD100",
    searchUrl: "https://www.paknsave.co.nz/shop/search?q=",
    cartUrl: "https://www.paknsave.co.nz/shop/cart",
    logo: "🟡",
  },
  {
    id: "newworld",
    name: "New World",
    color: "#E31837",
    searchUrl: "https://www.newworld.co.nz/shop/search?q=",
    cartUrl: "https://www.newworld.co.nz/shop/cart",
    logo: "🔴",
  },
] as const;

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
  note: string | null;
  sort_order: number;
}

interface GroceryList {
  id: string;
  name: string;
  store: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
}

export default function HelmGroceryList({ familyId }: { familyId: string | null }) {
  const { user } = useAuth();
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [newCat, setNewCat] = useState("other");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>("countdown");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(CATEGORIES.map(c => c.value)));
  const [loading, setLoading] = useState(true);

  // Build online shopping URL: searches for all unchecked items at chosen store
  const getShopOnlineUrl = useCallback(() => {
    const store = NZ_STORES.find(s => s.id === selectedStore) || NZ_STORES[0];
    const unchecked = items.filter(i => !i.checked).map(i => i.name);
    if (unchecked.length === 0) return store.cartUrl;
    // Use the first unchecked item as search (stores don't support multi-item search)
    return store.searchUrl + encodeURIComponent(unchecked[0]);
  }, [items, selectedStore]);

  // Build a URL that pre-loads all items as separate searches (opens store search)
  const openStoreForItem = (itemName: string) => {
    const store = NZ_STORES.find(s => s.id === selectedStore) || NZ_STORES[0];
    window.open(store.searchUrl + encodeURIComponent(itemName), "_blank");
  };

  // Load lists
  useEffect(() => {
    if (!familyId) return;
    const load = async () => {
      const { data } = await supabase
        .from("helm_grocery_lists" as any)
        .select("*")
        .eq("family_id", familyId)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      const fetched = (data || []) as unknown as GroceryList[];
      setLists(fetched);
      if (fetched.length > 0 && !activeListId) setActiveListId(fetched[0].id);
      setLoading(false);
    };
    load();
  }, [familyId]);

  // Load items for active list
  useEffect(() => {
    if (!activeListId) return;
    const load = async () => {
      const { data } = await supabase
        .from("helm_grocery_items" as any)
        .select("*")
        .eq("list_id", activeListId)
        .order("sort_order");
      setItems((data || []) as unknown as GroceryItem[]);
    };
    load();

    // Real-time subscription
    const channel = supabase
      .channel(`grocery-${activeListId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "helm_grocery_items", filter: `list_id=eq.${activeListId}` }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeListId]);

  const createList = useCallback(async () => {
    if (!familyId || !user) return;
    const { data } = await supabase
      .from("helm_grocery_lists" as any)
      .insert({ family_id: familyId, name: "Shopping List", created_by: user.id } as any)
      .select()
      .single();
    if (data) {
      const list = data as unknown as GroceryList;
      setLists(prev => [list, ...prev]);
      setActiveListId(list.id);
    }
  }, [familyId, user]);

  const addItem = useCallback(async () => {
    if (!newItem.trim() || !activeListId) return;
    await supabase
      .from("helm_grocery_items" as any)
      .insert({ list_id: activeListId, name: newItem.trim(), quantity: newQty, category: newCat, sort_order: items.length } as any);
    setNewItem("");
    setNewQty("1");
    setNewCat("other");
    setShowAdd(false);
  }, [newItem, newQty, newCat, activeListId, items.length]);

  const toggleItem = useCallback(async (id: string, checked: boolean) => {
    await supabase
      .from("helm_grocery_items" as any)
      .update({ checked: !checked, checked_by: !checked ? user?.id : null } as any)
      .eq("id", id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !checked } : i));
  }, [user]);

  const deleteItem = useCallback(async (id: string) => {
    await supabase.from("helm_grocery_items" as any).delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  if (!familyId) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-10 h-10 text-pounamu/40 mx-auto mb-3" />
        <p className="text-sm text-white/40">Set up your family first to use grocery lists</p>
      </div>
    );
  }

  const checkedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;
  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: items.filter(i => i.category === cat.value),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-pounamu" />
            Groceries
          </h2>
          {totalCount > 0 && (
            <p className="text-xs text-white/40 mt-0.5">{checkedCount}/{totalCount} items done</p>
          )}
        </div>
        <div className="flex gap-2">
          {lists.length === 0 ? (
            <button onClick={createList} className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-pounamu text-foreground">
              New List
            </button>
          ) : (
            <button onClick={() => setShowAdd(!showAdd)} className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-pounamu text-foreground inline-flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Item
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="bg-white/5 rounded-xl p-3">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#3A7D6E] rounded-full transition-all duration-500" style={{ width: `${(checkedCount / totalCount) * 100}%` }} />
          </div>
          <div className="text-[10px] text-gray-400 mt-1.5 text-right">{Math.round((checkedCount / totalCount) * 100)}% complete</div>
        </div>
      )}

      {/* Order Online */}
      {totalCount > 0 && (
        <div className="bg-white/5 rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#5AADA0]" />
              <span className="text-sm font-medium text-white/80">Order Online</span>
            </div>
            <span className="text-[10px] text-gray-400">{items.filter(i => !i.checked).length} items to buy</span>
          </div>
          <div className="flex gap-2">
            {NZ_STORES.map(store => (
              <button
                key={store.id}
                onClick={() => setSelectedStore(store.id)}
                className={`flex-1 text-[10px] px-2 py-2 rounded-lg border font-medium text-center transition-all ${
                  selectedStore === store.id
                    ? "text-foreground border-gray-300"
                    : "bg-white/5 border-gray-100 text-white/40"
                }`}
                style={selectedStore === store.id ? { background: store.color + "20", borderColor: store.color + "40" } : undefined}
              >
                {store.logo} {store.name}
              </button>
            ))}
          </div>
          <a
            href={getShopOnlineUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-sm py-2.5 rounded-lg font-semibold text-foreground flex items-center justify-center gap-2 transition-colors"
            style={{ background: NZ_STORES.find(s => s.id === selectedStore)?.color || "#00A651" }}
          >
            <ShoppingCart className="w-4 h-4" />
            Shop at {NZ_STORES.find(s => s.id === selectedStore)?.name}
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <p className="text-[9px] text-white/20 text-center">
            Opens {NZ_STORES.find(s => s.id === selectedStore)?.name} online — search your items and add to cart
          </p>
        </div>
      )}

      {/* Quick add */}
      {showAdd && (
        <div className="bg-white/5 border border-gray-200 rounded-xl p-4 space-y-3">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Item name (e.g. milk, bread, avocados)"
            className="w-full text-sm px-3 py-2 rounded-lg bg-white/5 border border-gray-200 text-foreground placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pounamu/50"
            autoFocus
          />
          <div className="flex gap-2">
            <input
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              placeholder="Qty"
              className="w-20 text-sm px-3 py-2 rounded-lg bg-white/5 border border-gray-200 text-foreground placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pounamu/50"
            />
            <select
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-white/5 border border-gray-200 text-foreground focus:outline-none focus:ring-2 focus:ring-pounamu/50"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <button onClick={addItem} className="w-full text-sm py-2 rounded-lg font-semibold bg-pounamu text-foreground">
            Add to List
          </button>
        </div>
      )}

      {/* Grouped items */}
      {grouped.length === 0 && !loading && lists.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">List is empty. Add items above, or text TORO:</p>
          <p className="text-xs text-pounamu/60 mt-1 font-mono">"Add milk, bread, eggs to groceries"</p>
        </div>
      )}

      {grouped.map(group => (
        <div key={group.value} className="bg-white/5 rounded-xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleCat(group.value)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
          >
            <span className="text-sm font-medium text-white/80">
              {group.emoji} {group.label}
              <span className="text-gray-400 ml-2 text-xs">({group.items.filter(i => !i.checked).length})</span>
            </span>
            {expandedCats.has(group.value) ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {expandedCats.has(group.value) && (
            <div className="border-t border-gray-100 divide-y divide-white/5">
              {group.items.map(item => (
                <div key={item.id} className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${item.checked ? "opacity-40" : ""}`}>
                  <button
                    onClick={() => toggleItem(item.id, item.checked)}
                    className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      item.checked ? "bg-[#3A7D6E] border-emerald-500 text-foreground" : "border-gray-300 hover:border-white/40"
                    }`}
                  >
                    {item.checked && <Check className="w-3 h-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${item.checked ? "line-through text-gray-400" : "text-white/80"}`}>{item.name}</span>
                    {item.quantity !== "1" && (
                      <span className="text-xs text-gray-400 ml-2">x{item.quantity}</span>
                    )}
                  </div>
                  {!item.checked && (
                    <button
                      onClick={() => openStoreForItem(item.name)}
                      className="text-white/20 hover:text-[#5AADA0] transition-colors"
                      title={`Find at ${NZ_STORES.find(s => s.id === selectedStore)?.name}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => deleteItem(item.id)} className="text-white/20 hover:text-[#C85A54] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
