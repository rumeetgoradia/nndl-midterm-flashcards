# NNDL Midterm Flashcards

A static flashcard site with 145 cards from Lectures 2–9. The cards are built from answered study-guide prompts, with compound questions split into smaller recall checks and answers cleaned up to be concise. A few cards revisit concepts that needed extra clarification (Hessian eigenvalues and unusual convolution shapes).

## Preview locally

From the repository root, run:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/midterm/flashcards/`.

## Deploy with GitHub Pages

The workflow at `.github/workflows/deploy-flashcards.yml` publishes this folder when pushed to `main` (or when run manually). In the repository's **Settings → Pages**, select **GitHub Actions** as the build and deployment source. After the first successful workflow run, GitHub will show the site URL in that Pages settings screen.

The app itself has no build step or package dependencies. Site visibility follows the repository and GitHub Pages settings, so check those settings before enabling publication if you want the deck private.

## Card data and controls

Edit `cards.json` to add or revise cards. The page includes lecture filtering, search, tile and playlist views, shuffle, keyboard navigation, and local progress tracking. Progress is stored in the browser's local storage and does not sync between devices.
