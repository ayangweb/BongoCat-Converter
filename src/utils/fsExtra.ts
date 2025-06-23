export const createDirectory = async (
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

export const createFile = async (
  handle: FileSystemDirectoryHandle,
  path: string,
  data: FileSystemWriteChunkType,
) => {
  let nextHandle = handle;

  for await (const name of path.split("/")) {
    if (name.includes(".")) {
      const fileHandle = await nextHandle.getFileHandle(name, {
        create: true,
      });

      const writable = await fileHandle.createWritable();
      await writable.write(data);
      return writable.close();
    }

    nextHandle = await createDirectory(nextHandle, name);
  }
};
