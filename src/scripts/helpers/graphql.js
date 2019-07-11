/**
 * GraphQL helper functions
 * ------------------------------------------------------------------------------
 * Ways of accessing storefront API data.
 *
 * @namespace graphql
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
                  }
                  quantity
                  id
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

  /**
   * Collection and its products query.
   * @param {String} handle the collection handle.
   * @param {Number} limit number of products to load.
   */
  function collectionsQuery(handle, limit) {
    return `
      {
        collectionByHandle(handle: "${handle}") {
          products(first: ${limit}) {
            edges {
              node {
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      smallImage: transformedSrc(maxWidth: 300)
                      mediumImage: transformedSrc(maxWidth: 600)
                      altText
                    }
                  }
                }
                collections(first: 5) {
                  edges {
                    node {
                      handle
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
  }

  /**
   * Product query.
   * @param {String} handle the product handle.
   */
  function productQuery(handle) {
    return `
      {
        productByHandle(handle: "${handle}") {
          title
          handle
          descriptionHtml
          images(first: 1) {
            edges {
              node {
                largeImage: transformedSrc(maxWidth: 900)
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                priceV2 {
                  amount
                }
              }
            }
          }
        }
      }
    `;
  }

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
          return error;
        });
    });
  }

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
          const edges = response.data.checkoutAttributesUpdateV2.checkout.lineItems.edges;

          if (edges.length > 0) {
            lineItems = edges.map((lineItem) => {
              return {
                variantId: lineItem.node.variant.id,
                quantity: lineItem.node.quantity,
              };
            });
          }

          resolve(lineItems);
        })
        .catch((error) => {
          return error;
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
          return error;
        });
    });
  }

  /**
   * Get products from a collection by handle.
   * @param {String} handle the collection handle.
   * @param {Number} limit number of products to load.
   */
  function getCollectionByHandle(handle, limit) {
    return new Promise((resolve) => {
      const query = {
        method: 'post',
        headers: {
          'Content-Type': 'application/graphql',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: collectionsQuery(handle, limit),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          const collection = response.data.collectionByHandle;
          resolve(convertGetCollectionResponse(collection));
        })
        .catch((error) => {
          return error;
        });
    });
  }

  /**
   * Convert GraphQL response to something nicer.
   * @param {Object} response the original GraphQL response.
   */
  function convertGetCollectionResponse(response) {
    const convertedResponse = {};

    response.products.edges.forEach((product) => {
      const collections = [];

      product.node.collections.edges.forEach((collection) => {
        collections.push(collection.node.handle);
      });

      convertedResponse[product.node.handle] = {
        title: product.node.title,
        handle: product.node.handle,
        images: product.node.images.edges.map((image) => {
          return image.node;
        }),
        collections,
      };
    });

    return convertedResponse;
  }

  /**
   * Get a product by its handle.
   * @param {String} handle the product handle.
   */
  function getProductByHandle(handle) {
    return new Promise((resolve) => {
      const query = {
        method: 'post',
        headers: {
          'Content-Type': 'application/graphql',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: productQuery(handle),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          const product = response.data.productByHandle;
          resolve(convertGetProductResponse(product));
        })
        .catch((error) => {
          return error;
        });
    });
  }

  /**
   * Convert GraphQL response to something nicer.
   * @param {Object} response the original GraphQL response.
   */
  function convertGetProductResponse(response) {
    const convertedResponse = {};

    convertedResponse[response.handle] = {
      title: response.title,
      handle: response.handle,
      images: response.images.edges.map((image) => {
        return image.node;
      }),
      descriptionHtml: response.descriptionHtml,
      variants: response.variants.edges.map((variant) => {
        return {
          id: variant.node.id,
          price: variant.node.priceV2.amount,
        };
      }),
      completeData: true,
    };

    return convertedResponse;
  }

  return Object.freeze({
    createCheckout,
    getCart,
    replaceCart,
    getCollectionByHandle,
    getProductByHandle,
  });
};
