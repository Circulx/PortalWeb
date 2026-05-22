# Code Structure - Admin & Seller Portal Implementation

## Project Directory Tree

```
src/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx          [NEW] Admin portal login page
│   │   └── layout.tsx             [MODIFIED] Added portalMode="admin"
│   ├── seller/
│   │   ├── login/
│   │   │   └── page.tsx          [NEW] Seller portal login page
│   │   └── layout.tsx             [MODIFIED] Added portalMode="seller"
│   └── layout.tsx
│
├── components/
│   └── auth/
│       ├── admin-login-form.tsx    [NEW] Admin login form with OTP
│       ├── seller-login-form.tsx   [NEW] Seller login form with OTP
│       ├── auth-wrapper.tsx        [MODIFIED] Added portalMode prop
│       ├── sign-in-form.tsx        (unchanged)
│       ├── sign-up-form.tsx        (unchanged)
│       ├── auth-modal.tsx          (unchanged)
│       ├── otp-verification.tsx    (reused)
│       ├── contact-modal.tsx       (unchanged)
│       └── password-reset-modal.tsx (unchanged)
│
├── actions/
│   └── auth.ts                     (unchanged - existing OTP endpoints)
│
├── models/
│   └── user.ts                     (unchanged - type enum already exists)
│
└── lib/
    └── validation.ts               (unchanged - validateEmail used)
```

## Component Architecture

### AuthWrapper Component Flow

```
AuthWrapper (props: {children, requiredRole?, portalMode?})
  ↓
  useEffect: checkAuth()
    ↓
    getCurrentUser() → Check authentication status
    ↓
    If not authenticated:
      ├─ If portalMode="admin" → router.push('/admin/login')
      ├─ If portalMode="seller" → router.push('/seller/login')
      └─ Else → setIsAuthModalOpen(true)  [customer portal]
    ↓
    If authenticated but role mismatch:
      ├─ Show toast error
      └─ Redirect to appropriate dashboard
    ↓
    If authenticated and role matches:
      └─ Render children
```

### Admin Login Flow

```
/admin/login page
  ↓
AdminLoginForm component
  ├─ State: email, step ('email' | 'otp'), error
  ↓
User enters email
  ↓
POST /api/auth/send-otp
  ├─ email: admin@example.com
  └─ type: 'login'
  ↓
User receives OTP
  ↓
OTPVerification component (reused)
  ↓
POST /api/auth/verify-otp
  ├─ email
  ├─ otp: 6-digit code
  └─ type: 'login'
  ↓
signInWithOTP(email) → Creates JWT session
  ↓
getCurrentUser() → Fetch user data from database
  ↓
Check: user.type === 'admin'?
  ├─ YES → onSuccess() → window.location.href = '/admin'
  └─ NO → Show error + setTimeout(() => redirect to user's portal)
```

### Seller Login Flow

```
/seller/login page
  ↓
SellerLoginForm component
  ├─ State: email, step ('email' | 'otp'), error
  ↓
User enters email
  ↓
POST /api/auth/send-otp
  ├─ email: seller@example.com
  └─ type: 'login'
  ↓
User receives OTP
  ↓
OTPVerification component (reused)
  ↓
POST /api/auth/verify-otp
  ├─ email
  ├─ otp: 6-digit code
  └─ type: 'login'
  ↓
signInWithOTP(email) → Creates JWT session
  ↓
getCurrentUser() → Fetch user data from database
  ↓
Check: user.type === 'seller'?
  ├─ YES → onSuccess() → window.location.href = '/seller/profile'
  └─ NO → Show error + setTimeout(() => redirect to user's portal)
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User visits /admin                                          │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Admin Layout renders                                        │
│ <AuthWrapper requiredRole="admin" portalMode="admin">      │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ AuthWrapper checks authentication                           │
│ const currentUser = await getCurrentUser()                  │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
                    ┌──────┴──────┐
                    ↓             ↓
        ┌──────────────────┐  ┌──────────────────┐
        │ No user (null)   │  │ User exists      │
        └──────────┬───────┘  └────────┬─────────┘
                   ↓                   ↓
        ┌──────────────────┐  ┌──────────────────┐
        │ portalMode set?  │  │ Role matches?    │
        └──────────┬───────┘  └────────┬─────────┘
                   ↓                   ↓
        ┌──────────────────┐  ┌──────────────────┐
        │ Redirect to      │  │ Render dashboard │
        │ /admin/login     │  │ (children)       │
        └──────────────────┘  └──────────────────┘

                If wrong role:
                ↓
        ┌──────────────────────────────┐
        │ Show error toast             │
        │ Redirect to user's dashboard │
        └──────────────────────────────┘
```

## Type Definitions

