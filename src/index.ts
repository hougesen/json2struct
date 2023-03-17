import fs from 'fs/promises';
import { format } from 'prettier';

import { Command } from '@commander-js/extra-typings';

import { handleParseToTS } from './typescript';

const program = new Command();

program.name('json2struct').description('CLI for converting JSON to TypeScript types').version('0.0.1');

program
    .command('convert', { isDefault: true })
    .description('Convert JSON file to type file')
    .argument('<input-file>')
    .argument('[output-file]', '')
    .action(async (inputPath, outputPath) => {
        const fileContent = await fs.readFile(inputPath);

        const json = JSON.parse(fileContent.toString());

        const parsedStruct = handleParseToTS(json);

        const formattedStruct = format(parsedStruct, { parser: 'typescript' });

        if (outputPath?.length) {
            await fs.appendFile(outputPath, formattedStruct);
        }

        process.stdout.write(formattedStruct);
    });

program.addHelpCommand();

program.parse();
