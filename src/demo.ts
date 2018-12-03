import Planner from "./index";
import Units from "./util/Units";

export default async (logResults) => {

  const planner = new Planner();

  // const roadOnlyResult = await planner.query({
  //  roadOnly: true,
  //  from: "http://irail.be/stations/NMBS/008896008", // Kortrijk
  //  to: "http://irail.be/stations/NMBS/008892007", // Ghent-Sint-Pieters
  // });
//
  // roadOnlyResult.each((path) => {
  //  if (logResults) {
  //    console.log(path);
  //  }
  // });

  console.time("Public transport planner");

  const publicTransportResult = await planner.query({
    publicTransportOnly: true,
    from: "https://data.delijn.be/stops/201657", // Ingelmunster
    to: "https://data.delijn.be/stops/205910", // Ghent-Sint-Pieters
    minimumDepartureTime: new Date(),
    maximumTransfers: 2,
    maximumTransferDuration: Units.fromHours(.05),
  });

  console.timeEnd("Public transport planner");

  let i = 0;

  publicTransportResult.on("readable", () => {
    let path = publicTransportResult.read();

    while (path && i < 5) {
      // console.log(i++, path);

      console.log(i++);

      path.steps.forEach((step) => {
        console.log(step.startTime);
        console.log(step.startLocation.name);
        console.log(step.travelMode);
        console.log(step.stopTime);
        console.log(step.stopLocation.name);
        console.log("");
      });

      console.log("");
      console.log("");

      path = publicTransportResult.read();
    }
  });

  return true;
};
