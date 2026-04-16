import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Read Supabase env vars from multiple possible names (Vercel Supabase integration
// exposes them without the VITE_ prefix, which Vite otherwise doesn't inject).
const supabaseUrl =
  process.env.VITE_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  "";

const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  "";

const sentryDsn = process.env.VITE_SENTRY_DSN ?? "";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabaseAnonKey),
    "import.meta.env.VITE_SENTRY_DSN": JSON.stringify(sentryDsn),
  },
}));
