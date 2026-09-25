import { render, screen } from "@testing-library/react";
import Connexion from "./page";

// MOCK DES IMPORTS ///////////////////////////////////

const mockLogin = jest.fn()

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push : jest.fn()
    })
}))

jest.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin
    })
}))

describe('connexion', () => {
    it('affichage du formulaire', () => {
        render (<Connexion/>)

        expect(
              screen.getByRole("heading", {
                name: /Heureux de vous revoir/i }),
            ).toBeInTheDocument();
})
})