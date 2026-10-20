import { execFileSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
function buildReference() {
 const ciRef=process.env.GITHUB_SHA;
 if(ciRef && /^[a-f0-9]{40}$/i.test(ciRef))return ciRef;
 try {
  const ref=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  const dirty=execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim();
  return /^[a-f0-9]{40}$/i.test(ref)?ref+(dirty?'-dirty':''):'development';
 }catch{return 'development';}
}
export default defineConfig(() => ({
  define: { "import.meta.env.PG_BUILD": JSON.stringify(buildReference()) },
  plugins: [react(), tailwind()],
  base: process.env.GITHUB_ACTIONS ? "/PG-Arcade/" : "/",
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
}));
