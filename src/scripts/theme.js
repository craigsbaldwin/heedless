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
import search from './components/search';

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
  collection().init();
  product().init();
  storage().init();
  events().init();
  search().init();
});

// Cache images using PWA
// Quantity selector
// Inventory limits to quantity selectors
// Render cart images (with no local storage)
// Create global page thing to manage history
// Use existing image for loading state of product, blur it, fade in high res

// Rebuild product page, product.js renders page, product-form.js renders form and handles requests for inventory and variants
