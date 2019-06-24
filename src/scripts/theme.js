/**
 * Index functionality
 * ------------------------------------------------------------------------------
 * Homepage demo functionality;
 *
 */
import '../styles/theme.scss';

import cart from './cart';
import events from './events';
import templates from './templates';
import storage from './storage';

/**
* Global Heedless utils
*/
window.Heedless = window.Heedless || {};
window.Heedless.collections = window.Heedless.collections || {};
window.Heedless.products = window.Heedless.products || {};
window.Heedless.cart = cart();

// /**
//  * Service worker.
//  */
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js');
//   });
// }

/**
 * Document ready.
 */
document.addEventListener('DOMContentLoaded', () => {
  cart().init();
  storage().init();
  events().checkUrl();
  events().addEventListeners();
  templates().requestCollection('frontpage');
});

// Use dev-server
// Add file-loader https://thoughtbot.com/blog/setting-up-webpack-for-react-and-hot-module-replacement
// Generate SSL for dev-server https://gist.github.com/pgilad/63ddb94e0691eebd502deee207ff62bd

// Make a cart that works
// Variant selector
// Collection handle based localStorage
// Format money
