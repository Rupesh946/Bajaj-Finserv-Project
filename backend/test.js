const http = require('http');

const PORT = 4000;
const HOST = 'localhost';

// Helper function to make HTTP POST requests
function postRequest(path, payload) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(payload);

    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': dataString.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: JSON.parse(body)
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(dataString);
    req.end();
  });
}

// Deep equality assertion helper
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// Main Test Suites
async function runTests() {
  console.log("========================================");
  console.log("STARTING BFHL GRAPH API LOCAL TEST SUITE");
  console.log("========================================\n");

  let passedAll = true;

  // Test Case 1: Worked Example from Part 9
  try {
    const payload = {
      data: [
        "A->B", "A->C", "B->D", "C->E", "E->F",
        "X->Y", "Y->Z", "Z->X",
        "P->Q", "Q->R",
        "G->H", "G->H", "G->I",
        "hello", "1->2", "A->"
      ]
    };

    console.log("[Test 1] Running Part 9 Worked Example...");
    const res = await postRequest('/bfhl', payload);

    const expectedHierarchies = [
      { root: "A", tree: { A: { B: { D: {} }, C: { E: { F: {} } } } }, depth: 4 },
      { root: "X", tree: {}, has_cycle: true },
      { root: "P", tree: { P: { Q: { R: {} } } }, depth: 3 },
      { root: "G", tree: { G: { H: {}, I: {} } }, depth: 2 }
    ];
    const expectedInvalid = ["hello", "1->2", "A->"];
    const expectedDuplicates = ["G->H"];
    const expectedSummary = { total_trees: 3, total_cycles: 1, largest_tree_root: "A" };

    const codePassed = res.statusCode === 200;
    const hPassed = deepEqual(res.data.hierarchies, expectedHierarchies);
    const iPassed = deepEqual(res.data.invalid_entries, expectedInvalid);
    const dPassed = deepEqual(res.data.duplicate_edges, expectedDuplicates);
    const sPassed = deepEqual(res.data.summary, expectedSummary);

    if (codePassed && hPassed && iPassed && dPassed && sPassed) {
      console.log("  => PASS: Correctly processed validation, cycles, depths, and summary statistics.");
    } else {
      passedAll = false;
      console.error("  => FAIL: Response output mismatch.");
      console.error("     Status Code Pass:", codePassed);
      console.error("     Hierarchies Pass:", hPassed, "\n     Received:", JSON.stringify(res.data.hierarchies));
      console.error("     Invalid Entries Pass:", iPassed);
      console.error("     Duplicate Edges Pass:", dPassed);
      console.error("     Summary Pass:", sPassed);
    }
  } catch (err) {
    passedAll = false;
    console.error("  => FAIL: Test 1 encountered network error:", err.message);
  }

  console.log("\n----------------------------------------");

  // Test Case 2: Empty Data Array
  try {
    const payload = { data: [] };
    console.log("[Test 2] Running Empty Data Array Case...");
    const res = await postRequest('/bfhl', payload);

    const codePassed = res.statusCode === 200;
    const summaryPassed = deepEqual(res.data.summary, { total_trees: 0, total_cycles: 0, largest_tree_root: null });
    const listsPassed = res.data.hierarchies.length === 0 && res.data.invalid_entries.length === 0 && res.data.duplicate_edges.length === 0;

    if (codePassed && summaryPassed && listsPassed) {
      console.log("  => PASS: Handled empty array cleanly returning empty structural arrays and null root.");
    } else {
      passedAll = false;
      console.error("  => FAIL: Test 2 failed. Received:", JSON.stringify(res.data));
    }
  } catch (err) {
    passedAll = false;
    console.error("  => FAIL: Test 2 encountered error:", err.message);
  }

  console.log("\n----------------------------------------");

  // Test Case 3: All Invalid Input
  try {
    const payload = { data: ["hello", "1->2", "abc", ""] };
    console.log("[Test 3] Running All-Invalid Input Case...");
    const res = await postRequest('/bfhl', payload);

    const codePassed = res.statusCode === 200;
    const invalidCountPassed = res.data.invalid_entries.length === 4;
    const emptyPassed = res.data.hierarchies.length === 0 && res.data.duplicate_edges.length === 0;

    if (codePassed && invalidCountPassed && emptyPassed) {
      console.log("  => PASS: Correctly classified all entries as invalid.");
    } else {
      passedAll = false;
      console.error("  => FAIL: Test 3 failed. Received:", JSON.stringify(res.data));
    }
  } catch (err) {
    passedAll = false;
    console.error("  => FAIL: Test 3 encountered error:", err.message);
  }

  console.log("\n----------------------------------------");

  // Test Case 4: Pure Self-loop
  try {
    const payload = { data: ["A->A", "A->A"] };
    console.log("[Test 4] Running Pure Self-Loop Edge Case...");
    const res = await postRequest('/bfhl', payload);

    // Self loops are filtered as invalid in Part 2 and never double-counted as duplicates or cycles
    const codePassed = res.statusCode === 200;
    const invalidPassed = deepEqual(res.data.invalid_entries, ["A->A", "A->A"]);
    const dupPassed = res.data.duplicate_edges.length === 0;
    const hPassed = res.data.hierarchies.length === 0;

    if (codePassed && invalidPassed && dupPassed && hPassed) {
      console.log("  => PASS: Correctly categorized self-loops in invalid list, avoiding duplicate or cycle count.");
    } else {
      passedAll = false;
      console.error("  => FAIL: Test 4 failed. Received:", JSON.stringify(res.data));
    }
  } catch (err) {
    passedAll = false;
    console.error("  => FAIL: Test 4 encountered error:", err.message);
  }

  console.log("\n----------------------------------------");

  // Test Case 5: Malformed payload (Missing data key)
  try {
    const payload = { not_data: [] };
    console.log("[Test 5] Running Malformed Payload Case (Missing data)...");
    const res = await postRequest('/bfhl', payload);

    const codePassed = res.statusCode === 400;
    const successKeyPassed = res.data.is_success === false;

    if (codePassed && successKeyPassed) {
      console.log("  => PASS: Successfully returned HTTP 400 and failure status on malformed payload.");
    } else {
      passedAll = false;
      console.error("  => FAIL: Test 5 failed. Received Code:", res.statusCode, "Body:", JSON.stringify(res.data));
    }
  } catch (err) {
    passedAll = false;
    console.error("  => FAIL: Test 5 encountered error:", err.message);
  }

  console.log("\n========================================");
  if (passedAll) {
    console.log("ALL TESTS COMPLETED SUCCESSFULLY: PASSED");
  } else {
    console.error("TEST SUITE FAILED: ONE OR MORE CASES FAILED");
  }
  console.log("========================================");
}

runTests();
