export type SourceHandle = {
  kind: "file" | "directory";
  name: string;
  getFile: () => Promise<File>;
  values: () => AsyncIterable<SourceHandle>;
};

// These operating-system folders are unrelated to reader data. In particular,
// Chrome reports NoModificationAllowedError when listing macOS .TemporaryItems
// on a USB drive, even when the directory picker requested read-only access.
const systemDirectories = new Set([
  ".trash",
  ".trashes",
  ".temporaryitems",
  ".spotlight-v100",
  ".fseventsd",
  ".documentrevisions-v100",
  "$recycle.bin",
  "recycler",
  "recycled",
  "system volume information",
]);

export async function scanSourceFiles(
  root: SourceHandle,
  progress: (completed: number) => void,
) {
  const files: { path: string; file: File }[] = [];
  async function walk(dir: SourceHandle, path: string, depth = 0) {
    if (depth > 40) throw Error("Folder nesting exceeds the safe limit.");
    try {
      for await (const h of dir.values()) {
        const next = path + "/" + h.name;
        if (h.kind === "directory") {
          if (!systemDirectories.has(h.name.toLowerCase()))
            await walk(h, next, depth + 1);
        } else if (
          /(?:KoboReader\.sqlite(?:-wal|-shm|-journal)?|statistics\.sqlite3(?:-wal|-shm|-journal)?|kobalt\.sqlite(?:-wal|-shm|-journal)?|metadata\.[\w]+\.lua|\.epub|\.parsed|\.(?:jpg|jpeg|png))$/i.test(
            next,
          )
        ) {
          files.push({ path: next, file: await h.getFile() });
          if (files.length % 50 === 0) progress(files.length);
          if (files.length > 15000)
            throw Error(
              "Folder has too many files. Select source files instead.",
            );
        }
      }
    } catch (e) {
      if (e instanceof DOMException)
        throw Error(
          `Your browser could not read ${path || "the selected folder"} (${e.name}). Choose individual source files or copy your reader files to a folder on your laptop and select that folder. Your Kobo has not been modified.`,
          { cause: e },
        );
      throw e;
    }
  }
  await walk(root, "");
  return files;
}
