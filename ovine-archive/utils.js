export function getItemByProperty (array, property, value) {
  return array.find(({ [property]: item }) => item === value)
}
