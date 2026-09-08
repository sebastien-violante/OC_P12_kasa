import { render, screen } from "@testing-library/react";
import Connexion from "./page";
import userEvent from "@testing-library/user-event";
import postRequest from "../utils/postRequest";

// Mock nécessaire pour pallier l'absence de montage de router lors de l'utilisation de Jest
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock de postRequest
jest.mock("../utils/postRequest", () => ({
  __esModule: true,
  default: jest.fn(),
}));
const mockedPostRequest = jest.mocked(postRequest)

describe("Page de connexion", () => {
  // MONTAGE DE LA PAGE //////////////////////////////////////////////////////////////////////////////////
  it("affiche la page de connexion", () => {
    render(<Connexion />);
    expect(
      screen.getByRole("heading", { name: /heureux de vous revoir/i }),
    ).toBeInTheDocument();
  });

  // TEST DES LABELS //////////////////////////////////////////////////////////////////////////////////
  it("associe les labels aux champs", () => {
    render(<Connexion />);
    expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/adresse email/i)).toHaveAttribute(
      "id",
      "email",
    );

    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toHaveAttribute(
      "id",
      "password",
    );
  });

  // TEST DE LA VALIDATION DU FORMULAIRE //////////////////////////////////////////////////////////////////////////////////
  it("affiche les erreurs lorsque le formulaire est soumis sans données", async () => {
    const user = userEvent.setup();
    render(<Connexion />);

    const emailInput = screen.getByLabelText(/adresse email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);

    await user.click(
      screen.getByRole("button", {
        name: /se connecter/i,
      }),
    );

    // messages d'erreur
    expect(screen.getByText("L'adresse email est requise")).toBeInTheDocument();
    expect(screen.getByText("Le mot de passe est requis")).toBeInTheDocument();

    // attribut des inputs
    expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
    expect(passwordInput).toHaveAttribute("aria-describedby", "password-error");
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");
  });

  // TEST DE CONNEXION AVEC DONNEES VALIDES
  it("connecte l'utilisateur avec des identifiants valides", async () => {
    const user = userEvent.setup();

    mockedPostRequest.mockResolvedValue({
      success: true,
      message: "Connexion réussie",
      data: {
        token: "fake-token",
        user: {
          id: 1,
          name: "Jean Dupont",
          email: "jean@example.com",
          picture: null,
          role: "owner",
        },
      },
    });

    render(<Connexion />);

    await user.type(screen.getByLabelText("Adresse email"), "jean@example.com");
    await user.type(screen.getByLabelText("Mot de passe"), "password123@@");
    await user.click(
      screen.getByRole("button", {
        name: /se connecter/i,
      }),
    );

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  // TEST DE CONNEXION AVEC DONNEES INVALIDES
  it("affiche le message lorsque l'API renvoie une erreur", async () => {
    const user = userEvent.setup();

    mockedPostRequest.mockRejectedValue({
      message: "Email ou mot de passe incorrect",
    });

    render(<Connexion />);

    await user.type(screen.getByLabelText("Adresse email"), "jean@example.com");

    await user.type(
      screen.getByLabelText("Mot de passe"),
      "mauvais-mot-de-passe",
    );

    await user.click(
      screen.getByRole("button", {
        name: /se connecter/i,
      }),
    );

    const apiError = await screen.findByText("Email ou mot de passe incorrect");
    expect(apiError).toBeInTheDocument();
    expect(apiError).toHaveAttribute("role", "alert");
  });
})
