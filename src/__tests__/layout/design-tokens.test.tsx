import { describe, it, expect } from "vitest";

describe("CSS Design Tokens - Consistency", () => {
  it("globals.css defines mesh gradient variable", async () => {
    // Read the CSS file and check for the gradient definition
    const fs = await import("fs");
    const path = await import("path");
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    expect(css).toContain("--gradient-mesh:");
    expect(css).toContain("radial-gradient");
  });

  it("globals.css defines grain overlay class", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    expect(css).toContain(".grain-overlay::before");
    expect(css).toContain("pointer-events: none");
    expect(css).toContain("opacity: 0.03");
  });

  it("globals.css defines text-balance utility", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    expect(css).toContain(".text-balance");
    expect(css).toContain("text-wrap: balance");
  });

  it("globals.css defines tracking-tighter-hero utility", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    expect(css).toContain(".tracking-tighter-hero");
    expect(css).toContain("letter-spacing: -0.03em");
  });

  it("globals.css defines tracking-tight-section utility", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    expect(css).toContain(".tracking-tight-section");
    expect(css).toContain("letter-spacing: -0.02em");
  });

  it("globals.css defines bg-mesh utility", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    expect(css).toContain(".bg-mesh");
    expect(css).toContain("var(--gradient-mesh)");
  });

  it("globals.css has active states on M3 buttons", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    // Check for active states on all button variants
    expect(css).toContain(".btn-m3-filled:active");
    expect(css).toContain(".btn-m3-tonal:active");
    expect(css).toContain(".btn-m3-outlined:active");
    expect(css).toContain(".btn-m3-text:active");
  });

  it("M3 button active states use scale transform", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    // Active states should use scale for tactile feedback
    const activeFilled = css.indexOf(".btn-m3-filled:active");
    const activeFilledContent = css.substring(activeFilled, activeFilled + 200);
    expect(activeFilledContent).toContain("scale(0.98)");
  });

  it("globals.css uses Outfit font family", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    expect(css).toContain("'Outfit'");
    expect(css).not.toContain("'Inter'");
  });

  it("warm-tinted shadows are used instead of pure black", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    // Elevation shadows should use warm rgba(16, 13, 10, ...)
    expect(css).toContain("rgba(16, 13, 10, 0.4)");
    expect(css).toContain("rgba(16, 13, 10, 0.5)");
  });

  it("no pure black (#000000) in color tokens", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    // Should not have pure black
    expect(css).not.toContain("#000000");
    expect(css).not.toContain("rgb(0, 0, 0)");
  });
});
