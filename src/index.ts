import fs from 'fs/promises';
import { format } from 'prettier';

import { Command, Option } from '@commander-js/extra-typings';

import { handleParseToTS } from './typescript';

const program = new Command();

program
    .name('json2struct')
    .description('CLI for converting JSON to TypeScript types')
    .version('0.0.1')
    .configureOutput({
        writeOut: (str) => process.stdout.write(`[OUT] ${str}`),
        writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
        outputError: (str, write) => write(`\x1b[31m${str}\x1b[0m`),
    });

program
    .command('convert <input> [output]', { isDefault: true })
    .description('Convert JSON file to type file')
    .option('--disable-format')
    .addOption(new Option('-lang, --language <output-language>').choices(['typescript']).default('typescript'))
    .action(async (inputPath, outputPath, args) => {
        console.info(`\u001b[32mjson2struct: Converting ${inputPath} to ${args.language}:\u001b[0m`);

        const fileContent = await fs.readFile(inputPath);

        const json = JSON.parse(fileContent.toString());

        if (args.language === 'typescript') {
            const parsedStruct = handleParseToTS(json);

            const formattedStruct = args?.disableFormat ? parsedStruct : format(parsedStruct, { parser: 'typescript' });

            if (outputPath?.length) {
                await fs.appendFile(outputPath, formattedStruct);
            }

            console.info(formattedStruct);
        }
    });

program.addHelpCommand();

program.parse();
