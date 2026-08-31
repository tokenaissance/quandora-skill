#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");

const { createCallbackServer } = require(
  path.join(
    __dirname,
    "..",
    "plugins",
    "quandora",
    "scripts",
    "workbuddy-cn-oauth-macos.js",
  ),
);

async function main() {
  const listener = createCallbackServer();
  const redirectUrl = await listener.listen();
  try {
    const responsePromise = new Promise((resolve, reject) => {
      const callbackUrl = new URL(redirectUrl);
      callbackUrl.searchParams.set("code", "test-code");
      callbackUrl.searchParams.set("state", "test-state");
      const request = http.get(
        callbackUrl,
        { headers: { Connection: "keep-alive" } },
        (response) => {
          let body = "";
          response.setEncoding("utf8");
          response.on("data", (chunk) => {
            body += chunk;
          });
          response.on("end", () => resolve({ response, body }));
        },
      );
      request.on("error", reject);
    });

    const callbackUrl = await listener.callback;
    assert.equal(callbackUrl.searchParams.get("code"), "test-code");
    assert.equal(callbackUrl.searchParams.get("state"), "test-state");
    listener.respond(true);

    const { response, body } = await responsePromise;
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers.connection, "close");
    assert.match(body, /authorization completed/);
  } finally {
    listener.close();
  }

  process.stdout.write(
    `${JSON.stringify({ status: "ok", callbackConnection: "closed" })}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
