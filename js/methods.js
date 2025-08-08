/**
 * Various Monte Carlo sampling methods for π estimation.
 * Each method returns { points: Array<[x,y]>, values: Array<number> }.
 */
export function quarter(N) {
  const points = [];
  const values = [];
  for (let i = 0; i < N; i++) {
    const x = Math.random();
    const y = Math.random();
    points.push([x, y]);
    values.push(x * x + y * y < 1 ? 1 : 0);
  }
  return { points, values };
}

export function integral(N) {
  const points = [];
  const values = [];
  for (let i = 0; i < N; i++) {
    const x = Math.random();
    values.push(4 * Math.sqrt(1 - x * x));
  }
  return { points, values };
}
/**
 * Buffon's Needle: needle length L=1, line spacing D=1.
 * Probability of crossing = 2L/(πD) => π ≈ 2/countProb
 */
export function buffon(N) {
  const points = [];
  const values = [];
  for (let i = 0; i < N; i++) {
    const d = Math.random() * 0.5; // distance from center to nearest line
    const theta = Math.random() * Math.PI; // needle angle
    const cross = d <= 0.5 * Math.sin(theta);
    points.push([d, theta]);
    values.push(cross ? 1 : 0);
  }
  return { points, values };
}

/**
 * Polar sampling: sample (r,θ) in [0,1]×[0,π/2] and map to (x,y).
 * This generates points non-uniformly in the square but still counts inside the circle.
 */
export function polar(N) {
  const points = [];
  const values = [];
  for (let i = 0; i < N; i++) {
    const theta = Math.random() * (Math.PI / 2);
    const r = Math.random();
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    points.push([x, y]);
    values.push(x * x + y * y < 1 ? 1 : 0);
  }
  return { points, values };
}

/**
 * Importance sampling for integral of 4*sqrt(1-x^2) over [0,1].
 * Use density p(x)=2/(π*sqrt(1-x^2)) via inverse CDF x=sin(πU/2).
 */
export function importance(N) {
  const points = [];
  const values = [];
  for (let i = 0; i < N; i++) {
    const u = Math.random();
    const x = Math.sin((Math.PI * u) / 2);
    points.push([x, 0]);
    // weight f(x)/p(x) = 4*sqrt(1-x^2) * (π*sqrt(1-x^2)/2)
    values.push(2 * Math.PI * (1 - x * x));
  }
  return { points, values };
}

/**
 * Quasi-Monte Carlo using Halton sequence bases 2 and 3.
 */
function halton(index, base) {
  let result = 0;
  let f = 1 / base;
  let i = index;
  while (i > 0) {
    result += f * (i % base);
    i = Math.floor(i / base);
    f /= base;
  }
  return result;
}

export function quasi(N) {
  const points = [];
  const values = [];
  for (let i = 1; i <= N; i++) {
    const x = halton(i, 2);
    const y = halton(i, 3);
    points.push([x, y]);
    values.push(x * x + y * y < 1 ? 1 : 0);
  }
  return { points, values };
}

/**
 * GPU Grid sampling: uniformly sample an N×N grid on the unit square via GPU.js,
 * count points inside quarter circle.
 */
export function gpuGrid(N) {
  if (typeof GPU === 'undefined') {
    throw new Error('GPU.js not loaded');
  }
  const total = N * N;
  const gpu = new GPU();
  const kernel = gpu
    .createKernel(function (n) {
      const i = this.thread.x;
      const x = ((i % n) + 0.5) / n;
      const y = (Math.floor(i / n) + 0.5) / n;
      return x * x + y * y < 1 ? 1 : 0;
    })
    .setOutput([total]);
  const values = Array.from(kernel(N));
  const points = [];
  return { points, values };
}

// Mapping of method keys to functions
export const methods = {
  quarter,
  integral,
  buffon,
  polar,
  importance,
  quasi,
};
