-- Deletar todos os registros relacionados aos usuários
DELETE FROM public.chat_messages;
DELETE FROM public.notifications;
DELETE FROM public.consumption_entries;
DELETE FROM public.recycling_entries;
DELETE FROM public.consumption_goals;
DELETE FROM public.user_roles;
DELETE FROM public.profiles;
DELETE FROM public.alert_settings;
DELETE FROM public.external_data;

-- Deletar todos os usuários do sistema de autenticação
-- Nota: Isso deve ser feito após deletar os dados relacionados devido ao cascade
DELETE FROM auth.users;