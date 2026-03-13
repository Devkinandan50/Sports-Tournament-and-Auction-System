interface NoticeCardProps {
  title: string;
  content: string;
  createdAt: string;
}

export function NoticeCard({ title, content, createdAt }: NoticeCardProps) {
  const date = new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="ml-4 shrink-0 text-xs text-gray-400">{date}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{content}</p>
    </div>
  );
}
