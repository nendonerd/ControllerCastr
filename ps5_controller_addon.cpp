#include <napi.h>
#include <SDL.h>
#include <Windows.h>
#include <iostream>
#include <sstream>
#include <string>
#include <thread>
#include <atomic>
#include <chrono>

SDL_GameController* controller = nullptr;
Napi::ThreadSafeFunction tsfn;
std::atomic<bool> shouldRun(true);
std::string previousState;
std::atomic<bool> isConnected(false);

struct ControllerState {
    bool connected;
    int16_t leftStickX, leftStickY;
    int16_t rightStickX, rightStickY;
    int16_t leftTrigger, rightTrigger;
    bool square, cross, circle, triangle;
    bool L1, R1, L3, R3;
    bool share, options, ps;
    bool dpadUp, dpadDown, dpadLeft, dpadRight;
};

SDL_GameController* OpenController() {
    SDL_GameControllerUpdate();
    for (int i = 0; i < SDL_NumJoysticks(); ++i) {
        if (SDL_IsGameController(i)) {
            return SDL_GameControllerOpen(i);
        }
    }
    return nullptr;
}

ControllerState getControllerState() {
    ControllerState state = {};
    state.connected = false;

    if (!controller) {
        controller = OpenController();
    }

    if (controller && SDL_GameControllerGetAttached(controller)) {
        SDL_GameControllerUpdate();
        state.connected = true;

        state.leftStickX = SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_LEFTX);
        state.leftStickY = SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_LEFTY);
        state.rightStickX = SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_RIGHTX);
        state.rightStickY = SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_RIGHTY);
        state.leftTrigger = SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_TRIGGERLEFT);
        state.rightTrigger = SDL_GameControllerGetAxis(controller, SDL_CONTROLLER_AXIS_TRIGGERRIGHT);

        state.square = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_X);
        state.cross = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_A);
        state.circle = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_B);
        state.triangle = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_Y);
        state.L1 = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_LEFTSHOULDER);
        state.R1 = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_RIGHTSHOULDER);
        state.share = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_BACK);
        state.options = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_START);
        state.L3 = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_LEFTSTICK);
        state.R3 = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_RIGHTSTICK);
        state.dpadUp = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_UP);
        state.dpadDown = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_DOWN);
        state.dpadLeft = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_LEFT);
        state.dpadRight = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_DPAD_RIGHT);
        state.ps = SDL_GameControllerGetButton(controller, SDL_CONTROLLER_BUTTON_GUIDE);
    } else {
        if (controller) {
            SDL_GameControllerClose(controller);
            controller = nullptr;
        }
    }

    return state;
}

std::string serializeControllerState(const ControllerState& state) {
    std::stringstream ss;
    ss << state.connected << ","
       << state.leftStickX << "," << state.leftStickY << ","
       << state.rightStickX << "," << state.rightStickY << ","
       << state.leftTrigger << "," << state.rightTrigger << ","
       << state.square << "," << state.cross << "," << state.circle << "," << state.triangle << ","
       << state.L1 << "," << state.R1 << "," << state.L3 << "," << state.R3 << ","
       << state.share << "," << state.options << "," << state.ps << ","
       << state.dpadUp << "," << state.dpadDown << "," << state.dpadLeft << "," << state.dpadRight;

    return ss.str();
}

void ControllerThread(Napi::Env env) {
    while (shouldRun) {
        ControllerState state = getControllerState();
        std::string serializedState = serializeControllerState(state);

        if (serializedState != previousState || state.connected != isConnected) {
            previousState = serializedState;
            isConnected = state.connected;

            auto callback = [serializedState](Napi::Env env, Napi::Function jsCallback) {
                jsCallback.Call({Napi::String::New(env, serializedState)});
            };

            napi_status status = tsfn.BlockingCall(callback);
            if (status != napi_ok) break;
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(8)); // ~120 FPS
    }

    if (controller) {
        SDL_GameControllerClose(controller);
        controller = nullptr;
    }

    tsfn.Release();
}

Napi::Value StartControllerMonitoring(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Function callback = info[0].As<Napi::Function>();

    tsfn = Napi::ThreadSafeFunction::New(
        env,
        callback,
        "ControllerMonitor",
        0,
        1
    );

    std::thread controllerThread(ControllerThread, env);
    controllerThread.detach();

    return env.Undefined();
}

Napi::Value StopControllerMonitoring(const Napi::CallbackInfo& info) {
    shouldRun = false;
    return info.Env().Undefined();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    if (SDL_Init(SDL_INIT_GAMECONTROLLER) < 0) {
        Napi::Error::New(env, "SDL initialization failed").ThrowAsJavaScriptException();
        return exports;
    }

    exports.Set("startControllerMonitoring", Napi::Function::New(env, StartControllerMonitoring));
    exports.Set("stopControllerMonitoring", Napi::Function::New(env, StopControllerMonitoring));
    return exports;
}

NODE_API_MODULE(ps5controller, Init)