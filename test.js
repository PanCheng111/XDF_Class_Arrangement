
const XLSX = require('xlsx')

var workbook = XLSX.readFile('173暑假班小格汇总1114.xlsx');
var sheet_name_list = workbook.SheetNames;
sheet_name_list.forEach(function(sheetName) { /* iterate through sheets */
    if (!sheetName.endsWith('期')) return;
    var worksheet = workbook.Sheets[sheetName];
    console.log(sheetName, "===>\n");// XLSX.utils.sheet_to_json(worksheet, {raw: true}));
    let merge_list = worksheet['!merges'];
    //console.log('merge_list=', merge_list);
    // Object.keys(worksheet).forEach(function(key) {
    //     if (key.startsWith('!')) return;
    //     console.log('key = ', key, ' value = ', worksheet[key].v);
    // })
    merge_list.forEach(function(element) {
        console.log('cell range = ', element);
        let addr = {c: element.s.c, r: element.s.r};
        console.log('value = ', worksheet[XLSX.utils.encode_cell(addr)].v);
    });
});

