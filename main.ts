// import * as readline from 'readline';
import {appendFile, existsSync, writeFile, truncate} from 'fs'
import {readFile,mkdir} from "fs/promises"
import {EOL} from 'os'

function fetchAndParseAd(jobId:number) {
    fetch(`https://www.jobbnorge.no/ledige-stillinger/joblisting/pdf/${jobId}?format=html`)
        .then(res => res.text())
        .then(data => {
            let cleanText = data.replace(/<\/?[^>]+(>|$)/g, "");
            cleanText = `${jobId.toString()} ${cleanText.replace(/[\s]{2,}/g, " ").trim()}${EOL}`;
            appendFile('./out/advertisements.txt', cleanText, { encoding:'utf-8' }, err => {});
            // recursiveAsyncReadLine();
    });
}

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// var recursiveAsyncReadLine = function () {
//     rl.question('StillingsId : ', function (jobIdStr) {
//         const jobId = parseInt(jobIdStr);
//         if(isNaN(jobId)){
//             console.warn(`"${jobIdStr}" is not a number`);
//             return recursiveAsyncReadLine();
//         }
//         fetchAndParseAd(jobId);
//     });
// };

async function fetchJobIds():Promise<void> {
    return new Promise((res, rej) => {
        if(existsSync("./out/jobIds.txt")){
            console.info("Using cached job ids");
            res();
        }
        else{
            var foo = mkdir("./out");
            fetch("https://publicapi.jobbnorge.no/v1/jobs?language=1")
                .then(res => res.json())
                .then(async data => {
                    const init:number[] = [];
                    const jobIds =  data.reduce((acc, currVal) => {acc.push(currVal.id); return acc;}, init);
                    await foo;
                    writeFile('./out/jobIds.txt', jobIds.join(", "), {}, () => {res()});
                })
        }
    })
}

// recursiveAsyncReadLine();

async function main() {
    await fetchJobIds();
    const data = await readFile('./out/jobIds.txt');
    const jobIds = data.toString().split(',');

    truncate('./out/advertisements.txt', err => {});

    for (let i = 0; i < jobIds.length; i++) {
        const jobId = parseInt(jobIds[i]);
        if(isNaN(jobId)){
            console.warn(`"${jobIds[i]}" is not a number`);
            continue;
        }
        console.info(`Fetch ad for jobId ${jobId}`);
        fetchAndParseAd(jobId);
    }
}

main();