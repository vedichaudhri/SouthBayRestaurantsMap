import React from 'react';
import ReactDOM from 'react-dom';
import './site.css';
//import App from './App';
import * as serviceWorker from './serviceWorker';
//import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';
//import { csv2geojson } from 'csv2geojson';
import mapboxgl from 'mapbox-gl';
import geodata from './geodata.js';
import MapboxCircle from 'mapbox-gl-circle';

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

    var canvas = map.getCanvasContainer();
    // var coordinates = document.getElementById('coordinates');
    // var circles = this.createGeoJSONCircles(this.INIT_COORDS_A, this.INIT_COORDS_B, 10, 10);


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

          // map.addSource('circles', circles);
          // map.addLayer({
          //   'id': 'circles',
          //   'type': 'fill',
          //   'source': 'circles',
          //   'layout': {},
          //   'paint': {
          //     'fill-color': '#088',
          //     'fill-opacity': 0.3
          //   }
          // });

          // When the cursor enters a feature in the point layer, prepare for dragging.
          // map.on('mouseenter', 'circles', function() {
          //   canvas.style.cursor = 'move';
          // });

          // map.on('mouseleave', 'circles', function() {
          //   canvas.style.cursor = '';
          // });
          

        }
        );
    });

    this.handleMarkers(map);
    this.handleCircles(map);
  }

  // radius in meters
  handleCircles(map) {
    var circleA = new MapboxCircle({lat: this.INIT_COORDS_A[1], lng: this.INIT_COORDS_A[0]}, 7000, {
      editable: true,
      clickable: false,
      minRadius: 1500,
      fillColor: '#29AB87'
    }).addTo(map);

    var circleB = new MapboxCircle({lat: this.INIT_COORDS_B[1], lng: this.INIT_COORDS_B[0]}, 7000, {
      editable: true,
      minRadius: 1500,
      fillColor: '#29AB87'
    }).addTo(map);

    circleA.on('centerchanged', function (circleObj) {
      console.log('New center:', circleObj.getCenter());
    });
    circleA.once('radiuschanged', function (circleObj) {
      console.log('New radius (once!):', circleObj.getRadius());
    });
    // circleA.on('click', function (mapMouseEvent) {
    //         console.log('Click:', mapMouseEvent.point);
    //     });
  }

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

  /* createGeoJSONCircles(centerA, centerB, radiusA, radiusB) {
    let coordsA = this.calculateCircleCoords(centerA, radiusA);
    let coordsB = this.calculateCircleCoords(centerB, radiusB);

    return {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [coordsA]
          }
        }, 
        {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [coordsB]
          }
        }]
      }
    };
  }; */

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
