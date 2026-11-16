# Cellscape

An interactive cell-biology notebook with rotatable 3D cells, illustrated organelles, short lessons, quizzes, and a private results dashboard.

Explore seven specimens: **plant cell, animal cell, white blood cell, neuron, epithelial cell, bacterium, and skeletal muscle fiber**.

The **Protein journey** now follows gold cargo through the rotatable animal model, with a pathway-map alternative and six learning checks. **Virtual lab** adds prediction → observation → explanation investigations for ER-to-Golgi transport and plant water balance. These simulations illustrate mechanisms; their geometry, timing, and water changes are not measurements.

Mixed practice combines identification, function, comparison, and sequence questions. A five-question set includes all four types. Questions that needed a retry, hint, or reveal are prioritized when you choose **Review missed concepts**. Review priorities last only while the page is open. Mixed-practice responses are saved by the same anonymous backend as the atlas quiz; experiment predictions and journey checks are not saved.

The admin dashboard now shows first-try, assisted, revealed, and incomplete results, plus concepts needing support across all sessions matching its filter. Counts describe attempts, not unique students or verified mastery. Focus a nucleus, mitochondrion, or chloroplast in 3D to see internal feature labels.

The **study desk** beneath the atlas adds original tissue schematics, a browser-local image workspace, and side-by-side comparisons between any two specimens. Tissue previews are illustrations, not microscope photographs. Bacterial and eukaryotic ribosomes are recognized as shared structure types in comparisons.

Use **Save structure** to collect a library and **Add note** to write a field notebook. Both last in the current page only; download the notebook as a text file before reloading. Image files added to the workspace are opened through browser object URLs and never sent to the backend. PNG, JPEG, and WebP files up to 12 MB are supported. Zoom is visual magnification; no physical scale or measurements are inferred.

**Snapshot** downloads the current 3D view as a labeled PNG. **3D model** downloads a `.three.json` file containing the procedural model's geometry and materials, readable with Three.js `ObjectLoader`. It is not GLB or STL. The Gallery, Library, Notebook, and Settings buttons open working study tools. Generated reference illustrations remain separate from rotatable geometry.

## Feature guide

| Area | What you can do |
| --- | --- |
| Cell atlas | Rotate, pan, zoom, isolate, and focus structures in seven procedural 3D models; use generated illustrations or plant/animal SVG diagrams instead |
| Structure details | Read function, construction, location, recognition tips, internal anatomy, and a sourced cell-specific fun fact |
| Protein journey | Follow cargo inside the 3D animal cell or use the pathway map; pause, resume, change speed, and answer six lesson checks |
| Virtual lab | Predict and observe blocked ER-to-Golgi transport or plant-cell water balance; compare with an explained outcome |
| Practice | Take specimen quizzes or mixed identification, function, comparison, and sequence questions; review missed concepts |
| Study desk | Open cell-pattern, stain, and membrane schematics; add a local image and visually zoom it |
| Comparisons | Compare any two specimens and open shared or specialized structures in the atlas |
| Gallery and library | Browse seven specimens and bookmark selected structures for the current page |
| Notebook | Write notes per specimen/structure and download all notes as a text file |
| Downloads | Save a labeled PNG snapshot or export the procedural model as Three.js Object JSON |
| Local results dashboard | Sign in to inspect anonymous answers, first-try scores, assisted answers, reveals, incomplete sessions, and concept-support counts |

