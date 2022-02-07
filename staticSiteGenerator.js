const fs = require("fs");
const path = require("path");

function generate() {
    const [keyValueMap, specializations] = createDataKeyValueMapAndSpecializations();

    generateDir(keyValueMap, specializations, new Map(), __dirname);
}

function generateDir(keyValueMap, specializations, resolvedSpecializations, path_) {
    for (const dirent of fs.readdirSync(path_, {withFileTypes: true})) {
        const childPath = path.join(path_, dirent.name);
        if (isTemplatePath(childPath)) {
            for (
                const [templatePath, childResolvedSpecializations, resolvedPath]
                of resolvePath(keyValueMap, specializations, resolvedSpecializations, childPath)
            ) {
                if (fs.statSync(templatePath).isDirectory()) {
                    if (!fs.existsSync(resolvedPath)) {
                        fs.mkdirSync(resolvedPath, {recursive: true});
                    }
                } else {
                    generateFile(keyValueMap, templatePath, childResolvedSpecializations, resolvedPath);
                }
            }
        }

        if (dirent.isDirectory()) {
            generateDir(keyValueMap, specializations, resolvedSpecializations, childPath);
        }
    }
}

function generateFile(keyValueMap, templatePath, resolvedSpecializations, path_) {
    const template = fs.readFileSync(templatePath, {encoding: "utf8"});
    const placeholders = findPlaceholders(template);
    let content = template;
    for (const placeholder of placeholders.reverse()) {
        content = replacePlaceholder(
            content,
            placeholder,
            getValueFromKeyValueMapOrResolvedSpecialization(
                keyValueMap,
                resolvedSpecializations,
                placeholder.value,
            )
        )
    }

    fs.writeFileSync(path_, content, {encoding: "utf8"});
}

function isTemplatePath(path_) {
    return path_.match(/\.template(\.[^.]+)?$/) !== null;
}

function removeTemplateSubstrings(path_) {
    let previousPath;
    do {
        previousPath = path_;
        path_ = path_.replace(/(\.template)(\.[^.]+)?(\/|$)/, "$2$3");
    } while (path_ !== previousPath);

    return path_;
}

function* resolvePath(keyValueMap, specializations, resolvedSpecializations, templatePath) {
    const pathWithTemplateSubstringsRemoved = removeTemplateSubstrings(templatePath);
    const placeholders = findPlaceholders(pathWithTemplateSubstringsRemoved);
    if (placeholders.length === 0) {
        yield [templatePath, resolvedSpecializations, pathWithTemplateSubstringsRemoved];
        return;
    }
    for (const result of resolvePathPlaceholders(
        keyValueMap,
        specializations,
        templatePath,
        resolvedSpecializations,
        pathWithTemplateSubstringsRemoved,
        placeholders
    )) {
        yield result;
    }
}

function* resolvePathPlaceholders(
    keyValueMap,
    specializations,
    templatePath,
    resolvedSpecializations,
    path_,
    placeholders
) {
    const placeholder = placeholders.shift();
    if (placeholder.value.indexOf("*") === -1) {
        const nextPath = replacePlaceholder(
            path_,
            placeholder,
            getValueFromKeyValueMapOrResolvedSpecialization(keyValueMap, resolvedSpecializations, placeholder.value)
        );
        const nextResolvedSpecializations = new Map(resolvedSpecializations);
        if (placeholders.length === 0) {
            yield [templatePath, nextResolvedSpecializations, nextPath];
        } else {
            const placeholderOffset = path_.length - nextPath.length;
            for (const result of resolvePathPlaceholders(
                keyValueMap, specializations, templatePath, nextResolvedSpecializations, nextPath, placeholders.map(
                    ({start, end, value}) => ({start: start - placeholderOffset, end: end - placeholderOffset, value}),
                )
            )) {
                yield result;
            }
        }
    } else {
        const specializationTypeKey = placeholder.value.slice(0, placeholder.value.indexOf("*") + 1);
        const keyEnd = placeholder.value.slice(placeholder.value.indexOf("*") + 1);
        let specializationKeys;
        if (specializations.has(specializationTypeKey)) {
            specializationKeys = specializations.get(specializationTypeKey);
        } else {
            throw new Error(
                `Specialization placeholder '${placeholder.value}' `
                + `in template path '${path_}' was not entered in data!`
            )
        }
        // Remove trailing star
        const resolvedSpecializationKey = specializationTypeKey.slice(0, specializationTypeKey.length - 1);
        for (const specializationKey of specializationKeys) {
            const nextResolvedSpecializations = new Map(resolvedSpecializations);
            nextResolvedSpecializations.set(resolvedSpecializationKey, specializationKey);
            const nextPath = replacePlaceholder(
                path_,
                placeholder,
                keyValueMap.get(`${specializationKey}${keyEnd}`),
            );
            if (placeholders.length === 0) {
                yield [templatePath, nextResolvedSpecializations, nextPath];
            } else {
                const placeholderOffset = path_.length - nextPath.length;
                for (const result of resolvePathPlaceholders(
                    keyValueMap, specializations, templatePath, nextResolvedSpecializations, nextPath, placeholders.map(
                        ({start, end, value}) => ({start: start - placeholderOffset, end: end - placeholderOffset, value}),
                    )
                )) {
                    yield result;
                }
            }
        }
    }
}

