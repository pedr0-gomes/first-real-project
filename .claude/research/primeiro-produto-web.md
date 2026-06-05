# Research: Primeiro produto web end-to-end (Next.js + Supabase + Vercel + LLM)

## 1. Pergunta / escopo
Como um iniciante absoluto constrói e coloca online seu primeiro produto web
end-to-end, partindo do zero na stack, para um gerador de relatórios mensais
com arquitetura motor+config.

- **Dentro:** ordem de montagem/modelo mental; fronteira código vs LLM;
  padrão motor+config + schema do banco; auth de usuário único + deploy.
- **Fora:** otimização de escala/sênior; código linha-a-linha (a pesquisa é
  mapa, não tutorial); escolha final de fornecedor de LLM e de arquitetura
  (cabe ao Construir).

## 2. Mapa do território   ⟶ Aprender

**Execução híbrida (App Router).** O Next.js App Router roda código no
servidor por padrão via **React Server Components (RSC)** — componentes
renderizados no servidor. Isso elimina a necessidade de APIs intermediárias
pra consultas simples ao banco.

**Dois ambientes.** Servidor (onde credenciais do banco e chaves de IA ficam
seguras) vs cliente (navegador, interação visual). A separação física no
código previne vazamento de chaves e falhas de compilação.

**Arquitetura de pastas.** `/app` gerencia roteamento automático por pastas
(`/app/auth`, `/app/dashboard`). Conexões ao banco isoladas em
`/utils/supabase` com dois arquivos: `client.ts` (navegador, helper
`createBrowserClient` do pacote `@supabase/ssr`) e `server.ts` (servidor,
`createServerClient`, manipula cookies no servidor).

**Chaves do Supabase (reforma 2025-2026).** As chaves legadas `anon` e
`service_role` estão em depreciação programada pro fim de 2026. As novas:
**chave pública de publicação** (`sb_publishable_xxx`, usada no `client.ts`) e
**chave secreta de servidor** (`sb_secret_xxx`).

**Server Actions.** Mecanismo do Next.js pra capturar dados de formulário e
executar gravações no servidor — alternativa às APIs intermediárias.

**Structured Outputs (Saídas Estruturadas).** Recurso de modelos modernos
(desde fim de 2024, consolidado 2025-2026) que força o LLM a obedecer um
esquema JSON durante a amostragem de tokens no servidor do provedor. Definido
via biblioteca **Zod** (validação de tipos em TS) e passado à SDK.

**RLS (Row Level Security).** Política de segurança no nível de linha do
Postgres: quando habilitada, a tabela fica trancada e só devolve/aceita linhas
do usuário com sessão autenticada associada.

**CVE-2025-29927.** Vulnerabilidade do Next.js (início de 2025): apps que
protegiam rotas *só* via `middleware.ts` podiam ser contornados manipulando o
cabeçalho `x-middleware-subrequest`, acessando dados privados sem cookie
válido.

## 3. Abordagens + trade-offs   ⟶ Construir

**Matriz de priorização (aprender agora vs adiar).** A fonte recomenda
filtragem estrita pra entregar o MVP sem dominar React a fundo:
- React: *agora* JSX básico, RSC estático, props · *adiar* Redux/Zustand,
  useEffect/useMemo.
- Roteamento: *agora* pastas em `/app` + Server Actions · *adiar* middleware
  fino, cache/revalidação.
- Supabase: *agora* criar tabelas pelo painel, SQL essencial, RLS básico ·
  *adiar* migrações via CLI, realtime, PL/pgSQL.
- Estilo: *agora* Tailwind inline · *adiar* shadcn/Chakra, CSS-in-JS.
- LLM: *agora* HTTP simples via SDK oficial + Zod · *adiar* LangChain, RAG,
  agentes.

**Fronteira código vs LLM.** A fonte afirma: LLM é bom pra nuance linguística,
ruim pra matemática/regras estritas/cronograma — delegar o calendário ou a
distribuição horária gera alucinação matemática, variação de formato e custo.
A favor de restringir o LLM a *um* ponto (texto solto → termo do vocabulário):
estabilidade, previsibilidade, depuração fácil. O resto (dividir o mês, somar,
validar limites, inserir coringa) em TypeScript no backend.

**Eficiência de tokens** (práticas que a fonte lista):
- Modelo pequeno (`gpt-4o-mini` ou `claude-3-5-haiku`) — afirma ~95% mais
  barato que modelos grandes.
- Prompt enxuto: passar só o vocabulário do projeto + o texto do usuário,
  omitir few-shot.
- Persistência: chamar o LLM *só* na criação/edição do registro e salvar o
  termo mapeado no banco → custo zero de tokens nas telas/relatórios.
- Abstração: Vercel AI SDK (`generateObject` + Zod) facilita trocar de
  fornecedor sem reescrever o parsing.

