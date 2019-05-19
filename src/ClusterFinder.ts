import http from "http";
import { inject, injectable, tagged } from "inversify";
import dijkstra from "../dijkstra.js";
import TravelMode from "./enums/TravelMode";

@injectable()
export default class ClusterFinder {

  private baseUrl = "http://localhost:3000/delijn/";
  private index = null;
  private summary = null;

  public async findClusters(departureStop: string, arrivalStop: string) {
    if (!this.index) {
      this.index = await this.fetchIndex();
    }
    if (!this.summary) {
      this.summary = await this.fetchSummary();
    }
    const startCluster = this.index[departureStop];
    const stopCluster = this.index[arrivalStop];
    let clusters = dijkstra(this.summary, startCluster, stopCluster);
    clusters = clusters.map((cluster: number) => {
      return { url: this.baseUrl + cluster + "/connections", travelMode: TravelMode.Bus };
    });
    clusters = [];
    for (let i = 0; i < 50; ++i) {
      clusters.push({ url: this.baseUrl + i + "/connections", travelMode: TravelMode.Bus });
    }
    // console.log(clusters);
    return clusters;

    // return [{ url: "https://graph.irail.be/sncb/connections", travelMode: TravelMode.Train }];
    /*return [
      { url: "https://openplanner.ilabt.imec.be/delijn/Antwerpen/connections", travelMode: TravelMode.Bus },
      { url: "https://openplanner.ilabt.imec.be/delijn/Limburg/connections", travelMode: TravelMode.Bus },
      { url: "https://openplanner.ilabt.imec.be/delijn/Oost-Vlaanderen/connections", travelMode: TravelMode.Bus },
      { url: "https://openplanner.ilabt.imec.be/delijn/Vlaams-Brabant/connections", travelMode: TravelMode.Bus },
      { url: "https://openplanner.ilabt.imec.be/delijn/West-Vlaanderen/connections", travelMode: TravelMode.Bus },
      { url: "https://openplanner.ilabt.imec.be/delijn/undefined/connections", travelMode: TravelMode.Bus },
    ];*/
  }

  private async fetchIndex() {
    const self = this;
    return new Promise((resolve, reject) => {
        const req = http.get(self.baseUrl + "index", (response) => {
          let body = "";
          response.on("data", (chunk) => body += chunk);
          response.on("end", () => resolve(JSON.parse(body)));
        });
        req.on("error", (error) => reject(error));
    });
  }

  private async fetchSummary() {
    const self = this;
    return new Promise((resolve, reject) => {
        const req = http.get(self.baseUrl + "clusters", (response) => {
          let body = "";
          response.on("data", (chunk) => body += chunk);
          response.on("end", () => resolve(JSON.parse(body)));
        });
        req.on("error", (error) => reject(error));
    });
  }

}
