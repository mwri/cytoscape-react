import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { type ReactNode } from "react";

import type cytoscape from "cytoscape";

import { Edge, Graph, Node, type CytoscapeReactChildProps } from "../src/index";
import { injectChildProps, normaliseClasses } from "../src/utils";

const cytoscapeUse = vi.hoisted(() => vi.fn());
const createdCores = vi.hoisted((): FakeCore[] => []);

interface FakeElementDefinition {
  classes?: string;
  data: {
    dom?: HTMLElement;
    id: string;
    source?: string;
    target?: string;
    [key: string]: unknown;
  };
  grabbable?: boolean;
  locked?: boolean;
  position?: cytoscape.Position;
  renderedPosition?: cytoscape.Position;
  selectable?: boolean;
  selected?: boolean;
}

type NodeEventHandler = (event: { target: FakeElement }) => void;

class FakeElement {
  public removed = false;

  public constructor(
    private readonly core: FakeCore,
    public readonly definition: FakeElementDefinition,
    public readonly group: "nodes" | "edges",
  ) {}

  public empty(): boolean {
    return this.removed;
  }

  public remove(): void {
    if (this.removed) {
      return;
    }

    this.removed = true;
    this.core.removeElement(this);
  }

  public data(nextData?: Record<string, unknown>): Record<string, unknown> | this {
    if (nextData) {
      this.definition.data = {
        ...this.definition.data,
        ...nextData,
      };
      return this;
    }

    return this.definition.data;
  }

  public classes(nextClasses?: string): string | this {
    if (nextClasses !== undefined) {
      this.definition.classes = nextClasses;
      return this;
    }

    return this.definition.classes ?? "";
  }

  public id(): string {
    return this.definition.data.id;
  }
}

class MissingElement extends FakeElement {
  public constructor(core: FakeCore, id: string) {
    super(core, { data: { id } }, "nodes");
    this.removed = true;
  }

  public override empty(): boolean {
    return true;
  }

  public override remove(): void {
    return undefined;
  }
}

class FakeCore {
  public readonly elementsById = new Map<string, FakeElement>();
  public readonly fit = vi.fn();
  public readonly resize = vi.fn();
  public readonly destroy = vi.fn(() => {
    this.isDestroyed = true;
  });
  public readonly renderer = {
    destroy: vi.fn(),
  };
  public readonly layoutRun = vi.fn();
  public readonly layoutStop = vi.fn();
  public readonly layout = vi.fn((options: cytoscape.LayoutOptions) => {
    this.lastLayoutOptions = options;
    return {
      run: this.layoutRun,
      stop: this.layoutStop,
    };
  });
  public readonly domNode = vi.fn(() => this.renderer);
  public lastLayoutOptions: cytoscape.LayoutOptions | undefined;
  public options: cytoscape.CytoscapeOptions;

  private isDestroyed = false;
  private readonly nodeHandlers = new Map<string, Set<NodeEventHandler>>();

  public constructor(options: cytoscape.CytoscapeOptions = {}) {
    this.options = options;
  }

  public add(definition: FakeElementDefinition): FakeElement {
    const group = definition.data.source ? "edges" : "nodes";
    const element = new FakeElement(this, definition, group);

    this.elementsById.set(definition.data.id, element);

    if (group === "nodes") {
      this.emitNodeEvent("add", element);
    }

    return element;
  }

  public destroyed(): boolean {
    return this.isDestroyed;
  }

  public elements(): { empty: () => boolean } {
    return {
      empty: () => this.elementsById.size === 0,
    };
  }

  public getElementById(id: string): FakeElement {
    return this.elementsById.get(id) ?? new MissingElement(this, id);
  }

  public on(events: string, selector: string, handler: NodeEventHandler): void {
    if (selector !== "node") {
      return;
    }

    for (const eventName of events.split(" ")) {
      const handlers = this.nodeHandlers.get(eventName) ?? new Set<NodeEventHandler>();
      handlers.add(handler);
      this.nodeHandlers.set(eventName, handlers);
    }
  }

  public off(events: string, selector: string, handler: NodeEventHandler): void {
    if (selector !== "node") {
      return;
    }

    for (const eventName of events.split(" ")) {
      this.nodeHandlers.get(eventName)?.delete(handler);
    }
  }

  public removeElement(element: FakeElement): void {
    this.elementsById.delete(element.id());

    if (element.group === "nodes") {
      this.emitNodeEvent("remove", element);
    }
  }

  private emitNodeEvent(eventName: string, element: FakeElement): void {
    for (const handler of this.nodeHandlers.get(eventName) ?? []) {
      handler({ target: element });
    }
  }
}

