const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Approved user identity fields
const USER_ID = "rupesh_25102003";
const EMAIL_ID = "rupesh2276.be23@chitkara.edu.in";
const COLLEGE_ROLL_NUMBER = "2310992276";

// GET / health check
app.get('/', (req, res) => {
  res.status(200).json({ status: "healthy", service: "BFHL Graph API" });
});

// GET /health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: "healthy", service: "BFHL Graph API" });
});

// GET /bfhl
app.get('/bfhl', (req, res) => {
  res.status(200).json({ operation_code: 1 });
});

// DFS to traverse undirected graph and collect component nodes
function getComponentNodes(startNode, undirectedAdj, visited) {
  const component = [];
  const queue = [startNode];
  visited.add(startNode);
  
  while (queue.length > 0) {
    const u = queue.shift();
    component.push(u);
    const neighbors = undirectedAdj[u] || [];
    for (const v of neighbors) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);
      }
    }
  }
  return component;
}

// DFS cycle detection using 3-state coloring (0 = unvisited, 1 = visiting, 2 = visited)
function checkCycleDFS(node, adj, state) {
  state[node] = 1; // visiting
  const children = adj[node] || [];
  for (const child of children) {
    if (state[child] === 1) {
      return true; // cycle detected!
    }
    if (!state[child]) {
      if (checkCycleDFS(child, adj, state)) {
        return true;
      }
    }
  }
  state[node] = 2; // visited
  return false;
}

// Build children tree recursively
function buildTreeChildren(node, adj) {
  const children = adj[node] || [];
  // Sort children lexicographically
  const sortedChildren = [...children].sort();
  const childrenTree = {};
  
  for (const child of sortedChildren) {
    childrenTree[child] = buildTreeChildren(child, adj);
  }
  return childrenTree;
}

// Calculate height of the tree (number of nodes on longest path)
function getTreeDepth(node, adj) {
  const children = adj[node] || [];
  if (children.length === 0) {
    return 1;
  }
  let maxChildDepth = 0;
  for (const child of children) {
    const d = getTreeDepth(child, adj);
    if (d > maxChildDepth) {
      maxChildDepth = d;
    }
  }
  return 1 + maxChildDepth;
}

// POST /bfhl endpoint
app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;

    // Gracefully handle malformed inputs
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        message: "Invalid payload. 'data' must be an array of strings."
      });
    }

    const invalid_entries = [];
    const duplicate_edges = [];
    const firstOccurrences = [];
    const seenEdges = new Set();

    // 1. Validate and deduplicate entries
    data.forEach(item => {
      // Non-string entries check
      if (typeof item !== 'string') {
        invalid_entries.push(String(item));
        return;
      }
      
      const trimmed = item.trim();
      
      // Empty string check
      if (trimmed === "") {
        invalid_entries.push(trimmed);
        return;
      }

      // Pattern check: exactly one uppercase letter, "->", exactly one uppercase letter
      const match = trimmed.match(/^([A-Z])->([A-Z])$/);
      if (!match) {
        invalid_entries.push(trimmed);
        return;
      }

      const parent = match[1];
      const child = match[2];

      // Self-loop check
      if (parent === child) {
        invalid_entries.push(trimmed);
        return;
      }

      // Check duplicates
      if (seenEdges.has(trimmed)) {
        if (!duplicate_edges.includes(trimmed)) {
          duplicate_edges.push(trimmed);
        }
      } else {
        seenEdges.add(trimmed);
        firstOccurrences.push({ edgeStr: trimmed, parent, child });
      }
    });

    // 2. Diamond resolution: only first encountered parent wins for a child
    const childToParent = {};
    const acceptedEdges = [];
    const uniqueNodesInOrder = [];
    const nodeSeen = new Set();

    firstOccurrences.forEach(item => {
      const { edgeStr, parent, child } = item;
      
      // Track unique nodes in order of first appearance in the input
      if (!nodeSeen.has(parent)) {
        nodeSeen.add(parent);
        uniqueNodesInOrder.push(parent);
      }
      if (!nodeSeen.has(child)) {
        nodeSeen.add(child);
        uniqueNodesInOrder.push(child);
      }

      if (childToParent[child] !== undefined) {
        // Discard later parent edge silently (doesn't go into duplicate/invalid lists)
        return;
      }
      childToParent[child] = parent;
      acceptedEdges.push({ parent, child, edgeStr });
    });

    // 3. Setup adjacency lists for connected components
    const undirectedAdj = {};
    const directedAdj = {};
    
    uniqueNodesInOrder.forEach(node => {
      undirectedAdj[node] = [];
      directedAdj[node] = [];
    });

    acceptedEdges.forEach(edge => {
      const { parent, child } = edge;
      directedAdj[parent].push(child);
      undirectedAdj[parent].push(child);
      undirectedAdj[child].push(parent);
    });

    // 4. Traverse components in order of appearance
    const visited = new Set();
    const hierarchies = [];

    uniqueNodesInOrder.forEach(startNode => {
      if (visited.has(startNode)) {
        return;
      }

      // Get all nodes in this connected component
      const componentNodes = getComponentNodes(startNode, undirectedAdj, visited);

      // Check for cycles in this component
      let hasCycle = false;
      const dfsState = {}; // 0=unvisited, 1=visiting, 2=visited
      
      for (const node of componentNodes) {
        if (!dfsState[node]) {
          if (checkCycleDFS(node, directedAdj, dfsState)) {
            hasCycle = true;
          }
        }
      }

      // Root Identification
      // A node is a root if it never appears as a child in the accepted edge set of this component
      const componentRoots = componentNodes.filter(node => childToParent[node] === undefined);

      let finalRoot = "";
      if (hasCycle || componentRoots.length === 0) {
        // Use lexicographically smallest node name as root for cycles
        const sortedComp = [...componentNodes].sort();
        finalRoot = sortedComp[0];
        
        hierarchies.push({
          root: finalRoot,
          tree: {},
          has_cycle: true
        });
      } else {
        // If acyclic, it has exactly 1 root (components can have at most 1 root due to indegree <= 1)
        finalRoot = componentRoots[0];
        const treeContent = buildTreeChildren(finalRoot, directedAdj);
        const depth = getTreeDepth(finalRoot, directedAdj);

        hierarchies.push({
          root: finalRoot,
          tree: { [finalRoot]: treeContent },
          depth
        });
      }
    });

    // 5. Compute Summary
    const nonCyclicTrees = hierarchies.filter(h => h.has_cycle === undefined);
    const cyclicGroups = hierarchies.filter(h => h.has_cycle === true);

    let largest_tree_root = null;
    if (nonCyclicTrees.length > 0) {
      // Sort trees: primary descending by depth, secondary lexicographically ascending by root
      const sortedTrees = [...nonCyclicTrees].sort((a, b) => {
        if (b.depth !== a.depth) {
          return b.depth - a.depth;
        }
        return a.root.localeCompare(b.root);
      });
      largest_tree_root = sortedTrees[0].root;
    }

    const summary = {
      total_trees: nonCyclicTrees.length,
      total_cycles: cyclicGroups.length,
      largest_tree_root
    };

    // Return the exact response schema keys & format
    return res.status(200).json({
      user_id: USER_ID,
      email_id: EMAIL_ID,
      college_roll_number: COLLEGE_ROLL_NUMBER,
      hierarchies,
      invalid_entries,
      duplicate_edges,
      summary
    });

  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`BFHL Graph Server running on port ${PORT}`);
});
