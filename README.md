# Planner.js: A JS library for route planning

🛸️ [![Build Status](https://travis-ci.org/openplannerteam/planner.js.svg?branch=dev)](https://travis-ci.org/openplannerteam/planner.js) 🚴 [![MIT License](https://img.shields.io/github/license/openplannerteam/planner.js.svg?maxAge=2592000)](https://github.com/openplannerteam/planner.js/blob/master/LICENSE) 🚉  [![npm version](https://badge.fury.io/js/plannerjs.svg)](https://badge.fury.io/js/plannerjs) 🚀

```
$ npm install plannerjs
```

Include it in the browser:
```html
<script src="https://planner.js.org/js/planner-latest.js"></script>
```

Include it in your JavaScript project:
```javascript
const Planner = require('plannerjs').default;

// or

import Planner              from 'plannerjs';
```

Use it in both environments:
```javascript
const planner = new Planner();

planner.query({
  from: "http://irail.be/stations/NMBS/008812005", // Brussels North
  to: "http://irail.be/stations/NMBS/008892007", // Ghent-Sint-Pieters
  minimumDepartureTime: new Date("Mon Feb 11 2019 16:00:00"),
  maximumArrivalTime: new Date("Mon Feb 11 2019 19:00:00"),
  publicTransportOnly: true,

  walkingSpeed: 3, // KmH
  minimumWalkingSpeed: 3, // KmH

  maximumWalkingDistance: 200, // meters

  minimumTransferDuration: Planner.Units.fromMinutes(1),
  maximumTransferDuration: Planner.Units.fromMinutes(30),

  maximumTravelDuration: Planner.Units.fromHours(1.5),

  maximumTransfers: 4,
})
  .take(3)
  .on('data', (path) => {
   console.log(path);
  })
  .on('end', () => {
    console.log('No more paths!')
  })
  .on('error', (error) => {
    console.error(error);
  });
```

## Documentation

For further instructions, follow the documentation at https://planner.js.org/

## Developing

 * Building the docs with typedoc: `npm run doc`
 * Testing with jest: `npm test`
 * Build a new browser version with `npm run browser`
 * Bundle the latest planner for the docs example `npm run doc-bundle`

## Clustering

### Configuration

- **disableClustering:** Disable clustering. If data provider has n clusters 0 to n-1, it will assume there is an n-th "cluster" which contains all data.
- **agencyUrl:** Url to endpoint hosting agency.
- **queryPath:** Local path where queries are kept, looks for `/queryPath/queries.json`.
- **resultsPath:** Local path to directory where results of n queries will be written as `0.json` to `n.json`.

```js
{
    disableClustering: false,
    agencyUrl: 'http://localhost:3000/delijn/',
    queryPath: '/Users/Pieter-Jan/Documents/UGent/thesis/lc/queries',
    resultsPath: '/Users/Pieter-Jan/Documents/UGent/thesis/lc/results'
}
```

`/queryPath/queries.json`

```js
[
    {
        "from":"https://data.delijn.be/stops/504089",
        "to":"https://data.delijn.be/stops/503487",
        "minimumDepartureTime":"2019-05-16T06:00:00.000Z",
        "maximumArrivalTime":"2019-05-16T09:00:00.000Z"
    },
    ...
]
```

### Run

```bash
$ tsc
$ node run-queries
```
