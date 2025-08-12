import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  name: string;
  school: string;
  text: string;
  timestamp: number;
}

const SCHOOLS = ['Elvira Brandão', 'Oswald', 'Piaget', 'Carandá'];

interface ChatTabProps {
  defaultSchool: string;
}

export default function ChatTab({ defaultSchool }: ChatTabProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('oep-chat-messages', []);
  const [name, setName] = useLocalStorage<string>('oep-chat-name', '');
  const [school, setSchool] = useState<string>(defaultSchool);
  const [text, setText] = useState<string>('');

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

  const sorted = [...messages].sort((a, b) => a.timestamp - b.timestamp);

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
          <CardTitle>Mensagens</CardTitle>
          <CardDescription>As mensagens são salvas apenas neste dispositivo por enquanto.</CardDescription>
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
                  <p className="mt-1 text-sm">{m.text}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
