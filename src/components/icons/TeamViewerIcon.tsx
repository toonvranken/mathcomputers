/**
 * Vereenvoudigd TeamViewer-appicoon (blauw vlak + wit merklogo).
 * Gebruikt bij Online Support zodat bezoekers meteen TeamViewer herkennen.
 */
export function TeamViewerIcon({
  className = "h-5 w-5",
  title = "TeamViewer",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <rect width="32" height="32" rx="7" fill="#0E8EE9" />
      {/* Stylized TeamViewer mark: two linked nodes */}
      <path
        fill="#fff"
        d="M9.2 16c0-2.4 1.9-4.4 4.3-4.4h1.1v2.2h-1.1c-1.2 0-2.1 1-2.1 2.2s.9 2.2 2.1 2.2h1.1V20h-1.1C11.1 20.4 9.2 18.4 9.2 16zm9.3-4.4h-1.1v2.2h1.1c1.2 0 2.1 1 2.1 2.2s-.9 2.2-2.1 2.2h-1.1V20h1.1c2.4 0 4.3-2 4.3-4.4s-1.9-4.4-4.3-4.4z"
      />
      <rect x="12.2" y="14.7" width="7.6" height="2.6" rx="1.3" fill="#fff" />
    </svg>
  );
}