**Public and local editions differ:** the [live public beta](https://cellscape-cell-atlas.arcane-heron-5162.chatgpt.site) has practice-only quizzes and no admin dashboard. Running the Python server locally enables anonymous answer saving and the protected dashboard. Notebook text, bookmarks, local images, and targeted-review priorities remain in browser memory in both editions; reload clears them. Download notes before leaving.

## 1. What you need

- **Git**, to download the project.
- **Python 3.10 or newer**, to run the website and save quiz answers.
- A current browser with WebGL 2 support for 3D. Illustration mode is available if 3D is unsupported.
- VS Code is optional, but useful for editing the files and opening a terminal.

**This project does not use npm.** You do not need `npm create`, `npm install`, a `package.json`, or a frontend build step. The website uses HTML, CSS, and JavaScript; the backend uses Python's standard library and SQLite. Three.js is already included in the repository. Node.js is only optional for running the 3D geometry test.

## 2. Clone the repository

Open a terminal in the folder where you want to keep the project:

```sh
git clone https://github.com/aaravcdesai-ui/CellBiologyWebsite.git
cd CellBiologyWebsite
```

The repository is private. You must be signed in to a GitHub account that has access. If GitHub says “Repository not found,” check your account and repository access. Do not put a password or access token in the clone URL.

Open the downloaded `CellBiologyWebsite` folder in VS Code, then choose **Terminal → New Terminal**. Run the remaining commands from this folder—the one containing `index.html` and `backend/`.

If you already have this project open locally, skip cloning and use its existing folder.

## 3. Set your admin passphrase

This is only needed if you want to view saved answers and scores. Students do not need an account or passphrase to take a quiz.

```sh
python3 backend/server.py --setup-admin
```

Enter a private passphrase of **at least 14 characters**, then enter it again to confirm. Nothing appears while you type; this is normal. There is no default passphrase.

The command saves a salted password hash in `backend/data/admin.json`. It does not save the passphrase in the website or README. Keep this file private; Git ignores it.

You can skip this step and still use the website and save quiz attempts. Configure admin access later when you want to read the results.

## 4. Start the website

```sh
python3 backend/server.py
```

Keep this terminal running. When it prints `Cellscape: http://127.0.0.1:8000`, open:

| Page | Local address |
| --- | --- |
| Website and quizzes | [http://127.0.0.1:8000/](http://127.0.0.1:8000/) |
| Private results dashboard | [http://127.0.0.1:8000/admin.html](http://127.0.0.1:8000/admin.html) |

Use your admin passphrase to sign in to the dashboard. There is no username field.

To stop the server, press **Ctrl+C** in its terminal. To start it again, run the same command. Saved quiz records survive a restart; admin login sessions do not.

**Windows:** if `python3` is not recognized, use `py -3` instead, for example `py -3 backend/server.py`.

**Port already in use?** Stop the previous server with Ctrl+C, or choose another port:

```sh
python3 backend/server.py --port 8002
```

Then use `http://127.0.0.1:8002/` and `http://127.0.0.1:8002/admin.html`.

Do not open `index.html` by double-clicking it. Serve the site through the Python command so that 3D modules and the quiz API work together. VS Code Live Server and a basic static server can preview the frontend, but **they do not save quiz answers or provide admin login**.

## 5. How to use it

### Explore a cell

1. Choose a specimen in the left panel.
2. Drag the 3D cell to rotate it; scroll or use +/− to zoom. Right-drag to pan. On touch screens, use one finger to rotate and two fingers to pan or pinch.
3. Click a structure, its label, or its name in the structure list.
4. Read its explanation, construction, location, recognition tips, and internal anatomy. A **Cell fun fact** card in the side panel shares a different sourced fact for each specimen; it updates when you switch cells and is hidden during quizzes. Expand **How it fits into the cell** for more context.
5. Use **Focus structure** or **Inspect in 3D** for an isolated close-up. **Reset view** returns to the whole cell.

**Illustration** shows generated cutaway artwork. **Diagram**, available for plant and animal cells, shows an annotated SVG schematic. **Protein journey** follows a gold cargo marker through six stages inside the 3D animal cell or the pathway map, with location/state notes, pause/resume, 1×/2× playback, and practice checks (not saved as quiz results); **Compare cells** explains shared structures and differences.

### Take a quiz

Select **Test your knowledge**. Each quiz contains five questions about the selected specimen. Choose an answer from the buttons or select the structure in the cell. Incorrect answers allow another attempt; hints and answer reveals are available.

The saving message tells you whether responses are reaching the backend. If it says **Practice only** or **Saving stopped**, do not assume the answers were stored.

### Review answers and scores

Sign in at `/admin.html`. You can:

- Filter sessions by specimen and move through pages of results.
- See complete, in-progress, and not-started sessions.
- Select **View answers** to see expected answers, chosen answers, correctness, timestamps, hints, and reveals.

**Score means first-try correct answers without hints, out of five.** Answers solved after a mistake or hint count as assisted. Showing an answer counts as revealed, not correct. An unfinished quiz has a provisional score. These are anonymous practice records, not verified exam grades or named student accounts.

## 6. How saving and admin login work

The browser loads the website and calls the API on the **same Python server**. Starting a quiz creates an anonymous session. Each answer, hint, or reveal is saved as an event in SQLite. The server checks the question and calculates correctness; retried requests with the same event ID are not saved twice.

| Local file | Purpose |
| --- | --- |
| `backend/data/quiz.sqlite3` | Persistent quiz sessions and response events |
| `backend/data/admin.json` | Admin passphrase salt and hash |

Both are excluded from Git and blocked from download by the backend. Do not copy them into `assets/` or any public hosting directory.

No student names or emails are requested. The quiz database does not store IP addresses or user-agent strings. Admin login uses an HttpOnly, SameSite cookie, expires after one hour, and is revoked on sign-out. Login throttling temporarily holds connection addresses in server memory. Hosting infrastructure may keep separate logs.

Records default to **30-day retention**. Expired records are removed at startup, on quiz submissions, and when admin results are requested. For scheduled cleanup and private CSV exports, see [backend instructions](backend/README.md). Exports must be managed separately. The visitor-facing [privacy notice and credits](about.html) describe the current behavior.

## 7. Books used for the biology information

The descriptions and study notes use project-specific wording, with these OpenStax textbooks as fact-checking references:

| Book | Sections used |
| --- | --- |
| **Biology 2e**, Mary Ann Clark, Matthew Douglas, and Jung Choi; OpenStax, Rice University | [4.2 Prokaryotic Cells](https://openstax.org/books/biology-2e/pages/4-2-prokaryotic-cells), [4.3 Eukaryotic Cells](https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells), [4.4 The Endomembrane System and Proteins](https://openstax.org/books/biology-2e/pages/4-4-the-endomembrane-system-and-proteins), [4.5 The Cytoskeleton](https://openstax.org/books/biology-2e/pages/4-5-the-cytoskeleton), [5.2 Passive Transport](https://openstax.org/books/biology-2e/pages/5-2-passive-transport) |
| **Anatomy and Physiology 2e**, OpenStax, Rice University | [4.2 Epithelial Tissue](https://openstax.org/books/anatomy-and-physiology-2e/pages/4-2-epithelial-tissue), [10.2 Skeletal Muscle](https://openstax.org/books/anatomy-and-physiology-2e/pages/10-2-skeletal-muscle), [12.2 Nervous Tissue](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-2-nervous-tissue) |

These are simplified teaching models, not measured reconstructions. Colors and proportions are illustrative. Organelle presence varies by cell type: for example, not every plant cell contains chloroplasts, and a basement membrane lies outside a cell.

No OpenStax textbook figures are bundled. Source material retains its own licensing requirements; citations do not grant permission to copy it or apply its license to this whole project. See the [Biology 2e licensing information](https://openstax.org/books/biology-2e/pages/preface), [credits](about.html#credits), and [provenance notice](NOTICE.md).

## 8. Images and 3D models

**The eight PNG illustrations were created for this project with OpenAI image generation.** They are educational artwork, not photographs, microscope images, or downloaded textbook figures.

| Asset | Used for |
| --- | --- |
| `assets/specimens/plant.png` | Plant cell illustration and thumbnail |
| `assets/specimens/animal.png` | Animal cell illustration and thumbnail |
| `assets/specimens/leukocyte.png` | Neutrophil-like white blood cell |
| `assets/specimens/neuron.png` | Myelinated neuron |
| `assets/specimens/epithelial.png` | Absorptive columnar epithelial cell |
| `assets/specimens/bacteria.png` | Generalized rod-shaped bacterium |
| `assets/specimens/muscle.png` | Skeletal muscle fiber |
| `assets/organelles/nucleus.png` | Nucleus close-up |

Other illustration close-ups crop the relevant specimen image. Exact generation prompts are recorded in [design/specimen-generation-prompts.json](design/specimen-generation-prompts.json). AI generation does not guarantee exclusive copyright or freedom from third-party claims.

The **rotatable 3D cells are procedural meshes** built in `cell-models.js` and displayed by Three.js; they are not spinning flat images or downloaded third-party cell meshes. SVG diagrams and close-up schematics are drawn by project code. Artwork, code, and explanations were developed with AI assistance.

CELLS alive! and a cell-explorer demo by Dilum Sanjaya supplied interaction and visual inspiration. Their screenshots, diagrams, recording frames, branding, and source code are not distributed with the website. Local reference media and review screenshots are ignored by Git. No affiliation or endorsement is implied.

Three.js 0.180.0 and OrbitControls are included under their [MIT license](vendor/three/LICENSE); preserve that notice when redistributing them. Fonts come from the visitor's device, with no external font requests.

## 9. Main project files

| File or folder | What it does |
| --- | --- |
| `index.html`, `style.css` | Main website structure and appearance |
| `specimens.js`, `app.js` | Specimens, biology descriptions, selection, and quiz flow |
| `learning.js`, `diagram.js` | Study notes, close-ups, lessons, comparisons, and diagrams |
| `cell-models.js`, `viewer3d.js` | 3D geometry, camera, selection, and labels |
| `studio.js` | Gallery, library, notebook, tissue workspace, specimen comparisons, and downloads |
| `lab.js`, `lab-data.js` | Virtual investigations, guided progress, and mixed practice |
| `quiz-store.js` | Sends quiz responses to the backend and displays saving status |
| `admin.html`, `admin.css`, `admin.js` | Admin login and results dashboard interface |
| `backend/server.py`, `backend/admin.py` | Website/API server, storage, admin authentication, and score summaries |
| `backend/quiz-bank.json` | Server-side question/answer catalog; keep it in sync with quiz content |
| `assets/`, `vendor/three/` | Generated illustrations and local 3D library |
| `about.html`, `NOTICE.md` | Credits, provenance, and privacy information |

## 10. Tests and hosting

Run the backend tests from the project root:

```sh
python3 -m unittest discover -s backend -p 'test_*.py'
```

If Node.js is installed, run the geometry checks (no npm installation needed):

```sh
node tests/model-geometry.mjs
```

**Local setup does not deploy the website online.** GitHub Pages can serve the static cell explorer, but cannot run the Python backend, save answers, or provide the admin dashboard. The included Pages workflow is manual; GitHub Pages is not the host of the live public beta. Keep the repository private unless its owner explicitly chooses otherwise.

For online answer saving, a separate backend deployment needs HTTPS, private persistent storage, secure cookies, backups, rate limiting, and scheduled cleanup. See [backend deployment notes](backend/README.md). A private GitHub repository does not automatically make a deployed Pages website private.

## Public practice-only release

Live beta: [Cellscape](https://cellscape-cell-atlas.arcane-heron-5162.chatgpt.site). The GitHub source repository remains private.

`python3 scripts/build_public.py` creates `_site/` using an explicit allowlist. The public quiz adapter never sends answer-saving requests. The generated package excludes the backend, admin dashboard, databases, credentials, private exports, and reference recordings. It includes a public-beta banner and a privacy notice for browser-only practice.

Local development still uses the normal Python backend; the public build does not alter local answer saving or admin access. To preview the public release, run `python3 -m http.server 8003 --directory _site` and open `http://127.0.0.1:8003/`.

The Pages workflow uses this builder, but GitHub currently requires an account upgrade to publish Pages from this private repository. Keep the repository private. The separate Sites hosting checkout is excluded from the main repository by `.gitignore`. Deployment identifiers and the public URL are recorded in `design/public-release.json`. Updating GitHub does not automatically update the live Site; regenerate and deploy the sanitized package separately.
