/* eslint no-console: ["error", { allow: ["info", "warn", "error"] }] */

// move to utils.js

function log(...args) {
  if (window.ERROR_LEVEL > 0) {
    if ([...args].every((i) => typeof i === 'string')) {
      console.info([...args].join(' '));
    } else {
      [...args].forEach((i) => {
        console.info(i);
      });
    }
  }
}

log('load.js loaded');
