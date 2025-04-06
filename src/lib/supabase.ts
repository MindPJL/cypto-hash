import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ezebdwwslffdmbjpmmga.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZWJkd3dzbGZmZG1ianBtbWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjIyNjksImV4cCI6MjA1ODkzODI2OX0._XQliTqMCFCN00TG7opf0dI84nZYZt7hKYm6YSywEtA';

// No service role key needed for this application

export const supabase = createClient(supabaseUrl, supabaseKey);
