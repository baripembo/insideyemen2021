var map, scroller, scroller2, main, scrolly, figure, article, step, geoDataArray, viewportWidth, viewportHeight, isMobile;
var currentIndex = 0;

$( document ).ready(function() {
  const DATA_URL = 'data/';
  var dataUrls = ['route1.geojson', 'route2.geojson', 'route3.geojson'];
  geoDataArray = new Array(dataUrls.length);
  mapboxgl.accessToken = 'pk.eyJ1IjoieWFuamFhLWRlc2lnbiIsImEiOiJja2wwYWgyOXgyZGF3MnZxb2hqcHN6b3Y0In0.mY6k-2eGFgppETtvEqSLJw';
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
  isMobile = (viewportWidth<767) ? true : false;
  
  function getData() {
    dataUrls.forEach(function (url, index) {
      loadData(url, function (responseText) {
        parseData(JSON.parse(responseText), index);
      })
    })
  }

  function loadData(dataPath, done) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () { return done(this.responseText) }
    xhr.open('GET', DATA_URL+dataPath, true);
    xhr.send();
  }

  var countArray = new Array(dataUrls.length);
  function parseData(geoData, index) {
    //create map routes
    countArray[index] = 0;
    geoDataArray[index] = geoData;
    var layer = 'layer'+index;
    var geo = {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'geometry': {
          'type': 'LineString',
          'coordinates': [geoData.features[0].geometry.coordinates[0]]
        }
      }]
    };

    map.addLayer({
      'id': layer,
      'type': 'line',
      'source': {
        'type': 'geojson',
        'data': geo
      },
      'layout': {
        'line-join': 'miter',
        'line-cap': 'butt'
      },
      'paint': {
        'line-color': '#FFF',
        'line-width': 3
      }
    }, 'locationPoints')
  }


  var animation; 
  var animationIndex = 0;
  var animationDone = true;
  function animateLine() {
    var geoData = geoDataArray[animationIndex];
    var layer = 'layer'+animationIndex;
    var count = countArray[animationIndex]++;
    if (geoData!=undefined && count<geoData.features[0].geometry.coordinates.length) {
      var newGeo = map.getSource(layer)._data;
      newGeo.features[0].geometry.coordinates.push(geoData.features[0].geometry.coordinates[count]);
      map.getSource(layer).setData(newGeo);

      animation = requestAnimationFrame(function() {
        animateLine();
      });
    }
    else {
      animationDone = true;
      animationIndex++;
      if (currentIndex>=animationIndex) animateLine();
    }
  }


  function initMap() {
    console.log('Loading map...');

    var zoomLevel = 6.13;
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/yanjaa-design/ckmm3n3f21yq917qsvgze3wq0',
      center: [48.21908, 15.53492],
      minZoom: 1,
      zoom: zoomLevel,
      attributionControl: false
    });
    map.scrollZoom.disable();

    map.on('load', function() {
      console.log('Map loaded')
      $('.loader').remove();
      $('body').css('backgroundColor', '#000');
      $('main').css('opacity', 1);

      locationData();
      getData();
      initJourney();
    });
  }

  function locationData() {
    map.addSource('locationSource', {
      type: 'geojson',
      data: DATA_URL+'geodata_locations.geojson'
    });

    map.addLayer({
      'id': 'locationPoints',
      'type': 'symbol',
      'source': 'locationSource',
      'layout': {
        'icon-image': '{icon}',
        'icon-size': { 'type': 'identity', 'property': 'iconSize' },
        'text-field': '{name}',
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 18,
        'text-max-width': { 'type': 'identity', 'property': 'textMaxWidth' },
        'text-justify': 'left',
        'text-offset': { 'type': 'identity', 'property': 'textOffset' },
        'text-anchor': { 'type': 'identity', 'property': 'textAnchor' },
        'icon-allow-overlap': false,
        'text-allow-overlap': false,
        'visibility': 'none'
      },
      paint: {
        'text-color': '#FFF',
        'text-halo-color': '#000',
        'text-halo-width': 1
      }
    });
  }


  function initJourney() {
    scroller = scrollama();
    scroller2 = scrollama();
    main = d3.select('main');
    scrolly = main.select('#scrolly');
    figure = scrolly.select('figure');
    article = scrolly.select('article');
    step = article.selectAll('.step');

    setupStickyfill();
    handleResize();

    scroller
      .setup({
        step: '.step',
        offset: 0.7,
        debug: false
      })
      .onStepEnter(handleStepEnter)
      .onStepExit(handleStepExit);

    scroller2
      .setup({
        step: '.step',
        offset: 0.7,
        debug: false
      })
      .onStepEnter(function(response) { })
      .onStepExit(function(response) { 
        // if ($(response.element).parent().parent().attr('id')=='scrolly2' && response.direction=='up') {
        //   $('#video-container').fadeOut();
        // }
      });

    // setup resize event
    window.addEventListener('resize', handleResize);
  }

  function handleStepEnter(response) {
    currentIndex = response.index;
    var chapter = config.chapters[currentIndex];
    var location = (chapter!=undefined) ? chapter.location : '';

    map.setLayoutProperty('locationPoints', 'visibility', 'visible');

    // set active step
    step.classed('is-active', function(d, i) {
      return i === response.index;
    });

    if (geoDataArray[response.index]!==undefined) {
      var padding = 0;
      setMapBounds(geoDataArray[response.index], chapter.paddingBottom, chapter.location.bearing, chapter.location.pitch);

      if (animationDone) {
        animateLine();
        animationDone = false;
      }
    }
    else {
      //zoom into adan
      map.flyTo(location);
    }
  }

  function handleStepExit(response) {
    if (response.index==0) {
      var location = {
        center: [48.21908, 15.53492],
        zoom: 6.13,
        pitch: 0,
        bearing: 0
      };
      map.flyTo(location);
    }
    if (response.index==config.chapters.length && $(response.element).parent().parent().attr('id')=='scrolly') {
      $('#video-container').fadeIn('slow');
    }
  }

  // generic window resize listener event
  function handleResize() {
    //update height of step elements
    var stepH = (isMobile) ? Math.floor(window.innerHeight)*2 : Math.floor(window.innerHeight);
    step.style("height", stepH + "px");

    //double height of last step
    //if (!isMobile) $(".step[data-step='4']").css("height", stepH*1.5 + "px");

    var figureHeight = window.innerHeight;
    var figureMarginTop = (window.innerHeight - figureHeight) / 2;

    figure
      .style("height", figureHeight + "px")
      .style("top", figureMarginTop + "px");

    $('#video-container').find('figure')
      .css("height", figureHeight + "px")
      .css("top", figureMarginTop + "px");

    scroller.resize();
    scroller2.resize();
  }

  function setupStickyfill() {
    d3.selectAll(".sticky").each(function() {
      Stickyfill.add(this);
    });
  }


  function setMapBounds(points, paddingBottom, bearing, pitch) {
    let bbox = turf.extent(points);
    var padding = (viewportWidth<768) ? {top: 40, bottom: 40, left: 60, right: 60} : {top: 0, bottom: paddingBottom, left: 550, right: 150};
    map.fitBounds(bbox, {padding: padding, bearing: bearing, pitch: pitch});
  }


  initMap();
});