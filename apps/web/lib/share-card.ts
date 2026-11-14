import { duration } from "../../../packages/analytics";
import {
  type ReadingStatistics,
  type BookStatistic,
  periodLabel,
} from "../../../packages/analytics/statistics";
function lines(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  max: number,
) {
  const rows: string[] = [];
  let remaining = text.trim();
  while (remaining && rows.length < max) {
    if (ctx.measureText(remaining).width <= width) {
      rows.push(remaining);
      remaining = "";
      break;
    }
    const chars = Array.from(remaining);
    let count = 1;
    while (
      count < chars.length &&
      ctx.measureText(chars.slice(0, count + 1).join("")).width <= width
    )
      count++;
    let end = count;
    const lastSpace = chars.slice(0, count).lastIndexOf(" ");
    if (lastSpace > 0) end = lastSpace;
    rows.push(chars.slice(0, end).join("").trimEnd());
    remaining = chars.slice(end).join("").trimStart();
  }
  if (remaining && rows.length) {
    let last = rows.at(-1)!;
    while (last && ctx.measureText(last + "…").width > width)
      last = Array.from(last).slice(0, -1).join("");
    rows[rows.length - 1] = last + "…";
  }
  return rows;
}
export type ShareCardTheme = "forest" | "paper";
export type ShareActivity = {
  label: string;
  daily: boolean;
  values: { label: string; value: number }[];
};
const palettes = {
  forest: {
    bg: "#1B2B22",
    ink: "#F7F3E9",
    accent: "#A9CC8A",
    muted: "#BDC7B8",
    line: "#435348",
    cover: "#2F4A3C",
  },
  paper: {
    bg: "#F7F3E9",
    ink: "#1B2B22",
    accent: "#2F4A3C",
    muted: "#586557",
    line: "#D2D8CB",
    cover: "#E3E9DB",
  },
};
function fitted(
  c: CanvasRenderingContext2D,
  text: string,
  size: number,
  width: number,
  weight = 500,
) {
  do {
    c.font = `${weight} ${size--}px Arial, sans-serif`;
  } while (c.measureText(text).width > width && size > 24);
}
function rule(c: CanvasRenderingContext2D, color: string, y: number) {
  c.fillStyle = color;
  c.fillRect(72, y, 936, 1);
}
function timeLabel(
  row: Pick<BookStatistic, "seconds" | "estimated" | "minimum">,
) {
  return row.seconds === null
    ? "Time unavailable"
    : `${row.estimated ? "≈ " : row.minimum ? "≥ " : ""}${duration(row.seconds)}`;
}
/** Browser-only PNG; no network, HTML capture, notes or annotations. */
export async function createShareCard(
  stats: ReadingStatistics,
  ranked: BookStatistic[],
  options: {
    showBooks: boolean;
    by: "days" | "time";
    theme?: ShareCardTheme;
    detailed?: boolean;
    activity?: ShareActivity;
  },
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = options.detailed ? 1920 : 1350;
  const c = canvas.getContext("2d");
  if (!c) throw Error("Image generation is unavailable in this browser.");
  const p = palettes[options.theme || "forest"];
  c.fillStyle = p.bg;
  c.fillRect(0, 0, 1080, canvas.height);

  // Keep the established serif wordmark; use crisp sans-serif for the recap.
  c.fillStyle = p.ink;
  c.font = "bold 38px Georgia";
  c.fillText("Readmory", 72, 94);
  c.textAlign = "right";
  c.fillStyle = p.muted;
  c.font = "22px Arial, sans-serif";
  c.fillText("Your reading, remembered.", 1008, 91);
  c.textAlign = "left";
  rule(c, p.line, 127);
  c.fillStyle = p.ink;
  const period = periodLabel(stats.period);
  c.fillStyle = p.ink;
  fitted(c, period, 62, 936, 500);
  c.fillText(period, 72, 215);
  c.fillStyle = p.muted;
  c.font = "25px Arial, sans-serif";
  c.fillText(
    stats.source === "all"
      ? "Across all readers"
      : { kobo: "Kobo", kobalt: "Kobalt", koreader: "KOReader" }[
          stats.source
        ] || stats.source,
    72,
    257,
  );

  c.fillStyle = p.muted;
  c.font = "26px Arial, sans-serif";
  c.fillText(
    stats.period.year === null
      ? "Recorded reading time"
      : "Reading time in this period",
    72,
    335,
  );
  if (stats.seconds !== null && (stats.minimum || stats.estimated)) {
    c.textAlign = "right";
    c.fillStyle = p.accent;
    c.font = "25px Arial, sans-serif";
    c.fillText(stats.estimated ? "Estimated" : "At least", 1008, 335);
    c.textAlign = "left";
  }
  const time =
    stats.seconds === null
      ? "Not recorded"
      : `${stats.estimated ? "≈ " : stats.minimum ? "≥ " : ""}${duration(stats.seconds)}`;
  c.fillStyle = p.accent;
  fitted(c, time, 132, 936, 500);
  c.fillText(time, 66, 474);
  c.fillStyle = p.muted;
  c.font = "23px Arial, sans-serif";
  c.fillText(
    stats.estimated
      ? "Includes elapsed estimates, which may include idle time."
      : stats.seconds === null
        ? "Your reader recorded activity without a duration."
        : stats.minimum || stats.incompleteTime
          ? "A partial view of your imported reading history."
          : "From the reading history recorded by your readers.",
    72,
    518,
  );

  const metrics = [
    [stats.activeDays, "active days"],
    [stats.books, "books explored"],
    [stats.finished, "books finished"],
  ] as const;
  metrics.forEach(([value, label], i) => {
    const x = 72 + i * 328;
    c.fillStyle = p.ink;
    fitted(c, value.toLocaleString(), 64, 280);
    c.fillText(value.toLocaleString(), x, 638);
    c.fillStyle = p.muted;
    c.font = "25px Arial, sans-serif";
    c.fillText(label, x, 681);
  });
  rule(c, p.line, 729);

  if (options.detailed) {
    c.fillStyle = p.ink;
    c.font = "30px Arial, sans-serif";
    c.fillText(options.activity?.label || "Reading activity", 72, 795);
    const values = options.activity?.values || [];
    if (options.activity?.daily) {
      values.forEach((v, i) => {
        const x = 72 + (i % 16) * 58,
          y = 836 + Math.floor(i / 16) * 70;
        c.fillStyle = v.value ? p.accent : p.cover;
        c.fillRect(x, y, 44, 48);
        c.fillStyle = v.value ? p.bg : p.muted;
        c.font = "20px Arial, sans-serif";
        c.textAlign = "center";
        c.fillText(v.label, x + 22, y + 32);
        c.textAlign = "left";
      });
    } else if (values.length) {
      const step = 936 / Math.max(6, values.length),
        max = Math.max(1, ...values.map((v) => v.value));
      values.forEach((v, i) => {
        const x = 72 + i * step,
          h = (v.value / max) * 150;
        c.fillStyle = p.accent;
        if (v.value) c.fillRect(x, 1020 - h, Math.min(44, step - 18), h);
        c.fillStyle = p.muted;
        c.font = "20px Arial, sans-serif";
        c.fillText(v.label, x, 1053);
        if (v.value) c.fillText(String(v.value), x, 1008 - h);
      });
    } else {
      c.fillStyle = p.muted;
      c.font = "26px Arial, sans-serif";
      c.fillText("No dated reading activity in this period.", 72, 900);
    }
    c.fillStyle = p.muted;
    c.font = "20px Arial, sans-serif";
    c.fillText(
      options.activity?.daily
        ? "Highlighted days have recorded activity. Other days have no record."
        : "Recorded activity only. Empty months or years may have missing data.",
      72,
      1098,
    );
    const extra = [
      [String(stats.sessions), "dated sessions"],
      [
        stats.measuredSeconds === null
          ? "Unavailable"
          : duration(stats.measuredSeconds),
        "measured session time",
      ],
      [String(stats.undatedBooks), "books without time"],
    ];
    extra.forEach(([value, label], i) => {
      const x = 72 + i * 328;
      c.fillStyle = p.ink;
      fitted(c, value, 46, 280);
      c.fillText(value, x, 1180);
      c.fillStyle = p.muted;
      c.font = "23px Arial, sans-serif";
      c.fillText(label, x, 1220);
    });
    rule(c, p.line, 1260);
    if (options.showBooks && ranked.length) {
      c.fillStyle = p.ink;
      c.font = "30px Arial, sans-serif";
      c.fillText("Most-read books", 72, 1320);
      c.textAlign = "right";
      c.fillStyle = p.muted;
      c.font = "22px Arial, sans-serif";
      c.fillText(
        options.by === "days"
          ? "Ranked by active days"
          : "Ranked by reading time",
        1008,
        1318,
      );
      c.textAlign = "left";
      const top = ranked.slice(0, 6);
      for (let i = 0; i < top.length; i++) {
        const row = top[i],
          x = 72 + (i % 2) * 484,
          y = 1360 + Math.floor(i / 2) * 146;
        let image: HTMLImageElement | null = null;
        if (row.book.cover?.startsWith("data:image/"))
          try {
            image = new Image();
            image.src = row.book.cover;
            await image.decode();
          } catch {
            image = null;
          }
        c.fillStyle = p.cover;
        c.fillRect(x, y, 70, 100);
        if (image?.naturalWidth) {
          const r = Math.min(
            70 / image.naturalWidth,
            100 / image.naturalHeight,
          );
          c.drawImage(
            image,
            x,
            y + (100 - image.naturalHeight * r) / 2,
            image.naturalWidth * r,
            image.naturalHeight * r,
          );
        } else {
          c.fillStyle = p.muted;
          c.font = "36px Georgia";
          c.fillText(Array.from(row.book.title)[0] || "R", x + 20, y + 62);
        }
        c.fillStyle = p.ink;
        c.font = "24px Arial, sans-serif";
        lines(c, row.book.title, 334, 2).forEach((t, j) =>
          c.fillText(t, x + 90, y + 28 + j * 30),
        );
        c.fillStyle = p.accent;
        fitted(
          c,
          `${row.days} ${row.days === 1 ? "day" : "days"} · ${timeLabel(row)}`,
          22,
          334,
        );
        c.fillText(
          `${row.days} ${row.days === 1 ? "day" : "days"} · ${timeLabel(row)}`,
          x + 90,
          y + 94,
        );
      }
    } else {
      c.fillStyle = p.ink;
      c.font = "36px Arial, sans-serif";
      c.fillText("Book details kept private", 72, 1350);
      c.fillStyle = p.muted;
      c.font = "26px Arial, sans-serif";
      lines(
        c,
        "Your recap includes statistics and reading activity, without book covers, titles, notes or highlights.",
        850,
        3,
      ).forEach((t, j) => c.fillText(t, 72, 1408 + j * 38));
    }
    c.fillStyle = p.muted;
    c.font = "22px Arial, sans-serif";
    const coverage =
      stats.unallocatedSeconds > 0
        ? `${duration(stats.unallocatedSeconds)} of lifetime book time has no dated session allocation.`
        : "Some readers provide book totals without complete session records.";
    lines(c, coverage, 936, 2).forEach((t, j) =>
      c.fillText(t, 72, 1820 + j * 30),
    );
  } else if (options.showBooks && ranked.length) {
    c.fillStyle = p.ink;
    c.font = "32px Arial, sans-serif";
    c.fillText("Most-read books", 72, 795);
    c.textAlign = "right";
    c.fillStyle = p.muted;
    c.font = "22px Arial, sans-serif";
    c.fillText(
      options.by === "days" ? "By active days" : "By reading time",
      1008,
      793,
    );
    c.textAlign = "left";
    const top = ranked.slice(0, 3);
    const images = await Promise.all(
      top.map(async (row) => {
        if (!row.book.cover?.startsWith("data:image/")) return null;
        try {
          const image = new Image();
          image.src = row.book.cover;
          await image.decode();
          return image;
        } catch {
          return null;
        }
      }),
    );
    top.forEach((row, i) => {
      const x = 72 + i * 328,
        y = 835,
        w = 210,
        h = 284,
        image = images[i];
      c.save();
      // The real cover keeps its full proportions, with a restrained physical edge.
      if (image?.naturalWidth) {
        const ratio = Math.min(w / image.naturalWidth, h / image.naturalHeight);
        const iw = image.naturalWidth * ratio,
          ih = image.naturalHeight * ratio;
        c.shadowColor = options.theme === "paper" ? "#1B2B2226" : "#0E1B1666";
        c.shadowBlur = 14;
        c.shadowOffsetY = 8;
        c.drawImage(image, x, y + h - ih, iw, ih);
      } else {
        c.fillStyle = p.cover;
        c.fillRect(x, y, w, h);
        c.fillStyle = p.line;
        c.fillRect(x + 10, y, 2, h);
        c.fillStyle = p.ink;
        c.font = "26px Georgia";
        lines(c, row.book.title, w - 44, 5).forEach((t, j) =>
          c.fillText(t, x + 24, y + 55 + j * 32),
        );
        c.fillStyle = p.muted;
        c.font = "17px Arial, sans-serif";
        lines(c, row.book.author || "", w - 44, 2).forEach((t, j) =>
          c.fillText(t, x + 24, y + 242 + j * 22),
        );
      }
      c.restore();
      c.fillStyle = p.ink;
      c.font = "25px Arial, sans-serif";
      lines(c, row.book.title, 280, 3).forEach((t, j) =>
        c.fillText(t, x, 1160 + j * 30),
      );
      c.fillStyle = p.accent;
      c.font = "23px Arial, sans-serif";
      c.fillText(
        options.by === "days"
          ? row.days
            ? `${row.days} active ${row.days === 1 ? "day" : "days"}`
            : "Dates unavailable"
          : timeLabel(row),
        x,
        1261,
      );
    });
  } else {
    c.fillStyle = p.muted;
    c.font = "28px Arial, sans-serif";
    c.fillText("Recorded reading sessions", 72, 815);
    c.fillStyle = p.ink;
    fitted(c, stats.sessions.toLocaleString(), 128, 936);
    c.fillText(stats.sessions.toLocaleString(), 66, 955);
    c.fillStyle = p.muted;
    c.font = "26px Arial, sans-serif";
    lines(
      c,
      "Session and day counts reflect dated reading records. Some readers only provide lifetime totals.",
      800,
      3,
    ).forEach((t, j) => c.fillText(t, 72, 1015 + j * 38));
    c.fillStyle = p.accent;
    c.font = "24px Arial, sans-serif";
    c.fillText("A reading recap, with book details kept private.", 72, 1180);
  }
  c.fillStyle = p.muted;
  c.font = "19px Arial, sans-serif";
  c.fillText(
    stats.period.year === null
      ? "Imported history. Coverage may be incomplete."
      : stats.estimated
        ? "≈ Estimated elapsed time. Coverage may be incomplete."
        : "Dated records only. Coverage may be incomplete.",
    72,
    canvas.height - 30,
  );
  c.textAlign = "right";
  c.fillText("alexivaner.github.io/readmory", 1008, canvas.height - 30);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(Error("Unable to create image."))),
      "image/png",
    ),
  );
}
