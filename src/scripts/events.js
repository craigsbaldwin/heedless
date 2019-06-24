/**
 * Events
 * ------------------------------------------------------------------------------
 * Respond to events.
 *
 * @namespace events
 *
 */
import templates from './templates';
import {on} from './utils';

export default () => {

  /**
   * Handle forward/back browser navigation.
   */
  window.onpopstate = function() {
    checkUrl();
  }

  /**
   * Check page's URL to load based on that.
   */
  function checkUrl() {
    if (location.href === `${location.origin}/`) {
      templates().requestCollection('frontpage');
      return;
    }

    if (location.search) {
      const handle = location.search.replace('?product=', '');
      templates().requestProductPage(handle);
    }
  }

  /**
   * Listen for all client events, filtered by needed
   */
  function addEventListeners() {
    on('click', document.querySelector('body'), (event) => {
      // if (isCorrectButton(event.target, 'addToCart')) {
      //   handleAddToCartClick(event.target);
      //   return;
      // }

      if (isCorrectButton(event.target, 'viewProduct')) {
        handleViewProductClick(event.target);
        return;
      }

      if (isCorrectButton(event.target, 'closeProduct')) {
        handleCloseProductClick();
        return;
      }
    });
  }

  /**
   * Test for correct button.
   * @param {HTMLElement} target the clicked item.
   * @param {String} attribute the desired attribute.
   * @returns {Boolean} whether it's the correct element.
   */
  function isCorrectButton(target, attribute) {
    return (
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
      'html': '',
      'pageTitle': title,
    }, '', url);
  }

  /**
   * View a product page.
   * @param {HTMLElement} target the clicked button (has data attributes).
   */
  function handleViewProductClick(target) {
    const handle = target.parentNode.getAttribute('data-handle');
    templates().requestProductPage(handle);
  }

  /**
   * Handle the close product click.
   */
  function handleCloseProductClick() {
    templates().requestCollection('frontpage');

    updateHistory('Homepage', '/');
    document.querySelector('[js-page="productPage"]').classList.remove('is-active');
    document.querySelector('[js-page="overlay"]').classList.remove('is-active');
  }

  return Object.freeze({
    checkUrl,
    addEventListeners,
    updateHistory,
  })
}
