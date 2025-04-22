<template>
    <div>
      <LMarker
        v-if="marker"
        :lat-lng="marker.latLng"
        :icon="marker.icon"
        draggable
        @dragend="onDragEnd"
      >
        <LPopup>{{ marker.popupText }}</LPopup>
      </LMarker>
    </div>
  </template>
  
  <script>
  import { LMarker, LPopup } from 'vue-leaflet';
  
  export default {
    props: {
      marker: Object
    },
    methods: {
      onDragEnd() {
        console.log(`### Debug: Marker dragged to ${this.marker.latLng}`);
        this.$emit('markerMoved', this.marker);
      }
    }
  };
  </script>
  
  <style scoped>
  /* Optional styling for the marker, if needed */
  </style>
  