# GreensWeveSeen Design System

## Overview

GreensWeveSeen uses a modern, professional design system built on golf-themed aesthetics with clean minimalism, accessibility, and user experience at its core.

## Visual Identity

### Brand Colors

**Primary Golf Green Palette:**
- `--golf-green`: `hsl(140 65% 45%)` - Main brand color
- `--golf-green-light`: `hsl(140 50% 85%)` - Light accent color
- `--golf-fairway`: `hsl(120 40% 60%)` - Secondary green tone
- `--golf-sand`: `hsl(45 85% 75%)` - Sand trap accent
- `--golf-water`: `hsl(210 100% 65%)` - Water hazard blue

**Semantic Colors:**
- `--success`: `hsl(140 65% 45%)` - Success states (matches golf green)
- `--warning`: `hsl(45 93% 58%)` - Warning states (golf flag yellow)
- `--info`: `hsl(210 100% 65%)` - Info states (water blue)
- `--destructive`: `hsl(0 72% 51%)` - Error states

**Neutral Palette:**
- Enhanced neutral scale from 50-950 for improved contrast
- Light mode: Warm whites with subtle golf course ambiance
- Dark mode: Rich, sophisticated dark tones

### Typography

**Font Stack:**
- Primary: System font stack with enhanced font features
- Line heights optimized for readability
- Letter spacing for improved legibility

**Scale:**
- 2xs to 9xl responsive scale
- Proper line height ratios
- Accessibility-compliant contrast ratios

## Component Design Principles

### 1. Cards
- **Border Radius**: 16px (rounded-2xl) for modern look
- **Shadows**: Soft, medium, strong variants using CSS custom properties
- **Hover Effects**: Smooth transitions with scale and shadow changes
- **Spacing**: Consistent 24px padding with proper content hierarchy

### 2. Buttons
- **Enhanced Variants**:
  - Standard: default, destructive, outline, secondary, ghost, link
  - Golf-themed: success, warning, info, gradient, glass
- **Sizes**: sm, default, lg, xl with corresponding icon variants
- **Interactive States**:
  - Active scale (98%)
  - Loading states with spinners
  - Disabled states with proper opacity
- **Accessibility**: Proper focus rings, ARIA labels

### 3. Inputs
- **Enhanced Features**:
  - Left/right icons support
  - Password visibility toggle
  - Error/success states with icons
  - Helper text integration
- **Visual States**: Focus, error, success, disabled
- **Accessibility**: Proper ARIA attributes, screen reader support

### 4. Navigation
- **Collapsible Sidebar**:
  - Desktop: 288px expanded, 80px collapsed
  - Mobile: 288px overlay
- **Glass Morphism**: Backdrop blur with transparency
- **Interactive Elements**:
  - Hover scale effects
  - Modern tooltips for collapsed state
  - Active state highlighting

## Layout System

### Responsive Breakpoints
- Mobile-first approach
- Fluid typography and spacing
- Adaptive grid systems

### Spacing Scale
- Base: 4px units
- Extended: 18, 88, 128, 144 for specific layout needs
- Consistent vertical rhythm

## Accessibility Features

### Focus Management
- Visible focus indicators
- Proper tab order
- Focus traps where needed

### Color Contrast
- WCAG AA compliance
- High contrast mode support
- Color-blind friendly palette

### Screen Reader Support
- Semantic HTML structure
- Proper ARIA labels and roles
- Skip links for navigation

### Keyboard Navigation
- All interactive elements keyboard accessible
- Custom keyboard shortcuts where appropriate

## Animation Guidelines

### Transitions
- **Duration**: 200ms for micro-interactions, 300ms for layout changes
- **Easing**: `ease-out` for natural feel
- **Properties**: Smooth transitions for colors, shadows, transforms

### Micro-interactions
- Button press feedback (scale 98%)
- Hover effects with scale and shadow
- Loading states with spinners
- Smooth theme transitions

## Shadows & Depth

### Shadow Variants
- **Soft**: `0 2px 8px -2px rgb(0 0 0 / 0.05), 0 4px 16px -4px rgb(0 0 0 / 0.05)`
- **Medium**: `0 4px 16px -4px rgb(0 0 0 / 0.1), 0 8px 32px -8px rgb(0 0 0 / 0.05)`
- **Strong**: `0 8px 32px -8px rgb(0 0 0 / 0.15), 0 16px 64px -16px rgb(0 0 0 / 0.1)`
- **Glow**: `0 0 20px rgb(140 255 140 / 0.3)` for golf-themed accents

### Elevation Hierarchy
- Level 0: Base surface
- Level 1: Cards, buttons (soft shadow)
- Level 2: Modals, dropdowns (medium shadow)
- Level 3: Tooltips, alerts (strong shadow)

## Dark Mode Support

### Strategy
- CSS custom properties for seamless switching
- Automatic theme detection with manual override
- Consistent contrast ratios across themes

### Implementation
- All components support both themes
- Enhanced dark mode colors for better visibility
- Golf-themed colors adapted for dark environments

## Usage Guidelines

### Do's
- Use golf-themed colors consistently
- Maintain proper spacing hierarchy
- Implement smooth transitions
- Follow accessibility guidelines
- Use semantic color meanings

### Don'ts
- Mix inconsistent border radius values
- Use colors outside the defined palette
- Skip accessibility considerations
- Implement jarring animations
- Ignore responsive design principles

## Component Library

### Base Components
- `Button` / `EnhancedButton` - All button variants
- `Card` - Layout containers with proper elevation
- `Input` / `EnhancedInput` - Form inputs with validation states
- `LoadingSpinner` - Loading states and overlays

### Layout Components
- `Navigation` - Collapsible sidebar navigation
- `KPICards` - Dashboard statistics cards

### Utility Components
- `Skeleton` - Loading placeholders
- `LoadingOverlay` - Full-screen loading states

This design system provides a cohesive, accessible, and modern foundation for the GreensWeveSeen golf tracking application, emphasizing user experience and visual consistency across all interfaces.