# ice-cpp

**ice-cpp** is a cross-platform utility to build C++ software.

## Installation on Windows

* Install [node.js](http://nodejs.org/) binary package from [nodejs.org](http://nodejs.org).
* Ensure that you have an [ice](https://github.com/quyse/ice) build system in `node_modules` directory. Simply create `node_modules` directory in ice-cpp working copy, and checkout ice into `node_modules` as a separate directory named `ice`.
* Launch the Windows SDK Command Prompt, or Visual Studio Command Prompt, and issue the following command to get environment file (of course, you can use any name instead of `C:\envfile`):

```bat
set > C:\envfile
```

* Inspect the contents of your envfile, maybe you should add or remove something (i.e. additional include directories in `INCLUDE` variable).
* Create a text file `ice-cpp.bat` at somewhere your `PATH` environment variable points to, with the following line in it:

```bat
@node path-to-your-ice-cpp-directory\index.js -env path-to-your-envfile %*
```

## Installation on Linux

* Install [node.js](http://nodejs.org/) from your package manager or manually.
* Ensure that you have an [ice](https://github.com/quyse/ice) build system in `node_modules` directory. Preferably you're going to checkout ice into separate directory and symlink it into `node_modules`.

```bash
# (in ice-cpp working copy)
mkdir node_modules
cd node_modules
ln -s <path-to-ice-directory> ice
```

* Make system-wide command for ice-cpp.

```bash
cd /usr/bin
sudo ln -s <path-to-ice-cpp-directory>/index.js ice-cpp
```

## Using

Make an executable (`debug\myapp.exe` in Windows, `debug/myapp.exe` in Linux):

```bash
ice-cpp exe:debug/myapp
```

Make a static library (`debug\mylib.lib` in Windows, `debug/mylib.a` in Linux):

```bash
ice-cpp lib:debug/mylib
```

Make an object file (`debug\main.obj` in Windows, `debug/main.o` in Linux):

```bash
ice-cpp o:debug/main
```
