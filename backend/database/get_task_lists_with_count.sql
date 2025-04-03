CREATE OR REPLACE FUNCTION public.get_task_lists_with_count(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  task_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tl.id,
    tl.user_id,
    tl.title,
    tl.description,
    tl.created_at,
    tl.updated_at,
    COUNT(t.id)::BIGINT AS task_count
  FROM 
    public.task_lists tl
  LEFT JOIN 
    public.tasks t ON tl.id = t.list_id
  WHERE 
    tl.user_id = user_id_param
  GROUP BY 
    tl.id
  ORDER BY 
    tl.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 