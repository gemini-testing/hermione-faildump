# hermione-faildump [![Build Status](https://travis-ci.org/gemini-testing/hermione-faildump.svg?branch=master)](https://travis-ci.org/gemini-testing/hermione-faildump)

Plugin for [Hermione](https://github.com/gemini-testing/hermione) which collects all test fails and saves them to the specified file (default: `./hermione-faildump.json`).
Read more about `Hermione` plugins in the [documentation](https://github.com/gemini-testing/hermione#plugins).

## Install

```bash
$ npm install hermione-faildump
```

## Usage

Add plugin to your configuration file:

```js
module.exports = {
    plugins: {
        faildump: true
    }
};
```

You can redefine the default report name this way:

```js
module.exports = {
    plugins: {
        faildump: {
            targetFile: 'awesome-faildump.json'
        }
    }
};
```
