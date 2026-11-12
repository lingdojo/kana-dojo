function findRandomEligible(items, predicate) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const eligible =
    typeof predicate === 'function' ? items.filter(predicate) : items;
  if (eligible.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex];
}

function toJsonStringLiteral(value) {
  return JSON.stringify(value);
}

module.exports = { findRandomEligible, toJsonStringLiteral };
