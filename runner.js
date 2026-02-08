import fs from "fs";

// Read files written by run.sh
const userCode = fs.readFileSync("/tmp/main.js", "utf8");
const rawInput = fs.readFileSync("/tmp/input.txt", "utf8").trim();

try {
    // 1. Execute user code (define twoSum)
    const fn = new Function(userCode + "\nreturn twoSum;");
    const twoSum = fn();

    if (typeof twoSum !== "function") {
        throw new Error("twoSum function not found");
    }

    // 2. Parse input
    const lines = rawInput.split("\n").map((l) => l.trim());
    let idx = 0;

    const T = Number(lines[idx++]);
    let outputs = [];

    for (let t = 0; t < T; t++) {
        const [n, target] = lines[idx++].split(" ").map(Number);
        const nums = lines[idx++].split(" ").map(Number);

        const res = twoSum(nums, target);

        // Expect array like [i, j]
        outputs.push(res.join(" "));
    }

    // 3. Print output
    process.stdout.write(outputs.join("\n"));
    process.exit(0);
} catch (err) {
    process.stderr.write(err.stack || err.message);
    process.exit(2);
}
