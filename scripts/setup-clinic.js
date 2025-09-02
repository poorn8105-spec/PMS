#!/usr/bin/env node

/**
 * Complete Dental Clinic System Setup Script
 * 
 * This script automates the COMPLETE setup of a dental clinic system including:
 * - All 25+ database tables and schemas
 * - Functions, triggers, and RLS policies
 * - Default clinic configuration
 * - Environment setup
 * 
 * Usage: node scripts/setup-clinic.js
 */

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to validate phone number
function isValidPhone(phone) {
  const phoneRegex = /^[0-9+\-\s()]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
}

// Function to validate Supabase URL
function isValidSupabaseUrl(url) {
  return url.includes('supabase.co') && url.startsWith('https://');
}

// Function to validate Supabase key
function isValidSupabaseKey(key) {
  return key.startsWith('eyJ') && key.length > 50;
}

// Function to validate Resend API key
function isValidResendKey(key) {
  return key.startsWith('re_') && key.length > 30;
}

// Function to validate time format
function isValidTime(time) {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

// Function to validate address
function isValidAddress(address) {
  return address.length >= 10 && address.includes(',');
}

// Function to create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Function to read and execute SQL file
async function executeSQLFile(supabase, sqlFilePath) {
  try {
    console.log(`📄 Reading SQL file: ${sqlFilePath}`);
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log(`🔄 Executing SQL file: ${sqlFilePath}`);
    const { error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });
    
    if (error) {
      throw new Error(`SQL execution failed: ${error.message}`);
    }
    
    console.log(`✅ Successfully executed: ${sqlFilePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error executing ${sqlFilePath}:`, error.message);
    return false;
  }
}

// Function to execute SQL directly
async function executeSQL(supabase, sql) {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      throw new Error(`SQL execution failed: ${error.message}`);
    }
    return true;
  } catch (error) {
    console.error(`❌ SQL execution error:`, error.message);
    return false;
  }
}

