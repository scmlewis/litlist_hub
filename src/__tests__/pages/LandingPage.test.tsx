import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

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

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: () =>
    Promise.resolve({
      user: { id: "test", name: "Test User", image: null },
    }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

describe("Landing Page - Design Improvements", () => {
  it("renders hero section with left-aligned layout", async () => {
    const { default: Home } = await import("@/app/page");
    render(await Home());

    const heroSection = screen.getByRole("heading", { level: 1 });
    expect(heroSection).toBeInTheDocument();
    expect(heroSection.textContent).toContain("LitList Hub");
  });

  it("hero heading has tighter letter-spacing class", async () => {
    const { default: Home } = await import("@/app/page");
    render(await Home());

    const heroHeading = screen.getByRole("heading", { level: 1 });
    expect(heroHeading.className).toContain("tracking-tighter-hero");
  });

  it("hero heading has text-balance for orphan prevention", async () => {
    const { default: Home } = await import("@/app/page");
    render(await Home());

    const heroHeading = screen.getByRole("heading", { level: 1 });
    expect(heroHeading.className).toContain("text-balance");
  });

  it("hero subtitle has text-balance", async () => {
    const { default: Home } = await import("@/app/page");
    render(await Home());

    const subtitle = screen.getByText(/Your personal reading companion/);
    expect(subtitle.className).toContain("text-balance");
  });

  it("hero section has mesh gradient background", async () => {
    const { default: Home } = await import("@/app/page");
    const { container } = render(await Home());

    const meshGradient = container.querySelector(".bg-mesh");
    expect(meshGradient).toBeInTheDocument();
  });

  it("hero section is left-aligned, not centered", async () => {
    const { default: Home } = await import("@/app/page");
    const { container } = render(await Home());

    const heroSection = container.querySelector("section");
    expect(heroSection).not.toHaveClass("text-center");
  });

  it("feature icons use warm palette colors, not blue/purple", async () => {
    const { default: Home } = await import("@/app/page");
    const { container } = render(await Home());

    // Should NOT contain blue-500 or purple-500
    const blueIcons = container.querySelectorAll("[class*='blue-500']");
    const purpleIcons = container.querySelectorAll("[class*='purple-500']");
    expect(blueIcons.length).toBe(0);
    expect(purpleIcons.length).toBe(0);

    // Should contain warm palette colors
    const primaryIcons = container.querySelectorAll("[class*='primary/15']");
    const tertiaryIcons = container.querySelectorAll("[class*='tertiary/15']");
    const accentIcons = container.querySelectorAll("[class*='accent/15']");
    expect(primaryIcons.length).toBeGreaterThan(0);
    expect(tertiaryIcons.length).toBeGreaterThan(0);
    expect(accentIcons.length).toBeGreaterThan(0);
  });

  it("features section uses 2-column grid, not 3-column", async () => {
    const { default: Home } = await import("@/app/page");
    const { container } = render(await Home());

    const featureGrid = container.querySelector(".grid");
    expect(featureGrid?.className).toContain("md:grid-cols-2");
    expect(featureGrid?.className).not.toContain("md:grid-cols-3");
  });

  it("second feature card has offset margin for zig-zag layout", async () => {
    const { default: Home } = await import("@/app/page");
    const { container } = render(await Home());

    const featureCards = container.querySelectorAll(".grid > div");
    // Second card should have md:mt-12
    expect(featureCards[1].className).toContain("md:mt-12");
  });

  it("feature headings have tighter tracking", async () => {
    const { default: Home } = await import("@/app/page");
    render(await Home());

    const featureHeading = screen.getByText("Everything you need to track your reading");
    expect(featureHeading.className).toContain("tracking-tight-section");
  });

  it("primary CTA has active:scale-[0.98] for press feedback", async () => {
    const { default: Home } = await import("@/app/page");
    render(await Home());

    const searchButton = screen.getByText("Search Books");
    expect(searchButton.className).toContain("active:scale-[0.98]");
  });

  it("secondary CTA has active:scale-[0.98] for press feedback", async () => {
    const { default: Home } = await import("@/app/page");
    render(await Home());

    const listsButton = screen.getByText("My Lists");
    expect(listsButton.className).toContain("active:scale-[0.98]");
  });
});
