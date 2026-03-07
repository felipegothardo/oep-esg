import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Loader2, Database } from "lucide-react";
import oepLogo from "@/assets/oep-logo-new.png";
import { isLocalMode } from "@/lib/runtimeMode";
import {
  getLocalSession,
  localListSchools,
  localSignIn,
  localSignUp,
  resetLocalDb,
} from "@/services/localDb";

type SchoolOption = { id: string; name: string; code: string };

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState<SchoolOption[]>([]);

  useEffect(() => {
    checkUser();
    loadSchools();
  }, []);

  const checkUser = async () => {
    if (isLocalMode) {
      if (getLocalSession()) navigate("/");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) navigate("/");
  };

  const loadSchools = async () => {
    if (isLocalMode) {
      setSchools(localListSchools());
      return;
    }

    try {
      const { data, error } = await supabase.from("schools").select("id, name, code").order("name");

      if (error) {
        toast({
          title: "Erro ao carregar escolas",
          description: "Recarregue a pagina e tente novamente.",
          variant: "destructive",
        });
      } else if (data) {
        setSchools(data);
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!schoolId) {
      toast({
        title: "Erro",
        description: "Selecione uma escola.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isLocalMode) {
        const result = localSignUp({ email, password, fullName, schoolId });
        if (!result.ok) throw new Error(result.error);

        toast({
          title: "Conta criada no banco local",
          description: "Voce foi autenticado no modo local.",
        });
        window.location.href = "/";
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            school_id: schoolId,
          },
        },
      });

      if (error) throw error;

      if (data?.user) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              user_id: data.user.id,
              full_name: fullName,
              school_id: schoolId,
            },
            { onConflict: "user_id" }
          );

        if (profileError) throw new Error("Erro ao criar perfil.");

        toast({
          title: "Conta criada com sucesso",
          description: "Voce esta sendo redirecionado.",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 1200);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Falha no cadastro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      if (isLocalMode) {
        const result = localSignIn(email, password);
        if (!result.ok) throw new Error(result.error);

        toast({
          title: "Login local realizado",
          description: "Entrando no painel.",
        });
        window.location.href = "/";
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta.",
      });

      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Email ou senha incorretos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-success/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-lg shadow-2xl border border-border backdrop-blur-sm bg-card relative z-10">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center">
            <img src={oepLogo} alt="OEP Logo" className="w-40 h-40 object-contain" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-primary">OEP Sustentavel</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Sistema de Gestao Ambiental Escolar
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLocalMode && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5" />
                  Modo local ativo (banco em localStorage)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetLocalDb();
                    setSchools(localListSchools());
                    toast({
                      title: "Banco local resetado",
                      description: "Contas e dados seed recriados.",
                    });
                  }}
                >
                  Resetar dados
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Contas seed: <span className="font-mono">elvira@oep.local</span>,{" "}
                <span className="font-mono">oswald@oep.local</span>,{" "}
                <span className="font-mono">piaget@oep.local</span>,{" "}
                <span className="font-mono">santo-antonio@oep.local</span> (senha{" "}
                <span className="font-mono">123456</span>)
              </p>
            </div>
          )}

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-muted">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 rounded font-medium"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 rounded font-medium"
              >
                Cadastrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email-signin" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email-signin"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signin" className="text-sm font-medium">
                    Senha
                  </Label>
                  <Input
                    id="password-signin"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full mt-6" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <Leaf className="mr-2 h-5 w-5" />
                      Entrar
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="text-sm font-medium">
                    Nome completo
                  </Label>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school" className="text-sm font-medium">
                    Escola
                  </Label>
                  <select
                    id="school"
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    disabled={loading}
                    required
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>
                      Selecione sua escola
                    </option>
                    {schools.length > 0 ? (
                      schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>Carregando escolas...</option>
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup" className="text-sm font-medium">
                    Senha
                  </Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    className="h-11"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full mt-6" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <Leaf className="mr-2 h-5 w-5" />
                      Criar conta
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

