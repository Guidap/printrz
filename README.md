# Printrz

> Printrz is a bridge between web app and printers installed on the OS.

> It was originally built to send raw ESC/POS commands to thermal printers from a web point of sale but this project can answer other purposes (see API doc for more).

## Introduction
The initial purpose of this application was to send ESC/POS commands to thermal printers from a web app.
Since the API implements the lovely (♥) [node-printer](https://github.com/tojocky/node-printer) project, the API can theorically be used to print PDF, JPG and whatsoever.

Currently, this app is used by GUIDAP's customers to print cash receipt from a desktop device.

### Roadmap to `v1`
- [ ] Fix auto update ([#6](https://github.com/Guidap/printrz/issues/6))
- [ ] Sign app binaries
- [x] Add "Reload printers" button ([#3](https://github.com/Guidap/printrz/issues/3))
- [ ] Show printer state and indicate the default printer of the OS
- [x] Server settings page (host, port) ([#6](https://github.com/Guidap/printrz/issues/5))
- [x] Show local IP on server settings page ([#4](https://github.com/Guidap/printrz/issues/4))
- [ ] Add API Documentation page
- [x] Add self-signed certificates generation for HTTPS origin support ([#6](https://github.com/Guidap/printrz/issues/6))
- [ ] Allow the user to override the default printer
- [ ] Allow the user to chose the best print test between ESC/POS, JPG, PDF and plain text
- [ ] Unit and fonctional testing
- [ ] Create a fancy logo

### Roadmap to `v2`
- [ ] Separate Electron app and API to different projects (the API could be useful as a standalone command line tool)

## How to use
Install [the latest release](https://github.com/Guidap/printrz/releases/latest) of Printrz on your favorite operating system.

Open this [JSFiddle](https://jsfiddle.net/3pc1vna5/) and try yourself !

### API :
| Route       | Method | Body                                                                                                                             | Description                                    |
|-------------|--------|----------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------|
| `/`         | GET    |                                                                                                                                  | Server healthcheck endpoint. No more, no less. |
| `/printers` | GET    |                                                                                                                                  | Get the list of installed printers.            |
| `/job`      | POST   | `{ "printer": "printer-identifier", "type": "type: RAW, TEXT, PDF, JPEG, ...", "data": "command"}` | Print something on the desired printer.        |

This API expose some [node-printer](https://github.com/tojocky/node-printer) features so if you don't find the information you need here, it could be usefull to check the documentation of this project 👍.

## Contribute
Follow the guidelines exposed in the [CONTRIBUTING file](https://github.com/Guidap/printrz/blob/master/CONTRIBUTING.md). 

## How to develop
### Prerequisites
You have to install [Node (LTS)](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/fr/docs/install).

#### Windows users
Install [Python](https://www.python.org/downloads/windows/) (executable installer).

Follow [this tutorial](https://projects.raspberrypi.org/en/projects/using-pip-on-windows/5) to know the Python executable path.

Open the Node Prompt as administrator and run the following command :
```bash
$ set PYTHON=C:\Users\...\AppData\Local\Programs\Python\Python37\python.exe # Change with your own Path
$ npm install --global --production windows-build-tools@4.0.0
$ yarn config set msvs_version 2017
$ set GYP_MSVS_VERSION=2017
```

### Build Setup
``` bash
# install dependencies
$ yarn

# serve with hot reload at localhost:9080
$ yarn dev

# Build (only) electron application for production
# On windows:
$ yarn build --win
# On OSX:
$ yarn build --macos
# On Debian/Ubuntu:
$ yarn build --linux

# Build and release for production on Github (you must have a valid GH_TOKEN env variable)
# We have to create a new tag first
$ yarn version # set the <new version>
$ git tag <new version>
$ git push && git push --tags
# On windows:
$ yarn release --win
# On OSX:
$ yarn release --macos
# On Debian/Ubuntu:
$ yarn release --linux

# run unit tests
$ yarn test

# lint all JS/Vue component files in `src/`
$ yarn lint
```

---
## Special thanks

To [@tojocky](https://github.com/tojocky) with his [node-printer](https://github.com/tojocky/node-printer) project ❤️.

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
