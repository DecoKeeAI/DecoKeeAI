import {uIOhook, UiohookKey} from "uiohook-napi";

export function commonFocus(styleName, keyInputHandler) {
  document.body.style.setProperty(styleName, '1px solid #fff')
  uIOhook.addListener('keydown', keyInputHandler);
  uIOhook.addListener('keyup', keyInputHandler);
  uIOhook.start();
  return this.$t('observingKeys')
}
export function commonBlur(styleName, keyInputHandler) {
  uIOhook.removeListener('keydown', keyInputHandler);
  uIOhook.removeListener('keyup', keyInputHandler);
  uIOhook.stop();
  document.body.style.setProperty(styleName, 'none')
  return this.$t('hotkeyMatching')
}
export function transferKeyName(keyEvent) {
  console.log('transferKeyName: for ', keyEvent);
  let key = String.fromCharCode(keyEvent.keycode);
  switch (keyEvent.keycode) {
    case UiohookKey.Shift:
      key = 'shift';
      break;
    case UiohookKey.ShiftRight:
      key = 'right_shift';
      break;
    case UiohookKey.Ctrl:
      key = 'control';
      break;
    case UiohookKey.CtrlRight:
      key = 'right_control';
      break;
    case UiohookKey.Alt:
      key = 'alt';
      break;
    case UiohookKey.AltRight:
      key = 'right_alt';
      break;
    case UiohookKey.Meta:
    case UiohookKey.MetaRight:
      key = 'command';
      break;
    case UiohookKey.ArrowUp:
    case UiohookKey.NumpadArrowUp:
      key = 'up';
      break;
    case UiohookKey.ArrowDown:
    case UiohookKey.NumpadArrowDown:
      key = 'down';
      break;
    case UiohookKey.ArrowLeft:
    case UiohookKey.NumpadArrowLeft:
      key = 'left';
      break;
    case UiohookKey.ArrowRight:
    case UiohookKey.NumpadArrowRight:
      key = 'right';
      break;
    case UiohookKey.Backspace:
      key = 'backspace';
      break
    case UiohookKey.Space:
      key = 'space';
      break
    case UiohookKey.Delete:
    case UiohookKey.NumpadDelete:
      key = 'delete';
      break;
    case UiohookKey.Enter:
    case UiohookKey.NumpadEnter:
      key = 'enter';
      break;
    case UiohookKey.Tab:
      key = 'tab';
      break;
    case UiohookKey.Escape:
      key = 'escape';
      break;
    case UiohookKey.Home:
    case UiohookKey.NumpadHome:
      key = 'home';
      break;
    case UiohookKey.End:
    case UiohookKey.NumpadEnd:
      key = 'end';
      break;
    case UiohookKey.PageUp:
    case UiohookKey.NumpadPageUp:
      key = 'pageup';
      break;
    case UiohookKey.PageDown:
    case UiohookKey.NumpadPageDown:
      key = 'pagedown';
      break;
    case UiohookKey.Insert:
    case UiohookKey.NumpadInsert:
      key = 'insert';
      break;
    case UiohookKey.PrintScreen:
      key = 'printscreen';
      break;
    case UiohookKey.CapsLock:
      key = 'capslock';
      break;
    case 'ContextMenu':
      key = 'menu';
      break;
    case UiohookKey["0"]:
      key = '0';
      break;
    case UiohookKey["1"]:
      key = '1';
      break;
    case UiohookKey["2"]:
      key = '2';
      break;
    case UiohookKey["3"]:
      key = '3';
      break;
    case UiohookKey["4"]:
      key = '4';
      break;
    case UiohookKey["5"]:
      key = '5';
      break;
    case UiohookKey["6"]:
      key = '6';
      break;
    case UiohookKey["7"]:
      key = '7';
      break;
    case UiohookKey["8"]:
      key = '8';
      break;
    case UiohookKey["9"]:
      key = '9';
      break;
    case UiohookKey.A:
      key = 'a';
      break;
    case UiohookKey.B:
      key = 'b';
      break;
    case UiohookKey.C:
      key = 'c';
      break;
    case UiohookKey.D:
      key = 'd';
      break;
    case UiohookKey.E:
      key = 'e';
      break;
    case UiohookKey.F:
      key = 'f';
      break;
    case UiohookKey.G:
      key = 'g';
      break;
    case UiohookKey.H:
      key = 'h';
      break;
    case UiohookKey.I:
      key = 'i';
      break;
    case UiohookKey.J:
      key = 'j';
      break;
    case UiohookKey.K:
      key = 'k';
      break;
    case UiohookKey.L:
      key = 'l';
      break;
    case UiohookKey.M:
      key = 'm';
      break;
    case UiohookKey.N:
      key = 'n';
      break;
    case UiohookKey.O:
      key = 'o';
      break;
    case UiohookKey.P:
      key = 'p';
      break;
    case UiohookKey.Q:
      key = 'q';
      break;
    case UiohookKey.R:
      key = 'r';
      break;
    case UiohookKey.S:
      key = 's';
      break;
    case UiohookKey.T:
      key = 't';
      break;
    case UiohookKey.U:
      key = 'u';
      break;
    case UiohookKey.V:
      key = 'v';
      break;
    case UiohookKey.W:
      key = 'w';
      break;
    case UiohookKey.X:
      key = 'x';
      break;
    case UiohookKey.Y:
      key = 'y';
      break;
    case UiohookKey.Z:
      key = 'z';
      break;
    case UiohookKey.F1:
      key = 'f1';
      break;
    case UiohookKey.F2:
      key = 'f2';
      break;
    case UiohookKey.F3:
      key = 'f3';
      break;
    case UiohookKey.F4:
      key = 'f4';
      break;
    case UiohookKey.F5:
      key = 'f5';
      break;
    case UiohookKey.F6:
      key = 'f6';
      break;
    case UiohookKey.F7:
      key = 'f7';
      break;
    case UiohookKey.F8:
      key = 'f8';
      break;
    case UiohookKey.F9:
      key = 'f9';
      break;
    case UiohookKey.F10:
      key = 'f10';
      break;
    case UiohookKey.F11:
      key = 'f11';
      break;
    case UiohookKey.F12:
      key = 'f12';
      break;
    case UiohookKey.F13:
      key = 'f13';
      break;
    case UiohookKey.F14:
      key = 'f14';
      break;
    case UiohookKey.F15:
      key = 'f15';
      break;
    case UiohookKey.F16:
      key = 'f16';
      break;
    case UiohookKey.F17:
      key = 'f17';
      break;
    case UiohookKey.F18:
      key = 'f18'
      break;
    case UiohookKey.F19:
      key = 'f19';
      break;
    case UiohookKey.F20:
      key = 'f20';
      break;
    case UiohookKey.F21:
      key = 'f21';
      break;
    case UiohookKey.F22:
      key = 'f22';
      break;
    case UiohookKey.F23:
      key = 'f23';
      break;
    case UiohookKey.F24:
      key = 'f24';
      break;
    case UiohookKey.NumLock:
      key = 'numpad_lock';
      break;
    case UiohookKey.Numpad0:
      key = 'numpad_0';
      break;
    case UiohookKey.Numpad1:
      key = 'numpad_1';
      break;
    case UiohookKey.Numpad2:
      key = 'numpad_2';
      break;
    case UiohookKey.Numpad3:
      key = 'numpad_3';
      break;
    case UiohookKey.Numpad4:
      key = 'numpad_4';
      break;
    case UiohookKey.Numpad5:
      key = 'numpad_5';
      break;
    case UiohookKey.Numpad6:
      key = 'numpad_6';
      break;
    case UiohookKey.Numpad7:
      key = 'numpad_7';
      break;
    case UiohookKey.Numpad8:
      key = 'numpad_8';
      break;
    case UiohookKey.Numpad9:
      key = 'numpad_9';
      break;
    case UiohookKey.NumpadAdd:
      key = 'numpad_+';
      break;
    case UiohookKey.NumpadSubtract:
      key = 'numpad_-';
      break;
    case UiohookKey.NumpadMultiply:
      key = 'numpad_*';
      break;
    case UiohookKey.NumpadDivide:
      key = 'numpad_/';
      break;
    case UiohookKey.NumpadDecimal:
      key = 'numpad_.';
      break;
    case UiohookKey.Semicolon:
      key = ';';
      break;
    case UiohookKey.Equal:
      key = '=';
      break;
    case UiohookKey.Comma:
      key = ',';
      break;
    case UiohookKey.Minus:
      key = '-';
      break;
    case UiohookKey.Period:
      key = '.';
      break;
    case UiohookKey.Slash:
      key = '/';
      break;
    case UiohookKey.Backquote:
      key = "·";
      break;
    case UiohookKey.Quote:
      key = "'";
      break;
    case UiohookKey.BracketLeft:
      key = "[";
      break;
    case UiohookKey.Backslash:
      key = "\\";
      break;
    case UiohookKey.BracketRight:
      key = "]";
      break;
  }
  return key;
}
export function handleKeyUserInput(keyName, displayText, keyHandler) {

  if (displayText === this.$t('observingKeys')) {
    displayText = '';
  }
  let isEndKey = true;
  const isSpecialKey = keyName === 'shift' || keyName === 'control' || keyName === 'alt' || keyName === 'command'

  if (isSpecialKey && displayText.includes(keyName)) {
    displayText = displayText.replace(`${keyName}+`, '');
    if (displayText === '') {
      displayText = this.$t('observingKeys');
    }

    return {
      displayText: displayText,
      haveValidKeyInput: false
    };
  }
  displayText += keyName

  if (isSpecialKey) {
    isEndKey = false;
    displayText += '+';
  }

  let haveValidKeyInput = false;

  if (isEndKey) {
    window.removeEventListener('keydown', keyHandler);
    document.body.style.setProperty('--borderColor', 'none')
    haveValidKeyInput = displayText !== this.$t('observingKeys') && displayText !== this.$t('hotkeyMatching');
  }

  return {
    displayText: displayText,
    haveValidKeyInput: haveValidKeyInput
  };
}
