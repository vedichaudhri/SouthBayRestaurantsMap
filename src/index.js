import React from 'react';
import ReactDOM from 'react-dom';
import './site.css';
//import App from './App';
import * as serviceWorker from './serviceWorker';
//import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';
//import { csv2geojson } from 'csv2geojson';
import mapboxgl from 'mapbox-gl';
import geodata from './geodata.js';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
//import data from 'data.geojson';
import {
  CircleMode,
  DragCircleMode,
  DirectMode,
  SimpleSelectMode,
} from 'mapbox-gl-draw-circle';

mapboxgl.accessToken =
'pk.eyJ1IjoidmVkaWNoYXVkaHJpIiwiYSI6ImNrNjM2NGpxYjAxaG8zbW1weTNuMmxydDkifQ.2Va6SpC54bm8IkG0SGZ8lw';



class Application extends React.Component {

  INIT_COORDS_A = [-122.1430195, 37.44];
  INIT_COORDS_B = [-122.2, 37.39];

  constructor(props) {
    super(props);
    this.state = {
      lng: -122.1430195,
      lat: 37.4418834,
      zoom: 9
    };
  }

  componentDidMount() {
    var bounds = [
    [-123.0397, 37.024], // Southwest coordinates
    [-120.881, 37.933033] // Northeast coordinates
    ];

    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom,
      maxBounds: bounds
    });

    map.on('move', () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });

    var circleA = this.createGeoJSONCircle(this.INIT_COORDS_A, 10);
    var circleB = this.createGeoJSONCircle(this.INIT_COORDS_B, 10);

    map.on('load', function() {
      map.loadImage(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Location_dot_black.svg/1024px-Location_dot_black.svg.png',
        function(error, image) {
          if (error) throw error;
          map.addImage('dot', image);
          map.addSource('points', {
            type: 'geojson',
            data: geodata
          });
          map.addLayer({
            id: 'points',
            type: 'symbol',
            source: 'points',
            layout: {
              'icon-image': 'dot',
              'icon-size': 0.007,
            }
          });

          map.addSource('circleA', circleA);
          map.addLayer({
            'id': 'circleA',
            'type': 'fill',
            'source': 'circleA',
            'layout': {},
            'paint': {
              'fill-color': '#088',
              'fill-opacity': 0.3
            }
          });

          map.addSource('circleB', circleB);
          map.addLayer({
            'id': 'circleB',
            'type': 'fill',
            'source': 'circleB',
            'layout': {},
            'paint': {
              'fill-color': '#088',
              'fill-opacity': 0.3
            }
          });
        }
        );
    });

    this.handleMarkers(map);
  }

  // adapted from:
  // https://stackoverflow.com/questions/37599561/drawing-a-circle-with-the-radius-in-miles-meters-with-mapbox-gl-js/39006388#39006388
  createGeoJSONCircle(center, radiusInKm, points) {
    if(!points) points = 64;

    var coords = {
      latitude: center[1],
      longitude: center[0]
    };

    var km = radiusInKm;

    var ret = [];
    var distanceX = km/(111.320*Math.cos(coords.latitude*Math.PI/180));
    var distanceY = km/110.574;

    var theta, x, y;
    for(var i=0; i<points; i++) {
      theta = (i/points)*(2*Math.PI);
      x = distanceX*Math.cos(theta);
      y = distanceY*Math.sin(theta);

      ret.push([coords.longitude+x, coords.latitude+y]);
    }
    ret.push(ret[0]);

    return {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [ret]
          }
        }]
      }
    };
  };

  handleMarkers(map) {
    var markerA = new mapboxgl.Marker({
      draggable: true
    })
    .setLngLat(this.INIT_COORDS_A)
    .addTo(map);

    var markerB = new mapboxgl.Marker({
      draggable: true
    })
    .setLngLat(this.INIT_COORDS_B)
    .addTo(map);

    // function onDragEnd() {
    //   var lngLatA = markerA.getLngLat();
    //   var lngLatB = markerB.getLngLat();
    // }

    // markerA.on('dragend', onDragEnd);
    // markerB.on('dragend', onDragEnd);
  }
  

  render() {
    return (
      <div>
      <div className="sidebarStyle">
      <div>
      Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom:{' '}
      {this.state.zoom}
      </div>
      </div>
      <div ref={el => (this.mapContainer = el)} className="mapContainer" />
      </div>);
    }
  }

  ReactDOM.render(<Application />, document.getElementById('app'));

  // If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
