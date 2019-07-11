/**
 * Index functionality
 * ------------------------------------------------------------------------------
 * Homepage demo functionality;
 *
 */
import '../styles/theme.scss';

import collection from './templates/collection';
import product from './templates/product';

import cart from './components/cart';
import cartDrawer from './components/cart-drawer';

import eventBus from './helpers/event-bus';
import events from './helpers/events';

import storage from './helpers/storage';

/**
* Global Heedless utils
*/
window.Heedless = window.Heedless || {};
window.Heedless.eventBus = eventBus();
window.Heedless.collections = window.Heedless.collections || {};
window.Heedless.products = window.Heedless.products || {};
window.Heedless.cart = cart();
window.Heedless.events = events();
window.Heedless.collection = collection();
window.Heedless.product = product();

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
  cartDrawer().init();
  product().init();
  storage().init();
  events().init();
});

// Cache images using PWA
// Variant selector
