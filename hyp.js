#!/usr/bin/env node
const fs = require('fs')
const cmd = require('commander')
const chalk = require('chalk')
const { parseRank, isKey } = require('./utils');
const { Color } = require('hypixel-api-reborn');
const { Option } = require('commander');
const prompt = require('prompt');
const { Errors } = require('./errors');

cmd
.version(require('./package.json').version)
.description('Quick Hypixel stats & Client initialization.')

cmd
.command('init')
.option('-l, --limit', 'Does not allow the overriding of a new file and automatically cancels adding a file under an existing directory.', false)
.description('Client initialization.')
.action((options, key, file, dir) => {
    process.on('SIGINT', function() {
        console.log(chalk.italic.redBright('Client initialization cancelled ✓'));
        process.exit();
    });
    const schema = {
        properties: {
            dir: {
                description: chalk.whiteBright('Enter a directory'),
                type: 'string',                 
                pattern: /^[a-zA-Z0-9\-]+|SKIP$/,                  
                message: chalk.redBright(Errors.FILE_INVALID), 
                default: chalk.gray('Type SKIP to skip.'),   
                required: true   
                },
            key: {
                description: chalk.whiteBright('Enter your API Key'),
                type: 'string',
                pattern: /^[a-z0-9\-]+$/,
                message: chalk.redBright(Errors.KEY_INVALID),
                require: true,
                hidden: true,
                replace: '*'
                },
            file: {
                description: chalk.whiteBright('Enter a File name'),
                type: 'string',
                pattern: /^[a-zA-Z\-]+$/,
                message: chalk.redBright(Errors.FILE_INVALID),
                require: true
                }
        }                     
    }
    const directoryExists = {
        properties: {
            dircheck: {
                description: chalk.black.bgRed('WARN!')+chalk.redBright(' Another directory exists with this name. Do you wish to use it?'),
                type: 'string',
                pattern: /^y|Y|n|N$/,
                message: chalk.redBright('Answer must be of: (y/Y) or (n/N)'),
                require: true,
                default: chalk.gray('y/n')
            }
        }
    }
    prompt.message = chalk.green('[hypixel-cli]');
    
    prompt.start()
    prompt.get(schema, async function (err, result) {
        if(err) throw err;
        console.log(chalk.italic.yellow('\nInput received.\n'));
        if(!isKey) throw new Error(chalk.red(Errors.KEY_INVALID));
        if(result.dir.length > 240) throw new Error(chalk.red(Errors.FILE_TOO_LONG));
        if(result.file.length > 240) throw new Error(chalk.red(Errors.FILE_TOO_LONG));
        if(result.dir === 'SKIP') {
            dir = '.'
        } else {
            dir = result.dir
        }
        if(dir !== '.' && fs.existsSync('./'+dir)) {
            if(options.limit) throw new Error(chalk.redBright(Errors.DIRECTORY_EXISTS.replace(/{status}/, dir)+'\n[hypixel-cli] This probably occurred as a result of the hard-sweep option.'));
            prompt.message = chalk.red('[hypixel-cli]');
            const { dircheck } = await prompt.get(directoryExists)
            if(dircheck === 'n' || dircheck === 'N') return console.log(chalk.italic.redBright('\nCanceled ✓'))
            if(dircheck === 'y' || dircheck === 'Y') {
                prompt.message = chalk.green('[hypixel-cli]');
                console.log(chalk.italic.green('\nConfirmed ✓\n'))
            }
        }
        prompt.message = chalk.green('[hypixel-cli]');
        let skip = '';
        if(dir === '.') {
            skip = ''
        } else {
            skip = chalk.yellow(`Directory Name: `)+chalk.whiteBright(`${dir}\n`)
        }
        key = result.key
        file = result.file
        const isItCorrect = {
            properties: {
                check: {
                    description: chalk.yellow(`Is this correct?\n\nFile Name: `)+chalk.whiteBright(`${file}.js\n`)+skip+chalk.yellow(`API Key: `)+chalk.whiteBright(`${result.key.slice(0, 8)+result.key.slice(8).replace(/[^-]/g, '*')}`),
                    type: 'string',
                    pattern: /^y|Y|n|N$/,
                    message: chalk.redBright('Answer must be of: (y/Y) or (n/N)'),
                    require: true,
                    default: chalk.gray('y/n')
                }
            }
        }
        prompt.get(isItCorrect, function (err, result) {
            if(err) throw err;
            if(options.limit) return console.log(chalk.italic.redBright(`\nCanceled Automatically (limited): File ${file}.js already exists! ✓`))
            if(result.check === 'n' || result.check === 'N') return console.log(chalk.italic.redBright('\nCanceled ✓'))
            console.log(chalk.italic.greenBright('\nConfirmed ✓'))
            if(dir !== '.') {
            fs.mkdir('./'+dir, (err) => {
                if (err) console.log(chalk.magenta('Adding file under "%s"'), dir)
            });
            }
            let msgdir = dir
            if(msgdir === '.') msgdir = '<directory>'
            const data = `module.exports = (key) => {
    const hypixel = (new (require('hypixel-api-reborn')).Client('${key}', { cache: true }));
    return hypixel;
}
// To use this export in a JS file in this directory (including this file), enter: const hypixel = require('./${file}.js')('${key}')
// Files outside of this directory require pathing when using require(). E.g. require('./${msgdir}/${file}.js')
// After doing this, all properties/methods will be available. See https://hypixel.stavzdev.xyz/#/docs/main/master/class/Client
// for information on how to use these methods.`
            const fileExists = fs.existsSync(file+'.js');
            const fileStatus = {
                properties: {
                    filecheck: {
                        description: chalk.black.bgRed('WARN!')+chalk.redBright(' Another file exists with this name. Do you wish to override it?'),
                        type: 'string',
                        pattern: /^y|Y|n|N$/,
                        message: chalk.redBright('Answer must be of: (y/Y) or (n/N)'),
                        require: true,
                        default: chalk.gray('y/n')
                    }
                }
            }
            if(fileExists) {
                prompt.get(fileStatus, function (err, result) {
                    if (err) throw err;
                    if(result.filecheck === 'n' || result.filecheck === 'N') return console.log(chalk.italic.redBright('\nCanceled ✓'))
                    console.log(chalk.italic.greenBright('\nConfirmed... continuing process. ✓'))
                    fs.writeFile(dir+'/'+file+'.txt', data, err => {
                        if (err) throw new Error(Errors.SOMETHING_WENT_WRONG);
                    })
                    if(dir === '.') {
                        fs.rename(file+'.txt', file+'.js', err => {
                            if (err) throw err;
                        })
                        console.log(chalk.green('Client Initialization complete!'))
                    } else {
                        fs.rename(dir+'/'+file+'.txt', dir+'/'+file+'.js', err => {
                            if (err) throw err;
                        })
                        console.log(chalk.green('Client Initialization complete!'))
                    }
                })
            } else {
                fs.writeFile(dir+'/'+file+'.txt', data, err => {
                    if (err) throw new Error(Errors.SOMETHING_WENT_WRONG);
                })
                if(dir === '.') {
                    fs.rename(file+'.txt', file+'.js', err => {
                        if (err) throw err;
                    })
                    console.log(chalk.green('Client Initialization complete!'))
                } else {
                    fs.rename(dir+'/'+file+'.txt', dir+'/'+file+'.js', err => {
                        if (err) throw err;
                    })
                    console.log(chalk.green('Client Initialization complete!'))
                }
            }
        })
    })
})

