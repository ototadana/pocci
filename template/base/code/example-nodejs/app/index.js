'use strict';
function hello(name) {
  if(name) {
    return 'hello, ' + $.trim(name);
  } else {
    return 'bye';
  }
}
