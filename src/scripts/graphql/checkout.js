/**
 * GraphQL: Checkout.
 * ------------------------------------------------------------------------------
 * Ways of accessing cart API data.
 *
 * @namespace graphqlCheckout
 *
 */
import fetch from 'node-fetch';

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
          'Content-Type': 'application/graphql',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: createCheckoutQuery(),
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
   * Create checkout query.
   */
  function createCheckoutQuery() {
    return `
      mutation {
        checkoutCreate(input: {}) {
          checkout {
            id
            webUrl
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }
    `;
  }

  /**
   * Get ships to countries.
   */
  function getShipsToCountries() {
    return new Promise((resolve) => {
      const query = {
        method: 'post',
        headers: {
          'Content-Type': 'application/graphql',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: getShipsToCountriesQuery(),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          const countries = response.data.shop.shipsToCountries;
          resolve(countries);
        })
        .catch((error) => {
          window.console.log('createCheckout Error', error);
        });
    });
  }

  /**
   * Get ships to countries query.
   */
  function getShipsToCountriesQuery() {
    return `
      {
        shop {
          shipsToCountries
        }
      }
    `;
  }

  return Object.freeze({
    createCheckout,
    getShipsToCountries,
  });
};
