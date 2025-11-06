function removeDuplicatesByKey(arr, key) {
  const uniqueArray = [];
  const keyTracker = new Set();

  for (const obj of arr) {
    const keyValue = obj[key];

    if (!keyTracker.has(keyValue)) {
      uniqueArray.push(obj);
      keyTracker.add(keyValue);
    }
  }

  return uniqueArray.sort((a, b) => (a[key] > b[key] ? 1 : -1));
}

export default removeDuplicatesByKey;
