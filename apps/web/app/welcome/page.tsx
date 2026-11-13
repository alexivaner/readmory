import { Brand, BrandArtwork } from "../../components/brand";
import { appPath } from "../../lib/paths";
import { SUPPORT_URL, GITHUB_URL } from "../../lib/links";
export default function Welcome() {
  return (
    <main className="welcome">
      <nav>
        <a href={appPath("/")} className="brand">
          <Brand />
        </a>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          View on GitHub
        </a>
      </nav>
      <section className="welcome-hero">
        <div className="welcome-hero-copy">
          <h1>
            Your reading,
            <br />
            remembered<span className="green">.</span>
          </h1>
          <p>
            Keep your Kobo, KOReader, and Kobalt books, highlights, and reading
            history together in one private browser workspace.
          </p>
          <div className="actions">
            <a className="primary" href={appPath("/")}>
              Open App
            </a>
          </div>
          <small>Free and open-source. No account required.</small>
        </div>
        <BrandArtwork className="welcome-brand-art" />
      </section>
      <section className="welcome-features">
        {[
          [
            "One reading home",
            "Import Kobo, KOReader, and Kobalt. Keep books together with every reader’s progress preserved.",
          ],
          [
            "Keep the good parts",
            "Explore highlights, personal notes, topics, and reflections in your knowledge library.",
          ],
          [
            "See your reading life",
            "Browse your bookshelf, recorded activity, completion history, and reading statistics.",
          ],
          [
            "Private by design",
            "Files are parsed in your browser. Your library stays on your device, with portable backups.",
          ],
        ].map(([title, text]) => (
          <article className="panel" key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <section
        className="welcome-import"
        aria-labelledby="welcome-import-title"
      >
        <h2 id="welcome-import-title">From your Kobo to your library</h2>
        <ol>
          {[
            [
              "1",
              "Connect your Kobo",
              "Plug it into your computer with USB and tap Connect on its screen.",
            ],
            [
              "2",
              "Choose your reading data",
              "The import guide shows where to find the Kobo folder or reader files.",
            ],
            [
              "3",
              "Review and save",
              "Check the preview before saving, then disconnect. Your library stays in this browser.",
            ],
          ].map(([n, title, text]) => (
            <li key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <a className="primary" href={appPath("/#import")}>
          Start guided import
        </a>
      </section>
      <footer>
        <p>
          Browser storage can be cleared. Back up your library regularly.
          Optional Open Library lookups share book identifiers only after you
          enable them.
        </p>
        <a
          className="primary"
          href={SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Support Readmory on Ko-fi
        </a>
        <p>
          Support this free and open-source project. Donations never unlock or
          restrict features.
        </p>
        <a
          href="https://github.com/alexivaner/readmory/blob/main/PRIVACY.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy details
        </a>
      </footer>
    </main>
  );
}
