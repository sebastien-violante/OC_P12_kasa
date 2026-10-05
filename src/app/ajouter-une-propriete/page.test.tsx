import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddProperty from "./page";
import getRequest from "../utils/getRequest";
import postRequest from "../utils/postRequest";
import getPictureUrls from "../utils/getPictureUrls";

// MOCK DES IMPORTS ///////////////////////////////////

const mockPush = jest.fn();
const mockedGetPictureUrls = jest.mocked(getPictureUrls);
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("../utils/postRequest", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../utils/getRequest", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../utils/getPictureUrls", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../utils/patchRequest", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../context/AuthContext", () => {
  const user = {
    id: 1,
    name: "John Doe",
    picture: "/pictures/profile.png",
    role: "owner",
  };

  return {
    useAuth: () => ({
      user,
      updateUser: jest.fn(),
    }),
  };
});

jest.mock("js-cookie", () => ({
  get: jest.fn(() => "fake-token"),
  set: jest.fn(),
}));

// FONCTION DE FACTORISATION ////////////////////////////
function setUpRegisterProperty() {
  const user = userEvent.setup();
  render(<AddProperty />);
  const titleInput = screen.getByLabelText(/Titre de la propriété/);
  const descriptionInput = screen.getByLabelText(/Description/);
  const postalCodeInput = screen.getByLabelText(/Code postal/);
  const locationInput = screen.getByLabelText(/Localisation/);
  const priceInput = screen.getByLabelText(/Prix par nuitée/);
  const coverInput = screen.getByLabelText(/Image de couverture/);
  const submitInput = screen.getByRole("button", {
    name: "Ajouter la propriété",
  });

  return {
    user,
    titleInput,
    descriptionInput,
    postalCodeInput,
    locationInput,
    priceInput,
    coverInput,
    submitInput,
    getPictureInput: (index: number) =>
      document.getElementById(`propertyPicture-${index}`) as HTMLInputElement,
  };
}

beforeEach(() => {
  jest.clearAllMocks();

  (getRequest as jest.Mock).mockImplementation(({ url }) => {
    if (url.includes("/tags")) return Promise.resolve(["Vue mer", "Piscine"]);
    if (url.includes("/equipments"))
      return Promise.resolve(["Wifi", "Cuisine"]);
    return Promise.resolve([]);
  });
});

