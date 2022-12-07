var readline = require('readline');
var fs = require('fs');

var myInterface = readline.createInterface({
  input: fs.createReadStream('input.txt')
});

const dirs = {};
let currentFolder = '';

myInterface.on('line', function (line) {
  const split = line.split(' ');

  if (split[0][0] === '$') {
    if (split[1][0] === 'c') {
      const split = line.split(' ');
      if (split[2][0] === '.') {
        currentFolder = currentFolder.substring(0,
          currentFolder.lastIndexOf('/', currentFolder.length-2)
        ) + '/';
      } else {
        if (split[2] === '/') {
          currentFolder = split[2];
        } else {
          currentFolder += split[2] + '/';
        }
      }
      console.log(currentFolder)
    }
  } else {
    if (split[0][0] <= '9' && split[0][0] >= '0') {
      if (currentFolder in dirs) {
        dirs[currentFolder][split[1]] = split[0];
      } else {
        dirs[currentFolder] = {};
        dirs[currentFolder][split[1]] = split[0];
      }
    } else if (split[0][0] === 'd') {
      if (currentFolder in dirs) {
        dirs[currentFolder][split[1]] = split[0];
      } else {
        dirs[currentFolder] = {};
        dirs[currentFolder][split[1]] = split[0];
      }
    }
  }
}).on('close', () => {
  let grandTotal = 0;
  for (const dir of Object.keys(dirs)) {
    let sum = getTotalSize(dirs, dir);
    
    if (sum < 100000) {
      grandTotal += sum;
    }
  }

  console.log(grandTotal);
});


const getTotalSize = (dirs, key) => {
  let sum = 0;
  for (const files of Object.entries(dirs[key])) {
    const [name, size] = files;
    if (size[0] <= '9' && size[0] >= '0') {
      const val = parseInt(size);
      sum += val;
    } else {
      sum += getTotalSize(dirs, key + name + '/');
    }
  }
  return sum;
}
