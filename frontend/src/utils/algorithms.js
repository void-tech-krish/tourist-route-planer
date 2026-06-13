import { nodes } from './cities';

// Haversine Distance (heuristic)
export function haversineDistRaw(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Generate Graph
export function generateNetworks() {
    const nodeIds = Object.keys(nodes);
    let edges = [];
    for(let i=0; i<nodeIds.length; i++) {
        for(let j=i+1; j<nodeIds.length; j++) {
            const u = nodeIds[i];
            const v = nodeIds[j];
            const dist = haversineDistRaw(nodes[u].lat, nodes[u].lng, nodes[v].lat, nodes[v].lng);
            
            edges.push({ source: u, target: v, mode: 'flight', dist, time: Math.round((dist/800)*60)+90, cost: Math.round(dist*8), scenic: 2 });
            edges.push({ source: v, target: u, mode: 'flight', dist, time: Math.round((dist/800)*60)+90, cost: Math.round(dist*8), scenic: 2 });

            // Ensure islands (Andaman & Lakshadweep) do not get train/bus/car routes across the ocean!
            const isUIsland = u === 'IXZ' || u === 'AGX';
            const isVIsland = v === 'IXZ' || v === 'AGX';
            const isLandRouteValid = !isUIsland && !isVIsland;

            if (isLandRouteValid && dist < 1500) {
                edges.push({ source: u, target: v, mode: 'train', dist, time: Math.round((dist/80)*60), cost: Math.round(dist*1.5), scenic: 8 });
                edges.push({ source: v, target: u, mode: 'train', dist, time: Math.round((dist/80)*60), cost: Math.round(dist*1.5), scenic: 8 });
            }

            if (isLandRouteValid && dist < 800) {
                edges.push({ source: u, target: v, mode: 'bus', dist, time: Math.round((dist/50)*60), cost: Math.round(dist*1), scenic: 6 });
                edges.push({ source: v, target: u, mode: 'bus', dist, time: Math.round((dist/50)*60), cost: Math.round(dist*1), scenic: 6 });
                edges.push({ source: u, target: v, mode: 'car', dist, time: Math.round((dist/70)*60), cost: Math.round(dist*4), scenic: 9 });
                edges.push({ source: v, target: u, mode: 'car', dist, time: Math.round((dist/70)*60), cost: Math.round(dist*4), scenic: 9 });
            }
        }
    }
    return edges;
}

export const networks = generateNetworks();

// Formatting Output
function formatResult(bestPath) {
    if (!bestPath) return null;
    return {
        path: bestPath.path,
        modes: bestPath.modePath,
        totalCost: bestPath.cost,
        totalTime: bestPath.time,
        totalScenic: bestPath.scenic,
        coords: bestPath.path.map(id => [nodes[id].lat, nodes[id].lng])
    };
}

function getAdjacencyList(transportMode) {
    let adjacencyList = {};
    networks.filter(e => transportMode === 'compare all' || e.mode === transportMode).forEach(edge => {
        if (!adjacencyList[edge.source]) adjacencyList[edge.source] = [];
        // Sort by dist to give deterministic/better ties
        adjacencyList[edge.source].push(edge);
    });
    for (let key in adjacencyList) {
        adjacencyList[key].sort((a,b) => a.dist - b.dist);
    }
    return adjacencyList;
}

// 1. Breadth-First Search (BFS)
function runBFS(source, target, adj) {
    let queue = [{ node: source, cost: 0, time: 0, scenic: 0, path: [source], modePath: [] }];
    let visited = new Set([source]);

    while (queue.length > 0) {
        let current = queue.shift();
        if (current.node === target) return current;

        for (let edge of (adj[current.node] || [])) {
            if (!visited.has(edge.target)) {
                visited.add(edge.target);
                queue.push({
                    node: edge.target,
                    cost: current.cost + edge.cost,
                    time: current.time + edge.time,
                    scenic: current.scenic + edge.scenic,
                    path: [...current.path, edge.target],
                    modePath: [...current.modePath, edge.mode]
                });
            }
        }
    }
    return null;
}

// 2. Depth-First Search (DFS)
function runDFS(source, target, adj) {
    let stack = [{ node: source, cost: 0, time: 0, scenic: 0, path: [source], modePath: [], visited: new Set([source]) }];
    
    while (stack.length > 0) {
        let current = stack.pop();
        if (current.node === target) return current;

        for (let edge of (adj[current.node] || [])) {
            if (!current.visited.has(edge.target)) {
                let newVisited = new Set(current.visited);
                newVisited.add(edge.target);
                stack.push({
                    node: edge.target,
                    cost: current.cost + edge.cost,
                    time: current.time + edge.time,
                    scenic: current.scenic + edge.scenic,
                    path: [...current.path, edge.target],
                    modePath: [...current.modePath, edge.mode],
                    visited: newVisited
                });
            }
        }
    }
    return null;
}

// 3. Uniform Cost Search (UCS) & 4. A* Search
function runAStar(source, target, adj, optimizeFor, useHeuristic = true) {
    let openSet = [{ node: source, cost: 0, time: 0, scenic: 0, path: [source], modePath: [] }];
    let bestScore = { [source]: 0 }; // Track best score (cost, time, or scenic) to avoid redundant queue insertions
    
    // For UCS vs A*, heuristic is zero if UCS.
    const getH = (node) => {
        if (!useHeuristic) return 0;
        let d = haversineDistRaw(nodes[node].lat, nodes[node].lng, nodes[target].lat, nodes[target].lng);
        if (optimizeFor === 'time') return (d/800)*60;
        if (optimizeFor === 'scenic') return -d; // Invert for max scenic
        return d * 1.5; // cost heuristic
    };

    while (openSet.length > 0) {
        openSet.sort((a, b) => {
            let valA = optimizeFor === 'time' ? a.time : (optimizeFor === 'scenic' ? -a.scenic : a.cost);
            let valB = optimizeFor === 'time' ? b.time : (optimizeFor === 'scenic' ? -b.scenic : b.cost);
            return (valA + getH(a.node)) - (valB + getH(b.node));
        });

        let current = openSet.shift();
        if (current.node === target) return current;

        // Note: We removed the 'visited' Set. Instead, we rely on bestScore to prune redundant paths.
        // This is crucial for A* with inadmissible heuristics to maintain pathfinding completeness.

        for (let edge of (adj[current.node] || [])) {
            let nextCost = current.cost + edge.cost;
            let nextTime = current.time + edge.time;
            let nextScenic = current.scenic + edge.scenic;
                
            let valNext = optimizeFor === 'time' ? nextTime : (optimizeFor === 'scenic' ? -nextScenic : nextCost);
            
            if (bestScore[edge.target] === undefined || valNext < bestScore[edge.target]) {
                bestScore[edge.target] = valNext;
                openSet.push({
                    node: edge.target,
                    cost: nextCost,
                    time: nextTime,
                    scenic: nextScenic,
                    path: [...current.path, edge.target],
                    modePath: [...current.modePath, edge.mode]
                });
            }
        }
    }
    return null;
}

// 5. Backtracking
function runBacktracking(source, target, adj) {
    let best = null;
    let iters = 0;
    function backtrack(current, cost, time, scenic, path, modePath, visited) {
        if (iters++ > 100000) return; // Circuit breaker
        if (best && cost >= best.cost) return; // Prune if cost is already worse
        if (current === target) {
            best = { node: current, cost, time, scenic, path, modePath };
            return;
        }
        for (let edge of (adj[current] || [])) {
            if (!visited.has(edge.target)) {
                visited.add(edge.target);
                backtrack(edge.target, cost + edge.cost, time + edge.time, scenic + edge.scenic, [...path, edge.target], [...modePath, edge.mode], visited);
                visited.delete(edge.target);
            }
        }
    }
    backtrack(source, 0, 0, 0, [source], [], new Set([source]));
    return best;
}

// 6. Forward Checking
function runForwardChecking(source, target, adj) {
    let best = null;
    let iters = 0;
    function fc(current, cost, time, scenic, path, modePath, visited) {
        if (iters++ > 100000) return; // Circuit breaker
        if (best && cost >= best.cost) return;
        if (current === target) {
            best = { node: current, cost, time, scenic, path, modePath };
            return;
        }
        
        for (let edge of (adj[current] || [])) {
            if (!visited.has(edge.target)) {
                // Forward check: ensure target or at least one unvisited neighbor exists
                let hasValidFuture = edge.target === target || (adj[edge.target] || []).some(e => !visited.has(e.target));
                if (hasValidFuture) {
                    visited.add(edge.target);
                    fc(edge.target, cost + edge.cost, time + edge.time, scenic + edge.scenic, [...path, edge.target], [...modePath, edge.mode], visited);
                    visited.delete(edge.target);
                }
            }
        }
    }
    fc(source, 0, 0, 0, [source], [], new Set([source]));
    return best;
}

// 7. & 8. Minimax / AlphaBeta (Adversarial Routing vs Traffic Nature)
function runAdversarial(source, target, adj, useAlphaBeta) {
    // Model: Max (Nature) increases cost of next edge by 50% (traffic spike). Min (Tourist) tries to minimize cost.
    // Due to huge branching factor, we limit depth to 3.
    const MAX_DEPTH = 3;
    let iters = 0;
    
    function evaluate(nodeId, currentCost) {
        let h = haversineDistRaw(nodes[nodeId].lat, nodes[nodeId].lng, nodes[target].lat, nodes[target].lng) * 15; // High penalty for not reaching target
        return currentCost + h;
    }

    function search(node, depth, isMax, cost, time, scenic, path, modePath, visited, alpha, beta) {
        if (iters++ > 50000) return { score: evaluate(node, cost), cost, time, scenic, path, modePath }; // Return heuristic if circuit breaker hits
        if (node === target) return { score: cost, cost, time, scenic, path, modePath };
        if (depth === MAX_DEPTH) return { score: evaluate(node, cost), cost, time, scenic, path, modePath };

        let currentDistToTarget = haversineDistRaw(nodes[node].lat, nodes[node].lng, nodes[target].lat, nodes[target].lng);

        let edges = (adj[node] || []).filter(e => {
            if (visited.has(e.target)) return false;
            // Prevent insane zig-zags by only allowing edges that don't go heavily backwards
            let d = haversineDistRaw(nodes[e.target].lat, nodes[e.target].lng, nodes[target].lat, nodes[target].lng);
            return d < currentDistToTarget + 100;
        });

        if (edges.length === 0) return { score: Infinity };

        // Sort edges to explore ones closer to target first (massive boost for Alpha-Beta pruning)
        edges.sort((a, b) => {
            let distA = haversineDistRaw(nodes[a.target].lat, nodes[a.target].lng, nodes[target].lat, nodes[target].lng);
            let distB = haversineDistRaw(nodes[b.target].lat, nodes[b.target].lng, nodes[target].lat, nodes[target].lng);
            return distA - distB;
        });

        let bestResult = isMax ? { score: -Infinity } : { score: Infinity };

        for (let edge of edges) {
            // If nature (isMax) acts, edge cost is 1.5x. Otherwise 1x.
            let edgeMultiplier = isMax ? 1.5 : 1.0; 
            let edgeCost = edge.cost * edgeMultiplier;
            let edgeTime = edge.time * edgeMultiplier;
            
            visited.add(edge.target);
            let res = search(edge.target, depth + 1, !isMax, cost + edgeCost, time + edgeTime, scenic + edge.scenic, [...path, edge.target], [...modePath, edge.mode], visited, alpha, beta);
            visited.delete(edge.target);

            if (res.score === Infinity || res.score === -Infinity) continue; // Dead end

            if (isMax) {
                if (res.score > bestResult.score) bestResult = res;
                if (useAlphaBeta) {
                    alpha = Math.max(alpha, bestResult.score);
                    if (beta <= alpha) break; // Prune
                }
            } else {
                if (res.score < bestResult.score) bestResult = res;
                if (useAlphaBeta) {
                    beta = Math.min(beta, bestResult.score);
                    if (beta <= alpha) break; // Prune
                }
            }
        }
        return bestResult.score === Infinity || bestResult.score === -Infinity ? { score: evaluate(node, cost), cost, time, scenic, path, modePath } : bestResult;
    }
    
    let res = search(source, 0, false, 0, 0, 0, [source], [], new Set([source]), -Infinity, Infinity);
    if (!res || res.score === Infinity || res.score === -Infinity) return null;

    // If the path didn't reach the target (due to MAX_DEPTH or circuit breaker), complete it using A*
    let lastNode = res.path[res.path.length - 1];
    if (lastNode !== target) {
        let remainingPath = runAStar(lastNode, target, adj, 'cost', true);
        if (remainingPath) {
            // Stitch paths
            // We skip the first node of remainingPath.path because it's the same as lastNode
            return {
                ...res,
                cost: res.cost + remainingPath.cost,
                time: res.time + remainingPath.time,
                scenic: res.scenic + remainingPath.scenic,
                path: [...res.path, ...remainingPath.path.slice(1)],
                modePath: [...res.modePath, ...remainingPath.modePath]
            };
        }
    }
    return res;
}

// Master Dispatcher
export function runAlgorithm(source, target, transportMode, optimizeFor, algoType) {
    const adj = getAdjacencyList(transportMode);
    let bestPath = null;
    
    switch(algoType) {
        case 'bfs': bestPath = runBFS(source, target, adj); break;
        case 'dfs': bestPath = runDFS(source, target, adj); break;
        case 'ucs': bestPath = runAStar(source, target, adj, optimizeFor, false); break; // UCS is A* with no heuristic
        case 'astar': bestPath = runAStar(source, target, adj, optimizeFor, true); break;
        case 'backtrack': bestPath = runBacktracking(source, target, adj); break;
        case 'fc': bestPath = runForwardChecking(source, target, adj); break;
        case 'minimax': bestPath = runAdversarial(source, target, adj, false); break;
        case 'alphabeta': bestPath = runAdversarial(source, target, adj, true); break;
        default: bestPath = runAStar(source, target, adj, optimizeFor, true);
    }

    return formatResult(bestPath);
}
