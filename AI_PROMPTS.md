# AI Chat Prompts & Usage Guide

Complete prompt library for the Aedifex AI Design Assistant. Every prompt below
is ready to use — open the chat, paste it (or edit the parts in `[brackets]`),
and press Enter.

---

## 1. How the AI chat works (read this first)

| Step | What happens |
|---|---|
| 1. Open | Click the **Bot icon** in the left sidebar rail → "AI Design Assistant" panel opens. |
| 2. Ask | Type in any language (English / Hindi / Chinese / Japanese — the AI replies in YOUR language). Press **Enter** to send. |
| 3. Plan | For big requests the AI first shows a **plan** with buttons like `Proceed with this plan` / `Modify` — click one. Small requests execute directly. |
| 4. Execute | Each change appears as an **operation card** (`+ Add wall`, etc.) with **Confirmed** status, plus a **Before / After screenshot slider**. |
| 5. Fix | Every card has an **Undo** button. The bottom of the panel has **Operation History** and **Clear chat**. |
| 6. Errors | If the model is busy you get an error banner with a **Retry** button — one click re-sends your last message. Nothing is lost. |

**Views**: everything works in both **3D** and **2D** (top toolbar). 2D is best
for drawing floor plans; 3D for furniture and materials. Switch anytime — the
scene is shared.

**Units**: all dimensions are **meters**. Positions are `[x, y, z]`, y is up.

---

## 2. Quick-start prompts (same as the chat suggestion buttons)

```
Create a one-bedroom apartment floor plan
Build a rectangular two-bedroom house plan
Add a door and windows to the walls
Furnish the living room with a sofa and coffee table
Help me furnish a bedroom
Rearrange the furniture
```

Clicking a suggestion button fills the input box — edit it if you want, then
press Enter.

---

## 3. FULL DESIGN prompts — build a complete home in one message

Copy-paste one of these. The AI shows a staged plan first → click
**Proceed with this plan** → it builds step by step (walls → doors/windows →
furniture → materials), asking confirmation between stages. Each stage has an
Undo button, so you can roll back anything.

### 3.0 MASTER PROMPTS — the best & longest (full project in one message)

**★ 3D MASTER — Complete 2-storey luxury villa, fully furnished & finished** 
*(The single best prompt in this file. ~15–20 min, staged with confirmations.)*

```
Build a complete two-storey luxury villa and execute it stage by stage, asking me to confirm between stages. Building footprint 14m x 10m centered at the origin, wall height 3m, thickness 0.2m.

Stage 1 — Level 0 structure: 14m x 10m outer walls. Main double door 1.6m wide on the south wall center into a foyer 3x3. Living room 6x5 in the southwest with two 2m windows on the south wall and one on the west wall. Open kitchen 4x4 in the northwest with one 1.5m window. Dining area 4x4 in the northeast with one 1.5m window. Guest bedroom 4x3 in the east with one window on the east wall. Bathroom 2x2.5 between the guest bedroom and foyer. A straight staircase 1.2m wide along the north wall of the living room going up to Level 1 with a destination slab opening. Interior doors from the foyer to the living room and guest bedroom, and a bathroom door from the corridor. Floor slab and 2.8m ceiling for the whole footprint.

Stage 2 — Level 1 structure: same 14m x 10m footprint. Master bedroom 5x4 in the southwest with attached bathroom 2x2.5 and a walk-in wardrobe 2x2. Two children's bedrooms 4x3.5 each on the east side, every bedroom gets one 1.5m window on the outer wall. Study 3x3 in the northwest with one window. A corridor 1.2m wide connecting the stair landing to every room, with interior doors for each room. Slab and ceiling on Level 1.

Stage 3 — Furnishing Level 0: living room with a 3-seat sofa, two armchairs, a coffee table, a TV stand against the north wall and a floor lamp in the corner; kitchen with a refrigerator, kitchen counter cabinets and a sink; dining area with a 6-seat dining table centered under a ceiling lamp; guest bedroom with a double bed, one nightstand and a wardrobe; bathroom with a toilet, sink and shower.

Stage 4 — Furnishing Level 1: master bedroom with a king bed, two nightstands, a wardrobe and a bench at the foot of the bed; its bathroom with a toilet, sink and bathtub; both children's rooms with a single bed, a desk with an office chair, a bookshelf and a wardrobe each; study with a desk, office chair, two bookshelves and an armchair.

Stage 5 — Materials and lighting: warm oak wooden flooring on both levels, cream-colored interior walls, white ceilings, one warm ceiling light in every room and corridor.

Stage 6 — Roof and exterior: a gable roof over the whole villa with 0.5m overhang, a chimney on the south slope, and two skylights above the corridor. Dark grey roof shingles.

Stage 7 — Garden and outdoors: a wooden privacy fence around the whole 24m x 18m site with a 1.5m gate opening aligned to the main door. Inside the garden only: four trees in the corners, a garden bench near the front door, three path lights along the walkway from the gate to the entrance, and a small fountain in the front lawn.

When every stage is complete, give me a full summary of everything built and then enter walkthrough mode.
```

