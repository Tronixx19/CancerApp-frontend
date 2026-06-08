import { createClient } from '@supabase/supabase-js';

// Reemplaza esto con tu URL real
const supabaseUrl = 'https://mhopijwjdaxwocfthhlc.supabase.co'; 

// Reemplaza esto con tu llave "anon public" real
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ob3BpandqZGF4d29jZnRoaGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzYyODMsImV4cCI6MjA4ODUxMjI4M30.o0mSeHZgsOE3htu2P4Oea72LUMUONbqUhj4rUaDECvY'; 

export const supabase = createClient(supabaseUrl, supabaseKey);