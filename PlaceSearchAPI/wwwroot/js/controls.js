var Mapa = {

    map: null,
    layer:null,
    markers: [],
    infoWindows: [],
    temp: null,
    coordenate: {lat: 0, lng: 0},

    instanciar: function(position)
    {
        Mapa.coordenate.lat = position.coords.latitude;
        Mapa.coordenate.lng = position.coords.longitude;

        Mapa.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: Mapa.coordenate
        });
        Mapa.infoMyPlace(Mapa.coordenate);
    },

    infoMyPlace(coordenate)
    {
        let infoWindow = Infowindow.create(0, coordenate);
        infoWindow.setContent("Minha localização");

        let marker = Marker.create(0, coordenate, "Meu Local");
        Marker.eventOpenInfoWindow(marker, infoWindow);
    },

    setLayer: function(layerPath)
    {
        if (layerPath == "") return;

        let baseUrl = jQuery("#baseUrl").val();
        let urlLayer = baseUrl+layerPath;
        this.map.data.loadGeoJson(urlLayer);

        Mapa.styleLayer();

        this.map.addListener('zoom_changed', function()
        {
            if(Mapa.map.getZoom() >= 14)
            {
                return Mapa.map.data.setStyle({
                    fillColor: "transparent",
                    strokeWeight: 0,
                    strokeColor: 'transparent'
                });
            }
            else
            {
                return Mapa.styleLayer();
            }
        });
    },

    styleLayer: function()
    {
        Mapa.map.data.setStyle({
            fillColor: '#eee2dd',
            strokeWeight: 0.5,
            strokeColor: '#de4b3f'
        });
    }
};

var ServicePlaces = {

    searchPlace: function()
    {
        Marker.removeAll();

        let searchPlace = jQuery("#search-place").val();
        let type = jQuery("input[name=filter-place]:checked").val();
        let radius = jQuery("#search-distance").val() * 1000;
        let service = new google.maps.places.PlacesService(Mapa.map);

        if (searchPlace == "")
        {
            service.nearbySearch({
                location: Mapa.coordenate,
                radius: radius,
                types: [type],
                query: searchPlace
            }, ServicePlaces.createMarkers);
        }
        else
        {
            service.textSearch({
                location: Mapa.coordenate,
                radius: radius,
                types: [type],
                query: searchPlace
            }, ServicePlaces.createMarkers);
        }
    },

    createMarkers: function (results, status)
    {
        jQuery("#tot-place").html("("+results.length+")");
        jQuery("#submenu").html("");

        if (status !== google.maps.places.PlacesServiceStatus.OK) return false;

        let submenu = "";

        for (var i = 0; i < results.length; i++)
        {
            results[i].id = i + 1;
            ServicePlaces.createMarker(results[i]);
            submenu += ServicePlaces.addSubmenu(results[i]);
        }

        jQuery("#tot-place").html("("+results.length+")");
        jQuery("#submenu").html(submenu);
    },

    createMarker: function(place)
    {
        let coordenate = place.geometry.location;

        let infowindow = Infowindow.create(place.id, coordenate);
        infowindow.setContent(ServicePlaces.createInfoWindowContent(place));

        let marker = Marker.create(place.id, coordenate, place.name, place.icon);

        Marker.eventOpenInfoWindow(marker, infowindow);
    },

    createInfoWindowContent: function (place)
    {
        let tag = "<div class='panel'>";
                tag += "<div class='row'>";
                    tag += "<div class='col-12'>";
                        tag += "<strong> Local: </strong>" + place.name;
                    tag +="</div>";
                    tag += "<div class='col-12'>";
                        tag += "<strong> Endereço: </strong>" + place.vicinity;
                    tag +="</div>";
                tag +="</div>";
            tag +="</div>";
        return tag;
    },

    addSubmenu: function(place)
    {
        return "<li class='nav-item'><a class='nav-link nav-side' onclick='ServicePlaces.goTo("+place.id+")'>"+place.name + "</a></li>";
    },

    goTo: function (id)
    {
        let marker = Marker.find(id);
        let infoWindow = Infowindow.find(id);

        Mapa.map.setCenter(marker.position);
        infoWindow.open(Mapa.map, marker);
        
    }
};

