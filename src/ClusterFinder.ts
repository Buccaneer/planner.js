import http from "http";
import { inject, injectable, tagged } from "inversify";
import config from "../config.js";
import dijkstra from "../dijkstra.js";
import Context from "./Context";
import EventType from "./enums/EventType";
import TravelMode from "./enums/TravelMode";
import TYPES from "./types";

@injectable()
export default class ClusterFinder {

  private baseUrl = config.agencyUrl;
  private index = null;
  private summary = null;
  private context = null;

  constructor(@inject(TYPES.Context) context: Context) {
    this.context = context;
  }

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

    // Emit clusters-found event
    this.context.emit(EventType.ClustersFound, () => clusters);

    clusters = clusters.map((cluster: number) => {
      return { url: this.baseUrl + cluster + "/connections", travelMode: TravelMode.Bus };
    });
    // Return "cluster" n where n is the amount of clusters as source if clustering is disabled
    // The server has clusters 0 to n-1 as actual clusters and "cluster" n as a benchmark with all connections in one
    if (config.disableClustering) {
      return [{ url: this.baseUrl + this.summary.length + "/connections", travelMode: TravelMode.Bus }];
    }
    return clusters;
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
