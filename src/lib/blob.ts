import "server-only";
import { Bucket } from "@upstash/blob";

export const bucket = Bucket.fromEnv();
