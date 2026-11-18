# Cellscape

Explore cell biology through interactive 3D models, guided lessons, and quizzes.

**[Open the website](https://cellscape-cell-atlas.arcane-heron-5162.chatgpt.site)** · **[Give feedback](https://docs.google.com/forms/d/e/1FAIpQLScB47LlYJ65J61OxtcgeM8RBIHqqAtnVqTZnHFuAJve-Kru_A/viewform)**

## Features

- Seven cell models with rotation, zoom, structure selection, and exploded views.
- Animated nucleus, mitochondrion, and chloroplast close-ups, with explanations and fun facts.
- A protein’s journey, guided discovery, and experiments comparing protein transport and water balance.
- Quizzes with hints, explanations, and review of missed concepts.
- Cell comparisons, a notebook, image workspace, snapshots, and 3D model exports.
- A local admin dashboard for anonymous answers, scores, and concepts needing review.

The live website has **practice-only quizzes** and no admin dashboard. Run the backend locally to save quiz results. Models and experiments are simplified teaching aids, not measured reconstructions.

## Run locally

You need **Git**, **Python 3.10+**, and a modern browser. The frontend uses HTML, CSS, JavaScript, and bundled Three.js; the backend uses Python and SQLite. **No npm setup or package installation is required.**

```sh
git clone https://github.com/aaravcdesai-ui/Cellscape.git
cd Cellscape
python3 backend/server.py
```

Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)**. Keep the terminal running; press **Ctrl+C** to stop. On Windows, replace `python3` with `py -3` if needed. Serve the website through this command rather than double-clicking `index.html`.

To enable the results dashboard, stop the server, create an admin passphrase of at least 14 characters, then restart:

```sh
python3 backend/server.py --setup-admin
python3 backend/server.py
```

Sign in at **[http://127.0.0.1:8000/admin.html](http://127.0.0.1:8000/admin.html)**. Students need no account. See the [backend guide](backend/README.md) for exports, retention, and hosting.

## Data and privacy

Local quiz answers are stored in SQLite; scores count first-try correct answers without hints. The dashboard distinguishes assisted, revealed, and incomplete work. Records default to 30-day retention. Databases, admin credentials, and exports are excluded from Git.

Notebook text, bookmarks, and lesson progress reset on reload; download notes before leaving. Added images stay in the browser. Optional feedback is submitted separately through Google Forms. Read the [privacy notice](about.html#privacy).

## Biology and artwork

Biology explanations use original wording checked against OpenStax’s **Biology 2e** (cells, membrane traffic, cytoskeleton, and osmosis) and **Anatomy and Physiology 2e** (epithelial, muscle, and nervous tissue). Full references are in [Credits & sources](about.html#credits).

The eight PNG illustrations were generated for this project with OpenAI image generation. The 3D meshes and SVG diagrams are built in code. They are educational illustrations, not microscopy images. The PNGs are lossless masters; the site loads WebP copies made by `python3 scripts/optimize_images.py` (needs Pillow), so re-run it after changing any artwork. [Generation prompts](design/specimen-generation-prompts.json) and [artwork provenance](NOTICE.md) document their origins and design references.

Three.js and OrbitControls use the bundled [MIT license](vendor/three/LICENSE). Preserve third-party notices when redistributing.

## Tests and public builds

```sh
python3 -m unittest discover -s backend -p 'test_*.py'
```

With Node.js installed, you can also run:

```sh
node tests/model-geometry.mjs
node tests/anatomy-motion.mjs
node tests/experiment-model.mjs
```

`python3 scripts/build_public.py` creates a practice-only `_site/` folder, excluding the backend, admin dashboard, and private data. The manual GitHub Pages workflow uses this build; the live beta is hosted separately through Sites. GitHub pushes do not automatically redeploy it. Online answer saving requires a separate backend deployment; see the [hosting notes](backend/README.md#online-hosting-is-separate).
