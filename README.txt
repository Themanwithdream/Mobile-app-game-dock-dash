DOCK DASH — APP ICON AND MANIFEST PACKAGE

This folder contains the current game with its app identity connected.
Upload the CONTENTS of this folder to your website's publishing folder.
Keep index.html and manifest.webmanifest together and keep the icons folder.
Relative paths work at a website root or a subfolder such as /dock-dash/.

Launch settings:
- App name: Dock Dash
- Standalone window: hides the browser address bar when installed
- Portrait orientation preference (some browsers, including iOS, may ignore it)
- Dark navy launch background and theme: #101c23
- Start page: index.html
- App scope and identity: this hosting folder

Icons:
- icons/icon-192.png: standard 192px web app icon
- icons/icon-512.png: standard 512px web app icon
- icons/icon-maskable-512.png: extra padding for Android icon masks
- icons/apple-touch-icon.png: 180px iPhone Home Screen icon
- icons/icon-master.png: large source artwork

The supplied index.html already links the manifest and iPhone icon.
You do not need to manually paste the included head-snippet.html into it.
The snippet is for connecting these assets to another copy of the game.

After publishing on HTTPS, open the link in iPhone Safari and choose:
Share > Add to Home Screen > Open as Web App (if shown) > Add.
On Android, use your browser's Install app or Add to Home screen action.

This package adds icons and launch settings. It does NOT include a service
worker or reliable offline reopening of the hosted app. Offline installation
support is a separate next step. App installation UI varies by browser.
Existing scores remain stored locally; a new hosting address or installed
app may have separate saved progress from your original downloaded file.

Artwork: created with the built-in image-generation tool. Prompt concept:
Glossy golden delivery parcel with white lightning sticker and orange speed
trails on a midnight navy background, simple silhouette and no lettering.
