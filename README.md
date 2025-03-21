# BetterMint Streamproof Analysis Window

streamproof analysis window. It shows deep engine analysis but doesn’t show up on your stream(could be discord stream or live yt/tw one) so whoever is watching you can’t see it only you can.

> **This isn’t the full BetterMint code. To add the analysis window, download the full project from the BetterMint GitHub and then follow this guide to modify it.**

- Join the BetterMint Discord: https://discord.gg/Z9gUAesu
- Check out the original BetterMint on GitHub: https://github.com/BotSolvers/BetterMint



  # How to Add This to BetterMint

1. Create `analysis-window.js` - The main script for the streamproof analysis window

2. Create `analysis.html` - for the analysis window UI


3. Add a new option to the `inputObjects` at the top.
```js
"option-show-analysis-window": { default_value: true },
```

Add this line at the end of loader.js next to the existing `injectScript` call.
```js
injectScript("js/analysis-window.js");
```

4. Update `manifest.json` -

Add the `analysis-window.js` to your `web_accessible_resources` in `manifest.json`.
should look like this:
```json
"web_accessible_resources": [
    {
        "resources": [
              "js/Mint.js",
              "js/analysis-window.js",
              "html/options.html",
              "html/analysis.html"
        ],
        "matches": [
            "https://*.chess.com/*"
        ]
    }
]
```

rn you can’t hide the "Analysis" button in settings — but that will be added in a future update (when I get the power to do that).



# How to Use It

Once it’s installed, you’ll see an "Analysis" button in the top-right corner on Chess.com.

Click it or press **Alt + A** to open the analysis window.

In that window, you can switch between:

Overlay mode: shows on top of Chess.com
Streamproof mode: opens a separate window (your stream won’t capture it)
