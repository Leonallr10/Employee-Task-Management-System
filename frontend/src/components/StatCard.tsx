interface StatCardProps {
  label: string;
  value: number;
  accent?: string;
}

export default function StatCard({
  label,
  value,
  accent = "bg-indigo-50 text-indigo-700",
}: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={`mt-3 inline-flex min-w-12 items-center justify-center rounded-xl px-3 py-1 text-3xl font-semibold ${accent}`}
      >
        {value}
      </p>
    </div>
  );
}
