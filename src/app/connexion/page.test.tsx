import { render, screen } from "@testing-library/react";
import Connexion from "./page";
import userEvent from "@testing-library/user-event";

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

describe("connexion", () => {
  it("affichage du formulaire", () => {
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

  it("soulève des erreurs si les champs sont vides", async() => {
    const user = userEvent.setup();
    render(<Connexion />);
    const submitButton = screen.getByRole("button", {
      name: /Se connecter/i
    })

    await user.click(submitButton)
    expect(await screen.findByText(/L'adresse email est requise/i)).toBeInTheDocument()
    expect(await screen.findByText(/Le mot de passe est requis/i)).toBeInTheDocument()
  })
});
