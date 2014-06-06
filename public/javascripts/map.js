$(document).ready(function(){
    var gData = [];
    var dataUrl = "https://www.publicstuff.com/api/2.0/requests_list?return_type=json&request_type_id=11339&limit=10000";
    var censusUrl = "/census.json";
    var censusData =[];

    $.ajax({
        url: dataUrl,
        dataType: 'json',
        async: false,
        data: {},
        success: function(data) {
            //console.log(data.response.requests);
            for (i in data.response.requests) {
                //console.log(item.requests[i].request);
                gData.push(data.response.requests[i].request);
        }
        }
    });

    $.ajax({
        url: censusUrl,
        dataType: 'json',
        async: false,
        data: {},
        success: function(data) {
            //console.log(data.response.requests);
            $.each(data.features, function(i, item) {
                console.log(item);
                censusData.push(item);
            });
        }
    });


    var map = L.map("map");

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    detectRetina: true
    }).addTo(map);

    var censusStyle = {
        "fillColor": "#fff4f4",
        "color": "#404b98",
        "weight": 5,
        "opacity": 0.65
    };

    var censusStyle2 = {
        "fillColor": "#fff4f4",
        "color": "#ff7800",
        "weight": 5,
        "opacity": 0.65
    };




    function createLayer(data, color, groupLayer) {
        GeoJSON.parse(data, {Point: ['lat', 'lon']}, function(geojson){
            L.geoJson(geojson, {
                pointToLayer : function (feature, latlng) {
                    return L.marker(latlng, {
                    'marker-color': color,
                    title: feature.properties.address
        });
                },
                onEachFeature: function (feature, layer) {
                    var popupContent = "<strong>" + feature.properties.address + "</strong><br>" + feature.properties.description;
                    var popupImage = "<strong>" + feature.properties.address + "</strong><br>" + feature.properties.description + "<br>" + '<img src="' + feature.properties.image_thumbnail + '"/>';
                    if (feature.properties.image_thumbnail) {
                        layer.bindPopup(popupImage);
                    } else {
                        layer.bindPopup(popupContent);
                    }
                }
            }).addTo(groupLayer);
        });
    };


    var graffiti = new  L.featureGroup();
    var census = new L.LayerGroup();
    var censusHsg = new L.LayerGroup();

    var overlays;
    overlays = {
        "Grafitti": createLayer(gData, '#67ca53', graffiti),

        "Census": L.geoJson(censusData, {
            style: censusStyle,

            onEachFeature: function (feature, layer) {
                layer.bindPopup('Census Tract: <strong>' + feature.properties.tractce10 + '</strong> <br>' + 'Total Population: <strong>' + feature.properties.total_pop.toLocaleString() + '</strong>');
            }
        }).addTo(census),

        "Census": L.geoJson(censusData, {
            style: censusStyle2,

            onEachFeature: function (feature, layer) {
                layer.bindPopup('Census Tract: <strong>' + feature.properties.tractce10 + '</strong> <br>' + 'Total Housing Units: <strong>' + feature.properties.total_housing_units.toLocaleString() + '</strong>');
            }
        }).addTo(censusHsg),

    };//end overlays


    map.addLayer(graffiti);

    console.log(graffiti);

    map.fitBounds(graffiti.getBounds());

    //grouped overlays for legend
    var Overlays = {
            "Total Population": census,
            "Total Housing Units": censusHsg
    };

//add legend to map
    L.control.layers(null, Overlays).addTo(map);

}) //end ready