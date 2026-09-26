import { render, screen } from "@testing-library/react";
import Connexion from "./page";
import userEvent from "@testing-library/user-event";
import postRequest from "../utils/postRequest";
import getRequest from "../utils/getRequest";
import Cookies from "js-cookie";

// MOCK DES IMPORTS ///////////////////////////////////

const mockLogin = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

jest.mock("../utils/postRequest", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../utils/getRequest", () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock("js-cookie", () => ({
  set: jest.fn(),
}));

// TESTS ////////////////////////////////////////////////

describe("connexion", () => {
  // ✅ formulaire affiché
  it("affiche le formulaire", () => {
    render(<Connexion />);
    const emailInput = screen.getByLabelText(/Adresse email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);

    // Affichage du titre du formulaire et des labels
    expect(
      screen.getByRole("heading", { name: /Heureux de vous revoir/i }),
    ).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  // ✅ champs remplissables
  it("permet à l'utilisateur de remplir le formulaire", async () => {
    const user = userEvent.setup();
    render(<Connexion />);
    const emailInput = screen.getByLabelText(/Adresse email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);

    // Test de la valeur initiale des champs
    expect(emailInput).toHaveValue("");
    expect(passwordInput).toHaveValue("");
    // Saisie utilisateur
    await user.type(emailInput, "john.doe@gmail.com");
    await user.type(passwordInput, "P@swworD123");
    // Vérification des nouvelles valeurs des champs
    expect(emailInput).toHaveValue("john.doe@gmail.com");
    expect(passwordInput).toHaveValue("P@swworD123");
  });

  // ✅ validation champs vides
  it("soulève des erreurs si les champs sont vides et place les inputs en aria-invalid", async () => {
    const user = userEvent.setup();
    render(<Connexion />);
    const emailInput = screen.getByLabelText(/Adresse email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", {
      name: /Se connecter/i,
    });

    expect(emailInput).toHaveAttribute("aria-invalid", "false");
    expect(passwordInput).toHaveAttribute("aria-invalid", "false");
    await user.click(submitButton);
    expect(
      await screen.findByText(/L'adresse email est requise/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Le mot de passe est requis/i),
    ).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");
  });

  // ✅ validation email invalide
  it("affiche une erreur lorsque l'email est invalide", async () => {
    const user = userEvent.setup();
    render(<Connexion />);
    const emailInput = screen.getByLabelText(/Adresse email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", {
      name: /Se connecter/i,
    });

    await user.type(emailInput, "john.doe");
    await user.type(passwordInput, "P@swworD123");
    await user.click(submitButton);

    expect(
      await screen.findByText(/Le format de l'email est invalide/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Le mot de passe est requis/i),
    ).not.toBeInTheDocument();
  });

  // ✅ API auth appelée et avec les bonnes données
  it("fetch l'API pour vérifier les données de connexion", async () => {
    const user = userEvent.setup();
    render(<Connexion />);
    const emailInput = screen.getByLabelText(/Adresse email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", {
      name: /Se connecter/i,
    });
    const mockedPostRequest = jest.mocked(postRequest);
    const mockedValue = {
      data: {
        token: "fake-token",
        user: {
          id: 123,
          name: "john Doe",
          picture: "fake-src",
        },
      },
      success: true,
      message: "authentification réussie",
    };
    mockedPostRequest.mockResolvedValue(mockedValue);

    await user.type(emailInput, "john.doe@gmail.com");
    await user.type(passwordInput, "P@swworD123");
    await user.click(submitButton);
    expect(mockedPostRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("/auth/login"),
        payload: {
          email: "john.doe@gmail.com",
          password: "P@swworD123",
        },
      }),
    );
  });

  // ✅ login appelée et avec les bonnes données
  it("fetch login", async () => {
    const user = userEvent.setup();
    render(<Connexion />);
    const emailInput = screen.getByLabelText(/Adresse email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", {
      name: /Se connecter/i,
    });
    const mockedPostRequest = jest.mocked(postRequest);
    const fakeUser = {
      id: 123,
      name: "John Doe",
      picture: "fake-src",
    };
    const mockedValue = {
      data: {
        token: "fake-token",
        user: fakeUser,
      },
      success: true,
      message: "authentification réussie",
    };
    mockedPostRequest.mockResolvedValue(mockedValue);

    await user.type(emailInput, "john.doe@gmail.com");
    await user.type(passwordInput, "P@swworD123");
    await user.click(submitButton);
    expect(mockLogin).toHaveBeenCalledWith(mockedValue.data.user);
  });

  // ✅ le token est placé en cookies avec les bons paramètres
  it("set cookies", async () => {
    const user = userEvent.setup();
    render(<Connexion />);
    const emailInput = screen.getByLabelText(/Adresse email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", {
      name: /Se connecter/i,
    });
    const mockedPostRequest = jest.mocked(postRequest);
    const fakeUser = {
      id: 123,
      name: "John Doe",
      picture: "fake-src",
    };
    const fakeTokenParameters = {
      expires: 1 / 24,
      secure: true,
      sameSite: "strict",
    };
    const mockedValue = {
      data: {
        token: "fake-token",
        user: fakeUser,
      },
      success: true,
      message: "authentification réussie",
    };
    const mockedSetCookies = jest.mocked(Cookies.set);

    mockedPostRequest.mockResolvedValue(mockedValue);

    await user.type(emailInput, "john.doe@gmail.com");
    await user.type(passwordInput, "P@swworD123");
    await user.click(submitButton);

    expect(mockedSetCookies).toHaveBeenCalledWith("token", mockedValue.data.token, fakeTokenParameters);
  });

  // ✅ API favoris appelée et avec les bonnes données
  it("fetch l'API pour récupérer les favoris", async () => {
    const user = userEvent.setup();
    render(<Connexion />);
    const emailInput = screen.getByLabelText(/Adresse email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", {
      name: /Se connecter/i,
    });
    const mockedPostRequest = jest.mocked(postRequest)
    const mockedGetRequest = jest.mocked(getRequest)
    const fakeUser = {
      id: 123,
      name: "John Doe",
      picture: "fake-src",
    };
    
    const mockedValue = {
      data: {
        token: "fake-token",
        user: fakeUser,
      },
      success: true,
      message: "authentification réussie",
    };
    mockedPostRequest.mockResolvedValue(mockedValue);
    mockedGetRequest.mockResolvedValue([])

    await user.type(emailInput, "john.doe@gmail.com");
    await user.type(passwordInput, "P@swworD123");
    await user.click(submitButton);

    expect(mockedGetRequest).toHaveBeenCalledWith(
      expect.objectContaining({
      url: expect.stringContaining(`/api/users/${fakeUser.id}/favorites`),
      token: mockedValue.data.token}))
  });

  // ✅ localStorage reçoit les bonnes données de favoris
  it("place en localStorage les favoris récupérés", async () => {
    const user = userEvent.setup();
    render(<Connexion />);
    const emailInput = screen.getByLabelText(/Adresse email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole("button", {
      name: /Se connecter/i,
    });
    const mockedPostRequest = jest.mocked(postRequest)
    const mockedGetRequest = jest.mocked(getRequest)
    const fakeUser = {
      id: 123,
      name: "John Doe",
      picture: "fake-src",
    };
    
    const mockedValue = {
      data: {
        token: "fake-token",
        user: fakeUser,
      },
      success: true,
      message: "authentification réussie",
    };
    const fakeProperties = [
      {
        cover : "/picture/cover1.png",
        description: "descripption1",
        host: fakeUser,
        id: "1234",
        location: "location1",
        price_per_night: 1234,
        rating_avg: 1,
        ratings_counts: 2,
        slug: "maison-un",
        title: "Maison un",
        pictures: ["/picture/picture11.png","/picture/picture12.png","/picture/picture13.png" ],
        equipments: ["wifi", "lavabo"],
        tags: ["Paris", "boulevard"]
      },
      {
        cover : "/picture/cover2.png",
        description: "descripption2",
        host: fakeUser,
        id: "2345",
        location: "location2",
        price_per_night: 1234,
        rating_avg: 2,
        ratings_counts: 3,
        slug: "maison-deux",
        title: "Maison deux",
        pictures: ["/picture/picture21.png","/picture/picture22.png","/picture/picture23.png" ],
        equipments: ["wifi", "lavabo"],
        tags: ["Paris", "Etoile"]
      }
      
    ]
    mockedPostRequest.mockResolvedValue(mockedValue);
    mockedGetRequest.mockResolvedValue(fakeProperties)

    await user.type(emailInput, "john.doe@gmail.com");
    await user.type(passwordInput, "P@swworD123");
    await user.click(submitButton);

    expect(localStorage.getItem("favorites")).toBe(JSON.stringify(fakeProperties) );
  });
    
});