**Config: arquivo estático no repo vs tabela no banco.** A fonte afirma que,
pra app pessoal de um usuário, **arquivo TS estático** (`/config/projetos.ts`)
é "imensamente superior" a tabela de config dinâmica. A favor: dispensa painel
admin, reduz latência, valida em tempo de compilação, versiona no Git. (Modelo
de interface proposto: `id`, `titulo`, `tipoInstituicao`,
`cargaHorariaSemanalAlvo`, `atividadeCoringaDescricao`,
`vocabularioOficialPermitido`, `diretrizesEspeciais{aceitaFimDeSemana,
limiteHorasDiarias}`.)

**Algoritmo do motor (4 fases que a fonte descreve):**
1. Particionar o mês em semanas estritas seg→dom, incluindo dias das pontas
   que caem no mês vizinho.
2. Varrer atividades reais da semana e somar horas (Σ hₐ).
3. Validar restrições da config e gerar flags de inconsistência (dia proibido,
   limite diário estourado).
4. Balancear com coringa: se faltam horas (ΔH = alvo − registradas), gerar
   lançamento virtual numa sexta útil (ou distribuído entre dias úteis
   respeitando limite diário); se sobram, **sem** correção automática — alerta
   crítico pra reduzir manualmente.

**Schema `public.activities`** (proposto pela fonte): `id` uuid PK · `user_id`
uuid FK→`auth.users` ON DELETE CASCADE · `project_id` text (= chave da config)
· `date` date · `raw_text` text · `mapped_activity` text · `hours`
numeric(4,2) CHECK >0 · `created_at` timestamptz. Com RLS habilitado e policy
`FOR ALL TO authenticated USING auth.uid() = user_id`.

**Auth de usuário único.** A fonte recomenda fechar cadastros: Supabase →
Authentication > Providers > Email → desativar "Allow new users to sign up"
(rejeita `signUp()` no servidor). Criar a conta dona por duas vias: (a)
habilitar signup por um minuto, cadastrar, desabilitar; ou (b) inserir o
e-mail manualmente em Authentication > Users (magic link ou senha manual).

**Defesa em profundidade (mitiga CVE-2025-29927).** A fonte afirma: nunca
validar identidade só no middleware — revalidar em toda Server Action e Route
Handler. E usar **`supabase.auth.getUser()`** (valida a assinatura do JWT via
requisição ao servidor de auth), **não** `getSession()`/`getClaims` (lê cookie
sem revalidar — vulnerável se for a única barreira).

**Ciclo de deploy.** Vercel acoplada a repo privado no GitHub. `.env.local`
local, listado no `.gitignore`. `git push` → webhook → Vercel compila em
serverless → no ar. Variáveis de ambiente cadastradas à mão no painel Vercel
(Settings > Environment Variables).

## 4. Fontes
O dump é um documento único sintetizado, com marcadores de citação inline
(`[4]`, `[5]`, `[14]`, `[22]`…) que **não vêm acompanhados de bibliografia,
títulos ou URLs**. Não há rastro auditável até fonte primária — ver lacuna na
§5.

## 5. Perguntas em aberto
- **Sem proveniência rastreável.** Os números de citação não apontam pra nada
  — não dá pra auditar nenhuma afirmação até a origem. Toda afirmação forte da
  §3 é "a fonte disse", não verificada.
- **Contradição interna sobre as chaves.** A §2 diz usar as chaves novas
  (`sb_publishable_`/`sb_secret_`), mas o diagrama de deploy lista
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
  (a legada `service_role`). Não resolvido qual usar.
- **Código do dump veio parcialmente quebrado** (ex.: `messages:,`,
  `.insert(`, arrays vazios) — é ilustrativo, não copia-e-cola.
- **O exemplo do dump não é o teu caso.** As configs de exemplo
  (`monitoria_introducao_programacao`, `extensao_inclusao_digital`) são
  genéricas. As regras reais (LoOBI / Cálculo, vocabulários oficiais, carga
  8h/12h) precisam ser portadas das tuas skills atuais.
- **O modelo de config cobre tuas regras especiais?** `diretrizesEspeciais`
  só prevê `aceitaFimDeSemana` e `limiteHorasDiarias` — não há campo óbvio pra
  "excluir categoria Instagram e compensar" (extensão). Decisão de modelagem
  pra ti.
- **"Ordem de montagem" veio como matriz, não como sequência.** O dump dá o
  que aprender vs adiar, mas não um passo-a-passo numerado de "faça A, depois
  B" até o deploy. Sequência fica a inferir no Construir.
- **Decisões deixadas pra ti (handoff ao Construir):** fornecedor de LLM
  (OpenAI `gpt-4o-mini` vs Claude `claude-3-5-haiku`); SDK direta vs Vercel AI
  SDK; se a regra "coringa numa sexta útil" serve aos teus templates reais.
