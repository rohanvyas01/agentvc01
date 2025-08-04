#!/usr/bin/env node

/**
 * AgentVC Clone Setup Script
 * Automates the initial setup process for new clones
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bold}[Step ${step}]${colors.reset} ${colors.blue}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function runCommand(command, description) {
  try {
    log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    logSuccess(`${description} completed`);
    return true;
  } catch (error) {
    logError(`${description} failed: ${error.message}`);
    return false;
  }
}

function checkPrerequisites() {
  logStep(1, 'Checking Prerequisites');
  
  const requirements = [
    { command: 'node --version', name: 'Node.js', required: true },
    { command: 'npm --version', name: 'npm', required: true },
    { command: 'git --version', name: 'Git', required: true },
    { command: 'supabase --version', name: 'Supabase CLI', required: false },
    { command: 'docker --version', name: 'Docker', required: false }
  ];

  let allRequired = true;
  
  requirements.forEach(req => {
    try {
      execSync(req.command, { stdio: 'pipe' });
      logSuccess(`${req.name} is installed`);
    } catch (error) {
      if (req.required) {
        logError(`${req.name} is required but not installed`);
        allRequired = false;
      } else {
        logWarning(`${req.name} is not installed (optional)`);
      }
    }
  });

  return allRequired;
}

function setupEnvironment() {
  logStep(2, 'Setting up Environment');
  
  const envPath = '.env.local';
  const envExamplePath = '.env.example';
  
  if (existsSync(envPath)) {
    logWarning('Environment file already exists');
    return true;
  }

  if (existsSync(envExamplePath)) {
    try {
      const envExample = readFileSync(envExamplePath, 'utf8');
      writeFileSync(envPath, envExample);
      logSuccess('Created .env.local from template');
    } catch (error) {
      logError(`Failed to create environment file: ${error.message}`);
      return false;
    }
  } else {
    // Create basic environment file
    const basicEnv = `# AgentVC Environment Configuration
# Update these values with your own

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_ENV=development
VITE_APP_NAME=AgentVC
VITE_APP_VERSION=1.0.0

# Video Generation Configuration (optional)
RESEMBLE_API_KEY=your_resemble_api_key
`;
    
    try {
      writeFileSync(envPath, basicEnv);
      logSuccess('Created basic .env.local file');
      logWarning('Please update .env.local with your actual values');
    } catch (error) {
      logError(`Failed to create environment file: ${error.message}`);
      return false;
    }
  }

  return true;
}

function installDependencies() {
  logStep(3, 'Installing Dependencies');
  return runCommand('npm install', 'Dependency installation');
}

function checkSupabaseSetup() {
  logStep(4, 'Checking Supabase Setup');
  
  try {
    execSync('supabase --version', { stdio: 'pipe' });
  } catch (error) {
    logWarning('Supabase CLI not installed. Skipping database setup.');
    logWarning('Install Supabase CLI: https://supabase.com/docs/guides/cli');
    return false;
  }

  // Check if supabase is linked
  try {
    execSync('supabase status', { stdio: 'pipe' });
    logSuccess('Supabase is configured');
    return true;
  } catch (error) {
    logWarning('Supabase not linked to a project');
    logWarning('Run: supabase link --project-ref your-project-ref');
    return false;
  }
}

function runTests() {
  logStep(5, 'Running Setup Tests');
  
  const testScripts = [
    { script: 'scripts/test-setup.js', name: 'Basic setup test' }
  ];

  let allPassed = true;
  
  testScripts.forEach(test => {
    if (existsSync(test.script)) {
      const success = runCommand(`node ${test.script}`, test.name);
      if (!success) allPassed = false;
    } else {
      logWarning(`Test script ${test.script} not found`);
    }
  });

  return allPassed;
}

function displayNextSteps() {
  log('\n' + '='.repeat(50), 'blue');
  log('🎉 Setup Complete! Next Steps:', 'bold');
  log('='.repeat(50), 'blue');
  
  const steps = [
    '1. Update .env.local with your Supabase credentials',
    '2. Link to your Supabase project: supabase link --project-ref YOUR_REF',
    '3. Push database migrations: supabase db push',
    '4. Start development server: npm run dev',
    '5. Visit http://localhost:5173 to test the app'
  ];

  steps.forEach(step => {
    log(`   ${step}`);
  });

  log('\n📚 Documentation:', 'bold');
  log('   - Setup Guide: CLONE_SETUP_GUIDE.md');
  log('   - Video Setup: VIDEO_SETUP_GUIDE.md');
  log('   - Main README: README.md');
  
  log('\n🚨 Troubleshooting:', 'bold');
  log('   - Run: node scripts/test-setup.js');
  log('   - Check: supabase status');
  log('   - Logs: Check browser console and Supabase logs');
}

async function main() {
  log('🚀 AgentVC Clone Setup Script', 'bold');
  log('This script will help you set up your AgentVC clone\n');

  const steps = [
    checkPrerequisites,
    setupEnvironment,
    installDependencies,
    checkSupabaseSetup,
    runTests
  ];

  let success = true;
  
  for (const step of steps) {
    const result = step();
    if (!result && step === checkPrerequisites) {
      logError('Prerequisites not met. Please install required software and try again.');
      process.exit(1);
    }
    if (!result) success = false;
  }

  displayNextSteps();

  if (success) {
    logSuccess('\n🎉 Setup completed successfully!');
    log('You can now start developing with: npm run dev', 'green');
  } else {
    logWarning('\n⚠️  Setup completed with warnings.');
    log('Please check the messages above and resolve any issues.', 'yellow');
  }
}

// Run the setup
main().catch(error => {
  logError(`Setup failed: ${error.message}`);
  process.exit(1);
});