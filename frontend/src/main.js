function haversineDistRaw(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

class DisjointSet {
    constructor() {
        this.parent = {};
    }
    makeSet(i) {
        this.parent[i] = i;
    }
    find(i) {
        if (this.parent[i] === i) return i;
        this.parent[i] = this.find(this.parent[i]);
        return this.parent[i];
    }
    union(i, j) {
        const rootI = this.find(i);
        const rootJ = this.find(j);
        if (rootI !== rootJ) {
            this.parent[rootI] = rootJ;
            return true;
        }
        return false;
    }
}

function generateNetworks() {
    const nodeIds = Object.keys(nodes);
    let allPossibleEdges = [];
    
    for(let i=0; i<nodeIds.length; i++) {
        for(let j=i+1; j<nodeIds.length; j++) {
            const u = nodeIds[i];
            const v = nodeIds[j];
            const dist = haversineDistRaw(nodes[u].lat, nodes[u].lng, nodes[v].lat, nodes[v].lng);
            allPossibleEdges.push({ u, v, dist });
        }
    }
    
    allPossibleEdges.sort((a,b) => a.dist - b.dist);
    
    // 1. FLIGHT NETWORK (Fully Connected)
    let flightLinks = [...allPossibleEdges]; 
    let flightEdges = flightLinks.map(link => {
        const dist = Math.round(link.dist); 
        const speed = 800; 
        const time = Math.round((dist / speed) * 60) + 90; // Add 90 mins for airport processing
        const cost = Math.round(dist * 8); 
        const scenic = 1; 
        return { source: link.u, target: link.v, dist, time, cost, scenic };
    });
    
    function generateSubNetwork(k, speed, costPerKm, routeMultiplier, isTrain) {
        let generatedLinks = new Set();
        const ds = new DisjointSet();
        nodeIds.forEach(id => ds.makeSet(id));
        let edgesList = [];
        
        // MST
        for(let edge of allPossibleEdges) {
            if (ds.union(edge.u, edge.v)) {
                generatedLinks.add(`${edge.u}-${edge.v}`);
                generatedLinks.add(`${edge.v}-${edge.u}`);
                edgesList.push(edge);
            }
        }
        
        // KNN
        for(let i=0; i<nodeIds.length; i++) {
            const u = nodeIds[i];
            let neighbors = allPossibleEdges.filter(e => e.u === u || e.v === u).sort((a,b) => a.dist - b.dist);
            let added = 0;
            for(let edge of neighbors) {
                const v = edge.u === u ? edge.v : edge.u;
                if(!generatedLinks.has(`${u}-${v}`) && edge.dist < (isTrain ? 800 : 600)) { 
                    generatedLinks.add(`${u}-${v}`);
                    generatedLinks.add(`${v}-${u}`);
                    edgesList.push(edge);
                    added++;
                }
                if(added >= k) break;
            }
        }
        
        return edgesList.map(link => {
            const dist = Math.round(link.dist * routeMultiplier); 
            const time = Math.round((dist / speed) * 60);
            const cost = Math.round(dist * costPerKm); 
            const scenic = isTrain ? 8 : (3 + (Math.round(link.dist) % 5)); 
            return { source: link.u, target: link.v, dist, time, cost, scenic };
        });
    }
    
    // 2. TRAIN NETWORK (MST + KNN k=1)
    let trainEdges = generateSubNetwork(1, 80, 2.5, 1.1, true);
    
    // 3. BUS NETWORK (MST + KNN k=2)
    let busEdges = generateSubNetwork(2, 60, 5, 1.25, false);
    
    return { flight: flightEdges, train: trainEdges, bus: busEdges };
}

const networks = generateNetworks();

const graphData = {
    flight: [],
    train: [],
    bus: []
};

['flight', 'train', 'bus'].forEach(mode => {
    networks[mode].forEach(e => {
        graphData[mode].push(e);
        graphData[mode].push({ source: e.target, target: e.source, dist: e.dist, time: e.time, cost: e.cost, scenic: e.scenic });
    });
});

let map;
let defaultLines = [];
let activePathLines = []; // Array to hold all segments
let nodeMarkers = []; // Keep track of dynamically added markers

function getNeighbors(u, edgeList) {
    return edgeList.filter(e => e.source === u);
}

function heuristic(u, v) {
    return haversineDistRaw(nodes[u].lat, nodes[u].lng, nodes[v].lat, nodes[v].lng);
}

function runBFS(start, end, edgeList) {
    let queue = [[start]];
    let visited = new Set([start]);
    while(queue.length > 0) {
        let path = queue.shift();
        let node = path[path.length - 1];
        if (node === end) return path;
        for(let edge of getNeighbors(node, edgeList)) {
            if(!visited.has(edge.target)) {
                visited.add(edge.target);
                queue.push([...path, edge.target]);
            }
        }
    }
    return [];
}

function runDFS(start, end, edgeList) {
    let stack = [[start]];
    let visited = new Set();
    while(stack.length > 0) {
        let path = stack.pop();
        let node = path[path.length - 1];
        if(node === end) return path;
        if(!visited.has(node)) {
            visited.add(node);
            for(let edge of getNeighbors(node, edgeList)) {
                stack.push([...path, edge.target]);
            }
        }
    }
    return [];
}

function runGreedy(start, end, edgeList) {
    let visited = new Set();
    let current = start;
    let path = [start];
    while(current !== end) {
        visited.add(current);
        let neighbors = getNeighbors(current, edgeList).filter(e => !visited.has(e.target));
        if(neighbors.length === 0) break;
        neighbors.sort((a,b) => heuristic(a.target, end) - heuristic(b.target, end));
        current = neighbors[0].target;
        path.push(current);
    }
    return current === end ? path : [];
}

function runAStar(start, end, edgeList) {
    let openSet = [ { path: [start], cost: 0, f: heuristic(start, end) } ];
    let visited = new Set();
    while(openSet.length > 0) {
        openSet.sort((a,b) => a.f - b.f);
        let current = openSet.shift();
        let node = current.path[current.path.length - 1];
        if(node === end) return current.path;
        if(!visited.has(node)) {
            visited.add(node);
            for(let edge of getNeighbors(node, edgeList)) {
                let newCost = current.cost + edge.dist; 
                openSet.push({
                    path: [...current.path, edge.target],
                    cost: newCost,
                    f: newCost + heuristic(edge.target, end)
                });
            }
        }
    }
    return [];
}

function runBacktracking(start, end, maxCost, maxTime, edgeList) {
    let validPaths = [];
    let iterations = 0;
    const MAX_ITER = 50000;
    
    function bt(current, path, cost, time) {
        if(validPaths.length > 5 || iterations > MAX_ITER) return; 
        iterations++;
        if(current === end) {
            validPaths.push([...path]);
            return;
        }
        let neighbors = getNeighbors(current, edgeList);
        neighbors.sort((a,b) => heuristic(a.target, end) - heuristic(b.target, end));
        for(let edge of neighbors) {
            if(validPaths.length > 5 || iterations > MAX_ITER) return;
            if(!path.includes(edge.target)) {
                let nCost = cost + edge.cost;
                let nTime = time + edge.time;
                if(nCost <= maxCost && nTime <= maxTime) {
                    path.push(edge.target);
                    bt(edge.target, path, nCost, nTime);
                    path.pop();
                }
            }
        }
    }
    bt(start, [start], 0, 0);
    return validPaths;
}

function runForwardChecking(start, end, maxCost, maxTime, edgeList) {
    let validPaths = [];
    let iterations = 0;
    const MAX_ITER = 50000;
    
    function fc(current, path, cost, time) {
        if(validPaths.length > 5 || iterations > MAX_ITER) return; 
        iterations++;
        if(current === end) {
            validPaths.push([...path]);
            return;
        }
        let neighbors = getNeighbors(current, edgeList);
        neighbors.sort((a,b) => heuristic(a.target, end) - heuristic(b.target, end));
        for(let edge of neighbors) {
            if(validPaths.length > 5 || iterations > MAX_ITER) return;
            if(!path.includes(edge.target)) {
                let nCost = cost + edge.cost;
                let nTime = time + edge.time;
                if(nCost <= maxCost && nTime <= maxTime) {
                    let hasFuture = false;
                    if(edge.target === end) {
                        hasFuture = true;
                    } else {
                        let futures = getNeighbors(edge.target, edgeList).filter(e => !path.includes(e.target));
                        if(futures.length > 0) hasFuture = true;
                    }
                    if(hasFuture) {
                        path.push(edge.target);
                        fc(edge.target, path, nCost, nTime);
                        path.pop();
                    }
                }
            }
        }
    }
    fc(start, [start], 0, 0);
    return validPaths;
}

function initUI() {
    // 1. Initialize Map
    map = L.map('map', {
        zoomControl: false // Custom placement if needed
    }).setView([22.5937, 78.9629], 5); // Center of India

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);
    
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 2. Populate Dropdowns
    const startSelect = document.getElementById('startNode');
    const endSelect = document.getElementById('endNode');
    const sortedNodes = Object.values(nodes).sort((a, b) => a.name.localeCompare(b.name));
    
    sortedNodes.forEach(node => {
        let opt1 = document.createElement('option'); opt1.value = node.id; opt1.text = node.name;
        let opt2 = document.createElement('option'); opt2.value = node.id; opt2.text = node.name;
        startSelect.add(opt1);
        endSelect.add(opt2);
    });
    
    // Set default values (e.g. DEL to MUM)
    if(nodes['DEL']) startSelect.value = 'DEL';
    if(nodes['MUM']) endSelect.value = 'MUM';

    // 3. Bind UI Elements
    
    // Swap Button
    document.getElementById('swapBtn').addEventListener('click', () => {
        let temp = startSelect.value;
        startSelect.value = endSelect.value;
        endSelect.value = temp;
        updateEndpointsOnMap();
    });

    // Transport Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('selectedMode').value = this.getAttribute('data-mode');
        });
    });

    // AI Settings Accordion
    const aiToggle = document.getElementById('aiSettingsToggle');
    const aiContent = document.getElementById('aiSettingsContent');
    const aiChevron = document.getElementById('aiSettingsChevron');
    aiToggle.addEventListener('click', () => {
        aiContent.classList.toggle('open');
        aiChevron.style.transform = aiContent.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
        aiChevron.style.transition = 'transform 0.3s';
    });

    // Endpoint Update Listeners
    startSelect.addEventListener('change', updateEndpointsOnMap);
    endSelect.addEventListener('change', updateEndpointsOnMap);

    // Bind Run Button
    document.getElementById('runBtn').addEventListener('click', () => {
        let start = startSelect.value;
        let end = endSelect.value;
        let algo = document.getElementById('algorithm').value;
        let mode = document.getElementById('selectedMode').value;
        let maxCost = parseFloat(document.getElementById('maxCost').value);
        let maxTime = parseFloat(document.getElementById('maxTime').value);
        
        let resDiv = document.getElementById('resultsContent');
        resDiv.innerHTML = `<p style="text-align: center; color: var(--text-light); margin-top: 20px;">
                                <i class="fa-solid fa-spinner fa-spin fa-2x"></i><br>
                                Running AI Optimization...
                            </p>`;
        
        // Remove old route
        if(activePathLines.length > 0) {
            activePathLines.forEach(line => map.removeLayer(line));
            activePathLines = [];
        }
        
        setTimeout(async () => {
            try {
                if(mode === 'compare_modes') {
                    // Run A* for all modes to compare
                    let resFlight = runAStar(start, end, graphData['flight']);
                    let resTrain = runAStar(start, end, graphData['train']);
                    let resBus = runAStar(start, end, graphData['bus']);
                    displayComparison(resFlight, resTrain, resBus);
                } else {
                    let graph = graphData[mode];
                    let result;
                    if(algo === 'astar') result = runAStar(start, end, graph);
                    else if(algo === 'greedy') result = runGreedy(start, end, graph);
                    else if(algo === 'bfs') result = runBFS(start, end, graph);
                    else if(algo === 'dfs') result = runDFS(start, end, graph);
                    else if(algo === 'backtracking') result = runBacktracking(start, end, maxCost, maxTime, graph)[0] || [];
                    else if(algo === 'forward_checking') result = runForwardChecking(start, end, maxCost, maxTime, graph)[0] || [];
                    
                    displayItinerary(result, mode);
                    if(result && result.length > 0) await highlightPath(result, '#f97316', true, 6, mode === 'flight');
                }
            } catch(e) {
                resDiv.innerHTML = `<p style="color: var(--error);">Error running algorithm: ${e.message}</p>`;
                console.error(e);
            }
        }, 100);
    });

    updateEndpointsOnMap();
}

