import { render, screen } from "@testing-library/react";
import Inscription from "./page";
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
const mockedPostRequest = jest.mocked(postRequest);

describe("Page de connexion", () => {
  // MONTAGE DE LA PAGE //////////////////////////////////////////////////////////////////////////////////
  it("affiche la page d'enregistrement", () => {
    render(<Inscription />);
    expect(
      screen.getByRole("heading", { name: /rejoignez la communauté kasa/i }),
    ).toBeInTheDocument();
  });

  // TEST DES LABELS //////////////////////////////////////////////////////////////////////////////////
  it("associe les labels aux champs", () => {
    render(<Inscription />);

    expect(screen.getByLabelText(/^Nom$/i)).toHaveAttribute("id", "name");
    expect(screen.getByLabelText(/^Prénom$/i)).toHaveAttribute(
      "id",
      "firstname",
    );
    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute("id", "email");
    expect(screen.getByLabelText(/^mot de passe$/i)).toHaveAttribute(
      "id",
      "password",
    );
    expect(
      screen.getByLabelText(
        /^j'accepte les conditions générales d'utilisation$/i,
      ),
    ).toHaveAttribute("id", "acceptCgu");
  });

  // TEST DE LA VALIDATION DU FORMULAIRE //////////////////////////////////////////////////////////////////////////////////
  it("affiche les erreurs lorsque le formulaire est soumis sans données", async () => {
    const user = userEvent.setup();
    render(<Inscription />);

    const nameInput = screen.getByLabelText("Nom");
    const firstnameInput = screen.getByLabelText("Prénom");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const cguInput = screen.getByLabelText(
      /j'accepte les conditions générales d'utilisation/i,
    );

    await user.click(
      screen.getByRole("button", {
        name: /s'inscrire/i,
      }),
    );
    // messages d'erreur
    expect(
      screen.getByText("Le prénom doit contenir au moins 2 caractères"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Le nom doit contenir au moins 2 caractères"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Le format de l'email est invalide"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Le mot de passe doit contenir au moins 8 caractères"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Vous devez accepter les conditions avant de vous inscrire",
      ),
    ).toBeInTheDocument();

    // attribut des inputs
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput).toHaveAttribute("aria-describedby", "name-error");

    expect(firstnameInput).toHaveAttribute("aria-invalid", "true");
    expect(firstnameInput).toHaveAttribute(
      "aria-describedby",
      "firstname-error",
    );

    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAttribute("aria-describedby", "email-error");

    expect(passwordInput).toHaveAttribute("aria-describedby", "password-error");
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");

    expect(cguInput).toHaveAttribute("aria-invalid", "true");
    expect(cguInput).toHaveAttribute("aria-describedby", "acceptCgu-error");
  });
  // TEST DE CONNEXION AVEC DONNEES VALIDES
  it("enregistre l'utilisateur avec des identifiants valides", async () => {
    const user = userEvent.setup();

    mockedPostRequest.mockResolvedValue({
      success: true,
      message: "Inscription réussie",
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

    render(<Inscription />);
    await user.type(screen.getByLabelText("Nom"), "jean");
    await user.type(screen.getByLabelText("Prénom"), "dupont");
    await user.type(screen.getByLabelText("Email"), "jean@example.com");
    await user.type(screen.getByLabelText("Mot de passe"), "Password123@@");
    await user.click(
      screen.getByLabelText(
        /j'accepte les conditions générales d'utilisation/i,
      ),
    );
    await user.click(
      screen.getByRole("button", {
        name: /s'inscrire/i,
      }),
    );

    expect(mockPush).toHaveBeenCalledWith("/connexion");
  });

  // TEST DE CONNEXION AVEC DONNEES INVALIDES
  it("affiche le message lorsque l'API renvoie une erreur", async () => {
    const user = userEvent.setup();

    mockedPostRequest.mockRejectedValue({
      message: "Une erreur est survenue lors de l'enregistrement",
    });

    render(<Inscription />);
    await user.type(screen.getByLabelText("Nom"), "dupont");
    await user.type(screen.getByLabelText("Prénom"), "jean");
    await user.type(screen.getByLabelText("Email"), "jean@example.com");
    await user.type(screen.getByLabelText("Mot de passe"), "P@ssword1234");
    await user.click(
      screen.getByLabelText(
        /j'accepte les conditions générales d'utilisation/i,
      ),
    );

    await user.click(
      screen.getByRole("button", {
        name: /s'inscrire/i,
      }),
    );

    const apiError = await screen.findByText(
      "Une erreur est survenue lors de l'enregistrement",
    );
    expect(apiError).toBeInTheDocument();
    expect(apiError).toHaveAttribute("role", "alert");
  });
});
