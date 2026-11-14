/** Browser-local snapshots. A fallback choice and its bytes commit together. */
export class BrowserSnapshots {
  private idb!: IDBDatabase;
  private opfs?: FileSystemDirectoryHandle;
  get label() {
    return `${this.opfs ? "OPFS" : "IndexedDB"} · SQLite WASM`;
  }
  async load(): Promise<Uint8Array | undefined> {
    this.idb = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("kobo-books-summary", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("snapshots");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    const snapshot = await new Promise<{
      bytes?: Uint8Array;
      backend?: string;
    }>((resolve, reject) => {
      const tx = this.idb.transaction("snapshots");
      const snapshots = tx.objectStore("snapshots");
      const database = snapshots.get("database");
      const backend = snapshots.get("backend");
      tx.oncomplete = () =>
        resolve({
          bytes: database.result ? new Uint8Array(database.result) : undefined,
          backend: backend.result,
        });
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    // Never prefer a stale OPFS file after switching to IndexedDB, even if
    // OPFS is writable again. Older releases had no backend marker.
    if (snapshot.backend === "indexeddb") {
      if (!snapshot.bytes)
        throw Error(
          "Your saved library could not be read. Try reopening this browser. Do not clear site data; restore a backup if needed.",
        );
      return snapshot.bytes;
    }
    try {
      this.opfs = await navigator.storage.getDirectory();
    } catch {
      return snapshot.bytes;
    }
    try {
      const file = await (
        await this.opfs.getFileHandle("library.sqlite")
      ).getFile();
      return new Uint8Array(await file.arrayBuffer());
    } catch (e) {
      if (e instanceof DOMException && e.name === "NotFoundError")
        return snapshot.bytes;
      // An unreadable existing file must not be replaced by an empty library.
      throw Error(
        "Your browser could not read the saved library. Close other Readmory tabs and reopen this browser. Do not clear site data; restore a backup if needed.",
        { cause: e },
      );
    }
  }
  async save(bytes: Uint8Array) {
    if (this.opfs) {
      try {
        const handle = await this.opfs.getFileHandle("library.sqlite", {
          create: true,
        });
        const writer = await handle.createWritable();
        try {
          await writer.write(bytes as Uint8Array<ArrayBuffer>);
          await writer.close();
        } catch (e) {
          // Abort may also fail after close. Preserve the original failure.
          try {
            await writer.abort();
          } catch {
            /* Already closed or unavailable. */
          }
          throw e;
        }
        return;
      } catch {
        // Some browsers expose OPFS reads but block writes or lack createWritable.
        // Keep OPFS selected until the IndexedDB transaction actually commits.
      }
    }
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = this.idb.transaction("snapshots", "readwrite");
        const snapshots = tx.objectStore("snapshots");
        snapshots.put(bytes, "database");
        snapshots.put("indexeddb", "backend");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      this.opfs = undefined;
    } catch (e) {
      throw Error(
        "Readmory could not save your library in this browser. Free some disk space, allow site storage, or try a regular browser window. Your last saved library has been kept. If the app is open, download a backup before closing it.",
        { cause: e },
      );
    }
  }
}
