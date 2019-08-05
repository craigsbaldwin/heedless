/**
 * Component: Checkout drawer.
 * ------------------------------------------------------------------------------
 * Checkout drawer for updating email and address.
 *
 * @namespace checkoutDrawer
 *
 */
import cssClasses from '../helpers/cssClasses';
import {on} from '../helpers/utils';

/**
 * DOM selectors.
 */
const selectors = {
  countries: '[js-checkout="countries"]',
};

export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    countries: document.querySelector(selectors.countries),
  };

  /**
   * Init the cart.
   */
  function init() {
    setEventListeners();
  }

  /**
   * Set listeners.
   */
  function setEventListeners() {
    Heedless.eventBus.listen('Checkout:updateShipping', (countries) => updateShipping(countries));
  }

  /**
   * Update shipping options
   * @param {Array} countries the shipping countries.
   */
  function updateShipping(countries) {
    if (nodeSelectors.countries.getAttribute('data-loaded')) {
      return;
    }

    const html = countries.map((country) => {
      return `<option value="${country}">${country}</option>`;
    }).join('');

    nodeSelectors.countries.innerHTML = html;
    nodeSelectors.countries.setAttribute('data-loaded', true);
  }

  /**
   * Expose public interface.,
   */
  return Object.freeze({
    init,
  });
};
