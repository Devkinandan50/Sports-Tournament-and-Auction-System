import { useParams, Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_TEAM, GET_MATCH_RESULTS } from "../graphql/queries";
import { useSeason } from "../lib/SeasonContext";
import { PlayerCard } from "../components/PlayerCard";

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const { selectedSeason } = useSeason();

  const { data, loading } = useQuery(GET_TEAM, {
    variables: { id, seasonId: selectedSeason?.id },
    skip: !id || !selectedSeason?.id,
    pollInterval: 30_000,
  });

  const { data: resultsData } = useQuery(GET_MATCH_RESULTS, {
    variables: { seasonId: selectedSeason?.id },
    skip: !selectedSeason?.id,
    pollInterval: 30_000,
  });

  if (loading) {
    return <Shell>Loading...</Shell>;
  }

  const team = data?.team;
  if (!team) {
    return <Shell>Team not found.</Shell>;
  }

  const teamResults = (resultsData?.matchResults ?? []).filter(
    (r: any) => r.teamName === team.name
  );

  const soldPlayers = (team.players ?? []).filter((p: any) => p.isSold);
  const totalSpent = soldPlayers.reduce(
    (sum: number, p: any) => sum + (Number(p.soldPrice) || 0),
    0
  );

  return (
    <Shell>
      <Link to="/teams" className="text-sm text-indigo-600 hover:text-indigo-800">
        &larr; All Teams
      </Link>

      <div className="mt-4 flex items-center gap-4">
        {team.logo ? (
          <img src={team.logo} alt={team.name} className="h-16 w-16 rounded-lg object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-indigo-100 text-2xl font-bold text-indigo-600">
            {team.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
          <p className="text-gray-500">Captain: {team.captainName}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Remaining Budget" value={`₹${Number(team.remainingBudget ?? 0).toLocaleString("en-IN")}`} />
        <Stat label="Players Bought" value={soldPlayers.length} />
        <Stat label="Total Spent" value={`₹${totalSpent.toLocaleString("en-IN")}`} />
      </div>

      {soldPlayers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Players</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {soldPlayers.map((p: any) => (
              <PlayerCard
                key={p.id}
                name={p.name}
                photo={p.photo}
                isSold={p.isSold}
                soldPrice={p.soldPrice}
                teamName={team.name}
                ratings={(p.ratings ?? []).map((r: any) => ({
                  sportName: r.sportName,
                  rating: r.rating,
                }))}
              />
            ))}
          </div>
        </div>
      )}

      {teamResults.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Match Results</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Sport</th>
                  <th className="px-4 py-3">Place</th>
                  <th className="px-4 py-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teamResults.map((r: any) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-gray-900">{r.sportName}</td>
                    <td className="px-4 py-3 text-gray-600">#{r.place}</td>
                    <td className="px-4 py-3 text-right font-medium text-indigo-600">
                      {r.points} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
