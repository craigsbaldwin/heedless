/**
 * GraphQL: Checkout.
 * ------------------------------------------------------------------------------
 * Ways of accessing cart API data.
 *
 * @namespace graphqlCart
 *
 */
import fetch from 'node-fetch';
import Cookies from 'js-cookie';

import checkoutAttributesUpdateV2 from './queries/checkoutAttributesUpdateV2.graphql';
import checkoutLineItemsReplace from './queries/checkoutLineItemsReplace.graphql';

/**
 * Global variables.
 */
const shopUrl = 'https://heedless.myshopify.com';
const accessToken = 'ebc823ca217a89fecdc9cce9f063e902';
const method = 'post';
const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Storefront-Access-Token': accessToken,
};

export default () => {

  /**
   * Create checkout instance.
   */
  function getCart() {
    return new Promise((resolve) => {
      const cart = JSON.parse(Cookies.get('cart'));

      const query = {
        method,
        headers,
        body: JSON.stringify({
          query: checkoutAttributesUpdateV2,
          variables: {
            checkoutId: cart.id,
            input: {
              customAttributes: {
                key: "Heedless",
                value: "v0.1",
              },
            },
          },
        }),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          if (response.errors) {
            throw new Error(response.errors[0].message);
          }

          let lineItems = [];
          const checkout = response.data.checkoutAttributesUpdateV2.checkout.lineItems.edges;

          if (checkout.length > 0) {
            lineItems = checkout.map((lineItem) => {
              return {
                variantId: lineItem.node.variant.id,
                quantity: lineItem.node.quantity,
              };
            });
          }

          resolve(lineItems);
        })
        .catch((error) => {
          window.console.log('getCart', error);
        });
    });
  }

  /**
   * Replace the cart with new line items.
   * @param {Array} newLineItems the line items to replace the cart with.
   */
  function replaceCart(newLineItems) {
    return new Promise((resolve) => {
      const cart = JSON.parse(Cookies.get('cart'));

      const query = {
        method,
        headers,
        body: JSON.stringify({
          query: checkoutLineItemsReplace,
          variables: {
            checkoutId: cart.id,
            lineItems: newLineItems,
          },
        }),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          if (response.errors) {
            throw new Error(response.errors[0].message);
          }

          resolve(response);
        })
        .catch((error) => {
          window.console.log('replaceCart', error);
        });
    });
  }

  return Object.freeze({
    getCart,
    replaceCart,
  });
};
