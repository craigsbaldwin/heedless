/**
 * GraphQL: Checkout.
 * ------------------------------------------------------------------------------
 * Ways of accessing cart API data.
 *
 * @namespace graphqlCheckout
 *
 */
import fetch from 'node-fetch';

import checkoutCreate from './queries/checkoutCreate.graphql';
import shipsToCountries from './queries/shipsToCountries.graphql';
import checkoutEmailUpdateV2 from './queries/checkoutEmailUpdateV2.graphql';
import checkoutDiscountCodeApplyV2 from './queries/checkoutDiscountCodeApplyV2.graphql';

/**
 * Global variables.
 */
const shopUrl = 'https://heedless.myshopify.com';
const accessToken = 'ebc823ca217a89fecdc9cce9f063e902';
const path = `${shopUrl}/api/graphql`;
const method = 'post';
const headers = {
  'Content-Type': 'application/graphql',
  'X-Shopify-Storefront-Access-Token': accessToken,
};
const headersJson = {
  'Content-Type': 'application/json',
  'X-Shopify-Storefront-Access-Token': accessToken,
};

export default () => {

  /**
   * Create checkout instance.
   */
  function createCheckout() {
    return new Promise((resolve) => {
      const query = {
        method,
        headers,
        body: checkoutCreate,
      };

      fetch(path, query)
        .then((response) => response.json())
        .then((response) => {
          if (response.errors) {
            throw new Error(response.errors[0].message);
          }

          const checkout = response.data.checkoutCreate.checkout;
          resolve(checkout);
        })
        .catch((error) => {
          window.console.log('createCheckout', error);
        });
    });
  }

  /**
   * Get ships to countries.
   */
  function getShipsToCountries() {
    return new Promise((resolve) => {
      const query = {
        method,
        headers,
        body: shipsToCountries,
      };

      fetch(path, query)
        .then((response) => response.json())
        .then((response) => {
          if (response.errors) {
            throw new Error(response.errors[0].message);
          }

          const countries = response.data.shop.shipsToCountries;
          resolve(countries);
        })
        .catch((error) => {
          window.console.log('getShipsToCountries', error);
        });
    });
  }

  /**
   * Update email.
   * @param {String} emailAddress the email address.
   */
  function updateEmail(emailAddress) {
    return new Promise((resolve) => {
      const cart = Heedless.cart.get();
      const query = {
        method,
        headersJson,
        body: JSON.stringify({
          query: checkoutDiscountCodeApplyV2,
          variables: {
            checkoutId: cart.id,
            discountCode: emailAddress,
          },
        }),
      };

      console.log('query', cart.id);

      fetch(path, query)
        .then((response) => {
          console.log('response', response);
          response.json();
        })
        .then((response) => {
          if (response.errors) {
            console.log('errors', response.errors);
            throw new Error(response.errors[0].message);
          }

          const checkout = response.data.checkoutEmailUpdateV2.checkout;
          console.log('response', response);
          resolve(checkout);
        })
        .catch((error) => {
          window.console.log('updateEmail', error);
        });
    });
  }

  return Object.freeze({
    createCheckout,
    getShipsToCountries,
    updateEmail,
  });
};
