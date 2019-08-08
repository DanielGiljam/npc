# npc

Use ***Networking Parameters Containers***, or *`NPC` instances*, for improved type-safety and consistency in your code when developing JavaScript applications.

For the best experience and results, use `npc` together with [`dotenv`]. Like [`dotenv`], `npc` embraces the [Twelve-Factor App] methodology's principle of storing configuration in the environment separate from code. `npc` takes this even further, by also keeping the fallback defaults, if configuration is missing, separate from the code and the main application logic.

`npc` has zero dependencies.

### What are *networking parameters*?

To give you an idea, here are some networking parameters in an `.env` file:

```bash
SERVER_HOST=localhost
SERVER_PORT=3000

API_HOST=exampleapi.org
API_SECURE=true
```

### Usage

Let's say we need some parameters in order to perform a [`fetch`].

```js
require("dotenv").config() // loading the networking parameters from the .env file

const apiParams = new NPC("API"),
      query = "somecontent"

fetch(`${apiParams.protocol}://${apiParams.host}/${query}`)
	.then(res => /*do something with the response*/)

// or

const { protocol, host } = new NPC("API")
const query = "somecontent"

fetch(`${protocol}://${host}/${query}`)
	.then(res => /*do something with the response*/)
```

`npc` falls back to defaults if a parameter wasn't defined. It guesses what defaults to provide based on the parameters that were defined – whether they are accessed or not – in conjuction with a set of presets.

In the example above, `apiParams.protocol` will return `"https"`, even though there was no `API_PROTOCOL=https` entry in the `.env` file. `npc` defaults to the HTTP protocol if no protocol is specified and knows to return `https` instead of `http` because `API_SECURE` specified as `true`.

### Assumptions

`npc` is built around the following assumptions:

1. Your networking parameters can be found in the [`process.env`] object.
2. You follow these conventions when naming the parameters:
	1. the name is SCREAMING_SNAKE_CASE
	2. the name can be dissected into two parts: `<context>_<type>`, e.g. `API_HOST` where `API` is the context and `HOST` is the type

### API

The constructor takes two arguments:

- `context` – specifies which set of networking parameters you want dedicate the container to. If you don't supply this parameter, it is assumed you only have one set of networking parameters, defined as just the types of parameters they represent, no context prepended to their names.

- `preset` – if you want to explicitly specify what preset of defaults to fall back to, you can specify that here, as a string. This is optional.

   ```js
   const dbParams = new NPC("DB", "mongodb")
   ```

### Types, defaults and presets

Out of the box, `npc` supports following parameter types:

Type | Default
:--- | :---
protocol | `"http"`
host | `undefined`
port | `80`
secure | `false`
name | `undefined`

Alternative default values originate from presets:

- HTTPS

   Type | Default
   :--- | :---
   protocol | `"https"`
   port | `443`
   secure | `true`

- MongoDB

   Type | Default
   :--- | :---
   protocol | `"mongodb"`
   port | `27017`

As of now (v0.1.0) you can't provide your own types and presets, but it's an upcoming feature, so stay tuned.

Of course, feel free to fork and add your own out-of-the-box types and presets to make `npc` satisfy your needs, and if you do, send a pull request with what you added to help grow `npc`'s out of the box functionality!

If there's anything you want to point out about any aspect of the project (even grammar used in this readme), please [do point out]. All feedback is appreciated. I'm fairly new to this game and I have a lot to learn.

[`dotenv`]: https://github.com/motdotla/dotenv "https://github.com/motdotla/dotenv"
[Twelve-Factor App]: https://12factor.net "https://12factor.net"
[`process.env`]: https://nodejs.org/docs/latest/api/process.html#process_process_env "https://nodejs.org/docs/latest/api/process.html#process_process_env"
[`fetch`]: https://github.com/bitinn/node-fetch "https://github.com/bitinn/node-fetch"
[do point out]: https://github.com/DanielGiljam/npc/issues/new "https://github.com/DanielGiljam/npc/issues/new"
