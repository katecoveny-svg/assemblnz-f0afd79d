export function DoMark({
  character = "symbol",
}: {
  character?: "symbol" | "franklin";
}) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      {character === "symbol" ? (
        <>
          <path
            d="M16 12H29C44 12 52 20 52 32S44 52 29 52H16Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          <circle
            className="do-identity-dot"
            cx="30"
            cy="32"
            r="6"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M17 19Q27 7 39 19L47 30H57Q61 35 56 39H36L30 53H15Q10 38 17 19Z"
            fill="currentColor"
          />
          <path d="M20 19Q9 17 9 35Q10 51 20 44L26 24" fill="#513044" />
          <circle cx="37" cy="26" r="2.5" fill="#20101f" />
          <circle cx="57" cy="33" r="3" fill="#20101f" />
        </>
      )}
    </svg>
  );
}
