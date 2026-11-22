"""Build a practice-only public release using an explicit file allowlist."""

from pathlib import Path
import argparse, hashlib, json, re, shutil, subprocess

ROOT = Path(__file__).resolve().parent.parent
FILES = [
    "index.html",
    "about.html",
    "NOTICE.md",
    "style.css",
    "app.js",
    "diagram.js",
    "specimens.js",
    "learning.js",
    "lab.js",
    "lab-data.js",
    "studio.js",
    "viewer3d.js",
    "cell-models.js",
    "anatomy-motion.js",
    "experiment-model.js",
    "investigations.js",
    "discovery.js",
    "glb-parts.js",
]
SPECIMENS = [
    "plant",
    "animal",
    "leukocyte",
    "neuron",
    "epithelial",
    "bacteria",
    "muscle",
]
# Ship only the optimized WebP files; the PNG masters stay in the repo (see scripts/optimize_images.py).
ASSETS = (
    ["assets/organelles/nucleus.webp", "assets/icon.svg", "assets/apple-touch-icon.png", "assets/social-card.jpg"]
    + [f"assets/specimens/{n}.webp" for n in SPECIMENS]
    + [f"assets/specimens/thumbs/{n}.webp" for n in SPECIMENS]
)
# Artist-made GLB models: only the files the manifest lists are published.
MODELS = ["models/manifest.json"] + [
    f"models/{entry['file']}"
    for entry in json.loads((ROOT / "models/manifest.json").read_text()).values()
]
VENDOR = [
    f"vendor/three/{n}"
    for n in [
        "LICENSE",
        "three.module.js",
        "three.core.js",
        "OrbitControls.js",
        "GLTFLoader.js",
        "BufferGeometryUtils.js",
        "meshopt_decoder.module.js",
    ]
]
PRACTICE_JS = """// Public release: no network calls, accounts, or answer persistence.
window.QuizStore={
 begin(model,questions,statusId='quiz-save-status'){
  const node=document.getElementById(statusId);
  if(node)node.textContent='Practice only — answers and scores stay in this page and are not sent to a server.';
 },
 record(){}
};
"""
PRIVACY = """<section id="privacy"><p class="eyebrow">PUBLIC LEARNING EDITION</p><h2>Privacy</h2>
<p>This public version is practice only. Quiz answers, scores, hint requests, experiment predictions, and lesson checks stay in your open page. They are not sent to an answer server. There are no student accounts or public admin dashboard.</p>
<p>Notebook text, saved structures, and protein-journey lesson checks are kept in this browser’s local storage on this device so a reload does not lose them. They are never sent anywhere. Use “Clear saved work” in the notebook to delete notes and saved structures, especially on a shared computer. Review priorities stay in browser memory and reset when you reload or close the page. Images you add are opened locally in your browser and are never uploaded. Snapshot and model downloads are generated in your browser.</p>
<p>The application does not use analytics, advertising, tracking pixels, or application login cookies, and it uses browser local storage only for the study work described above. Artwork, scripts, and styles are served from the same host. Image generation happened during development; visiting this site does not send prompts or answers to an AI service.</p>
<p>The hosting provider receives ordinary requests needed to deliver the website and may maintain security or access logs under its own policies. External reference sites receive a request only when you follow their links. Outgoing links request that browsers omit referrer information.</p>
<p><strong>Optional feedback:</strong> “Give feedback” opens a separate Google Form in a new tab. The form asks about your experience using Cellscape and does not request your name or email address. Your feedback is sent to the site operator through Google Forms only when you submit it. Please avoid personal information in your comments. Google processes visits and submissions under its <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>.</p>
<p>The cell models, illustrations, and experiments are simplified teaching aids, not measured reconstructions or clinical tools. Tissue previews are original schematics, not microscope photographs.</p></section>"""
JS_IMPORT = re.compile(
    r"""(from\s*['"]|import\s*\(\s*['"])(\.{1,2}/[^'"?#]+\.js)(['"])"""
)


def stamp_versions(destination):
    """Add ?v=<content hash> to local script and stylesheet URLs so browsers fetch changed files.
    A module's hash covers its rewritten imports, so editing a dependency also renews its importers.
    Vendored Three.js is left alone: the import map and the modules must share one URL for it.
    """
    hashes, active = {}, set()

    # Artwork paths are built at runtime (assets/specimens/${kind}.webp), so they get one shared
    # version: a hash of every shipped image. Changing any artwork renews all of its URLs (and,
    # through the rewritten scripts, the scripts' own hashes), so cached art never pairs with new
    # hotspot coordinates.
    art = hashlib.sha256()
    shipped = sorted((destination / "assets").rglob("*.webp")) + sorted(
        (destination / "models").glob("*")
    )
    for image in shipped:
        art.update(image.relative_to(destination).as_posix().encode())
        art.update(image.read_bytes())
    art_version = art.hexdigest()[:10]
    for script in destination.glob("*.js"):
        text = script.read_text()
        stamped = re.sub(r"(assets/[\w/${}.-]*?\.webp|models/manifest\.json)(?![?\w])", rf"\1?v={art_version}", text)
        if stamped != text:
            script.write_text(stamped)
        if re.search(r"\.webp(?!\?v=)|manifest\.json(?!\?v=)", stamped):
            raise ValueError(f"Unversioned artwork path left in {script.name}")

    def digest(rel):
        if rel in hashes:
            return hashes[rel]
        if rel in active:
            raise ValueError(f"Circular import: {rel}")
        active.add(rel)
        path = destination / rel
        text = path.read_text()

        def stamp(m):
            dep = (Path(rel).parent / m.group(2)).as_posix()
            if dep.startswith("vendor/"):
                return m.group(0)
            return f"{m.group(1)}{m.group(2)}?v={digest(dep)}{m.group(3)}"

        if rel.endswith(".js"):
            text = JS_IMPORT.sub(stamp, text)
            path.write_text(text)
        active.discard(rel)
        hashes[rel] = hashlib.sha256(text.encode()).hexdigest()[:10]
        return hashes[rel]

    for page in ("index.html", "about.html"):
        path = destination / page
        path.write_text(
            re.sub(
                r'((?:src|href)=")([^"?#:]+\.(?:js|css))(")',
                lambda m: f"{m.group(1)}{m.group(2)}?v={digest(m.group(2))}{m.group(3)}",
                path.read_text(),
            )
        )


