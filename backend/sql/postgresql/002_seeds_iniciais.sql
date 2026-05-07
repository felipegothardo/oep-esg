INSERT INTO escolas (nome, codigo, cidade)
VALUES
  ('Escola Elvira Brandão', 'elvira', 'Campo Grande'),
  ('Escola Oswald Cruz', 'oswald', 'Campo Grande'),
  ('Escola Piaget', 'piaget', 'Campo Grande'),
  ('Escola Santo Antonio', 'santo-antonio', 'Campo Grande')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO parametros_sistema (chave, valor_json, versao)
VALUES
  ('limite_maximo_quantidade', '{"valor": 100000}', 1),
  ('limite_maximo_co2_evitado', '{"valor": 1000000}', 1),
  ('limite_maximo_custo', '{"valor": 1000000}', 1),
  ('limite_maximo_consumo', '{"valor": 10000000}', 1),
  ('equivalencias_ambientais', '{"co2_por_arvore": 21.77, "co2_por_carga_smartphone": 0.008, "co2_por_km_onibus": 0.089}', 1)
ON CONFLICT (chave) DO NOTHING;
