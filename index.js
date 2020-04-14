const fs = require('fs-extra');
const program = require('commander');
const childProcess = require('child_process');
const util = require('util');
const exec = util.promisify(childProcess.exec);

module.exports = () => {
  program
    .usage('<app_name> [options]')
    .option('-a, --author <author>', 'add author')
    .option('-m, --minimum', 'create minimum app')
    .version(require(`${__dirname}/package.json`).version, '-v, --version')
    .parse(process.argv);

  const currentDir = process.cwd();
  const name = program.args[0];

  let appDir = currentDir;
  if(name) appDir = `${currentDir}/${name}`;
  const appName = appDir.split('/').slice(-1)[0];

  console.log(`Creating ${appName}\n`);
  Promise.resolve()
    .then(() => fs.mkdirs(appDir))
    .then(() => {
      if(program.minimum) return fs.copy(`${__dirname}/minimum`, appDir);
      return fs.copy(`${__dirname}/custom`, appDir);
    })
    .then(() => {
      let packageData = require(`${appDir}/package.json`);
      packageData.name = appName;
      if(program.author) packageData.author = program.author;
      return fs.writeFile(`${appDir}/package.json`, JSON.stringify(packageData, null, '  '));
    })
    .then(() => {
      console.log('Installing packages...');
      return exec(`cd ${appDir} && npm install`);
    })
    .then(() => {
      console.log('Installed successfully!\n');
      console.log('Building...');
      return exec(`cd ${appDir} && npm run build`);
    })
    .then(() => {
      console.log('Builded successfully!\n');
      console.log('\nRun commands\n');
      if(name) console.log(`cd ${name}/`);
      console.log('npm init\nnpm start\n');
    })
    .catch(err => {
      console.log('Fail!');
      console.error(err);
    });
}

