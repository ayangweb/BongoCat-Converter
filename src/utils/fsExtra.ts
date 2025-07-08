import { last, noop } from "es-toolkit";

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

export const safeRemoveEntry = async (
  handle: FileSystemDirectoryHandle,
  name: string,
  options?: FileSystemRemoveOptions,
) => {
  await handle.removeEntry(name, options).catch(noop);
};

export const join = (...paths: string[]) => {
  const joinPaths = paths.map((path) => {
    if (path.endsWith("/")) {
      return path.slice(0, -1);
    }

    if (path.startsWith("/")) {
      return path.slice(1);
    }

    return path;
  });

  return joinPaths.join("/");
};
