# 🦷 Multi-Tenant Dental Clinic System - Setup Guide

## 📋 **OVERVIEW**

This system allows you to manage multiple dental clinics using a single Supabase database. Each clinic has its own:
- Unique URL slug (e.g., `jeshna-dental`, `smile-dental`)
- Custom settings and working hours
- Separate appointment data
- Individual email notifications

## 🔗 **UNDERSTANDING CLINIC SLUGS**

### **What is a Clinic Slug?**

A **clinic slug** is a URL-friendly identifier for your dental clinic. It's a short, unique name that appears in the website URL and helps identify which clinic the system should load.

**Definition**: A clinic slug is a simplified version of your clinic name that:
- Contains only lowercase letters, numbers, and hyphens
- Is used in URLs to identify specific clinics
- Must be unique across all clinics in the system

### **Examples:**

| Clinic Name | Clinic Slug | URL Example |
|-------------|-------------|-------------|
| Jeshna Dental Clinic | `jeshna-dental` | `yoursite.com/appointment?clinic=jeshna-dental` |
| Smile Dental Care | `smile-dental` | `yoursite.com/appointment?clinic=smile-dental` |
| Pearl Dental Studio | `pearl-dental` | `yoursite.com/appointment?clinic=pearl-dental` |

### **How It Works:**

1. **URL Identification**: When someone visits `yoursite.com/appointment?clinic=my-clinic`, the system knows to load "My Clinic" data
2. **Database Separation**: Each clinic slug corresponds to a unique clinic ID in the database
3. **Multi-tenant Support**: Different clinics can use the same system with different slugs

### **Creating Your Own Clinic Slug:**

**Good Examples:**
- `my-dental-clinic`
- `sunshine-dental`
- `family-dental-care`
- `dental-studio-2024`

**Bad Examples:**
- `My Dental Clinic` (spaces not allowed)
- `MY_DENTAL` (uppercase and underscores not allowed)
- `dental-clinic!` (special characters not allowed)

**Rules for Clinic Slugs:**
- ✅ Use only lowercase letters (a-z)
- ✅ Use numbers (0-9)
- ✅ Use hyphens (-) to separate words
- ❌ No spaces
- ❌ No uppercase letters
- ❌ No special characters
- ❌ No underscores

## 🚀 **QUICK START**

### 1. **Environment Setup**
Your `.env.local` file is already configured with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://zsvgyqdqaqcreswsjdqp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. **Database Setup**
Run the SQL schema in your Supabase SQL Editor:
```sql
-- Copy and paste the contents of supabase/schema.sql
```

### 3. **Add Clinics to Database**
For each clinic, insert into the `clinics` table:
```sql
INSERT INTO clinics (name, slug, contact_phone, contact_email, address) 
VALUES (
  'Your Clinic Name',
  'your-clinic-slug',
  'your-phone',
  'your-email',
  'your-address'
);
```

## 🏥 **CLINIC CONFIGURATION**

### **Current Clinics Setup:**

1. **Jeshna Dental Clinic** (`jeshna-dental`)
   - URL: `http://localhost:8083/appointment`
   - Contact: 6363116263
   - Email: poorn8105@gmail.com

2. **Smile Dental Care** (`smile-dental`)
   - URL: `http://localhost:8083/appointment?clinic=smile-dental`
   - Contact: 9876543210
   - Email: poorn8105@gmail.com

3. **Pearl Dental Studio** (`pearl-dental`)
   - URL: `http://localhost:8083/appointment?clinic=pearl-dental`
   - Contact: 8765432109
   - Email: poorn8105@gmail.com

### **Adding a New Clinic:**

1. **Update `src/config/clinics.ts`:**
```typescript
'new-clinic': {
  slug: 'new-clinic',
  name: 'New Dental Clinic',
  contactPhone: '1234567890',
  contactEmail: 'poorn8105@gmail.com',
  address: 'Your Address',
  workingHours: {
    monday: { start: '09:00', end: '18:00', enabled: true },
    // ... other days
  },
  emailSettings: {
    fromEmail: 'poorn8105@gmail.com',
    fromName: 'New Dental Clinic',
    replyTo: 'poorn8105@gmail.com'
  }
}
```

