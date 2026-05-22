# Portal URLs Reference

## Admin Portal

### Login
- **URL**: `/admin/login`
- **Purpose**: Admin authentication page
- **Access**: Public (anyone can see the page, but only admin users can successfully login)
- **Features**: 
  - Dark slate theme
  - OTP-based authentication
  - Role validation (type="admin")
  - Auto-redirect to admin dashboard on success
  - Auto-redirect to appropriate portal if wrong role

### Dashboard & Pages
- **URL**: `/admin`
- **Purpose**: Admin dashboard (requires authentication + admin role)
- **Access**: Restricted to authenticated users with `type="admin"`
- **Behavior**: 
  - If not logged in → Redirect to `/admin/login`
  - If wrong role → Show error toast + redirect to your dashboard
  - If admin role → Show admin dashboard

---

## Seller Portal

### Login
- **URL**: `/seller/login`
- **Purpose**: Seller authentication page
- **Access**: Public (anyone can see the page, but only seller users can successfully login)
- **Features**:
  - Light emerald/teal theme
  - OTP-based authentication
  - Role validation (type="seller")
  - Auto-redirect to seller dashboard on success
  - Auto-redirect to appropriate portal if wrong role

### Dashboard & Pages
- **URL**: `/seller`
- **Purpose**: Seller dashboard (requires authentication + seller role)
- **Access**: Restricted to authenticated users with `type="seller"`
- **Behavior**:
  - If not logged in → Redirect to `/seller/login`
  - If wrong role → Show error toast + redirect to your dashboard
  - If seller role → Show seller dashboard

---

## Customer Portal

### No Separate Login
- **URL**: `/` or `/dashboard`
- **Purpose**: Customer dashboard
- **Access**: Restricted to authenticated users with `type="customer"` or unauthenticated users see login modal
- **Behavior**:
  - Shows login/signup modal if not authenticated
  - No separate login page (uses modal in AuthModal component)
  - Works as before (no changes)

---

## Access Control Matrix

| User Role | `/admin/login` | `/admin` | `/seller/login` | `/seller` | `/dashboard` |
|-----------|---|---|---|---|---|
| **Admin** | Can see (already logged in) | ✓ Access | Can see | ✗ Redirected to `/admin` | ✗ Redirected to `/admin` |
| **Seller** | Can see | ✗ Redirected to `/seller` | Can see (already logged in) | ✓ Access | ✗ Redirected to `/seller` |
| **Customer** | Can see | ✗ Redirected to `/dashboard` | Can see | ✗ Redirected to `/dashboard` | ✓ Access (or modal if not logged in) |
| **Not Logged In** | Can see | Redirected to `/admin/login` | Can see | Redirected to `/seller/login` | Shows login modal |

---

## Quick Navigation

### For Admins
1. Go to `/admin/login`
2. Enter email and verify OTP
3. Automatically redirected to `/admin` dashboard

### For Sellers
1. Go to `/seller/login`
2. Enter email and verify OTP
3. Automatically redirected to `/seller/profile` or `/seller/light-onboarding`

### For Customers
1. Go to `/dashboard`
2. If not logged in, login modal appears
3. Can use password or OTP authentication
