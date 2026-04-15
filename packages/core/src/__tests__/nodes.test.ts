import { describe, it, expect } from 'vitest';
import { PxlNode, PxlTextNode, PxlImageNode, resolveStyle } from '../index';

describe('PxlNode', () => {
  it('should create a node with unique id', () => {
    const a = new PxlNode();
    const b = new PxlNode();
    expect(a.id).not.toBe(b.id);
    expect(a.type).toBe('view');
  });

  it('should append and remove children', () => {
    const parent = new PxlNode();
    const child1 = new PxlNode();
    const child2 = new PxlNode();

    parent.appendChild(child1);
    parent.appendChild(child2);
    expect(parent.children).toHaveLength(2);
    expect(child1.parent).toBe(parent);

    parent.removeChild(child1);
    expect(parent.children).toHaveLength(1);
    expect(child1.parent).toBeNull();
  });

  it('should insert before a child', () => {
    const parent = new PxlNode();
    const child1 = new PxlNode();
    const child2 = new PxlNode();
    const child3 = new PxlNode();

    parent.appendChild(child1);
    parent.appendChild(child3);
    parent.insertBefore(child2, child3);

    expect(parent.children[0]).toBe(child1);
    expect(parent.children[1]).toBe(child2);
    expect(parent.children[2]).toBe(child3);
  });

  it('should mark dirty up the tree', () => {
    const root = new PxlNode();
    const child = new PxlNode();
    root.appendChild(child);

    root.dirty = false;
    child.dirty = false;

    child.markDirty();
    expect(child.dirty).toBe(true);
    expect(root.dirty).toBe(true);
  });

  it('should check containsPoint', () => {
    const node = new PxlNode();
    node.layout = { x: 10, y: 10, width: 100, height: 50 };

    expect(node.containsPoint(50, 30)).toBe(true);
    expect(node.containsPoint(5, 5)).toBe(false);
    expect(node.containsPoint(110, 60)).toBe(true);
    expect(node.containsPoint(111, 61)).toBe(false);
  });

  it('should update props and mark dirty', () => {
    const node = new PxlNode({ style: { backgroundColor: 'red' } });
    node.dirty = false;

    node.updateProps({ style: { backgroundColor: 'blue' } });
    expect(node.props.style?.backgroundColor).toBe('blue');
    expect(node.dirty).toBe(true);
  });
});

describe('PxlTextNode', () => {
  it('should create with text content', () => {
    const text = new PxlTextNode({ children: 'Hello world' });
    expect(text.type).toBe('text');
    expect(text.textContent).toBe('Hello world');
  });

  it('should build font string', () => {
    const text = new PxlTextNode({
      children: 'Test',
      style: { fontSize: 24, fontWeight: 'bold', fontFamily: 'Arial' },
    });
    expect(text.fontString).toBe('normal bold 24px Arial');
  });

  it('should use default font values', () => {
    const text = new PxlTextNode({ children: 'Default' });
    expect(text.fontSize).toBe(14);
    expect(text.fontWeight).toBe('normal');
    expect(text.color).toBe('#000000');
  });
});

describe('PxlImageNode', () => {
  it('should create with src', () => {
    const img = new PxlImageNode({ src: 'test.png' });
    expect(img.type).toBe('image');
    expect(img.src).toBe('test.png');
    expect(img.isLoaded).toBe(false);
  });

  it('should reset loading state on src change', () => {
    const img = new PxlImageNode({ src: 'a.png' });
    img.updateProps({ src: 'b.png' });
    expect(img.src).toBe('b.png');
    expect(img.isLoaded).toBe(false);
  });
});

describe('resolveStyle', () => {
  it('should expand margin shorthand', () => {
    const style = resolveStyle({ margin: 10 });
    expect(style.marginTop).toBe(10);
    expect(style.marginRight).toBe(10);
    expect(style.marginBottom).toBe(10);
    expect(style.marginLeft).toBe(10);
  });

  it('should expand padding shorthand', () => {
    const style = resolveStyle({ padding: 20 });
    expect(style.paddingTop).toBe(20);
    expect(style.paddingRight).toBe(20);
    expect(style.paddingBottom).toBe(20);
    expect(style.paddingLeft).toBe(20);
  });

  it('should expand borderRadius shorthand', () => {
    const style = resolveStyle({ borderRadius: 8 });
    expect(style.borderTopLeftRadius).toBe(8);
    expect(style.borderTopRightRadius).toBe(8);
    expect(style.borderBottomLeftRadius).toBe(8);
    expect(style.borderBottomRightRadius).toBe(8);
  });

  it('should not override explicit values with shorthands', () => {
    const style = resolveStyle({ margin: 10, marginTop: 20 });
    expect(style.marginTop).toBe(20);
    expect(style.marginRight).toBe(10);
  });

  it('should expand horizontal/vertical margin', () => {
    const style = resolveStyle({ marginHorizontal: 15, marginVertical: 25 });
    expect(style.marginLeft).toBe(15);
    expect(style.marginRight).toBe(15);
    expect(style.marginTop).toBe(25);
    expect(style.marginBottom).toBe(25);
  });
});
