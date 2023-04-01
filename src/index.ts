#!/usr/bin/env node

import fs from 'fs/promises';

import { Command, Option } from '@commander-js/extra-typings';

import { generatePythonStruct } from './languages/python';
import { generateTypeScriptType } from './languages/typescript';
import { Token, tokenize } from './tokenizer';

function convertToLanguage(language: string, token: Token) {
    switch (language) {
        case 'typescript':
            return generateTypeScriptType(token);

        case 'python':
            return generatePythonStruct(token);

        default:
            throw new Error(`${language} is not supported`);
    }
}

const program = new Command();

program
    .name('json2struct')
    .description('Easily translate JSON into type definitions')
    .version('0.3.0')
    .configureOutput({
        writeOut: (str) => process.stdout.write(`[OUT] ${str}`),
        writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
        outputError: (str, write) => write(`\x1b[31m${str}\x1b[0m`),
    });

program
    .command('convert <input> [output]', { isDefault: true })
    .description('Convert JSON file to type file')
    .option('--overwrite')
    .addOption(
        new Option('-lang, --language <output-language>').choices(['typescript', 'python']).default('typescript')
    )
    .action(async (inputPath, outputPath, args) => {
        console.info(`\u001b[32mjson2struct: Converting ${inputPath} to ${args.language}:\u001b[0m`);

        if (!outputPath?.length && args?.overwrite) {
            program.error('--overwrite options requires an output path');
            return;
        }

        const fileContent = await fs.readFile(inputPath);

        const json = JSON.parse(fileContent.toString());

        const tokens = tokenize(json);

        const generatedStruct = convertToLanguage(args?.language ?? 'typescript', tokens);

        if (outputPath?.length) {
            if (args?.overwrite) {
                await fs.writeFile(outputPath, generatedStruct);
            } else {
                await fs.appendFile(outputPath, generatedStruct);
            }
        }

        console.info(generatedStruct);
    });

program.addHelpCommand();

program.parse();
