let webglSupport: boolean | undefined;

/**
 * Whether this browser can create a WebGL context. Checked once per page load
 * (creating a context is not free), then cached. Client only.
 */
export function hasWebGL() {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

/** For useSyncExternalStore: WebGL support never changes during a visit. */
export const noSubscribe = () => () => {};
