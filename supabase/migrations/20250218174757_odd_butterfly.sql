/*
  # Add initial CV file record

  1. Changes
    - Insert initial CV file record into cv_files table
*/

INSERT INTO cv_files (filename, storage_path)
VALUES ('CV TristanBarry.pdf', 'CV TristanBarry.pdf')
ON CONFLICT DO NOTHING;