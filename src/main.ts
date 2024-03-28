import {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  Notification,
  powerMonitor,
} from "electron";
import path from "path";
import ActiveWindow from "@paymoapp/active-window";
import moment from "moment";
import { uIOhook } from "uiohook-napi";

let activeTime = 0;
let monitoringStarted = false;
let interval: number | NodeJS.Timeout;
let lockInterval: number | NodeJS.Timeout;
let keypressCount = 0;
let mouseClicks = 0;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  uIOhook.on("keydown", (e) => {
    keypressCount++;
  });
  uIOhook.on("click", (e) => {
    mouseClicks++;
  });
  uIOhook.start();

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
  // taking screenshot
  ipcMain.on("take-screenshot", () => {
    const time = moment().format("MMMM Do YYYY, h:mm:ss a");
    desktopCapturer
      .getSources({
        types: ["screen"],
        thumbnailSize: { width: 300, height: 200 },
      })
      .then((sources) => {
        const dataURL = sources[0].thumbnail.toDataURL();
        // ActiveWindow.initialize();

        // if (!ActiveWindow.requestPermissions()) {
        //   console.log(
        //     "Error: You need to grant screen recording permission in System Preferences > Security & Privacy > Privacy > Screen Recording"
        //   );
        //   process.exit(0);
        // }

        // const activeWin = ActiveWindow.getActiveWindow();
        mainWindow.webContents.send("screenshot-data", {
          time: time,
          dataURL: dataURL,
          // activeWin: activeWin.title,
          keypressCount: keypressCount,
          mouseClicks: mouseClicks,
        });
        keypressCount = 0;
        mouseClicks = 0;
      });
    new Notification({
      title: "Screenshot",
      body: "Screenshot taken sucessfully",
    }).show();
  });

  ipcMain.on("request-active-time", (event) => {
    event.sender.send("active-time", activeTime);
  }); // Variable to track the time of the last system resume event

  ipcMain.on("start-monitoring", () => {
    if (!monitoringStarted) {
      interval = setInterval(() => {
        activeTime++;

        mainWindow.webContents.send("active-time", activeTime);
      }, 1000);
      monitoringStarted = true;
    }
  });
  powerMonitor.on("suspend", () => {
    if (monitoringStarted) {
      if (interval) clearInterval(interval);
      if (lockInterval) {
        clearInterval(lockInterval);
      } // Correct way to clear the interval
    }
  });
  powerMonitor.on("lock-screen", () => {
    if (monitoringStarted) {
      if (interval) clearInterval(interval);
      // Correct way to clear the interval
      if (lockInterval) {
        clearInterval(lockInterval);
      }
    }
  });

  powerMonitor.on("unlock-screen", () => {
    if (monitoringStarted) {
      lockInterval = setInterval(() => {
        activeTime++;
        mainWindow.webContents.send("active-time", activeTime);
      }, 1000);
    }
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
