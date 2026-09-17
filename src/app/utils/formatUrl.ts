export default function formatUrl(url: string) {
    
    const formatedUrl = url.startsWith("http")
  ? url
  : `http://localhost:8000${
      url.startsWith("/") ? "" : "/"
    }${url}`;

    return formatedUrl
}