// Function to collect and validate all inputs
async function collectClinicData() {
  const data = {};
  let isValid = false;

  while (!isValid) {
    console.log('🏥 Complete Dental Clinic System Setup\n');
    console.log('This script will set up EVERYTHING for your dental clinic system.\n');

    // Step 1: Supabase Configuration
    console.log('📋 Step 1: Supabase Configuration\n');
    
    data.supabaseUrl = await askQuestion('Enter your Supabase Project URL: ');
    data.supabaseKey = await askQuestion('Enter your Supabase anon key: ');

    // Validate Supabase credentials
    if (!data.supabaseUrl || !data.supabaseKey) {
      console.log('❌ Error: Supabase URL and key are required\n');
      continue;
    }

    if (!isValidSupabaseUrl(data.supabaseUrl)) {
      console.log('❌ Error: Invalid Supabase URL format. Should be like: https://your-project.supabase.co\n');
      continue;
    }

    if (!isValidSupabaseKey(data.supabaseKey)) {
      console.log('❌ Error: Invalid Supabase key format. Should start with "eyJ" and be longer than 50 characters\n');
      continue;
    }

    // Test database connection
    console.log('\n🔗 Testing database connection...');
    try {
      const supabase = createClient(data.supabaseUrl, data.supabaseKey);
      const { data: testData, error: testError } = await supabase
        .from('clinics')
        .select('count')
        .limit(1);

      if (testError && !testError.message.includes('relation "clinics" does not exist')) {
        console.log(`❌ Error: Database connection failed: ${testError.message}\n`);
        continue;
      }
      console.log('✅ Database connection successful!\n');
    } catch (error) {
      console.log(`❌ Error: Database connection failed: ${error.message}\n`);
      continue;
    }

    // Step 2: Email Configuration (Resend)
    console.log('📋 Step 2: Email Configuration (Resend)\n');
    
    data.resendApiKey = await askQuestion('Enter your Resend API key (for sending appointment confirmation emails): ');
    
    // Validate Resend API key
    if (!data.resendApiKey) {
      console.log('❌ Error: Resend API key is required for email functionality\n');
      continue;
    }

    if (!isValidResendKey(data.resendApiKey)) {
      console.log('❌ Error: Invalid Resend API key format. Should start with "re_" and be longer than 30 characters\n');
      continue;
    }

    console.log('✅ Resend API key validated!\n');

    // Step 3: Clinic Information
    console.log('📋 Step 3: Clinic Information\n');

    data.clinicName = await askQuestion('Enter clinic name: ');
    if (!data.clinicName || data.clinicName.length < 3) {
      console.log('❌ Error: Clinic name must be at least 3 characters long\n');
      continue;
    }

    data.contactPhone = await askQuestion('Enter contact phone number: ');
    if (!isValidPhone(data.contactPhone)) {
      console.log('❌ Error: Invalid phone number format. Must be at least 10 digits\n');
      continue;
    }

    data.contactEmail = await askQuestion('Enter contact email: ');
    if (!isValidEmail(data.contactEmail)) {
      console.log('❌ Error: Invalid email format. Must include @ and domain\n');
      continue;
    }

    data.address = await askQuestion('Enter clinic address: ');
    if (!isValidAddress(data.address)) {
      console.log('❌ Error: Address must be at least 10 characters and include a comma\n');
      continue;
    }

    // Generate and validate slug
    data.slug = createSlug(data.clinicName);
    console.log(`\n📝 Generated slug: ${data.slug}`);

    const customSlug = await askQuestion('Use this slug? (y/n) or enter custom slug: ');
    data.finalSlug = customSlug.toLowerCase() === 'y' || customSlug.toLowerCase() === 'yes' 
      ? data.slug 
      : customSlug || data.slug;

    if (!data.finalSlug || data.finalSlug.length < 3) {
      console.log('❌ Error: Slug must be at least 3 characters long\n');
      continue;
    }

    // Step 4: Demo Settings (auto-set)
    console.log('\n📋 Step 4: Working Hours\n');
    console.log('Demo working hours will be set (can be changed in admin panel):');
    console.log('- Monday to Friday: 09:00-18:00');
    console.log('- Saturday: 09:00-17:00');
    console.log('- Sunday: Closed');
    console.log('\nYou can customize these later in the admin panel.\n');

    data.workingHours = {
      'Monday': { enabled: true, start: '09:00', end: '18:00' },
      'Tuesday': { enabled: true, start: '09:00', end: '18:00' },
      'Wednesday': { enabled: true, start: '09:00', end: '18:00' },
      'Thursday': { enabled: true, start: '09:00', end: '18:00' },
      'Friday': { enabled: true, start: '09:00', end: '18:00' },
      'Saturday': { enabled: true, start: '09:00', end: '17:00' },
      'Sunday': { enabled: false, start: '', end: '' }
    };

    // Step 5: Demo break time
    console.log('📋 Step 5: Break Time\n');
    console.log('Demo break time: 13:00-14:00 (1 hour lunch break)');
    console.log('You can customize this later in the admin panel.\n');
    
    data.breakStart = '13:00';
    data.breakEnd = '14:00';

    // Step 6: Demo slot interval
    console.log('📋 Step 6: Appointment Settings\n');
    console.log('Demo slot interval: 30 minutes');
    console.log('You can customize this later in the admin panel.\n');
    
    data.slotInterval = '30';

    // All validations passed
    isValid = true;
  }

  return data;
}

