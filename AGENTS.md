## UI/UX Design Contract — Design for Hierarchy, Not Decoration

Build interfaces according to established UI/UX principles, not visual decoration.

### Core Principle
Every UI element must have a clear functional or usability purpose. If an element does not improve understanding, navigation, interaction, feedback, or task completion, do not add it.

### Simplicity
- Prefer the simplest interface that solves the user's problem.
- Do not add UI merely to make the page look more impressive.
- Avoid unnecessary visual complexity.
- Do not fill whitespace with decorative content.
- Prefer clarity over novelty.

### Icons
- Icons are optional, not mandatory.
- Use icons only when they improve recognition, navigation, status, or action discoverability.
- Do not place icons beside every heading.
- Do not use decorative icons.
- Do not use multiple icons where one or none is sufficient.
- Maximum one meaningful icon per action/control.
- Use one consistent icon library and visual style.

### Descriptions
- Do not add descriptions beneath every heading.
- A page title should normally stand on its own.
- Add descriptions only when they provide information the user actually needs.
- Avoid generic descriptions such as *"Manage your settings and preferences."*
- Do not repeat information already communicated by the UI.
- Use concise helper text only where clarification is necessary.

### Cards
- Do not place every section inside a card.
- Use cards only when they create meaningful visual grouping or separation.
- Prefer simple sections, dividers, spacing, and typography when sufficient.
- Avoid nested cards unless there is a strong UX reason.

### Badges
- Use badges only for meaningful status, category, or state information.
- Do not use badges as decoration.
- Do not turn ordinary text into badges unnecessarily.

### Decoration
Avoid unnecessary:
- Gradients
- Illustrations
- Background shapes
- Floating elements
- Decorative icons
- Excessive shadows
- Excessive borders
- Animated effects

Use decoration only when it contributes to the product experience.

### Layout & Spacing
- Establish a clear visual hierarchy.
- Use whitespace intentionally as breathing room.
- Group related information.
- Separate unrelated information.
- Keep primary actions visually obvious.
- Avoid unnecessary sections.
- Maintain consistent spacing and alignment.

### Standard Page Hierarchy
```
Page
│
├── Page title (standalone)
├── Optional short contextual description (only when needed)
│
├── Primary content
│   ├── Section 1
│   ├── Section 2
│   └── Section 3
│
└── Primary action
```
*(Avoid kitchen-sink layouts cluttered with decorative hero banners, tip cards, decorative badges, and filler statistics).*

### Information Hierarchy & Progressive Disclosure
Prioritize:
1. What the user needs to know.
2. What the user needs to do.
3. Additional context.
4. Secondary/advanced options.

Use progressive disclosure for advanced or rarely used functionality (show high-level info first; deeper configuration revealed on action).

### Forms
- Keep forms focused and easy to scan.
- Group related fields.
- Avoid unnecessary helper text.
- Use sensible defaults.
- Use inline validation.
- Clearly distinguish required and optional fields.
- Do not overwhelm users with all configuration options at once.

### Tables
- Optimize for scanning.
- Show important columns first.
- Avoid unnecessary columns.
- Use row actions instead of adding excessive buttons.
- Use pagination/filtering/search when appropriate.

### Responsive Design
- Design for desktop, tablet, and mobile.
- Do not simply shrink desktop layouts.
- Preserve hierarchy and usability across screen sizes.

### Accessibility
- Maintain sufficient contrast.
- Do not communicate information through color alone.
- Ensure keyboard accessibility.
- Use semantic HTML.
- Provide accessible labels for icon-only controls.

### Design Decision Rule
Before adding any component, ask:
> *"What user problem does this solve?"*

- If there is no clear answer, do not add it.
- If two UI approaches communicate the same information, choose the simpler one.

### Quality Standard
The final UI should feel:
- **Professional**
- **Calm**
- **Intentional**
- **Consistent**
- **Easy to scan**
- **Easy to learn**
- **Efficient to operate**

It should **NOT** feel:
- Over-designed
- Crowded
- Decorative
- Childish
- Template-generated
- Full of unnecessary cards, icons, badges, or descriptions.


Do not redesign unrelated parts of the application. Follow the existing design system, spacing scale, typography, component patterns, colors, and interaction conventions. Only introduce new patterns when the existing system cannot appropriately solve the UX problem.