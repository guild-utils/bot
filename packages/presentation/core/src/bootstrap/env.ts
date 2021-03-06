import { readFileSync } from "fs";

const GUJ_LAUNCH_CHANNEL_RAW = process.env["GUJ_LAUNCH_CHANNEL"];
if (!GUJ_LAUNCH_CHANNEL_RAW) {
  throw new TypeError("Must provide GUJ_LAUNCH_CHANNEL");
}
export const GUJ_LAUNCH_CHANNEL = GUJ_LAUNCH_CHANNEL_RAW;
export const GUJ_GRACEFUL_SHUTDOWN_TIME = process.env[
  "GUJ_GRACEFUL_SHUTDOWN_TIME"
]
  ? Number(process.env["GUJ_GRACEFUL_SHUTDOWN_TIME"])
  : 20;
export const KUBE_NODE_NAME = process.env["KUBE_NODE_NAME"];
export const KUBE_POD_NAME = process.env["KUBE_POD_NAME"];
export const BUILD_DATE = readFileSync("/build-date", "utf-8");
