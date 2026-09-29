export function getFocusableElements() {
  const focusableElements = document.querySelectorAll<HTMLAnchorElement>(`a[href][data-focusable="property-link"]`)
  return focusableElements;
}
