/*
  # Add test image to Mr Robot writeup

  1. Changes
    - Update the Mr Robot writeup with a test image URL
*/

UPDATE writeups
SET images = ARRAY['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80']
WHERE title = 'TryHackMe: Mr Robot CTF';