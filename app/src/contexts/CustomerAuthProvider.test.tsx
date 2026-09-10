import { describe, expect, it, afterAll, afterEach, beforeAll } from "vitest";
import { useContext } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import CustomerAuthProvider from "./CustomerAuthProvider";
import { CustomerAuthContext } from "./customerAuth";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function Harness() {
  const value = useContext(CustomerAuthContext);

  if (!value) {
    return null;
  }

  const { customer, isAuthenticated, ready, login, logout } = value;

  return (
    <div>
      <span data-testid="ready">{String(ready)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="email">{customer?.email ?? "none"}</span>
      <button onClick={() => login({ id: 7, first_name: "Plain", last_name: "Customer", email: "plain@test.com" })}>
        log in
      </button>
      <button onClick={() => logout()}>log out</button>
    </div>
  );
}

describe("CustomerAuthProvider", () => {
  it("treats an unauthenticated user as not logged in", async () => {
    server.use(
      http.get("/auth/customer/me", () =>
        HttpResponse.json({ message: "Not authenticated" }, { status: 401 })
      )
    );

    render(
      <CustomerAuthProvider>
        <Harness />
      </CustomerAuthProvider>
    );

    expect(screen.getByTestId("ready")).toHaveTextContent("false");

    await waitFor(() =>
      expect(screen.getByTestId("ready")).toHaveTextContent("true")
    );
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("email")).toHaveTextContent("none");
  });

  it("loads the logged-in customer on mount", async () => {
    server.use(
      http.get("/auth/customer/me", () =>
        HttpResponse.json({
          customer: {
            id: 1,
            first_name: "One",
            last_name: "Customer",
            email: "one@test.com",
          },
        })
      )
    );

    render(
      <CustomerAuthProvider>
        <Harness />
      </CustomerAuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true")
    );
    expect(screen.getByTestId("email")).toHaveTextContent("one@test.com");
  });

  it("logs in and logs out", async () => {
    server.use(
      http.get("/auth/customer/me", () => HttpResponse.json({ customer: null }))
    );
    server.use(
      http.post("/auth/customer/logout", () =>
        HttpResponse.json({ message: "Logged out" })
      )
    );

    const user = userEvent.setup();
    render(
      <CustomerAuthProvider>
        <Harness />
      </CustomerAuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("ready")).toHaveTextContent("true")
    );

    await user.click(screen.getByRole("button", { name: "log in" }));
    expect(screen.getByTestId("email")).toHaveTextContent("plain@test.com");

    await user.click(screen.getByRole("button", { name: "log out" }));
    await waitFor(() =>
      expect(screen.getByTestId("email")).toHaveTextContent("none")
    );
  });
});