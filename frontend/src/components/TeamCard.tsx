import { Link } from "react-router-dom";

interface TeamCardProps {
  id: string;
  name: string;
  captainName: string;
  logo?: string;
  remainingBudget?: number | null;
  playerCount?: number | null;
}

export function TeamCard({
  id,
  name,
  captainName,
  logo,
  remainingBudget,
  playerCount,
}: TeamCardProps) {
  return (
    <Link
      to={`/teams/${id}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {logo ? (
          <img src={logo} alt={name} className="h-12 w-12 rounded-lg object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-lg font-bold text-indigo-600">
            {name.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">Captain: {captainName}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        {remainingBudget != null && (
          <div>
            <span className="text-gray-500">Budget: </span>
            <span className="font-medium text-gray-900">
              ₹{Number(remainingBudget).toLocaleString("en-IN")}
            </span>
          </div>
        )}
        {playerCount != null && (
          <div>
            <span className="text-gray-500">Players: </span>
            <span className="font-medium text-gray-900">{playerCount}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
