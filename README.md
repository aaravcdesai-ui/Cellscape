# Cellscape — Cell Atlas

Explore seven cell specimens through AI-generated cutaway artwork, interactive hotspots, close-ups, and a three-panel cell atlas. Select a structure to learn about its function, or try a five-question identification quiz.

## Local preview

No build step or npm install is required. For 3D, use VS Code Live Server or run the local HTTP server below. Opening `index.html` as a file supports illustrations, but browser security prevents the 3D ES modules from loading.

```sh
python3 -m http.server 5173 --bind 127.0.0.1
```

Visit http://127.0.0.1:5173. Stop the server with Ctrl+C. If that port is already used, choose 5174 instead.

## Publish with GitHub Pages

1. Create an empty GitHub repository, then open this project folder in the VS Code terminal.
2. Initialize and push it (replace the example remote URL):

   ```sh
   git init -b main
   git add .
   git commit -m "Add interactive Cellscape explorer"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

3. In the GitHub repository, open **Settings → Pages** and select **GitHub Actions** as the source.
4. Open **Actions → Deploy Cellscape to GitHub Pages → Run workflow**, choosing `main`. Automatic publishing is currently paused. Run this workflow manually after enabling GitHub Pages; add a `push` trigger later if you want automatic deployments.
5. Once the workflow succeeds, use the URL shown in its deployment summary or in Settings → Pages.

The workflow publishes only `index.html`, `about.html`, `NOTICE.md`, all JavaScript files, `style.css`, and the `assets/` and `vendor/` directories. Relative asset links work under a repository subpath. No secrets are needed. Repository visibility and GitHub plan determine Pages availability. See [GitHub’s Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Files

- `index.html`: page layout and metadata
- `style.css`: responsive layout, diagram labels, and controls
- `diagram.js`: original annotated animal and plant SVG schematics
- `cell-models.js`: editable 3D mesh builders for all seven specimens
- `viewer3d.js`: WebGL rendering, orbit controls, mesh picking, isolation, shell controls, and 3D labels
- `vendor/three/`: locally served Three.js 0.180.0, orbit controls, and MIT license
- `specimens.js`: seven-specimen catalog, rendered images, hotspot maps, thumbnails, and specialized biology content
- `assets/specimens/`: generated PNG illustrations for plant, animal, white blood cell, neuron, epithelial cell, bacterium, and muscle fiber
- `assets/organelles/nucleus.png`: original isolated nucleus cutaway
- `app.js`: biology content, original SVG cell artwork, exploration state, and quiz
- `learning.js`: organelle close-ups, zoom controls, the protein journey, and comparison activity
- `about.html`: visitor-facing credits, sources, and privacy information
- `NOTICE.md`: asset provenance and third-party notices
- `.github/workflows/pages.yml`: manual deployment; automatic publishing is paused

## Learning model and sources

These are simplified schematics, not to scale, and do not show every cellular structure. Organelle presence and appearance vary among cell types. Plant mode depicts a photosynthetic cell; chloroplasts are not present in every plant tissue. Cytosol is the fluid portion of the cytoplasm, not a membrane-bound organelle. Quiz questions cover the structures available in the selected model.

Descriptions were reviewed against [OpenStax Biology 2e, section 4.3: Eukaryotic Cells](https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells). The nucleus fact refers to a typical diploid human cell, rather than every human cell. The reference interaction was inspired by CELLS alive!; its artwork and code are not included.

## Learning activities

- **Under the lens:** every selected structure has an enlarged schematic and three numbered features. Select a feature to read its explanation. These are educational illustrations, not microscopy images.
- **Follow a protein:** a six-stage secretory pathway with play/pause, next/previous, direct stage selection, and restart. Playback advances every 4.5 seconds. Pausing stops playback and cargo motion. Reduced-motion preferences disable animated movement; the steps remain usable.
- **Practice with feedback:** wrong answers explain the chosen structure’s function and allow retries. Hints describe the structure; Show answer reveals it. Results distinguish independent first-try answers, answers solved with practice, and revealed answers. Hints count once per question.
- **Compare cells:** filter shared structures or differences, with corresponding emphasis in the cell diagram. Select a comparison item to open it in the appropriate model. These distinctions apply to the teaching models and are qualified in the notes.
- **Zoom and pan:** use +/− for 100–300% magnification, then swipe or scroll inside the diagram to pan. Reset returns to the full cell. On small screens, selecting a structure brings its details directly into view, with a Back to cell link.

The secretory pathway lesson was reviewed against [OpenStax Biology 2e, section 4.4](https://openstax.org/books/biology-2e/pages/4-4-the-endomembrane-system-and-proteins). Not every protein follows this route.

## Verified behavior

- All 14 animal and 15 plant selections show matching explanations and close-ups. Each close-up has three selectable features with matching markers and descriptions.
- Both five-question quizzes were completed with wrong-answer retries, hints, reveals, and correct answers. Results correctly separate first-try, assisted, and revealed answers.
- Comparison filters and cross-model links work; journey controls cover all six steps. Automatic playback reaches step 6 and stops at Replay; pause holds the current step.
- Zoom is bounded to 100–300%, enlarges the SVG within its scrollable area, and does not widen the page.
- Layouts checked at 320, 390, 768, 1280, and 1440 pixels without horizontal page overflow. Mobile selections bring the detail panel into view; the mobile journey pans to its active stage.

## Repository and hosting

The original version and deployment workflow have been committed to https://github.com/aaravcdesai-ui/CellBiologyWebsite. The current source includes the atlas redesign, detailed specimen artwork, learning activities, and seven rotatable 3D teaching models. GitHub Pages publishing remains paused: this repository is private and the current plan requires a public repository or an upgrade for Pages. The workflow includes all scripts and the complete `assets/` directory for the next deployment.

Typography uses device-local system and serif fonts; there are no external font requests. The site code has no analytics, accounts, cookies, browser storage, or quiz uploads. Quiz results remain in page memory and reset on reload. Hosting providers can still log requests; the visitor-facing notice at `about.html#privacy` explains this distinction.

