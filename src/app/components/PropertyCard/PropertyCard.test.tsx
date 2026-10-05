import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropertyCard from "./PropertyCard";
import postRequest from "@/app/utils/postRequest";
import deleteRequest from "@/app/utils/deleteRequest";
import Cookies from "js-cookie";
import { useFavorites } from "@/app/context/FavoritesContext";
import type { Property } from "@/app/types/types";
import { apiUrl } from "@/app/utils/api";

// MOCK DES IMPORTS ///////////////////////////////////

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
  return function FlashMessage({ message }: { message: string }) {
    return <div>{message}</div>;
  };
});

const mockedPostRequest = jest.mocked(postRequest);
const mockedDeleteRequest = jest.mocked(deleteRequest);
const mockedUseFavorites = jest.mocked(useFavorites);

// FAKE PROPERTY //////////////////////////////////////

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

// SETUP //////////////////////////////////////////////

type SetUpDisplayCardOptions = {
  favoriteIds?: string[];
  addFavorite?: jest.Mock;
  removeFavorite?: jest.Mock;
  token?: string | null;
};

function setUpDisplayCard({
  favoriteIds = [],
  addFavorite = jest.fn(),
  removeFavorite = jest.fn(),
  token = "fake-token",
}: SetUpDisplayCardOptions = {}) {
  const user = userEvent.setup();

  (Cookies.get as jest.Mock).mockReturnValue(token);

  mockedUseFavorites.mockReturnValue({
    favoriteIds,
    addFavorite,
    removeFavorite,
  } as any);

  render(<PropertyCard property={property} />);

  return {
    user,
    addFavorite,
    removeFavorite,
  };
}

// TESTS //////////////////////////////////////////////

describe("PropertyCard - affichage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("affiche correctement tous les éléments du composant", () => {
    setUpDisplayCard();

    expect(
      screen.getByRole("heading", {
        name: property.title,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(property.location)).toBeInTheDocument();

    expect(
      screen.getByText(`${property.price_per_night} €`),
    ).toBeInTheDocument();

    expect(screen.getByText("par nuit")).toBeInTheDocument();

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
  });

  it("ajoute la propriété aux favoris", async () => {
    const addFavorite = jest.fn();

    const { user } = setUpDisplayCard({
      addFavorite,
    });

    mockedPostRequest.mockResolvedValue({
      data: true,
    } as any);

    const button = screen.getByRole("button", {
      name: `Ajouter ${property.title} aux favoris`,
    });

    await user.click(button);

    expect(mockedPostRequest).toHaveBeenCalledWith({
      url: apiUrl(`/api/properties/${property.id}/favorite`),
      token: "fake-token",
    });

    expect(addFavorite).toHaveBeenCalledWith(property.id);
  });

  it("affiche un message si l'utilisateur n'est pas connecté", async () => {
    const { user } = setUpDisplayCard({
      token: null,
    });

    const button = screen.getByRole("button", {
      name: `Ajouter ${property.title} aux favoris`,
    });

    await user.click(button);

    expect(
      screen.getByText("Vous devez être connecté.e pour ajouter un favori"),
    ).toBeInTheDocument();

    expect(mockedPostRequest).not.toHaveBeenCalled();
  });

  it("affiche un message si l'ajout aux favoris échoue", async () => {
    const addFavorite = jest.fn();

    const { user } = setUpDisplayCard({
      addFavorite,
    });

    mockedPostRequest.mockRejectedValue(new Error("Erreur API"));

    const button = screen.getByRole("button", {
      name: `Ajouter ${property.title} aux favoris`,
    });

    await user.click(button);

    expect(mockedPostRequest).toHaveBeenCalledWith({
      url: apiUrl(`/api/properties/${property.id}/favorite`),
      token: "fake-token",
    });

    expect(
      await screen.findByText(
        "Erreur serveur lors de l'ajout du logement en favori",
      ),
    ).toBeInTheDocument();

    expect(addFavorite).not.toHaveBeenCalled();
  });

  it("retire la propriété des favoris", async () => {
    const removeFavorite = jest.fn();

    const { user } = setUpDisplayCard({
      favoriteIds: [property.id!],
      removeFavorite,
    });

    mockedDeleteRequest.mockResolvedValue({
      data: true,
    } as any);

    const button = screen.getByRole("button", {
      name: `Retirer ${property.title} des favoris`,
    });

    await user.click(button);

    expect(mockedDeleteRequest).toHaveBeenCalledWith({
      url: apiUrl(`/api/properties/${property.id}/favorite`),
      token: "fake-token",
    });

    expect(removeFavorite).toHaveBeenCalledWith(property.id);
  });

  it("affiche un message si la suppression des favoris échoue", async () => {
    const removeFavorite = jest.fn();

    const { user } = setUpDisplayCard({
      favoriteIds: [property.id!],
      removeFavorite,
    });

    mockedDeleteRequest.mockRejectedValue(new Error("Erreur API"));

    const button = screen.getByRole("button", {
      name: `Retirer ${property.title} des favoris`,
    });

    await user.click(button);

    expect(mockedDeleteRequest).toHaveBeenCalledWith({
      url: apiUrl(`/api/properties/${property.id}/favorite`),
      token: "fake-token",
    });

    expect(
      await screen.findByText(
        "Erreur serveur lors de la suppression du logement des favoris",
      ),
    ).toBeInTheDocument();

    expect(removeFavorite).not.toHaveBeenCalled();
  });
});
