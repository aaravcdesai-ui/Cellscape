# Cellscape

Explore animal and plant cells through original, interactive SVG diagrams. Select a structure to learn about its function, or try a five-question identification quiz.

## Local preview

No dependencies or build step are required. Open `index.html` directly, use VS Code Live Server, or run:

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
4. Open **Actions → Deploy Cellscape to GitHub Pages → Run workflow**, choosing `main`. Future pushes to `main` deploy automatically.
5. Once the workflow succeeds, use the URL shown in its deployment summary or in Settings → Pages.

The workflow publishes only `index.html`, `app.js`, and `style.css`. Relative asset links work under a repository subpath. No secrets are needed. Repository visibility and GitHub plan determine Pages availability. See [GitHub’s Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Files

- `index.html`: page layout and metadata
- `style.css`: responsive layout, diagram labels, and controls
- `app.js`: biology content, original SVG artwork, exploration state, and quiz
- `.github/workflows/pages.yml`: automatic deployment

## Learning model and sources

These are simplified schematics, not to scale, and do not show every cellular structure. Organelle presence and appearance vary among cell types. Plant mode depicts a photosynthetic cell; chloroplasts are not present in every plant tissue. Cytosol is the fluid portion of the cytoplasm, not a membrane-bound organelle. Quiz questions cover the structures available in the selected model.

Descriptions were reviewed against [OpenStax Biology 2e, section 4.3: Eukaryotic Cells](https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells). The nucleus fact refers to a typical diploid human cell, rather than every human cell. The reference interaction was inspired by CELLS alive!; its artwork and code are not included.

## Verified behavior

- All 10 animal and 12 plant selections display matching explanations; diagram controls respond to Enter.
- Label visibility, previous/next wrapping, and cell-type changes work.
- Both full five-question quizzes complete and report the observed score. Repeated answers do not increase the score.
- Additional all-correct and all-incorrect runs report 5/5 and 0/5.
- Switching cell type exits the quiz and restores exploration.
- Layouts checked at 320, 390, 768, and 1280 pixels without horizontal document overflow; phone and tablet layouts inspected visually.

The GitHub Actions deployment requires a real connected repository and has not yet run on GitHub. Google Fonts is optional; local font fallbacks work offline. Quiz results are session-only; there are no accounts or server storage.
