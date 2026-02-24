import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendProcess = null;
const desktopPort = Number(process.env.DESKTOP_PORT || 3789);

function getServerScriptPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "app.asar", "server.js");
  }
  return path.join(__dirname, "..", "server.js");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/health`);
      if (res.ok) return true;
    } catch {
      // retry
    }
    await wait(350);
  }
  return false;
}

function startEmbeddedBackend() {
  const serverScript = getServerScriptPath();
  backendProcess = spawn(process.execPath, [serverScript], {
    env: {
      ...process.env,
      PORT: String(desktopPort),
      ELECTRON_RUN_AS_NODE: "1"
    },
    stdio: "ignore",
    windowsHide: true
  });
}

function stopEmbeddedBackend() {
  if (!backendProcess) return;
  try {
    backendProcess.kill();
  } catch {
    // ignore
  }
  backendProcess = null;
}

async function createWindow() {
  const appIconPath = path.join(__dirname, "..", "public", "Salon_AI_IMG.png");
  const win = new BrowserWindow({
    width: 1400,
    height: 920,
    minWidth: 1100,
    minHeight: 740,
    backgroundColor: "#05070d",
    autoHideMenuBar: true,
    icon: appIconPath,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devStartUrl = process.env.ELECTRON_START_URL || "http://localhost:3000";
  const appUrl = app.isPackaged ? `http://localhost:${desktopPort}` : devStartUrl;

  if (app.isPackaged) {
    startEmbeddedBackend();
    const ready = await waitForServer(appUrl);
    if (!ready) {
      await win.loadURL("data:text/html,<h1>Server failed to start</h1><p>Please restart the app.</p>");
      return;
    }
  }

  await win.loadURL(appUrl);
}

app.whenReady().then(async () => {
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow();
  });
});

app.on("window-all-closed", () => {
  stopEmbeddedBackend();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  stopEmbeddedBackend();
});
