{
  "targets": [
    {
      "target_name": "ps5controller",
      "sources": [ "ps5_controller_addon.cpp" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "./deps/SDL2/include"
      ],
      "libraries": [
        "../deps/SDL2/lib/SDL2.lib"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
      "msvs_settings": {
        "VCCLCompilerTool": {
          "ExceptionHandling": 1
        }
      },
      "product_dir": "../ps5controller/"
    }
  ]
}