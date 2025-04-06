import { supabase } from '../lib/supabase';
import fs from 'fs';
import path from 'path';

async function initDatabase() {
  try {
    console.log('Initializing Supabase database...');
    
    // Read the SQL schema file
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the SQL schema
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('Error initializing database:', error);
      
      // Alternative approach: Execute SQL statements one by one
      console.log('Trying alternative approach...');
      const statements = schema
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
      
      for (const statement of statements) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error(`Error executing statement: ${statement}`, error);
        }
      }
    } else {
      console.log('Database initialized successfully!');
    }
  } catch (error) {
    console.error('Error in initDatabase:', error);
  }
}

// Run the initialization
initDatabase();
