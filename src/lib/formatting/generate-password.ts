const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function randomGroup(length: number): string {
  return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
}

export function generateTempPassword(): string {
  return `${randomGroup(4)}•${randomGroup(4)}•${randomGroup(4)}`;
}
