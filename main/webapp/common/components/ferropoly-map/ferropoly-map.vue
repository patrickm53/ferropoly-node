<!---
  Google Maps root element for Ferropoly

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 06.06.21

  History:
  1.0.0     First versioned map

-->
<template lang="pug">
  #map-root
    #map

</template>

<script>

import {WmsMapType} from '@googlemaps/ogc';
import $ from 'jquery';
import gl from './googleLoader.js';
import {assign} from 'lodash';
import {setItem, getItem} from '../../lib/localStorage';

const mapOptionsDefaults = {
  center           : {
    lat: 47.35195,
    lng: 7.90781
  },
  zoom             : 8,
  streetViewControl: false,
  fullscreenControl: false,
  restriction      : {
    latLngBounds: {
      north: 48.2,
      south: 45.6,
      east : 11.01,
      west : 5.5
    }
  }
};

export default {
  name      : 'FerropolyMap',
  components: {},
  filters   : {},
  model     : {},
  props     : {
    mapOptions: {
      type   : Object,
      default: function () {
        return mapOptionsDefaults;
      }
    },
    /**
     * How many pixels shall be the map smaller than filling the screen to bottom???
     */
    ySizeReduction: {
      type: String,
      default: function() {
        return '0';
      }
    }
  },
  data      : function () {
    return {
      mapElement: undefined,
      map       : undefined
    };
  },
  computed  : {},
  /**
   * When Map was mounted
   */
  async mounted() {
    let self = this;
    gl.load((err, google) => {
      if (err) {
        console.error('Cannot display map');
        return;
      }
      console.log('Google API loaded, creating map...');

      self.mapOptions.mapTypeControlOptions = {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.TERRAIN, 'swisstopo',
                     google.maps.MapTypeId.SATELLITE]
      };

      let mapOptions = assign(mapOptionsDefaults, self.mapOptions);

      if (!self.mapOptions.center) {
        self.mapOptions.center = mapOptionsDefaults.center;
      }
      console.log('mapOptions', mapOptions);

      self.map     = new google.maps.Map(document.getElementById('map'), mapOptions);

      // Saving map-types to the local storage
      self.map.addListener('maptypeid_changed', () => {
        console.log('Maptype changed', self.map.getMapTypeId());
        setItem('ferropoly-map', self.map.getMapTypeId());
      });

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
      self.map.setMapTypeId(getItem('ferropoly-map','roadmap'));
      self.resizeHandler();

      self.map.addListener('center_changed', () => {
        self.$emit('center-changed', self.map.getCenter())
      });
      self.map.addListener('zoom_changed', () => {
        self.$emit('zoom-changed', self.map.getZoom())
      });
      console.log('Google Map Initialized');
      self.$emit('map', self.map);
    });
  },
  /**
   * When Map was Created
   */
  created() {
    window.addEventListener('resize', this.resizeHandler);
    this.resizeHandler(null);
  },
  destroyed() {
    window.removeEventListener('resize', this.resizeHandler);
  },
  methods: {
    /**
     * Sets the focus on the property: if the property
     * is in the current viewport, nothing is done. Otherwise
     * it is centered to the map
     */
    setFocusOnProperty(property) {
      let pos = property.marker.getPosition();
      if (!this.map.getBounds().contains(pos)) {
        this.map.panTo(pos);
      }
    },
    /**
     * Sets the maps bounds
     * @param bounds is a google.maps.LatLngBoundsLiteral
     */
    panToBounds(bounds) {
      this.map.panToBounds(bounds);
    },
    /**
     * Sets the maps bounds including zoom
     * @param bounds is a google.maps.LatLngBoundsLiteral
     */
    fitBounds(bounds) {
      this.map.fitBounds(bounds);
    },
    /**
     * Sets the map center
     * @param center is a google.maps.LatLngLiteral
     */
    setCenter(center) {
      this.map.setCenter(center);
    },
    /**
     * Sets the zoom of the map
     * @param zoom
     */
    setZoom(zoom) {
      this.map.setZoom(zoom);
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
        this.mapElement.height(hDoc - offsetMap.top - parseInt(this.ySizeReduction));
        this.mapElement.width(parentWidth);
      } else {
        console.log('Map not ready yet');
      }
    }
  }
}
</script>

<style scoped>
#map {
  width: 400px;
  height: 400px;
  background-color: lightgrey;
}
</style>
