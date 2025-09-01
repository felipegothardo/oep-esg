import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export default function ResourcesTab() {
  return <section aria-label="Links, telefones e dicas úteis" className="space-y-6">
      {/* Destaque: Parceiros de Coleta */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Parceiros de Coleta – Contatos (Destaque)</CardTitle>
          <CardDescription>
            Insira aqui os contatos das empresas parceiras que apoiarão a coleta dos resíduos. Este bloco aparece em primeiro lugar com destaque.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Coopercaps */}
            <div className="p-4 rounded-md border bg-card">
              <p className="font-medium">Coopercaps</p>
              <p className="text-sm text-muted-foreground">Responsável: —</p>
              <p className="text-sm text-muted-foreground">Telefone: —</p>
              <p className="text-sm text-muted-foreground">E-mail: —</p>
              <p className="text-sm text-muted-foreground">Área de atuação: —</p>
            </div>
            
            {/* Card 2 */}
            <div className="p-4 rounded-md border bg-card">
              <p className="font-medium">EcoRecicla</p>
              <p className="text-sm text-muted-foreground">Responsável: —</p>
              <p className="text-sm text-muted-foreground">Telefone: —</p>
              <p className="text-sm text-muted-foreground">E-mail: —</p>
              <p className="text-sm text-muted-foreground">Área de atuação: —</p>
            </div>
            
            {/* Card 3 */}
            <div className="p-4 rounded-md border bg-card">
              <p className="font-medium">Verde Futuro</p>
              <p className="text-sm text-muted-foreground">Responsável: —</p>
              <p className="text-sm text-muted-foreground">Telefone: —</p>
              <p className="text-sm text-muted-foreground">E-mail: —</p>
              <p className="text-sm text-muted-foreground">Área de atuação: —</p>
            </div>
            
            {/* Card 4 */}
            <div className="p-4 rounded-md border bg-card">
              <p className="font-medium">Recicla Brasil</p>
              <p className="text-sm text-muted-foreground">Responsável: —</p>
              <p className="text-sm text-muted-foreground">Telefone: —</p>
              <p className="text-sm text-muted-foreground">E-mail: —</p>
              <p className="text-sm text-muted-foreground">Área de atuação: —</p>
            </div>
            
            {/* Card 5 */}
            <div className="p-4 rounded-md border bg-card">
              <p className="font-medium">Coleta Sustentável</p>
              <p className="text-sm text-muted-foreground">Responsável: —</p>
              <p className="text-sm text-muted-foreground">Telefone: —</p>
              <p className="text-sm text-muted-foreground">E-mail: —</p>
              <p className="text-sm text-muted-foreground">Área de atuação: —</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links oficiais e úteis */}
      <Card>
        <CardHeader>
          <CardTitle>Links Oficiais e Úteis</CardTitle>
          <CardDescription>Páginas com informações sobre reciclagem, ESG e calculadora de CO2.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <a className="story-link" href="https://www.gov.br/mma/pt-br" target="_blank" rel="noopener noreferrer">
                Ministério do Meio Ambiente – Brasil
              </a>
            </li>
            <li>
              <a className="story-link" href="https://cetesb.sp.gov.br/" target="_blank" rel="noopener noreferrer">
                CETESB – Informações ambientais
              </a>
            </li>
            <li>
              <a className="story-link" href="https://www.ipcc.ch/" target="_blank" rel="noopener noreferrer">
                IPCC – Clima e publicações
              </a>
            </li>
            <li>
              <a className="story-link" href="https://www.consciousplanet.org/pt/co2-calculator" target="_blank" rel="noopener noreferrer">
                Calculadora de CO2 (exemplo)
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Telefones úteis */}
      <Card>
        <CardHeader>
          <CardTitle>Telefones Úteis</CardTitle>
          <CardDescription>Adicionar contatos de secretarias municipais, coleta seletiva, catadores, etc.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            <li>Prefeitura / Coleta Seletiva: —</li>
            <li>Central de Reciclagem Local: —</li>
            <li>Contato Emergencial: —</li>
          </ul>
        </CardContent>
      </Card>

      {/* Destinação dos resíduos */}
      <Card>
        <CardHeader>
          <CardTitle>Destinação dos Resíduos – Ecoponto e Coleta Seletiva</CardTitle>
          <CardDescription>Resumo das principais informações (insira os detalhes na sequência).</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>O que vai para o Ecoponto: —</li>
            <li>O que entra na Coleta Seletiva: —</li>
            <li>Horários / Procedimentos: —</li>
            <li>Documentos / Regras específicas: —</li>
          </ul>
        </CardContent>
      </Card>
    </section>;
}