import * as filesystem from 'fs-extra';

import * as fs from 'fs';
import * as path from 'path';

export class Files {

    public manifest = '../fxmanifest.lua';

    public fetched: string[] = [];

    public onInit = (): void => {
        const fetchDir = function (dir: any) {
            let results: any = [];
            let files = fs.readdirSync(dir);
            files.forEach(function (file) {
                file = path.resolve(dir, file);
                let stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    let subdir = fetchDir(file);
                    results = results.concat(subdir);
                } else {
                    results.push(file);
                }
            });
            return results;
        };
        const fetchFiles = function (dir: any, files: any, done: any) {
            let pending = files.length;
            let results: any = [];
            for (var index in files) {
                let file = path.resolve(dir, files[index]);
                let stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    let subdir = fetchDir(file);
                    results = results.concat(subdir);
                } else {
                    results.push(file);
                }
            }
            done(null, results);
        };

        filesystem.exists(`${this.manifest}`, (exists) => {
            if (exists) {
                filesystem.remove("../FXCompressor.lua", () => console.log("File deleted successfully, Start generate process."));
                let response = fs.readFileSync(this.manifest, 'utf8');
                let explode = response.toString().match(/("([^"]|"")*")/g)
                explode.forEach((item) => {
                    if (!item.includes('*')) {
                        let path = item.replace('"', '').replace('"', '');
                        let contents = fs.readFileSync('../' + path, 'utf8')
                        filesystem.appendFileSync("../RageM.lua", contents, 'utf8');
                        console.log('Fetched file : ' + path)
                    } else {
                        let path = item.replace('"', '').replace('"', '').replace('*.lua', '');
                            this.fetched.push(path);
                    }
                })

                console.log('What is ::' + this.fetched)
                fetchFiles('../', this.fetched, function (err: any, results: any) {
                    if (err) throw err;
                    console.log(results)
                    results.forEach(function (x: any) {
                        let contents = fs.readFileSync(x, 'utf8')
                        filesystem.appendFileSync("../FXCompressor.lua", contents, 'utf8');
                        console.log('Inserting in shared file ' + x)
                    });
                });
            } else {
                console.error(`Failed to find manifest ${this.manifest}`)
            }
        });

        console.log("Jobs Done, Now shared file is generate ../RageM.lua")
    };

}

new Files().onInit();
