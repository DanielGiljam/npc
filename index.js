class NPC {

    static presets = {
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

    static getErrorMessage(argName, argValue) {
        return `\`${argName}\` argument must be of type \`string\`! Got type \`${typeof argValue}\`.`
    }

    static transformCase(string) {
        if (/^([A-Z]+_)*[A-Z]+$/.test(string)) {
            return  string.toLowerCase().replace(/_(\w)/, (substr, m1) => m1.toUpperCase())
        } else {
            return  string.replace(/([A-Z])/, "_$&").toUpperCase()
        }
    }

    static getBaseLookups() {
        const baseLookups = []
        for (const key in this.presets.default) if (this.presets.default.hasOwnProperty(key)) {
            baseLookups.push(this.transformCase(key))
        }
        return baseLookups
    }

    static getInstanceLookups(namespace, baseLookups) {
        if (namespace) {
            if (typeof namespace === "string") {
                if (namespace !== "") return baseLookups.map(lookup => `${namespace}_${lookup}`)
            } else {
                throw new TypeError(NPC.getErrorMessage("namespace", namespace))
            }
        }
        return baseLookups
    }

    static getParams(instanceLookups, baseLookups) {
        let params = {}
        for (const index in instanceLookups) {
            if (instanceLookups.hasOwnProperty(index)) {
                // TODO: `env` can't return the value of a key if the key is provided through a variable
                // The issue was observed client-side when using a feature of Next.js to emulate `process.env` in the browser.
                // Using webpack's EnvironmentPlugin or the `dotenv-webpack` plugin for webpack may produce the same results
                // (in fact, I think Next.js's feature delegates the task of emulating to one of these).
                const paramValue = process.env[instanceLookups[index]]
                const paramKey = this.transformCase(baseLookups[index])
                params[paramKey] = paramValue
            }
        }
        return params
    }

    static selectDefaults(params, preset) {
        if (preset) {
            if (typeof preset === "string") return Object.assign({}, this.presets.default, this.presets[preset])
            else throw new TypeError(this.getErrorMessage("preset", preset))
        }
        return (params.secure) ? Object.assign({}, this.presets.default, this.presets.https) : this.presets.default
    }

    constructor(namespace, preset) {

        const baseLookups = NPC.getBaseLookups()

        let instanceLookups = NPC.getInstanceLookups(namespace, baseLookups)

        const params = NPC.getParams(instanceLookups, baseLookups)
        const defaults = NPC.selectDefaults(params, preset)

        const properties = {}
        for (const key in params) if (params.hasOwnProperty(key)) {
            properties[key] = { enumerable: true, get: () => (params[key] != null) ? params[key] : defaults[key] }
        }
        Object.defineProperties(this, properties)
    }
}

module.exports = NPC
