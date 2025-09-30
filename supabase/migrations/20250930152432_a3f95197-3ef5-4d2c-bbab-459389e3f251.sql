-- Adicionar escola OEP para coordenadores
INSERT INTO public.schools (name, code, city)
VALUES ('OEP - Coordenação Geral', 'OEP', 'Oeiras')
ON CONFLICT (code) DO NOTHING;