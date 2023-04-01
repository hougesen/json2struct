# json2struct

json2struct is a tool that translates JSON into type definitions. It currently supports translating to TypeScript and Python.

The goal is for the definitions to be used as a starting point for the user, and not as a single source of truth.

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
```

Writes the following to the output file:

```ts
# example.d.ts
type GeneratedStruct = { array_key: Array<number>; boolean_key: boolean; map_key: { key: string }; number_key: number; string_key: string }
```

The default behavior is to append to the output file. This behavior can be overwritten by passing the option `--overwrite`.

### Changing language

json2struct currently supports outputting to either TypeScript or Python. By default the conversion will be to TypeScript.

To use another language pass the `--language` option.

#### Python

```sh
# example.json
{
    "number_key": 1,
    "string_key": "json2struct",
    "boolean_key": true,
    "array_key": [42],
    "map_key": { "key": "value" }
}

$ npx json2struct example.json example.d.ts --language python
```

Writes the following to the output file:

```python
# example.py
from typing import List, TypedDict


class SubStruct1(TypedDict):
    key: str


class GeneratedStruct(TypedDict):
    array_key: List[int]
    boolean_key: bool
    map_key: SubStruct1
    number_key: int
    string_key: str
```

## Defaults

If json2struct isn't able to determine the type of a given element, it tries to convert it to the closest type possible.

### Empty arrays

By default empty arrays will be converted to:

#### TypeScript

```ts
Array<unknown>;
```

#### Python

```python
List[Any]
```

### Empty hashmaps

Hashmaps without keys will be converted to:

#### TypeScript

```ts
Record<string, unknown>;
```

#### Python

```python
Dict[Any, Any]
```
