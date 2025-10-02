import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DeleteRecordsDialog } from '@/components/DeleteRecordsDialog';
import { supabase } from '@/integrations/supabase/client';
interface ChatMessage {
  id: string;
  name: string;
  school: string;
  text: string;
  timestamp: number;
}

const SCHOOLS = ['Elvira Brandão', 'Oswald', 'Piaget', 'Carandá', 'OEP'];

interface ChatTabProps {
  defaultSchool: string;
}

export default function ChatTab({ defaultSchool }: ChatTabProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('oep-chat-messages', []);
  const [name, setName] = useLocalStorage<string>('oep-chat-name', '');
  const [school, setSchool] = useState<string>(defaultSchool);
  const [text, setText] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!name.trim() || !trimmed) {
      toast({ title: 'Informe seu nome e a mensagem.', variant: 'destructive' });
      return;
    }
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      name: name.trim(),
      school,
      text: trimmed,
      timestamp: Date.now(),
    };
    const next = [...messages, msg];
    setMessages(next);
    setText('');
    toast({ title: 'Mensagem enviada!', description: 'Sua mensagem foi publicada no chat.' });
  };

  const startEdit = (m: ChatMessage) => {
    setEditingId(m.id);
    setEditingText(m.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = () => {
    if (!editingId) return;
    const trimmed = editingText.trim();
    if (!trimmed) {
      toast({ title: 'Mensagem vazia.', variant: 'destructive' });
      return;
    }
    const updated = messages.map((mm) => (mm.id === editingId ? { ...mm, text: trimmed } : mm));
    setMessages(updated);
    setEditingId(null);
    setEditingText('');
    toast({ title: 'Mensagem atualizada!' });
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter((mm) => mm.id !== id);
    setMessages(updated);
    toast({ title: 'Mensagem apagada.' });
  };

  const sorted = [...messages].sort((a, b) => a.timestamp - b.timestamp);

  const handleDeleteAllMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('chat_messages')
          .delete()
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
      
      setMessages([]);
      
      toast({
        title: "Mensagens apagadas!",
        description: "Todas as mensagens foram removidas.",
      });
    } catch (error) {
      console.error("Erro ao apagar mensagens:", error);
      toast({
        title: "Erro ao apagar mensagens",
        description: "Não foi possível apagar as mensagens. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <section aria-label="Chat da comunidade" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Chat da Comunidade</CardTitle>
          <CardDescription>
            Escreva seu nome, selecione a escola e envie sua mensagem. (Protótipo local – podemos ativar em tempo real com Supabase quando quiser.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="chat-name">Seu nome</Label>
              <Input id="chat-name" placeholder="Ex.: Ana" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>Escola</Label>
              <Select value={school} onValueChange={setSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a escola" />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOLS.map((s) => (
                    <SelectItem key={SCHOOLS.indexOf(s)} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="chat-text">Mensagem</Label>
              <Textarea id="chat-text" placeholder="Escreva aqui..." value={text} onChange={(e) => setText(e.target.value)} rows={3} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSend} className="hover-scale">Enviar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mensagens</CardTitle>
              <CardDescription>As mensagens são salvas apenas neste dispositivo por enquanto.</CardDescription>
            </div>
            {sorted.length > 0 && (
              <DeleteRecordsDialog
                title="Apagar todas as mensagens?"
                description="Todas as mensagens do chat serão permanentemente removidas."
                buttonText="Apagar Todas"
                onConfirm={handleDeleteAllMessages}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda. Seja o primeiro a participar!</p>
          ) : (
            <ul className="space-y-3">
              {sorted.map((m) => (
                <li key={m.id} className="p-3 border rounded-md bg-card">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{m.name} • <span className="text-muted-foreground">{m.school}</span></div>
                    <time className="text-xs text-muted-foreground">{new Date(m.timestamp).toLocaleString()}</time>
                  </div>
                  {editingId === m.id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} rows={3} />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="secondary" onClick={cancelEdit}>Cancelar</Button>
                        <Button size="sm" onClick={saveEdit}>Salvar</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-1 text-sm">{m.text}</p>
                      <div className="mt-2 flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => startEdit(m)}>Editar</Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">Apagar</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Apagar mensagem?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação removerá a mensagem permanentemente deste dispositivo.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMessage(m.id)}>Apagar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
