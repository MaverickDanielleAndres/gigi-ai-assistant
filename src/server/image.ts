export function validateImage(dataUrl: string) {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return false;
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > 5_000_000 || bytes.length < 16) return false;
  const png = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const webp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  return (match[1] === "image/png" && png) || (match[1] === "image/jpeg" && jpeg) || (match[1] === "image/webp" && webp);
}
