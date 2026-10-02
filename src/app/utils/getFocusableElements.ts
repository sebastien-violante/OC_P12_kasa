/**
 * Récupère les liens de logements pouvant recevoir le focus clavier.
 *
 * @returns La liste des liens identifiés comme éléments focusables.
 */
export function getFocusableElements(): NodeListOf<HTMLAnchorElement> {
  const focusableElements =
    document.querySelectorAll<HTMLAnchorElement>(
      `a[href][data-focusable="property-link"]`,
    );

  return focusableElements;
}