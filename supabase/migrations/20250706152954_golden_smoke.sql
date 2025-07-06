/*
  # Enable pgcrypto extension

  1. Extensions
    - Enable `pgcrypto` extension for password hashing functions like `gen_salt`
  
  2. Notes
    - This extension is required for the `handle_new_user_and_profile` RPC function
    - Must be enabled before any functions that use `gen_salt` are created
*/

-- Enable pgcrypto extension for password hashing functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;