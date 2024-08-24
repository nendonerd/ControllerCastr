function parseControllerState(stateString) {
    let [
        connected,
        leftX, leftY, rightX, rightY, leftTrigger, rightTrigger,
        square, cross, circle, triangle,
        L1, R1, L3, R3,
        share, options, ps,
        dpadUp, dpadDown, dpadLeft, dpadRight
    ] = stateString.split(',').map(Number);

    // convert numbers to gamepad api compatible
    // leftX, leftY, rightX, rightY, leftTrigger, rightTrigger
    leftX = leftX / 32768
    leftY = leftY / 32768
    rightX = rightX / 32768
    rightY = rightY / 32768
    leftTrigger = leftTrigger / 32768
    rightTrigger = rightTrigger / 32768

    return {
        connected: Boolean(connected),
        leftStick: { x: leftX, y: leftY },
        rightStick: { x: rightX, y: rightY },
        triggers: { 
            left: {value: leftTrigger, pressed: leftTrigger > 0.25, touched: leftTrigger > 0}, 
            right: {value: rightTrigger, pressed: rightTrigger > 0.25, touched: rightTrigger > 0}
        },
        buttons: {
            square: {value: Number(square), pressed: Boolean(square), touched: Boolean(square)},
            cross: {value: Number(cross), pressed: Boolean(cross), touched: Boolean(cross)},
            circle: {value: Number(circle), pressed: Boolean(circle), touched: Boolean(circle)},
            triangle: {value: Number(triangle), pressed: Boolean(triangle), touched: Boolean(triangle)},
            L1: {value: Number(L1), pressed: Boolean(L1), touched: Boolean(L1)},
            R1: {value: Number(R1), pressed: Boolean(R1), touched: Boolean(R1)},
            L3: {value: Number(L3), pressed: Boolean(L3), touched: Boolean(L3)},
            R3: {value: Number(R3), pressed: Boolean(R3), touched: Boolean(R3)},
            share: {value: Number(share), pressed: Boolean(share), touched: Boolean(share)},
            options: {value: Number(options), pressed: Boolean(options), touched: Boolean(options)},
            ps: {value: Number(ps), pressed: Boolean(ps), touched: Boolean(ps)},
            dpadUp: {value: Number(dpadUp), pressed: Boolean(dpadUp), touched: Boolean(dpadUp)},
            dpadDown: {value: Number(dpadDown), pressed: Boolean(dpadDown), touched: Boolean(dpadDown)},
            dpadLeft: {value: Number(dpadLeft), pressed: Boolean(dpadLeft), touched: Boolean(dpadLeft)},
            dpadRight: {value: Number(dpadRight), pressed: Boolean(dpadRight), touched: Boolean(dpadRight)},
        }
    };
}

function updateDisplay(state) {
    console.log('updating?')
    let gamepadId = 0

    tester.queueButton(state.buttons.L1, gamepadId, 'button-left-shoulder-top');
    tester.queueTrigger(state.triggers.left, gamepadId, 'button-left-shoulder-bottom');
    tester.queueTriggerDigital(state.triggers.left, gamepadId, 'button-left-shoulder-bottom-digital');
    tester.queueButton(state.buttons.R1, gamepadId, 'button-right-shoulder-top');
    tester.queueTrigger(state.triggers.right, gamepadId, 'button-right-shoulder-bottom');
    tester.queueTriggerDigital(state.triggers.right, gamepadId, 'button-right-shoulder-bottom-digital');

    tester.queueButton(state.buttons.share, gamepadId, 'button-select');
    tester.queueButton(state.buttons.options, gamepadId, 'button-start');

    tester.queueButton(state.buttons.L3, gamepadId, 'stick-1');
    tester.queueButton(state.buttons.R3, gamepadId, 'stick-2');

    tester.queueButton(state.buttons.dpadUp, gamepadId, 'button-dpad-top');
    tester.queueButton(state.buttons.dpadDown, gamepadId, 'button-dpad-bottom');
    tester.queueButton(state.buttons.dpadLeft, gamepadId, 'button-dpad-left');
    tester.queueButton(state.buttons.dpadRight, gamepadId, 'button-dpad-right');
    tester.queueButton(state.buttons.ps, gamepadId, 'button-meta');
    // tester.queueButton(gamepad.buttons[17], gamepadId, 'touch-pad');

    tester.queueButton(state.buttons.cross, gamepadId, 'button-1');
    tester.queueButton(state.buttons.circle, gamepadId, 'button-2');
    tester.queueButton(state.buttons.square, gamepadId, 'button-3');
    tester.queueButton(state.buttons.triangle, gamepadId, 'button-4');
    // Update all the analogue sticks.
    tester.queueAxis(state.leftStick.x, state.leftStick.y, gamepadId, 'stick-1');
    tester.queueAxis(state.rightStick.x, state.rightStick.y, gamepadId, 'stick-2');
}

function addLogMessage(message) {
    console.log(message); // log to the console
}

let previousState = null;

window.electronAPI.onControllerState((stateString) => {
    const state = parseControllerState(stateString);

    if (state.connected) {
        if (!previousState) {
            addLogMessage("Controller connected");
        } else {
            updateDisplay(state)
            if (state.leftStick.x !== previousState.leftStick.x || state.leftStick.y !== previousState.leftStick.y) {
                
                addLogMessage(`Left stick moved: (${state.leftStick.x}, ${state.leftStick.y})`);
            }
            if (state.rightStick.x !== previousState.rightStick.x || state.rightStick.y !== previousState.rightStick.y) {
                addLogMessage(`Right stick moved: (${state.rightStick.x}, ${state.rightStick.y})`);
            }
            if (state.triggers.left.value !== previousState.triggers.left.value) {
                addLogMessage(`Left trigger: ${state.triggers.left.value}`);
            }
            if (state.triggers.right.value !== previousState.triggers.right.value) {
                addLogMessage(`Right trigger: ${state.triggers.right.value}`);
            }
            for (const [button, info] of Object.entries(state.buttons)) {
                if (info.pressed && !previousState.buttons[button].pressed) {

                    addLogMessage(`${button} button pressed`);
                } else if (!info.pressed && previousState.buttons[button].pressed) {
                    addLogMessage(`${button} button released`);
                }
            }
        }

        previousState = state;
    } else {
        addLogMessage("PS5 Controller not connected. Attempting to reconnect...");
        if (previousState && previousState.connected) {
            addLogMessage("Controller disconnected");
        }
        previousState = null;
    }
});