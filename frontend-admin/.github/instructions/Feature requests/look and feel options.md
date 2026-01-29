# Look & Feel Features - Survey Builder Customization

## Overview
The Look & Feel system controls the visual appearance and user experience of surveys created in the Survey Builder module. This customization applies only to surveys built with the Survey Builder - 360 assessments use a standardized, professional theme for consistency and trust.

**Note**: These customization options are available ONLY in the Survey Builder module. The 360 Assessment module maintains a consistent, professional appearance to ensure trust and standardization across organizational feedback processes.

---

## 1. Theme System

### What It Does
Pre-configured visual packages containing colors, fonts, and styling that can be applied to surveys created in the Survey Builder.

### Key Features
- **Professional Theme**: Clean, corporate styling with blue/grey color scheme (current default)
- **Custom/Branded Themes**: Organization-specific themes matching company branding
- **Minimal Theme**: Simplified, distraction-free design for focused surveys
- **Accessible Theme**: High-contrast design meeting WCAG 2.1 AA standards

### Implementation Notes
- Themes are selected from a dropdown in survey settings
- Live preview shows changes before applying
- Can create organization-wide branded themes for consistency
- Built using CSS custom properties for easy theme switching

---

## 2. Layout Options

### What It Does
Controls the structural appearance of survey elements (questions, responses, navigation) in the Survey Builder.

### Available Layouts
1. **Standard** - Traditional survey layout with clear question progression
2. **Compact** - Reduced spacing for shorter surveys
3. **Spacious** - Increased padding for better readability
4. **Mobile-First** - Optimized for mobile devices with larger touch targets

### Layout Controls
- Question spacing (compact/standard/spacious)
- Progress bar positioning (top/bottom/hidden)
- Button styling (filled/outlined)
- Container padding and margins

---

## 3. Branding Elements

### Logo
- **Upload custom logo** from image library
- **Style options**:
  - Header placement (left/center/right)
  - Size control (small/medium/large)
- **Placement**: Survey header area
- **Max dimensions**: 200x80px recommended
- **Alt Text**: For accessibility

### Header & Footer
- Custom header text/instructions
- Footer with organizational messaging
- Support contact information
- Privacy/data handling notices

---

## 4. Background Customization

### Color Background
- Solid color picker from predefined palette
- Professional colors only (no bright/distracting colors)
- Light grey default for readability

### Minimal Background Options
- Subtle background patterns (optional)
- Focus on content readability over visual flair
- Maintains professional appearance

---

## 5. Style Customization

### Fonts
- **Typeface selection** from web-safe fonts
- **Size control** (small/medium/large)
- Default: Inter font family for modern, readable appearance

### Colors
- **Primary Color**: Main brand color for buttons and accents
- **Secondary Color**: Supporting elements
- Color picker with professional color palette
- **Auto-contrast adjustment**: Ensures text readability

### Question Spacing
- **Compact**: Minimal space between questions
- **Standard**: Balanced spacing (default)
- **Spacious**: Maximum spacing for detailed responses

---

## 6. Progress & Navigation

### Progress Bar
- Shows completion percentage
- Position options (top/bottom of survey)
- Style options (filled/line)
- Can be hidden for certain survey types

### Navigation Buttons
- **Text customization**: Change "Next" and "Previous" button text
- **Translation support**: Multi-language button text
- **Styling**: Consistent with selected theme

---

## 7. Accessibility Features

### WCAG 2.1 AA Compliance
- **Color contrast ratios**: Auto-adjusted to 4.5:1 minimum
- **Required field indicators**: Clear marking of mandatory questions
- **Screen reader support**: Proper ARIA labels and announcements
- **Keyboard navigation**: Full keyboard support with visual focus indicators

### Mobile Optimization
- **Responsive design**: Auto-adjusts to screen size
- **Touch-friendly**: Larger touch targets (44px minimum)
- **Readable fonts**: Minimum 14px font size on mobile
- **Optimized layouts**: Matrix questions convert to mobile-friendly formats

---

## 8. Survey-Specific Features

### Survey Context
- **Progress indicators**: "Question 3 of 12" style indicators
- **Time estimates**: Show estimated completion time
- **Survey type display**: Clear indication of survey purpose

### Response Options
- Visual cues for different response types
- Clear validation messaging
- Progress saving indicators

---

