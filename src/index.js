import React from 'react';
import ReactDOM from 'react-dom';
import './site.css';
//import App from './App';
import * as serviceWorker from './serviceWorker';
//import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';
//import { csv2geojson } from 'csv2geojson';
import mapboxgl from 'mapbox-gl';
import geodata from './geodata.js';
//import data from 'data.geojson';

mapboxgl.accessToken =
  'pk.eyJ1IjoidmVkaWNoYXVkaHJpIiwiYSI6ImNrNjM2NGpxYjAxaG8zbW1weTNuMmxydDkifQ.2Va6SpC54bm8IkG0SGZ8lw';

class Application extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: -122.1430195,
      lat: 37.4418834,
      zoom: 9
    };
  }

  componentDidMount() {
    console.log(geodata)
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });
    map.on('move', () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });

    map.on('load', function() {
      map.loadImage(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Location_dot_black.svg/1024px-Location_dot_black.svg.png',
        function(error, image) {
          if (error) throw error;
          map.addImage('circle', image);
          map.addSource('points', {
            type: 'geojson',
            data: geodata
          });
          map.addLayer({
            id: 'points',
            type: 'symbol',
            source: 'points',
            layout: {
              'icon-image': 'circle',
              'icon-size': 0.007,
              'text-field': ['get', 'Name'],
              'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
              'text-offset': [0, 0.6]
            }
          });
        }
      );
    });

    var markerA = new mapboxgl.Marker({
      draggable: true
    })
      .setLngLat([-122.1430195, 37.44])
      .addTo(map);

    var markerB = new mapboxgl.Marker({
      draggable: true
    })
      .setLngLat([-122.2, 37.39])
      .addTo(map);

    function onDragEnd() {
      var lngLatA = markerA.getLngLat();
      console.log('A: Longitude: ' + lngLatA.lng + '<br />Latitude: ' + lngLatA.lat);

      var lngLatB = markerB.getLngLat();
      console.log('B: Longitude: ' + lngLatB.lng + '<br />Latitude: ' + lngLatB.lat);
    }

    markerA.on('dragend', onDragEnd);
    markerB.on('dragend', onDragEnd);
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
      </div>
    );
  }
}

ReactDOM.render(<Application />, document.getElementById('app'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
