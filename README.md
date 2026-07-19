# Password Generator

A small static password generator app with:

- Secure random password generation
- Length control from 4 to 64 characters
- Uppercase, lowercase, number, and number-row symbol options
- Strength feedback
- Clipboard copy support

## Local Preview

```powershell
python -m http.server 8766
```

Then open `http://127.0.0.1:8766/`.

## Chrome Extension

1. Open `chrome://extensions`.
2. Turn on Developer Mode.
3. Choose **Load unpacked**.
4. Select this project folder.

The generator will open from the Chrome toolbar as a wide popup.
