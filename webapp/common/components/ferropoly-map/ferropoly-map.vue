<!---
  Google Maps Root element

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 06.06.21
-->
<template lang="pug">
  #map-root
    #map

</template>

<script>

import {WmsMapType} from '@googlemaps/ogc';
import $ from 'jquery';
import gl from './googleLoader.js';

const mapOptionsDefaults = {
  center: {
    lat: 47.35195,
    lng: 7.90781
  },
  zoom  : 8,
};

export default {
  name : 'ferropoly-map',
  props: {
    mapOptions: {
      type   : Object,
      default: function () {
        return mapOptionsDefaults;
      }
    }
  },
  data : function () {
    return {
      mapElement: undefined,
      map       : undefined
    };
  },
  model: {},
  /**
   * When Map was mounted
   */
  async mounted() {
    console.log('mounted');
    let self   = this;
    gl.load((err, google) => {
      if (err) {
        console.error('Cannot display map');
        return;
      }
      console.log('Google API loaded, creating map...');

      this.mapOptions.mapTypeControlOptions = {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'swisstopo']
      };

      if (!this.mapOptions.center) {
        this.mapOptions.center = mapOptionsDefaults.center;
      }
      console.log('mapOptions', this.mapOptions);
      self.map     = new google.maps.Map(document.getElementById('map'), this.mapOptions);
      let swissMap = WmsMapType({
        url        : 'https://wms.geo.admin.ch',
        layers     : 'ch.swisstopo.pixelkarte-farbe',
        name       : 'Swiss Topo',
        alt        : 'swiss_topo',
        version    : '1.1.1',
        transparent: false,
        maxZoom    : 55,
        format     : 'image/jpeg'
      });

      self.map.mapTypes.set('swisstopo', swissMap);
      self.map.setMapTypeId('swisstopo');
      self.resizeHandler();
      console.log('Google Map Initialized');
      self.$emit('map', self.map);
    });
  },
  /**
   * When Map was Created
   */
  created() {
    console.log('created');

    window.addEventListener('resize', this.resizeHandler);
    this.resizeHandler(null);
  },
  destroyed() {
    console.log('fuck, destroyed')
    window.removeEventListener('resize', this.resizeHandler);
  },
  computed  : {},
  methods   : {
    /**
     * Sets the focus on the property: if the property
     * is in the current viewport, nothing is done. Otherwise
     * it is centered to the map
     */
    setFocusOnProperty(property) {
      console.log('setFocusOnProperty');
      let pos = property.marker.getPosition();
      if (!this.map.getBounds().contains(pos)) {
        this.map.setCenter(pos);
      }
    },
    /**
     * Creates the maximum Size
     */
    resizeHandler() {
      console.log('resize');
      this.mapElement = $('#map');
      let parentWidth = this.mapElement.parent().width();

      let hDoc      = $(window).height();
      let offsetMap = this.mapElement.offset();
      console.log(hDoc, offsetMap);

      if (this.mapElement && offsetMap) {
        this.mapElement.height(hDoc - offsetMap.top);
        this.mapElement.width(parentWidth);
      } else {
        console.log('Map not ready yet');
      }
    }
  },
  components: {},
  filters   : {}
}
</script>

<style scoped>
#map {
  width: 400px;
  height: 400px;
  background-color: lightgrey;
}
</style>
