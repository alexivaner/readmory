import { appPath } from "../lib/paths";
export const PRODUCT_NAME = "Readmory";
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 9c6-3 12-2 19 3 7-5 13-6 19-3v28c-6-2-12-1-19 4-7-5-13-6-19-4V9Z"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <path
        d="m19.8 9 4.2 2.8L28.2 9v18.5L24 24l-4.2 3.5V9Z"
        fill="currentColor"
      />
    </svg>
  );
}
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`readmory-brand ${compact ? "compact" : ""}`}>
      <BrandMark />
      <span>{PRODUCT_NAME}</span>
    </span>
  );
}
export function BrandArtwork({ className = "" }: { className?: string }) {
  return (
    <div className={`readmory-artwork ${className}`}>
      <figure>
        <img
          src={appPath("/brand/library-example.png")}
          alt="Readmory’s reading shelf with two sample books and their imported progress"
          width="429"
          height="419"
        />
        <figcaption>The reading shelf, using synthetic example data.</figcaption>
      </figure>
    </div>
  );
}
