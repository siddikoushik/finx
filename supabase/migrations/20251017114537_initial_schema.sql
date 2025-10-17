/*
  # Initial Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `display_name` (text)
      - `locale` (text) - User's preferred locale for number formatting (e.g., 'en-IN', 'en-US')
      - `currency` (text) - User's preferred currency (default: 'INR')
      - `created_at` (timestamp)
    
    - `calculations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `calculator_type` (text) - Type of calculation (loan_emi, rd, fd, daily_deposit, goal_planner, interest, chit_fund)
      - `input_json` (jsonb) - Input parameters
      - `output_json` (jsonb) - Calculation results
      - `summary_text` (text) - Human-readable summary
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only read/write their own data
    - Profiles: Users can select, insert, and update their own profile
    - Calculations: Users can select, insert, update, and delete their own calculations
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name text,
  locale text DEFAULT NULL,
  currency text DEFAULT 'INR',
  created_at timestamptz DEFAULT now()
);

-- Calculations table
CREATE TABLE IF NOT EXISTS public.calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  calculator_type text NOT NULL,
  input_json jsonb NOT NULL,
  output_json jsonb NOT NULL,
  summary_text text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Calculations policies
CREATE POLICY "Users can read own calculations"
  ON public.calculations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations"
  ON public.calculations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculations"
  ON public.calculations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations"
  ON public.calculations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
