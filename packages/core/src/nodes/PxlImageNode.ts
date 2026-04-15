import { PxlNode } from './PxlNode';
import type { PxlImageProps } from './types';

/**
 * PxlImageNode represents an image element in the canvas tree.
 * Handles async image loading and drawing to canvas.
 */
export class PxlImageNode extends PxlNode {
  override readonly type = 'image' as const;
  src: string;
  alt: string;
  private _image: HTMLImageElement | null = null;
  private _loaded = false;
  private _loading = false;

  constructor(props: PxlImageProps) {
    super(props);
    this.src = props.src;
    this.alt = props.alt ?? '';
  }

  override updateProps(newProps: PxlImageProps): void {
    if (newProps.src !== this.src) {
      this.src = newProps.src;
      this._loaded = false;
      this._loading = false;
      this._image = null;
    }
    this.alt = newProps.alt ?? '';
    super.updateProps(newProps);
  }

  get isLoaded(): boolean {
    return this._loaded;
  }

  get image(): HTMLImageElement | null {
    return this._image;
  }

  /**
   * Start loading the image. Returns a promise that resolves when loaded.
   * Marks the node as dirty when the image loads to trigger a re-render.
   */
  async load(): Promise<HTMLImageElement> {
    if (this._loaded && this._image) {
      return this._image;
    }

    if (this._loading) {
      return new Promise((resolve, reject) => {
        const check = () => {
          if (this._loaded && this._image) {
            resolve(this._image);
          } else if (!this._loading) {
            reject(new Error(`Failed to load image: ${this.src}`));
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });
    }

    this._loading = true;
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        this._image = img;
        this._loaded = true;
        this._loading = false;
        this.markDirty();
        resolve(img);
      };
      img.onerror = (err) => {
        this._loading = false;
        reject(new Error(`Failed to load image: ${this.src}`));
      };
      img.src = this.src;
    });
  }
}
