import {
  Client,
  Account,
  Databases,
  Storage,
  ID,
  Query,
  Permission,
  Role,
} from "appwrite";

const endpoint =
  import.meta.env.VITE_APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || "";

if (!projectId) {
  console.error(
    "[Appwrite] VITE_APPWRITE_PROJECT_ID is not set. " +
      "Please configure it in your .env file. " +
      "Current endpoint:",
    endpoint,
  );
} else {
  console.log(
    "[Appwrite] Client initialized – endpoint:",
    endpoint,
    "| project:",
    projectId,
  );
}

const client = new Client().setEndpoint(endpoint).setProject(projectId);

// Quick connectivity check – runs once on load to help diagnose "Failed to fetch" issues
if (typeof window !== "undefined" && projectId) {
  fetch(`${endpoint}/health`, {
    method: "GET",
    headers: { "X-Appwrite-Project": projectId },
  })
    .then((res) => {
      if (res.ok) {
        console.log("[Appwrite] ✅ Server reachable – health check passed");
      } else {
        console.warn(
          `[Appwrite] ⚠️ Server responded with status ${res.status}. ` +
            "The project ID or endpoint may be misconfigured.",
        );
      }
    })
    .catch((err) => {
      console.error(
        "[Appwrite] ❌ Cannot reach server at",
        endpoint,
        "\n" + "Error:",
        err.message,
        "\n" +
          "Possible causes:\n" +
          "  1. CORS: Add your frontend origin (e.g. http://localhost:5173) to the Appwrite project's allowed platforms.\n" +
          "  2. The endpoint URL is incorrect.\n" +
          "  3. The Appwrite server is down.\n" +
          "  4. A firewall or proxy is blocking the request.",
      );
    });
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { ID, Query, Permission, Role };
export default client;
