
-- Fix 1: Chat messages - Replace public SELECT with school-scoped authenticated policy
DROP POLICY IF EXISTS "Everyone can view messages" ON public.chat_messages;

CREATE POLICY "Users can view messages from their school"
ON public.chat_messages
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  school_id = public.get_user_school_id(auth.uid())
);
