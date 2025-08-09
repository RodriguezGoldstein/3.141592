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

## Development workflow

- **Install dependencies**: `npm install`
- **Lint JavaScript**: `npm run lint`
- **Check formatting**: `npm run format:check`
- **Apply formatting**: `npm run format`
- **Serve locally**: `npm start` (launches HTTP server on port 8080)
