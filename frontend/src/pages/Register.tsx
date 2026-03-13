import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useSeason } from "../lib/SeasonContext";
import { GET_SPORTS, GET_AUCTION_CONFIG } from "../graphql/queries";
import { REGISTER_PLAYER } from "../graphql/mutations";

export default function Register() {
  const { selectedSeason } = useSeason();
  const seasonId = selectedSeason?.id;

  const { data: configData, loading: configLoading } = useQuery(GET_AUCTION_CONFIG, {
    variables: { seasonId },
    skip: !seasonId,
  });
  const { data: sportsData } = useQuery(GET_SPORTS, {
    variables: { seasonId },
    skip: !seasonId,
  });

  const [registerPlayer, { loading: submitting }] = useMutation(REGISTER_PLAYER);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const config = configData?.auctionConfig;
  const sports = sportsData?.sports ?? [];

  if (configLoading) {
    return <Shell>Loading...</Shell>;
  }

  if (!config?.registrationOpen) {
    return (
      <Shell>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Player Registration
        </h1>
        <p className="mt-4 text-gray-600">
          Registration is currently closed. Check back when the admin opens it.
        </p>
      </Shell>
    );
  }

  if (success) {
    return (
      <Shell>
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <h2 className="text-xl font-semibold text-green-800">Registration Successful!</h2>
          <p className="mt-2 text-green-700">You have been registered for the auction.</p>
          <button
            onClick={() => {
              setSuccess(false);
              setName("");
              setEmail("");
              setRatings({});
            }}
            className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Register Another Player
          </button>
        </div>
      </Shell>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const ratingsList = Object.entries(ratings)
      .filter(([, v]) => v > 0)
      .map(([sportId, rating]) => ({ sportId, rating }));

    if (ratingsList.length === 0) {
      setError("Please rate yourself in at least one sport.");
      return;
    }

    try {
      const { data } = await registerPlayer({
        variables: { seasonId, name, email, ratings: ratingsList },
      });
      if (data.registerPlayer.ok) {
        setSuccess(true);
      } else {
        setError(data.registerPlayer.error || "Registration failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Shell>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Player Registration
      </h1>
      <p className="mt-2 text-gray-600">Fill in your details and rate yourself in each sport.</p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Company Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {sports.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rate Yourself (1-10)
            </label>
            <div className="mt-3 space-y-4">
              {sports.map((sport: any) => (
                <div key={sport.id} className="flex items-center gap-4">
                  <span className="w-32 text-sm text-gray-700">{sport.name}</span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={ratings[sport.id] ?? 0}
                    onChange={(e) =>
                      setRatings((prev) => ({
                        ...prev,
                        [sport.id]: Number(e.target.value),
                      }))
                    }
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="w-8 text-center text-sm font-semibold text-indigo-600">
                    {ratings[sport.id] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Registering..." : "Register"}
        </button>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>;
}