var Marker = {

    create: function(id, coordenate, title, icon = null)
    {
        let marker = null;

        if (icon == null) {
            marker = new google.maps.Marker({
                position: coordenate,
                map: Mapa.map,
                id: id,
                title: title
            });
        }
        else
        {
           let image = {
                url: icon,
                scaledSize: new google.maps.Size(25, 25)
            };

           marker = new google.maps.Marker({
               position: coordenate,
               map: Mapa.map,
               title: title,
               id: id,
               icon: image
           });

           Mapa.markers.push(marker);
        }

        return marker;
    },

    eventOpenInfoWindow: function(marker, infoWindow)
    {
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.open(Mapa.map, this);

        });
    },

    remove: function (id)
    {
        let c = Mapa.markers.length;
        for (let i = 0; i < c; i++) {
            if (Mapa.markers[i].id == id)
            {
                Mapa.markers[i].setMap(null);
                return true;
            }
        }
        Mapa.markers = [];
        return false;
    },

    removeAll: function ()
    {
        let c = Mapa.markers.length;
        for (let i = 0; i < c; i++) {
            Mapa.markers[i].setMap(null);
        }
        Mapa.markers = [];
        return true;
    },

    find: function (id)
    {
        for (let i = 0; i < Mapa.markers.length; i++)
        {
            if (Mapa.markers[i].id == id) return Mapa.markers[i];
        }
        return false;
    },

    getEnd: function(lat, lng)
    {
        let geocoder = new google.maps.Geocoder;
        let latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};

        geocoder.geocode({'location': latlng}, function(results, status)
        {
            if (status === 'OK')
            {
                if (results[1])
                {
                    jQuery("#end").val(results[1].formatted_address);
                    jQuery("#endloading").html("");
                    jQuery("#saveMarker").prop("disabled",false);
                }
                else
                {
                    jQuery("#end").val("Nenhum resultado encontrado");
                    jQuery("#endloading").html("");
                    jQuery("#saveMarker").prop("disabled",false);
                }
            }
            else
            {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    },

    getCoord: function ()
    {
        if(Mapa.temp) Mapa.temp.setMap(null);

        let address = jQuery('#search-address').val();
        let geocoder = new google.maps.Geocoder;

        let boundsLayer = new google.maps.LatLngBounds();
        Mapa.map.data.forEach(function(feature){
            feature.getGeometry().forEachLatLng(function(latlng){
                boundsLayer.extend(latlng);
            });
        });

        console.log(boundsLayer);

        geocoder.geocode(
            {
                'address': address,
                'bounds': boundsLayer
            },
            function(results, status)
            {
                if (status === 'OK')
                {
                    // Mapa.map.setCenter(results[0].geometry.location);

                    let bounds = new google.maps.LatLngBounds();

                    let marker = new google.maps.Marker({
                        title: results[0].formatted_address,
                        position: results[0].geometry.location,
                        map: Mapa.map,
                    });

                    let loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
                    bounds.extend(loc);

                    Mapa.map.fitBounds(bounds);
                    Mapa.map.panToBounds(bounds);
                    Mapa.temp = marker;
                }
                else
                {
                    console.log('Geocode was not successful for the following reason: ' + status);
                }
            }
        );
    },
};

var Infowindow = {

    create: function(id, coordenate)
    {
        let infoWindow = new google.maps.InfoWindow({
            id: id,
            center: coordenate,
            position:coordenate,
        });
        Mapa.infoWindows.push(infoWindow);
        return infoWindow;
    },

    find: function (id)
    {
        for (let i = 0; i < Mapa.infoWindows.length; i++)
        {
            if (Mapa.infoWindows[i].id == id) return Mapa.infoWindows[i];
        }
        return false;
    },

    removeAll: function () {
        let c = Mapa.infoWindows.length;
        for (let i = 0; i < c; i++) {
            //alert(Mapa.infoWindows[i].id);
        }
    },

    remove: function (id) {
        let c = Mapa.infoWindows.length;
        for (let i = 0; i < c; i++) {
            if (Mapa.infoWindows[i].id == id)
            {
                Mapa.infoWindows[i].close();
            }
        }
    },
};


$(document).ready(function() {
    jQuery("#search-address").keypress(function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            Marker.getCoord();
        }
    });
});