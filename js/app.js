var map;

// Create a new blank array for all the listing markers.
var markers = [];

var locations = [
              {
                title: 'Burj khalifa',
                location: {lat: 25.1972, lng: 55.2744}
              },
              {
                title: 'burj al arab',
                location: {lat: 25.1413, lng: 55.1853}
              },
              {
                title: 'Palm Islands',
                location: {lat: 25.0032, lng: 55.0204}
              },
              {
                title: 'The Dubai Fountain',
                location: {lat: 25.2338, lng: 55.2655}
              },
              {
                title: 'Dubai Museum',
                location: {lat: 25.2632, lng: 55.2972}
              }
            ];



var userInput = (" ");

function initMap() {
      var styles = [
          {
            featureType: 'water',
            stylers: [
              { color: '#4bb8e5' }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
              { color: '#ffffff' },
              { weight: 6 }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
              { color: '#ba11e0' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -40 }
            ]
          },{
            featureType: 'transit.station',
            stylers: [
              { weight: 9 },
              { hue: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
              { visibility: 'off' }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
              { lightness: 100 }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
              { lightness: -100 }
            ]
          },{
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
              { visibility: 'on' },
              { color: '#f0e4d3' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -25 }
            ]
          }
        ];

        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 25.2048,lng: 55.2708},
          zoom: 10,
          styles: styles,
          mapTypeControl: false
        });



        var largeInfowindow = new google.maps.InfoWindow();

        var bounds = new google.maps.LatLngBounds();



        // Style the markers a bit. This will be our listing marker icon.
        var defaultIcon = makeMarkerIcon('F69480');

        // Create a "highlighted location" marker color for when the user
        // mouses over the marker.
        var highlightedIcon = makeMarkerIcon('f7070b');

        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < locations.length; i++) {
          // Get the position from the location array.
          var position = locations[i].location;
          var title = locations[i].title;
          // Create a marker per location, and put into markers array.
          var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
          });

          locations[i].marker = marker; // we made marker a property of the locations and stored info of each marker
          wikiLink(locations[i]);
          // Push the marker to our array of markers.
          markers.push(marker);


         marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
          });
          bounds.extend(markers[i].position);
          marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
          });

          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
          });
        }
        // Extend the boundaries of the map for each marker
        map.fitBounds(bounds);

        function wikiLink(location) {
          location.url = '';
          var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + title + '&limit=1&format=json&callback=wikiCallback';
             var wikiRequestTimeout = setTimeout(function() {
               alert ("Unfortunately, Wikipedia is unavailable. Please try again later.");
             }, 5000);

          $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            jsonp: "callback",
            success: function(response) {
              var wikiList = response[1];
                 for (var i = 0; i < wikiList.length; i++) {
                 wikiData = wikiList[i];
                 var url = 'http://en.wikipedia.org/wiki/' + wikiData;

                 }
               windowContent = 'click below for Wikipedia link' + '<h3><a href="' + url + '">' +  wikiData + '</a></h3>' ;
            console.log(windowContent);
            }
         });
          clearTimeout(wikiRequestTimeout);
        };
    wikiLink(location);
}

      // This function populates the infowindow when the marker is clicked. We'll only allow
      // one infowindow which will open at the marker that is clicked, and populate based
      // on that markers position.
      function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent('');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 500;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><hr><div id="pano"></div><div><a href=' + windowContent + '</a></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      }


      // This function takes in a COLOR, and then creates a new marker
      // icon of that color. The icon will be 21 px wide by 34 high, have an origin
      // of 0, 0 and be anchored at 10, 34).

      function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }


var viewModel = function () {
    var self = this;
    self.locations = ko.observableArray(locations);
    self.title = self.locations.title;
    self.filter = ko.observable("");
    var places = ko.utils.arrayMap(locations, function(location) {
         return new self.locations;
     });
     self.placeList = ko.observableArray(places);

    self.filteredlocations = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      return self.locations();
    } else {
      return ko.utils.arrayFilter(self.locations(), function(id) {
        return stringStart(id.title.toLowerCase(), filter);
      });
    }

  });

  var stringStart = function (string, startsWith) {
       string = string || "";
       if (startsWith.length > string.length)
           return false;
       return string.substring(0, startsWith.length) === startsWith;
   };
    var stringStartsWith = function (string, startsWith) {
       string = string || "";
       if (startsWith.length > string.length)
           return false;
       return string.substring(0, startsWith.length) === startsWith;
   };

          this.showInfoWindow = function(place) {
               google.maps.event.trigger(place.marker, 'click');
          };
}
ko.applyBindings(new viewModel);