vi.mock("cytoscape", () => {
  const cytoscapeFactory = vi.fn((options?: cytoscape.CytoscapeOptions) => {
    const core = new FakeCore(options);
    createdCores.push(core);
    return core;
  });

  return {
    default: Object.assign(cytoscapeFactory, {
      use: cytoscapeUse,
    }),
  };
});

vi.mock("cytoscape-dom-node", () => ({
  default: vi.fn(),
}));

function latestCore(): FakeCore {
  const core = createdCores.at(-1);

  if (!core) {
    throw new Error("Expected a fake Cytoscape core to have been created.");
  }

  return core;
}

function resizeObserverInstances(): { trigger: (target: Element) => void }[] {
  return (
    (
      globalThis as typeof globalThis & {
        __cytoscapeReactResizeObserverInstances?: {
          trigger: (target: Element) => void;
        }[];
      }
    ).__cytoscapeReactResizeObserverInstances ?? []
  );
}

function ChildProbe({ cytoInstance, layout }: CytoscapeReactChildProps): ReactNode {
  return (
    <button onClick={layout} type="button">
      {cytoInstance ? "ready" : "missing"}
    </button>
  );
}

beforeEach(() => {
  createdCores.length = 0;
  cytoscapeUse.mockClear();
});

afterEach(() => {
  cleanup();
});

it("initialises and cleans up a Cytoscape graph", async () => {
  const onReady = vi.fn();
  const { unmount } = render(
    <Graph
      cyParams={{ minZoom: 0.25 }}
      domNodeOptions={{ interactiveSelector: false }}
      layoutParams={{ name: "grid" }}
      onReady={onReady}
    >
      <ChildProbe />
    </Graph>,
  );

  await screen.findByRole("button", { name: "ready" });

  const core = latestCore();
  const cytoscapeContainer = core.options.container;

  if (!cytoscapeContainer) {
    throw new Error("Expected Graph to pass a Cytoscape container.");
  }

  const container = cytoscapeContainer.parentElement;

  if (!container) {
    throw new Error("Expected Graph to render an outer container.");
  }

  expect(cytoscapeUse).toHaveBeenCalledTimes(1);
  expect(core.options.minZoom).toBe(0.25);
  expect(cytoscapeContainer).toHaveClass("cytoscape-react-cytoscape-container");
  expect(container).toHaveClass("cytoscape-react-cy-container");
  expect(core.domNode).toHaveBeenCalledWith({
    domContainer: expect.any(HTMLDivElement),
    interactiveSelector: false,
  });
  expect(onReady).toHaveBeenCalledWith(core, core.renderer);

  Object.defineProperty(container, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      bottom: 0,
      height: 0,
      left: 0,
      right: 400,
      top: 0,
      width: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });
  resizeObserverInstances().at(-1)?.trigger(container);

  await waitFor(() => {
    expect(container.style.height).toBe("200px");
    expect(core.resize).toHaveBeenCalledTimes(1);
    expect(core.fit).toHaveBeenCalledTimes(1);
  });

  unmount();

  expect(core.renderer.destroy).toHaveBeenCalledTimes(1);
  expect(core.destroy).toHaveBeenCalledTimes(1);
});

it("creates and removes DOM-backed Cytoscape nodes", () => {
  const core = new FakeCore();
  const layout = vi.fn();
  const { rerender, unmount } = render(
    <Node
      classes={["primary", "selected"]}
      cytoInstance={core as unknown as cytoscape.Core}
      data={{ label: "Alpha" }}
      id="alpha"
      layout={layout}
      position={{ x: 10, y: 20 }}
    >
      <ChildProbe />
    </Node>,
  );

  const firstNode = core.getElementById("alpha");

  expect(firstNode.empty()).toBe(false);
  expect(firstNode.definition.classes).toBe("primary selected");
  expect(firstNode.definition.data.label).toBe("Alpha");
  expect(firstNode.definition.data.dom).toBeInstanceOf(HTMLDivElement);
  expect(firstNode.definition.position).toEqual({ x: 10, y: 20 });
  expect(screen.getByRole("button", { name: "ready" })).toBeInTheDocument();

  rerender(
    <Node cytoInstance={core as unknown as cytoscape.Core} id="beta" layout={layout}>
      <span>Beta</span>
    </Node>,
  );

  expect(core.getElementById("alpha").empty()).toBe(true);
  expect(core.getElementById("beta").empty()).toBe(false);

  unmount();

  expect(core.getElementById("beta").empty()).toBe(true);
  expect(layout).toHaveBeenCalled();
});

