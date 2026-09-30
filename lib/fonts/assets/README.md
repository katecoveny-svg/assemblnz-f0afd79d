# Customer lockup font

`cormorant-garamond-normal.woff2` contains the complete, unsubsetted normal variable Cormorant Garamond font, version 4.001, weight axis 300–700. The two affected customer lockups continue to declare weights 500–600 and keep their existing CSS variables. It is the same version as the previously successful Google Fonts build. All Māori macrons are present.

Source: https://github.com/google/fonts/tree/main/ofl/cormorantgaramond
Original: `CormorantGaramond[wght].ttf`. Converted losslessly to the WOFF2 container using FontTools; no outlines, names, axes or character coverage changed. The original SIL OFL 1.1 licence is included as `CormorantGaramond-OFL.txt`.

This is a narrowly scoped build repair for the two observed failing loaders (`air-nz/ops` and `contact-energy`). It does not change Assembl's Instrument Sans/IBM Plex Mono brand system or the other customer font choices. Next's local font loader self-hosts the asset; those two faces no longer require a build-time Google stylesheet request.
