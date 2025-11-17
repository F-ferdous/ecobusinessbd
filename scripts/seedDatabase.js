#!/usr/bin/env node

/**
 * Database Seeding Script
 * Run this script to initialize the database with sample data
 * 
 * Usage:
 * npm run seed
 * npm run seed:reset
 * npm run seed:sample-users
 * npm run seed:stats
 */

const { execSync } = require('child_process');
const path = require('path');

async function runSeeder() {
  const command = process.argv[2] || 'init';
  
  console.log(`Running database seeder with command: ${command}`);
  console.log('Make sure you have set up your Firebase Admin credentials!\n');
  
  try {
    // Import and run the seeder
    const { runSeeder } = require('../src/lib/dbSeed.ts');
    await runSeeder(command);
    
    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Check if this script is being run directly
if (require.main === module) {
  runSeeder();
}