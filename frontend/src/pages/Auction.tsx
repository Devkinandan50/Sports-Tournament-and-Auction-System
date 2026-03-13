import { useState } from "react";
import { useQuery } from "@apollo/client";
import { useSeason } from "../lib/SeasonContext";
import { GET_PLAYERS, GET_SPORTS, GET_AUCTION_CONFIG } from "../graphql/queries";
import { PlayerCard } from "../components/PlayerCard";
import { AuctionFilters, type AuctionFilterValues } from "../components/AuctionFilters";

export default function Auction() {
  const { selectedSeason } = useSeason();
  const seasonId = selectedSeason?.id;

  const [filters, setFilters] = useState<AuctionFilterValues>({
    search: "",
    sportId: undefined,
    minRating: undefined,
    unsoldOnly: undefined,
    sortBy: undefined,
  });

  const { data: configData } = useQuery(GET_AUCTION_CONFIG, {
    variables: { seasonId },
    skip: !seasonId,
    pollInterval: 30_000,
  });

  const { data: sportsData } = useQuery(GET_SPORTS, {
    variables: { seasonId },
    skip: !seasonId,
  });

  const { data: playersData, loading } = useQuery(GET_PLAYERS, {
    variables: {
      seasonId,
      search: filters.search || undefined,
      sportId: filters.sportId,
      minRating: filters.minRating,
      unsoldOnly: filters.unsoldOnly,
      sortBy: filters.sortBy,
    },
    skip: !seasonId,
    pollInterval: 30_000,
  });

  const config = configData?.auctionConfig;
  const sports = sportsData?.sports ?? [];
  const players = playersData?.players ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Auction</h1>

      {config?.auctionActive ? (
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm font-medium text-amber-800">
          Auction is LIVE — updates every 30 seconds
        </div>
      ) : (
        <p className="mt-4 text-gray-500">
          {config ? "Auction is not active right now." : "No auction configured for this season."}
        </p>
      )}

      <div className="mt-6">
        <AuctionFilters sports={sports} values={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <p className="mt-8 text-gray-500">Loading players...</p>
      ) : players.length === 0 ? (
        <p className="mt-8 text-gray-500">No players match your filters.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p: any) => (
            <PlayerCard
              key={p.id}
              name={p.name}
              photo={p.photo}
              isSold={p.isSold}
              soldPrice={p.soldPrice}
              teamName={p.team?.name}
              ratings={(p.ratings ?? []).map((r: any) => ({
                sportName: r.sportName,
                rating: r.rating,
              }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
