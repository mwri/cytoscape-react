/**
 * Utils.
 *
 * @packageDocumentation
 */

import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

import type cytoscape from "cytoscape";

/**
 * Props injected into `Graph`, `Node`, and `Edge` children for compatibility
 * with earlier cytoscape-react releases.
 */
export interface CytoscapeReactChildProps {
  /**
   * Current Cytoscape core instance.
   */
  cytoInstance?: cytoscape.Core | null | undefined;

  /**
   * Request a graph layout run.
   */
  layout?: (() => void) | undefined;
}

/**
 * Class input accepted by Cytoscape element definitions.
 */
export type ElementClasses = string | readonly string[];

/**
 * Convert the historical `string[]` class prop and Cytoscape's native string
 * class form into the string Cytoscape stores internally.
 */
export function normaliseClasses(classes?: ElementClasses): string | undefined {
  if (!classes) {
    return undefined;
  }

  return typeof classes === "string" ? classes : classes.join(" ");
}

/**
 * Clone React component children with Cytoscape compatibility props. Primitive
 * and DOM children are preserved as-is.
 */
export function injectChildProps(
  children: ReactNode,
  props: CytoscapeReactChildProps,
): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child;
    }

    if (child.type === Fragment) {
      const fragment = child as ReactElement<{ children?: ReactNode }>;

      return cloneElement(
        fragment,
        undefined,
        injectChildProps(fragment.props.children, props),
      );
    }

    if (typeof child.type === "string") {
      return child;
    }

    return cloneElement(
      child as ReactElement<Partial<CytoscapeReactChildProps>>,
      props,
    );
  });
}
