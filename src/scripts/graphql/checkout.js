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
          window.console.log('getShipsToCountries Error', error);
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

  /**
   * Update email.
   * @param {String} emailAddress the email address.
   */
  function updateEmail(emailAddress) {
    return new Promise((resolve) => {
      const cart = JSON.parse(Cookies.get('cart'));
      const graphQlQuery = updateEmailQuery();

      const query = {
        method: 'post',
        headers: {
          'Content-Type': 'application/graphql',
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

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          const checkout = response.data.checkoutEmailUpdateV2.checkout;
          resolve(checkout);
        })
        .catch((error) => {
          window.console.log('updateEmail Error', error);
        });
    });
  }

  /**
   * Update email query.
   */
  function updateEmailQuery() {
    return `
      mutation checkoutEmailUpdateV2($checkoutId: ID!, $email: String!) {
        checkoutEmailUpdateV2(checkoutId: $checkoutId, email: $email) {
          checkout {
            email
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

  return Object.freeze({
    createCheckout,
    getShipsToCountries,
    updateEmail,
  });
};
