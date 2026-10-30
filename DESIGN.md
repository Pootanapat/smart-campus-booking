# Implementation notes

- Purple #6B21A8 and gold #D97706 are the visual anchors. Thai and Latin type use IBM Plex Sans Thai and Manrope with system fallbacks.
- Main timeline keeps consistent half-hour geometry and scrolls horizontally on narrow devices. Desktop uses a fixed sidebar; mobile uses a bottom navigation bar.
- Motion is implemented through motion/react. Global reduced-motion preferences are respected. Dialog focus trapping, Escape dismissal, and focus restoration use Radix primitives.
- Local browser persistence and validation are implemented in separate store/domain modules. Domain tests cover overlaps, adjacent bookings, cancelled entries, edits, invalid input, capacity, and the cancellation cutoff.
- A browser workflow suite covers initial empty state, filters, demo/reset, persistence, booking/edit/cancel, ICS downloads, keyboard access, and viewport overflow on desktop and mobile.