**★ 2D MASTER — Complete 3BHK architectural floor plan** 
*(Best for the 2D view. Structure only — dimensions for every room.)*

```
Create a complete 3BHK apartment floor plan, executed in stages: walls first, then doors and windows, then the slab. Outer walls 14m x 10m, thickness 0.2m, centered at the origin.

Rooms and interior walls: living room 5x5 in the southwest with the main 1.4m door on the south wall and a 2.4m balcony window on the west wall. Kitchen 3.5x4 in the northwest with one 1.5m window on the north wall. Dining 3.5x3 in the north center between kitchen and living. Master bedroom 4.5x4 in the northeast with one window on the north wall and an attached bathroom 2x2 in its southwest corner. Bedroom 2 with size 3.5x3.5 in the southeast with one window on the east wall. Bedroom 3 with size 3x3 in the south center with one window on the south wall. Common bathroom 2x2.5 between bedroom 2 and bedroom 3. A corridor 1.2m wide from the living room connecting the master bedroom, bedroom 2, bedroom 3 and the common bathroom.

Doors: interior doors 0.9m wide from the corridor into every bedroom and both bathrooms, a 0.9m kitchen door from the dining area, and a 0.8m door between the master bedroom and its attached bathroom. Windows: one 1.5m window in bedroom 2 and bedroom 3 on their outer walls, plus all the windows listed above. Finish with a floor slab and 2.8m ceiling over the full 14m x 10m footprint, then give me a summary table of every room with its area.
```

**Master-prompt tips**
- Change any number freely — sizes, room count, window widths, roof type. Every number is honored exactly.
- Keep the `stage by stage` wording — it makes the AI confirm between stages so you can Undo early mistakes cheaply.
- If you want it faster, delete the garden/furnishing stages — Stage 1+2 alone give you the full house shell in ~4 min.

### 3.1 2D — complete floor plans (structure only: walls, doors, windows)

Best used in the **2D view**. Edit the room sizes/positions freely.

**A) 1BHK apartment — 8m × 6m (beginner, ~1 min)**

```
Create a one-bedroom apartment floor plan: 8m x 6m outer walls centered at the origin. Interior wall dividing a 3m-wide bedroom on the east side from the living area. A front door on the south wall in the living area, a door on the bedroom partition wall, and two 1.5m windows on the north wall — one for each room. Floor slab and ceiling for the full footprint.
```

**B) 2BHK apartment — 12m × 8m (classic family layout)**

```
Create a 2-bedroom apartment floor plan, 12m x 8m outer walls: living room 5x4 with the main door on the south wall and two windows on the north wall; kitchen 3x4 in the northwest corner with one window; master bedroom 4x4 in the northeast with a window and wardrobe wall; second bedroom 4x3 in the southeast with a window; two bathrooms 2x2 side by side on the south side between the bedrooms, one with a shower and one with a toilet and sink; interior doors for every room from a small central corridor. Add the floor slab and ceiling for the full footprint.
```

