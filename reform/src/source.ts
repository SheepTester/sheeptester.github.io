export class Source<T> {
  lastValue?: T
  dependents: ((value: T) => void)[] = []

  handleValue (value: T): void {
    // TODO: skip if the value is the same
    this.lastValue = value
    for (const dependent of this.dependents) {
      dependent(value)
    }
  }
}
