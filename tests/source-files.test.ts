import { describe, expect, it, vi } from "vitest";
import {
  scanSourceFiles,
  type SourceHandle,
} from "../apps/web/lib/source-files";

function directory(name: string, children: SourceHandle[]): SourceHandle {
  return {
    kind: "directory",
    name,
    getFile: vi.fn(),
    values: async function* () {
      yield* children;
    },
  };
}
function file(name: string): SourceHandle {
  return {
    kind: "file",
    name,
    values: vi.fn(),
    getFile: vi.fn(async () => new File(["synthetic"], name)),
  };
}

describe("USB directory scanning", () => {
  it("never enters protected OS folders and keeps native/KOReader/Kobalt source paths", async () => {
    const blocked = [
      ".TemporaryItems",
      ".Trashes",
      ".Spotlight-V100",
      ".fseventsd",
      ".DocumentRevisions-V100",
      "System Volume Information",
      "$RECYCLE.BIN",
    ].map((name) => ({
      ...directory(name, []),
      values: vi.fn(() => {
        throw new DOMException(
          "An attempt was made to write to a file or directory which could not be modified due to the state of the underlying filesystem.",
          "NoModificationAllowedError",
        );
      }),
    }));
    const root = directory("KOBOeReader", [
      ...blocked,
      directory(".kobo", [
        file("KoboReader.sqlite"),
        file("KoboReader.sqlite-wal"),
      ]),
      directory(".adds", [
        directory("kobalt", [file("kobalt.sqlite")]),
        directory("koreader", [
          directory("settings", [file("statistics.sqlite3")]),
        ]),
      ]),
      directory("Book.sdr", [file("metadata.epub.lua")]),
      directory(".kobo-images", [file("cover.parsed")]),
      file("Book.epub"),
      file("unrelated.txt"),
    ]);
    const result = await scanSourceFiles(root, vi.fn());
    expect(result.map((f) => f.path)).toEqual([
      "/.kobo/KoboReader.sqlite",
      "/.kobo/KoboReader.sqlite-wal",
      "/.adds/kobalt/kobalt.sqlite",
      "/.adds/koreader/settings/statistics.sqlite3",
      "/Book.sdr/metadata.epub.lua",
      "/.kobo-images/cover.parsed",
      "/Book.epub",
    ]);
    for (const h of blocked) expect(h.values).not.toHaveBeenCalled();
  });
  it("reports unreadable source folders instead of silently importing partial data", async () => {
    const unreadable = directory(".kobo", []);
    unreadable.values = () => {
      throw new DOMException("Blocked", "NotAllowedError");
    };
    await expect(
      scanSourceFiles(directory("KOBOeReader", [unreadable]), vi.fn()),
    ).rejects.toThrow("could not read /.kobo (NotAllowedError)");
  });
  it("reports progress without changing the scan's file paths", async () => {
    const progress = vi.fn();
    const result = await scanSourceFiles(
      directory(
        "KOBOeReader",
        Array.from({ length: 51 }, (_, i) => file(`cover${i}.png`)),
      ),
      progress,
    );
    expect(result).toHaveLength(51);
    expect(progress).toHaveBeenCalledWith(50);
  });
});
