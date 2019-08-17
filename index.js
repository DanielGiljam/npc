class NPC {
    constructor(namespace, preset) {
        const baseLookups = NPC.getBaseLookups()
        const instanceLookups = NPC.getInstanceLookups(namespace, baseLookups)
        const params = NPC.getParams(instanceLookups, baseLookups)
        const defaults = NPC.selectDefaults(params, preset)
        const properties = {}
        for (const key in params) if (params.hasOwnProperty(key)) {
            // noinspection JSUnusedGlobalSymbols
            properties[key] = { enumerable: true, get: () => (params[key] != null) ? params[key] : defaults[key] }
        }
        Object.defineProperties(this, properties)
    }
}

NPC.presets = {
    default: {
        protocol: "http",
        secure: false,
        host: undefined,
        port: 80,
        name: undefined
    },
    https: {
        protocol: "https",
        secure: true,
        port: 443
    },
    mongodb: {
        protocol: "mongodb",
        port: 27017
    }
}

NPC.getErrorMessage = function getErrorMessage(argName, argValue) {
    return `Argument passed to \`${argName}\` parameter must be of type \`string\`! Got type \`${typeof argValue}\`.`
}

NPC.transformCase = function transformCase(string) {
    if (/^([A-Z]+_)*[A-Z]+$/.test(string)) {
        // noinspection JSUnresolvedFunction
        return string.toLowerCase().replace(/_(\w)/, (substr, m1) => m1.toUpperCase())
    } else {
        return string.replace(/([A-Z])/, "_$&").toUpperCase()
    }
}

NPC.getBaseLookups = function getBaseLookups() {
    const baseLookups = []
    for (const key in this.presets.default) if (this.presets.default.hasOwnProperty(key)) {
        baseLookups.push(this.transformCase(key))
    }
    return baseLookups
}

NPC.getInstanceLookups = function getInstanceLookups(namespace, baseLookups) {
    if (namespace) {
        if (typeof namespace === "string") {
            if (namespace !== "") return baseLookups.map(lookup => `${namespace}_${lookup}`)
        } else {
            throw new TypeError(NPC.getErrorMessage("namespace", namespace))
        }
    }
    return baseLookups
}

NPC.getParams = function getParams(instanceLookups, baseLookups) {
    let params = {}
    for (const index in instanceLookups) {
        if (instanceLookups.hasOwnProperty(index)) {
            const paramValue = process.env[instanceLookups[index]]
            const paramKey = this.transformCase(baseLookups[index])
            params[paramKey] = paramValue
        }
    }
    return params
}

NPC.selectDefaults = function selectDefaults(params, preset) {
    if (preset) {
        if (typeof preset === "string") return Object.assign({}, this.presets.default, this.presets[preset])
        else throw new TypeError(this.getErrorMessage("preset", preset))
    }
    return (params.secure) ? Object.assign({}, this.presets.default, this.presets.https) : this.presets.default
}

module.exports = NPC
