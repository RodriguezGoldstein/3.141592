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


/**
 * Polar sampling: sample (r,θ) in [0,1]×[0,π/2] and map to (x,y).
 * This generates points non-uniformly in the square but still counts inside the circle.
 */

/**
 * Importance sampling for integral of 4*sqrt(1-x^2) over [0,1].
 * Use density p(x)=2/(π*sqrt(1-x^2)) via inverse CDF x=sin(πU/2).
 */

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

// Mapping of method keys to functions
export const methods = {
  quarter,
  quasi,
};
