import VectorSource from 'ol/source/Vector';
import { bbox } from 'ol/loadingstrategy';
import {Vector as VectorLayer} from 'ol/layer';
import OSMXML from 'ol/format/OSMXML';
import Map from 'ol/Map';
import View from 'ol/View';
import OSMSource from 'ol/source/OSM';
import {fromLonLat, transformExtent} from 'ol/proj';
import {Circle, Fill, Stroke, Style} from 'ol/style';


function get_query(category, extent) {
  const bbox = `(${extent[1]}, ${extent[0]}, ${extent[3]}, ${extent[2]})`;
  return `node ["amenity"="school"] ${bbox}; (._;>;);out meta;`;
}


function create_dynamic_map() {

  var self = this;
  var dynamic_source = new VectorSource({
    format: new OSMXML(),
    loader: function(extent, resolution, projection) {
      var epsg4326Extent = transformExtent(extent, projection, 'EPSG:4326');
      var tmp = get_query('school', epsg4326Extent);
      var url = 'https://lz4.overpass-api.de/api/interpreter?data='+encodeURIComponent(tmp);
      console.log(`create_dynamic_map(): query:`, tmp);
      console.log(`create_dynamic_map(): url:`, url);

      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      var onError = function() {
        dynamic_source.removeLoadedExtent(extent);
      };
      xhr.onerror = onError;
      xhr.onload = function() {
        if ((xhr.status >= 200) && (xhr.status < 300)) {
          const f = dynamic_source.getFormat().readFeatures(xhr.responseText);
          console.log(`create_dynamic_map(): features:`, f);
          dynamic_source.addFeatures(f);
        } else {
          console.log(`create_dynamic_map(): err:`, xhr);
          onError();
        }
      };
      xhr.send();
      console.log(`create_dynamic_map(): loader finished`);
    },
    strategy: bbox,
  });

  create_map_with_source('dynamic-map', dynamic_source);
}


function create_static_map() {

  var static_source = new VectorSource({
    format: new OSMXML(),
    url: './school.xml',
    strategy: bbox,
  });

  create_map_with_source('static-map', static_source);
}


function trace_logger_listener(name) {
  const objname = name;

  return function(event) {
    console.log(`${objname}: ${event.type}:`, event.target);
  }
}


function create_map_with_source(name, source) {

  const vector_layer = new VectorLayer({
    source: source,
    style: new Style({
      image: new Circle({
        fill: new Fill({color: 'blue'}),
        stroke: new Stroke({color: 'black', width: 1}),
        radius: 25,
      })
    }),
  });

  const vecevents = ['addfeature', 'changefeature', 'clear', 'removefeature'];
  const levents = [ 'change', 'postcompose', 'precompose', 'render', 'rendercomplete'];
  vecevents.forEach(function(elt) {
    source.on(elt, trace_logger_listener(name));
  })
  levents.forEach(function(elt) {
    vector_layer.on(elt, trace_logger_listener(name));
  })

  const map = new Map({
    interactions: [ ],
    controls: [ ],
    target: 'static-map',
    layers: [ vector_layer ],
    view: new View({
      center: fromLonLat([-122.3519017, 37.5816124]),
      zoom: 16
    })
  });
}

create_static_map();
create_dynamic_map();
