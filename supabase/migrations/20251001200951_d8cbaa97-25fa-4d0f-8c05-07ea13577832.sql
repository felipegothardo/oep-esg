-- Remover dados do usuário Felipe Gothardo
DELETE FROM recycling_entries WHERE user_id = '77fe5d53-30cf-41e3-a06f-bbf1c8a5a80a';
DELETE FROM consumption_entries WHERE user_id = '77fe5d53-30cf-41e3-a06f-bbf1c8a5a80a';
DELETE FROM chat_messages WHERE user_id = '77fe5d53-30cf-41e3-a06f-bbf1c8a5a80a';
DELETE FROM notifications WHERE user_id = '77fe5d53-30cf-41e3-a06f-bbf1c8a5a80a';
DELETE FROM profiles WHERE user_id = '77fe5d53-30cf-41e3-a06f-bbf1c8a5a80a';

-- Remover o usuário da tabela auth.users
DELETE FROM auth.users WHERE id = '77fe5d53-30cf-41e3-a06f-bbf1c8a5a80a';