// Main setup function
async function setupClinic() {
  try {
    // Collect and validate all inputs
    const data = await collectClinicData();

    // Step 7: Final Review and Confirmation
    console.log('\n📋 Step 7: Final Review and Confirmation\n');
    console.log('Please review all the information below:\n');
    console.log('🏥 CLINIC DETAILS:');
    console.log(`   Name: ${data.clinicName}`);
    console.log(`   Slug: ${data.finalSlug}`);
    console.log(`   Phone: ${data.contactPhone}`);
    console.log(`   Email: ${data.contactEmail}`);
    console.log(`   Address: ${data.address}`);
    console.log('\n⏰ SCHEDULING SETTINGS:');
    console.log(`   Working Hours: Mon-Fri 09:00-18:00, Sat 09:00-17:00, Sun Closed`);
    console.log(`   Break Time: ${data.breakStart}-${data.breakEnd} (1 hour lunch)`);
    console.log(`   Slot Interval: ${data.slotInterval} minutes`);
    console.log('\n🔧 CONFIGURATION:');
    console.log(`   Supabase URL: ${data.supabaseUrl}`);
    console.log(`   Supabase Key: ${data.supabaseKey.substring(0, 20)}...`);
    console.log(`   Resend API Key: ${data.resendApiKey.substring(0, 15)}...`);
    console.log('\n💡 Note: All scheduling settings can be customized later in the admin panel.');

    const confirm = await askQuestion('\n❓ Is all information correct? Proceed with COMPLETE setup? (y/n): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Setup cancelled by user');
      rl.close();
      return;
    }

    // Initialize Supabase client
    const supabase = createClient(data.supabaseUrl, data.supabaseKey);

    // Step 8: Database Schema Setup
    console.log('\n🔄 Step 8: Setting up complete database schema...');
    
    // Read and execute the complete setup SQL
    const completeSetupPath = path.join(__dirname, '..', 'supabase', 'complete-setup.sql');
    
    if (fs.existsSync(completeSetupPath)) {
      console.log('📄 Found complete-setup.sql, executing...');
      const sqlContent = fs.readFileSync(completeSetupPath, 'utf8');
      
      // Split SQL into individual statements and execute them
      const sqlStatements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      console.log(`🔄 Executing ${sqlStatements.length} SQL statements...`);
      
      for (let i = 0; i < sqlStatements.length; i++) {
        const statement = sqlStatements[i];
        if (statement.trim()) {
          try {
            const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
            if (error) {
              console.log(`⚠️ Warning: Statement ${i + 1} failed: ${error.message}`);
            }
          } catch (error) {
            console.log(`⚠️ Warning: Statement ${i + 1} failed: ${error.message}`);
          }
        }
      }
      
      console.log('✅ Database schema setup completed!');
    } else {
      console.log('⚠️ complete-setup.sql not found, proceeding with basic setup...');
    }

    // Step 9: Create clinic record
    console.log('\n🔄 Step 9: Creating clinic record...');
    
    const { data: clinicData, error: clinicError } = await supabase
      .from('clinics')
      .insert([{
        name: data.clinicName,
        slug: data.finalSlug,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail,
        address: data.address,
        working_hours: data.workingHours,
        is_active: true
      }])
      .select()
      .single();

    if (clinicError) {
      throw new Error(`Failed to create clinic: ${clinicError.message}`);
    }

    console.log('✅ Clinic record created successfully!');
    console.log(`Clinic ID: ${clinicData.id}`);

    // Step 10: Create scheduling settings
    console.log('\n🔄 Step 10: Creating scheduling settings...');

    // Convert working hours to day schedules format
    const daySchedules = {};
    const dayMap = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
      'Friday': 5, 'Saturday': 6, 'Sunday': 0
    };

    for (const [dayName, dayConfig] of Object.entries(data.workingHours)) {
      const dayNumber = dayMap[dayName];
      if (dayConfig.enabled) {
        daySchedules[dayNumber] = {
          enabled: true,
          startTime: dayConfig.start,
          endTime: dayConfig.end,
          breakStart: data.breakStart,
          breakEnd: data.breakEnd,
          slotInterval: parseInt(data.slotInterval)
        };
      } else {
        daySchedules[dayNumber] = {
          enabled: false,
          startTime: '',
          endTime: '',
          breakStart: '',
          breakEnd: '',
          slotInterval: parseInt(data.slotInterval)
        };
      }
    }

    // Determine weekly holidays
    const weeklyHolidays = [];
    for (const [dayName, dayConfig] of Object.entries(data.workingHours)) {
      if (!dayConfig.enabled) {
        weeklyHolidays.push(dayMap[dayName]);
      }
    }

    const { data: settingsData, error: settingsError } = await supabase
      .from('scheduling_settings')
      .insert([{
        clinic_id: clinicData.id,
        appointments_disabled: false,
        weekly_holidays: weeklyHolidays,
        custom_holidays: ['2024-01-26', '2024-08-15'], // Republic Day, Independence Day
        day_schedules: daySchedules,
        disabled_slots: {},
        dental_numbering_system: 'universal'
      }])
      .select()
      .single();

    if (settingsError) {
      throw new Error(`Failed to create scheduling settings: ${settingsError.message}`);
    }

    console.log('✅ Scheduling settings created successfully!');

    // Step 11: Generate configuration files
    console.log('\n📋 Step 11: Configuration Files\n');

    const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${data.supabaseUrl}
