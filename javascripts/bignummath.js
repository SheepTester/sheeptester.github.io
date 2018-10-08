function add(a, b) {
  const maxLength = Math.max(a.length, b.length);
  let result = '';
  let carry = 0;
  for (let i = 1; i <= maxLength; i++) {
    const digitSum = carry + +(a[a.length - i] || 0) + +(b[b.length - i] || 0);
    carry = Math.floor(digitSum / 10);
    result = digitSum % 10 + result;
  }
  return result;
}
