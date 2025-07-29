export function getKeyName(key) {
  if (typeof key === "string") {
    return key;
  }
  return key.$injectKey;
}
