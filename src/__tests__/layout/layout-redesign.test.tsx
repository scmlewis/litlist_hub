import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const layoutPath = path.resolve(process.cwd(), "src/app/layout.tsx");
const layoutContent = fs.readFileSync(layoutPath, "utf-8");

const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
const cssContent = fs.readFileSync(cssPath, "utf-8");

describe("Root Layout - Accessibility & SEO", () => {
  it("layout contains skip-to-content link", () => {
    expect(layoutContent).toContain('href="#main-content"');
    expect(layoutContent).toContain("Skip to content");
  });

  it("skip-to-content link is visually hidden with sr-only", () => {
    expect(layoutContent).toContain("sr-only");
    expect(layoutContent).toContain("focus:not-sr-only");
  });

  it("main element has id for skip-to-content target", () => {
    expect(layoutContent).toContain('id="main-content"');
  });

  it("body has grain-overlay class for texture", () => {
    expect(layoutContent).toContain("grain-overlay");
  });

  it("html has dark class for dark mode", () => {
    expect(layoutContent).toContain('className="dark"');
  });

  it("includes Outfit font in head", () => {
    expect(layoutContent).toContain("Outfit");
    expect(layoutContent).not.toContain("Inter:wght");
  });

  it("includes Open Graph meta tags", () => {
    expect(layoutContent).toContain("openGraph");
    expect(layoutContent).toContain("LitList Hub - Track Your Reading");
    expect(layoutContent).toContain('type: "website"');
  });

  it("includes Twitter Card meta tags", () => {
    expect(layoutContent).toContain("twitter");
    expect(layoutContent).toContain('card: "summary_large_image"');
  });

  it("grain-overlay uses pointer-events: none", () => {
    expect(cssContent).toContain(".grain-overlay::before");
    expect(cssContent).toContain("pointer-events: none");
  });

  it("grain-overlay has low opacity for subtlety", () => {
    expect(cssContent).toContain("opacity: 0.03");
  });

  it("mesh gradient uses warm copper/bronze colors", () => {
    expect(cssContent).toContain("--gradient-mesh:");
    expect(cssContent).toContain("rgba(139, 90, 43, 0.18)");
    expect(cssContent).toContain("rgba(112, 66, 20, 0.12)");
  });

  it("skip-to-content link has focus styles for keyboard navigation", () => {
    expect(layoutContent).toContain("focus:z-[100]");
    expect(layoutContent).toContain("focus:bg-primary");
    expect(layoutContent).toContain("focus:text-primary-foreground");
  });
});
