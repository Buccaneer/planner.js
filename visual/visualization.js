const queries = initQueries();
const queryTemplate = initQueryTemplate(); 

const planner = new Planner();

// Contains fields related to the map
const visual = {
	layers: [], // Keep track of layers so they can be removed
	index: 0, // Index used to determine current query (queries[index])
	map: initMap(),
	colors: initColors()
};

// Contains data fields
const data = {
	stops: null,
	index: null,
	clusters: null
};
initData(data).then(() => {
	showStops(visual, data, data.stops, 'blue');
	document.getElementById("showClusters").onclick = () => {
		clearLayers();
		showAllClusters(visual, data);
	};	
	// setTimeout(showAllClusters, 2000, visual, data);
	enableQuerying();
});


function initQueries() {
	const queries = [
		{"from":"https://data.delijn.be/stops/506289","to":"https://data.delijn.be/stops/501299","minimumDepartureTime":"2019-05-16T06:00:00.000Z","maximumArrivalTime":"2019-05-16T09:00:00.000Z"},
		{"from":"https://data.delijn.be/stops/105759","to":"https://data.delijn.be/stops/103646","minimumDepartureTime":"2019-05-16T06:00:00.000Z","maximumArrivalTime":"2019-05-16T09:00:00.000Z"},
		{"from":"https://data.delijn.be/stops/205289","to":"https://data.delijn.be/stops/108847","minimumDepartureTime":"2019-05-16T06:00:00.000Z","maximumArrivalTime":"2019-05-16T09:00:00.000Z"},
		{"from":"https://data.delijn.be/stops/102750","to":"https://data.delijn.be/stops/108165","minimumDepartureTime":"2019-05-16T06:00:00.000Z","maximumArrivalTime":"2019-05-16T09:00:00.000Z"},
		{"from":"https://data.delijn.be/stops/302267","to":"https://data.delijn.be/stops/303010","minimumDepartureTime":"2019-05-16T06:00:00.000Z","maximumArrivalTime":"2019-05-16T09:00:00.000Z"},
		{"from":"https://data.delijn.be/stops/103680","to":"https://data.delijn.be/stops/104950","minimumDepartureTime":"2019-05-16T06:00:00.000Z","maximumArrivalTime":"2019-05-16T09:00:00.000Z"}
	];
	for (let query of queries) {
		query.minimumDepartureTime = new Date(query.minimumDepartureTime);
		query.maximumArrivalTime = new Date(query.maximumArrivalTime);
	}
	return queries;
}

function initQueryTemplate() {
	return {
		from: 'https://data.delijn.be/stops/200065', // Gent Zuid
		to: 'https://data.delijn.be/stops/208447', // Zottegem Bruggenhoek
		minimumDepartureTime: new Date('2019-05-16T06:00:00.000Z'),
		maximumArrivalTime: new Date('2019-05-16T09:00:00.000Z'),
		publicTransportOnly: true,
		walkingSpeed: 3, // KmH
		minimumWalkingSpeed: 3, // KmH
		maximumWalkingDistance: 200, // meters
		minimumTransferDuration: Planner.Units.fromMinutes(1),
		maximumTransferDuration: Planner.Units.fromMinutes(30),
		maximumTravelDuration: Planner.Units.fromHours(3),
		maximumTransfers: 4,
	};
}

function initMap() {
	const map = L.map('map', { zoomControl: true }).setView([51.000710, 4.20], 9);
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.streets',
		accessToken: 'pk.eyJ1IjoicGlldGVyamFudiIsImEiOiJjaWtudXNjdW4wdHZudnRrbTlmMm93Z2k4In0.hLkiI0rXfp8IPGrzVO1cIQ'
	}).addTo(map);
	return map;
}

