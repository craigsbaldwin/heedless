<template>
  <div class="container">
    <div
      class="product-card"
      v-for="product in data"
      :key="product"
    >
      {{ product.title }}
    </div>
  </div>
</template>

<script>
  // export default {
  //   created () {
  //     client.product.fetchAll()
  //       .then(response => response.json())
  //       .then(json => {
  //         this.products = json.products
  //       })
  //   }
  // }
</script>