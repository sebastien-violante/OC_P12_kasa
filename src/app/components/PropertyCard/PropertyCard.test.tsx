import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropertyCard from "./PropertyCard";
import postRequest from "@/app/utils/postRequest";
import deleteRequest from "@/app/utils/deleteRequest";
import Cookies from "js-cookie";
import { useFavorites } from "@/app/context/FavoritesContext";
import type { Property } from "@/app/types/types";

jest.mock("@/app/utils/postRequest");
jest.mock("@/app/utils/deleteRequest");
jest.mock("js-cookie");

jest.mock("@/app/context/FavoritesContext", () => ({
  useFavorites: jest.fn(),
}));

jest.mock("next/image", () => {
  return function Image({
    fill: _fill,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
  }) {
    return <img {...props} />;
  };
});

jest.mock("next/link", () => {
  return function Link({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("@/app/utils/formatUrl", () => ({
  __esModule: true,
  default: jest.fn((url: string) => url),
}));

jest.mock("../FlashMessage/FlashMessage", () => {
  return function FlashMessage({
    message,
  }: {
    message: string;
  }) {
    return <div>{message}</div>;
  };
});

const mockedPostRequest = jest.mocked(postRequest);
const mockedDeleteRequest = jest.mocked(deleteRequest);
const mockedUseFavorites = jest.mocked(useFavorites);

const property: Property = {
  id: "1",
  title: "Appartement cosy à Paris",
  location: "Paris 10°",
  price_per_night: 120,
  cover: "https://example.com/fakePropertyPicture.jpg",
  description: "Un appartement cosy au cœur de Paris.",
  host: {
    id: 1,
    name: "Jean Dupont",
    picture: "https://example.com/host.jpg",
  },
};

describe("PropertyCard - affichage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (Cookies.get as jest.Mock).mockReturnValue("fake-token");

    mockedUseFavorites.mockReturnValue({
      favoriteIds: [],
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
    } as any);
  });

  it("affiche le titre du logement", () => {
    render(<PropertyCard property={property} />);

    expect(
      screen.getByRole("heading", {
        name: property.title,
      }),
    ).toBeInTheDocument();
  });

  it("affiche la position", () => {
    render(<PropertyCard property={property} />);

    expect(
      screen.getByText(property.location),
    ).toBeInTheDocument();
  });

  it("affiche le prix par nuit", () => {
    render(<PropertyCard property={property} />);

    expect(screen.getByText(`${property.price_per_night} €`)).toBeInTheDocument();
    expect(screen.getByText("par nuit")).toBeInTheDocument();
  });

  it("affiche correctement l'image", () => {
    render(<PropertyCard property={property} />);

    expect(
      screen.getByRole("img", {
        name: `Photo du logement : ${property.title}`,
      }),
    ).toBeInTheDocument();
  });
});

describe("PropertyCard - favoris", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (Cookies.get as jest.Mock).mockReturnValue("fake-token");

    mockedUseFavorites.mockReturnValue({
      favoriteIds: [],
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
    } as any);
  });

  it("ajoute la propriété aux favoris", async () => {
    const user = userEvent.setup();

    const addFavorite = jest.fn();

    mockedUseFavorites.mockReturnValue({
      favoriteIds: [],
      addFavorite,
      removeFavorite: jest.fn(),
    } as any);

    mockedPostRequest.mockResolvedValue({
      data: true,
    } as any);

    render(<PropertyCard property={property} />);

    const button = screen.getByRole("button", {
      name: `Ajouter ${property.title} aux favoris`,
    });

    await user.click(button);

    await waitFor(() => {
      expect(mockedPostRequest).toHaveBeenCalledWith({
        url: `/api/properties/${property.id}/favorite`,
        token: "fake-token",
      });
    });

    await waitFor(() => {
      expect(addFavorite).toHaveBeenCalledWith(property.id);
    });
  });

  it("affiche un message si l'utilisateur n'est pas connecté", async () => {
    const user = userEvent.setup();

    (Cookies.get as jest.Mock).mockReturnValue(undefined);

    render(<PropertyCard property={property} />);

    const button = screen.getByRole("button", {
      name: `Ajouter ${property.title} aux favoris`,
    });

    await user.click(button);

    expect(
      screen.getByText(
        "Vous devez être connecté.e pour ajouter un favori",
      ),
    ).toBeInTheDocument();

    expect(mockedPostRequest).not.toHaveBeenCalled();
  });

  it("retire la propriété des favoris", async () => {
    const user = userEvent.setup();

    const removeFavorite = jest.fn();

    mockedUseFavorites.mockReturnValue({
      favoriteIds: [property.id],
      addFavorite: jest.fn(),
      removeFavorite,
    } as any);

    mockedDeleteRequest.mockResolvedValue({
      data: true,
    } as any);

    render(<PropertyCard property={property} />);

    const button = screen.getByRole("button", {
      name: `Retirer ${property.title} des favoris`,
    });

    await user.click(button);

    await waitFor(() => {
      expect(mockedDeleteRequest).toHaveBeenCalledWith({
        url: `/api/properties/${property.id}/favorite`,
        token: "fake-token",
      });
    });

    await waitFor(() => {
      expect(removeFavorite).toHaveBeenCalledWith(property.id);
    });
  });
});