2. **Add to Database:**
```sql
INSERT INTO clinics (name, slug, contact_phone, contact_email, address) 
VALUES ('New Dental Clinic', 'new-clinic', '1234567890', 'poorn8105@gmail.com', 'Your Address');
```

3. **Add Scheduling Settings:**
```sql
INSERT INTO scheduling_settings (clinic_id, day_schedules, notification_settings) 
SELECT 
  c.id,
  '{"0": {"start_time": "09:00", "end_time": "18:00", "break_start": "13:00", "break_end": "14:00", "slot_interval_minutes": 30, "enabled": false}}',
  '{"email_notifications": true, "reminder_hours": 24, "auto_confirm": true}'
FROM clinics c 
WHERE c.slug = 'new-clinic';
```

## 📧 **EMAIL CONFIGURATION**

### **Current Setup:**
- **From Email**: poorn8105@gmail.com
- **SMTP**: Gmail (requires app password)

### **Gmail App Password Setup:**
1. Enable 2-factor authentication on your Gmail
2. Generate an app password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Add to `.env.local`:
```env
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=poorn8105@gmail.com
VITE_SMTP_PASS=your-app-password
```

### **Email Templates Available:**
- ✅ Appointment Confirmation
- ✅ Appointment Reminder
- ✅ Appointment Cancelled
- ✅ Appointment Rescheduled

## 🔧 **CLINIC ID SYSTEM**

### **How Clinic IDs Work:**
1. **Database Level**: Each clinic has a unique UUID
2. **Application Level**: Clinics are identified by `slug`
3. **URL Level**: `?clinic=clinic-slug` parameter

### **Changing Clinic:**
1. **URL Parameter**: `http://localhost:8083/appointment?clinic=smile-dental`
2. **Default Clinic**: If no parameter, uses `jeshna-dental`
3. **Admin Access**: Each clinic has separate admin panel

## 📊 **DATABASE SCHEMA**

### **Tables:**
1. **`clinics`** - Clinic information
2. **`appointments`** - All appointments (filtered by clinic_id)
3. **`scheduling_settings`** - Clinic-specific settings
4. **`push_subscriptions`** - PWA notifications

### **Key Fields:**
- `clinic_id` - Links everything to specific clinic
- `slug` - URL-friendly identifier
- `domain` - Custom domain (optional)

## 🎯 **TESTING**

### **Test Appointment Booking:**
1. Visit: `http://localhost:8083/appointment`
2. Fill form with valid phone: `9876543210`
3. Submit - should save to database
4. Check admin panel: `http://localhost:8083/admin`

### **Test Different Clinics:**
1. `http://localhost:8083/appointment?clinic=jeshna-dental`
2. `http://localhost:8083/appointment?clinic=smile-dental`
3. `http://localhost:8083/appointment?clinic=pearl-dental`

## 🔒 **SECURITY**

### **Row Level Security (RLS):**
- All tables have RLS enabled
- Currently permissive (allows all operations)
- Can be restricted later based on user roles

### **Environment Variables:**
- Never commit `.env.local` to git
- Use different keys for development/production

## 🚀 **DEPLOYMENT**

### **Environment Variables for Production:**
```env
VITE_SUPABASE_URL=your-production-url
VITE_SUPABASE_ANON_KEY=your-production-key
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=poorn8105@gmail.com
VITE_SMTP_PASS=your-app-password
```

### **Custom Domains:**
1. Set up domain in clinic config
2. Configure DNS to point to your hosting
3. Update Supabase RLS policies if needed

## 📞 **SUPPORT**

### **Common Issues:**
1. **"Failed to book appointment"** - Check Supabase connection
2. **"Clinic not found"** - Verify clinic slug in database
3. **Email not sending** - Check SMTP credentials

### **Debug Mode:**
- Check browser console for errors
- Verify Supabase connection in Network tab
- Test database queries in Supabase SQL Editor

---

## 🎉 **YOU'RE READY!**

Your multi-tenant dental clinic system is now configured with:
- ✅ Supabase database connection
- ✅ Multiple clinic support
- ✅ Email notifications from poorn8105@gmail.com
- ✅ Phone validation
- ✅ Real-time updates
- ✅ PWA support

Start testing with: `http://localhost:8083/appointment`
