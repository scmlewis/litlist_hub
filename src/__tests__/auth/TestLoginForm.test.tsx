import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestLoginForm } from "@/app/auth/signin/TestLoginForm";

// Mock next-auth/react
const mockSignIn = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe("TestLoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password inputs with default values", () => {
    render(<TestLoginForm />);
    
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("test123");
  });

  it("renders sign in button", () => {
    render(<TestLoginForm />);
    
    expect(screen.getByRole("button", { name: /sign in/i })).toBeTruthy();
  });

  it("allows changing email and password", async () => {
    const user = userEvent.setup();
    render(<TestLoginForm />);
    
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    
    await user.clear(emailInput);
    await user.type(emailInput, "new@example.com");
    
    await user.clear(passwordInput);
    await user.type(passwordInput, "newpassword");
    
    expect(emailInput).toHaveValue("new@example.com");
    expect(passwordInput).toHaveValue("newpassword");
  });

  it("calls signIn with credentials on form submit", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<TestLoginForm />);
    
    const button = screen.getByRole("button", { name: /sign in/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "test123",
        redirect: false,
      });
    });
  });

  it("redirects to home on successful login", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<TestLoginForm />);
    
    const button = screen.getByRole("button", { name: /sign in/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error message on failed login", async () => {
    mockSignIn.mockResolvedValue({ error: "CredentialsSignin" });
    const user = userEvent.setup();
    render(<TestLoginForm />);
    
    const button = screen.getByRole("button", { name: /sign in/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeTruthy();
    });
  });

  it("shows loading state while signing in", async () => {
    // Make signIn take some time
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)));
    const user = userEvent.setup();
    render(<TestLoginForm />);
    
    const button = screen.getByRole("button", { name: /sign in/i });
    await user.click(button);
    
    // Button should show loading state
    expect(screen.getByText(/signing in/i)).toBeTruthy();
  });

  it("handles network errors gracefully", async () => {
    mockSignIn.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    render(<TestLoginForm />);
    
    const button = screen.getByRole("button", { name: /sign in/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeTruthy();
    });
  });
});
