/** `/products/x.webp` -> `/products/x-480.webp` (thumbnails sit next to each photo). */
export const thumbOf = (src: string) => src.replace(/\.webp$/, '-480.webp');
