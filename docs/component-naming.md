# Component Naming Guidelines

## 🎯 Purpose
To maintain **consistent and cross-platform safe naming** for all React/Next.js components 
in TypeScript (.tsx)

Linux and macOS users use case-sensitive filesystems, while Windowsdoes not.
This can lead to issues where imports like `import MyComponent from './MyComponent'` work on windows
but will fail on Linux if the file name doesn't match exactly


## ✅ Naming Rules

### **1. File Naming Convention**
All React components **must use lowercase letters with dashes (-)** to seperate words.

**Format:** component.tsx

### **2. Folder Names**

| ✅ Correct | ❌ Incorrect |
|-----------|--------------|
| `navbar.tsx` | `NavBar.tsx` |
| `user-profile.tsx` | `UserProfile.tsx` |
| `hero-section.tsx` | `HeroSection.tsx` |

### **3. Componnet Declartion**
Even though file names are lower case, the **component function name** should remain **PascalCase**

**Example:**
```tsx
// File: user-profile

export default function UserProfile() {
    return <div>User Profile<div>;
}
```