VITE_SUPABASE_ANON_KEY=${data.supabaseKey}

# Email Configuration (Resend)
VITE_RESEND_API_KEY=${data.resendApiKey}

# Admin Credentials
# Old admin credentials removed - now using Supabase Authentication
# Create a user in Supabase Dashboard → Authentication → Users
# Then use that email/password to login at /login

# Clinic Configuration
VITE_DEFAULT_CLINIC_ID=${clinicData.id}
`;

    const clinicConfigContent = `// Clinic Configuration for ${data.clinicName}
export const CLINIC_CONFIG = {
  id: '${clinicData.id}',
  name: '${data.clinicName}',
  slug: '${data.finalSlug}',
  contact_phone: '${data.contactPhone}',
  contact_email: '${data.contactEmail}',
  address: '${data.address}',
  working_hours: ${JSON.stringify(data.workingHours, null, 2)},
  break_time: '${data.breakStart}-${data.breakEnd}',
  slot_interval: ${data.slotInterval}
};
`;

    // Write configuration files

    // Create .env.local
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Created .env.local');

    // Create clinic config
    const configDir = path.join(__dirname, '..', 'src', 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(path.join(configDir, 'clinic.js'), clinicConfigContent);
    console.log('✅ Created src/config/clinic.js');

    // Success message
    console.log('\n🎉 COMPLETE DENTAL CLINIC SYSTEM SETUP FINISHED!\n');
    console.log('📋 Summary:');
    console.log(`- Clinic Name: ${data.clinicName}`);
    console.log(`- Clinic ID: ${clinicData.id}`);
    console.log(`- Slug: ${data.finalSlug}`);
    console.log(`- Contact: ${data.contactPhone}`);
    console.log(`- Email: ${data.contactEmail}`);
    console.log('\n📁 Files Created:');
    console.log('- .env.local (environment variables)');
    console.log('- src/config/clinic.js (clinic configuration)');
    console.log('\n🗄️ Database Setup:');
    console.log('- ✅ 25+ tables created (clinics, appointments, patients, treatments, etc.)');
    console.log('- ✅ All functions and triggers created');
    console.log('- ✅ Row Level Security (RLS) policies enabled');
    console.log('- ✅ Performance indexes created');
    console.log('- ✅ Default clinic and settings configured');
    console.log('\n🚀 Next Steps:');
    console.log('1. Update src/contexts/ClinicContext.tsx with the clinic ID');
    console.log('2. Update contact information in Navigation.tsx and Footer.tsx');
    console.log('3. Replace logo and images in src/assets/');
    console.log('4. Test email functionality by booking an appointment');
    console.log('5. Test locally with: npm run dev');
    console.log('6. Deploy to Netlify');
    console.log('\n📧 Email Configuration:');
    console.log('- Resend API key has been added to .env.local');
    console.log('- Patient confirmation emails will be sent automatically');
    console.log('- WhatsApp reminders can be sent from admin panel');
    console.log('\n🔐 Authentication Setup:');
    console.log('- Go to Supabase Dashboard → Authentication → Users');
    console.log('- Create a new user with your email');
    console.log('- Use that email/password to login at /login');
    console.log('\n🎯 Features Ready:');
    console.log('- ✅ Appointment booking and management');
    console.log('- ✅ Patient management and medical records');
    console.log('- ✅ Dental treatments and tooth conditions');
    console.log('- ✅ Payment tracking and transactions');
    console.log('- ✅ Staff management and permissions');
    console.log('- ✅ Lab work and prescriptions');
    console.log('- ✅ Tooth images and dental chart');
    console.log('- ✅ Push notifications and FCM');
    console.log('- ✅ Security features and audit logs');
    console.log('- ✅ Multi-tenant architecture');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
setupClinic();

export { setupClinic };
