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
window.Heedless.events = events();
window.Heedless.templates = templates();

// /**
//  * Service worker.
//  */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/assets/service-worker.js');
  });
}

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

// Cache images using PWA
// Make a cart that works
// Variant selector
// Collection handle based localStorage
// Format money