## 9. Custom CSS (Advanced)

### What It Allows
Direct CSS coding for advanced customization beyond built-in options in the Survey Builder.

### Features
- **CSS editor** with syntax highlighting
- **Theme variable overrides**: Modify CSS custom properties
- Can add custom styling for specific survey types

### Important Notes
- **Limited support**: Custom CSS is "as-is" with minimal support
- **Theme compatibility**: Must work with existing CSS variable system
- **Testing required**: Custom styles may break on future updates

---

## Module Distinction

### Survey Builder Module (Customizable)
- Full look and feel customization options
- Theme selection and branding
- Custom layouts and styling
- Advanced CSS options
- Flexible design for various survey types

### 360 Assessment Module (Standardized)
- Consistent, professional appearance
- No customization options
- Standardized theme for trust and consistency
- Focus on feedback quality over visual customization
- Pre-defined layouts optimized for 360 feedback

---

## Best Practices for Survey Builder

### Design Considerations
1. **Purpose-driven design**: Match visual style to survey purpose
2. **Readability first**: Ensure text is easy to read on all devices
3. **Consistency**: Use consistent styling within survey types
4. **Accessibility**: Always prioritize accessibility for diverse users
5. **Mobile optimization**: Most surveys are taken on mobile devices

### Performance Tips
- Use web-safe fonts for faster loading
- Minimize custom CSS to maintain performance
- Test on multiple devices and browsers
- Keep images optimized and compressed

### User Experience
- **Clear navigation**: Make progress obvious to respondents
- **Trust signals**: Include privacy and data handling information
- **Completion focus**: Design to maximize completion rates
- **Professional appearance**: Maintain credibility and seriousness

---

## Current Implementation Status

### Implemented Features
- Basic theme system with CSS custom properties
- Professional color scheme (blue/grey)
- Responsive design foundation
- Mobile-optimized layouts

### Planned Features (Survey Builder Only)
- Logo upload and branding
- Theme customization panel
- Progress bar styling options
- Advanced accessibility controls

### Not Applicable to 360 Assessments
- Complex visual themes
- Custom branding elements
- Flexible layouts
- Advanced styling options

---

## Technical Implementation

### CSS Architecture
- CSS custom properties for theme variables
- Component-based styling with CSS modules
- Responsive design with mobile-first approach
- Accessibility-first color contrast calculations

### React Components
- Theme provider for dynamic theme switching
- Styled components using CSS variables
- Responsive layout components
- Accessibility wrapper components

### Configuration
- Theme settings stored in survey configuration
- Organization-level theme defaults
- User-level theme preferences (future)

---

## Summary for Implementation

### Core Features to Include (Survey Builder)
1. **Theme selector** with professional presets
2. **Logo upload** with size/position controls
3. **Color customization** (primary/secondary)
4. **Font selector** (web-safe fonts)
5. **Progress bar** customization
6. **Mobile optimization** toggles

### Nice-to-Have Features (Survey Builder)
1. Custom CSS variable overrides
2. Advanced accessibility controls
3. Theme preview functionality
4. Organization branding templates

### Skip for Simplicity
1. Complex background images
2. Animation libraries
3. Advanced CSS editors
4. Theme marketplaces

---

## Quick Reference: What Controls What

| Element | Controlled By | Applies To |
|---------|---------------|------------|
| Colors (primary/secondary) | Style section | Survey Builder Only |
| Fonts (face, size) | Style section | Survey Builder Only |
| Logo | Branding section | Survey Builder Only |
| Background | Style section | Survey Builder Only |
| Button styling | Layout selection | Survey Builder Only |
| Question spacing | Layout section | Survey Builder Only |
| Progress bar | Navigation section | Survey Builder Only |
| Button text | Navigation section | Survey Builder Only |
| Contrast | Accessibility section | Survey Builder Only |

---

## Migration from Current Setup

### Current State
- Basic CSS custom properties system
- Hard-coded professional theme
- No user customization options
- Placeholder "Coming Soon" in Survey Builder settings

### Migration Path (Survey Builder Only)
1. Implement theme selector component
2. Add branding upload functionality
3. Create style customization panel
4. Add accessibility controls
5. Test across devices and browsers

### 360 Assessment Module
- Maintains current standardized appearance
- No customization options added
- Focus remains on consistent, trustworthy design
- Professional theme optimized for feedback processes