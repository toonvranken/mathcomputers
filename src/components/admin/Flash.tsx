export function Flash({
  ok,
  error,
}: {
  ok?: string | string[];
  error?: string | string[];
}) {
  const okMsg = Array.isArray(ok) ? ok[0] : ok;
  const errMsg = Array.isArray(error) ? error[0] : error;

  if (!okMsg && !errMsg) return null;

  if (errMsg) {
    return (
      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {decodeURIComponent(errMsg)}
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      Opgeslagen.
    </div>
  );
}
