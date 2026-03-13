import { useQuery } from "@apollo/client";
import { useSeason } from "../lib/SeasonContext";
import { GET_NOTICES, GET_AUCTION_CONFIG, GET_TEAMS } from "../graphql/queries";
import { NoticeCard } from "../components/NoticeCard";
import { Link } from "react-router-dom";

export default function Home() {
  const { selectedSeason, loading: seasonLoading } = useSeason();
  const seasonId = selectedSeason?.id;

  const { data: noticesData } = useQuery(GET_NOTICES, {
    variables: { seasonId },
    skip: !seasonId,
  });
  const { data: configData } = useQuery(GET_AUCTION_CONFIG, {
    variables: { seasonId },
    skip: !seasonId,
  });
  const { data: teamsData } = useQuery(GET_TEAMS, {
    variables: { seasonId },
    skip: !seasonId,
  });

  if (seasonLoading) {
    return <PageShell>Loading...</PageShell>;
  }

  if (!selectedSeason) {
    return <PageShell>No season configured yet. Ask admin to create one.</PageShell>;
  }

  const notices = noticesData?.notices ?? [];
  const config = configData?.auctionConfig;
  const teams = teamsData?.teams ?? [];

  return (
    <PageShell>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {selectedSeason.name}
      </h1>

      {config && (
        <div className="mt-6 flex flex-wrap gap-3">
          {config.registrationOpen && (
            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Register as Player
            </Link>
          )}
          {config.auctionActive && (
            <Link
              to="/auction"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600"
            >
              Auction is LIVE
            </Link>
          )}
          <Link
            to="/leaderboard"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            View Leaderboard
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <StatCard label="Teams" value={teams.length} to="/teams" />
        <StatCard
          label="Auction Budget"
          value={config ? `₹${Number(config.initialBudget).toLocaleString("en-IN")}` : "—"}
        />
        <StatCard
          label="Min Bid"
          value={config ? `₹${Number(config.minBidPrice).toLocaleString("en-IN")}` : "—"}
        />
      </div>

      {notices.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">Notices</h2>
          <div className="mt-4 space-y-4">
            {notices.map((n: any) => (
              <NoticeCard
                key={n.id}
                title={n.title}
                content={n.content}
                createdAt={n.createdAt}
              />
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>
  );
}

function StatCard({
  label,
  value,
  to,
}: {
  label: string;
  value: string | number;
  to?: string;
}) {
  const inner = (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}
