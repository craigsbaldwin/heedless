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

export default () => {

  /**
   * Create checkout instance.
   */
  function createCheckout() {
    return new Promise((resolve) => {
      const query = {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: checkoutCreate,
      };

      fetch(`${shopUrl}/api/graphql`, query)
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
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: shipsToCountries,
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          const countries = response.data.shop.shipsToCountries;
          resolve(countries);
        })
        .catch((error) => {
          window.console.log('getShipsToCountries Error', error);
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
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: JSON.stringify({
          query: graphQlQuery,
          variables: {
            checkoutId: cart.id,
            email: emailAddress,
          },
        }),
      };

      console.log('query', query);

      fetch(`${shopUrl}/api/graphql`, query)
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
