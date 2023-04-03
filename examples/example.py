from typing import List, TypedDict, Union


class SubStruct1(TypedDict):
    falseValue: bool
    floatValue: float
    numberValue: int
    stringValue: str
    trueValue: bool
    unionValue: List[Union[bool, float, int]]


class GeneratedStruct(TypedDict):
    array: List[SubStruct1]
