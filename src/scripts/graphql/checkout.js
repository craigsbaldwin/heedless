/**
 * GraphQL: Checkout.
 * ------------------------------------------------------------------------------
 * Ways of accessing cart API data.
 *
 * @namespace graphqlCheckout
 *
 */
import fetch from 'node-fetch';
import Cookies from 'js-cookie';

import checkoutCreate from './queries/checkoutCreate.graphql';
import shipsToCountries from './queries/shipsToCountries.graphql';
import checkoutEmailUpdateV2 from './queries/checkoutEmailUpdateV2.graphql';

/**
 * Global variables.
 */
const shopUrl = 'https://heedless.myshopify.com';
const accessToken = 'ebc823ca217a89fecdc9cce9f063e902';
const path = `${shopUrl}/api/graphql`;
const method = 'post';
const headers = {
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
          const checkout = response.data.checkoutCreate.checkout;
          resolve(checkout);
        })
        .catch((error) => {
          window.console.log('createCheckout Error', error);
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
          console.log('response', response);
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
      const cart = JSON.parse(Cookies.get('cart'));
      const graphQlQuery = checkoutEmailUpdateV2;

      const query = {
        method,
        headers,
        body: JSON.stringify({
          query: graphQlQuery,
          variables: {
            checkoutId: cart.id,
            email: emailAddress,
          },
        }),
      };

      console.log('query', query);

      fetch(path, query)
        .then((response) => response.json())
        .then((response) => {
          if (response.errors) {
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
