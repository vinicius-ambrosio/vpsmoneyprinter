import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true }, 
  // eslint: { ignoreDuringBuilds: true }, // Removido do objeto principal pois não é suportado mais nessa chave diretamente no Next.js 16+
};

export default nextConfig;
