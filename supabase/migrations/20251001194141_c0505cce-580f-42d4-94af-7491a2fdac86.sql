-- Adicionar escola OEP para coordenadores
INSERT INTO public.schools (code, name, city)
VALUES ('OEP', 'OEP - Coordenação Geral', 'Oeiras')
ON CONFLICT (code) DO NOTHING;