import { spawn } from "child_process";

export const codeOutput = (code: string) => {
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
        console.log("STDOUT : ", d.toString());
    });

    docker.stderr.on("data", (d) => {
        console.log("STDERR : ", d.toString());
    });

    docker.on("close", (d) => {
        console.log("EXIT CODE : ", d);
    });
};
