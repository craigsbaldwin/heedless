/**
 * Events
 * ------------------------------------------------------------------------------
 * Respond to events.
 *
 * @namespace events
 *
 */
import cssClasses from './cssClasses';
import {on} from './utils';

/**
 * DOM selectors.
 */
const selectors = {
  overlay: '[js-page="overlay"]',
  page: '[js-site="page"]',
  pageEvent: '[js-page]',
};

export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    overlay: document.querySelector(selectors.overlay),
    page: [...document.querySelectorAll(selectors.page)],
  };

  /**
   * Handle forward/back browser navigation.
   */
  window.onpopstate = function() {
    checkUrl();
  };

  /**
   * Init the events.
   */
  function init() {
    checkUrl();
    setEventListeners();
  }

  /**
   * Check page's URL to load based on that.
   */
  function checkUrl() {
    if (location.href === `${location.origin}/`) {
      Heedless.eventBus.emit('Collection:open', 'frontpage');
      return;
    }

    if (location.search) {
      const handle = location.search.replace('?product=', '');
      Heedless.eventBus.emit('Product:open', handle);
    }
  }

  /**
   * Listen for all client events, filtered by needed.
   */
  function setEventListeners() {
    on('click', document.querySelector('body'), (event) => {
      const target = event.target.closest(selectors.pageEvent);

      if (isCorrectButton(target, 'addToCart')) {
        handleAddToCartClick(target);
      }

      if (isCorrectButton(target, 'viewProduct')) {
        Heedless.eventBus.emit('Product:open', target.getAttribute('data-handle'));
      }

      if (isCorrectButton(target, 'closeProduct')) {
        Heedless.eventBus.emit('Product:close');
      }

      if (isCorrectButton(target, 'toggleCartDrawer')) {
        Heedless.eventBus.emit('Cart:openDrawer');
      }

      if (isCorrectButton(target, 'overlay')) {
        Heedless.eventBus.emit('Overlay:close');
      }

      if (isCorrectButton(target, 'home')) {
        handleHomeClick();
      }
    });

    Heedless.eventBus.listen('Overlay:close', () => closeOverlay());
  }

  /**
   * Test for correct button.
   * @param {HTMLElement} target the clicked item.
   * @param {String} attribute the desired attribute.
   * @returns {Boolean} whether it's the correct element.
   */
  function isCorrectButton(target, attribute) {
    return (
      target &&
      typeof target.attributes['js-page'] !== 'undefined' &&
      target.getAttribute('js-page') === attribute
    );
  }

  /**
   * Update the history state.
   * @param {String} title history title.
   * @param {String} url the history url.
   */
  function updateHistory(title, url) {
    window.history.pushState({
      html: '',
      pageTitle: title,
    }, '', url);
  }

  /**
   * Add product to cart.
   * @param {HTMLElement} target the clicked button (has data attributes).
   */
  function handleAddToCartClick(target) {
    const {quantity, variantId} = target.dataset;

    const lineItem = {
      variantId,
      quantity: Number(quantity) || 1,
    };

    target.innerText = 'Adding';
    target.classList.add(cssClasses.disabled);
    Heedless.eventBus.emit('Cart:addToCart', lineItem);
  }

  /**
   * Close the overlay.
   */
  function closeOverlay() {
    nodeSelectors.overlay.classList.remove(cssClasses.active);
  }

  /**
   * Go home.
   */
  function handleHomeClick() {
    nodeSelectors.page.forEach((page) => {
      page.classList.remove(cssClasses.active);
    });

    Heedless.events.updateHistory('Homepage', '/');
    Heedless.eventBus.emit('Collection:open', 'frontpage');
  }

  return Object.freeze({
    init,
    updateHistory,
  });
};
