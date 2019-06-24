/**
 * Index functionality
 * ------------------------------------------------------------------------------
 * Homepage demo functionality;
 *
 */
import cart from './cart.js';
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

// Make a cart that works
// Variant selector
// Collection handle based localStorage
// Format money