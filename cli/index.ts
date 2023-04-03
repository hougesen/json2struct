#!/usr/bin/env node

import fs from 'fs/promises';

import { Command, Option } from '@commander-js/extra-typings';

import { convertToLanguage, SupportedLanguage, tokenize } from '../core';

const program = new Command();

program
    .name('json2struct')
    .description('Easily translate JSON into type definitions')
    .version('0.4.1')
    .configureOutput({
        writeOut: (str) => process.stdout.write(`[OUT] ${str}`),
        writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
        outputError: (str, write) => write(`\x1b[31m${str}\x1b[0m`),
    });

program
    .command('convert <input>', { isDefault: true })
    .description('Convert JSON file to type file')
    .option('-o --output <output-file>')
    .option('--overwrite')
    .addOption(
        new Option('-l --language <output-language>')
            .choices<SupportedLanguage[]>(['typescript', 'python', 'julia', 'rust'])
            .default('typescript')
    )
    .action(async (inputPath, args) => {
        console.info(`\u001b[32mjson2struct: Converting ${inputPath} to ${args.language}:\u001b[0m`);

        if (!args?.output?.length && args?.overwrite) {
            program.error('--overwrite options requires an output path');
            return;
        }

        const fileContent = await fs.readFile(inputPath);

        const json = JSON.parse(fileContent.toString());

        const tokens = tokenize(json);

        const generatedStruct = convertToLanguage((args?.language as SupportedLanguage) ?? 'typescript', tokens);

        if (args.output?.length) {
            if (args?.overwrite) {
                await fs.writeFile(args.output, generatedStruct);
            } else {
                await fs.appendFile(args.output, generatedStruct);
            }
        }

        console.info(generatedStruct);
    });

program.addHelpCommand();

program.parse();
