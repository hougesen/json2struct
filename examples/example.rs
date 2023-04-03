enum SubEnum1 {
    Key1(bool),
    Key2(f64),
    Key3(i64),
}

struct SubStruct2 {
    falseValue: bool,
    floatValue: f64,
    numberValue: i64,
    stringValue: String,
    trueValue: bool,
    unionValue: Vec<SubEnum1>,
}

struct GeneratedStruct {
    array: Vec<SubStruct2>,
}
