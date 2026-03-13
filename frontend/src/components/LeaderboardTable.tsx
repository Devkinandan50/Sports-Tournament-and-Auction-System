import { useState } from "react";

interface SportPoint {
  sportId: string;
  sportName: string;
  place: number;
  points: number;
}

interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  captainName: string;
  logo?: string | null;
  totalPoints: number;
  sportPoints: SportPoint[];
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  if (entries.length === 0) {
    return <p className="text-gray-500">No results yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 w-16">Rank</th>
            <th className="px-4 py-3">Team</th>
            <th className="px-4 py-3 text-right">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((entry, i) => (
            <Fragment key={entry.teamId} entry={entry} rank={i + 1}
              expanded={expandedTeam === entry.teamId}
              onToggle={() =>
                setExpandedTeam(
                  expandedTeam === entry.teamId ? null : entry.teamId
                )
              }
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Fragment({
  entry,
  rank,
  expanded,
  onToggle,
}: {
  entry: {
    teamId: string;
    teamName: string;
    totalPoints: number;
    sportPoints: SportPoint[];
  };
  rank: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <td className="px-4 py-3 font-medium text-gray-500">{rank}</td>
        <td className="px-4 py-3 font-medium text-gray-900">{entry.teamName}</td>
        <td className="px-4 py-3 text-right font-bold text-indigo-600">
          {entry.totalPoints}
        </td>
      </tr>
      {expanded && entry.sportPoints.length > 0 && (
        <tr>
          <td colSpan={3} className="bg-gray-50 px-4 py-3">
            <div className="flex flex-wrap gap-3">
              {entry.sportPoints.map((sp) => (
                <span
                  key={sp.sportId}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs border border-gray-200"
                >
                  {sp.sportName}
                  <span className="text-gray-400">#{sp.place}</span>
                  <span className="font-semibold text-indigo-600">
                    {sp.points} pts
                  </span>
                </span>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
