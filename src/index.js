import React from 'react';
import ReactDOM from 'react-dom';
import './site.css';
import * as serviceWorker from './serviceWorker';
import mapboxgl from 'mapbox-gl';
import geodata from './geodata.js';
import MapboxCircle from 'mapbox-gl-circle';
import * as turf from '@turf/turf';

mapboxgl.accessToken =
  'pk.eyJ1IjoidmVkaWNoYXVkaHJpIiwiYSI6ImNrNjM2NGpxYjAxaG8zbW1weTNuMmxydDkifQ.2Va6SpC54bm8IkG0SGZ8lw';

function filterBy(num, map) {
  var filters = ['>=', 'Score', num];
  map.setFilter('points', filters);

  document.getElementById('safety_score_range').textContent = `Score >= ${num}`; //safety_score[num];
}

class Application extends React.Component {
  constructor(props) {
    super(props);
    this.handleCircles = this.handleCircles.bind(this);
    this.getIntersectionPoints = this.getIntersectionPoints.bind(this);
    this.state = {
      lng: -122.1430195,
      lat: 37.4418834,
      zoom: 9,
      circleA_center: [-122.1430195, 37.44],
      circleB_center: [-122.2, 37.39],
      circleA_radius: 7000,
      circleB_radius: 7000,
      intersectionPoints: this.getIntersectionPoints(
        [-122.1430195, 37.44],
        7000,
        [-122.2, 37.39],
        7000
      )
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

    map.on('load', () => {
      map.addSource('points', {
        type: 'geojson',
        data: geodata
      });

      map.addLayer({
        id: 'points',
        type: 'circle',
        source: 'points',
        paint:
        {
          'circle-radius': 3,
          'circle-color': ['case',
            ['in', ['get', 'Address'],
              ['literal', this.state.intersectionPoints]], 'blue', 'gray'],

          'circle-opacity': ['case',
            [
              'in',
              ['get', 'Address'],
              ['literal', this.state.intersectionPoints]
            ],
            1,
            0.5
          ]
        }
      });

      filterBy(9, map);
      document.getElementById('slider').addEventListener('input', function (e) {
        let num = parseInt(e.target.value, 10);
        filterBy(num, map);
      });
    });

    map.on('click', 'points', function (e) {
      let coordinates = e.features[0].geometry.coordinates.slice();
      let name = e.features[0].properties.Name;
      let score = "Safety Score: " + e.features[0].properties.Score;
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML('<h4>' + name + '</h4><p>' + score + '</p>')
        .addTo(map);
    });

    map.on('mouseenter', 'points', function () {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'points', function () {
      map.getCanvas().style.cursor = '';
    });

    this.handleCircles(map);
  }

  // radius in meters
  handleCircles(map) {
    var circleA = new MapboxCircle(
      { lat: this.state.circleA_center[1], lng: this.state.circleA_center[0] },
      this.state.circleA_radius,
      {
        editable: true,
        minRadius: 1500,
        fillColor: '#29AB87'
      }
    ).addTo(map);

    var circleB = new MapboxCircle(
      { lat: this.state.circleB_center[1], lng: this.state.circleB_center[0] },
      this.state.circleB_radius,
      {
        editable: true,
        minRadius: 1500,
        fillColor: '#29AB87'
      }
    ).addTo(map);

    circleA.on('centerchanged', circleObj => {
      var newCenter = [
        circleObj.getCenter()['lng'],
        circleObj.getCenter()['lat']
      ];
      this.setState(
        {
          circleA_center: newCenter,
          intersectionPoints: this.getIntersectionPoints(
            newCenter,
            this.state.circleA_radius,
            this.state.circleB_center,
            this.state.circleB_radius
          )
        },
        () => {
          map.setPaintProperty('points', 'circle-color', [
            'case',
            [
              'in',
              ['get', 'Address'],
              ['literal', this.state.intersectionPoints]
            ],
            'blue',
            'gray'
          ]);
          map.setPaintProperty('points', 'circle-opacity', ['case',
            [
              'in',
              ['get', 'Address'],
              ['literal', this.state.intersectionPoints]
            ],
            1,
            0.5
          ]);
        }
      );
    });

    circleA.on('radiuschanged', circleObj => {
      this.setState(
        {
          circleA_radius: circleObj.getRadius(),
          intersectionPoints: this.getIntersectionPoints(
            this.state.circleA_center,
            circleObj.getRadius(),
            this.state.circleB_center,
            this.state.circleB_radius
          )
        },
        () => {
          map.setPaintProperty('points', 'circle-color', [
            'case',
            [
              'in',
              ['get', 'Address'],
              ['literal', this.state.intersectionPoints]
            ],
            'blue',
            'gray'
          ]);
          map.setPaintProperty('points', 'circle-opacity', ['case',
            [
              'in',
              ['get', 'Address'],
              ['literal', this.state.intersectionPoints]
            ],
            1,
            0.5
          ]);
        }
      );
    });

    circleB.on('centerchanged', circleObj => {
      var newCenter = [
        circleObj.getCenter()['lng'],
        circleObj.getCenter()['lat']
      ];

      this.setState(
        {
          circleB_center: newCenter,
          intersectionPoints: this.getIntersectionPoints(
            this.state.circleA_center,
            this.state.circleA_radius,
            newCenter,
            this.state.circleB_radius
          )
        },
        () => {
          map.setPaintProperty('points', 'circle-color', [
            'case',
            [
              'in',
              ['get', 'Address'],
              ['literal', this.state.intersectionPoints]
            ],
            'blue',
            'gray'
          ]);
          map.setPaintProperty('points', 'circle-opacity', ['case',
            [
              'in',
              ['get', 'Address'],
              ['literal', this.state.intersectionPoints]
            ],
            1,
            0.5
          ])
        }
      );
    });

    circleB.on('radiuschanged', circleObj => {
      if (circleObj.getRadius() !== null) {
        this.setState(
          {
            circleB_radius: circleObj.getRadius(),
            intersectionPoints: this.getIntersectionPoints(
              this.state.circleA_center,
              this.state.circleA_radius,
              this.state.circleB_center,
              circleObj.getRadius()
            )
          },
          () => {
            map.setPaintProperty('points', 'circle-color', [
              'case',
              [
                'in',
                ['get', 'Address'],
                ['literal', this.state.intersectionPoints]
              ],
              'blue',
              'gray'
            ]);
            map.setPaintProperty('points', 'circle-opacity', ['case',
              [
                'in',
                ['get', 'Address'],
                ['literal', this.state.intersectionPoints]
              ],
              1,
              0.5
            ]);
          }
        );
      }
    });
  }

  getIntersectionPoints(
    circleA_center,
    circleA_radius,
    circleB_center,
    circleB_radius
  ) {
    let options = { units: 'kilometers' };
    let turf_circleA = turf.circle(
      circleA_center,
      circleA_radius / 1000,
      options
    );
    let turf_circleB = turf.circle(
      circleB_center,
      circleB_radius / 1000,
      options
    );

    let intersection = turf.intersect(turf_circleA, turf_circleB);

    if (intersection == null) {
      return [];
    }

    let restaurants = geodata['features'];
    let r_in_intersect = [];

    for (let r of restaurants) {
      let coords = r['geometry']['coordinates'];
      let point = turf.point(coords);

      if (turf.booleanPointInPolygon(point, intersection)) {
        r_in_intersect.push(r['properties']['Address']);
      }
    }
    return r_in_intersect;
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
        <div className="map-overlay top">
          <div className="map-overlay-inner">
            <h2>Filter</h2>
            <label id="safety_score_range"></label>
            <input
              id="slider"
              type="range"
              min="0"
              max="99"
              step="1"
              defaultValue="0"
            />
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Application />, document.getElementById('app'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
