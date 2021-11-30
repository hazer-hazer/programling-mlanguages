const fs = require('fs')
const path = require('path')

let inputFile = null
let outputFile = null
let outputExt = null
let force = null
let pls = []

const argv = process.argv.slice(2)
for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-i') {
        inputFile = argv[++i]
    } else if (a === '-o') {
        outputFile = argv[++i]
    } else if (a === '-e') {
        outputExt = argv[++i]
        if (!outputExt.startsWith('.')) {
            outputExt = `.${outputExt}`
        }
    } else if (a === '-f') {
        force = true
    } else if (a.startsWith('-')) {
        throw new Error(`Unknown argument ${a}`)
    } else {
        pls.push(a)
    }
}

if (pls.length && inputFile) {
    console.log('\u001b[35mYou passed strings to the CLI while also specified an input file, contents will be merged\u001b[0m');
}

const ml = w => w.replace(/(?<![m])L|M(?!L)/gi, 'ML').replace(/(?<![м])Л|М(?!Л)/gi, 'МЛ')

if (inputFile) {
    const contents = fs.readFileSync(inputFile, 'utf-8')
    if (path.extname(inputFile) === '.json') {
        const json = JSON.parse(contents)
        if (!Array.isArray(json)) {
            throw new Error('Input JSON file must be an array of strings')
        }
        pls.push(...json)
    } else {
        pls.push(contents.split(' '))
    }
}

pls = force ? pls : pls.filter(w => /[LЛ]/gi.test(w))

const mLed = pls.map(ml)

let data

let ext = outputExt || outputFile && path.extname(outputFile) || inputFile && path.extname(inputFile) || '.txt'

if (ext === '.json') {
    data = JSON.stringify(mLed)
} else if (ext === '.txt') {
    data = mLed.join(' ')
} else if (ext === '.md') {
    data = '- ' + mLed.join('\n- ')
} else {
    throw new Error(`Unsupported extension name '${outputExt}'`)
}

if (outputFile) {
    fs.writeFileSync(`${outputFile.replace(/\.[^/.]+$/, '')}${ext}`, data)
} else {
    process.stdout.write(data + '\n')
}
