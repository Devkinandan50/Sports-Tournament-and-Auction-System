import { useEffect, useState } from "react";

interface Sport {
  id: string;
  name: string;
}

export interface AuctionFilterValues {
  search: string;
  sportId: string | undefined;
  minRating: number | undefined;
  unsoldOnly: boolean | undefined;
  sortBy: string | undefined;
}

interface AuctionFiltersProps {
  sports: Sport[];
  values: AuctionFilterValues;
  onChange: (values: AuctionFilterValues) => void;
}

export function AuctionFilters({ sports, values, onChange }: AuctionFiltersProps) {
  const [searchInput, setSearchInput] = useState(values.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== values.search) {
        onChange({ ...values, search: searchInput });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const set = (partial: Partial<AuctionFilterValues>) =>
    onChange({ ...values, ...partial });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <input
        type="text"
        placeholder="Search by name..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />

      <select
        value={values.sportId ?? ""}
        onChange={(e) =>
          set({
            sportId: e.target.value || undefined,
            minRating: e.target.value ? values.minRating : undefined,
          })
        }
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
      >
        <option value="">All Sports</option>
        {sports.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {values.sportId && (
        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-600">Min Rating:</label>
          <input
            type="range"
            min={1}
            max={10}
            value={values.minRating ?? 1}
            onChange={(e) => set({ minRating: Number(e.target.value) })}
            className="w-24 accent-indigo-600"
          />
          <span className="font-medium text-indigo-600">{values.minRating ?? 1}</span>
        </div>
      )}

      <div className="flex rounded-md border border-gray-300 text-sm">
        {(["All", "Unsold", "Sold"] as const).map((label) => {
          const val =
            label === "All" ? undefined : label === "Unsold" ? true : false;
          const active =
            (label === "All" && values.unsoldOnly === undefined) ||
            (label === "Unsold" && values.unsoldOnly === true) ||
            (label === "Sold" && values.unsoldOnly === false);
          return (
            <button
              key={label}
              onClick={() =>
                set({ unsoldOnly: val === undefined ? undefined : val ? true : false })
              }
              className={`px-3 py-1.5 transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              } ${label === "All" ? "rounded-l-md" : ""} ${label === "Sold" ? "rounded-r-md" : ""}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <select
        value={values.sortBy ?? ""}
        onChange={(e) => set({ sortBy: e.target.value || undefined })}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
      >
        <option value="">Default Sort</option>
        <option value="name">Name</option>
        <option value="rating">Rating</option>
        <option value="price">Price</option>
      </select>
    </div>
  );
}
