# Uteich Odontologia - Website

## 🦷 Sobre o Projeto

Website institucional da **Uteich Odontologia** - Clínica odontológica em Cachoeirinha, RS.

**URL**: https://uteichodontologia.com.br

## 🚀 Tecnologias

- **Vite** - Build tool
- **React** - Framework
- **TypeScript** - Linguagem
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **React Helmet Async** - SEO dinâmico
- **React Router** - Roteamento

## 📋 Funcionalidades

- ✅ SEO otimizado para Google, Facebook e Instagram
- ✅ Carrossel de banners com autoplay
- ✅ Sistema de agendamento online (via WhatsApp)
- ✅ Galeria de cases antes/depois
- ✅ Design responsivo e moderno
- ✅ Integração com WhatsApp
- ✅ Pré-configurado para Meta Pixel e Google Tag Manager

## 💻 Desenvolvimento Local

### Pré-requisitos

- Node.js 18+ e npm instalados - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Instalação

```sh
# Clonar o repositório
git clone <URL_DO_REPOSITORIO>

# Navegar até a pasta
cd uteich-flow

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O site estará disponível em `http://localhost:3000`

## 📦 Build para Produção

```sh
# Gerar build otimizado
npm run build

# Preview do build
npm run preview
```

## 🎯 Estrutura do Projeto

```
uteich-flow/
├── public/              # Arquivos estáticos (imagens, logos)
├── src/
│   ├── assets/         # Imagens e recursos
│   ├── components/     # Componentes React
│   │   ├── layout/    # Header, Footer, Layout
│   │   └── ui/        # Componentes shadcn/ui
│   ├── pages/         # Páginas do site
│   └── data/          # Dados estáticos (serviços, etc)
└── index.html         # HTML base com placeholders para pixels
```

## 🔧 Configuração de Anúncios

O arquivo `index.html` está pré-configurado com placeholders para:

- **Meta Pixel** (Facebook/Instagram Ads)
- **Google Tag Manager**
- **Verificações de domínio**

Consulte o arquivo `guia_ativacao_pixels.md` para instruções detalhadas de como ativar cada integração.

## 📱 Páginas

- `/` - Home
- `/servicos` - Serviços odontológicos
- `/sobre` - Sobre a clínica e Dr. Lenon Uteich
- `/agendamento` - Agendamento online
- `/cases` - Cases de sucesso (antes/depois)

## 🎨 Customização

### Cores

As cores principais estão definidas em `src/index.css` usando variáveis CSS:

- `--dental-teal` - Azul principal
- `--dental-sky` - Azul claro
- `--dental-pale` - Azul pálido

### Dados da Clínica

Informações como telefone, endereço e horário estão centralizadas em:
`src/data/services.ts`

## 📞 Contato

**Uteich Odontologia**
- 📍 Cachoeirinha, RS
- 📱 WhatsApp: (51) 99999-9999
- 👨‍⚕️ Dr. Lenon Uteich - CRO 32301

## 📄 Licença

Todos os direitos reservados © 2024 Uteich Odontologia