def require_esbuild():
    esbuild = shutil.which("esbuild")
    if not esbuild:
        raise SystemExit(
            "--minify needs esbuild on your PATH (npm install -g esbuild@0.25.0); "
            "or build without --minify"
        )
    return esbuild


def minify(destination):
    """Minify every script and stylesheet in place with an installed esbuild.

    esbuild parses the code properly, so template strings and regexes are safe, and it does not
    rename top-level names in classic scripts, which share globals such as `structures`.
    This never downloads anything: install esbuild first (CI runs `npm install -g esbuild@0.25.0`).
    """
    esbuild = require_esbuild()
    files = sorted(
        str(p) for p in destination.rglob("*") if p.suffix in (".js", ".css")
    )
    subprocess.run(
        [esbuild, *files, "--minify", "--charset=utf8", "--log-level=warning",
         f"--outdir={destination}", f"--outbase={destination}", "--allow-overwrite"],
        check=True,
    )


def build(destination, minified=False):
    if minified:
        require_esbuild()  # fail before touching any existing output
    destination = destination.resolve()
    if (
        destination == ROOT
        or ROOT in destination.parents
        and destination.name not in ("_site", "dist")
    ):
        raise ValueError("Use a dedicated _site or dist output directory")
    if destination.exists():
        if destination.is_symlink():
            raise ValueError("Output must not be a symlink")
        # Only replace an output previously created by this builder.
        if not (destination / ".cellscape-public-build").exists() and any(
            destination.iterdir()
        ):
            raise ValueError("Output is not a Cellscape public build")
        shutil.rmtree(destination)
    destination.mkdir(parents=True)
    for name in FILES + ASSETS + MODELS + VENDOR:
        source = ROOT / name
        if source.is_symlink() or not source.is_file():
            raise ValueError(f"Unexpected source: {name}")
        target = destination / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    (destination / "quiz-store.js").write_text(PRACTICE_JS)
    html = (destination / "index.html").read_text()
    html, inserted = re.subn(
        r'</header>(\s*)<main id="main-content" tabindex="-1">',
        lambda m: "</header>"
        + m.group(1)
        + '<p class="public-edition" role="note"><strong>Public beta</strong><span>Practice only · Quiz answers stay in this page.</span></p>'
        + m.group(1)
        + '<main id="main-content" tabindex="-1">',
        html,
    )
    if inserted != 1:
        raise ValueError("Could not place the public beta notice in index.html")
    (destination / "index.html").write_text(html)
    about = (destination / "about.html").read_text()
    start = about.rfind("<section", 0, about.index('id="privacy"'))
    # The privacy section is the last content section on this page.
    end = about.index("</section>", about.index('id="privacy"')) + len("</section>")
    about = about[:start] + PRIVACY + about[end:]
    (destination / "about.html").write_text(about)
    with (destination / "style.css").open("a") as out:
        out.write(
            "\n.public-edition{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin:0;padding:9px 16px;border-bottom:1px solid #dedfcf;background:#edf0e1;color:#63724f;font:11px/1.6 system-ui,sans-serif}.public-edition strong{font-weight:600;color:#4d603b}@media(max-width:650px){.public-edition{gap:4px 10px;font-size:10px}}\n"
        )
    if minified:
        minify(destination)  # before hashing, so hashes match the files actually served
    stamp_versions(destination)
    (destination / ".nojekyll").touch()
    (destination / ".cellscape-public-build").write_text(
        "Practice-only static release\n"
    )
    expected = set(
        FILES
        + ASSETS
        + MODELS
        + VENDOR
        + ["quiz-store.js", ".nojekyll", ".cellscape-public-build"]
    )
    actual = {
        p.relative_to(destination).as_posix()
        for p in destination.rglob("*")
        if p.is_file()
    }
    assert actual == expected, (actual - expected, expected - actual)
    assert "fetch(" not in (destination / "quiz-store.js").read_text()
    for name in actual:
        assert not any(
            part in name.lower()
            for part in [
                "admin",
                "backend",
                "sqlite",
                ".env",
                "recording",
                "quiz-export",
            ]
        )
    for path in re.findall(r'(?:src|href)="([^"?#]+)', html):
        if path.startswith(("https:", "http:", "#", "/")) or path in ("./",):
            continue
        assert (destination / path).exists(), path
    print(
        json.dumps(
            {
                "directory": str(destination),
                "files": len(actual),
                "quizSaving": False,
                "adminIncluded": False,
                "minified": minified,
            }
        )
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=ROOT / "_site")
    parser.add_argument(
        "--minify",
        action="store_true",
        help="minify JS and CSS with an installed esbuild",
    )
    args = parser.parse_args()
    build(args.output, minified=args.minify)
