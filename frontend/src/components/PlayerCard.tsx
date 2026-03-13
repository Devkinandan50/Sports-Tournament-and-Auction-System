interface Rating {
  sportName: string;
  rating: number;
}

interface PlayerCardProps {
  name: string;
  photo?: string;
  isSold: boolean;
  soldPrice?: number | null;
  teamName?: string | null;
  ratings: Rating[];
}

export function PlayerCard({
  name,
  photo,
  isSold,
  soldPrice,
  teamName,
  ratings,
}: PlayerCardProps) {
  return (
    <div
      className={`relative rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
        isSold ? "border-green-200 bg-green-50/30" : "border-gray-200"
      }`}
    >
      {isSold && (
        <span className="absolute right-3 top-3 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          Sold
        </span>
      )}

      <div className="flex gap-3">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
            {name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          {isSold && teamName && (
            <p className="text-sm text-gray-600">
              {teamName} — ₹{soldPrice?.toLocaleString("en-IN")}
            </p>
          )}
        </div>
      </div>

      {ratings.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {ratings.map((r) => (
            <span
              key={r.sportName}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
            >
              {r.sportName}
              <span className="font-semibold text-indigo-600">{r.rating}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
