import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

describe("App", () => {
  it("affiche le message de l'API", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Bonjour depuis l'API !" }),
    } as Response);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading")).toHaveTextContent(
        "Bonjour depuis l'API !"
      );
    });
  });

  it("affiche une erreur en cas d'échec réseau", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    });
  });
});
