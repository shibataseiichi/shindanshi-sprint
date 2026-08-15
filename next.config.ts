import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const isUserSite = repositoryName.endsWith(".github.io");
const basePath = isGitHubPages && repositoryName && !isUserSite ? `/${repositoryName}` : "";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: `${basePath}/`,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default withPWA(nextConfig);
