/**
 * React Edge component.
 *
 * @packageDocumentation
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  injectChildProps,
  normaliseClasses,
  type CytoscapeReactChildProps,
  type ElementClasses,
} from "./utils";

/**
 * Props accepted by {@link Edge}.
 */
export interface EdgeProps extends CytoscapeReactChildProps {
  /**
   * Optional React content rendered once both endpoint nodes exist.
   */
  children?: ReactNode;

  /**
   * Cytoscape classes to apply to the backing edge.
   */
  classes?: ElementClasses;

  /**
   * Additional Cytoscape data fields. `id`, `source`, and `target` are supplied
   * by this component and override matching keys.
   */
  data?: Record<string, unknown>;

  /**
   * Unique Cytoscape edge id.
   */
  id: string;

  /**
   * Source node id.
   */
  source: string;

  /**
   * Target node id.
   */
  target: string;
}

/**
 * React component that creates and owns a Cytoscape edge once both endpoints
 * are present.
 */
export function Edge({
  children,
  classes,
  cytoInstance,
  data,
  id,
  layout = () => undefined,
  source,
  target,
}: EdgeProps): ReactNode {
  const [isReady, setIsReady] = useState(false);
  const childProps = useMemo(
    () => ({
      cytoInstance,
      layout,
    }),
    [cytoInstance, layout],
  );

  const syncEdge = useCallback(() => {
    const currentCy = cytoInstance;

    if (!currentCy) {
      setIsReady(false);
      return;
    }

    const sourceNode = currentCy.getElementById(source);
    const targetNode = currentCy.getElementById(target);
    const existingEdge = currentCy.getElementById(id);
    const endpointsExist = !sourceNode.empty() && !targetNode.empty();

    if (!endpointsExist) {
      if (!existingEdge.empty()) {
        existingEdge.remove();
        layout();
      }
      setIsReady(false);
      return;
    }

    const edgeData = {
      ...data,
      id,
      source,
      target,
    };

    if (existingEdge.empty()) {
      const edgeDefinition = {
        data: edgeData,
      };
      const className = normaliseClasses(classes);

      currentCy.add(
        className === undefined
          ? edgeDefinition
          : {
              ...edgeDefinition,
              classes: className,
            },
      );
    } else {
      existingEdge.data(edgeData);
      existingEdge.classes(normaliseClasses(classes) ?? "");
    }

    setIsReady(true);
    layout();
  }, [classes, cytoInstance, data, id, layout, source, target]);

  useEffect(() => {
    const currentCy = cytoInstance;

    if (!currentCy) {
      return undefined;
    }

    const handleNodeChange = (): void => {
      syncEdge();
    };

    syncEdge();
    currentCy.on("add remove", "node", handleNodeChange);

    return () => {
      currentCy.off("add remove", "node", handleNodeChange);
      currentCy.getElementById(id).remove();
      setIsReady(false);
      layout();
    };
  }, [cytoInstance, id, layout, syncEdge]);

  if (!isReady) {
    return null;
  }

  return (
    <div className="cytoscape-react-edge">{injectChildProps(children, childProps)}</div>
  );
}

export default Edge;
