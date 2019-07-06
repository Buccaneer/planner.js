/* jshint esversion: 6*/
const Planner = require('./lib/Planner.js').default;
const fs = require('fs');
const config = require('./config.js');
const queriesPath = config.queryPath + '/queries.json';

let planner = new Planner();
let queryTemplate = {
  from: 'https://data.delijn.be/stops/200065', // Gent Zuid
  to: 'https://data.delijn.be/stops/208447', // Zottegem Bruggenhoek
  minimumDepartureTime: new Date('2019-05-16T06:00:00.000Z'), // new Date("Wed May 15 2019 03:00:00"),
  maximumArrivalTime: new Date('2019-05-16T09:00:00.000Z'), // new Date("Fri May 17 2019 22:00:00"),
  publicTransportOnly: true,

  walkingSpeed: 3, // KmH
  minimumWalkingSpeed: 3, // KmH

  maximumWalkingDistance: 200, // meters

  minimumTransferDuration: Planner.Units.fromMinutes(1),
  maximumTransferDuration: Planner.Units.fromMinutes(30),

  maximumTravelDuration: Planner.Units.fromHours(3),

  maximumTransfers: 4,
};

let queries = JSON.parse(fs.readFileSync(queriesPath));
for (let query of queries) {
  query.minimumDepartureTime = new Date(query.minimumDepartureTime);
  query.maximumArrivalTime = new Date(query.maximumArrivalTime);
}

// NOTE: queries run sequentially so they don't influence eachother
runQuery(queries, 0, planner, queryTemplate);

function runQuery(queries, index, planner, queryTemplate) {
  // Prepare query
  queryTemplate.from = queries[index].from;
  queryTemplate.to = queries[index].to;
  queryTemplate.minimumDepartureTime = queries[index].minimumDepartureTime;
  queryTemplate.maximumArrivalTime = queries[index].maximumArrivalTime;
  // Prepare Object to be written to file
  let log = {};
  log.from = queries[index].from;
  log.to = queries[index].to;
  log.minimumDepartureTime = queries[index].minimumDepartureTime;
  log.maximumArrivalTime = queries[index].maximumArrivalTime;
  log.paths = [];
  log.startTime = new Date().toISOString();
  planner.query(queryTemplate)
    .on('data', (path) => {
        log.paths.push({path: path, time: new Date().toISOString()});
      })
    .once('end', () => {
        log.stopTime = new Date().toISOString();
        fs.writeFileSync(config.resultsPath + '/' + index + '.json', JSON.stringify(log));
        if (++index < queries.length) {
          runQuery(queries, index, planner, queryTemplate);
        }
      })
    .once('clusters-found', (clusters) => {
      // Do something with clusters
    })
    .on('error', (error) => {
        log.error = error.message;
        fs.writeFileSync(config.resultsPath + '/' + index + '.json', JSON.stringify(log));
        if (++index < queries.length) {
          runQuery(queries, index, planner, queryTemplate);
        }
      });
}
