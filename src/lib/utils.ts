import { spawn } from "child_process";

// export const codeOutput = (code: string) => {
//     let exitCode: number | null = 0;
//     const docker = spawn("docker", [
//         "run",
//         "--rm",
//         "-i",
//         "--cpus=0.5",
//         "--memory=128m",
//         "--network=none",
//         "js-runner",
//     ]);

//     docker.stdin.write(code);
//     docker.stdin.end();

//     docker.stdout.on("data", (d) => {
//         console.log("STDOUT : ", d.toString());
//     });

//     docker.stderr.on("data", (d) => {
//         console.log("STDERR : ", d.toString());
//     });

//     docker.on("close", (d) => {
//         console.log("EXIT CODE : ", d);
//         exitCode = d;
//     });
//     return exitCode;
// };

export const codeResult = (
    code: string,
): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
}> => {
    return new Promise((resolve, reject) => {
        let stdout = "";
        let stderr = "";

        const docker = spawn("docker", [
            "run",
            "--rm",
            "-i",
            "--cpus=0.5",
            "--memory=128m",
            "--network=none",
            "js-runner",
        ]);

        docker.stdin.write(code);
        docker.stdin.end();

        docker.stdout.on("data", (d) => {
            stdout += d.toString();
        });

        docker.stderr.on("data", (d) => {
            stderr += d.toString();
        });

        docker.on("error", reject);
        docker.on("close", (exitCode) => {
            resolve({
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                exitCode: exitCode ?? -1,
            });
        });
    });
};
