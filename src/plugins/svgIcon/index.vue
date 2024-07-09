<template>
  <svg
      class="svg-icon"
      aria-hidden="true"
      :style="{fill:color?color:''}"
  >
    <use :xlink:href="'#icon-'+name" />
  </svg>
</template>

<script>
export default {
  name: 'svgIcon',
  props: {
      name: String,
      color: {
          type: String,
          default: null
      }
  },
  computed: {
  }
}
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.25em;
  fill: currentColor;
  overflow: hidden;
}
</style>
