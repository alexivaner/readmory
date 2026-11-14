/// <reference lib="webworker" />
import initSqlJs from "sql.js";
import { appPath } from "../lib/paths";
import { BrowserSnapshots } from "../lib/persistence";
import { Store } from "../../../packages/storage";
import {
  discover,
  attachCovers,
  type InputFile,
} from "../../../packages/importers";
import type {
  Knowledge,
  Preview,
  Reflection,
  Enrichment,
} from "../../../packages/core";
postMessage({ asset: self.location.href });
let store: Store;
const snapshots = new BrowserSnapshots();
let releaseLock: (() => void) | undefined;
async function initialize() {
  if (navigator.locks) {
    await new Promise<void>((resolve, reject) => {
      navigator.locks
        .request("kobo-library-writer", { ifAvailable: true }, async (lock) => {
          if (!lock) {
            reject(
              Error(
                "Your library is open in another tab. Close that tab and reload.",
              ),
            );
            return;
          }
          resolve();
          await new Promise<void>((r) => {
            releaseLock = r;
          });
        })
        .catch(reject);
    });
  }
  const bytes = await snapshots.load();
  const SQL = await initSqlJs({
    locateFile: () => appPath("/vendor/sql-wasm.wasm"),
  });
  store = new Store(SQL, bytes);
  if (!bytes) await snapshots.save(store.bytes());
  return store.library(snapshots.label);
}
async function request(m: { type: string; payload: unknown; id: number }) {
  if (m.type === "init") return initialize();
  if (!store) throw Error("Database is not ready. Reload the app.");
  if (m.type === "preview") {
    const p = m.payload as { files: InputFile[]; deviceId: string };
    return discover(store.SQL, p.files, p.deviceId, (text) =>
      postMessage({ progress: text, id: m.id }),
    );
  }
  if (m.type === "covers") {
    const p = m.payload as { preview: Preview; files: InputFile[] };
    return attachCovers(p.preview, p.files);
  }
  if (m.type === "backup") return store.backup();
  if (m.type === "read") return store.library(snapshots.label);
  const before = store.bytes();
  try {
    if (m.type === "commit") store.commit(m.payload as Preview);
    else if (m.type === "restore") store.restore(m.payload);
    else if (m.type === "knowledge") store.knowledge(m.payload as Knowledge);
    else if (m.type === "reflection") store.reflect(m.payload as Reflection);
    else if (m.type === "enrich")
      store.enrich(
        m.payload as { bookId: string; record: Enrichment; cover?: string }[],
      );
    else if (m.type === "group")
      store.group(m.payload as { ids: string[]; split?: boolean });
    else if (m.type === "cover")
      store.cover(
        m.payload as { bookId: string; cover: string; pageUrl: string },
      );
    else if (m.type === "clear") store.clear();
    else throw Error("Unknown operation");
    await snapshots.save(store.bytes());
    return store.library(snapshots.label);
  } catch (e) {
    store.db.close();
    store = new Store(store.SQL, before);
    throw e;
  }
}
let queue = Promise.resolve();
self.onmessage = (event: MessageEvent) => {
  const m = event.data;
  queue = queue.then(async () => {
    try {
      postMessage({ id: m.id, result: await request(m) });
    } catch (e) {
      postMessage({
        id: m.id,
        error: e instanceof Error ? e.message : "Operation failed",
      });
    }
  });
};
self.onclose = () => releaseLock?.();
