import { useQuery } from "@apollo/client";
import { useSeason } from "../lib/SeasonContext";
import { GET_LEADERBOARD } from "../graphql/queries";
import { LeaderboardTable } from "../components/LeaderboardTable";

export default function Leaderboard() {
  const { selectedSeason } = useSeason();
  const seasonId = selectedSeason?.id;

  const { data, loading } = useQuery(GET_LEADERBOARD, {
    variables: { seasonId },
    skip: !seasonId,
    pollInterval: 30_000,
  });

  const entries = data?.leaderboard ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Leaderboard</h1>
      <p className="mt-2 text-sm text-gray-500">
        Click a row to see sport-wise point breakdown. Updates every 30 seconds.
      </p>

      <div className="mt-6">
        {loading ? (
          <p className="text-gray-500">Loading leaderboard...</p>
        ) : (
          <LeaderboardTable entries={entries} />
        )}
      </div>
    </div>
  );
}
