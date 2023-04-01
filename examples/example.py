from typing import List, TypedDict


class SubStruct1(TypedDict):
    key: str


class GeneratedStruct(TypedDict):
    array_key: List[int]
    boolean_key: bool
    map_key: SubStruct1
    number_key: int
    string_key: str
