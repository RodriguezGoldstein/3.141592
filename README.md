# Monte Carlo π Simulation

This interactive demo estimates the value of π using a Monte Carlo approach and D3.js for visualization.

## Overview

We approximate π by sampling points in the unit square [0, 1]×[0, 1] and checking how many fall inside the quarter circle of radius 1.  The ratio of inside‐circle points to total points, multiplied by 4, converges to π as the sample size grows.

The demo presents two sampling methods:
- **Quarter Circle Monte Carlo**: uniform random (x, y) samples in the square.
- **Quasi‑Monte Carlo (Halton sequence)**: low‑discrepancy sequence that more evenly covers the square, typically yielding faster convergence.

Visualization components include:
- **Scatter Plot** of sampled points (blue = inside, red = outside).
- **Convergence Plot** showing the running π estimate with ±1σ/√N error bands.
- **Std. Error Comparison** bar chart comparing final standard error across methods.

## How to run

You must serve this demo over HTTP (ES modules & module workers won’t run from file://):

```bash
# Python 3 (port 8000)
python3 -m http.server 8000

# or via npm (port 8080)
npm start
```

## Usage

**Usage:**

- Select a sampling **Method** (Quarter Circle, Quasi‑MC).
- Enter **Number of simulations** and click **Animate** to start the simulation stream.
- Click **Pause** to freeze updates, **Resume** to continue.
- Adjust **Batch size** to trade off animation smoothness vs. UI responsiveness.
- Click **Animate** after setting the number of simulations, batch size, and animation speed to start; plots do not update automatically.

## Project structure

```
css/
  style.css      # styles
js/
  main.js        # simulation & D3 code (UI & charts)
  methods.js     # sampling method implementations
index.html       # HTML template
.gitignore       # ignored files
README.md        # this file
```

## Next steps

- Analyze convergence rate (error vs. N)
- Animate point insertion or streaming visualization
- Compare different Monte Carlo methods
- Explore alternative sampling methods: quasi‑Monte Carlo
- Add error bands (±1σ/√N) to convergence plot
- Compare standard error across methods via a bar chart

## Monte Carlo Option Pricing Example

This repository also includes a self-contained HTML demo `mc_option_pricing.html` that demonstrates Monte Carlo pricing of European options (call/put) with a few variance reduction techniques and interactive visualizations powered by D3.

Key features:
- Monte Carlo simulation of asset price paths under geometric Brownian motion.
- Antithetic variates and an optional control variate (based on discounted terminal asset) to reduce estimator variance.
- Histogram of discounted payoff, estimator comparison (MC, MC+CV, Black–Scholes), sample price paths, and payoff scatter at expiry.
- Interactive zoom/pan on charts; per-chart clipping preserves axes while plotting is clipped to the viewport.
- Uses a Blob-based Web Worker to run heavy simulations off the main thread (keeps the UI responsive). The app falls back to main-thread simulation when Workers are unavailable.

How to run the example locally:

1. Serve the project over HTTP (do not open the file via `file://`):

   ```bash
   # Python 3
   python3 -m http.server 8000

   # or via a simple npm server
   npx http-server -p 8000
   ```

2. Open `http://localhost:8000/mc_option_pricing.html` in a modern browser.

Deploying to GitHub Pages:

- The demo is self-contained and works on GH Pages. The Blob-based Web Worker is created in-browser, so no server-side changes are required. Push the repository or the single HTML file to a branch configured for GitHub Pages and open the page via the GH Pages URL.
- Note: if you plan to import external scripts inside the worker, ensure they are same-origin or CORS-enabled.

Quick usage notes:
- Controls are at the top of the page (S₀, K, r, σ, T, steps, paths, seed, antithetic, control variate).
- Click **Run Simulation** to compute results and re-render all charts.
- Click **Run Diagnostics** to run internal consistency checks (this runs in the worker when available).


## Development workflow

- **Install dependencies**: `npm install`
- **Lint JavaScript**: `npm run lint`
- **Check formatting**: `npm run format:check`
- **Apply formatting**: `npm run format`
- **Serve locally**: `npm start` (launches HTTP server on port 8080)
