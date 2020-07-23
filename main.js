const { app, BrowserWindow } = require('electron')
const ejse= require('ejs-electron');
ejse.data({
    pagename:"Harshit",
    pageheader:"Bhardwaj",
    rows:100,
    cols:26
})

function createWindow(){
    try{
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show:false,
        webPreferences:{
          nodeIntegration:true
        }
        // backgroundColor:'#008000'
      })
    
      // and load the index.html of the app.
      win.loadFile('index.ejs').then(function(){
        win.removeMenu();
        win.maximize();
        win.show();
        win.webContents.openDevTools();
      });
    }catch(err)
    {
        console.log(err);
    }
}
app.whenReady().then(createWindow);