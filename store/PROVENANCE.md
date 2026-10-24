# Provenance on the Vault Store

Every product in `assets/store.js` now carries a `provenance` block, and the roots are also
published at [`/assets/epinoia-provenance.json`](/assets/epinoia-provenance.json) so they can be
checked without reading the store's source.

## What a root is

A product's root is a Merkle root over six tributaries — who, what, when, why, where, how — with
each leaf binding the text of that tributary to the sha256 of any media attached to it:

```
canonical JSON  ->  sorted keys, no whitespace, UTF-8
leaf            =   sha256(0x00 || canonical_json({v, facet, value, attachments}))
node            =   sha256(0x01 || left || right)
fold            =   pairwise; an odd trailing node is promoted unchanged
```

This is the same convention as `wishing_tree.py`, `src/lib/sigil-store.js` and
`DreamballAnchor.sol`, so a root written here can be recomputed by any of them and must match.
Because the model file's sha256 is inside the `what` leaf, swapping the GLB changes the root.

## The gap: `when`

Every one of the six products is **5 of 6 tributaries**. `when` — the date the thing was made —
does not exist anywhere in the product record, so it hashes as the empty string.

That is not a formality. The wishing tree refuses to build a dreamball from an incomplete seed,
which is why `/store/` is a catalogue of products rather than of dreamballs. Supplying `when` per
product is the whole distance between the two.

Fill it with the real casting/completion date (ISO `YYYY-MM-DD` is enough), and the roots here
change — deliberately, because the content changed. Keep the old root beside the new one as the
audit trail; that pairing is the record of the object's publication, not a break.

## Verify

```bash
curl -s https://epinoiahorizon.com/assets/epinoia-provenance.json | jq '.roots'
# then recompute any root from its facets + model sha256 with wishing_tree.py
```

Current roots (5/6 seeds, `when` empty):

| product | root |
|---|---|
| merlin-harness | `0xabdd47ae77c024f6…` |
| solstice-pendant | `0x60cd55d19a2d3133…` |
| aetherial-lantern | `0x6220e9ca74313fd9…` |
| gold-ingot-pendant | `0x63c79573746784de…` |
| previs-pack | `0x8f431ca660237e96…` |
| arcanum-sdk | `0x33f28765bb0ed68d…` |

## What is deliberately not here

No payment, no accounts, no server. The store is static and the "checkout" writes to
localStorage before handing off to WhatsApp — it cannot take money. A root is not a sale; the
provenance layer is honest about that gap rather than papering over it.