function clearNodeMarkers() {
    nodeMarkers.forEach(m => map.removeLayer(m));
    nodeMarkers = [];
}

function addNodeMarker(nodeId, isEndpoint = false) {
    const node = nodes[nodeId];
    if(!node) return;

    let marker = L.circleMarker([node.lat, node.lng], {
        radius: isEndpoint ? 6 : 4, 
        fillColor: isEndpoint ? '#f97316' : '#2563eb',
        color: '#fff',
        weight: isEndpoint ? 2 : 1,
        opacity: 0.8,
        fillOpacity: 0.9
    }).addTo(map);

    if (isEndpoint) {
        marker.bindTooltip(node.name.split(' ')[0], {
            className: 'city-label',
            direction: 'top',
            offset: [0, -5],
            permanent: true
        }).openTooltip();
    } else {
        marker.bindTooltip(node.name.split(' ')[0], {
            className: 'city-label',
            direction: 'top',
            offset: [0, -5]
        });
    }

    nodeMarkers.push(marker);
}

function updateEndpointsOnMap() {
    clearNodeMarkers();
    
    if(activePathLines.length > 0) {
        activePathLines.forEach(line => map.removeLayer(line));
        activePathLines = [];
    }
    
    const startId = document.getElementById('startNode').value;
    const endId = document.getElementById('endNode').value;
    
    addNodeMarker(startId, true);
    addNodeMarker(endId, true);
}

