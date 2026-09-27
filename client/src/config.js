export const PREDECESSOR_COMMIT = '29326120dffa33a94a9489ed41874ce9d5163328';

export const PREDECESSOR_ASSET_BASE =
  `https://raw.githubusercontent.com/goodfriends1853llc-beep/brevard-com-demo/${PREDECESSOR_COMMIT}/`;

export function resolveAssetUrl(assetRef) {
  if (/^https?:\/\//i.test(assetRef)) return assetRef;
  return new URL(assetRef, PREDECESSOR_ASSET_BASE).href;
}