## Atlas interface

The Cell atlas, Protein journey, and Compare cells tabs keep the study tasks in separate views. The atlas has a structure rail, a large specimen, and a scrollable detail panel on desktop. Phone layouts use a horizontal structure list and place details beneath the specimen. Selecting a structure returns its detail panel to the heading.

The specimen drawings include layered cell boundaries, chromatin and nuclear pores, rough ER with attached ribosomes, smooth ER, mitochondrial cristae, Golgi cisternae, free ribosomes, peroxisomes, vesicles, and cytoskeletal fibers. Plant mode adds the cell wall, central vacuole and chloroplast grana. Animal mode includes lysosomes and a centrosome with paired centrioles. Diagram and Illustration are project-specific teaching artwork. The separate 3D mode uses editable meshes, as described below; none of these views is a measured anatomical reconstruction.

## Recording-inspired illustration assets

The supplied 50.97-second screen recording was reviewed at nine timestamps. It showed seven primary specimen images: plant, white blood cell, neuron, epithelial, bacterial, animal, and skeletal muscle. Eight PNG assets were generated with the built-in image-generation tool: seven specimens plus one isolated nucleus. The artwork is used directly in the live atlas, specimen thumbnails, and organelle close-ups. It is not a screenshot of an interface pasted into the website.

The Illustration view uses fixed rendered images with interactive SVG hotspots. The separate 3D view uses procedural meshes that rotate in real depth; neither is a real micrograph. Some structures are shown schematically, and the illustrations should not be interpreted as measurements. Plant and animal specimens retain a separate Diagram view. Prokaryotic questions do not include eukaryotic organelles.

Exact prompts are saved in `design/specimen-generation-prompts.json`. Reference frames in `design/recording-review/` are local review artifacts, ignored by Git and excluded from deployment. Root preview screenshots, recordings, and UI concept images are also ignored. Keep reference media out of `assets/`. The generated images remain under `assets/` so that local preview and GitHub Pages both serve them without external image services.

Verification: all 72 structure selections across the seven specimens were checked for matching details and three study-note controls. Five-question quiz flows completed for all seven models, and an all-correct bacterial run scored 5/5. Layouts were checked at 320, 390, 768, 1280, and 1440 pixels without page overflow.

## Rotatable 3D view

All seven specimens have native Three.js geometry: plant, animal, neutrophil-like white blood cell, neuron, epithelial cell, bacterium, and skeletal muscle fiber. The default mode is 3D when served over HTTP. The detailed generated images remain available in Illustration; plant and animal models also retain the Diagram view.

Controls:
- Drag to orbit; scroll or use +/− to zoom.
- Right-drag to pan. On touch screens, use one finger to orbit and two fingers to pan/pinch.
- Select a labeled structure, click a visible mesh, or choose a structure in the list.
- Isolate structure hides other structures and frames all instances of the selected type.
- Outer shell switches between cutaway and outer-envelope views.
- Auto rotate starts/stops orbiting; dragging stops automatic rotation.
- Reset view restores the initial orientation, zoom, and cutaway.
- With the canvas focused: arrows rotate, Shift+arrows pan, +/− zoom, and Home resets.

These are simplified editable teaching models, not image-to-3D reconstructions or scan-derived anatomy. Geometry includes nuclear envelope pores and chromatin, mitochondrial cristae, chloroplast thylakoid stacks, ER, Golgi sacs, ribosomes, specialized neuronal and epithelial structures, a bacterial nucleoid and appendages, and skeletal muscle bands. No generated image is used as a spinning billboard. The GPU viewer reuses one canvas and disposes old model resources on specimen changes. Rendering pauses when the atlas is not visible.

The 3D mode requires WebGL 2. If a browser cannot create a WebGL context, use the Illustration mode. All runtime libraries are vendored locally; the site does not need a third-party CDN at runtime. Three.js is distributed under its included MIT license.

Geometry validation can be run with Node.js:

```sh
node tests/model-geometry.mjs
```

The check validates finite mesh vertices and transforms, index ranges, expected selectable structures, and absence of membrane-bound organelles in the bacterial model. Browser verification covered drag rotation, zoom, keyboard panning, all seven model switches, shell controls, mesh selection, isolation, auto-rotation, labels, and illustration/quiz transitions.

## Credits and privacy maintenance

Visitor-facing credits and privacy information are linked from the site footer at `about.html`. `NOTICE.md` documents the eight generated images, project-specific code and models, Three.js licensing, biology references, and excluded reference material. Preserve the Three.js license during redistribution. The credits do not grant permission to copy reference screenshots or textbook figures, or promise exclusive rights in AI-generated artwork.

Update the privacy notice before adding analytics, forms, accounts, remote fonts, embeds, or server-side score storage. Keep repository visibility private and the Pages workflow manual unless publishing is explicitly authorized. A private repository does not automatically make a deployed Pages site private.
