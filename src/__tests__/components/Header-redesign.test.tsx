import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/Header";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} data-testid="next-image" />
  ),
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: () =>
    Promise.resolve({
      user: { id: "test", name: "Test User", image: null },
    }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

describe("Header - Active States", () => {
  it("renders logo and brand name", async () => {
    render(await Header());
    
    expect(screen.getByText("LitList")).toBeInTheDocument();
  });

  it("renders navigation links for authenticated user", async () => {
    render(await Header());
    
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("My Lists")).toBeInTheDocument();
    expect(screen.getByText("Import")).toBeInTheDocument();
    expect(screen.getByText("Goals")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("nav links have hover states", async () => {
    render(await Header());
    
    const searchLink = screen.getByText("Search").closest("a");
    expect(searchLink?.className).toContain("hover:text-foreground");
    expect(searchLink?.className).toContain("hover:bg-muted");
  });

  it("sign out button has hover:text-destructive styling", async () => {
    render(await Header());
    
    const signOutButton = screen.getByText("Sign out").closest("button");
    expect(signOutButton?.className).toContain("hover:text-destructive");
    expect(signOutButton?.className).toContain("hover:bg-destructive/10");
  });

  it("header nav has backdrop blur for glass effect", async () => {
    render(await Header());
    
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("backdrop-blur-md");
  });

  it("header has rounded corners", async () => {
    render(await Header());
    
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("rounded-2xl");
  });
});
