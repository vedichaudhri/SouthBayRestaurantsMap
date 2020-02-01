import React from 'react';
import ReactDOM from 'react-dom';
import './site.css';
//import App from './App';
import * as serviceWorker from './serviceWorker';
//import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';
//import { csv2geojson } from 'csv2geojson';
import mapboxgl from 'mapbox-gl';
import geodata from './geodata.js'
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
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
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
