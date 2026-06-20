> 中文: ./ADDONS.md

# Addons

The home is always **six rooms**. The seventh, the eighth… don't squeeze into the
grid — they're **addons**, appearing as small backstage-style text links at the
bottom. When the user wants one, they tick it into the six (swapping an old room
out) from `/backstage/settings`.

> In one line: the six cards are the showcase; everything else is bottom text.
> Hard cap on cards is 6.

---

## How it works

Three files are the whole thing:

```
src/lib/room-blocks.ts            ← registry + slot resolution (client-safe)
src/lib/room-layout-actions.ts    ← server action that writes the kimi-room-layout cookie
src/components/backstage/RoomLayoutEditor.tsx  ← the ticking panel in /settings
```

- **Registry** `ROOM_BLOCKS`: one line per window, `{ id, href, name, sub, defaultSlot }`.
  `defaultSlot` is `"tile"` (defaults into the six) or `"link"` (defaults to the
  bottom = addon).
- **Only two slots**: `tile` (a card, up to `MAX_TILES = 6`) / `link` (bottom text).
  A window not ticked into a card is automatically a `link` — there is no "hidden".
- **Persistence**: the user's choice lives in the `kimi-room-layout` cookie (an
  `id:slot` list, read server-side, **no flicker** — same machinery as the theme
  toggle). A new window that's in the registry but not in the cookie falls into
  place by its `defaultSlot`; no cookie clearing needed.
- **The hard cap of 6** is enforced in two places: the 7th can't be ticked in the
  panel; and even if the cookie is hand-edited to 7 tiles, `resolveRoom()` only
  takes the first 6 as cards and drops the rest to the bottom.

`/room/page.tsx` calls `resolveRoom(cookie)` to get `{ tiles, links }`: tiles render
as cards (Roman numerals re-numbered dynamically in order), links render as bottom
text.

---

## Writing an addon

1. Create the route: `src/app/room/<id>/page.tsx` (drawing/components in `src/components/<id>/`).
2. Don't wire data to a private DB — ship demo data (see `src/lib/atlas-demo.ts`),
   or use the pluggable adapter in `src/lib/stores/`.
3. Add one line to `ROOM_BLOCKS`; an addon uses `defaultSlot: "link"`:

   ```ts
   { id: "atlas", href: "/room/atlas", name: "Atlas", sub: "& PASSAGE", defaultSlot: "link" },
   ```

Done. It shows up automatically in the bottom links; if the user wants it, they
tick it into the six in /settings and swap an old room out.

> Next routes are filesystem-static, so an addon = "code shipped in the repo, the
> user assembles it," not runtime installation of a third-party package. Real
> third-party plugins would need a separate plugin convention — this repo doesn't
> do that.

---

## Built-in addon: Atlas

`/room/atlas` — the "open-the-window" drawing of a travel log. The first view is an
iron-tracery arched window (a center rose latch; open it to see the image), with
three hand-drawn icons top-right switching timeline / fragment cabinet / old map.

- Drawing (pure SVG, colors all from the room's day/night palette):
  `src/components/atlas/ArchWindow.tsx` (arched window), `glyphs.tsx` (leaf/cloud/
  fragment-card), `AtlasClient.tsx` (the four views + rose).
- Data: `src/lib/atlas-demo.ts`, one static demo (five fictional places).
  Swap in your own source (DB / MDX / API); the drawing doesn't change — set
  `imageUrl` to any image (e.g. a Wikimedia public-domain painting) and the
  "open-the-window" reveals the real image.

Atlas defaults to a bottom link (addon). To make it the 7th-becomes-6th room, tick
it in /settings and move some room to the bottom.

---

## What changed (this changeset)

Added:

```
src/components/atlas/ArchWindow.tsx          arched window drawing
src/components/atlas/glyphs.tsx              fragment/leaf/cloud SVG
src/components/atlas/AtlasClient.tsx         four-view client
src/lib/atlas-demo.ts                        Atlas demo data + types
src/app/room/atlas/page.tsx                  /room/atlas route (feeds the demo)
src/lib/room-blocks.ts                       window registry + slot resolution + cap of 6
src/lib/room-layout-actions.ts               server action writing the layout cookie
src/components/backstage/RoomLayoutEditor.tsx  the /settings ticking panel
ADDONS.md                                    this file
```

Changed:

```
src/app/room/page.tsx                        cards + bottom links now registry-driven (was 6 hard-coded lines)
src/app/backstage/(protected)/settings/page.tsx  mounts the "room layout" panel
```