async function highlightPath(path, color = '#f97316', clearPrevious = true, weight = 6, isStraightLine = false) {
    if(clearPrevious && activePathLines.length > 0) {
        activePathLines.forEach(line => map.removeLayer(line));
        activePathLines = [];
    }
    
    if(clearPrevious) clearNodeMarkers();
    if(!path || path.length < 2) return updateEndpointsOnMap();
    
    path.forEach((nodeId, index) => {
        const isEndpoint = (index === 0 || index === path.length - 1);
        addNodeMarker(nodeId, isEndpoint);
    });

    if (isStraightLine) {
        const latlngs = path.map(nodeId => [nodes[nodeId].lat, nodes[nodeId].lng]);
        let line = L.polyline(latlngs, {
            color: color, weight: weight, opacity: 0.9, dashArray: '10, 15'
        }).addTo(map);
        line.bringToFront();
        activePathLines.push(line);
        map.fitBounds(line.getBounds(), { padding: [50, 50] });
        return;
    }

    try {
        const coords = path.map(nodeId => `${nodes[nodeId].lng},${nodes[nodeId].lat}`).join(';');
        const response = await fetch(`https://router.project-osrm.org/route/v1/car/${coords}?overview=full&geometries=geojson`);
        if(!response.ok) throw new Error("OSRM routing failed");
        const data = await response.json();
        
        let latlngs = [];
        if(data.code === 'Ok' && data.routes.length > 0) {
            latlngs = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        } else {
            latlngs = path.map(nodeId => [nodes[nodeId].lat, nodes[nodeId].lng]);
        }
        
        let line = L.polyline(latlngs, {
            color: color, weight: weight, opacity: 0.9, lineCap: 'round', lineJoin: 'round'
        }).addTo(map);
        
        line.bringToFront();
        activePathLines.push(line);
        map.fitBounds(line.getBounds(), { padding: [50, 50] });
    } catch (error) {
        const latlngs = path.map(nodeId => [nodes[nodeId].lat, nodes[nodeId].lng]);
        let line = L.polyline(latlngs, {
            color: color, weight: weight, opacity: 0.9
        }).addTo(map);
        line.bringToFront();
        activePathLines.push(line);
        map.fitBounds(line.getBounds(), { padding: [50, 50] });
    }
}