**C) 2-storey house plan — 10m × 8m per floor (with staircase)**

```
Create a two-storey house floor plan: Level 0 with 10m x 8m outer walls containing a living room 5x5, kitchen 4x4 with window, guest bedroom 4x3 with window, a bathroom 2x2, main door on the south wall and a straight staircase along the east wall going up to Level 1. Then add Level 1 with the same footprint containing a master bedroom 5x4 with attached bathroom 2x2, a study 3x3 with window, and a small corridor connecting to the stair landing. Doors and windows for every room, slab and ceiling on both levels.
```

**D) Home office / studio — 6m × 5m**

```
Create a home office floor plan: 6m x 5m outer walls. An L-shaped desk zone along the north and west walls (just walls, no furniture in this step), a 1m wide door on the south wall, two large windows 2m wide on the east wall, and a small storage room 2x2 in the southwest corner with a door. Slab and ceiling included.
```

**E) Small café — 10m × 6m**

```
Create a small café floor plan: 10m x 6m outer walls. Customer area 7x6 with the entrance door on the south wall and three 2m windows on the north wall; a service counter zone 3m wide across the east side separated by an interior wall with a pass-through opening; a restroom 2x2 and a storage room 2x3 in the back southwest corner, both with doors. Slab and ceiling for the full footprint.
```

### 3.2 3D — complete designs (structure + furniture + materials + walkthrough)

Best used in the **3D view**. These prompts furnish and finish the whole design,
then drop you into first-person walkthrough mode.

**A) Complete 1BHK home, fully furnished (~5–10 min)**

```
Build a complete one-bedroom home and execute it stage by stage: Stage 1 — 8m x 6m outer walls, a bedroom partition wall for a 3m-wide bedroom on the east, front door on the south wall, two windows on the north wall, slab and ceiling. Stage 2 — furnish the living area with a sofa, coffee table, TV stand and a floor lamp against the walls; furnish the bedroom with a double bed, two nightstands and a wardrobe. Stage 3 — wooden oak flooring, white interior walls, a warm ceiling light in each room. When everything is done, enter walkthrough mode.
```

**B) Two-storey house with stairs and roof (~10–15 min)**

```
Build a complete two-storey house stage by stage: Stage 1 — Level 0 with 10m x 8m walls: living room 5x5, kitchen 4x4, guest bedroom 4x3, bathroom 2x2, main door south, windows north, and a straight staircase to Level 1 with a slab opening. Stage 2 — Level 1: master bedroom 5x4 with attached bathroom, study 3x3, corridor to the stair landing, doors and windows throughout. Stage 3 — furnish the living room (sofa, coffee table, TV stand), kitchen (dining table with 4 chairs, refrigerator), both bedrooms (beds, nightstands, wardrobes). Stage 4 — a gable roof over the whole house with a chimney. Stage 5 — light wooden floors, cream walls, warm lighting, then enter walkthrough mode.
```

**C) Modern office floor, 15m × 10m (~10 min)**

```
Build a modern open office stage by stage: Stage 1 — 15m x 10m outer walls with a glass double door on the south wall, six windows along the north wall, two interior meeting rooms 4x3 each in the northeast and northwest corners with glass-friendly doors, slab and ceiling. Stage 2 — furnish the open area with four work desks in a row with office chairs, a lounge corner with two armchairs and a coffee table, bookshelves along the west wall; each meeting room with a conference table, four chairs and a whiteboard. Stage 3 — polished concrete floors, light grey walls, ceiling lights in a grid. Finish with walkthrough mode.
```

**D) House + garden scene (indoor & outdoor)**

