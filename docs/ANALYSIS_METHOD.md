# Analysis method

When something is broken (e.g. wrong thing showing, element in the wrong place):

1. **Trace the full chain** – What actually renders? Which classes are on the element? What do those classes do in the theme (base CSS, utilities)? Don’t stop at the first plausible fix.
2. **Fix the cause, not the symptom** – If the wrong block is visible (or the right one hidden), ask *why*: e.g. a utility like `critical-hidden` always applied, or an element outside its wrapper so `position: absolute` anchors to the wrong parent. Address that, not only the visibility/position rules.
3. **Inspect the DOM and markup** – For layout/position issues, check where the element lives in the template (inside which wrapper). For show/hide issues, check which classes are present and what overrides what.

Applying this would have shortened the cart and chameleon fixes.
