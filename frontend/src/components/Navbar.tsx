import { Link, useLocation } from "react-router-dom";
import { SeasonSelector } from "./SeasonSelector";

const links = [
  { to: "/", label: "Home" },
  { to: "/auction", label: "Auction" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/teams", label: "Teams" },
  { to: "/register", label: "Register" },
];

export function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold tracking-tight text-indigo-600">
          Tournament
        </Link>

        <div className="flex items-center gap-1">
          {links.map((l) => {
            const active =
              l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <SeasonSelector />
      </div>
    </nav>
  );
}
