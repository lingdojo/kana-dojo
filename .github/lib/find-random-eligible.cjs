/**
 * Pick a random item from `items` that satisfies `predicate`.
 * Returns null when the array is empty or nothing qualifies.
 */
function findRandomEligible(items, predicate) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const eligible = items.filter(predicate);

  if (eligible.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex];
}

module.exports = findRandomEligible;