cmd
.command('cdir <dir...>')
.description('Creates directories.')
.action((dirs) => {
    dirs.forEach((dir) => {
        if (!fs.existsSync('./'+dir)){
            fs.mkdirSync('./'+dir);
            console.log('Created directory %s', dir)
        } else {
            console.warn(chalk.black.bgRed('WARN!')+chalk.redBright(' Skipping "%s" as it already exists.'), dir)
        }
    })
})

cmd
.command('savekey <key>')
.description('Saves a specified key.')
.action((key) => {
    if(isKey(key)) {
        fs.writeFile('hypAPIkey.txt', key, err => {
            if(err) throw new Error(chalk.redBright(Errors.SOMETHING_WENT_WRONG));
            console.log('Set key:', chalk.yellow(key.slice(0, 8) + key.slice(8).replace(/[^-]/g, '*')))
            console.log(chalk.cyanBright('DO NOT CHANGE THE FILE NAME CONTAINING THE KEY.\nIF YOU DO, THE PLAYER COMMAND WILL NOT WORK.'))
        })
    } else throw new Error(chalk.redBright(Errors.KEY_INVALID))
})

cmd
.command('removekey')
.description('Guess what this does.')
.action(() => {
    const isFileChanged = {
        properties: {
            asknewfile: {
                description: chalk.red('I noticed you changed the file name containing your API key.\nEnter the new file name'),
                type: 'string',
                pattern: /^[a-zA-Z0-9\-]+$/,
                message: chalk.redBright(Errors.FILE_INVALID+'\nAlso, the ends of file names are not needed. Please do not put .js / .txt'),
                required: true,
                ask: function() {
                    if(fs.existsSync(`hypAPIkey.txt`)) return false
                    return true
                }
            }
        }
    }
    prompt.message = chalk.green('[hypixel-cli]');
    prompt.start()
    prompt.get(isFileChanged, function (err, result) {
        if(err) throw err;
        let file = '';
        file = result.asknewfile
        if(result.asknewfile === '') file = 'hypAPIkey'
        fs.unlink(file+'.txt', err => {
            if(err) throw new Error(chalk.redBright(Errors.FILE_NOT_EXISTS.replace(/{status}/, err.path.substr(0, err.path.length - 4))));
            console.log(chalk.yellow('Removed stored key. You can save another key with ') + chalk.whiteBright('hyp savekey <key>'))
        })
    })
})

cmd
.command('player <query>')
.option('-k, --key <key>', 'API Key option if you do not want to save one.')
.option('-g, --guild', 'Sends an extra guild call with the player.', false)
.action((query, options) => {
    fs.readFile('hypAPIkey.txt', 'utf8' , (err, data) => {
        if (err && !options.key) return console.log(chalk.black.bgRed('Error:') + chalk.redBright(' You didn\'t specify a key and didn\'t have one saved!'))
        if (err && options.key) data = options.key
        const hypixel = require('./hypixel')(data)
        console.log(chalk.yellow(`Sending request using ${data.slice(0, 8) + data.slice(8).replace(/[^-]/g, '*')}\n`))
        hypixel.getPlayer(query, { guild: options.guild }).then(player => {
            let profile = '';
            profile += `${parseRank(player.rank, player.nickname, player.plusColor, player.prefixColor)}\n`;
            profile += `Level: ${chalk.hex(new Color('GOLD').toHex())(Math.floor(player.level))}\n`;
            profile += `Achievement Points: ${chalk.hex(new Color('YELLOW').toHex())(player.achievementPoints.toLocaleString('en-US'))}\n`;
            if(player.guild) profile += `Guild: ${chalk.hex(new Color(player.guild.tagColor.toCode()).toHex())(`${player.guild.name} ${player.guild.tag ? `[${player.guild.tag}]` : ''}`)}\n`;
            console.log(profile)
            process.exit(0)
        }).catch(e => {
            console.log(chalk.redBright(e));
            process.exit(0);
        })
    })
})

cmd.parse(process.argv)