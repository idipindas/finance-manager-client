import { useState } from "react";
import { Search, Plus, Tag } from "lucide-react";
import { useCategories, useSuggestCategory } from "@/hooks/useCategories";
import Button from "@/components/ui/Button";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const suggest = useSuggestCategory();
  const [search, setSearch] = useState("");
  const [newCat, setNewCat] = useState("");

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newCat.trim()) return;
    await suggest.mutateAsync(newCat.trim());
    setNewCat("");
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary font-heading">Categories</h1>
        <p className="text-text-muted text-sm mt-0.5">{categories.length} categories</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-bg-card border border-border rounded-btn pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          placeholder="Search categories..."
        />
      </div>

      {/* Add new */}
      <div className="flex gap-2 mb-6">
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          className="flex-1 bg-bg-card border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          placeholder="New category name..."
        />
        <Button onClick={handleAdd} loading={suggest.isPending} size="md">
          <Plus size={16} /> Add
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="shimmer h-8 w-24 rounded-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
            <Tag size={22} className="text-accent" />
          </div>
          <p className="text-text-muted text-sm">
            {search ? `No categories matching "${search}"` : "No categories yet"}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filtered.map((c) => (
            <span
              key={c._id}
              className="px-4 py-1.5 bg-bg-card border border-border rounded-full text-sm text-text-primary hover:border-accent hover:text-accent transition-colors cursor-default"
            >
              {c.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