```
Build a small house with a garden stage by stage: Stage 1 — 8m x 7m house: living room, bedroom, bathroom, kitchen, front door, windows, slab and ceiling. Stage 2 — furnish all rooms simply (sofa set, bed, dining table with chairs). Stage 3 — a gable roof and a wooden fence around the whole 20m x 15m site with a gate opening at the front. Stage 4 — outdoor items only in the garden: three trees, a garden bench near the house, two path lights along the walkway to the front door. Then enter walkthrough mode.
```

**E) Basement + ground floor + elevator (3 levels)**

```
Build a three-level building stage by stage: a 12m x 9m building with Level 0 as a lobby, a 3m deep basement parking level, and Level 1 as an office floor. Connect all levels with an elevator in the center plus a straight staircase as backup. Windows on every above-ground level, slab and ceiling everywhere, light interior walls. When done, enter walkthrough mode.
```

### 3.3 How the full-design flow goes (what you'll see)

1. AI replies with a **staged plan** → click `Proceed with this plan`.
2. Operation cards stream in stage by stage (`+ Add wall ×4` … `+ Add door ×2` …), each auto-confirmed with before/after screenshots.
3. Between furniture stages the AI may ask "furnish the next room?" — one click to continue.
4. Final message summarizes everything (often with a table + ASCII floor plan).
5. `enter walkthrough mode` at the end switches you to first-person view (Esc to exit).

If any step places something wrong: **Undo** that card, then say exactly what to
change ("move the sofa 1m west").

---

## 4. Prompt library by category

### 4.1 Floor plans & walls

| Prompt | What the AI does |
|---|---|
| `Create a square room with 4 walls, 5 meters on each side` | Draws a 5×5 m room. |
| `Add a wall from [0,0] to [5,0]` | Single wall with exact coordinates. |
| `Make this wall 3.5 meters high` / `Make all walls 20cm thick` | Updates wall height/thickness. |
| `Remove the wall between the kitchen and living room` | Removes it (asks first for bulk removals). |
| `Add a curved wall from [0,0] to [4,0]` | Uses `curveOffset` for an arc. |

**Tips**
- Describe rooms by **size + side**: "bedroom 4x4 on the east side" → the AI computes wall coordinates for you.
- Doors/windows are added **after** walls in a second step — the AI does this itself, just ask normally.
- Say **exact quantities** ("two windows", not "some windows") — the AI adds exactly what you asked.

### 4.2 Doors & windows

| Prompt | What the AI does |
|---|---|
| `Add a front door on the south wall` | Places a door centered on that wall. |
| `Add a door on the bedroom partition wall` | Connects the two rooms. |
| `Add two windows on the north wall, 1.5m wide` | Two windows with size. |
| `Make the front door 1.2m wide` / `Move the window 1m to the left` | Updates openings. |
| `Remove the window in the bathroom` | Removes it. |

### 4.3 Furniture

| Prompt | What the AI does |
|---|---|
| `Add a sofa against the north wall` | Direct placement (validates collisions). |
| `Add a sofa` (no position, big room) | AI offers 2–3 placement **options with reasons** — pick one from the proposal tabs. |
| `Add a double bed, two nightstands and a wardrobe in the bedroom` | Batch placement in one step. |
| `Move the coffee table next to the sofa` / `Rotate the armchair 90 degrees` | Moves/rotates. |
| `Remove the chair near the desk` | Single removal (3+ items → AI asks for confirmation first). |
| `Plant a tree in the yard outside the house` | Outdoor placement (`outdoor` flag). |
| `Scale the dining table to 1.5x` | Resizes. |

**Tip**: the AI reads the scene before placing — say "near the window", "against
the east wall", "in the corner of the bedroom" and it resolves positions itself.

### 4.4 Materials

| Prompt | What the AI does |
|---|---|
| `Paint all interior walls white` | Wall faces (interior/exterior/both). |
| `Make the floor wooden oak` | Slab material. |
| `Change the roof to dark grey shingles` | Roof top surface. |
| `Make the stair railing black metal` | Stair role-based (railing/tread/side). |
| `Make the sofa dark green fabric` | Item material. |

