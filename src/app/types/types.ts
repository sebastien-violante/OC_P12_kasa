export type Property = {
    cover : string;
    description: string;
    host: Host;
    id: string;
    location: string;
    price_per_night: number;
    rating_avg: number;
    rating_counts: number;
    slug: string;
    title: string;
};

export type Host = {
    id: number;
    name: string;
    picture: string;
}