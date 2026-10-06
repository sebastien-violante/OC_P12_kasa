import { render, screen } from "@testing-library/react";
import Inscription from "./page";
import userEvent from "@testing-library/user-event";
import postRequest from "../utils/postRequest";

// MOCK DES IMPORTS ///////////////////////////////////
const mockPush = jest.fn();
const mockLogin = jest.fn();


jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("../utils/postRequest", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// FONCTION DE FACTORISATION ////////////////////////////
function setUpInscription() {
  const user = userEvent.setup();
  render(<Inscription />);
  const nameInput = screen.getByLabelText(/Nom/);
  const firstnameInput = screen.getByLabelText(/Prénom/);
  const emailInput = screen.getByLabelText(/Email/);
  const passwordInput = screen.getByLabelText(/Mot de passe/);
  const cguInput = screen.getByLabelText(
    /j'accepte les conditions générales d'utilisation/i,
  );
  const submitButton = screen.getByRole("button", {
    name: /S'inscrire/i,
  });
  return {
    user,
    nameInput,
    firstnameInput,
    emailInput,
    passwordInput,
    cguInput,
    submitButton,
  };
}

// TESTS //////////////////////////////////////////////

describe("inscription", () => {
  it("affiche le formulaire de connexion", () => {
    const {
      nameInput,
      firstnameInput,
      emailInput,
      passwordInput,
      cguInput,
    } = setUpInscription();

    expect(
      screen.getByRole("heading", { name: /Rejoignez la communauté Kasa/i }),
    ).toBeInTheDocument();
    expect(nameInput).toBeInTheDocument();
    expect(firstnameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(cguInput).toBeInTheDocument();
  });

  it("permet le remplissage du formulaire", async () => {
    const {
      user,
      nameInput,
      firstnameInput,
      emailInput,
      passwordInput,
      cguInput,
      submitButton,
    } = setUpInscription();

    // test des champs vides à l'affichage
    expect(nameInput).toHaveValue("");
    expect(firstnameInput).toHaveValue("");
    expect(emailInput).toHaveValue("");
    expect(passwordInput).toHaveValue("");
    expect(cguInput).not.toBeChecked();

    // saisies utilisateur
    await user.type(nameInput, "doe");
    await user.type(firstnameInput, "john");
    await user.type(emailInput, "john.doe@gmail.com");
    await user.type(passwordInput, "P@swworD123");
    await user.click(cguInput);

    // vérification de l'affichage des valeurs
    expect(nameInput).toHaveValue("doe");
    expect(firstnameInput).toHaveValue("john");
    expect(emailInput).toHaveValue("john.doe@gmail.com");
    expect(passwordInput).toHaveValue("P@swworD123");
    expect(cguInput).toBeChecked();
  });

  it("soulève des erreurs si les champs sont vides et place les inputs en aria-invalid", async () => {
    const {
      user,
      nameInput,
      firstnameInput,
      emailInput,
      passwordInput,
      cguInput,
      submitButton,
    } = setUpInscription();

    // à l'affichage, les champs sont valides
    expect(nameInput).toHaveAttribute("aria-invalid", "false");
    expect(firstnameInput).toHaveAttribute("aria-invalid", "false");
    expect(emailInput).toHaveAttribute("aria-invalid", "false");
    expect(passwordInput).toHaveAttribute("aria-invalid", "false");
    expect(cguInput).toHaveAttribute("aria-invalid", "false");

    // soumission du formulaire sans remplir de champs
    await user.click(submitButton);

    // les champs vides sont invalides
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(firstnameInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");
    expect(cguInput).toHaveAttribute("aria-invalid", "true");

    // les messages d'erreur sont affichés
    expect(
      await screen.findByText(/Le nom doit comprendre au moins 2 caractères/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Le prénom doit comprendre au moins 2 caractères/i,
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Le format de l'email est invalide/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Le mot de passe doit contenir au moins 8 caractères/i,
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Vous devez accepter les conditions avant de vous inscrire/i,
      ),
    ).toBeInTheDocument();
  });

  it("soulève une erreur si le nom n'est pas assez long", async () => {
    const { user, nameInput, submitButton } = setUpInscription();

    await user.type(nameInput, "d");
    // soumission du formulaire sans remplir de champs
    await user.click(submitButton);

    // le champ nom est invalide et affiche le message d'erreur
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(
      await screen.findByText(/Le nom doit comprendre au moins 2 caractères/i),
    ).toBeInTheDocument();
  });

  it("soulève une erreur si le nom ne comprend pas de caractères alphabétiques", async () => {
    const { user, nameInput, submitButton } = setUpInscription();

    await user.type(nameInput, "d/9");
    // soumission du formulaire sans remplir de champs
    await user.click(submitButton);

    // le champ nom est invalide et affiche le message d'erreur
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(
      await screen.findByText(
        /Le nom doit contenir des caractères alphabétiques/i,
      ),
    ).toBeInTheDocument();
  });

  it("soulève une erreur si le prénom n'est pas assez long", async () => {
    const { user, firstnameInput, submitButton } = setUpInscription();

    await user.type(firstnameInput, "j");
    // soumission du formulaire sans remplir de champs
    await user.click(submitButton);

    // le champ nom est invalide et affiche le message d'erreur
    expect(firstnameInput).toHaveAttribute("aria-invalid", "true");
    expect(
      await screen.findByText(
        /Le prénom doit comprendre au moins 2 caractères/i,
      ),
    ).toBeInTheDocument();
  });

  it("soulève une erreur si le prénom ne comprend pas de caractères alphabétiques", async () => {
    const { user, firstnameInput, submitButton } = setUpInscription();

    await user.type(firstnameInput, "j0/");
    // soumission du formulaire sans remplir de champs
    await user.click(submitButton);

    // le champ nom est invalide et affiche le message d'erreur
    expect(firstnameInput).toHaveAttribute("aria-invalid", "true");
    expect(
      await screen.findByText(
        /Le prénom doit contenir des caractères alphabétiques/i,
      ),
    ).toBeInTheDocument();
  });

  it("soulève une erreur si le format de l'email est invalide", async () => {
    const { user, emailInput, submitButton } = setUpInscription();

    await user.type(emailInput, "john.doe@");
    await user.click(submitButton);

    // le champ email est invalide et affiche le message d'erreur
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(
      await screen.findByText(/Le format de l'email est invalide/i),
    ).toBeInTheDocument();
  });

  it("appelle postRequest avec la bonne payload pour enregistrer l'utilisateur", async () => {
    const {
      user,
      nameInput,
      firstnameInput,
      emailInput,
      passwordInput,
      cguInput,
      submitButton,
    } = setUpInscription();
    const mockedPostRequest = jest.mocked(postRequest);

    await user.type(nameInput, "doe");
    await user.type(firstnameInput, "john");
    await user.type(emailInput, "john.doe@gmail.com");
    await user.type(passwordInput, "P@swworD123");
    await user.click(cguInput);
    await user.click(submitButton);

    expect(mockedPostRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("/auth/register"),
        payload: {
          name: "John Doe",
          email: "john.doe@gmail.com",
          password: "P@swworD123",
        },
      }),
    );
  });

  it("reçoit une erreur 409 comme réponse API", async () => {
    const {
      user,
      nameInput,
      firstnameInput,
      emailInput,
      passwordInput,
      cguInput,
      submitButton,
    } = setUpInscription();
    const mockedPostRequest = jest.mocked(postRequest);
    const rejectedValue = {
      status: 409,
      message: "Cet email est déjà utilisé",
    };
    mockedPostRequest.mockRejectedValue(rejectedValue);

    await user.type(nameInput, "doe");
    await user.type(firstnameInput, "john");
    await user.type(emailInput, "john.doe@gmail.com");
    await user.type(passwordInput, "P@swworD123");
    await user.click(cguInput);
    await user.click(submitButton);

    expect(
      await screen.findByText("Cet email est déjà utilisé !"),
    ).toBeInTheDocument();
  });

  it("reçoit une erreur autre que 409 comme réponse API et affiche le message", async () => {
    const {
      user,
      nameInput,
      firstnameInput,
      emailInput,
      passwordInput,
      cguInput,
      submitButton,
    } = setUpInscription();
    const mockedPostRequest = jest.mocked(postRequest);
    const rejectedValue = {
      status: 500,
      message: "Erreur serveur. Veuillez rééssayer",
    };
    mockedPostRequest.mockRejectedValue(rejectedValue);

    await user.type(nameInput, "doe");
    await user.type(firstnameInput, "john");
    await user.type(emailInput, "john.doe@gmail.com");
    await user.type(passwordInput, "P@swworD123");
    await user.click(cguInput);
    await user.click(submitButton);

    expect(
      await screen.findByText("Erreur serveur. Veuillez rééssayer"),
    ).toBeInTheDocument();
  });

  it("redirige vers la page de connexion en cas de succès de l'enregistrement", async () => {
    const {
      user,
      nameInput,
      firstnameInput,
      emailInput,
      passwordInput,
      cguInput,
      submitButton,
    } = setUpInscription();

    const mockedPostRequest = jest.mocked(postRequest);
    const resolvedValue = {
      data: {
        token: "fake-token",
        user: {
          id: 123,
          name: "John Doe",
          picture: "fake-src",
        },
      },
      success: true,
      message: "Inscription réussie",
    }
    mockedPostRequest.mockResolvedValue(resolvedValue)
    await user.type(nameInput, "doe");
    await user.type(firstnameInput, "john");
    await user.type(emailInput, "john.doe@gmail.com");
    await user.type(passwordInput, "P@swworD123");
    await user.click(cguInput);
    await user.click(submitButton);

    expect(mockPush).toHaveBeenCalledWith("/connexion");
  });
});
