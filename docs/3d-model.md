# The hero's 3D shoe: Air Jordan 1 High OG "Bred"

The client required the Air Jordan 1 High OG in the classic **"Bred"** (black / University
Red) colourway for the 3D hero.

## Source and licence

- Model: **"Air Jordan 1"** by **makoto** on Sketchfab,
  <https://sketchfab.com/3d-models/air-jordan-1-a4b434181fbb48008ad460722fd53725>
- Licence: **CC BY 4.0** (<https://creativecommons.org/licenses/by/4.0/>). Commercial use is
  allowed with attribution. The credit is in the site footer (`footer.modelCredit` in
  `frontend/src/content/copy.ts`) and in the README. **Keep it there.**
- The original is a black/white ("Panda") **pair**, 8.1 MB.

## What was changed (shipped file: `frontend/public/models/aj1-bred.glb`, 0.96 MB)

1. One shoe kept from the pair, with unused vertices removed. Turned so the toe points
   along +x and the sole sits on y = 0.
2. Base-colour texture repainted to **Bred**, panel by panel. Leather grain and stitching
   are kept, and the model's own normal and roughness maps are untouched.
3. Compressed: `gltf-transform dedup → prune → webp (q85) → meshopt`. Meshopt is decoded by
   the bundled three-stdlib decoder, so there are no CDN requests (Draco is not used).
4. Two more colour textures for the hero's switcher, cross-faded in the shader
   (`src/three/GltfShoe.tsx`): `aj1-white-red.webp` and `aj1-all-black.webp`.

### Panel → colour map (texture islands of the source model)

| Island | Part | Bred | White / Red | All Black |
|---|---|---|---|---|
| 5 (front split, z > 6) | toe box | red | white | black |
| 5 (rest) | quarter panels | black | white | black |
| 23 | mudguard | black (kept) | red | black (kept) |
| 18, 22 | front side panels | black (kept) | red | black (kept) |
| 2 | heel counter | red | red | black |
| 29 dark / light | ankle wing / Wings logo | red / black | red / black | black / dark grey |
| 43 | upper collar panel | black | black | black |
| 46, 44, 32 | swoosh, collar pad, eyestay | black (kept) | black (kept) | black (kept) |
| 6 | tongue | black | white | black |
| 0 dark / light | outsole / midsole | red / white | red / white | black / dark grey |

Red is `#A8101B` before lighting, which renders close to University Red. Black is `#151515`.

## Regenerating or adding a colourway

The tool used is `frontend/tools/model-lab/` (dev only, never built):

1. Download the source model from the Sketchfab link above (a free account is needed) and save
   it as `frontend/tools/model-lab/aj1-original.glb` (git-ignored).
2. `npm run dev` in `frontend/`, open `http://localhost:5190/tools/model-lab/model-lab.html`.
3. In the browser console:
   ```js
   await lab.load('/tools/model-lab/aj1-original.glb', 'x', 1); // keep one shoe of the pair
   lab.splitIsland(5, 'z', 6.0, true);                    // separates the toe box (new id 47)
   lab.recolor([{ ids: [47], colour: '#A8101B', mode: 'all', grain: 0.8 }, /* … */]);
   lab.view(90, 0.15);                                    // check it
   copy(lab.exportMap());                                 // base64 JPEG of the new texture
   ```
   `lab.debug()` colours every island; `lab.pick(x, y)` tells which island is under a point.
4. Save the texture as WebP next to the others, then add a colourway in
   `src/three/colorways.ts` with `texture: '/models/<name>.webp'`.

## Swapping in a different model

Set `SHOE_MODEL_URL` in `src/three/config.ts` (and `GLB_ROTATION_Y` if the toe does not point
along +x). The model is scaled and centred automatically. If it ever fails to load, the
procedural shoe (`src/three/shoeGeometry.ts`) stands in.
