# Plano de Hierarquia Tipográfica: Reliqq

## 1. Conceito
A Reliqq trabalha com memória e feitura manual. A tipografia combina
uma serifada de personalidade (títulos, com ar de coisa guardada)
com uma sans-serif neutra (texto, para leitura confortável).

## 2. Famílias
| Função | Fonte | Fallback | Por quê |
|---|---|---|---|
| Títulos (H1, H2, lead, citações) | Fraunces | Georgia, serif | Traço suave, remete ao artesanal e ao vintage |
| Texto, H3, legendas | Inter | system-ui, sans-serif | Alta legibilidade em tamanhos pequenos |

## 3. Escala (base 16px, razão 1.25)
| Nível | Tamanho | Peso | Line-height | Fonte | Uso |
|---|---|---|---|---|---|
| H1 | 35 a 49px (clamp) | 700 | 1.15 | Fraunces | Título da página |
| H2 | ~31px | 600 | 1.25 | Fraunces | Seções |
| H3 | 20px | 600 | 1.3 | Inter | Subseções |
| Lead | 20px | 400 | 1.55 | Fraunces | Parágrafo de abertura |
| Corpo | 16px | 400 | 1.7 | Inter | Texto corrido |
| Citação | ~25px | 400 itálico | 1.4 | Fraunces | Destaques |
| Caption | ~13px | 400 | 1.5 | Inter | Legendas, autoria, notas |

## 4. Regras
- Largura de leitura de no máximo 65 caracteres (`max-width: 65ch`).
- Só 2 famílias; a hierarquia vem de tamanho e peso, não de mais fontes.
- Títulos: mais espaço acima (56px) do que abaixo (16px), para ligar o título ao texto que ele apresenta.
- Cor: texto #2b2b2b, apoio #6b6256, destaque #8b5e3c.
- Tamanhos em `rem`, para respeitar a configuração de fonte do usuário.
