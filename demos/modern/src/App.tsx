import { useCallback, useMemo, useState, type ReactNode } from "react";

import type cytoscape from "cytoscape";

import { Edge, Graph, Node } from "../../../src";
import "../../../src/index.css";

type NodeKind = "plain" | "input" | "button" | "select";
type Tone = "blue" | "green" | "red" | "amber" | "violet" | "teal";

interface DemoNode {
  id: string;
  kind: NodeKind;
  label: string;
  status: string;
  tone: Tone;
  position: cytoscape.Position;
}

interface DemoEdge {
  id: string;
  source: string;
  target: string;
}

interface GraphStats {
  edges: number;
  nodes: number;
  selected: string;
}

const tones: Tone[] = ["blue", "green", "red", "amber", "violet", "teal"];
const kinds: NodeKind[] = ["plain", "input", "button", "select"];

const initialNodes: DemoNode[] = [
  {
    id: "roadmap",
    kind: "plain",
    label: "Roadmap",
    position: { x: 0, y: 0 },
    status: "Planning",
    tone: "blue",
  },
  {
    id: "design",
    kind: "input",
    label: "Design",
    position: { x: 210, y: -90 },
    status: "Editing",
    tone: "green",
  },
  {
    id: "build",
    kind: "button",
    label: "Build",
    position: { x: 235, y: 100 },
    status: "Active",
    tone: "red",
  },
  {
    id: "release",
    kind: "select",
    label: "Release",
    position: { x: 470, y: 0 },
    status: "Queued",
    tone: "amber",
  },
];

const initialEdges: DemoEdge[] = [
  { id: "roadmap-design", source: "roadmap", target: "design" },
  { id: "roadmap-build", source: "roadmap", target: "build" },
  { id: "design-release", source: "design", target: "release" },
  { id: "build-release", source: "build", target: "release" },
];

export function DemoApp(): ReactNode {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [nextNodeIndex, setNextNodeIndex] = useState(initialNodes.length + 1);
  const [graphStats, setGraphStats] = useState<GraphStats>({
    edges: 0,
    nodes: 0,
    selected: "None",
  });

  const updateStats = useCallback((cy: cytoscape.Core): void => {
    setGraphStats({
      edges: cy.edges().length,
      nodes: cy.nodes().length,
      selected: cy.nodes(":selected")[0]?.id() ?? "None",
    });
  }, []);

  const handleReady = useCallback(
    (cy: cytoscape.Core): void => {
      updateStats(cy);
      cy.on("add remove select unselect", () => {
        updateStats(cy);
      });
    },
    [updateStats],
  );

  const selectedNodeId = graphStats.selected === "None" ? null : graphStats.selected;

  const addNode = (): void => {
    const parentId = selectedNodeId ?? nodes.at(-1)?.id;
    const parentNode = nodes.find((node) => node.id === parentId) ?? nodes.at(-1);
    const id = `node-${String(nextNodeIndex)}`;
    const index = nextNodeIndex;
    const angle = index * 0.8;
    const parentPosition = parentNode?.position ?? { x: 0, y: 0 };
    const position = {
      x: parentPosition.x + Math.cos(angle) * 220,
      y: parentPosition.y + Math.sin(angle) * 150,
    };

    setNodes((currentNodes) => [
      ...currentNodes,
      {
        id,
        kind: kinds[index % kinds.length] ?? "plain",
        label: `Node ${String(index)}`,
        position,
        status: index % 2 === 0 ? "Active" : "Queued",
        tone: tones[index % tones.length] ?? "blue",
      },
    ]);
    if (parentNode) {
      setEdges((currentEdges) => [
        ...currentEdges,
        {
          id: `${parentNode.id}-${id}`,
          source: parentNode.id,
          target: id,
        },
      ]);
    }
    setNextNodeIndex((currentIndex) => currentIndex + 1);
  };

  const deleteSelectedNode = (): void => {
    if (!selectedNodeId) {
      return;
    }

    setNodes((currentNodes) =>
      currentNodes.filter((node) => node.id !== selectedNodeId),
    );
    setEdges((currentEdges) =>
      currentEdges.filter(
        (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId,
      ),
    );
  };

  const nodeCards = useMemo(
    () =>
      nodes.map((node) => (
        <Node
          classes={`node-${node.tone}`}
          data={{ label: node.label }}
          id={node.id}
          key={node.id}
          position={node.position}
        >
          <DemoNodeCard node={node} />
        </Node>
      )),
    [nodes],
  );

  const edgeElements = edges.map((edge) => (
    <Edge id={edge.id} key={edge.id} source={edge.source} target={edge.target} />
  ));

  return (
    <main className="demo-shell">
      <header className="demo-toolbar">
        <div>
          <h1>cytoscape-react</h1>
          <p>React components rendered as draggable Cytoscape nodes.</p>
        </div>
        <div className="demo-actions">
          <button onClick={addNode} type="button">
            Add node
          </button>
          <button
            className="danger"
            disabled={!selectedNodeId}
            onClick={deleteSelectedNode}
            type="button"
          >
            Delete selected
          </button>
        </div>
      </header>

      <section className="demo-workspace" aria-label="Cytoscape workspace">
        <Graph
          className="demo-graph"
          cyParams={{
            style: [
              {
                selector: "node",
                style: {
                  "background-opacity": 0,
                  label: "",
                  shape: "rectangle",
                },
              },
              {
                selector: "edge",
                style: {
                  "curve-style": "bezier",
                  "line-color": "#8aa0b8",
                  opacity: 0.75,
                  "target-arrow-color": "#8aa0b8",
                  "target-arrow-shape": "triangle",
                  width: 2,
                },
              },
            ],
          }}
          layoutDebounce={160}
          layoutParams={{
            animate: true,
            animationDuration: 420,
            fit: true,
            name: "cose",
            nodeOverlap: 20,
            padding: 80,
            randomize: false,
          }}
          onReady={handleReady}
        >
          {nodeCards}
          {edgeElements}
        </Graph>

        <aside className="demo-status" aria-label="Graph status">
          <dl>
            <div>
              <dt>Nodes</dt>
              <dd>{graphStats.nodes}</dd>
            </div>
            <div>
              <dt>Edges</dt>
              <dd>{graphStats.edges}</dd>
            </div>
            <div>
              <dt>Selected</dt>
              <dd>{graphStats.selected}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}

function DemoNodeCard({ node }: { node: DemoNode }): ReactNode {
  const [clicks, setClicks] = useState(0);

  return (
    <article className={`demo-node-card tone-${node.tone}`}>
      <header>
        <strong>{node.label}</strong>
        <span>{node.status}</span>
      </header>
      {node.kind === "plain" ? <ProgressMeter node={node} /> : null}
      {node.kind === "input" ? (
        <label className="node-control">
          Label
          <input defaultValue={`${node.label} note`} />
        </label>
      ) : null}
      {node.kind === "button" ? (
        <div className="node-controls">
          <button
            onClick={() => {
              setClicks((current) => current + 1);
            }}
            type="button"
          >
            Acknowledge
          </button>
          <output>{clicks === 1 ? "1 click" : `${String(clicks)} clicks`}</output>
        </div>
      ) : null}
      {node.kind === "select" ? (
        <label className="node-control">
          Priority
          <select defaultValue="Normal">
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
          </select>
        </label>
      ) : null}
    </article>
  );
}

function ProgressMeter({ node }: { node: DemoNode }): ReactNode {
  const value = 35 + node.id.length * 6;

  return (
    <>
      <p>{String(value)}% complete</p>
      <meter min="0" max="100" value={value} />
    </>
  );
}
