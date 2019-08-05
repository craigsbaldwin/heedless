/**
 * Component: Checkout drawer.
 * ------------------------------------------------------------------------------
 * Checkout drawer for updating email and address.
 *
 * @namespace checkoutDrawer
 *
 */
import Cookies from 'js-cookie';

import graphqlCheckout from '../graphql/checkout';
import cssClasses from '../helpers/cssClasses';
import {on} from '../helpers/utils';

/**
 * DOM selectors.
 */
const selectors = {
  countries: '[js-checkout="countries"]',
  required: '[js-form="required"]',
  email: '[js-checkout="email"]',
  checkoutLink: '[js-checkout="link"]',
};

export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    countries: document.querySelector(selectors.countries),
    required: [...document.querySelectorAll(selectors.required)],
    email: document.querySelector(selectors.email),
    checkoutLink: document.querySelector(selectors.checkoutLink),
  };

  /**
   * Init the cart.
   */
  function init() {
    setEventListeners();
    updateCheckoutForm();
  }

  /**
   * Set listeners.
   */
  function setEventListeners() {
    Heedless.eventBus.listen('Checkout:updateShipping', (countries) => updateShipping(countries));

    on('click', nodeSelectors.checkoutLink, (event) => handleCheckoutClick(event));
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

  function handleCheckoutClick(event) {
    event.preventDefault();
    let errors = false;

    nodeSelectors.required.forEach((element) => {
      if (element.value !== '') {
        element.classList.remove(cssClasses.error);
        return;
      }

      element.classList.add(cssClasses.error);
      errors = true;
    });

    if (errors) {
      return;
    }

    event.target.classList.add(cssClasses.disabled);
    event.target.innerText = 'Saving';

    updateDetails();
  }

  /**
   * Update checkout details from form.
   */
  function updateDetails() {
    const email = nodeSelectors.email.value;

    graphqlCheckout().updateEmail(email)
      .then((response) => {
        if (response) {
          Heedless.emit('Cart:updated', response);
          return;
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
  }

  /**
   * Update checkout form from saved values.
   */
  function updateCheckoutForm() {
    if (Heedless.shipping && Heedless.shipping.length > 0) {
      Heedless.eventBus.emit('Checkout:updateShipping', Heedless.shipping);
    }

    const cart = Cookies.getJSON('cart');

    if (cart && cart.address) {
      Object.keys(cart.address).forEach((key) => {
        nodeSelectors[key].value = cart.address[key];
      });
    }
  }

  /**
   * Expose public interface.,
   */
  return Object.freeze({
    init,
  });
};