function initColors() {
	return ['#ff0000', '#d60000', '#850000', '#5c0000', '#ff4d4d', '#ad3434', '#d66f00', '#854500', '#5c2f00', '#d68e40', '#33220f', '#f6ff00', 
	'#808500', '#595c00', '#32330f', '#4ead00', '#173300', '#385c1c', '#4cff58', '#28852e', '#00d67d', '#34ad7b', '#1c5c41', '#0f3324', '#00e6ff', 
	'#007785', '#1c555c', '#0f2f33', '#0042ad', '#00235c', '#4d91ff', '#3463ad', '#1c345c', '#0f1d33', '#1d00d6', '#0c005c', '#5440d6', '#342885', 
	'#140f33', '#a600ff', '#560085', '#a240d6', '#d600b3', '#85006f', '#5c004d', '#330f2d', '#d60044', '#85002a', '#5c001d', '#d64070', '#330f1b'];
}

function initData(data) {
	let fetchStops = fetch("http://localhost:3000/delijn/stops").then(async response => {
		data.stops = (await response.json())['@graph'];
	});
	let fetchIndex = fetch("http://localhost:3000/delijn/index").then(async response => {
		data.index = await response.json();
	});
	let fetchClusters = fetch("http://localhost:3000/delijn/clusters").then(async response => {
		data.clusters = await response.json();
	});
	return Promise.all([fetchStops, fetchIndex, fetchClusters]);
}

function showAllClusters(visual, data) {
	const clusterLayer = L.layerGroup();
	data.stops.forEach((stop) => {
		clusterLayer.addLayer(new L.circle([stop.latitude, stop.longitude], {
				radius: 2,
				color: visual.colors[data.index[stop['@id']]],
				weight: 3,
				opacity: 1,
				smoothFactor: 1
		}));
	})
	visual.layers.push(clusterLayer);
	clusterLayer.addTo(visual.map);
}

function showStops(visual, data, stops, color) {
	const clusterLayer = L.layerGroup();
	stops.forEach((stop) => {
		clusterLayer.addLayer(new L.circle([stop.latitude, stop.longitude], {
				radius: 2,
				color: color,
				weight: 3,
				opacity: 1,
				smoothFactor: 1
		}));
	})
	visual.layers.push(clusterLayer);
	clusterLayer.addTo(visual.map);
}

function enableQuerying() {
	document.getElementById("knop").onclick = () => {
		visual.index = ++visual.index < 5 ? visual.index : 0;
		runQuery(planner, queries, visual.index, queryTemplate);
	};	
}

function clearLayers() {
	visual.layers.forEach((layer) => {
		visual.map.removeLayer(layer);
	});
}

function runQuery(planner, queries, index, queryTemplate) {
  console.log("RUNNING CLUSTER QUERY");
  
  // Prepare query
  queryTemplate.from = queries[index].from;
  queryTemplate.to = queries[index].to;
  queryTemplate.minimumDepartureTime = queries[index].minimumDepartureTime;
  queryTemplate.maximumArrivalTime = queries[index].maximumArrivalTime;
  let found = 0;
  const startTime = new Date();
  planner.query(queryTemplate)
    .on('data', (path) => {
		found++;
		path.steps.forEach((step) => {
			const start = new L.LatLng(step.startLocation.latitude, step.startLocation.longitude);
			const stop = new L.LatLng(step.stopLocation.latitude, step.stopLocation.longitude);
			const line = new L.Polyline([start, stop], {
				color: 'white',
				weight: 3,
				opacity: 0.5,
				smoothFactor: 1
			});
			line.addTo(visual.map);
			visual.layers.push(line);
		});
      })
	.once('end', () => {
		let stopTime = new Date();
		document.getElementById("text").innerHTML += ( "Found " + found + " paths in " + (stopTime - startTime) + " ms.<br/>" );
    })
    .once('clusters-found', (clusters) => {
		clearLayers();
		showStops(visual, data, data.stops.filter((stop) => clusters().indexOf(data.index[stop['@id']].toString()) != -1), 'blue');
		showStops(visual, data, data.stops.filter((stop) => stop['@id'] === queryTemplate.from || stop['@id'] === queryTemplate.to), 'white');
    })
    .on('error', (error) => {
		log.error = error.message;
    });
}