// TESTS //////////////////////////////////////////////
describe("ajouter une propriété", () => {
  it("affiche le formulaire d'enregistrement", async () => {
    const {
      titleInput,
      descriptionInput,
      postalCodeInput,
      locationInput,
      priceInput,
      coverInput,
      submitInput,
    } = setUpRegisterProperty();

    expect(
      screen.getByRole("heading", { name: /Ajouter une propriété/i }),
    ).toBeInTheDocument();
    expect(titleInput).toBeInTheDocument();
    expect(descriptionInput).toBeInTheDocument();
    expect(postalCodeInput).toBeInTheDocument();
    expect(locationInput).toBeInTheDocument();
    expect(priceInput).toBeInTheDocument();
    expect(coverInput).toBeInTheDocument();
    expect(submitInput).toBeInTheDocument();

    // données chargées par les API
    expect(await screen.findByLabelText("Wifi")).toBeInTheDocument();
    expect(await screen.findByText("Vue mer")).toBeInTheDocument();
  });

  it("permet à l'utilisateur de remplir les champs obligatoires du formulaire", async () => {
    const {
      user,
      titleInput,
      descriptionInput,
      postalCodeInput,
      locationInput,
      priceInput,
      coverInput,
    } = setUpRegisterProperty();

    // Test de la valeur initiale des champs
    expect(titleInput).toHaveValue("");
    expect(descriptionInput).toHaveValue("");
    expect(postalCodeInput).toHaveValue("");
    expect(locationInput).toHaveValue("");
    expect(priceInput).toHaveValue("");
    expect(coverInput).toHaveValue("");
    const checkboxes = await screen.findAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });

    // Saisie utilisateur
    await user.type(titleInput, "ma propriété");
    await user.type(descriptionInput, "description de ma propriété");
    await user.type(postalCodeInput, "99999");
    await user.type(priceInput, "444");
    const wifiCheckbox = await screen.findByRole("checkbox", { name: /wifi/i });
    await user.click(wifiCheckbox);

    // Vérification des nouvelles valeurs des champs
    expect(titleInput).toHaveValue("ma propriété");
    expect(descriptionInput).toHaveValue("description de ma propriété");
    expect(postalCodeInput).toHaveValue("99999");
    expect(priceInput).toHaveValue("444");
    expect(wifiCheckbox).toBeChecked();
  });

  it("permet à l'utilisateur de remplir les champs obligatoires du formulaire", async () => {
    const { user } = setUpRegisterProperty();
    const fileInput = document.getElementById("coverImage") as HTMLInputElement;
    const file = new File(["contenu de l'image"], "cover.jpg", {
      type: "image/jpeg",
    });

    // Test du remplissage du champ File
    await user.upload(fileInput, file);

    // Vérification des nouvelles valeurs des champs
    expect(fileInput.files).toHaveLength(1);
    expect(fileInput.files?.[0]).toBe(file);
  });

  it("soulève des erreurs si les champs sont vides et place les inputs en aria-invalid", async () => {
    const {
      user,
      titleInput,
      descriptionInput,
      postalCodeInput,
      locationInput,
      priceInput,
      coverInput,
      submitInput,
    } = setUpRegisterProperty();

    expect(titleInput).toHaveAttribute("aria-invalid", "false");
    expect(descriptionInput).toHaveAttribute("aria-invalid", "false");
    expect(postalCodeInput).toHaveAttribute("aria-invalid", "false");
    expect(locationInput).toHaveAttribute("aria-invalid", "false");
    expect(priceInput).toHaveAttribute("aria-invalid", "false");
    expect(coverInput).toHaveAttribute("aria-invalid", "false");

    await user.click(submitInput);

    expect(titleInput).toHaveAttribute("aria-invalid", "true");
    expect(
      await screen.findByText(
        /Le titre doit comprendre au moins 3 caractères/i,
      ),
    ).toBeInTheDocument();
    expect(descriptionInput).toHaveAttribute("aria-invalid", "true");
    expect(
      await screen.findByText(
        /La description doit comprendre au moins 10 caractères/i,
      ),
    ).toBeInTheDocument();
    expect(postalCodeInput).toHaveAttribute("aria-invalid", "true");
    expect(
      await screen.findByText(/Code postal invalide/i),
    ).toBeInTheDocument();
    expect(priceInput).toHaveAttribute("aria-invalid", "true");
    expect(
      await screen.findByText(
        /Le montant de la nuitée doit être au moins de 10 euros/i,
      ),
    ).toBeInTheDocument();
    expect(coverInput).toHaveAttribute("aria-invalid", "true");
    expect(
      await screen.findByText(/Le choix d'une image est obligatoire/i),
    ).toBeInTheDocument();
  });

  it("soulève une erreur si le champ titre est trop court", async () => {
    const { user, titleInput, submitInput } = setUpRegisterProperty();

    await user.type(titleInput, "ma");
    await user.click(submitInput);

    expect(titleInput).toHaveAttribute("aria-invalid", "true");
    expect(
      await screen.findByText(
        /Le titre doit comprendre au moins 3 caractères/i,
      ),
    ).toBeInTheDocument();
  });

  it("soulève une erreur si le champ description est trop court", async () => {
    const { user, descriptionInput, submitInput } = setUpRegisterProperty();

    await user.type(descriptionInput, "descripti");
    await user.click(submitInput);

    expect(descriptionInput).toHaveAttribute("aria-invalid", "true");
    expect(
      await screen.findByText(
        /La description doit comprendre au moins 10 caractères/i,
      ),
    ).toBeInTheDocument();
  });

  it("n'accepte que les caractères numériques dans le champ code postal", async () => {
    const { user, postalCodeInput, submitInput } = setUpRegisterProperty();

    await user.type(postalCodeInput, "17abcd569");
    await user.click(submitInput);

    expect(postalCodeInput).toHaveValue("17569");
  });

  it("n'accepte que les caractères numériques dans le champ price_per_night", async () => {
    const { user, priceInput } = setUpRegisterProperty();

    await user.type(priceInput, "17oolp5");

    expect(priceInput).toHaveValue("175");
  });

  it("récupère les urls des images chargées", async () => {
    const {
      user,
      titleInput,
      descriptionInput,
      postalCodeInput,
      locationInput,
      priceInput,
      submitInput
    } = setUpRegisterProperty();

    const wifiCheckbox = await screen.findByRole("checkbox", { name: /wifi/i });

    // simule la création des champs supplémentaires image
    async function addPictures(
      user: ReturnType<typeof userEvent.setup>,
      quantity: number,
    ) {
      const addImageButton = screen.getByRole("button", {
        name: "+Ajouter une image",
      });

      for (let i = 1; i < quantity; i++) {
        await user.click(addImageButton);
      }
    }

    // Faker d'images
    const cover = new File(["cover"], "cover.jpeg", { type: "image/jpeg" });
    const picture0 = new File(["picture0"], "picture0.webp", {
      type: "image/webp",
    });
    const picture1 = new File(["picture1"], "picture1.jpeg", {
      type: "image/jpeg",
    });
    const profile = new File(["profile"], "profile.png", { type: "image/png" });

    // champs File reçevant les images
    const coverUpload = document.getElementById(
      "coverImage",
    ) as HTMLInputElement;
    const profileUpload = document.getElementById(
      "profile",
    ) as HTMLInputElement;

    await user.type(titleInput, "ma propriété");
    await user.type(descriptionInput, "description de ma propriété");
    await user.type(postalCodeInput, "75001");
    await user.type(locationInput, "Paris");
    await user.type(priceInput, "120");
    await user.click(wifiCheckbox);

    // ajout des champs images nécessaires à l'upload
    await addPictures(user, 2);
    const picture0Upload = document.getElementById(
      "propertyPicture-0",
    ) as HTMLInputElement;
    const picture1Upload = document.getElementById(
      "propertyPicture-1",
    ) as HTMLInputElement;
    // upload des images
    await user.upload(coverUpload, cover);
    await user.upload(picture0Upload, picture0);
    await user.upload(picture1Upload, picture1);
    await user.upload(profileUpload, profile);

    // recopie des noms de fichiers dans le document
    await waitFor(() => {
      expect(screen.getByDisplayValue("cover.jpeg")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue("picture0.webp")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue("picture1.jpeg")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue("profile.png")).toBeInTheDocument();
    });
    mockedGetPictureUrls.mockResolvedValue([]);
    await user.click(submitInput);

    await waitFor(() => {
      expect(mockedGetPictureUrls).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            file: cover,
            purpose: "property-cover",
          }),
          expect.objectContaining({
            file: picture0,
            purpose: "property-picture",
          }),
          expect.objectContaining({
            file: picture1,
            purpose: "property-picture",
          }),
          expect.objectContaining({
            file: profile,
            purpose: "user-picture",
          }),
        ]),
        "fake-token",
      );
    });
  });

  it("appelle postRequest avec les URLs des images récupérées", async () => {
    const {
      user,
      titleInput,
      descriptionInput,
      postalCodeInput,
      locationInput,
      priceInput,
      submitInput,
    } = setUpRegisterProperty();

    // Attendre que les équipements soient chargés
    const wifiCheckbox = await screen.findByRole("checkbox", {
      name: /wifi/i,
    });

    // Remplissage du formulaire
    await user.type(titleInput, "ma propriété");
    await user.type(descriptionInput, "description de ma propriété");
    await user.type(postalCodeInput, "75001");
    await user.type(locationInput, "Paris");
    await user.type(priceInput, "120");
    await user.click(wifiCheckbox);

    // Ajout de la cover
    const cover = new File(["cover"], "cover.jpeg", {
      type: "image/jpeg",
    });

    const coverInput = document.getElementById(
      "coverImage",
    ) as HTMLInputElement;

    await user.upload(coverInput, cover);

    // Ajout d'une image du logement
    const addImageButton = screen.getByRole("button", {
      name: "+Ajouter une image",
    });

    await user.click(addImageButton);

    const propertyPicture = new File(["picture"], "picture.jpeg", {
      type: "image/jpeg",
    });

    const pictureInput = document.getElementById(
      "propertyPicture-0",
    ) as HTMLInputElement;

    await user.upload(pictureInput, propertyPicture);

    mockedGetPictureUrls.mockResolvedValue([
      {
        url: "https://cdn.test/cover.jpeg",
        purpose: "property-cover",
      },
      {
        url: "https://cdn.test/picture.jpeg",
        purpose: "property-picture",
      },
    ]);

    (postRequest as jest.Mock).mockResolvedValue({
      data: {},
    });

    await user.click(submitInput);

    await waitFor(() => {
      expect(postRequest).toHaveBeenCalledTimes(1);
    });

    const [request] = (postRequest as jest.Mock).mock.calls[0];

    expect(request.url).toContain("/api/properties");
    expect(request.token).toBe("fake-token");

    expect(request.payload).toEqual({
      title: "Ma propriété",
      description: "Description de ma propriété",
      cover: "https://cdn.test/cover.jpeg",
      location: "Paris",
      price_per_night: 120,
      host_id: 1,
      host: {
        name: "John Doe",
        picture: "/pictures/profile.png",
      },
      pictures: ["https://cdn.test/picture.jpeg"],
      equipments: ["Wifi"],
      tags: [],
    });
  });

  it("affiche le message lorsque l'API retourne une erreur", async () => {
    const {
      user,
      titleInput,
      descriptionInput,
      postalCodeInput,
      locationInput,
      priceInput,
      submitInput,
    } = setUpRegisterProperty();

    const wifiCheckbox = await screen.findByRole("checkbox", {
      name: /wifi/i,
    });

    const cover = new File(["cover"], "cover.jpeg", {
      type: "image/jpeg",
    });

    const coverUpload = document.getElementById(
      "coverImage",
    ) as HTMLInputElement;

    // Remplissage des champs obligatoires
    await user.type(titleInput, "ma propriété");
    await user.type(descriptionInput, "description de ma propriété");
    await user.type(postalCodeInput, "75001");
    await user.type(locationInput, "Paris");
    await user.type(priceInput, "120");
    await user.click(wifiCheckbox);

    await user.upload(coverUpload, cover);

    // L'upload des images réussit
    mockedGetPictureUrls.mockResolvedValue([
      {
        url: "https://cdn.example.com/cover.jpeg",
        purpose: "property-cover",
      },
    ]);

    // Mais la création de la propriété échoue
    (postRequest as jest.Mock).mockRejectedValue({
      status: 500,
      message: "Une erreur est survenue lors de la création du logement",
    });

    await user.click(submitInput);

    const apiError = await screen.findByRole("alert");

    expect(apiError).toHaveTextContent(
      "Une erreur est survenue lors de la création du logement",
    );

    expect(postRequest).toHaveBeenCalledTimes(1);

    expect(mockPush).not.toHaveBeenCalled();
  });
});
