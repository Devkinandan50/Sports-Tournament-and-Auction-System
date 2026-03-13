import { useQuery } from "@apollo/client";
import { useSeason } from "../lib/SeasonContext";
import { GET_TEAMS } from "../graphql/queries";
import { TeamCard } from "../components/TeamCard";

export default function Teams() {
  const { selectedSeason } = useSeason();
  const seasonId = selectedSeason?.id;

  const { data, loading } = useQuery(GET_TEAMS, {
    variables: { seasonId },
    skip: !seasonId,
    pollInterval: 30_000,
  });

  const teams = data?.teams ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Teams</h1>

      {loading ? (
        <p className="mt-6 text-gray-500">Loading teams...</p>
      ) : teams.length === 0 ? (
        <p className="mt-6 text-gray-500">No teams created for this season yet.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {teams.map((t: any) => (
            <TeamCard
              key={t.id}
              id={t.id}
              name={t.name}
              captainName={t.captainName}
              logo={t.logo}
              remainingBudget={t.remainingBudget}
              playerCount={t.playerCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
