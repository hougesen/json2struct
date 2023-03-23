# json2struct

CLI tool for converting JSON files into TypeScript types.

## Installation

The tool can either be run using npx

```sh
$ npx json2struct <REQUIRED_INPUT_FILE> [OPTIONAL_OUTPUT_FILE]
```

or be installed globally

```sh
$ npm i -g json2struct
$ json2struct <REQUIRED_INPUT_FILE> [OPTIONAL_OUTPUT_FILE]
```

## Usage

To use the program pass the path to the json file `$ json2struct example.json`.

By default the structure will be printed to stdout.

```sh
# example.json
{
    "number_key": 1,
    "string_key": "json2struct",
    "boolean_key": true,
    "array_key": [42],
    "map_key": { "key": "value" }
}

$ npx json2struct example.json

json2struct: Converting example.json to typescript:
type GeneratedStruct = { array_key: Array<number>; boolean_key: boolean; map_key: { key: string }; number_key: number; string_key: string }

```

### Writing struct to file

To write the sturcture to a file write the output file name after the input `$ npx json2struct <REQUIRED_INPUT_FILE> [OPTIONAL_OUTPUT_FILE]`.

```sh
# example.json
{
    "number_key": 1,
    "string_key": "json2struct",
    "boolean_key": true,
    "array_key": [42],
    "map_key": { "key": "value" }
}

$ npx json2struct example.json example.d.ts

# example.d.ts
type GeneratedStruct = { array_key: Array<number>; boolean_key: boolean; map_key: { key: string }; number_key: number; string_key: string }
```

The default behavior is to append to the output file. This behavior can be overwritten by passing the option `--overwrite`.

## Defaults

### Empty arrays

By default empty arrays will be converted to

```ts
Array<unknown>;
```

### Empty hashmaps

Hashmaps without keys will be converted to

```ts
Record<string, unknown>;
```
