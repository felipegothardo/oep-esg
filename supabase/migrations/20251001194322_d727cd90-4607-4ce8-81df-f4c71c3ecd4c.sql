-- Atualizar nome da OEP para refletir que é a empresa coordenadora
UPDATE public.schools 
SET name = 'OEP - Coordenação', 
    updated_at = now()
WHERE code = 'OEP';