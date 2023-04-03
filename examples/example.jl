struct SubStruct1
    falseValue::Bool
    floatValue::Float64
    numberValue::Int64
    stringValue::String
    trueValue::Bool
    unionValue::Array{Union{Bool,Float64,Int64}}
end

struct GeneratedStruct
    array::Array{SubStruct1}
end