it("passes through optional node definition fields and replaces existing nodes", () => {
  const core = new FakeCore();
  const previousNode = core.add({ data: { id: "alpha" } });

  render(
    <Node
      cytoInstance={core as unknown as cytoscape.Core}
      grabbable={false}
      id="alpha"
      locked
      renderedPosition={{ x: 30, y: 40 }}
      selectable={false}
      selected
    >
      Alpha
    </Node>,
  );

  const currentNode = core.getElementById("alpha");

  expect(previousNode.empty()).toBe(true);
  expect(currentNode.definition.grabbable).toBe(false);
  expect(currentNode.definition.locked).toBe(true);
  expect(currentNode.definition.renderedPosition).toEqual({ x: 30, y: 40 });
  expect(currentNode.definition.selectable).toBe(false);
  expect(currentNode.definition.selected).toBe(true);
});

it("renders node content without a Cytoscape instance", () => {
  render(<Node id="alpha">Alpha</Node>);

  expect(screen.getByText("Alpha")).toBeInTheDocument();
});

it("creates edges only after both endpoint nodes exist", async () => {
  const core = new FakeCore();
  const layout = vi.fn();

  render(
    <Edge
      classes="critical"
      cytoInstance={core as unknown as cytoscape.Core}
      data={{ weight: 7 }}
      id="alpha-beta"
      layout={layout}
      source="alpha"
      target="beta"
    >
      <ChildProbe />
    </Edge>,
  );

  expect(core.getElementById("alpha-beta").empty()).toBe(true);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();

  core.add({ data: { id: "alpha" } });
  expect(core.getElementById("alpha-beta").empty()).toBe(true);

  core.add({ data: { id: "beta" } });

  await waitFor(() => {
    expect(core.getElementById("alpha-beta").empty()).toBe(false);
  });

  const edge = core.getElementById("alpha-beta");
  expect(edge.definition.classes).toBe("critical");
  expect(edge.definition.data.weight).toBe(7);
  expect(screen.getByRole("button", { name: "ready" })).toBeInTheDocument();

  core.add({ data: { id: "gamma" } });
  expect(edge.definition.data.weight).toBe(7);

  core.getElementById("alpha").remove();

  await waitFor(() => {
    expect(core.getElementById("alpha-beta").empty()).toBe(true);
  });
});

it("removes existing edges when endpoints are missing", () => {
  const core = new FakeCore();
  const existingEdge = core.add({
    data: {
      id: "alpha-beta",
      source: "alpha",
      target: "beta",
    },
  });

  render(
    <Edge
      cytoInstance={core as unknown as cytoscape.Core}
      id="alpha-beta"
      source="alpha"
      target="beta"
    />,
  );

  expect(existingEdge.empty()).toBe(true);
});

it("renders no edge content without a Cytoscape instance", () => {
  render(
    <Edge id="alpha-beta" source="alpha" target="beta">
      Edge content
    </Edge>,
  );

  expect(screen.queryByText("Edge content")).not.toBeInTheDocument();
});

it("updates existing edge data and classes when props change", async () => {
  const core = new FakeCore();
  core.add({ data: { id: "alpha" } });
  core.add({ data: { id: "beta" } });

  const { rerender } = render(
    <Edge
      classes="initial"
      cytoInstance={core as unknown as cytoscape.Core}
      data={{ weight: 1 }}
      id="alpha-beta"
      source="alpha"
      target="beta"
    />,
  );

  await waitFor(() => {
    expect(core.getElementById("alpha-beta").empty()).toBe(false);
  });

  rerender(
    <Edge
      classes={["updated"]}
      cytoInstance={core as unknown as cytoscape.Core}
      data={{ weight: 2 }}
      id="alpha-beta"
      source="alpha"
      target="beta"
    />,
  );

  const edge = core.getElementById("alpha-beta");
  expect(edge.definition.classes).toBe("updated");
  expect(edge.definition.data.weight).toBe(2);
});

it("runs debounced layouts for graph children", async () => {
  render(
    <Graph layoutDebounce={0} layoutParams={{ name: "circle" }}>
      <Node id="alpha">Alpha</Node>
      <Node id="beta">Beta</Node>
      <Edge id="alpha-beta" source="alpha" target="beta" />
    </Graph>,
  );

  const core = latestCore();

  await waitFor(() => {
    expect(core.layoutRun).toHaveBeenCalled();
  });
  expect(core.lastLayoutOptions).toEqual({ name: "circle" });
});

it("normalises classes and injects compatibility props", () => {
  expect(normaliseClasses("one two")).toBe("one two");
  expect(normaliseClasses(["one", "two"])).toBe("one two");
  expect(normaliseClasses()).toBeUndefined();

  const cytoInstance = new FakeCore() as unknown as cytoscape.Core;
  const layout = vi.fn();
  const children = injectChildProps(<ChildProbe />, {
    cytoInstance,
    layout,
  });
  const primitiveChildren = injectChildProps("plain", {
    cytoInstance,
    layout,
  });

  render(<>{children}</>);

  screen.getByRole("button", { name: "ready" }).click();

  expect(layout).toHaveBeenCalledTimes(1);
  expect(primitiveChildren).toEqual(["plain"]);
});
