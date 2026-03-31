-- Add customizable wake time and journey start date to profiles
ALTER TABLE profiles
  ADD COLUMN wake_time TIME DEFAULT '05:00',
  ADD COLUMN journey_start_date DATE DEFAULT NULL;
