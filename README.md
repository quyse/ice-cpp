# ice-cpp

## Preparation

```
mkdir node_modules
cd node_modules
ln -s <path-to-ice-directory> ice
cd /usr/bin
sudo ln -s <path-to-ice-cpp-directory>/index.js ice-cpp
```

## Using

Make executable (`debug\myapp.exe` in Windows, `debug/myapp.exe` in Linux):
```
ice-cpp exe:debug/myapp
```

Make static library (`debug\mylib.lib` in Windows, `debug/mylib.a` in Linux):
```
ice-cpp lib:debug/mylib
```

Make object file (`debug\main.obj` in Windows, `debug/main.o` in Linux):
```
ice-cpp o:debug/main
```
