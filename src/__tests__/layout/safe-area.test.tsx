import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import fs from "fs";
import path from "path";

const globalsCss = fs.readFileSync(
  path.resolve(__dirname, "../../app/globals.css"),
  "utf-8"
);

describe("Safe area CSS classes", () => {
  it("defines .main-top-safe with env(safe-area-inset-top)", () => {
    expect(globalsCss).toContain(".main-top-safe");
    expect(globalsCss).toContain("padding-top: calc(5rem + env(safe-area-inset-top, 0px))");
  });

  it("defines .main-top-safe responsive sm breakpoint", () => {
    expect(globalsCss).toContain("@media (min-width: 640px)");
    expect(globalsCss).toContain("padding-top: calc(6rem + env(safe-area-inset-top, 0px))");
  });

  it("defines .bottom-safe-offset with env(safe-area-inset-bottom)", () => {
    expect(globalsCss).toContain(".bottom-safe-offset");
    expect(globalsCss).toContain("bottom: calc(5rem + env(safe-area-inset-bottom, 0px))");
  });

  it("defines .toast-bottom-safe with env(safe-area-inset-bottom)", () => {
    expect(globalsCss).toContain(".toast-bottom-safe");
    expect(globalsCss).toContain("bottom: calc(6rem + env(safe-area-inset-bottom, 0px))");
  });

  it("retains .header-safe-top class", () => {
    expect(globalsCss).toContain(".header-safe-top");
    expect(globalsCss).toContain("padding-top: env(safe-area-inset-top, 0)");
  });

  it("retains .bottom-nav class", () => {
    expect(globalsCss).toContain(".bottom-nav");
    expect(globalsCss).toContain("padding-bottom: env(safe-area-inset-bottom, 0)");
  });
});

describe("Layout component uses safe-area classes", () => {
  it("main element has main-top-safe class instead of static pt-20", async () => {
    const layoutContent = fs.readFileSync(
      path.resolve(__dirname, "../../app/layout.tsx"),
      "utf-8"
    );

    expect(layoutContent).toContain("main-top-safe");
    expect(layoutContent).not.toMatch(/pt-20\s+sm:pt-24/);
  });
});

describe("MobileNav uses safe-area classes", () => {
  it("More menu panel uses bottom-safe-offset instead of bottom-20", async () => {
    const mobileNavContent = fs.readFileSync(
      path.resolve(__dirname, "../../components/MobileNav.tsx"),
      "utf-8"
    );

    expect(mobileNavContent).toContain("bottom-safe-offset");
    expect(mobileNavContent).not.toContain("bottom-20");
  });
});

describe("Toast uses safe-area classes", () => {
  it("Toast container uses toast-bottom-safe instead of bottom-24", async () => {
    const toastContent = fs.readFileSync(
      path.resolve(__dirname, "../../components/Toast.tsx"),
      "utf-8"
    );

    expect(toastContent).toContain("toast-bottom-safe");
    expect(toastContent).not.toContain("bottom-24");
  });
});
