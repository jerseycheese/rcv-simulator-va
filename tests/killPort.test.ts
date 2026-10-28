import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = realpathSync(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const script = path.join(root, "scripts/kill-port.sh");
const hasLsof = spawnSync("sh", ["-c", "command -v lsof"]).status === 0;

// The trailing "next" arg puts "next" in the command line, like a real `next dev`.
async function startListener(cwd: string): Promise<{ proc: ChildProcess; port: number }> {
  const proc = spawn(
    process.execPath,
    ["-e", "const s=require('net').createServer(()=>{}).listen(0,()=>console.log(s.address().port))", "next"],
    { cwd },
  );
  const [chunk] = await once(proc.stdout!, "data");
  return { proc, port: Number(String(chunk).trim()) };
}

async function startClient(port: number): Promise<ChildProcess> {
  const proc = spawn(process.execPath, [
    "-e",
    `require('net').connect(${port},'127.0.0.1',()=>console.log('up'))`,
  ]);
  await once(proc.stdout!, "data");
  return proc;
}

const isAlive = (p: ChildProcess) => p.exitCode === null && p.signalCode === null;

test("reports a listener this checkout didn't start and signals nobody", { skip: !hasLsof }, async () => {
  const server = await startListener(tmpdir());
  const client = await startClient(server.port);
  try {
    const result = spawnSync("bash", [script, String(server.port)], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /didn't start/);
    assert.ok(isAlive(server.proc), "foreign listener must survive");
    assert.ok(isAlive(client), "client must survive");
  } finally {
    server.proc.kill("SIGKILL");
    client.kill("SIGKILL");
  }
});

test("stops this checkout's listener but leaves its clients alone", { skip: !hasLsof }, async () => {
  const server = await startListener(root);
  const client = await startClient(server.port);
  try {
    const exited = once(server.proc, "exit");
    const result = spawnSync("bash", [script, String(server.port)], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    const [, signal] = await exited;
    assert.equal(signal, "SIGTERM");
    assert.equal(client.signalCode, null);
  } finally {
    server.proc.kill("SIGKILL");
    client.kill("SIGKILL");
  }
});
