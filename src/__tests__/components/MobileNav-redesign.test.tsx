import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "test", name: "Test User" } },
    status: "authenticated",
  }),
  signOut: vi.fn(),
  signIn: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/search",
  useSearchParams: () => new URLSearchParams(),
}));

describe("MobileNav - Color Consistency", () => {
  it("renders main navigation items", async () => {
    const { MobileNav } = await import("@/components/MobileNav");
    render(<MobileNav />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Lists")).toBeInTheDocument();
    expect(screen.getByText("Goals")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("active nav item uses primary color", async () => {
    const { MobileNav } = await import("@/components/MobileNav");
    render(<MobileNav />);

    // Search is active because pathname is /search
    const searchLink = screen.getByText("Search").closest("a");
    expect(searchLink?.className).toContain("text-primary");
  });

  it("inactive nav items use muted-foreground color", async () => {
    const { MobileNav } = await import("@/components/MobileNav");
    render(<MobileNav />);

    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink?.className).toContain("text-muted-foreground");
  });

  it("nav items have transition classes for smooth interaction", async () => {
    const { MobileNav } = await import("@/components/MobileNav");
    render(<MobileNav />);

    const searchLink = screen.getByText("Search").closest("a");
    expect(searchLink?.className).toContain("transition-colors");
  });
});
