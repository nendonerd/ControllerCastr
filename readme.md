[![Demo](https://img.youtube.com/vi/0qWYM3pRHVw/maxresdefault.jpg)](https://youtu.be/0qWYM3pRHVw)

# ControllerCastr

A desktop application that allows you to monitor and display input from a gaming controller in real-time.

Currently only supports PS5 controller on Windows PC. Works in Black Myth: Wukong, might work in other games as well.

## Usage

1. Download the app and run it
2. Drag the app to move it around
3. Hit "-" to shrink the app, hit "=" to expand the app
4. Alt+F4 or right click its icon on taskbar to exit

## How it works

The project use Electron as UI, and use SDL2 to fetch controller data. Because SDL2 reads data directly from hid devices, it will work even if the game has locked the access to the controller. Since SDL2 is multi platform, Mac and Linux support is possible.

## Why not use gamepadviewer?

gamepadviewer use gamepad api from browser to fetch controller data. It won't work in most 3A games since they have been granted exclusive access to the controller.

## Quirks

1. the app might not stay on top of some games
2. the app only supports pc now, but you can stream ps5 into pc and use the app as well

## License

This project uses the following license: [MIT](link_to_license).

# ControllerCastr

一个桌面应用程序，可以实时监控并显示游戏手柄的输入。

目前仅支持在 Windows PC 上使用 PS5 手柄。已在《黑神话：悟空》上测试通过，可能也适用于其他游戏。

## 使用方法

1. 下载并运行该应用程序
2. 拖动应用程序窗口可以移动位置
3. 按 "-" 可以缩小窗口，按 "=" 可以放大窗口
4. 按 Alt+F4 或右键点击任务栏图标退出应用程序

## 工作原理

该项目使用 Electron 作为用户界面，并使用 SDL2 获取手柄数据。由于 SDL2 直接从 HID 设备读取数据，即使游戏已经独占了手柄的访问权限，应用程序仍然可以正常工作。因为 SDL2 是跨平台的，未来可能会支持 Mac 和 Linux。

## 为什么不使用 gamepadviewer？

gamepadviewer 使用浏览器中的 gamepad API 来获取手柄数据。在大多数 3A 游戏中，这种方式无法工作，因为游戏已经独占了手柄的访问权限。

## 注意事项

1. 该应用程序可能无法在一些游戏中保持在最前端
2. 目前应用程序仅支持 PC，但你可以将 PS5 的画面串流到 PC 并使用该应用程序

## 许可证

该项目使用以下许可证：[MIT](link_to_license)。
