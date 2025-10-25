# RPG Unicorn Game

Local dev instructions and quick notes

To run locally (simple):

Windows PowerShell:

```powershell
# from project root
python -m http.server 8000 --directory pages
# then open http://localhost:8000
```

What I changed (recommended accessibility + UX fixes)
- Added visible focus styles for keyboard navigation.
- Made hover icons appear for keyboard focus as well as mouse hover.
- Increased hover icon z-index so they are not clipped by other elements.
- Added `prefers-reduced-motion` support to disable animations for users who request it.
- Updated `js/script.js` to move keyboard focus to the first focusable control after switching screens.

Next recommended steps
- Replace any remaining inline styles with classes (e.g., spacer divs).
- Add a small automated smoke test or a Lighthouse run for accessibility/performance.
- Consider converting icons to SVG/WebP for better performance.

If you'd like, I can apply the remaining suggestions (spacer class, CSS variables consolidation, small smoke test).
