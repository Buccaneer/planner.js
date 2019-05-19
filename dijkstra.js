function dijkstra(graph, start, stop) {
    if (stop || stop === 0) {
        let [dist, pred] = dijkstra(graph, start)
        return extractNodes(dist, pred, start, stop)
    }
    let dist = []
    let pred = []
    let Q = []
    for (let node = 0; node < graph.length; ++node) {
        dist[node] = Infinity
        pred[node] = []
        Q.push({ index: node, neighbours: graph[node] })
    }
    dist[start] = 0

    while (!isEmpty(Q)) {
        let [u, indexInQ] = min(Q, dist)
        Q.splice(indexInQ, 1)
        for (let v in u.neighbours) {
            let alt = dist[u.index] + u.neighbours[v]
            if (alt < dist[v]) {
                dist[v] = alt
                pred[v] = [u.index]
            } else if (alt === dist[v]) {
                pred[v].push(u.index)
            }
        }
    }
    return [dist, pred]
}

function isEmpty(Q) {
    return Q.length < 1
}

function min(Q, dist) {
    let indexInQ = 0
    let min = Q[indexInQ]
    for (let i = 1; i < Q.length; ++i) {
        if (dist[Q[i].index] < dist[min.index]) {
            indexInQ = i
            min = Q[i]
        }
    }
    return [min, indexInQ]
}

function extractNodes(dist, pred, start, stop) {
    let nodes = {}
    nodes[stop] = 1
    let Q = [stop]
    while (!isEmpty(Q)) {
        let node = Q.shift()
        for (p of pred[node]) {
            if (!nodes[p]) {
                nodes[p] = 1
                Q.push(p)
            }
        }
    }
    return Object.keys(nodes)
}

module.exports = dijkstra;
