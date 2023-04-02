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
