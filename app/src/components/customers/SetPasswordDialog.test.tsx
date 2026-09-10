import { describe, expect, it, afterAll, afterEach, beforeAll, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import SetPasswordDialog from "./SetPasswordDialog";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

const customer = {
  id: 1,
  first_name: "One",
  last_name: "Customer",
  email: "one@test.com",
  phone: "1",
};

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <SetPasswordDialog customer={customer} />
    </QueryClientProvider>
  );
}

function mockPasswordStatus(hasPassword: boolean) {
  server.use(
    http.get("/api/customers/1/password-status", () =>
      HttpResponse.json({
        has_password: hasPassword,
        email: customer.email,
      })
    )
  );
}

describe("SetPasswordDialog", () => {
  it("shows the current password status as not set", async () => {
    mockPasswordStatus(false);

    renderWithProviders();
    await userEvent.setup().click(
      screen.getByRole("button", { name: /set password/i })
    );

    expect(
      await screen.findByText("Not set yet")
    ).toBeInTheDocument();
    expect(screen.getByText("Set Portal Password")).toBeInTheDocument();
  });

  it("shows the current password status as set", async () => {
    mockPasswordStatus(true);

    renderWithProviders();
    await userEvent.setup().click(
      screen.getByRole("button", { name: /set password/i })
    );

    expect(await screen.findByText("Set")).toBeInTheDocument();
  });

  it("rejects a password shorter than 6 characters", async () => {
    mockPasswordStatus(false);

    const user = userEvent.setup();
    renderWithProviders();
    await user.click(screen.getByRole("button", { name: /set password/i }));

    const input = await screen.findByLabelText("New password");
    await user.type(input, "abc");

    await user.click(
      screen.getByRole("button", { name: "Set Password" })
    );

    expect(
      await screen.findByText("Password must be at least 6 characters.")
    ).toBeInTheDocument();
  });

  it("saves a new password and reveals it once", async () => {
    mockPasswordStatus(false);
    server.use(
      http.put(
        "/api/customers/1/password",
        () =>
          HttpResponse.json({
            message: "Password updated",
          }),
        { once: true }
      )
    );

    const user = userEvent.setup();
    renderWithProviders();
    await user.click(screen.getByRole("button", { name: /set password/i }));

    const input = await screen.findByLabelText("New password");
    await user.type(input, "portal-pw-123");

    await user.click(
      screen.getByRole("button", { name: "Set Password" })
    );

    expect(await screen.findByText("Password saved.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("one@test.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("portal-pw-123")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy password" })
    ).toBeInTheDocument();
  });

  it("generates a 12-character password", async () => {
    mockPasswordStatus(false);

    const user = userEvent.setup();
    renderWithProviders();
    await user.click(screen.getByRole("button", { name: /set password/i }));

    const input = (await screen.findByLabelText(
      "New password"
    )) as HTMLInputElement;

    await user.click(
      screen.getByRole("button", { name: /generate password/i })
    );

    expect(input.value).toHaveLength(12);
    expect(input.type).toBe("text");
  });

  it("surfaces a server error while saving", async () => {
    mockPasswordStatus(false);
    server.use(
      http.put(
        "/api/customers/1/password",
        () =>
          HttpResponse.json(
            { message: "Password is too weak" },
            { status: 400 }
          ),
        { once: true }
      )
    );

    const user = userEvent.setup();
    renderWithProviders();
    await user.click(screen.getByRole("button", { name: /set password/i }));

    const input = await screen.findByLabelText("New password");
    await user.type(input, "good-enough-1");

    await user.click(
      screen.getByRole("button", { name: "Set Password" })
    );

    await waitFor(() =>
      expect(screen.getByText("Password is too weak")).toBeInTheDocument()
    );
  });
});