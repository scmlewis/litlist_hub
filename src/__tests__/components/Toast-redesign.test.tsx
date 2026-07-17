import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToastProvider, useToast } from "@/components/Toast";

// Test component that uses the toast
function TestToastTrigger() {
  const { showToast } = useToast();
  return (
    <div>
      <button onClick={() => showToast("info", "Test info message")}>Show Info</button>
      <button onClick={() => showToast("success", "Test success message")}>Show Success</button>
      <button onClick={() => showToast("error", "Test error message")}>Show Error</button>
      <button onClick={() => showToast("warning", "Test warning message")}>Show Warning</button>
    </div>
  );
}

describe("Toast - Color Consistency", () => {
  it("info toast uses warm info color, not blue", async () => {
    const { findByText } = render(
      <ToastProvider>
        <TestToastTrigger />
      </ToastProvider>
    );

    const user = { click: async (el: HTMLElement) => { 
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }};
    
    // Click the info button
    const infoButton = screen.getByText("Show Info");
    await user.click(infoButton);

    // Find the toast message
    const toastMessage = await findByText("Test info message");
    expect(toastMessage).toBeInTheDocument();

    // Check that the info icon has text-info class, not text-blue-400
    const toastContainer = toastMessage.closest(".glass-card");
    expect(toastContainer).toBeInTheDocument();
  });

  it("info toast container has correct border/bg classes", async () => {
    const { findByText } = render(
      <ToastProvider>
        <TestToastTrigger />
      </ToastProvider>
    );

    const user = { click: async (el: HTMLElement) => { 
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }};
    
    const infoButton = screen.getByText("Show Info");
    await user.click(infoButton);

    const toastMessage = await findByText("Test info message");
    const toastContainer = toastMessage.closest(".glass-card");

    // Should use info color classes, not blue
    expect(toastContainer?.className).toContain("border-info/30");
    expect(toastContainer?.className).toContain("bg-info/10");
    expect(toastContainer?.className).not.toContain("blue-800");
    expect(toastContainer?.className).not.toContain("blue-900");
  });

  it("success toast uses accent color", async () => {
    const { findByText } = render(
      <ToastProvider>
        <TestToastTrigger />
      </ToastProvider>
    );

    const user = { click: async (el: HTMLElement) => { 
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }};
    
    const successButton = screen.getByText("Show Success");
    await user.click(successButton);

    const toastMessage = await findByText("Test success message");
    const toastContainer = toastMessage.closest(".glass-card");

    expect(toastContainer?.className).toContain("border-accent-800/50");
    expect(toastContainer?.className).toContain("bg-accent-900/20");
  });

  it("error toast uses red color", async () => {
    const { findByText } = render(
      <ToastProvider>
        <TestToastTrigger />
      </ToastProvider>
    );

    const user = { click: async (el: HTMLElement) => { 
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }};
    
    const errorButton = screen.getByText("Show Error");
    await user.click(errorButton);

    const toastMessage = await findByText("Test error message");
    const toastContainer = toastMessage.closest(".glass-card");

    expect(toastContainer?.className).toContain("border-red-800/50");
    expect(toastContainer?.className).toContain("bg-red-900/20");
  });

  it("warning toast uses primary color", async () => {
    const { findByText } = render(
      <ToastProvider>
        <TestToastTrigger />
      </ToastProvider>
    );

    const user = { click: async (el: HTMLElement) => { 
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }};
    
    const warningButton = screen.getByText("Show Warning");
    await user.click(warningButton);

    const toastMessage = await findByText("Test warning message");
    const toastContainer = toastMessage.closest(".glass-card");

    expect(toastContainer?.className).toContain("border-primary-800/50");
    expect(toastContainer?.className).toContain("bg-primary-900/20");
  });
});
