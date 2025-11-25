# Design Guidelines: Reactivación Clínicas

## Design Approach
**System Selected**: Clean SaaS Dashboard Pattern (inspired by Linear, Notion, and modern healthcare dashboards)

**Rationale**: Data-heavy healthcare application requiring clarity, efficiency, and professional trust. Focus on information hierarchy, scannable data tables, and intuitive navigation over visual flourishes.

## Typography System

**Font Family**: 
- Primary: Inter or Work Sans via Google Fonts CDN
- Monospace: JetBrains Mono for data/numbers

**Hierarchy**:
- Page Titles: text-3xl font-semibold
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Labels/Metadata: text-sm font-medium
- Table Headers: text-xs font-semibold uppercase tracking-wide
- Data/Numbers: text-2xl font-bold (for KPIs)

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section spacing: gap-6, gap-8
- Card margins: space-y-6
- Table cell padding: px-4 py-3

**Grid Structure**:
- Sidebar: Fixed w-64 (collapsible on mobile)
- Main content: flex-1 with max-w-7xl container
- Dashboard KPI cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Data tables: Full width within container

## Component Library

### Navigation
- **Sidebar**: Fixed left navigation, full height, items with rounded-lg hover states, active state with subtle border-l-4 accent
- **Top Bar**: Minimal header with breadcrumbs (text-sm) and user profile icon

### Cards & Containers
- **KPI Cards**: Rounded-xl border shadow-sm, p-6, with large number display and small label below
- **Data Cards**: Rounded-lg border shadow-sm, p-4 to p-6
- **Sections**: bg-background rounded-lg border with consistent padding

### Tables
- **Header**: Sticky top, border-b-2, uppercase labels (text-xs)
- **Rows**: border-b, hover:bg-muted transition, px-4 py-3 cells
- **Actions**: Right-aligned with icon buttons or text links
- **Pagination**: Bottom-aligned, simple prev/next with page numbers

### Forms
- **Input Fields**: 
  - Rounded-md border h-10 px-3
  - Labels: text-sm font-medium mb-1.5
  - Helper text: text-xs mt-1
- **Checkboxes/Radio**: Rounded with focus ring
- **Dropdowns**: Custom select with chevron icon
- **Buttons**: 
  - Primary: rounded-md px-4 py-2 font-medium
  - Secondary: border variant with same sizing
  - Icon buttons: p-2 rounded-md

### Dashboard Elements
- **Stat Display**: Large number (text-3xl font-bold) with label below (text-sm) and optional trend indicator
- **Progress Indicators**: Thin rounded-full bars with percentage labels
- **Badge/Status**: Rounded-full px-2.5 py-0.5 text-xs font-medium
  - Alta: Bold treatment
  - Media: Medium treatment  
  - Baja: Subtle treatment

### Data Visualization
- **Chart Placeholders**: Aspect-video rounded-lg border with centered mock chart label
- **Metric Comparison**: Horizontal bars showing channel effectiveness percentages

### Modal/Overlay
- **Modal**: max-w-2xl rounded-xl shadow-2xl with backdrop blur
- **Toast Notifications**: Fixed bottom-right, rounded-lg, slide-in animation

## Interaction Patterns

**Hover States**: Subtle bg-muted transitions on interactive elements
**Focus States**: Ring-2 with offset for keyboard navigation
**Loading States**: Subtle pulse animation on skeleton loaders
**Empty States**: Centered with icon (<!-- ICON: description -->) and helpful text

## Page-Specific Layouts

### Dashboard (Home)
- KPI grid at top (3 columns on desktop)
- Chart section below (2 columns)
- Recent activity table at bottom

### Importación de Pacientes
- Upload zone: border-2 border-dashed rounded-lg p-12, centered content
- Data table below with action buttons in header

### Segmentación
- Sidebar filters (w-64) with main table taking flex-1
- Multi-select checkboxes in table rows
- Floating action button for "Añadir a campaña"

### Configuración de Campaña
- Stepped form layout with progress indicator at top
- Form sections with clear dividers (border-t pt-6 mt-6)
- Preview pane for message templates

### Staff Calls
- Priority-sorted table with quick action buttons
- Status badges prominently displayed
- Call script modal overlay

## Accessibility
- All interactive elements keyboard navigable with visible focus states
- Form inputs with associated labels (htmlFor)
- ARIA labels on icon-only buttons
- Semantic HTML (main, nav, section, article)
- Sufficient contrast ratios throughout

## Responsive Behavior
- Sidebar collapses to hamburger menu < 1024px
- KPI cards stack to single column < 768px
- Tables scroll horizontally on mobile with sticky first column
- Touch-friendly tap targets (min 44px) on mobile

## Professional Healthcare Touches
- Trust indicators: Subtle "Última actualización" timestamps
- Data validation: Clear error states with helpful messages
- Confirmation modals for destructive actions
- Export/print friendly layouts for patient lists