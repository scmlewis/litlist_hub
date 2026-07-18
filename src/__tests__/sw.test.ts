import { describe, it, expect, vi, beforeEach } from "vitest";

// Read the service worker source
const swSource = await import("fs").then((fs) =>
  fs.default.readFileSync("public/sw.js", "utf-8")
);

// Create a minimal ServiceWorkerGlobalScope mock
function createServiceWorkerContext() {
  const caches = new Map();
  const clients = { claim: vi.fn() };

  const mockCaches = {
    open: vi.fn().mockResolvedValue({
      addAll: vi.fn(),
      put: vi.fn(),
      match: vi.fn().mockResolvedValue(null),
      delete: vi.fn(),
    }),
    match: vi.fn().mockResolvedValue(null),
    keys: vi.fn().mockResolvedValue([]),
    delete: vi.fn(),
  };

  return {
    self: {
      addEventListener: vi.fn(),
      skipWaiting: vi.fn(),
      caches: mockCaches,
      clients,
    },
    caches: mockCaches,
    clients,
    fetch: vi.fn().mockResolvedValue(new Response("OK", { status: 200 })),
    Response: globalThis.Response,
    Request: globalThis.Request,
    URL: globalThis.URL,
  };
}

describe("Service Worker - Protocol Check", () => {
  let fetchHandler: (event: FetchEvent) => void;
  let context: ReturnType<typeof createServiceWorkerContext>;

  beforeEach(() => {
    vi.resetModules();
    context = createServiceWorkerContext();

    // Execute the service worker source in a mocked context
    const fn = new Function(
      "self",
      "caches",
      "clients",
      "fetch",
      "Response",
      "Request",
      "URL",
      swSource + "\n//# sourceURL=sw.js"
    );
    fn(
      context.self,
      context.caches,
      context.clients,
      context.fetch,
      context.Response,
      context.Request,
      context.URL
    );

    // Get the fetch handler
    const addEventListenerCalls = context.self.addEventListener.mock.calls;
    const fetchCall = addEventListenerCalls.find(
      (call: [string, Function]) => call[0] === "fetch"
    );
    fetchHandler = fetchCall?.[1] as (event: FetchEvent) => void;
  });

  it("registers a fetch event listener", () => {
    expect(context.self.addEventListener).toHaveBeenCalledWith(
      "fetch",
      expect.any(Function)
    );
  });

  it("skips non-GET requests", () => {
    const event = {
      request: { method: "POST", url: "https://example.com/api/data" },
      respondWith: vi.fn(),
    } as unknown as FetchEvent;

    fetchHandler(event);

    expect(event.respondWith).not.toHaveBeenCalled();
  });

  it("skips chrome-extension:// protocol", () => {
    const event = {
      request: {
        method: "GET",
        url: "chrome-extension://abc123/content.js",
      },
      respondWith: vi.fn(),
    } as unknown as FetchEvent;

    fetchHandler(event);

    expect(event.respondWith).not.toHaveBeenCalled();
  });

  it("skips edge:// protocol", () => {
    const event = {
      request: {
        method: "GET",
        url: "edge://settings/",
      },
      respondWith: vi.fn(),
    } as unknown as FetchEvent;

    fetchHandler(event);

    expect(event.respondWith).not.toHaveBeenCalled();
  });

  it("handles http:// requests", () => {
    const event = {
      request: {
        method: "GET",
        url: "http://example.com/",
        mode: "navigate",
      },
      respondWith: vi.fn(),
    } as unknown as FetchEvent;

    fetchHandler(event);

    expect(event.respondWith).toHaveBeenCalled();
  });

  it("handles https:// requests", () => {
    const event = {
      request: {
        method: "GET",
        url: "https://example.com/",
        mode: "navigate",
      },
      respondWith: vi.fn(),
    } as unknown as FetchEvent;

    fetchHandler(event);

    expect(event.respondWith).toHaveBeenCalled();
  });
});