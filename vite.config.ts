import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { mergeAndRebuildData } from "./scripts/update-local-data.js";

// Custom Vite plugin to handle local data updates
function earthquakeUpdaterPlugin(): Plugin {
	return {
		name: "earthquake-updater",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				if (req.url === "/api/update-data" && req.method === "POST") {
					res.setHeader("Content-Type", "application/json");

					mergeAndRebuildData()
						.then((result) => {
							res.statusCode = 200;
							res.end(JSON.stringify({ success: true, ...result }));
						})
						.catch((err) => {
							console.error("[Updater] Error:", err);
							res.statusCode = 500;
							res.end(JSON.stringify({ success: false, error: err.message }));
						});
					return;
				}
				next();
			});
		},
	};
}

export default defineConfig({
	plugins: [react(), earthquakeUpdaterPlugin()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	server: {
		host: true, // Listen on all local IPs
		port: 7825, // Note: 78253 is > 65535, so we use 7825
	},
});
