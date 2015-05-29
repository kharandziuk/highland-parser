var H = require('highland');

console.log(
  H({a: {}, b: {}}).flatten().toArray()
);
