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

/**
 * Global variables.
 */
const shopUrl = 'https://heedless.myshopify.com';
const accessToken = 'ebc823ca217a89fecdc9cce9f063e902';

export default () => {

  /**
   * Create checkout instance.
   */
  function getCart() {
    return new Promise((resolve) => {
      const cart = JSON.parse(Cookies.get('cart'));
      const graphQlQuery = getCartQuery();

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
          window.console.log('getCart Error', error);
        });
    });
  }

  /**
   * Check line items in cart (adapted mutation).
   */
  function getCartQuery() {
    return `
      mutation checkoutAttributesUpdateV2($checkoutId: ID!, $input: CheckoutAttributesUpdateV2Input!) {
        checkoutAttributesUpdateV2(checkoutId: $checkoutId, input: $input) {
          checkout {
            lineItems(first: 20) {
              edges {
                node {
                  variant {
                    id
                  }
                  quantity
                }
              }
            }
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
   * Replace the cart with new line items.
   * @param {Array} newLineItems the line items to replace the cart with.
   */
  function replaceCart(newLineItems) {
    return new Promise((resolve) => {
      const cart = JSON.parse(Cookies.get('cart'));
      const graphQlQuery = replaceCartQuery();

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
            lineItems: newLineItems,
          },
        }),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          window.console.log('replaceCart Error', error);
        });
    });
  }

  /**
   * Add to cart (replace cart mutation).
   */
  function replaceCartQuery() {
    return `
      mutation checkoutLineItemsReplace($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
        checkoutLineItemsReplace(checkoutId: $checkoutId, lineItems: $lineItems) {
          checkout {
            lineItems(first: 20) {
              edges {
                node {
                  variant {
                    id
                    title
                    priceV2 {
                      amount
                    }
                  }
                  quantity
                  title
                }
              }
            }
          }
          userErrors {
            code
            field
            message
          }
        }
      }
    `;
  }

  return Object.freeze({
    getCart,
    replaceCart,
  });
};
