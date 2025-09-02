# 🦷 Dental Clinic System - Template Setup Guide

## 📋 **TEMPLATE CUSTOMIZATION OVERVIEW**

This guide helps you customize the dental clinic system for your own clinic. The system is designed as a template that can be easily adapted for any dental practice.

## 🔗 **CLINIC SLUG EXPLANATION**

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

## 🎯 **STEP-BY-STEP CUSTOMIZATION**

### **Step 1: Choose Your Clinic Slug**

1. **Pick a memorable name**: Choose something that represents your clinic
2. **Follow the rules**: Use only lowercase letters, numbers, and hyphens
3. **Keep it short**: Aim for 2-4 words maximum
4. **Make it unique**: Ensure it's not already used

**Example**: If your clinic is "Sunshine Dental Care", use `sunshine-dental`

### **Step 2: Update Configuration Files**

#### **A. Update `src/config/clinics.ts`**

Replace the default clinic configuration:

```typescript
'your-clinic-slug': {
  slug: 'your-clinic-slug', // TODO: Change to your clinic slug
  name: 'Your Clinic Name', // TODO: Change to your clinic name
  domain: 'yourclinic.com', // TODO: Change to your clinic domain (optional)
  contactPhone: '1234567890', // TODO: Change to your clinic phone number
  contactEmail: 'contact@yourclinic.com', // TODO: Change to your clinic email
  address: 'Your City, State', // TODO: Change to your clinic address
  // ... rest of configuration
}
```

#### **B. Update `src/contexts/ClinicContext.tsx`**

Change the default clinic slug:

```typescript
export const ClinicProvider: React.FC<ClinicProviderProps> = ({ 
  children, 
  clinicSlug = 'your-clinic-slug' // TODO: Change to your clinic slug
}) => {
```

### **Step 3: Update Contact Information**

#### **Files to Update:**

1. **`src/components/Navigation.tsx`**
   - Phone number
   - Email address
   - Working hours
   - Clinic name in logo

2. **`src/components/Hero.tsx`**
   - Clinic name in hero section
   - Contact information
   - Tagline

3. **`src/components/Footer.tsx`**
   - Clinic name
   - Contact information
   - Location link

4. **`src/pages/Contact.tsx`**
   - All contact details
   - Address information

### **Step 4: Update Database**

#### **A. Add Your Clinic to Database**

Run this SQL in your Supabase SQL Editor:

```sql
INSERT INTO clinics (name, slug, contact_phone, contact_email, address) 
VALUES (
  'Your Clinic Name',
  'your-clinic-slug',
  'your-phone-number',
  'your-email@domain.com',
  'Your Address'
);
```

#### **B. Add Scheduling Settings**

```sql
INSERT INTO scheduling_settings (clinic_id, day_schedules, notification_settings) 
SELECT 
  c.id,
  '{
    "0": {"start_time": "09:00", "end_time": "18:00", "break_start": ["13:00"], "break_end": ["14:00"], "slot_interval_minutes": 30, "enabled": false},
    "1": {"start_time": "09:00", "end_time": "18:00", "break_start": ["13:00"], "break_end": ["14:00"], "slot_interval_minutes": 30, "enabled": true},
    "2": {"start_time": "09:00", "end_time": "18:00", "break_start": ["13:00"], "break_end": ["14:00"], "slot_interval_minutes": 30, "enabled": true},
    "3": {"start_time": "09:00", "end_time": "18:00", "break_start": ["13:00"], "break_end": ["14:00"], "slot_interval_minutes": 30, "enabled": true},
    "4": {"start_time": "09:00", "end_time": "18:00", "break_start": ["13:00"], "break_end": ["14:00"], "slot_interval_minutes": 30, "enabled": true},
    "5": {"start_time": "09:00", "end_time": "18:00", "break_start": ["13:00"], "break_end": ["14:00"], "slot_interval_minutes": 30, "enabled": true},
    "6": {"start_time": "09:00", "end_time": "18:00", "break_start": ["13:00"], "break_end": ["14:00"], "slot_interval_minutes": 30, "enabled": false}
  }',
  '{"email_notifications": true, "reminder_hours": 24, "auto_confirm": true}'
FROM clinics c 
WHERE c.slug = 'your-clinic-slug';
```

### **Step 5: Update Assets**

#### **A. Replace Logo**

1. Replace `src/assets/logo.webp` with your clinic logo
2. Update alt text in components to match your clinic name

#### **B. Update Images**

Replace hero images in `src/assets/` with your clinic photos:
- `hero-family.jpg`
- `hero-office.jpg`
- `hero-smile.jpg`
- `dentist-patient.jpg`
- `dentist-patient1.jpg`

### **Step 6: Update Email Configuration**

#### **A. Update SMTP Settings**

In your `.env.local` file:

```env
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your-email@gmail.com
VITE_SMTP_PASS=your-app-password
```

#### **B. Update Email Templates**

The email templates in `src/config/email.ts` automatically use your clinic name from the configuration.

### **Step 7: Test Your Setup**

1. **Test URL**: Visit `http://localhost:8083/appointment?clinic=your-clinic-slug`
2. **Test Booking**: Try booking an appointment
3. **Test Admin**: Check admin panel at `http://localhost:8083/admin`
4. **Test Emails**: Verify email notifications work

## 📝 **CHECKLIST**

### **Configuration Files Updated:**
- [ ] `src/config/clinics.ts` - Clinic configuration
- [ ] `src/contexts/ClinicContext.tsx` - Default clinic slug
- [ ] `.env.local` - Environment variables

### **Components Updated:**
- [ ] `src/components/Navigation.tsx` - Contact info
- [ ] `src/components/Hero.tsx` - Clinic name and contact
- [ ] `src/components/Footer.tsx` - Contact info and branding
- [ ] `src/pages/Contact.tsx` - Contact details

### **Database Updated:**
- [ ] Clinic record added
- [ ] Scheduling settings added
- [ ] Test appointment booking

### **Assets Updated:**
- [ ] Logo replaced
- [ ] Hero images replaced
- [ ] Alt text updated

### **Testing Completed:**
- [ ] Appointment booking works
- [ ] Admin panel accessible
- [ ] Email notifications sent
- [ ] Contact information correct

## 🎉 **YOU'RE READY!**

Once you've completed all steps, your dental clinic system will be fully customized and ready to use. The system will automatically:

- Load your clinic's information
- Use your contact details
- Send emails from your address
- Display your branding
- Manage your appointments

## 🆘 **NEED HELP?**

If you encounter any issues during setup:

1. Check the main `SETUP_GUIDE.md` for detailed instructions
2. Verify all TODO comments have been addressed
3. Ensure your clinic slug follows the naming rules
4. Test each component individually

**Remember**: The clinic slug is the key identifier - make sure it's consistent across all files and the database!
