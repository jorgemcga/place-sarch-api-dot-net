var Mapa = {

    map: null,
    layer:null,
    markers: [],
    favorites: [],
    infoWindows: [],
    favInfoWindows: [],
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

        return FavoritePlace.list();
    },

    infoMyPlace(coordenate)
    {
        let infoWindow = Infowindow.create(0, coordenate);
        infoWindow.setContent("Minha localização");

        let marker = Marker.create(0, coordenate.lat, coordenate.lng, "Meu Local");
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
            if (!FavoritePlace.findByName(results[i].name))
            {
                results[i].id = i + 1;
                ServicePlaces.createMarker(results[i]);
                submenu += ServicePlaces.addSubmenu(results[i]);
            }
        }

        jQuery("#tot-place").html("("+results.length+")");
        jQuery("#submenu").html(submenu);
    },

    createMarker: function(place)
    {
        let coordenate = place.geometry.location;

        place.id = place.id;

        let infowindow = Infowindow.create(place.id, coordenate);
        infowindow.setContent(ServicePlaces.createInfoWindowContent(place));

        let marker = Marker.create(place.id, coordenate.lat(), coordenate.lng(), place.name, place.vicinity, place.icon);

        Marker.eventOpenInfoWindow(marker, infowindow);
    },

    createInfoWindowContent: function (place)
    {
        let address = (place.vicinity !== undefined) ? place.vicinity : place.address;
        let html = "<div class='panel'>";
                html += "<div class='row'>";
                    html += "<div class='col-12'>";
                        html += "<strong> Local: </strong>" + place.name;
                    html +="</div>";
                    html += "<div class='col-12'>";
                        html += "<strong> Endereço: </strong>" + address;
                    html +="</div>";
                html +="</div>";
            html +="</div>";
        return html;
    },

    addSubmenu: function(place)
    {
        let html = "<li class='nav-item'>";
            html += "<span class='nav-link nav-side' title='Ir para o local'><a onclick='ServicePlaces.goTo("+place.id+")'>"+place.name + "</a>";
            html += " <span class='fa fa-star clicavel favorite' title='Favoritar' onclick=FavoritePlace.favorite("+place.id+")></span></span>";
            html += "</li>";
        return html;
    },

    goTo: function (id, tipo = 1)
    {
        let marker = Marker.find(id);
        let infoWindow = (tipo == 1) ? Infowindow.find(id) : Infowindow.findFavs(id);

        Mapa.map.setCenter(marker.position);
        infoWindow.open(Mapa.map, marker);
        
    }
};

var Marker = {

    create: function(id, lat, lng, title, address = "", icon = null)
    {
        let coordenate = new google.maps.LatLng(lat, lng);
        let marker = null;

        if (icon == null) {
            marker = new google.maps.Marker({
                position: coordenate,
                map: Mapa.map,
                id: id,
                title: title,
                lat: lat,
                lng: lng,
                address: address
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
               icon: image,
               lat: lat,
               lng: lng,
               address: address
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

var FavoritePlace = {

    list: function ()
    {
        jQuery("#submenu-favorite").html("");
        jQuery("#favorite-loding").show("");

        jQuery.ajax({
            url: "api/favoriteplace",
            type: 'GET',
            dataType: 'JSON',
            success: function (data)
            {
                jQuery("#favorite-loding").hide();

                if (data.length == 0) return jQuery("#submenu-favorite").html("Você ainda não tem nenhum local salvo");
                
                for (let i = 0; i < data.length; i++)
                {
                    jQuery("#submenu-favorite").append(FavoritePlace.addSubmenu(data[i]));
                    
                    let infowindow = Infowindow.create(data[i].id, {lat: data[i].lat, lng: data[i].lng}, 2);
                    infowindow.setContent(ServicePlaces.createInfoWindowContent(data[i]));
                    
                    let marker = Marker.create(data[i].id, data[i].lat, data[i].lng, data[i].name, data[i].address, data[i].icon); 

                    Marker.eventOpenInfoWindow(marker, infowindow);
                    Mapa.favorites.push(marker);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Erro: ");
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    },

    favorite: function (id)
    {
        let place = Marker.find(id);
        
        if (FavoritePlace.findByName(place.title)) return alert("Este local já foi salvo");

        let favorite = {
            lat: place.lat,
            lng: place.lng,
            name: place.title,
            address: place.address,
            icon: place.icon.url
        };

        jQuery.ajax({
            url: "api/favoriteplace",
            type: 'POST',
            data: favorite,
            dataType: 'JSON',
            success: function (favorite)
            {
                if (favorite.length == 0) return false;
                return FavoritePlace.list();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Erro: ");
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    },

    unfavorite: function (id)
    {
        let place = FavoritePlace.find(id);
        
        jQuery.ajax({
            url: "api/favoriteplace/"+place.id,
            type: 'DELETE',
            dataType: 'JSON',
            success: function (favorite)
            {
                return FavoritePlace.list();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Erro: ");
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    },

    find: function(id)
    {
        for(let i = 0; i < Mapa.favorites.length; i++)
        {
            if (Mapa.favorites[i].id == id) return Mapa.favorites[i];
        }
        return false;
    },

    findByName: function(name)
    {
        for(let i = 0; i < Mapa.favorites.length; i++)
        {
            if (Mapa.favorites[i].title == name) return Mapa.favorites[i];
        }
        return false;
    },

    addSubmenu: function(place)
    {
        let html = "<li class='nav-item'>";
            html += "<span class='nav-link nav-side' title='Ir para o local'><a onclick='ServicePlaces.goTo("+place.id+", 2)'>"+place.name + "</a>";
            html += " <span class='fa fa-star-o clicavel unfavorite' title='Desfavoritar' onclick=FavoritePlace.unfavorite("+place.id+")></span></span>";
            html += "</li>";
        return html;
    },
};

var Infowindow = {

    create: function(id, coordenate, tipo = 1)
    {
        let infoWindow = new google.maps.InfoWindow({
            id: id,
            center: coordenate,
            position:coordenate,
        });

        if (tipo == 1) Mapa.infoWindows.push(infoWindow);
        else Mapa.favInfoWindows.push(infoWindow);

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

    findFavs: function (id)
    {
        for (let i = 0; i < Mapa.favInfoWindows.length; i++)
        {
            if (Mapa.favInfoWindows[i].id == id) return Mapa.favInfoWindows[i];
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


$(document).ready(function () {

    jQuery("#search-address").keypress(function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            Marker.getCoord();
        }
    });
});