### AuthWrapperProps (Updated)
```typescript
interface AuthWrapperProps {
  children: React.ReactNode
  requiredRole?: "admin" | "seller" | "customer"
  portalMode?: "admin" | "seller"  // [NEW]
}
```

### AdminLoginFormProps (New)
```typescript
interface AdminLoginFormProps {
  onSuccess: () => void
  setIsLoading: (isLoading: boolean) => void
}
```

### SellerLoginFormProps (New)
```typescript
interface SellerLoginFormProps {
  onSuccess: () => void
  setIsLoading: (isLoading: boolean) => void
}
```

### OTPVerificationProps (Reused)
```typescript
interface OTPVerificationProps {
  email: string
  type: "signup" | "login" | "password-reset"
  onSuccess: () => void
  onBack: () => void
  isLoading?: boolean
}
```

## API Endpoints (Existing - Not Modified)

### Send OTP
```
POST /api/auth/send-otp
{
  email: string
  type: "login" | "signup" | "password-reset"
}
```

### Verify OTP
```
POST /api/auth/verify-otp
{
  email: string
  otp: string (6 digits)
  type: "login" | "signup" | "password-reset"
}
```

### Sign In
```
POST /actions/auth.ts
- signIn(formData): For password authentication
- signInWithOTP(email): For OTP authentication
- getCurrentUser(): Fetch current logged-in user
```

## State Management

### AdminLoginForm State
```typescript
const [email, setEmail] = useState('')
const [emailError, setEmailError] = useState('')
const [error, setError] = useState('')
const [isSubmitting, setIsSubmitting] = useState(false)
const [step, setStep] = useState<'email' | 'otp'>('email')
```

### SellerLoginForm State
```typescript
const [email, setEmail] = useState('')
const [emailError, setEmailError] = useState('')
const [error, setError] = useState('')
const [isSubmitting, setIsSubmitting] = useState(false)
const [step, setStep] = useState<'email' | 'otp'>('email')
```

### AuthWrapper State
```typescript
const [isLoading, setIsLoading] = useState(true)
const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
const [isAuthenticated, setIsAuthenticated] = useState(false)
const [user, setUser] = useState<any>(null)
// [NEW] Redirect logic added for portalMode
```

## Styling & Theme

### Admin Portal Theme
```css
Background: gradient-to-br from-slate-900 via-slate-800 to-slate-900
Form Background: slate-800/50 backdrop-blur
Border: slate-700/50
Text: white / slate-300
Button: white bg with slate-900 text
Accent: slate-400 / slate-700
```

### Seller Portal Theme
```css
Background: gradient-to-br from-emerald-50 to-teal-50
Form Background: white
Border: emerald-100
Text: emerald-900 / emerald-700
Button: emerald-600 with white text
Accent: emerald-500 / teal-500
```

## Validation

### Email Validation
```typescript
validateEmail(email) → { isValid: boolean, error?: string }
// Reuses existing utility from @/lib/validation
```

### OTP Validation
```typescript
// Built into OTPVerification component
// Validates 6 digits, auto-focuses, handles backspace
```

### Role Validation
```typescript
if (currentUser.type !== requiredRole) {
  // Show error and redirect
}

// In login forms:
if (currentUser.type !== 'admin') {  // or 'seller'
  // Show error and redirect to user's dashboard
}
```

## Error Handling

### AuthWrapper Errors
- "You have not access to this Admin Portal" → Toast notification
- "You have not access to this Seller Portal" → Toast notification
- Wrong role detected → Automatic redirect

### LoginForm Errors
- "Invalid email" → Field-level validation
- "Failed to send OTP" → Network error handling
- "Failed to verify OTP" → OTP verification error
- "You do not have admin/seller access" → Role validation error
- Auto-redirect on wrong role after 2 second delay

## Performance Considerations

1. **Lazy Loading**: AuthWrapper checks auth on mount
2. **Reuse**: OTPVerification component reused (no duplication)
3. **Session**: JWT stored in httpOnly cookie (secure)
4. **Redirects**: Using `window.location.href` for full page reload (ensures auth state refresh)

## Security Considerations

1. **OTP**: 6-digit codes expire after 10 minutes
2. **Sessions**: JWT tokens with expiration
3. **Role Validation**: Checked both at wrapper and login form level
4. **HTTPS**: Should be enforced in production
5. **Cookie Security**: httpOnly, Secure, SameSite flags set

## Testing Considerations

### Unit Tests (if added)
- AdminLoginForm email validation
- SellerLoginForm email validation
- OTP parsing and submission
- Role validation logic
- Error message display

### Integration Tests (if added)
- Complete admin login flow
- Complete seller login flow
- Wrong role rejection
- Redirect behavior
- Session persistence

### E2E Tests (if added)
- Admin login from scratch
- Seller login from scratch
- Access control enforcement
- Cross-portal access attempts
