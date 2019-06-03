import { AsyncIterator } from "asynciterator";
import Context from "../../Context";
import { DurationMs } from "../../interfaces/units";
import IResolvedQuery from "../IResolvedQuery";

// NOTE: THIS IS NOT AN EXPONENTIAL QUERY ITERATOR ANYMORE

/**
 * This AsyncIterator emits [[IResolvedQuery]] instances with exponentially increasing `maximumArrivalTime`.
 * For each emitted query, the time frame gets doubled (x2).
 */
export default class ExponentialQueryIterator extends AsyncIterator<IResolvedQuery> {
  private readonly baseQuery: IResolvedQuery;
  private timespan: DurationMs;
  private stop: boolean; // STOP FLAG
  private context: Context;

  constructor(context: Context, baseQuery: IResolvedQuery, initialTimespan: DurationMs) {
    super();
    this.context = context;

    this.baseQuery = baseQuery;
    this.timespan = initialTimespan;

    this.timespan = baseQuery.maximumArrivalTime.getTime() - baseQuery.minimumDepartureTime.getTime();
    this.stop = false;

    this.readable = true;
  }

  public read(): IResolvedQuery {
    if (this.stop) { // STOP INSTEAD OF EXPONENTIAL
      this.context.emit("could-not-find-path", "could-not-find-path");
      this.close();
    }
    if (this.closed) {
      return null;
    }

    const {minimumDepartureTime} = this.baseQuery;
    const maximumArrivalTime = new Date(minimumDepartureTime.getTime() + this.timespan);

    this.timespan *= 2;
    this.stop = true; // SET STOP FLAG

    console.log(this.baseQuery);

    return Object.assign({}, this.baseQuery, {maximumArrivalTime});
  }
}
