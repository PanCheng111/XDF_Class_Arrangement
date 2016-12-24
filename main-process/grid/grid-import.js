const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
const storage = require('electron-json-storage')
const XLSX = require('xlsx')

ipc.on('open-grid-import-dialog', function (event) {
  dialog.showOpenDialog({
    properties: ['openFile']
  }, function (files) {
    if (files) event.sender.send('selected-grid-import-directory', files);
    else return;
    var workbook = XLSX.readFile(files[0]);
    var sheet_name_list = workbook.SheetNames;
    grids_list = [];
    for (let i = 0; i < sheet_name_list.length; i++) {
        if (sheet_name_list[i].endsWith('期')) grids_list.push(sheet_name_list[i]);
    }
    storage.set('grid-data', workbook, function(err) {
        if (err) console.log('can\'t save grid_data');
        else event.sender.send('display-grid-import-directory', grids_list);
    });
  })
})
