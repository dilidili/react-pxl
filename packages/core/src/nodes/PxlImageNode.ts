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
  private _error = false;

  /** Intrinsic dimensions once loaded */
  naturalWidth = 0;
  naturalHeight = 0;

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
      this._error = false;
      this._image = null;
      this.naturalWidth = 0;
      this.naturalHeight = 0;
    }
    this.alt = newProps.alt ?? '';
    super.updateProps(newProps);
  }

  get isLoaded(): boolean {
    return this._loaded;
  }

  get hasError(): boolean {
    return this._error;
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
    this._error = false;
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        this._image = img;
        this._loaded = true;
        this._loading = false;
        this.naturalWidth = img.naturalWidth;
        this.naturalHeight = img.naturalHeight;
        this.markDirty();
        resolve(img);
      };
      img.onerror = () => {
        this._loading = false;
        this._error = true;
        this.markDirty();
        reject(new Error(`Failed to load image: ${this.src}`));
      };
      img.crossOrigin = 'anonymous';
      img.src = this.src;
    });
  }
}
