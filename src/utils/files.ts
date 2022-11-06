import * as path from 'path'
import * as fs from 'fs'
import fsExtra from 'fs-extra'
import * as yaml from 'js-yaml'
import extract from 'extract-zip'
import os from 'os'
import * as utils from './utils'
import axios from 'axios'
import * as validator from './validator'
import xml2js from 'xml2js'
import filenamify from 'filenamify'
import _syncDirectory from 'sync-directory'

export function syncDirectory(source: string, target: string) {
    assertDirectory(source)
    createDirectory(target)
    _syncDirectory(source, target, {
        deleteOrphaned: true,
    })
}

export function sanitize(file: string) {
    return filenamify(file, {replacement: '__', maxLength: 255})
}

export function createFile(file: string) {
    if (exists(file)) return
    fsExtra.createFileSync(file)
}

export function exists(file: string) {
    return fs.existsSync(file)
}

export function assertFile(file: string) {
    if (!isFile(file)) throw new Error(`File "${file}" does not exist`)
}

export function assertDirectory(dir: string) {
    if (!isDirectory(dir)) throw new Error(`Directory "${dir}" does not exist`)
}

export function isFile(path: string) {
    return exists(path) && fs.lstatSync(path).isFile()
}

export function isDirectory(path: string) {
    return exists(path) && fs.lstatSync(path).isDirectory()
}

export function getSize(file: string) {
    assertFile(file)
    return fs.lstatSync(file).size
}

export function countLines(file: string) {
    assertFile(file)
    return fs.readFileSync(path.resolve(file), 'utf-8').split(/\r?\n/).length
}

export function isLink(path: string) {
    return path.startsWith('http://') || path.startsWith('https://')
}

export function loadFile(file: string) {
    assertFile(file)
    return fs.readFileSync(path.resolve(file), 'utf-8')
}

export function loadYAML<T>(file: string) {
    return yaml.load(loadFile(file)) as T
}

export function storeYAML<T>(file: string, data: T) {
    if (validator.isString(data)) {
        fs.writeFileSync(path.resolve(file), data)
    } else {
        fs.writeFileSync(path.resolve(file), toYAML(data))
    }
    return file
}

export async function loadXML<T>(file: string) {
    return (await xml2js.parseStringPromise(loadFile(file) /*, options */)) as T
}

export function toYAML(obj: any) {
    return yaml.dump(obj, {
        indent: 4,
        styles: {
            '!!null': 'empty',
        },
    })
}

export function copy(source: string, target: string) {
    fsExtra.copySync(path.resolve(source), path.resolve(target))
}

export function listDirectories(directory: string): string[] {
    return fs
        .readdirSync(directory, {withFileTypes: true})
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name.toString())
}

export function listFiles(directory: string): string[] {
    return fs
        .readdirSync(directory, {withFileTypes: true})
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name.toString())
}

export function createDirectory(directory: string) {
    const resolved = path.resolve(directory)
    if (!fs.existsSync(resolved)) {
        fs.mkdirSync(resolved, {recursive: true})
    }
}

export function removeDirectory(directory: string) {
    const resolved = path.resolve(directory)
    fs.rmSync(resolved, {recursive: true, force: true})
}

export async function extractArchive(source: string, target: string) {
    await extract(source, {dir: target})
}

export async function download(source: string, target: string = temporaryPath()): Promise<string> {
    return new Promise((resolve, reject) => {
        axios
            .get(source, {
                responseType: 'stream',
            })
            .then(response => {
                const file = fs.createWriteStream(target)
                response.data.pipe(file)
                file.on('error', error => {
                    file.close()
                    reject(error)
                })

                file.on('finish', () => {
                    file.close()
                    resolve(target)
                })
            })
    })
}

export function temporaryPath(name?: string) {
    return path.join(os.tmpdir(), name || utils.generateNonce())
}

export function readDirectory(dir: string): string[] {
    assertDirectory(dir)
    return fs.readdirSync(dir)
}
