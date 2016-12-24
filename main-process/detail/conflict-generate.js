const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
const storage = require('electron-json-storage')
const XLSX = require('xlsx')
var fs = require('fs')


function write_excel(dir, sheetNames, headers, data) {
    _headers = {};
    for (let i = 0; i < headers.length; i++) {
        let addr = XLSX.utils.encode_cell({r: 0, c: i});
        let obj = {v: headers[i]};
        _headers[addr] = obj;
    }
    let Sheets = {}; 
    let _data = {};
    for (let index = 0; index < sheetNames.length; index ++) {
        let sheetName = sheetNames[index];
        _data[sheetName] = {};
        for (let i = 0; i < data[sheetName].length; i++) {
            for (let j = 0; j < headers.length; j++) {
                let addr = XLSX.utils.encode_cell({r: i + 1, c: j});
                let obj = {v: data[sheetName][i][headers[j]]};
                _data[sheetName][addr] = obj;
            }
        }
        // 合并 headers 和 data
        var output = Object.assign({}, _headers, _data[sheetName]);
        // 获取所有单元格的位置
        var outputPos = Object.keys(output);
        // 计算出范围
        var ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];
        Sheets[sheetName] = Object.assign({}, output, { '!ref': ref });
    }      

    // 构建 workbook 对象
    var wb = {
        SheetNames: sheetNames,
        Sheets: Sheets
    };
    // 导出 Excel
    XLSX.writeFile(wb, dir + '/生成设班大表（含冲突名单）.xlsx');
}

function calc_conflict(sheet) {
    let teacher_list = new Set();
    for (let i = 0; i < sheet.length; i++) {
        if (sheet[i]['老师'] != '' && !sheet[i]['老师'].includes('待定')) {
            teacher_list.add(sheet[i]['老师']);
        }
    }
    let times = ['9:30-11:30', '12:30-14:30', '15:30-17:30', '18:30-20:30'];
    let result = [];
    for (let name of teacher_list.values()) {
        for (let time of times) {
            let arr = [];
            for (let i = 0; i < sheet.length; i++)
                if (sheet[i]['老师'] == name && sheet[i]['上课时间'] == time) {
                    arr.push(sheet[i]);
                }
            if (arr.length > 1) {
                for (let item of arr)
                    result.push(item);
            }
        }
    }
    //console.log('result=', result);
    return result;
}

function generate_conflict(dir) {
    storage.get('grid-data', function(err, workbook) {
        if (err) console.log('query class: class-data is missed!');
        else {
            let sheet_name_list = workbook.SheetNames;
            let grids_list = [];
            for (let i = 0; i < sheet_name_list.length; i++) {
                if (sheet_name_list[i].endsWith('期')) {
                    grids_list.push(sheet_name_list[i]);
                    grids_list.push(sheet_name_list[i] + "_冲突表");
                }
            }
            let result = {};
            let times = ['9:30-11:30', '12:30-14:30', '15:30-17:30', '18:30-20:30'];
            for (let i = 0; i < grids_list.length; i++) {
                if (!grids_list[i].endsWith('期')) continue;
                let worksheet = workbook.Sheets[grids_list[i]];
                let merge_list = worksheet['!merges'];
                result[grids_list[i]] = [];
                for (let j = 0; j < merge_list.length; j++) {
                    let range = merge_list[j];
                    let base_loc = worksheet[XLSX.utils.encode_cell({r: range.s.r, c: range.s.c})].v;
                    for (let k = range.s.c; k <= range.e.c; k++) {
                        let row = range.s.r;
                        for (let t = 0; t < 4; t++) {
                            if (worksheet[XLSX.utils.encode_cell({r: row + 2 * t + 3, c: k})] == null
                             && worksheet[XLSX.utils.encode_cell({r: row + 2 * t + 4, c: k})] == null) continue;
                            let tmp = {
                                "班级编码": "",
                                "班级名称": worksheet[XLSX.utils.encode_cell({r: row + 2 * t + 3, c: k})] ? worksheet[XLSX.utils.encode_cell({r: row + 2 * t + 3, c: k})].v : "",
                                "老师": worksheet[XLSX.utils.encode_cell({r: row + 2 * t + 4, c: k})] ? worksheet[XLSX.utils.encode_cell({r: row + 2 * t + 4, c: k})].v : "",
                                "上课地点": base_loc + " " + (worksheet[XLSX.utils.encode_cell({r: row + 1, c: k})] ? worksheet[XLSX.utils.encode_cell({r: row + 1, c: k})].v : "") + "教室",
                                "教室座位数": worksheet[XLSX.utils.encode_cell({r: row + 2, c: k})] ? worksheet[XLSX.utils.encode_cell({r: row + 2, c: k})].v : "",
                                "上课时间": times[t],
                                "正常人数": "",
                                "最大人数": worksheet[XLSX.utils.encode_cell({r: row + 2, c: k})] ? worksheet[XLSX.utils.encode_cell({r: row + 2, c: k})].v : "",
                                "开课日期": "",
                                "结课日期": "",
                                "班级类型(教务填写)": "",
                                "报到日期": "",
                                "报到情况": "开课当天凭听课证领取教材，课程中包含家长会",
                                "课次": "18",
                                "总课时": "22.5",
                                "学费": "1920",
                                "备注": ""
                            }
                            result[grids_list[i]].push(tmp);
                        }
                    }
                }
                result[grids_list[i] + '_冲突表'] = calc_conflict(result[grids_list[i]]);
            }
            let headers = ["班级编码", "班级名称", "老师", "上课地点", "教室座位数", "上课时间", "正常人数", "最大人数", "开课日期",
                            "结课日期", "班级类型(教务填写)", "报到日期", "报到情况", "课次", "总课时", "学费", "备注"];
                    
            write_excel(dir, grids_list, headers, result);
            dialog.showMessageBox({
                type: 'info',
                buttons: ['知道了'],
                title: '保存成功',
                message: '转化好的设班大表（包含冲突表）已经输出到指定目录下。',
                cancelId: 0,
            });
        }
    });
}


ipc.on('open-conflict-generate-dialog', function (event) {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }, function (files) {
        if (files) event.sender.send('selected-conflict-generate-directory', files);
        else return;
        var dir = files[0];
        generate_conflict(dir);
    })
})
