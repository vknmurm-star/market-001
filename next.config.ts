import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // nodemailer использует динамические require — держим его вне бандла
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
