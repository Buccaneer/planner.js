import http from "http";
import { inject, injectable, tagged } from "inversify";
import TravelMode from "./enums/TravelMode";

@injectable()
export default class ClusterFinder {

  private baseUrl = "http://localhost:3000/delijn/";
  private index = null;
  private summary = null;

  public async findClusters(departureStop: string, arrivalStop: string) {
    /*await this.fetchIndex();
    await this.fetchSummary();
    console.log(this.index);
    console.log(this.summary);*/
    return [{ url: "https://graph.irail.be/sncb/connections", travelMode: TravelMode.Train }];
  }

  private async fetchIndex() {
    return new Promise((resolve, reject) => {
      if (!this.index) {
        const req = http.get(this.baseUrl + "index.json", (response) => {
          let body = "";
          response.on("data", (chunk) => body += chunk);
          response.on("end", () => this.index = JSON.parse(body));
        });
        req.on("error", (error) => reject(error));
      } else {
        resolve();
      }
    });
  }

  private async fetchSummary() {
    return new Promise((resolve, reject) => {
      if (!this.index) {
        const req = http.get(this.baseUrl + "summary.json", (response) => {
          let body = "";
          response.on("data", (chunk) => body += chunk);
          response.on("end", () => this.index = JSON.parse(body));
        });
        req.on("error", (error) => reject(error));
      } else {
        resolve();
      }
    });
  }

}
