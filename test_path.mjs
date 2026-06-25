import { runAlgorithm, networks } from './frontend/src/utils/algorithms.js';

const res = runAlgorithm('IXZ', 'IXC', 'train', 'cost', 'astar');
console.log(JSON.stringify(res, null, 2));

const ixzEdges = networks.filter(e => e.source === 'IXZ' && e.mode === 'train');
console.log("IXZ train edges:", ixzEdges.length);
