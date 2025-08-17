// 모든 헬퍼를 한 곳에서 export
export * from './formatters.helper';
export * from './conditionals.helper';
export * from './utilities.helper';
export * from './turbo.helper';
export * from './styling.helper';
export * from './math.helper';

// 헬퍼 그룹별로 import하기 쉽도록 재구성
import * as formatters from './formatters.helper';
import * as conditionals from './conditionals.helper';
import * as utilities from './utilities.helper';
import * as turbo from './turbo.helper';
import * as styling from './styling.helper';
import * as math from './math.helper';

export const helpers = {
  formatters,
  conditionals,
  utilities,
  turbo,
  styling,
  math,
};

// 모든 헬퍼를 플랫 객체로 export (등록 시 편의성)
export const allHelpers = {
  // Formatters
  dateFormat: formatters.dateFormat,
  formatDate: formatters.dateFormat, // Alias for compatibility
  numberFormat: formatters.numberFormat,
  truncate: formatters.truncate,
  json: formatters.json,
  uppercase: formatters.uppercase,
  lowercase: formatters.lowercase,
  capitalize: formatters.capitalize,
  urlEncode: formatters.urlEncode,
  htmlEscape: formatters.htmlEscape,
  length: formatters.length,

  // Conditionals
  eq: conditionals.eq,
  ne: conditionals.ne,
  gt: conditionals.gt,
  gte: conditionals.gte,
  lt: conditionals.lt,
  lte: conditionals.lte,
  and: conditionals.and,
  or: conditionals.or,
  not: conditionals.not,
  includes: conditionals.includes,
  isEmpty: conditionals.isEmpty,
  isNotEmpty: conditionals.isNotEmpty,
  typeof: conditionals.typeOf,
  isArray: conditionals.isArray,
  isObject: conditionals.isObject,
  isNumber: conditionals.isNumber,
  isString: conditionals.isString,
  isBoolean: conditionals.isBoolean,
  switch: conditionals.switchHelper,
  case: conditionals.caseHelper,
  default: conditionals.defaultHelper,

  // Utilities
  range: utilities.range,
  toArray: utilities.toArray,
  sort: utilities.sort,
  filter: utilities.filter,
  slice: utilities.slice,
  first: utilities.first,
  last: utilities.last,
  withIndex: utilities.withIndex,
  selected: utilities.selected,
  checked: utilities.checked,
  disabled: utilities.disabled,
  className: utilities.className,
  classNames: utilities.classNames,
  activePage: utilities.activePage,
  queryString: utilities.queryString,
  defaultValue: utilities.defaultValue,
  repeat: utilities.repeat,
  merge: utilities.merge,
  pick: utilities.pick,
  omit: utilities.omit,
  index: utilities.index,
  lookup: utilities.lookup,

  // Turbo
  turboFrame: turbo.turboFrame,
  turboTarget: turbo.turboTarget,
  turboAction: turbo.turboAction,
  turboStreamSrc: turbo.turboStreamSrc,
  turboDisable: turbo.turboDisable,
  turboPermanent: turbo.turboPermanent,
  turboPrefetch: turbo.turboPrefetch,
  turboPreload: turbo.turboPreload,
  turboConfirm: turbo.turboConfirm,
  turboMethod: turbo.turboMethod,
  turboCacheControl: turbo.turboCacheControl,
  turboStream: turbo.turboStream,
  turboFrameTag: turbo.turboFrameTag,
  turboLoading: turbo.turboLoading,
  turboNavigationClass: turbo.turboNavigationClass,

  // Styling
  btn: styling.btn,
  card: styling.card,
  badge: styling.badge,
  alert: styling.alert,
  formInput: styling.formInput,
  navLink: styling.navLink,
  navIcon: styling.navIcon,
  tableCell: styling.tableCell,
  grid: styling.grid,
  flex: styling.flex,
  spacing: styling.spacing,
  text: styling.text,

  // Math
  add: math.add,
  subtract: math.subtract,
  multiply: math.multiply,
  divide: math.divide,
  modulo: math.modulo,
  round: math.round,
  ceil: math.ceil,
  floor: math.floor,
  abs: math.abs,
  max: math.max,
  min: math.min,
  average: math.average,
  isEven: math.isEven,
  isOdd: math.isOdd,
};