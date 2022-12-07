var readline = require('readline');
var fs = require('fs');

var myInterface = readline.createInterface({
  input: fs.createReadStream('input.txt')
});

const dirs = {};
let min = Number.MAX_VALUE;
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
  const keys = Object.keys(dirs);
  for (let i = keys.length - 1; i >= 0; i--) {
    const dir = keys[i]
    let sum = getTotalSize(dir);
    console.log(dir + ': ' + sum);
    dirs[dir]['size'] = sum;
  }

  const min = getMin();

  console.log('min: ' + min);
  save('outputAll.json', dirs);
  assignToParent(dirs['/'], '/');
  save('output.json', dirs);

});

const getMin = () => {
  let min = Number.MAX_VALUE;
  const keys = Object.keys(dirs);
  const neededSpace = 30000000 - (70000000 - dirs['/'].size);

  for (let i = keys.length - 1; i >= 0; i--) {
    const sum = dirs[keys[i]].size;

    if (sum >= neededSpace && sum < min) {
      min = sum;
    }
  }
  return min;
}

const assignToParent = (parent, path) => {
  for (const key of Object.keys(parent)) {
    if (parent[key] === 'dir') {
      parent[key] = {};
      Object.assign(parent[key], {...dirs[path + key + '/']});
      if (Object.values(parent[key]).some(val => val === 'dir')) {
        assignToParent(parent[key], path + key + '/');
      }
      delete dirs[path + key + '/'];
    }
  }
}

const getTotalSize = (key) => {
  let sum = 0;
  for (const files of Object.entries(dirs[key])) {
    const [name, size] = files;
    if (size[0] <= '9' && size[0] >= '0') {
      const val = parseInt(size);
      sum += val;
    } else {
      sum += dirs[key + name + '/'].size
    }
  }
  return sum;
}

const save = (filename, obj) => {
  fs.writeFile(filename, JSON.stringify(obj), 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("JSON file" + filename + " has been saved.");
  });
}
