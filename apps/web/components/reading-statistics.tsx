"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Download, Share2, X, BookOpen } from "lucide-react";
import { type Library, type Book, isReadingBook } from "../../../packages/core";
import { duration } from "../../../packages/analytics";
import {
  readingStatistics,
  rankBooks,
  periodLabel,
  type Period,
} from "../../../packages/analytics/statistics";
import { readingTimeline } from "../../../packages/analytics/timeline";
import { inPeriod } from "../../../packages/analytics/statistics";
import { groupBooks } from "../../../packages/core/grouping";
import { createShareCard, type ShareCardTheme } from "../lib/share-card";
import Modal from "./modal";
const readers = { kobo: "Kobo", kobalt: "Kobalt", koreader: "KOReader" };
function Thumbnail({ book }: { book: Book }) {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <span className="stats-cover">
      {book.cover && book.cover !== failed ? (
        <img
          src={book.cover}
          alt={`${book.title} cover`}
          onError={() => setFailed(book.cover || null)}
        />
      ) : (
        <span>
          <strong>{book.title}</strong>
        </span>
      )}
    </span>
  );
}
export default function ReadingStatistics({
  library,
  onOpenBook,
  onRhythm,
}: {
  library: Library;
  onOpenBook: (id: string) => void;
  onRhythm: () => void;
}) {
  const [period, setPeriod] = useState<Period>({ year: null, month: null }),
    [source, setSource] = useState("all"),
    [by, setBy] = useState<"days" | "time">("days"),
    [limit, setLimit] = useState(10);
  const allStats = useMemo(
    () => readingStatistics(library, { year: null, month: null }, source),
    [library, source],
  );
  const stats = useMemo(
    () =>
      period.year === null
        ? allStats
        : readingStatistics(library, period, source),
    [allStats, library, period, source],
  );
  const yearOptions = [
    ...new Set([
      ...allStats.years,
      ...(period.year === null ? [] : [period.year]),
    ]),
  ].sort((a, b) => b - a);
  const ranked = useMemo(() => rankBooks(stats.rows, by), [stats.rows, by]);
  const year = period.year ?? stats.years[0] ?? new Date().getFullYear();
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        readingStatistics(library, { year, month: i + 1 }, source),
      ),
    [library, year, source],
  );
  const yearly = useMemo(
    () =>
      allStats.years.map((year) =>
        readingStatistics(library, { year, month: null }, source),
      ),
    [library, allStats.years, source],
  );
  const max = Math.max(1, ...months.map((s) => s.seconds || 0));
  const [preview, setPreview] = useState(false),
    [showBooks, setShowBooks] = useState(true),
    [cardTheme, setCardTheme] = useState<ShareCardTheme>("forest"),
    [detailed, setDetailed] = useState(false),
    [url, setUrl] = useState(""),
    [blob, setBlob] = useState<Blob | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const activity = useMemo(() => {
    if (!preview || !detailed) return undefined;
    const days = [...readingTimeline(library, source).days.keys()].filter(
      (day) => inPeriod(day + "T12:00:00", period),
    );
    if (period.year === null) {
      const allYears = [...new Set(days.map((day) => day.slice(0, 4)))].sort();
      if (allYears.length === 1)
        return {
          label: `Recorded active days in ${allYears[0]}`,
          daily: false,
          values: Array.from({ length: 12 }, (_, i) => ({
            label: new Date(Number(allYears[0]), i, 15).toLocaleDateString(
              undefined,
              { month: "short" },
            ),
            value: days.filter((day) => Number(day.slice(5, 7)) === i + 1)
              .length,
          })),
        };
      return {
        label:
          allYears.length > 12
            ? "Recorded active days: latest 12 years"
            : "Recorded active days by year",
        daily: false,
        values: allYears
          .slice(-12)
          .map((year) => ({
            label: year,
            value: days.filter((day) => day.startsWith(year)).length,
          })),
      };
    }
    if (period.month === null)
      return {
        label: `Recorded active days in ${period.year}`,
        daily: false,
        values: Array.from({ length: 12 }, (_, i) => ({
          label: new Date(period.year!, i, 15).toLocaleDateString(undefined, {
            month: "short",
          }),
          value: days.filter((day) => Number(day.slice(5, 7)) === i + 1).length,
        })),
      };
    return {
      label: `Reading activity in ${periodLabel(period)}`,
      daily: true,
      values: Array.from(
        { length: new Date(period.year, period.month, 0).getDate() },
        (_, i) => ({
          label: String(i + 1),
          value: days.some((day) => Number(day.slice(8, 10)) === i + 1) ? 1 : 0,
        }),
      ),
    };
  }, [preview, detailed, library, source, period]);
  const owned = useRef("");
  useEffect(() => {
    if (!preview) return;
    let cancelled = false;
    setBusy(true);
    setError("");
    setBlob(null);
    createShareCard(stats, ranked, {
      showBooks,
      by,
      theme: cardTheme,
      detailed,
      activity,
    })
      .then((b) => {
        if (cancelled) return;
        if (owned.current) URL.revokeObjectURL(owned.current);
        owned.current = URL.createObjectURL(b);
        setUrl(owned.current);
        setBlob(b);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Unable to create card.");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [preview, stats, ranked, showBooks, by, cardTheme, detailed, activity]);
  useEffect(
    () => () => {
      if (owned.current) URL.revokeObjectURL(owned.current);
    },
    [],
  );
  const filename = `readmory-${period.year ?? "all-time"}${period.month ? "-" + String(period.month).padStart(2, "0") : ""}.png`;
  const download = () => {
    if (!blob || !url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };
  const share = async () => {
    if (!blob) return;
    const file = new File([blob], filename, { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] }))
        await navigator.share({
          files: [file],
          title: `My reading · ${periodLabel(period)}`,
        });
      else download();
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError"))
        setError("Sharing is unavailable here. Use Download PNG instead.");
    }
  };
  const select = (p: Period) => {
    setPeriod(p);
    setLimit(10);
  };
  const ongoing = groupBooks(
    library.books.filter(
      (b) => isReadingBook(b) && (source === "all" || b.source === source),
    ),
  )
    .map((g) => g.book)
    .filter((b) => b.status === "reading")
    .sort((a, b) => (b.lastRead || "").localeCompare(a.lastRead || ""))
    .slice(0, 3);
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>
            Reading statistics<span className="green">.</span>
          </h1>
          <p className="subtitle">Your reading life, in a little more detail</p>
        </div>
        <button
          className="primary"
          disabled={!stats.books && !stats.activeDays}
          onClick={() => {
            setUrl("");
            setBlob(null);
            setBusy(true);
            setPreview(true);
          }}
        >
          <Share2 size={16} />
          Create share card
        </button>
      </div>
      <div className="statistics-filters">
        <label>
          Year
          <select
            aria-label="Statistics year"
            value={period.year ?? "all"}
            onChange={(e) =>
              select({
                year: e.target.value === "all" ? null : Number(e.target.value),
                month: null,
              })
            }
          >
            <option value="all">All time</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label>
          Month
          <select
            aria-label="Statistics month"
            disabled={period.year === null}
            value={period.month ?? "all"}
            onChange={(e) =>
              select({
                ...period,
                month: e.target.value === "all" ? null : Number(e.target.value),
              })
            }
          >
            <option value="all">Whole year</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>
                {new Date(2026, i, 15).toLocaleDateString(undefined, {
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </label>
        <label>
          Reader
          <select
            aria-label="Statistics reader"
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setLimit(10);
            }}
          >
            <option value="all">All readers</option>
            {Object.entries(readers).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <button className="text-link" onClick={onRhythm}>
          Explore daily activity
          <ArrowUpRight size={16} />
        </button>
      </div>
      <div className="section-heading">
        <h2>{periodLabel(period)}</h2>
        <span className="pill">
          {source === "all"
            ? "All readers"
            : readers[source as keyof typeof readers]}
        </span>
      </div>
      <section
        className="rhythm-summary"
        aria-label="Reading statistics summary"
      >
        {[
          [
            period.year === null
              ? "Recorded book time"
              : period.month === null
                ? "Yearly reading time"
                : "Monthly reading time",
            stats.seconds === null
              ? "Not recorded"
              : `${stats.estimated ? "≈ " : stats.minimum ? "At least " : ""}${duration(stats.seconds)}`,
            stats.estimated
              ? "Includes estimated elapsed session time"
              : stats.incompleteTime && stats.seconds !== null
                ? "Partial imported history"
                : "",
          ],
          ["Active days", stats.activeDays],
          ["Books explored", stats.books],
          ["Recorded finishes", stats.finished],
        ].map(([label, value, detail]) => (
          <div className="panel" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            {detail && <small className="time-coverage-detail">{detail}</small>}
          </div>
        ))}
      </section>
      {stats.incompleteTime && (
        <aside
          className="statistics-evidence"
          aria-label="Incomplete time history"
        >
          <p>
            Some reading activity has no timed session record. Lifetime book
            totals cannot be assigned to this
            {period.month === null ? " year" : " month"}.
          </p>
        </aside>
      )}
      <p className="statistics-evidence">
        {period.year === null
          ? "All-time totals include undated book counters. Year and month views combine dated measured and reconstructed sessions."
          : "≈ includes estimated elapsed time, which may include idle time. Untimed events and annotations add active days only."}{" "}
        {stats.minimum
          ? "Overlapping records use a conservative minimum. "
          : ""}
        Finishes without a known date appear in all-time totals.
      </p>
      <section
        className="panel statistics-months"
        aria-label="Monthly reading breakdown"
      >
        <div className="section-heading">
          <h2>{year} by month</h2>
        </div>
        <div className="month-bars">
          {months.map((m, i) => (
            <button
              className={
                period.year === year && period.month === i + 1 ? "selected" : ""
              }
              key={i}
              aria-label={`${new Date(year, i, 15).toLocaleDateString(undefined, { month: "long", year: "numeric" })}: ${m.incompleteTime ? "incomplete time history, " : ""}${m.seconds === null ? "duration unavailable" : duration(m.seconds) + " in timed sessions"}, ${m.activeDays} active days`}
              onClick={() => select({ year, month: i + 1 })}
            >
              <span className="month-bar-track">
                <span
                  style={{
                    height: m.seconds
                      ? `${Math.max(8, (m.seconds / max) * 100)}%`
                      : m.activeDays
                        ? "12%"
                        : "0%",
                  }}
                  className={
                    m.seconds === null || m.estimated ? "date-only" : ""
                  }
                />
              </span>
              <strong>
                {new Date(year, i, 15).toLocaleDateString(undefined, {
                  month: "short",
                })}
              </strong>
              <small>
                {m.seconds === null
                  ? m.activeDays
                    ? "Read"
                    : "—"
                  : `${m.estimated ? "≈ " : ""}${duration(m.seconds)}`}
              </small>
            </button>
          ))}
        </div>
        <p className="muted">
          Choose a month to explore it. Read means activity is recorded but its
          duration is unavailable. ≈ includes estimated elapsed session time.
        </p>
      </section>
      {yearly.length > 0 && (
        <details className="panel statistics-years">
          <summary>Compare years</summary>
          <div className="year-comparison">
            {yearly.map((y) => (
              <button
                key={y.period.year}
                onClick={() => select({ year: y.period.year, month: null })}
              >
                <strong>{y.period.year}</strong>
                <span>
                  {y.seconds === null
                    ? "Time not recorded"
                    : `${y.estimated ? "≈ " : y.minimum ? "At least " : ""}${duration(y.seconds)}`}
                </span>
                <span>
                  {y.activeDays} active days · {y.books} books
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        </details>
      )}
      <section className="statistics-ranking" aria-label="Most read books">
        <div className="section-heading">
          <h2>The books you return to</h2>
          <label>
            Rank by
            <select
              aria-label="Rank books by"
              value={by}
              onChange={(e) => setBy(e.target.value as "days" | "time")}
            >
              <option value="days">Active reading days</option>
              <option value="time">Reading time</option>
            </select>
          </label>
        </div>
        <p className="muted">
          Active days include reader events and dated annotations. Multiple
          events on one date count as one day.
        </p>
        {ranked.length ? (
          <div className="statistics-book-list">
            {ranked.slice(0, limit).map((row, i) => (
              <button
                className="statistics-book"
                key={row.book.id}
                onClick={() => onOpenBook(row.book.id)}
              >
                <span className="book-rank">{i + 1}</span>
                <Thumbnail book={row.book} />
                <span className="statistics-book-title">
                  <strong>{row.book.title}</strong>
                  <span>{row.book.author}</span>
                </span>
                <span className="statistics-book-values">
                  <strong>
                    {by === "days"
                      ? row.days
                        ? `${row.days} ${row.days === 1 ? "day" : "days"}`
                        : "Dates unavailable"
                      : row.seconds === null
                        ? "Time unavailable"
                        : `${row.estimated ? "≈ " : row.minimum ? "≥ " : ""}${duration(row.seconds)}`}
                  </strong>
                  <span>
                    {by === "days"
                      ? row.seconds === null
                        ? "Time unavailable"
                        : `${row.estimated ? "≈ " : ""}${duration(row.seconds)} ${period.year === null ? "lifetime" : "in dated sessions"}`
                      : row.days
                        ? `${row.days} active days`
                        : "Dates unavailable"}
                  </span>
                  {period.year !== null && row.unallocatedSeconds > 0 && (
                    <span>
                      Lifetime: {duration(row.lifetimeSeconds!)} · date split
                      unavailable
                    </span>
                  )}
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="empty-icon">
              <BookOpen size={24} />
            </div>
            <h3>No recorded reading for this period</h3>
            <p>Try another year or import more reading history.</p>
          </div>
        )}
        {ranked.length > limit && (
          <button
            className="secondary load-more"
            onClick={() => setLimit((n) => n + 10)}
          >
            Show more books
          </button>
        )}
      </section>
      {ongoing.length > 0 && (
        <section className="panel statistics-continue">
          <h2>Continue reading</h2>
          <p className="muted">Your current books, across all dates</p>
          <div>
            {ongoing.map((b) => (
              <button
                key={b.id}
                className="text-link"
                onClick={() => onOpenBook(b.id)}
              >
                <BookOpen size={16} />
                {b.title}
                <span>
                  {b.progress === null
                    ? "In progress"
                    : `${Math.round(b.progress)}%`}
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        </section>
      )}
      {preview && (
        <Modal
          label="share-card-title"
          onClose={() => setPreview(false)}
          className="share-dialog"
        >
          <div className="share-dialog-header">
            <div>
              <h2 id="share-card-title">Your reading, ready to share</h2>
              <p className="muted">A little portrait of your reading life.</p>
            </div>
            <button
              className="icon-button"
              aria-label="Close share card"
              onClick={() => setPreview(false)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="share-editor">
            <div
              className="share-stage"
              data-detail={detailed ? "detailed" : "summary"}
              aria-busy={busy}
            >
              {busy ? (
                <div className="share-card-skeleton" role="status">
                  <span className="share-skeleton-brand" />
                  <span className="share-skeleton-title" />
                  <span className="share-skeleton-time" />
                  <div>
                    <span />
                    <span />
                    <span />
                  </div>
                  <p>Creating your card…</p>
                </div>
              ) : url ? (
                <img
                  className="share-card-preview"
                  src={url}
                  alt={`Share card for ${periodLabel(period)}: ${stats.estimated ? "estimated " : stats.minimum ? "at least " : ""}${stats.seconds === null ? "time unavailable" : duration(stats.seconds)}, ${stats.activeDays} active days, ${stats.books} books${showBooks ? ", with book covers and titles" : ", without book details"}${detailed ? ", with detailed activity and session statistics" : ""}`}
                />
              ) : (
                <p className="muted">Your preview will appear here.</p>
              )}
            </div>
            <div className="share-options">
              <div className="share-configuration">
                <div className="share-context">
                  <span>Reading recap</span>
                  <h3>{periodLabel(period)}</h3>
                  <p>
                    {source === "all"
                      ? "All readers"
                      : readers[source as keyof typeof readers] || source}{" "}
                    ·{" "}
                    {by === "days"
                      ? "Ranked by active days"
                      : "Ranked by reading time"}
                  </p>
                </div>
                <fieldset className="share-style">
                  <legend>Card style</legend>
                  <div className="share-style-options">
                    {(["forest", "paper"] as const).map((style) => (
                      <button
                        key={style}
                        className="share-style-option"
                        type="button"
                        aria-pressed={cardTheme === style}
                        onClick={() => setCardTheme(style)}
                      >
                        <span
                          className={`share-swatch share-swatch-${style}`}
                          aria-hidden="true"
                        >
                          Aa
                        </span>
                        {style === "forest" ? "Forest" : "Paper"}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="share-detail">
                  <legend>Detail level</legend>
                  <div className="share-detail-options">
                    <button
                      type="button"
                      aria-pressed={!detailed}
                      onClick={() => setDetailed(false)}
                    >
                      Summary
                    </button>
                    <button
                      type="button"
                      aria-pressed={detailed}
                      onClick={() => setDetailed(true)}
                    >
                      Detailed
                    </button>
                  </div>
                  <p>
                    {detailed
                      ? "Activity chart, session statistics, time coverage and up to six books."
                      : "Key statistics and your three most-read books."}
                  </p>
                </fieldset>
                <label className="share-privacy-option">
                  <input
                    type="checkbox"
                    checked={showBooks}
                    onChange={(e) => setShowBooks(e.target.checked)}
                  />
                  <span>
                    <strong>Include book covers and titles</strong>
                    <small>
                      {detailed
                        ? "Show up to six ranked books."
                        : "Show your three most-read books."}
                    </small>
                  </span>
                </label>
                <p className="share-privacy-copy muted">
                  Generated on your device. Only the statistics and books shown
                  here are included; your notes and highlights stay private.
                </p>
              </div>
              <div className="share-export">
                <p className="share-format">
                  PNG image{" "}
                  <span>{detailed ? "1080 × 1920" : "1080 × 1350"}</span>
                </p>
                {error && (
                  <p role="alert" className="share-error">
                    {error}
                  </p>
                )}
                <div className="share-actions">
                  <button
                    className="primary"
                    disabled={busy || !blob}
                    onClick={download}
                  >
                    <Download size={18} />
                    Download PNG
                  </button>
                  <button
                    className="secondary"
                    disabled={busy || !blob}
                    onClick={share}
                  >
                    <Share2 size={18} />
                    Share image
                  </button>
                </div>
                <p className="share-export-note muted">
                  Share image opens your device’s sharing options when
                  supported, or downloads the PNG. Nothing is posted
                  automatically.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
