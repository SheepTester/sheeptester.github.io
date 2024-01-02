/**
 * Based on
 * https://github.com/SheepTester/hello-world/blob/master/questionable-host/gdrive/upload-videos.ts#L17
 *
 * Note: assumes `bytes` is under a terabyte (currently shows 1 TB = 1.00e+3
 * GB).
 */
export function displayBytes (bytes: number): string {
  if (bytes > 1_000_000_000) {
    return `${(bytes / 1_000_000_000).toPrecision(3)} GB`
  } else if (bytes > 1_000_000) {
    return `${(bytes / 1_000_000).toPrecision(3)} MB`
  } else if (bytes > 1_000) {
    return `${(bytes / 1_000).toPrecision(3)} kB`
  } else if (bytes !== 1) {
    return `${bytes} bytes`
  } else {
    return '1 byte'
  }
}
