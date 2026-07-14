import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Permite acessar o servidor de dev via 127.0.0.1 (alem de localhost) sem
  // bloquear recursos de dev (HMR, RSC) por origem cruzada.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
