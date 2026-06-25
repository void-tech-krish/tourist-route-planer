import fs from 'fs';

// simple heuristic to extract nodes and check graph distance manually.
// instead of importing, we'll read the files and evaluate them.
const citiesContent = fs.readFileSync('frontend/src/utils/cities.js', 'utf-8');
const extraCitiesContent = fs.readFileSync('frontend/src/utils/extra_cities.js', 'utf-8');

// strip exports
let c1 = citiesContent.replace(/export /g, '').replace(/import .*;/g, '');
let c2 = extraCitiesContent.replace(/export /g, '');

let evalScript = `
${c2}
${c1}

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

const nodeIds = Object.keys(nodes);
function checkDist(limit) {
    let adj = {};
    nodeIds.forEach(n => adj[n] = []);
    for(let i=0; i<nodeIds.length; i++) {
        for(let j=i+1; j<nodeIds.length; j++) {
            let u = nodeIds[i]; let v = nodeIds[j];
            let dist = haversineDistRaw(nodes[u].lat, nodes[u].lng, nodes[v].lat, nodes[v].lng);
            
            const isNodeIsland = (nodeId) => {
                if (nodeId === 'IXZ' || nodeId === 'AGX') return true;
                const name = nodes[nodeId]?.name || '';
                return name.includes('Andaman') || name.includes('Lakshadweep');
            };
            
            if (!isNodeIsland(u) && !isNodeIsland(v) && dist < limit) {
                adj[u].push(v);
                adj[v].push(u);
            }
        }
    }
    
    let visited = new Set(['DEL']);
    let queue = ['DEL'];
    while(queue.length > 0) {
        let curr = queue.shift();
        for(let nxt of adj[curr]) {
            if(!visited.has(nxt)) {
                visited.add(nxt);
                queue.push(nxt);
            }
        }
    }
    
    let missing = nodeIds.filter(n => !visited.has(n));
    let missingNonIslands = missing.filter(n => {
        const name = nodes[n].name;
        return !(name.includes('Andaman') || name.includes('Lakshadweep'));
    });
    console.log("Limit " + limit + " disconnected: " + missingNonIslands.length);
    if(missingNonIslands.length > 0) {
        console.log("Missing sample: ", missingNonIslands.slice(0,5).map(id => nodes[id].name));
    }
}

checkDist(200);
checkDist(250);
checkDist(300);
checkDist(400);
checkDist(500);
`;

eval(evalScript);
