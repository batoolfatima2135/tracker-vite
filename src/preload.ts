// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { IpcRendererEvent, contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("ipc", {
  captureScreenshot: () => ipcRenderer.send("take-screenshot"),
  getScreenshot: (callback: (event: IpcRendererEvent, data: string) => void) =>
    ipcRenderer.on("screenshot-data", callback),
  removeListener: () => ipcRenderer.removeAllListeners("screenshot-data"),
  startMonitoring: () => ipcRenderer.send("start-monitoring"),
  getActiveTime: (callback: () => void) =>
    ipcRenderer.on("active-time", callback),
});
