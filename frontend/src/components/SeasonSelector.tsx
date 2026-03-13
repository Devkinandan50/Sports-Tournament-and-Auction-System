import { useSeason } from "../lib/SeasonContext";

export function SeasonSelector() {
  const { seasons, selectedSeason, setSelectedSeasonId, loading } = useSeason();

  if (loading || seasons.length === 0) return null;

  return (
    <select
      value={selectedSeason?.id ?? ""}
      onChange={(e) => setSelectedSeasonId(e.target.value)}
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
    >
      {seasons.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
