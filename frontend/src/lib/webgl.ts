let webgl: boolean | undefined;

/** Whether this browser can run the 3D scenes (checked once). */
export function hasWebGL() {
  if (webgl === undefined) {
    try {
      const c = document.createElement('canvas');
      webgl = !!(c.getContext('webgl2') ?? c.getContext('webgl'));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}
