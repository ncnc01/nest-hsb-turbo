/**
 * 수학 관련 Handlebars 헬퍼들
 */

/**
 * 두 수를 더합니다
 * @param a 첫 번째 수
 * @param b 두 번째 수
 * @returns 합계
 */
export function add(a: number, b: number): number {
  return Number(a) + Number(b);
}

/**
 * 첫 번째 수에서 두 번째 수를 뺍니다
 * @param a 첫 번째 수
 * @param b 두 번째 수  
 * @returns 차이
 */
export function subtract(a: number, b: number): number {
  return Number(a) - Number(b);
}

/**
 * 두 수를 곱합니다
 * @param a 첫 번째 수
 * @param b 두 번째 수
 * @returns 곱
 */
export function multiply(a: number, b: number): number {
  return Number(a) * Number(b);
}

/**
 * 첫 번째 수를 두 번째 수로 나눕니다
 * @param a 첫 번째 수
 * @param b 두 번째 수
 * @returns 몫
 */
export function divide(a: number, b: number): number {
  if (Number(b) === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return Number(a) / Number(b);
}

/**
 * 첫 번째 수를 두 번째 수로 나눈 나머지를 구합니다
 * @param a 첫 번째 수
 * @param b 두 번째 수
 * @returns 나머지
 */
export function modulo(a: number, b: number): number {
  return Number(a) % Number(b);
}

/**
 * 수를 지정된 자릿수로 반올림합니다
 * @param num 반올림할 수
 * @param decimals 소수점 자릿수 (기본값: 0)
 * @returns 반올림된 수
 */
export function round(num: number, decimals: number = 0): number {
  const factor = Math.pow(10, Number(decimals));
  return Math.round(Number(num) * factor) / factor;
}

/**
 * 수를 올림합니다
 * @param num 올림할 수
 * @returns 올림된 수
 */
export function ceil(num: number): number {
  return Math.ceil(Number(num));
}

/**
 * 수를 내림합니다
 * @param num 내림할 수
 * @returns 내림된 수
 */
export function floor(num: number): number {
  return Math.floor(Number(num));
}

/**
 * 절댓값을 구합니다
 * @param num 수
 * @returns 절댓값
 */
export function abs(num: number): number {
  return Math.abs(Number(num));
}

/**
 * 최댓값을 구합니다
 * @param args 비교할 수들
 * @returns 최댓값
 */
export function max(...args: any[]): number {
  // Handlebars options 객체 제거
  const numbers = args.slice(0, -1).map(Number);
  return Math.max(...numbers);
}

/**
 * 최솟값을 구합니다
 * @param args 비교할 수들
 * @returns 최솟값
 */
export function min(...args: any[]): number {
  // Handlebars options 객체 제거
  const numbers = args.slice(0, -1).map(Number);
  return Math.min(...numbers);
}

/**
 * 두 수의 평균을 구합니다
 * @param args 평균을 구할 수들
 * @returns 평균
 */
export function average(...args: any[]): number {
  // Handlebars options 객체 제거
  const numbers = args.slice(0, -1).map(Number);
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * 수가 짝수인지 확인합니다
 * @param num 확인할 수
 * @returns 짝수면 true, 홀수면 false
 */
export function isEven(num: number): boolean {
  return Number(num) % 2 === 0;
}

/**
 * 수가 홀수인지 확인합니다
 * @param num 확인할 수
 * @returns 홀수면 true, 짝수면 false
 */
export function isOdd(num: number): boolean {
  return Number(num) % 2 !== 0;
}