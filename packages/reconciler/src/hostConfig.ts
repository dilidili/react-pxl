import { PxlNode, PxlTextNode, PxlImageNode } from '@react-pxl/core';
import type { PxlAnyNode, PxlNodeProps, PxlTextProps, PxlImageProps } from '@react-pxl/core';
import {
  TEXT_NODE_ELEMENTS, IMAGE_ELEMENTS,
  getElementDefaults, mergeStyles,
} from '@react-pxl/core';
import { parseTailwind } from '@react-pxl/core';

type Container = {
  rootNode: PxlNode;
  onCommit: () => void;
};

type Instance = PxlAnyNode;
type TextInstance = PxlTextNode;
type Type = string;
type Props = Record<string, any>;

/** Resolve final style from element defaults + className + inline style */
function resolveProps(type: Type, props: Props): PxlNodeProps {
  const defaults = getElementDefaults(type);
  const classNameStyle = props.className ? parseTailwind(props.className) : {};
  const mergedStyle = mergeStyles(defaults, classNameStyle, props.style);

  const resolved: PxlNodeProps = { ...props, style: mergedStyle };
  // Clean up DOM-specific props that aren't PxlNode props
  delete (resolved as any).className;
  delete (resolved as any).children;
  return resolved;
}

/**
 * react-reconciler host config for react-pxl.
 * Maps React operations (create, update, delete elements) to PxlNode operations.
 *
 * Supports both custom primitives (pxl-view, View, etc.) and standard HTML
 * elements (div, span, p, h1-h6, img, button, etc.) for zero-migration usage.
 */
export const hostConfig = {
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,

  isPrimaryRenderer: true,
  noTimeout: -1,

  createInstance(
    type: Type,
    props: Props,
    _rootContainer: Container,
    _hostContext: unknown,
    _internalHandle: unknown
  ): Instance {
    // Custom react-pxl primitives
    switch (type) {
      case 'pxl-view':
      case 'View':
        return new PxlNode(props as PxlNodeProps);
      case 'pxl-text':
      case 'Text':
        return new PxlTextNode(props as PxlTextProps);
      case 'pxl-image':
      case 'Image':
        return new PxlImageNode(props as PxlImageProps);
    }

    // DOM-compatible HTML elements
    const resolved = resolveProps(type, props);

    if (IMAGE_ELEMENTS.has(type)) {
      return new PxlImageNode({
        ...resolved,
        src: props.src ?? '',
        alt: props.alt ?? '',
      } as PxlImageProps);
    }

    if (TEXT_NODE_ELEMENTS.has(type)) {
      const textContent = typeof props.children === 'string' ? props.children : '';
      return new PxlTextNode({ ...resolved, children: textContent } as PxlTextProps);
    }

    // Default: container node (div, section, nav, button, ul, ol, li, etc.)
    return new PxlNode(resolved);
  },

  createTextInstance(
    text: string,
    _rootContainer: Container,
    _hostContext: unknown,
    _internalHandle: unknown
  ): TextInstance {
    return new PxlTextNode({ children: text });
  },

  appendInitialChild(parentInstance: Instance, child: Instance): void {
    parentInstance.appendChild(child);
  },

  appendChild(parentInstance: Instance, child: Instance): void {
    parentInstance.appendChild(child);
  },

  appendChildToContainer(container: Container, child: Instance): void {
    container.rootNode.appendChild(child);
  },

  removeChild(parentInstance: Instance, child: Instance): void {
    parentInstance.removeChild(child);
  },

  removeChildFromContainer(container: Container, child: Instance): void {
    container.rootNode.removeChild(child);
  },

  insertBefore(parentInstance: Instance, child: Instance, beforeChild: Instance): void {
    parentInstance.insertBefore(child, beforeChild);
  },

  insertInContainerBefore(container: Container, child: Instance, beforeChild: Instance): void {
    container.rootNode.insertBefore(child, beforeChild);
  },

  finalizeInitialChildren(
    _instance: Instance,
    _type: Type,
    _props: Props,
    _rootContainer: Container,
    _hostContext: unknown
  ): boolean {
    return false;
  },

  prepareUpdate(
    _instance: Instance,
    _type: Type,
    oldProps: Props,
    newProps: Props,
    _rootContainer: Container,
    _hostContext: unknown
  ): Props | null {
    // Simple diff: return newProps if anything changed
    const keys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
    for (const key of keys) {
      if (key === 'children') continue;
      if (oldProps[key] !== newProps[key]) {
        return newProps;
      }
    }
    // Check style object changes
    if (oldProps.style !== newProps.style) {
      if (JSON.stringify(oldProps.style) !== JSON.stringify(newProps.style)) {
        return newProps;
      }
    }
    return null;
  },

  commitUpdate(
    instance: Instance,
    updatePayload: Props,
    type: Type,
    _oldProps: Props,
    newProps: Props,
    _internalHandle: unknown
  ): void {
    // Re-resolve props for HTML elements (className + style merge)
    const isCustom = ['pxl-view', 'View', 'pxl-text', 'Text', 'pxl-image', 'Image'].includes(type);
    if (isCustom) {
      instance.updateProps(newProps as PxlNodeProps);
    } else {
      const resolved = resolveProps(type, newProps);
      if (TEXT_NODE_ELEMENTS.has(type) && typeof newProps.children === 'string') {
        (instance as PxlTextNode).textContent = newProps.children;
      }
      if (IMAGE_ELEMENTS.has(type) && newProps.src) {
        (instance as PxlImageNode).src = newProps.src;
        (instance as PxlImageNode).alt = newProps.alt ?? '';
      }
      instance.updateProps(resolved);
    }
  },

  commitTextUpdate(
    textInstance: TextInstance,
    _oldText: string,
    newText: string
  ): void {
    textInstance.textContent = newText;
    textInstance.markDirty();
  },

  resetTextContent(_instance: Instance): void {
    // No-op for canvas renderer
  },

  shouldSetTextContent(_type: Type, props: Props): boolean {
    // For text-bearing HTML elements with string children, handle inline
    return TEXT_NODE_ELEMENTS.has(_type) && typeof props.children === 'string';
  },

  getRootHostContext(_rootContainer: Container): unknown {
    return {};
  },

  getChildHostContext(
    parentHostContext: unknown,
    _type: Type,
    _rootContainer: Container
  ): unknown {
    return parentHostContext;
  },

  getPublicInstance(instance: Instance): Instance {
    return instance;
  },

  prepareForCommit(_containerInfo: Container): Record<string, any> | null {
    return null;
  },

  resetAfterCommit(container: Container): void {
    container.onCommit();
  },

  preparePortalMount(_containerInfo: Container): void {
    // No-op
  },

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  getCurrentEventPriority: () => 0b0000000000000000000000000010000, // DefaultEventPriority
  getInstanceFromNode: () => null,
  prepareScopeUpdate: () => {},
  getInstanceFromScope: () => null,
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  detachDeletedInstance: () => {},

  clearContainer(container: Container): void {
    container.rootNode.children = [];
  },
};