function getModeIcon(mode) {
    if(mode === 'flight') return '<i class="fa-solid fa-plane"></i>';
    if(mode === 'train') return '<i class="fa-solid fa-train"></i>';
    if(mode === 'bus') return '<i class="fa-solid fa-bus"></i>';
    return '<i class="fa-solid fa-route"></i>';
}

function getEdge(u, v, edgeList) {
    return edgeList.find(e => e.source === u && e.target === v);
}

function calcMetrics(path, edgeList) {
    let m = { dist: 0, time: 0, cost: 0, scenic: 0 };
    if(!path || path.length < 2) return m;
    for(let i=0; i<path.length-1; i++){
        const e = getEdge(path[i], path[i+1], edgeList);
        if(e) {
            m.dist += e.dist;
            m.time += e.time;
            m.cost += e.cost;
            m.scenic += e.scenic;
        }
    }
    return m;
}

function displayItinerary(pathNodes, mode) {
    let resDiv = document.getElementById('resultsContent');
    if(!pathNodes || pathNodes.length === 0) {
        resDiv.innerHTML = `<p style="color: var(--error); padding: 15px; background: rgba(239,68,68,0.1); border-radius: 8px;">No valid route found.</p>`;
        return;
    }
    
    let totalDist = 0; let totalCost = 0; let totalTime = 0;
    let timelineHtml = '<div class="timeline">';
    
    for(let i=0; i<pathNodes.length; i++) {
        let city = pathNodes[i];
        timelineHtml += `<div class="timeline-item">
                            <div class="timeline-city">${nodes[city].name}</div>`;
        
        if(i < pathNodes.length - 1) {
            let nextCity = pathNodes[i+1];
            let edge = getEdge(city, nextCity, graphData[mode]);
            if(edge) {
                totalDist += edge.dist; totalCost += edge.cost; totalTime += edge.time;
                timelineHtml += `<div class="timeline-details">
                                    ${getModeIcon(mode)} 
                                    <span>${edge.dist.toFixed(0)} km</span> &bull; 
                                    <span>₹${edge.cost.toFixed(0)}</span> &bull; 
                                    <span>${Math.floor(edge.time/60)}h ${Math.round(edge.time%60)}m</span>
                                 </div>`;
            }
        }
        timelineHtml += `</div>`;
    }
    timelineHtml += '</div>';

    resDiv.innerHTML = `
        <div class="itinerary-card">
            <div class="itinerary-header">
                <h4 style="color: var(--text-dark); margin:0;">Route Found</h4>
            </div>
            <div class="route-badges" style="margin-bottom: 15px;">
                <div class="badge badge-dist"><i class="fa-solid fa-road"></i> ${totalDist.toFixed(0)} km</div>
                <div class="badge badge-cost"><i class="fa-solid fa-wallet"></i> ₹${totalCost.toFixed(0)}</div>
                <div class="badge badge-time"><i class="fa-regular fa-clock"></i> ${Math.floor(totalTime/60)}h ${Math.round(totalTime%60)}m</div>
            </div>
            ${timelineHtml}
        </div>
    `;
}

