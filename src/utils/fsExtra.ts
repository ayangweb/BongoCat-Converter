import { last } from "es-toolkit";

export const mkdir = async (
  handle: FileSystemDirectoryHandle,
  path: string,
) => {
  let nextHandle = handle;

  for await (const name of path.split("/")) {
    nextHandle = await nextHandle?.getDirectoryHandle(name, {
      create: true,
    });
  }

  return nextHandle;
};

export const writeFile = async (
  handle: FileSystemDirectoryHandle,
  path: string,
  data: FileSystemWriteChunkType,
) => {
  let nextHandle = handle;

  const names = path.split("/");

  for await (const name of names) {
    if (name === last(names)) {
      const fileHandle = await nextHandle.getFileHandle(name, {
        create: true,
      });

      const writable = await fileHandle.createWritable();
      await writable.write(data);
      return writable.close();
    }

    nextHandle = await mkdir(nextHandle, name);
  }
};

export const join = (...paths: string[]) => {
  return paths.map((p) => p.replace(/^\/+|\/+$/g, "")).join("/");
};
