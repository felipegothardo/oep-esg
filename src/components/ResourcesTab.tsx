import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResourcesTab() {
  return (
    <section aria-label="Links, telefones e dicas úteis" className="space-y-6">
      {/* Destaque: Parceiros de Coleta */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Parceiros de Coleta – Contatos </CardTitle>
          <CardDescription>
            Insira aqui os contatos das empresas parceiras que apoiarão a coleta dos resíduos. Este bloco aparece em primeiro lugar com destaque.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-md border bg-card overflow-hidden">
              <p className="font-medium truncate">Cooper Viva Bem (Recicláveis)</p>
              <p className="text-sm text-muted-foreground">Responsável: Teresa ou Lukas</p>
              <p className="text-sm text-muted-foreground">Tel: (11) 3644-6867</p>
              <p className="text-sm text-muted-foreground break-all">presidencia@coopervivabem.com</p>
              <p className="text-sm text-muted-foreground">Resíduos Recicláveis</p>
            </div>
            
            <div className="p-4 rounded-md border bg-card overflow-hidden">
              <p className="font-medium truncate">Cápsulas de Café — Cooper Viva Bem</p>
              <p className="text-sm text-muted-foreground">Responsável: Teresa ou Lukas</p>
              <p className="text-sm text-muted-foreground">Tel: (11) 3644-6867</p>
              <p className="text-sm text-muted-foreground break-all">presidencia@coopervivabem.com</p>
              <p className="text-sm text-muted-foreground">Resíduos Recicláveis</p>
            </div>
            
            <div className="p-4 rounded-md border bg-card overflow-hidden">
              <p className="font-medium truncate">Lacres — Cooper Viva Bem</p>
              <p className="text-sm text-muted-foreground">Responsável: Teresa ou Lukas</p>
              <p className="text-sm text-muted-foreground">Tel: (11) 3644-6867</p>
              <p className="text-sm text-muted-foreground break-all">presidencia@coopervivabem.com</p>
              <p className="text-sm text-muted-foreground">Resíduos Recicláveis</p>
            </div>
            
            <div className="p-4 rounded-md border bg-card overflow-hidden">
              <p className="font-medium truncate">Resíduos de Escrita</p>
              <p className="text-sm text-muted-foreground">Responsável: Felipe Gothardo</p>
              <p className="text-sm text-muted-foreground">Tel: (11) 968109944</p>
              <p className="text-sm text-muted-foreground break-all">felipe.gothardo@elvirabrandao.com.br</p>
              <p className="text-sm text-muted-foreground">Coord. de Sustentabilidade</p>
            </div>
            
            <div className="p-4 rounded-md border bg-card overflow-hidden">
              <p className="font-medium truncate">Pilhas e Baterias — Green Eletron</p>
              <p className="text-sm text-muted-foreground">Tel: (11) 2175-0050</p>
              <p className="text-sm text-muted-foreground break-all">contato@greeneletron.org.br</p>
              <p className="text-sm text-muted-foreground">Pilhas e Baterias</p>
            </div>
            
            <div className="p-4 rounded-md border bg-card overflow-hidden">
              <p className="font-medium truncate">Óleo de Cozinha — Óleo Sustentável</p>
              <p className="text-sm text-muted-foreground">Responsável: A definir</p>
              <p className="text-sm text-muted-foreground">Tel: A definir</p>
              <p className="text-sm text-muted-foreground">Coleta de Óleo de Cozinha Usado</p>
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
              <a className="story-link" href="https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator" target="_blank" rel="noopener noreferrer">
                Calculadora de CO2 - EPA (Inglês)
              </a>
            </li>
            <li>
              <a className="story-link" href="https://www.sosma.org.br/calculadora/" target="_blank" rel="noopener noreferrer">
                Calculadora Carbono - Fundação SOS Mata Atlântica
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>

    </section>
  );
}