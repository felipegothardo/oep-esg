import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Loader2 } from "lucide-react";
import oepLogo from "@/assets/oep-logo.png";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState<Array<{ id: string; name: string; code: string }>>([]);

  useEffect(() => {
    // Check if user is already logged in
    checkUser();
    // Load schools list
    loadSchools();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate("/");
    }
  };

  const loadSchools = async () => {
    try {
      console.log("Carregando escolas...");
      const { data, error } = await supabase
        .from("schools")
        .select("id, name, code")
        .order("name");
      
      if (error) {
        console.error("Erro ao carregar escolas:", error);
        toast({
          title: "Erro ao carregar escolas",
          description: "Por favor, recarregue a página",
          variant: "destructive"
        });
      } else if (data) {
        console.log("Escolas carregadas:", data);
        setSchools(data);
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Iniciando cadastro...", { fullName, email, schoolId });
    
    if (!schoolId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma escola",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            school_id: schoolId
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        // Aguardar o trigger criar o perfil
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Garantir que o perfil foi criado com school_id
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({ 
            user_id: data.user.id,
            full_name: fullName,
            school_id: schoolId 
          }, {
            onConflict: 'user_id'
          });

        if (profileError) {
          console.error("Erro ao criar perfil:", profileError);
          throw new Error("Erro ao criar perfil. Por favor, tente novamente.");
        }

        toast({
          title: "Conta criada com sucesso!",
          description: "Você está sendo redirecionado...",
        });
        
        // Aguardar o toast aparecer
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro ao criar sua conta",
        variant: "destructive"
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });

      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Email ou senha incorretos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-vibrant flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-success/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-2 border-white/20 backdrop-blur-sm bg-card/95 relative z-10">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-eco rounded-full blur-xl opacity-50 animate-pulse"></div>
              <img 
                src={oepLogo} 
                alt="OEP Logo" 
                className="w-48 h-auto object-contain relative z-10 drop-shadow-2xl animate-float" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-bold bg-gradient-eco bg-clip-text text-transparent">
              OEP Sustentável
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground font-medium">
              Sistema de Gestão Ambiental Escolar
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 backdrop-blur">
              <TabsTrigger 
                value="signin" 
                className="data-[state=active]:bg-gradient-eco data-[state=active]:text-white data-[state=active]:shadow-eco transition-all duration-300 rounded-md font-semibold"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-gradient-eco data-[state=active]:text-white data-[state=active]:shadow-eco transition-all duration-300 rounded-md font-semibold"
              >
                Cadastrar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email-signin" className="text-sm font-semibold text-foreground">Email</Label>
                  <Input
                    id="email-signin"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 px-4 border-2 focus:border-primary transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signin" className="text-sm font-semibold text-foreground">Senha</Label>
                  <Input
                    id="password-signin"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 px-4 border-2 focus:border-primary transition-all duration-300"
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="vibrant"
                  size="lg"
                  className="w-full mt-8" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <Leaf className="mr-2 h-5 w-5" />
                      Entrar na Plataforma
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="text-sm font-semibold text-foreground">Nome Completo</Label>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 px-4 border-2 focus:border-primary transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school" className="text-sm font-semibold text-foreground">Escola</Label>
                  <select
                    id="school"
                    value={schoolId}
                    onChange={(e) => {
                      console.log("Escola selecionada:", e.target.value);
                      setSchoolId(e.target.value);
                    }}
                    disabled={loading}
                    required
                    className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Selecione sua escola</option>
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
                  <Label htmlFor="email-signup" className="text-sm font-semibold text-foreground">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 px-4 border-2 focus:border-primary transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup" className="text-sm font-semibold text-foreground">Senha</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    className="h-12 px-4 border-2 focus:border-primary transition-all duration-300"
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="vibrant"
                  size="lg"
                  className="w-full mt-8" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <Leaf className="mr-2 h-5 w-5" />
                      Criar Conta Agora
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