function displayComparison(resFlight, resTrain, resBus) {
    let resDiv = document.getElementById('resultsContent');
    
    function calcStats(path, mode) {
        if(!path || path.length===0) return null;
        let d=0, c=0, t=0;
        for(let i=0; i<path.length-1; i++) {
            let edge = getEdge(path[i], path[i+1], graphData[mode]);
            if(edge) { d+=edge.dist; c+=edge.cost; t+=edge.time; }
        }
        return { distance: d, cost: c, time: t, path: path, mode: mode };
    }
    
    let stats = [
        calcStats(resFlight, 'flight'),
        calcStats(resTrain, 'train'),
        calcStats(resBus, 'bus')
    ].filter(x => x !== null);
    
    if(stats.length === 0) {
        resDiv.innerHTML = '<p>No routes found.</p>';
        return;
    }
    
    let minCost = Math.min(...stats.map(s => s.cost));
    let minTime = Math.min(...stats.map(s => s.time));
    
    let html = '<div class="compare-grid">';
    stats.forEach(s => {
        let isCheapest = s.cost === minCost;
        let isFastest = s.time === minTime;
        html += `
            <div class="compare-card" onclick="window.renderSpecificPath('${s.mode}', '${s.path.join(',')}')">
                <div class="compare-icon">${getModeIcon(s.mode)}</div>
                <div class="compare-stats">
                    <h4>${s.mode} Route</h4>
                    <div class="compare-metrics">
                        <span><i class="fa-solid fa-wallet"></i> ₹${s.cost.toFixed(0)}</span>
                        <span><i class="fa-regular fa-clock"></i> ${Math.floor(s.time/60)}h ${Math.round(s.time%60)}m</span>
                    </div>
                </div>
                ${isCheapest ? '<div class="compare-winner cheapest">CHEAPEST</div>' : ''}
                ${isFastest && !isCheapest ? '<div class="compare-winner fastest">FASTEST</div>' : ''}
            </div>
        `;
    });
    html += '</div><p style="font-size:0.8rem; color:var(--text-light); text-align:center; margin-top:10px;">Click a card to view route on map</p>';
    resDiv.innerHTML = html;
}

window.renderSpecificPath = async function(mode, pathStr) {
    let path = pathStr.split(',');
    displayItinerary(path, mode);
    await highlightPath(path, mode === 'flight' ? '#2563eb' : '#f97316', true, 6, mode === 'flight');
}

window.onload = initUI;
