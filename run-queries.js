/* jshint esversion: 6*/
const Planner = require('./lib/Planner.js').default;
const fs = require('fs');

let planner = new Planner();
let queryTemplate = {
  from: 'https://data.delijn.be/stops/200065', // Gent Zuid
  to: 'https://data.delijn.be/stops/208447', // Zottegem Bruggenhoek
  minimumDepartureTime: new Date('2019-05-16T03:00:00.000Z'), // new Date("Wed May 15 2019 03:00:00"),
  maximumArrivalTime: new Date('2019-05-16T22:00:00.000Z'), // new Date("Fri May 17 2019 22:00:00"),
  publicTransportOnly: true,

  walkingSpeed: 3, // KmH
  minimumWalkingSpeed: 3, // KmH

  maximumWalkingDistance: 200, // meters

  minimumTransferDuration: Planner.Units.fromMinutes(1),
  maximumTransferDuration: Planner.Units.fromMinutes(30),

  maximumTravelDuration: Planner.Units.fromHours(3),

  maximumTransfers: 4,
};

let queries = [{
  from: 'https://data.delijn.be/stops/200065',
  to: 'https://data.delijn.be/stops/208447',
  minimumDepartureTime: new Date('2019-05-16T03:00:00.000Z'),
  maximumArrivalTime: new Date('2019-05-16T22:00:00.000Z'),
}, {
  from: 'https://data.delijn.be/stops/200065',
  to: 'https://data.delijn.be/stops/208447',
  minimumDepartureTime: new Date('2019-05-16T03:00:00.000Z'),
  maximumArrivalTime: new Date('2019-05-16T22:00:00.000Z'),
},
{
  from: 'https://data.delijn.be/stops/200065',
  to: 'https://data.delijn.be/stops/208447',
  minimumDepartureTime: new Date('2019-05-16T03:00:00.000Z'),
  maximumArrivalTime: new Date('2019-05-16T22:00:00.000Z'),
}
];

// NOTE: make sure to run queries sequentially so they don't influence eachother
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
    .take(3)
    .on('data', (path) => {
        log.paths.push({path: path, time: new Date().toISOString()});
      })
    .on('end', () => {
        log.stopTime = new Date().toISOString();
        fs.writeFileSync('./results/' + index + '.json', JSON.stringify(log));
        if (++index < queries.length) {
          runQuery(queries, index, planner, queryTemplate);
        }
      })
    .on('error', (error) => {
        log.error = error;
        fs.writeFileSync('./results/' + index + '.json', JSON.stringify(log));
        if (++index < queries.length) {
          runQuery(queries, index, planner, queryTemplate);
        }
      });
}
