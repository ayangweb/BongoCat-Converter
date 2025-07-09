export const base64ToArrayBuffer = (base64: string) => {
  base64 = base64.replace(/^data:[^;]+;base64,/, "");
  const binary = atob(base64);
  const bytes = Uint8Array.from({ length: binary.length }, (_, i) => {
    return binary.charCodeAt(i);
  });

  return bytes.buffer;
};
