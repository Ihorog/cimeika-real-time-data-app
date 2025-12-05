import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Keep the workspace root anchored to the frontend folder to avoid mis-resolving module imports
    root: __dirname,
  },
};

export default nextConfig;
