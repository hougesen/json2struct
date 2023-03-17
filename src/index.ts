import fs from 'fs/promises';
import { format } from 'prettier';

import { Command } from '@commander-js/extra-typings';

import { handleParseToTS } from './typescript';

const program = new Command();

program.name('json2struct').description('CLI for converting JSON to TypeScript types').version('0.0.1');

program
    .command('convert', { isDefault: true })
    .description('Convert JSON file to type file')
    .argument('<file-path>')
    .action(async (path) => {
        const fileContent = await fs.readFile(path);

        const json = JSON.parse(fileContent.toString());

        const parsedStruct = handleParseToTS(json);

        process.stdout.write(format(parsedStruct, { parser: 'typescript' }));
    });

program.addHelpCommand();

program.parse();
