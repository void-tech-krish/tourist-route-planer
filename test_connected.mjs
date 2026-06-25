import { generateNetworks, networks } from './frontend/src/utils/algorithms.js';
import { nodes } from './frontend/src/utils/cities.js';

const nodeIds = Object.keys(nodes);

// Check Train Connectivity
function checkConnectivity(mode, maxDist) {
    let adj = {};
    nodeIds.forEach(n => adj[n] = []);
    networks.filter(e => e.mode === mode).forEach(e => {
        adj[e.source].push(e.target);
    });

    // Start from DEL
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
    
    // Check if islands are the only ones missing
    let missing = nodeIds.filter(n => !visited.has(n));
    let missingNonIslands = missing.filter(n => {
        const name = nodes[n].name;
        return !(name.includes('Andaman') || name.includes('Lakshadweep'));
    });
    console.log(`${mode} mode disconnected nodes:`, missingNonIslands.length);
    if (missingNonIslands.length > 0) {
        console.log("Sample missing:", missingNonIslands.slice(0, 5).map(id => nodes[id].name));
    }
}

checkConnectivity('train', 300);
