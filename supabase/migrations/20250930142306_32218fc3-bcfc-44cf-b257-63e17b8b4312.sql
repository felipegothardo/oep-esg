-- Criar tabela de escolas
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir as escolas existentes
INSERT INTO public.schools (name, code) VALUES
  ('Escola Elvira Barros', 'elvira'),
  ('Escola Oswald Cruz', 'oswald'),
  ('Escola Piaget', 'piaget'),
  ('Escola Santo Antônio', 'santo-antonio');

-- Criar tabela de usuários das escolas (profiles)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id),
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de entradas de reciclagem
CREATE TABLE public.recycling_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  material TEXT NOT NULL,
  quantity DECIMAL NOT NULL CHECK (quantity > 0),
  co2_saved DECIMAL NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice para melhor performance
CREATE INDEX idx_recycling_school_date ON public.recycling_entries(school_id, entry_date);

-- Criar tabela de entradas de consumo
CREATE TABLE public.consumption_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('water', 'energy')),
  month TEXT NOT NULL,
  cost DECIMAL NOT NULL CHECK (cost >= 0),
  consumption DECIMAL NOT NULL CHECK (consumption >= 0),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice para melhor performance
CREATE INDEX idx_consumption_school_month ON public.consumption_entries(school_id, month, type);

-- Criar tabela de metas de consumo
CREATE TABLE public.consumption_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('water', 'energy')),
  reduction_percentage DECIMAL NOT NULL CHECK (reduction_percentage >= 0 AND reduction_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(school_id, type)
);

-- Criar tabela de mensagens do chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice para melhor performance
CREATE INDEX idx_chat_school_created ON public.chat_messages(school_id, created_at DESC);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycling_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para schools (todos podem ver)
CREATE POLICY "Schools are viewable by everyone"
  ON public.schools FOR SELECT
  USING (true);

-- Políticas RLS para profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para recycling_entries
CREATE POLICY "Users can view entries from their school"
  ON public.recycling_entries FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create entries for their school"
  ON public.recycling_entries FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own entries"
  ON public.recycling_entries FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own entries"
  ON public.recycling_entries FOR DELETE
  USING (user_id = auth.uid());

-- Políticas RLS para consumption_entries (mesmas regras)
CREATE POLICY "Users can view consumption from their school"
  ON public.consumption_entries FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create consumption for their school"
  ON public.consumption_entries FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own consumption"
  ON public.consumption_entries FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own consumption"
  ON public.consumption_entries FOR DELETE
  USING (user_id = auth.uid());

-- Políticas RLS para consumption_goals
CREATE POLICY "Users can view goals from their school"
  ON public.consumption_goals FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage goals for their school"
  ON public.consumption_goals FOR ALL
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Políticas RLS para chat_messages
CREATE POLICY "Everyone can view messages"
  ON public.chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own messages"
  ON public.chat_messages FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON public.chat_messages FOR DELETE
  USING (user_id = auth.uid());

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recycling_entries_updated_at BEFORE UPDATE ON public.recycling_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consumption_entries_updated_at BEFORE UPDATE ON public.consumption_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consumption_goals_updated_at BEFORE UPDATE ON public.consumption_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para criar perfil automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();