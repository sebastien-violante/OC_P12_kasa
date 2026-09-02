
/**
 * Effectue une requête en GET à l'API qui renvoie les données demandées
 * @param {string} url - endpoint de l'API
 * @returns {Object} - données renvoyées par l'API
 */
export default async function getRequest<T>(url : string): Promise<T> {
  
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const response = await fetch(`api/${url}`, { method: "GET", headers });
    //const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
    }
    //await sleep(5000);

    return response.json();

}