import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, School, Trash2, RefreshCw } from 'lucide-react';
import { DeleteRecordsDialog } from './DeleteRecordsDialog';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: string | null;
  school_id: string | null;
  created_at: string;
  school_name?: string;
  school_code?: string;
  user_role?: string;
  email?: string;
}

interface SchoolOption {
  id: string;
  name: string;
  code: string;
}

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profilesRes, schoolsRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('*, schools(name, code)'),
        supabase.from('schools').select('id, name, code'),
        supabase.from('user_roles').select('*'),
      ]);

      const schoolsList = schoolsRes.data || [];
      setSchools(schoolsList);

      const roleMap: Record<string, string> = {};
      (rolesRes.data || []).forEach((r: any) => { roleMap[r.user_id] = r.role; });

      const profiles = (profilesRes.data || []).map((p: any) => ({
        ...p,
        school_name: p.schools?.name || '—',
        school_code: p.schools?.code || '',
        user_role: roleMap[p.user_id] || 'user',
      }));

      setUsers(profiles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSchool = async (userId: string, schoolId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ school_id: schoolId })
      .eq('user_id', userId);

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Escola atualizada' });
      loadData();
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    // Upsert role
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase.from('user_roles').update({ role: newRole as "coordinator" | "teacher" | "student" }).eq('user_id', userId));
    } else {
      ({ error } = await supabase.from('user_roles').insert({ user_id: userId, role: newRole as "coordinator" | "teacher" | "student" }));
    }

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Perfil atualizado' });
      loadData();
    }
  };

  const handleDeleteUser = async (userId: string, profileId: string) => {
    // Delete profile (cascade will handle related)
    const { error } = await supabase.from('profiles').delete().eq('id', profileId);
    if (error) {
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Usuário removido do sistema' });
      loadData();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Carregando cadastros...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Gestão de Cadastros</h2>
            <p className="text-sm text-muted-foreground">{users.length} usuário(s) registrado(s)</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Users list */}
      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* User info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {user.full_name || 'Sem nome'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cadastrado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* School selector */}
                <div className="flex items-center gap-2 min-w-0">
                  <School className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Select
                    value={user.school_id || ''}
                    onValueChange={(val) => handleChangeSchool(user.user_id, val)}
                  >
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Escola" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role selector */}
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Select
                    value={user.user_role || 'user'}
                    onValueChange={(val) => handleChangeRole(user.user_id, val)}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Aluno</SelectItem>
                      <SelectItem value="teacher">Professor</SelectItem>
                      <SelectItem value="coordinator">Coordenador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Delete */}
                <DeleteRecordsDialog
                  title="Remover Usuário"
                  description={`Tem certeza que deseja remover "${user.full_name || 'este usuário'}" do sistema?`}
                  buttonText=""
                  variant="ghost"
                  size="icon"
                  onConfirm={async () => handleDeleteUser(user.user_id, user.id)}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhum usuário cadastrado.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
