export function toAbsoluteAssetUrl(host: string, protocol: string, image: string) {
  if (!image.startsWith('/')) {
    return image;
  }

  return `${protocol}://${host}${image}`;
}