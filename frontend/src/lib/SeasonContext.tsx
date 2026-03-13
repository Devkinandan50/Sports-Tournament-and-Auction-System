import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useQuery, gql } from "@apollo/client";

const GET_SEASONS = gql`
  query GetSeasons {
    currentSeason {
      id
      year
      name
    }
    seasons {
      id
      year
      name
      isCurrent
    }
  }
`;

interface Season {
  id: string;
  year: number;
  name: string;
  isCurrent?: boolean;
}

interface SeasonContextValue {
  seasons: Season[];
  currentSeason: Season | null;
  selectedSeason: Season | null;
  setSelectedSeasonId: (id: string) => void;
  loading: boolean;
}

const SeasonContext = createContext<SeasonContextValue>({
  seasons: [],
  currentSeason: null,
  selectedSeason: null,
  setSelectedSeasonId: () => {},
  loading: true,
});

export function SeasonProvider({ children }: { children: ReactNode }) {
  const { data, loading } = useQuery(GET_SEASONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const seasons: Season[] = data?.seasons ?? [];
  const currentSeason: Season | null = data?.currentSeason ?? null;

  useEffect(() => {
    if (!selectedId && currentSeason) {
      setSelectedId(currentSeason.id);
    }
  }, [currentSeason, selectedId]);

  const selectedSeason = seasons.find((s) => s.id === selectedId) ?? currentSeason;

  return (
    <SeasonContext.Provider
      value={{
        seasons,
        currentSeason,
        selectedSeason,
        setSelectedSeasonId: setSelectedId,
        loading,
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  return useContext(SeasonContext);
}
