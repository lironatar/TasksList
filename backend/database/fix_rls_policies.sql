-- Drop existing policies for verification_codes
DROP POLICY IF EXISTS "Users can insert their own verification codes" ON verification_codes;
DROP POLICY IF EXISTS "Users can view their own verification codes" ON verification_codes;
DROP POLICY IF EXISTS "Users can update their own verification codes" ON verification_codes;

-- Create new policies that allow unauthenticated access for verification
CREATE POLICY "Allow anyone to insert verification codes"
ON verification_codes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow anyone to view verification codes"
ON verification_codes FOR SELECT
USING (true);

CREATE POLICY "Allow anyone to update verification codes"
ON verification_codes FOR UPDATE
USING (true)
WITH CHECK (true);

-- Make sure RLS is enabled
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY; 