function getValueFromKeyValueMapOrResolvedSpecialization(keyValueMap, resolvedSpecializations, key) {
    if (keyValueMap.has(key)) {
        return keyValueMap.get(key);
    }

    const keySegments = key.split(".");
    let resolvedKey = null;
    for (let i = 0; i < keySegments.length; i++) {
        const keySegment = keySegments[i];
        if (i === 0) {
            resolvedKey = keySegment;
        } else {
            resolvedKey = `${resolvedKey}.${keySegment}`;
        }
        if (resolvedSpecializations.has(resolvedKey)) {
            resolvedKey = resolvedSpecializations.get(resolvedKey);
        }
    }

    if (keyValueMap.has(resolvedKey)) {
        return keyValueMap.get(resolvedKey);
    }

    const specializationsEntryStrings = [];
    for (const [key, value] of resolvedSpecializations.entries()) {
        specializationsEntryStrings.push(`${key} => ${value}`)
    }
    throw new Error(`No key '${key}' found in data for resolved specializations '${specializationsEntryStrings.join(", ")}'!`)
}

function replacePlaceholder(s, placeholder, placeholderStr) {
    return `${s.slice(0, placeholder.start)}${placeholderStr}${s.slice(placeholder.end)}`;
}

function findPlaceholders(s) {
    const placeholders = [];
    let placeholderStart = null;
    let placeholderChars = [];
    for (let i = 0; i < s.length - 1; i++) {
        const char = s[i];
        if (placeholderStart === null) {
            if (char === "{" && s[i + 1] === "{" && (i === 0 || s[i - 1] !== "\\")) {
                placeholderStart = i;
                i++;
            }
        } else {
            if (char === "}" && s[i + 1] === "}") {
                if (s[i - 1] === "\\") {
                    placeholderChars.pop();
                    placeholderChars.push(char);
                } else {
                    i++;
                    placeholders.push({
                        start: placeholderStart,
                        end: i + 1,
                        value: placeholderChars.join("").trim(),
                    })
                    placeholderStart = null;
                    placeholderChars = [];
                }
            } else {
                placeholderChars.push(char);
            }
        }
    }

    return placeholders;
}

function createDataKeyValueMapAndSpecializations() {
    const keyValueMap = new Map();
    const specializations = new Map();

    addDataKeyValuesAndSpecializationsFromObject(
        keyValueMap,
        specializations,
        mergeDataObjects(readJSON("./data.json"), require("./generateData")),
    );

    return [keyValueMap, specializations];
}

function addDataKeyValuesAndSpecializationsFromObject(
    keyValueMap,
    specializations,
    obj,
    keyStart = ""
) {
    for (const [keyContinuation, value] of Object.entries(obj)) {
        const key = `${keyStart}${keyContinuation}`;

        if (keyContinuation.endsWith("*")) {
            const specializationKeys = [];
            for (const [specializationName, specializationValue] of Object.entries(value)) {
                const specializationKey = `${keyStart}${keyContinuation}="${specializationName}"`;
                specializationKeys.push(specializationKey);
                if (typeof value === "object") {
                    keyValueMapResolveAndSetUnique(keyValueMap, specializationKey, specializationName);
                    addDataKeyValuesAndSpecializationsFromObject(
                        keyValueMap,
                        specializations,
                        specializationValue,
                        `${specializationKey}.`
                    );
                } else {
                    keyValueMapResolveAndSetUnique(keyValueMap, specializationKey, specializationValue);
                }
            }

            mapSetUnique(specializations, key, specializationKeys);
        } else if (keyContinuation.indexOf("*") > -1) {
            const specializationMarkerIndex = key.indexOf("*");
            const specializationKey = key.slice(0, specializationMarkerIndex + 1);
            const keyEnd = key.slice(specializationMarkerIndex + 1);
            if (specializations.has(specializationKey)) {
                for (const specializationKeyStart of specializations.get(specializationKey)) {
                    keyValueMapResolveAndSetUnique(keyValueMap, `${specializationKeyStart}${keyEnd}`, value);
                }
            }
        } else if (typeof value === "object") {
            addDataKeyValuesAndSpecializationsFromObject(
                keyValueMap,
                specializations,
                value,
                `${key}.`
            );
        } else {
            keyValueMapResolveAndSetUnique(keyValueMap, key, value);
        }
    }

    return [keyValueMap, specializations];
}

function keyValueMapResolveAndSetUnique(keyValueMap, key, value) {
    if (typeof value === "function") {
        value = value(keyValueMap, key);
    }

    mapSetUnique(keyValueMap, key, value);
}

function mergeDataObjects(...objs) {
    const [obj1, obj2, ...rest] = objs;
    if (rest.length > 0) {
        return mergeDataObjects(_mergeTwoDataObjects(obj1, obj2), ...rest);
    } else {
        return _mergeTwoDataObjects(obj1, obj2);
    }
}

function _mergeTwoDataObjects(obj1, obj2) {
    const mergedObject = {};

    const visitedKeys = new Set();

    for (const [key, obj1Value] of Object.entries(obj1)) {
        if (obj2.hasOwnProperty(key)) {
            const obj2Value = obj2[key];
            if (typeof obj1Value === "object" && typeof obj2Value === "object") {
                mergedObject[key] = _mergeTwoDataObjects(obj1Value, obj2Value);
            } else if (obj1Value === obj2Value) {
                mergedObject[key] = obj1Value;
            } else {
                throw new Error(`Merged failed: ${obj1Value} !== ${obj2Value}`);
            }
        } else {
            mergedObject[key] = obj1Value;
        }

        visitedKeys.add(key);
    }

    for (const [key, value] of Object.entries(obj2)) {
        if (visitedKeys.has(key)) {
            continue;
        }

        mergedObject[key] = value;
    }

    return mergedObject;
}

function readJSON(path) {
    return JSON.parse(fs.readFileSync(path));
}

function mapSetUnique(map, key, value) {
    if (map.has(key)) {
        throw new Error(`Key '${key}' already exists in map '${map}'!`);
    }

    map.set(key, value);
}

generate();