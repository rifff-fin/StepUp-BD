// Product photos are either local files (`/products/x.webp`, with an `x-480.webp` thumbnail
// next to each) or Cloudinary uploads from the admin panel (resized on the fly by URL).
const CLOUDINARY = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

const cloudinaryAt = (src: string, width: number) =>
  src.replace(CLOUDINARY, `$1f_auto,q_auto,c_limit,w_${width}/$2`);

/** True when the photo has a thumbnail (so it can get a `srcset`). */
export const hasThumb = (src: string) => src.startsWith('/') || CLOUDINARY.test(src);

/** `/products/x.webp` -> `/products/x-480.webp`; Cloudinary -> a 480px version. */
export const thumbOf = (src: string) =>
  CLOUDINARY.test(src) ? cloudinaryAt(src, 480) : src.replace(/\.webp$/, '-480.webp');

/** The full-size photo (Cloudinary: capped at 1200px, auto format and quality). */
export const fullOf = (src: string) => (CLOUDINARY.test(src) ? cloudinaryAt(src, 1200) : src);