### 4.5 Multi-level buildings, stairs & elevators

| Prompt | What the AI does |
|---|---|
| `Add a second floor with the same layout` | `clone_level` — duplicates walls/doors/windows/furniture. |
| `Add a spiral staircase connecting level 0 and level 1` | Spiral stair + auto slab opening. |
| `Add an elevator from the ground floor to the top floor` | Elevator shaft, auto-cuts every served floor. |
| `Add a 3m deep basement with a stair going down` | Negative-elevation slab + downward stair. |

**Note**: mezzanines/夹层 are **not supported** — the AI will explain and suggest
a full extra level instead.

### 4.6 Roofs, fences & outdoors

| Prompt | What the AI does |
|---|---|
| `Add a gable roof over the house` | Roof types: hip / gable / shed / gambrel / dutch / mansard / flat. |
| `Add a chimney and two skylights on the roof` | Roof accessories. |
| `Add a wooden privacy fence around the yard` | Fence with style/color. |
| `Add a curved fence along the garden path` | Arc fence. |
| `Move the building 5 meters to the east` | Repositions whole buildings on the site. |

### 4.7 Zones, slabs, ceilings

| Prompt | What the AI does |
|---|---|
| `Create a zone for the living room area` | Named zone polygon. |
| `Add a ceiling with recessed lights` | Ceiling panel. |
| `Add a skylight opening in the ceiling` | Manual cut-out. |

### 4.8 Saved room presets

| Prompt | What the AI does |
|---|---|
| `Save this bedroom layout as a preset called "Cozy Bedroom"` | Saves (requires a host storage backend; OSS build explains if unavailable). |
| `Insert my "Cozy Bedroom" preset on the second floor` | Re-instantiates the saved room. |

### 4.9 Explore the result

| Prompt | What the AI does |
|---|---|
| `Enter walkthrough mode` | First-person exploration of your design. |
| `What is in the scene right now?` | AI describes rooms, items and counts from live scene data. |
| `Suggest a better layout for this living room` | Design advice + optional `propose_placement` options. |

---

## 5. How to talk to the AI (rules that make results better)

1. **One clear goal per message** — "build the walls" then "add windows" beats one giant sentence. The AI handles multi-step itself, but staged requests are easier to undo.
2. **Exact numbers win** — "6m x 4m room, door 1m wide, window at 1m height".
3. **Use sides/compass** — north/south/east/west, left/right of the entrance.
4. **Your language** — ask in Hindi and it answers in Hindi. (Tool parameters stay English internally — you don't need to care.)
5. **Bulk destruction asks first** — "remove everything" triggers a confirmation card with exact counts. Answer 是/yes/cancel.
6. **Ambiguity = questions** — if unsure, the AI asks you (e.g. "update walls on this level or all levels?").

## 6. Troubleshooting

| Problem | Fix |
|---|---|
| "AI service rate limited" | Click **Retry** (server already retried 3x with backoff). If persistent, check credits at openrouter.ai/credits. |
| "AI service not configured" | `AI_API_KEY` missing in `.env` — see `.env.example`. |
| Wrong placement | Use **Undo** on the operation card, then describe the exact position. |
| Chat feels slow on complex plans | Normal — each stage is a model round-trip (10–40 s typical). Full designs take 5–15 min. |

## 7. Customizing

- **Add suggestion buttons**: edit `SUGGESTION_CHIPS` in
  `packages/editor/src/components/ai/ai-chat-panel.tsx`.
- **Change AI behavior/rules**: edit
  `packages/editor/src/components/ai/prompt/system-prompt.ts`.
- **Change model / provider**: edit `AI_CHAT_MODEL` + `AI_BASE_URL` in `.env`
  (see `.env.example` for options — any OpenAI-compatible endpoint works, no code changes).
