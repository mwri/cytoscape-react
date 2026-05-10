import "@testing-library/jest-dom/vitest";

class TestResizeObserver implements ResizeObserver {
  public static instances: TestResizeObserver[] = [];

  public constructor(private readonly callback: ResizeObserverCallback) {
    TestResizeObserver.instances.push(this);
  }

  public observe = vi.fn();
  public unobserve = vi.fn();
  public disconnect = vi.fn();

  public trigger(target: Element): void {
    this.callback([{ target } as ResizeObserverEntry], this);
  }
}

globalThis.ResizeObserver = TestResizeObserver;
(
  globalThis as typeof globalThis & {
    __cytoscapeReactResizeObserverInstances?: TestResizeObserver[];
  }
).__cytoscapeReactResizeObserverInstances = TestResizeObserver.instances;
