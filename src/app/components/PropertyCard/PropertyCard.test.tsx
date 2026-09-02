import { render, screen } from "@testing-library/react";
import PropertyCard from "./PropertyCard";

const property = {
  id: "1",
  title: "Appartement cosy à Paris",
  description: "Un magnifique appartement au cœur de Paris",
  cover: "https://example.com/fakePropertyPicture.jpg",
  price_per_night: 120,
  host: {
    id: 123456,
    name: "Jean Dupont",
    picture: "https://example.com/fakeProfilePicture.jpg"
  },
  location: "Paris 10°",
  rating_avg: 5,
  rating_counts: 3,
  slug: "appartement_cosy_a_paris"
};


describe("Card", () => {
  it("affiche le titre du logement", () => {
    render(<PropertyCard property={property} />);

    expect(
      screen.getByRole("heading", {
        name: "Appartement cosy à Paris",
      })
    ).toBeInTheDocument();
  });

  it("affiche la position", () => {
    render(<PropertyCard property={property} />);

    expect(
      screen.getByText("Paris 10°")
    ).toBeInTheDocument();
  });

  it("affiche le prix par nuit", () => {
    render(<PropertyCard property={property} />);

    expect(screen.getByText(/120/)).toBeInTheDocument();
    expect(screen.getByText(/par nuit/i)).toBeInTheDocument();
  });

  it("affiche correctement l'image", () => {
  render(<PropertyCard property={property} />);

  const image = screen.getByRole("img", {
    name: `photo du logement ${property.title}`,
  });

  expect(image).toBeInTheDocument();
  expect(image).toHaveAttribute("src", property.cover);
});
});