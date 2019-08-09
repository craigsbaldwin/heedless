/**
 * Cart Drawer.
 * ------------------------------------------------------------------------------
 * Creates cart drawer and listens for events.
 *
 * @namespace cartDrawer
 *
 */
import Cookies from 'js-cookie';
import merge from 'lodash-es/merge';

import cssClasses from '../helpers/cssClasses';
import graphqlCheckout from '../graphql/checkout';
import {on, formatMoney, imageParameters} from '../helpers/utils';

/**
 * DOM selectors.
 */
const selectors = {
  close: '[js-cart="close"]',
  lineItems: '[js-cart="lineItems"]',
  footer: '[js-cart="footer"]',
  total: '[js-cart="total"]',
  checkout: '[js-cart="checkout"]',
};

export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    lineItems: document.querySelector(selectors.lineItems),
    footer: document.querySelector(selectors.footer),
    total: document.querySelector(selectors.total),
    checkout: document.querySelector(selectors.checkout),
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
    Heedless.eventBus.listen(['Cart:updated', 'Cart:render'], () => renderDrawer());

    on('click', nodeSelectors.checkout, () => handleCheckoutClick());
  }

  /**
   * Render the cart drawer.
   */
  function renderDrawer() {
    const cart = Heedless.cart.get();

    if (!cart.lineItems) {
      nodeSelectors.lineItems.innerHTML = '<p>No products</p>';
      nodeSelectors.footer.classList.remove(cssClasses.active);
      return;
    }

    /**
     * Render loading state.
     */
    const html = cart.lineItems.map((lineItem) => {
      return lineItemTemplate(lineItem);
    }).join('');

    nodeSelectors.lineItems.innerHTML = html;
    nodeSelectors.footer.classList.add(cssClasses.active);
    nodeSelectors.total.innerText = formatMoney(cart.totalCost);

    /**
     * Render loaded state.
     */
    cart.lineItems.forEach((lineItem) => {
      if (!Heedless.products) {
        requestLineItemData(lineItem);
        return;
      }

      /**
       * Find matching product in storage.
       */
      const matchingProduct = Object.values(Heedless.products).find((product) => {
        return (product.variants && product.variants.some((variant) => variant.id === lineItem.variantId));
      });

      if (!matchingProduct || !matchingProduct.fullRender) {
        requestLineItemData(lineItem);
        return;
      }

      /**
       * Create combined line item data.
       */
      const combinedLineItem = merge(lineItem, matchingProduct);

      /**
       * Render using this data and replace existing.
       */
      const oldLineItem = nodeSelectors.lineItems.querySelector(`[data-variant-id="${lineItem.variantId}"]`);
      const newLineItem = document.createElement('div');
      newLineItem.innerHTML = lineItemTemplate(combinedLineItem);
      oldLineItem.parentNode.replaceChild(newLineItem, oldLineItem);
    });
  }

  /**
   * The HTML template for each line item.
   * @param {Object} lineItem the line item.
   * @returns the HTML template.
   */
  function lineItemTemplate(lineItem) {
    let type = 'loading';
    let image = `<div class="loading"></div>`;

    if (lineItem.fullRender) {
      type = 'complete';

      image = `
        <img
          class="line-item__image"
          alt="${lineItem.images[0].altText}"
          src="${imageParameters(lineItem.images[0].originalSrc, {size: '300x'})}"
          srcset="
            ${imageParameters(lineItem.images[0].originalSrc, {size: '300x'})} 300w,
            ${imageParameters(lineItem.images[0].originalSrc, {size: '600x'})} 600w",
            ${imageParameters(lineItem.images[0].originalSrc, {size: '900x'})} 900w",
            ${imageParameters(lineItem.images[0].originalSrc, {size: '1200x'})} 1200w",
          sizes="auto"
        >
      `;
    }

    return `
      <div
        class="cart-drawer__line-item line-item line-item--${type}"
        data-variant-id="${lineItem.variantId}"
      >
        <div class="line-item__image-container">
          ${image}
        </div>

        <div class="line-item__meta">
          <div class="line-item__title">
            ${lineItem.title}

            <span class="line-item__variant-title">
              – ${lineItem.variantTitle}
            </span>
          </div>

          <div class="line-item__price-container">
            ${lineItem.quantity}x ${formatMoney(lineItem.price)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Request line item data from GraphQL for incomplete data.
   * This isn't possible, can't retrieve handle from line items.
   * @param {Object} lineItem the line item to request.
   */
  function requestLineItemData(lineItem) {
    window.console.log('Data please', lineItem);
  }

  /**
   * Handle checkout click.
   */
  function handleCheckoutClick() {
    Heedless.eventBus.emit('Drawer:open', 'checkout');

    if (Heedless.shipping && Heedless.shipping.length > 0) {
      return;
    }

    graphqlCheckout().getShipsToCountries()
      .then((response) => {
        if (response) {
          Heedless.eventBus.emit('Checkout:updateShipping', response);
          Heedless.eventBus.emit('Storage:shipping', response);
          return;
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
  }

  /**
   * Expose public interface.,
   */
  return Object.freeze({
    init,
  });
};
