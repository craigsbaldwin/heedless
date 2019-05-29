<template>
  <h1>Testing</h1>
</template>

<script>
  export default {
    data: () => ({
      links: [
        {
          name: 'Home',
          to: '/'
        },
        {
          name: 'Bad Link',
          to: '/random-bad-url'
        }
      ]
    })
  }
</script>