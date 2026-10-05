import { renderHook, act, waitFor } from "@testing-library/react";
import Cookies from "js-cookie";

import { FavoritesProvider, useFavorites } from "./FavoritesContext";

import { useAuth } from "./AuthContext";
import getRequest from "@/app/utils/getRequest";
import type { Property } from "../types/types";

jest.mock("./AuthContext");
jest.mock("@/app/utils/getRequest");
jest.mock("js-cookie");

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedGetRequest = getRequest as jest.MockedFunction<typeof getRequest>;
const mockedCookies = Cookies.get as jest.Mock;

describe("FavoritesContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    mockedCookies.mockReturnValue("fake-token");

    mockedUseAuth.mockReturnValue({
      user: {
        id: 44,
        name: "Test User",
        email: "test@example.com",
        picture: "",
        role: "client",
      },
      login: jest.fn(),
      updateUser: jest.fn(),
      logout: jest.fn(),
    });

    mockedGetRequest.mockResolvedValue([]);
  });

  it("ajoute un favori dans le Context et le localStorage", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoritesProvider>{children}</FavoritesProvider>
    );

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => {
      expect(result.current.favoriteIds).toEqual([]);
    });

    act(() => {
      result.current.addFavorite("property-1");
    });

    expect(result.current.favoriteIds).toEqual(["property-1"]);

    expect(localStorage.getItem("favorites_44")).toBe(
      JSON.stringify(["property-1"]),
    );
  });

  it("supprime un favori du Context et du localStorage", async () => {
    localStorage.setItem(
      "favorites_44",
      JSON.stringify(["property-1", "property-2"]),
    );
    mockedGetRequest.mockResolvedValue([
      { id: "property-1" },
      { id: "property-2" },
    ] as Property[]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoritesProvider>{children}</FavoritesProvider>
    );

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => {
      expect(result.current.favoriteIds).toEqual(["property-1", "property-2"]);
    });

    act(() => {
      result.current.removeFavorite("property-1");
    });

    expect(result.current.favoriteIds).toEqual(["property-2"]);

    expect(localStorage.getItem("favorites_44")).toBe(
      JSON.stringify(["property-2"]),
    );
  });

  it("supprime tous les favoris du Context et du localStorage", async () => {
    localStorage.setItem(
      "favorites_44",
      JSON.stringify(["property-1", "property-2"]),
    );

    mockedGetRequest.mockResolvedValue([
      { id: "property-1" },
      { id: "property-2" },
    ] as Property[]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoritesProvider>{children}</FavoritesProvider>
    );

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => {
      expect(result.current.favoriteIds).toEqual(["property-1", "property-2"]);
    });

    act(() => {
      result.current.clearFavorites();
    });

    expect(result.current.favoriteIds).toEqual([]);
    expect(localStorage.getItem("favorites_44")).toBeNull();
  });

  it("n'ajoute pas deux fois le même favori", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoritesProvider>{children}</FavoritesProvider>
    );

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => {
      expect(result.current.favoriteIds).toEqual([]);
    });

    act(() => {
      result.current.addFavorite("property-1");
      result.current.addFavorite("property-1");
    });

    expect(result.current.favoriteIds).toEqual(["property-1"]);

    expect(localStorage.getItem("favorites_44")).toBe(
      JSON.stringify(["property-1"]),
    );
  });

  it("ne modifie pas les favoris si aucun utilisateur n'est connecté", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      login: jest.fn(),
      updateUser: jest.fn(),
      logout: jest.fn(),
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FavoritesProvider>{children}</FavoritesProvider>
    );

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => {
      expect(result.current.favoriteIds).toEqual([]);
    });

    act(() => {
      result.current.addFavorite("property-1");
      result.current.removeFavorite("property-1");
      result.current.clearFavorites();
    });

    expect(result.current.favoriteIds).toEqual([]);
    expect(localStorage.getItem("favorites_44")).toBeNull();
  });
});
