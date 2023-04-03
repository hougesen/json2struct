# json2struct

json2struct is a tool that translates JSON into type definitions. It currently supports translating to TypeScript, Python and Julia.

The goal is for the definitions to be used as a starting point for the user, and not as a single source of truth.

## Installation

The tool can either be run using npx

```sh
$ npx json2struct <REQUIRED_INPUT_FILE>
```

or be installed globally

```sh
$ npm i -g json2struct
$ json2struct <REQUIRED_INPUT_FILE>
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

To write the sturcture to a file pass use the output option `$ npx json2struct <REQUIRED_INPUT_FILE> --output <OUTPUT_FILE>`.

```sh
# example.json
{
    "number_key": 1,
    "string_key": "json2struct",
    "boolean_key": true,
    "array_key": [42],
    "map_key": { "key": "value" }
}

$ npx json2struct example.json --output example.d.ts
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

$ npx json2struct example.json --output example.py --language python
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

#### Julia

```sh
# example.json
{
    "number_key": 1,
    "string_key": "json2struct",
    "boolean_key": true,
    "array_key": [42],
    "map_key": { "key": "value" }
}

$ npx json2struct example.json --output example.jl --language julia
```

Writes the following to the output file:

```julia
# example.jl
struct SubStruct1
    key::String
end

struct GeneratedStruct
    array_key::Array{Int64}
    boolean_key::Bool
    map_key::SubStruct1
    number_key::Int64
    string_key::String
end
```

## Unknown values

If json2struct isn't able to determine the type of a given element, it tries to convert it to the closest type possible. In most languages this will be the `Any` type of the language.

For some languages, like Rust, this mean that the generated type definitions might not always be valid.

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

#### Julia

```julia
Array{Any}
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

#### Julia

```
Dict{Any,Any}
```

## Examples

Examples of type definitions generated using json2struct can be found in the [examples folder](./examples/).

## Notes

As said earlier the aim of this tool is to be used as a helper when writing type definitions, for that reason json2struct tries not to augment the output in any way.

One such example is not flattening the values of maps. In some cases it might make sense to flatten `[{ "a": 1 }, { "b": 1 }]` into `type GeneratedStruct = [{ a?: number; b?: number }];`. But in most cases flattening of maps requires having preexisting knowledge about the data that should be expected. For that reason json2struct prefers to let the user augment the type definition after, instead of imposing it's views on the user.

For the same reason json2struct does not take into account whether a key is actually valid in the given language.

Since this project is mostly meant to be a way for me to familiarize myself with different langauges, the types might not be the most optimal.
