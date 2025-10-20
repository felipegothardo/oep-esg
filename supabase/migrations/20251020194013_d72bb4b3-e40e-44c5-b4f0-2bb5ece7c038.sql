-- ========================================
-- CORREÇÃO 1: Sistema de Roles Seguro
-- ========================================

-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('coordinator', 'teacher', 'student');

-- Criar tabela de roles de usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver suas próprias roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Apenas service role pode inserir roles
CREATE POLICY "Service role can manage roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Função security definer para verificar roles (evita recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ========================================
-- CORREÇÃO 2: Validação no Banco de Dados
-- ========================================

-- Constraints para recycling_entries
ALTER TABLE public.recycling_entries
ADD CONSTRAINT quantity_range CHECK (quantity > 0 AND quantity <= 100000),
ADD CONSTRAINT co2_range CHECK (co2_saved >= 0 AND co2_saved <= 1000000);

-- Constraints para consumption_entries
ALTER TABLE public.consumption_entries
ADD CONSTRAINT cost_range CHECK (cost >= 0 AND cost <= 1000000),
ADD CONSTRAINT consumption_range CHECK (consumption > 0 AND consumption <= 10000000);

-- Constraints para consumption_goals
ALTER TABLE public.consumption_goals
ADD CONSTRAINT reduction_percentage_range CHECK (reduction_percentage >= 0 AND reduction_percentage <= 100);

-- Limites de tamanho em colunas TEXT
ALTER TABLE public.recycling_entries 
ALTER COLUMN material TYPE VARCHAR(100);

ALTER TABLE public.profiles 
ALTER COLUMN full_name TYPE VARCHAR(100);

ALTER TABLE public.chat_messages 
ALTER COLUMN message TYPE VARCHAR(1000),
ALTER COLUMN user_name TYPE VARCHAR(100);

ALTER TABLE public.notifications
ALTER COLUMN title TYPE VARCHAR(200),
ALTER COLUMN message TYPE VARCHAR(1000);

-- ========================================
-- CORREÇÃO 3: RLS Profiles - Apenas Mesma Escola
-- ========================================

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view profiles in their school"
ON public.profiles
FOR SELECT
USING (
  school_id IN (
    SELECT school_id FROM public.profiles WHERE user_id = auth.uid()
  )
  OR auth.uid() = user_id -- Usuário sempre pode ver seu próprio perfil
);

-- ========================================
-- CORREÇÃO 4: RLS Notifications - Apenas Service Role Cria
-- ========================================

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Service role can create notifications"
ON public.notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- ========================================
-- CORREÇÃO 5: RLS para Dados do Coordenador
-- ========================================

-- Coordenadores podem ver dados de todas as escolas
CREATE POLICY "Coordinators can view all recycling entries"
ON public.recycling_entries
FOR SELECT
USING (
  public.has_role(auth.uid(), 'coordinator'::app_role)
  OR school_id IN (SELECT school_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Coordinators can view all consumption entries"
ON public.consumption_entries
FOR SELECT
USING (
  public.has_role(auth.uid(), 'coordinator'::app_role)
  OR school_id IN (SELECT school_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Coordinators can view all schools"
ON public.schools
FOR SELECT
USING (true); -- Schools já são públicas, mantendo

CREATE POLICY "Coordinators can view all profiles"
ON public.profiles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'coordinator'::app_role)
  OR school_id IN (SELECT school_id FROM public.profiles WHERE user_id = auth.uid())
  OR auth.uid() = user_id
);