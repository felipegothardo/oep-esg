MERGE dbo.escolas AS destino
USING (
  SELECT N'elvira' AS codigo, N'Escola Elvira Brandão' AS nome, N'Campo Grande' AS cidade UNION ALL
  SELECT N'oswald', N'Escola Oswald Cruz', N'Campo Grande' UNION ALL
  SELECT N'piaget', N'Escola Piaget', N'Campo Grande' UNION ALL
  SELECT N'santo-antonio', N'Escola Santo Antonio', N'Campo Grande'
) AS origem
ON destino.codigo = origem.codigo
WHEN NOT MATCHED THEN
  INSERT (id, nome, codigo, cidade, criado_em, atualizado_em)
  VALUES (NEWID(), origem.nome, origem.codigo, origem.cidade, SYSUTCDATETIME(), SYSUTCDATETIME());

MERGE dbo.parametros_sistema AS destino
USING (
  SELECT N'limite_maximo_quantidade' AS chave, N'{"valor": 100000}' AS valor_json, 1 AS versao UNION ALL
  SELECT N'limite_maximo_co2_evitado', N'{"valor": 1000000}', 1 UNION ALL
  SELECT N'limite_maximo_custo', N'{"valor": 1000000}', 1 UNION ALL
  SELECT N'limite_maximo_consumo', N'{"valor": 10000000}', 1 UNION ALL
  SELECT N'equivalencias_ambientais', N'{"co2_por_arvore": 21.77, "co2_por_carga_smartphone": 0.008, "co2_por_km_onibus": 0.089}', 1
) AS origem
ON destino.chave = origem.chave
WHEN NOT MATCHED THEN
  INSERT (chave, valor_json, versao, atualizado_em)
  VALUES (origem.chave, origem.valor_json, origem.versao, SYSUTCDATETIME());
