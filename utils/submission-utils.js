const fs = require('fs');
const childProcess = require('child_process');
const async = require('async');
const treeKill = require('tree-kill');

const DB_problems = require(process.env.ROOT + '/DB-codes/DB-problem-api');

async function submit(author, contestId, probNum, langId, code){
    let problem = await DB_problems.getProblem(contestId, probNum);
    let fileName = Date.now();
    let ext = getExtension(langId);
    let fullFileName = process.env.ROOT + '/problem-data/submissions/' + fileName + '.' + ext;
    fs.writeFileSync(fullFileName, code);
    let size = fs.statSync(fullFileName).size;

    let sbmssnId = await DB_problems.createSubmission(problem[0].ID, author, langId, size, fileName + '.' + ext);
    if(size > problem[0].SL){
        updateSubmissionResult(sbmssnId, 'SLE');
    }
    else{
        let tests = await DB_problems.getMainTests(problem[0].CONTEST_ID, problem[0].PROB_NUM);
        runOnTests(sbmssnId, problem[0], langId, fileName, ext, tests);
    }
}   

function getExtension(langId){
    if(langId == '1'){
        return 'cpp';
    }
    else if(langId == '2'){
        return 'java';
    }
}

function runOnTests(sbmssnId, problem, langId, fileName, ext, tests){
    let commands = getCommands(langId, fileName, ext);
    let compile = childProcess.spawn(commands[0].replace(/\//g, '\\'), {shell : true});
    compile.stderr.on('data', (data) =>{
        ;//console.log(data.toString());
    })
    compile.on('error', (error) =>{
        ;//console.log(error.message);
    })
    compile.on('close', (data) =>{
        if(data !== 0){
            updateSubmissionResult(sbmssnId, 'CE');
        }
        else{
            let testNum = 0;
            let result = 'AC';
            let runTest = function(cb){
                if(result != 'AC'){
                    cb(null, null);
                    return;
                }
                let runCommand = commands[1].replace('{input}', tests[testNum].INPUT_URL).replace('{output}', tests[testNum].OUTPUT_URL);
                //console.log(runCommand.replace(/\//g, '\\'));
                let time1 = Date.now();
                let run = childProcess.spawn(runCommand.replace(/\//g, '\\'), {shell : true});

                let timeout = setTimeout(() =>{
                    result = 'TLE';
                    treeKill(run.pid);
                }, problem.TL);

                run.stdout.on('data', data =>{
                    result = data.toString();
                    result = result.substring(0, result.length-2);
                });

                run.on('error', (error) =>{
                    result = 'JE';
                });

                run.on('close', (data) =>{
                    let time2 = Date.now();
                    let time = time2-time1;
                    if(result != 'TLE'){
                        clearTimeout(timeout);
                    }
                    else{
                        time = problem.TL;
                    }
                    testNum++;
                    cb(null, {result : result, time : time, memory : 1});
                });
            }

            let tasks = [];
            for(let i = 0; i<tests.length; i++){
                tasks.push(runTest);
            }

            async.series(tasks, async (err, results) =>{
                if(err){
                    console.log(err.message);
                }
                await fs.unlinkSync(process.env.ROOT + '/problem-data/environment/' + fileName + '.exe');
                await fs.unlinkSync(process.env.ROOT + '/problem-data/environment/' + fileName + '.out');
                await DB_problems.updateTestResults(sbmssnId, results);
                await updateSubmissionResult(sbmssnId, result);
            })
        }
    })
}

function getCommands(langId, fileName, ext){
    let commands = [];
    if(langId ==  '1'){
        commands.push(`cd ${process.env.ROOT + '/problem-data/environment'} && g++.exe -O2 -std=c++14 -o ${fileName}.exe ${process.env.ROOT + '/problem-data/submissions/' + fileName + '.' + ext}`);
        commands.push(`(${process.env.ROOT + '/problem-data/environment/' + fileName}.exe < ${process.env.ROOT + '/problem-data/tests/'}{input} > ${process.env.ROOT + '/problem-data/environment/' + fileName}.out && ( fc ${process.env.ROOT + '/problem-data/environment/' + fileName}.out ${process.env.ROOT + '/problem-data/tests/'}{output} > ${process.env.ROOT + '/problem-data/environment/'}log.txt || echo WA)) || echo RTE`);
        //console.log(commands);
    }
    return commands;
}

// TODO take care of cleanup
async function updateSubmissionResult(sbmssnId, result){
    await DB_problems.updateSubmissionResult(sbmssnId, result);
}

module.exports = {
    submit
};