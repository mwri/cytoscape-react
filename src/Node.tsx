/**
 * React Node component.
 *
 * @packageDocumentation
 */

import { useEffect, useMemo, useRef, type ReactNode } from "react";

import type cytoscape from "cytoscape";

import {
  injectChildProps,
  normaliseClasses,
  type CytoscapeReactChildProps,
  type ElementClasses,
} from "./utils";

/**
 * Props accepted by {@link Node}.
 */
export interface NodeProps extends CytoscapeReactChildProps {
  /**
   * React content rendered inside the DOM-backed Cytoscape node.
   */
  children?: ReactNode;

  /**
   * Cytoscape classes to apply to the backing node.
   */
  classes?: ElementClasses;

  /**
   * Additional Cytoscape data fields. `id` and `dom` are supplied by this
   * component and override matching keys.
   */
  data?: Record<string, unknown>;

  /**
   * Unique Cytoscape element id.
   */
  id: string;

  /**
   * Initial model position for the Cytoscape node.
   */
  position?: cytoscape.Position;

  /**
   * Initial rendered position for the Cytoscape node.
   */
  renderedPosition?: cytoscape.Position;

  /**
   * Initial selection state.
   */
  selected?: boolean;

  /**
   * Initial locked state.
   */
  locked?: boolean;

  /**
   * Initial grabbable state.
   */
  grabbable?: boolean;

  /**
   * Initial selectable state.
   */
  selectable?: boolean;
}

/**
 * React component that creates and owns a DOM-backed Cytoscape node.
 */
export function Node({
  children,
  classes,
  cytoInstance,
  data,
  grabbable,
  id,
  layout = () => undefined,
  locked,
  position,
  renderedPosition,
  selectable,
  selected,
}: NodeProps): ReactNode {
  const domRef = useRef<HTMLDivElement>(null);
  const childProps = useMemo(
    () => ({
      cytoInstance,
      layout,
    }),
    [cytoInstance, layout],
  );

  useEffect(() => {
    const currentCy = cytoInstance;
    const domElement = domRef.current;

    if (!currentCy || !domElement) {
      return undefined;
    }

    const existingElement = currentCy.getElementById(id);
    if (!existingElement.empty()) {
      existingElement.remove();
    }

    const nodeDefinition: cytoscape.ElementDefinition = {
      data: {
        ...data,
        dom: domElement,
        id,
      },
    };
    const className = normaliseClasses(classes);

    if (className !== undefined) {
      nodeDefinition.classes = className;
    }
    if (grabbable !== undefined) {
      nodeDefinition.grabbable = grabbable;
    }
    if (locked !== undefined) {
      nodeDefinition.locked = locked;
    }
    if (position !== undefined) {
      nodeDefinition.position = position;
    }
    if (renderedPosition !== undefined) {
      nodeDefinition.renderedPosition = renderedPosition;
    }
    if (selectable !== undefined) {
      nodeDefinition.selectable = selectable;
    }
    if (selected !== undefined) {
      nodeDefinition.selected = selected;
    }

    currentCy.add(nodeDefinition);
    layout();

    return () => {
      currentCy.getElementById(id).remove();
      layout();
    };
  }, [
    classes,
    cytoInstance,
    data,
    grabbable,
    id,
    layout,
    locked,
    position,
    renderedPosition,
    selectable,
    selected,
  ]);

  return (
    <div ref={domRef} className="cytoscape-react-node">
      {injectChildProps(children, childProps)}
    </div>
  );
}

export default Node;
