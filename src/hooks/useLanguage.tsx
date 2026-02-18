import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformSettings } from "./usePlatformSettings";

type Language = "pt" | "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Header
    "app.title": "MigraBook",
    "language.select": "Idioma",
    "theme.light": "Claro",
    "theme.dark": "Escuro",
    reset: "Reset",
    publish: "Publicar App",

    // Subscribe Page - Hero
    "subscribe.hero.title": "Converta eBooks ultrapassados em",
    "subscribe.hero.title.line2": "Aplicativos modernos com poucos cliques,",
    "subscribe.hero.title.line3": "sem precisar programar.",
    "subscribe.hero.subtitle": "Venda mais aumentando o valor percebido sem mudar o conteúdo.",
    "subscribe.hero.cta": "Criar Meu App Agora",
    "subscribe.hero.or": "ou",
    "subscribe.hero.demo": "Ver Demonstração",

    // Subscribe Page - Problem Section
    "subscribe.problem.title": "Se você vende conhecimento digital, já percebeu isso na prática:",
    "subscribe.problem.step1": "O cliente precisa criar login.",
    "subscribe.problem.step2": "Confirmar e-mail.",
    "subscribe.problem.step3": "Lembrar senha.",
    "subscribe.problem.step4": "Acessar área de membros.",
    "subscribe.problem.step5": "Navegar até o conteúdo.",
    "subscribe.problem.question": "E se algo falhar no meio do caminho?",
    "subscribe.problem.result":
      'Cliente não consegue entrar → fala que "não recebeu o produto" → pede reembolso → você perde a venda.',

    // Subscribe Page - Comparison
    "subscribe.comparison.pdf.title": "PDF",
    "subscribe.comparison.pdf.subtitle":
      "O que separa quem ainda vende PDF de quem constrói um produto de verdade é a experiência.",
    "subscribe.comparison.app.title": "App",
    "subscribe.comparison.app.description": "E experiência hoje é app.",

    // Subscribe Page - Benefits
    "subscribe.benefits.title": "O que Muda Quando Seu Ebook se Torna um App?",
    "subscribe.benefits.title.part1": "O que Muda Quando Seu",
    "subscribe.benefits.title.part2": "Ebook se Torna um App?",
    "subscribe.benefits.card1.title": "Sem barreiras de acesso",
    "subscribe.benefits.card1.desc":
      "Cliente clica no link → abre direto no app → consome o conteúdo. Acabou o drama de login",
    "subscribe.benefits.card2.title": "Experiência do usuário",
    "subscribe.benefits.card2.desc": "Organizado, bonito, fácil de navegar. Seu cliente não precisa procurar arquivos.",
    "subscribe.benefits.card3.title": "Monetização inteligente",
    "subscribe.benefits.card3.desc":
      "Use notificações dentro do App para oferecer upgrades, módulos extras e novas ofertas, aumentando suas vendas sem esforço.",
    "subscribe.benefits.card4.title": "Identidade visual consistente",
    "subscribe.benefits.card4.desc": "Logo, cores e nome personalizados. O app é realmente seu, não de terceiros.",
    "subscribe.benefits.card5.title": "Interface multi-idioma",
    "subscribe.benefits.card5.desc":
      "Menus, botões e mensagens podem ser traduzidos para qualquer idioma. Ideal para vender seu app em outros países.",
    "subscribe.benefits.card6.title": "Facilidade de acesso",
    "subscribe.benefits.card6.desc":
      "Seu cliente compra, você envia o link e pronto! Sem área de login, sem incômodo com suporte e menos reembolso.",
    "subscribe.benefits.card7.title": "Atualizações automáticas",
    "subscribe.benefits.card7.desc":
      "Precisa corrigir ou adicionar algo dentro do App? Atualize uma vez e todos recebem, sem reenviar PDF e sem retrabalho.",
    "subscribe.benefits.card8.title": "Integração direta",
    "subscribe.benefits.card8.desc":
      "Conecte seu app com qualquer plataforma (Hotmart, Kiwify, Stripe ou outra) e mantenha controle total sobre suas vendas.",
    "subscribe.benefits.cta.title": "Migre Agora",
    "subscribe.benefits.cta.button": "Transformar Meu eBook em App",

    // Subscribe Page - Target Audience
    "subscribe.target.title": "Para Quem é o MigraBook.app?",

    // Subscribe Page - Integrations
    "subscribe.integrations.title": "Sua plataforma de pagamento",
    "subscribe.integrations.title.line2": "conectada em poucos cliques",
    "subscribe.integrations.subtitle":
      "Conecte com Hotmart, Stripe, Kiwify ou qualquer outra. Seu cliente paga, você recebe e o MigraBook envia o app automaticamente por e-mail.",

    // Subscribe Page - Pricing
    "subscribe.pricing.title": "Planos e Preços",
    "subscribe.pricing.subtitle": "Escolha o plano perfeito para suas necessidades",
    "subscribe.pricing.popular": "Recomendado",
    "subscribe.pricing.month": "/mês",
    "pricing.monthly": "Mensal",
    "pricing.annual": "Anual",
    "subscribe.pricing.annual.note": "Cobrado anualmente (R$ {price})",
    "subscribe.pricing.choose.plan": "Escolher {plan}",
    "subscribe.pricing.payment.secure": "Pagamento seguro via Stripe",
    "subscribe.pricing.cancel.anytime": "Cancele quando quiser, sem complicações",

    // Subscribe Page - FAQ
    "subscribe.faq.title": "Dúvidas Frequentes",
    "subscribe.faq.subtitle": "Encontre respostas para as perguntas mais comuns",
    "subscribe.faq.q1": "Preciso saber programar para usar o MigraBook?",
    "subscribe.faq.a1":
      "Não! O MigraBook foi desenvolvido para ser 100% intuitivo. Basta fazer upload do seu PDF, personalizar cores e logo, e seu app está pronto para publicar. Tudo sem escrever uma linha de código.",
    "subscribe.faq.q2": "Como funciona a entrega para os clientes?",
    "subscribe.faq.a2":
      "Após integrar seu app com sua plataforma de vendas (Hotmart, Kiwify, etc.), o cliente receberá automaticamente o link de acesso por email assim que a compra for confirmada. Ele apenas clica e acessa o conteúdo direto no app.",
    "subscribe.faq.q3": "Posso personalizar o app com minha marca?",
    "subscribe.faq.a3":
      "Sim! Você pode personalizar cores, logo, ícone e até o domínio do app. O objetivo é que o app tenha a cara da sua marca, criando uma experiência única para seus clientes.",
    "subscribe.faq.q4": "O que acontece se eu quiser cancelar?",
    "subscribe.faq.a4":
      "Você pode cancelar a qualquer momento, sem multas ou taxas adicionais. Seu app permanece no ar até o final do período que você já pagou.",
    "subscribe.faq.q5": "Que tipo de suporte vocês oferecem?",
    "subscribe.faq.a5":
      "Oferecemos suporte por email para todos os planos. Planos Profissional e Empresarial têm acesso a suporte prioritário via WhatsApp. Nosso time está sempre pronto para ajudar você a ter sucesso.",

    // Subscribe Page - Final CTA
    "subscribe.final.title": "Pronto para Transformar seu eBook em um Aplicativo de Sucesso?",
    "subscribe.final.check1": "✓ App criado em minutos",
    "subscribe.final.check2": "✓ Integração automática com sua plataforma",
    "subscribe.final.check3": "✓ Suporte completo para começar",
    "subscribe.final.cta.primary": "Criar Meu App Agora",
    "subscribe.final.cta.whatsapp": "Falar no WhatsApp",

    // Subscribe Page - Footer
    "subscribe.footer.rights": "Todos os direitos reservados.",
    "subscribe.footer.privacy": "Política de Privacidade",
    "subscribe.footer.terms": "Termos de Uso",

    // Header
    "subscribe.header.login": "Login",
    "subscribe.header.start": "Comece Agora",
    "header.back_to_app": "Voltar ao App",

    // Hero Title Parts
    "subscribe.hero.title.part1": "Converta eBooks ultrapassados em",
    "subscribe.hero.title.part2": "Aplicativos modernos",
    "subscribe.hero.title.part3": "com poucos cliques,",
    "subscribe.hero.title.part4": "sem precisar programar.",

    // Planos Page Hero (specific for /planos route)
    "planos.hero.title.part1": "Como converter mais mudando apenas o",
    "planos.hero.title.highlight": "formato da sua entrega",
    "planos.hero.title.part2": "sem criar um novo produto",
    "planos.hero.subtitle":
      "Mesmo produto, novo formato, nova percepção. Seus clientes vão pagar preço premium (sem você programar nada)",
    "planos.hero.cta": "Transformar Meu eBook em App Agora",

    // Planos Page Ebook Section (specific for /planos route)
    "planos.ebook.problem_statement": "O problema não é o seu conhecimento. É o formato que você entrega.",
    "planos.ebook.mockup_ebook": "O primeiro soa amador.",
    "planos.ebook.mockup_app": "O segundo é profissional.",
    "planos.ebook.app_benefit_title": "O mesmo eBook, quando vira app:",
    "planos.ebook.benefit1": "Parece mais profissional",
    "planos.ebook.benefit2": "Gera mais valor percebido",
    "planos.ebook.benefit3": "Facilita a conversão",
    "planos.ebook.benefit4": "E vende mais",

    // Planos Page - 3 Steps Section
    "planos.steps.title": "Seu aplicativo pronto em 3 passos simples",
    "planos.steps.subtitle": "Você não precisa saber programar, nem lidar com parte técnica.",
    "planos.steps.step1.title": "Passo 1:",
    "planos.steps.step1.name": "Envie seu material",
    "planos.steps.step1.description":
      "Faça upload do seu eBook e pronto. Você também pode enviar áudios e adicionar vídeos. O sistema organiza tudo automaticamente dentro do app.",
    "planos.steps.step2.title": "Passo 2:",
    "planos.steps.step2.name": "Personalize em 1 minuto",
    "planos.steps.step2.description":
      "Adicione nome, cores e identidade visual para deixar o app com aparência profissional.",
    "planos.steps.step3.title": "Passo 3:",
    "planos.steps.step3.name": "Envie para seus clientes",
    "planos.steps.step3.description":
      "Compartilhe o link e o cliente instala direto no celular com um toque, sem login complicado.",
    "planos.steps.final.title": "Simples assim. Do eBook ao App em 3 minutos.",
    "planos.steps.final.subtitle": "Se você começar agora!",
    "planos.steps.final.button": "Transformar Meu eBook em App Agora",

    // Planos Page - Benefits Section
    "planos.benefits.title.part1": "O que muda quando seu ebook",
    "planos.benefits.title.highlight": "deixa de ser um arquivo",
    "planos.benefits.title.part2": "e vira um aplicativo",
    "planos.benefits.card1.title": "Cobre mais pelo mesmo produto",
    "planos.benefits.card1.desc":
      'Seu conteúdo deixa de ser "só um eBook" e passa a ser percebido como uma experiência profissional em app. Isso aumenta o valor percebido e facilita a conversão, sem você precisar criar nada novo.',
    "planos.benefits.card2.title": "Converta Mais Visitantes em Compradores",
    "planos.benefits.card2.desc":
      'Quando você oferece um app profissional em vez de um simples PDF, seu produto se destaca da concorrência. Cliente vê mais valor, confia mais e clica em "comprar" com menos resistência.',
    "planos.benefits.card3.title": "Reduza Pedidos de Reembolso em 90%",
    "planos.benefits.card3.desc":
      "Cliente que recebe um app organizado, bonito e fácil de usar fica mais satisfeito. Resultado? Menos reclamações, menos devoluções, e mais dinheiro no seu bolso.",
    "planos.benefits.card4.title": "Seus Clientes Nunca Perdem Acesso",
    "planos.benefits.card4.desc":
      "Diferente de PDF que some no celular ou se perde no e-mail, seu app fica na tela inicial do smartphone, a um clique de distância. Cliente acessa quando quiser, de qualquer dispositivo, zero dor de cabeça.",
    "planos.benefits.card5.title": "Pareça uma Grande Marca, Mesmo Sendo Solo",
    "planos.benefits.card5.desc":
      "Seu cliente abre um aplicativo com design profissional, interface organizada e navegação fluida. A experiência premium aumenta sua autoridade e gera indicações naturais.",
    "planos.benefits.card6.title": "Venda para 10 ou 10.000 Sem Mudar Nada",
    "planos.benefits.card6.desc":
      "Não importa se você tem 10 ou 10 mil clientes. O processo é o mesmo, sem precisar contratar programador, pagar servidor caro ou se preocupar com infraestrutura técnica.",
    "planos.benefits.cta.subtitle":
      "Transforme seu eBook em um app profissional que vende mais, reembolsa menos e impressiona seus clientes.",
    "planos.benefits.cta.title": "Comece agora mesmo.",
    "planos.benefits.cta.button": "Transformar Meu eBook em App Agora",

    // What MigraBook Does in Practice Section
    "planos.practice.title": "O que o MigraBook faz na prática",
    "planos.practice.block1.title": "Transforma conteúdo simples em produto profissional",
    "planos.practice.block1.pdf.title": "Materiais em PDF convertidos em aplicativo",
    "planos.practice.block1.pdf.desc":
      "Converta eBooks, guias, manuais e qualquer material PDF em um aplicativo profissional, organizado e fácil de acessar. O conteúdo deixa de ser um arquivo solto e passa a ser uma experiência direta no celular do cliente.",
    "planos.practice.block1.video.title": "Vídeos (via link) e áudios integrados ao app",
    "planos.practice.block1.video.desc":
      "Além de PDFs/eBooks, você pode complementar o conteúdo com áudios enviados por upload e vídeos adicionados via link do YouTube, todos reproduzidos dentro do aplicativo. O usuário consome tudo sem sair do app, mantendo a experiência centralizada.",

    // Block 2
    "planos.practice.block2.title": "Facilita o acesso e reduz suporte",
    "planos.practice.block2.access.title": "Acesso facilitado",
    "planos.practice.block2.access.desc":
      "O cliente recebe o link, instala o app no celular e acessa todo o conteúdo com um único toque, sem login complicado.",
    "planos.practice.block2.install.title": "Instalação rápida (Android, iOS e Web)",
    "planos.practice.block2.install.desc":
      "O cliente instala o app em segundos ou acessa direto pelo navegador, sem precisar ir à Play Store ou App Store.",
    "planos.practice.block2.whatsapp.title": "Suporte via WhatsApp dentro do app",
    "planos.practice.block2.whatsapp.desc":
      "Adicione um botão flutuante para que seu cliente fale com você com um toque. Ideal para tirar dúvidas rápidas e evitar reembolsos.",

    // Block 3
    "planos.practice.block3.title": "Mantém o conteúdo sempre atualizado e com aparência profissional",
    "planos.practice.block3.realtime.title": "Atualizações em tempo real",
    "planos.practice.block3.realtime.desc":
      "Atualize conteúdos quando quiser, sem reenviar links ou arquivos. Seu app fica sempre atualizado e o cliente sempre acessa a versão mais recente.",
    "planos.practice.block3.templates.title": "Templates premium sempre prontos",
    "planos.practice.block3.templates.desc":
      "Escolha modelos profissionais para organizar seu conteúdo e manter o visual do app moderno e bem apresentado, mesmo quando você adiciona novos materiais.",

    // Block 4
    "planos.practice.block4.title": "Aumenta vendas e engajamento",
    "planos.practice.block4.push.title": "Notificações Push",
    "planos.practice.block4.push.desc":
      "Destaque novos conteúdos, avisos e ofertas dentro do aplicativo, direcionando o usuário para ações importantes durante o uso do app.",
    "planos.practice.block4.upsell.title": "Upsell, Order Bump e Afiliados",
    "planos.practice.block4.upsell.desc":
      "Venda mais dentro do próprio aplicativo, liberando conteúdos extras, novas ofertas ou promovendo produtos como afiliado.",

    // Block 5
    "planos.practice.block5.title": "Permite escalar sem limitações",
    "planos.practice.block5.users.title": "Usuários ilimitados",
    "planos.practice.block5.users.desc": "Venda para quantas pessoas quiser, sem custo adicional por usuário.",
    "planos.practice.block5.integration.title": "Integração com plataformas de pagamento",
    "planos.practice.block5.integration.desc":
      "Conecte seu app às principais plataformas do mercado e automatize o acesso após a compra, sem processos manuais.",
    "planos.practice.block5.domain.title": "Domínio personalizado",
    "planos.practice.block5.domain.desc":
      "Seu aplicativo com o seu nome, sua marca e seu domínio, reforçando autoridade e profissionalismo.",
    "planos.practice.cta.title": "Você acabou de ver tudo que o MigraBook faz.",
    "planos.practice.cta.subtitle": "Agora veja como é fácil criar o seu.",
    "planos.practice.cta.button": "Criar Meu App em 3 Minutos",

    // Planos Page FAQ Section (specific for /planos route)
    "planos.faq.q1.question": "Quanto tempo leva para converter meu eBook em um app?",
    "planos.faq.q1.answer":
      "<strong>Em média 3 minutos.</strong> Você importa seu eBook, personaliza o visual e publica. Geração é instantânea - seu app fica pronto na hora. Nada de esperar dias ou contratar programador.",
    "planos.faq.q2.question": "Preciso saber programar para usar o Migrabook.app?",
    "planos.faq.q2.answer":
      "<strong>Zero programação.</strong> Interface 100% visual: arrasta o PDF, escolhe as cores, clica em publicar. Se você sabe fazer upload de um arquivo, sabe usar o MigraBook. Simples assim.",
    "planos.faq.q3.question": "Posso cancelar a qualquer momento?",
    "planos.faq.q3.answer":
      "<strong>Sim, cancele quando quiser.</strong> Sem multa, sem burocracia. Ao cancelar, você para apenas as renovações futuras - seu plano continua ativo até o final do período já pago. Total flexibilidade.",
    "planos.faq.q4.question": "Como funciona o Migrabook.app?",
    "planos.faq.q4.answer":
      "3 passos simples:<br/><br/>1. <strong>Importa</strong> seu eBook/PDF na plataforma<br/>2. <strong>Personaliza</strong> cores, logo e nome (vê a prévia em tempo real)<br/>3. <strong>Publica</strong> - MigraBook gera o app automaticamente<br/><br/>Cliente compra → recebe link → instala em 10 segundos → acessa conteúdo. Sem login, sem senha, sem complicação.",
    "planos.faq.q5.question": "Funciona para qualquer tipo de conteúdo ou nicho?",
    "planos.faq.q5.answer":
      "<strong>Sim, qualquer nicho.</strong> Fitness, nutrição, finanças, marketing, culinária, educação, desenvolvimento pessoal - se você tem conteúdo digital (eBook, guia, manual, curso em vídeo), funciona no MigraBook.",
    "planos.faq.q6.question": "O cliente precisa baixar o app no smartphone?",
    "planos.faq.q6.answer":
      "<strong>Sim, mas é instantâneo.</strong> Cliente clica no link → botão 'Adicionar à Tela Inicial' → app vai direto pro celular. <strong>Leva 10 segundos, sem ir em loja nenhuma.</strong> Acesso imediato e simples.",
    "planos.faq.q7.question": "O cliente consegue acessar pelo computador?",
    "planos.faq.q7.answer":
      "<strong>Sim, funciona perfeitamente.</strong> Mesmo app funciona no celular, tablet e computador. Tela se adapta automaticamente - experiência fluida em qualquer dispositivo.",
    "planos.faq.q8.question": "Posso atualizar o conteúdo do app depois de publicado?",
    "planos.faq.q8.answer":
      "<strong>Sim, quando quiser.</strong> Achou um erro? Quer adicionar conteúdo novo? Atualiza no painel e <strong>todos os seus clientes veem a mudança automaticamente</strong> - sem reenviar link, sem pedir pra baixar de novo. Sempre atualizado.",
    "planos.faq.q9.question": "Tem limite de clientes ou usuários no meu app?",
    "planos.faq.q9.answer":
      "<strong>Zero limite.</strong> Venda para 10, 100 ou 10 mil pessoas - preço não muda. Usuários ilimitados em todos os planos. Quanto mais você vende, mais você lucra - sem custo extra por cliente.",
    "planos.faq.q10.question": "O pagamento do meu cliente acontece dentro do app?",
    "planos.faq.q10.answer":
      "<strong>Não, o pagamento é na sua plataforma</strong> (Hotmart, Kiwify, Eduzz, etc). Funciona assim:<br/><br/>Cliente compra → MigraBook detecta a compra → envia link do app automaticamente por e-mail → Cliente instala em 10 segundos.<br/><br/><strong>Você não faz nada manualmente.</strong> Tudo automatizado.",
    "planos.faq.q11.question": "Posso colocar o aplicativo na Play Store ou App Store?",
    "planos.faq.q11.answer":
      "<strong>Não precisa.</strong> O MigraBook cria um aplicativo no formato PWA (WebApp instalável), que funciona como app no celular, mas sem precisar publicar nas lojas. Publicar em lojas custa caro (US$ 25–99/ano) e é burocrático (aprovação pode levar semanas). Com o MigraBook, você envia o link e pronto — o cliente instala na tela inicial e acessa em segundos. Mais rápido, mais barato, zero burocracia.",
    "planos.faq.q12.question": "Posso adicionar vídeos dentro do app?",
    "planos.faq.q12.answer":
      "<strong>Sim, no Plano Empresarial.</strong> Adicione vídeos do YouTube por link. Player roda dentro do app - cliente assiste sem sair, sem abrir navegador. Experiência completa e profissional.",
    "planos.faq.q13.question": "Posso vender em outros países ou idiomas?",
    "planos.faq.q13.answer":
      "<strong>Sim, funciona globalmente.</strong> App funciona em qualquer idioma. Traduza seu conteúdo e venda nos EUA, Europa ou América Latina. Mesma ferramenta, mercado 5-10x maior, lucro em dólar.",
    "planos.faq.q14.question": "Como é o suporte? Vou ficar sozinho?",
    "planos.faq.q14.answer":
      "<strong>Suporte via WhatsApp e e-mail.</strong> Equipe responde em até 2h úteis. Além disso, temos tutoriais em vídeo e base de conhecimento completa. Você não fica sozinho no processo.",
    "planos.faq.q15.question": "Como funciona o cancelamento?",
    "planos.faq.q15.answer":
      "<strong>Cancele quando quiser, sem multa.</strong> O cancelamento paralisa apenas renovações futuras, você mantém acesso até o final do período já pago. Não há reembolso de valores já cobrados. Sem pegadinha, sem burocracia, total flexibilidade.",
    "planos.faq.q16.question": "O que acontece se eu cancelar minha assinatura?",
    "planos.faq.q16.answer":
      "<strong>Após o fim do período pago, o app para de funcionar</strong> e seus clientes perdem acesso ao conteúdo.<br/><br/><strong>Antes de cancelar:</strong> Exporte sua lista de clientes e considere migrar para outro formato de entrega (PDF, área de membros, etc) se quiser manter o conteúdo disponível para eles.",

    // Ebook Section
    "subscribe.ebook.title":
      "Aqui está o porquê seus eBooks não entregam mais o valor que você imagina e como transformá-los em um produto de verdade.",
    "subscribe.ebook.para1":
      "Na sua oferta, só de falar a palavra “ebook” seu potencial cliente já perde metade do interesse.",
    "subscribe.ebook.para2": "Isso porque “ebook” soa como algo barato, comum e facilmente substituível.",
    "subscribe.ebook.test_title": "Faça um teste rápido (apenas leia em voz alta):",
    "subscribe.ebook.test_ebook": '"Estou vendendo um',
    "subscribe.ebook.test_ebook_word": "ebook",
    "subscribe.ebook.test_subject": 'sobre emagrecimento."',
    "subscribe.ebook.test_app": '"Estou vendendo um',
    "subscribe.ebook.test_app_word": "aplicativo",
    "subscribe.ebook.difference_question": "Percebe a diferença?",
    "subscribe.ebook.mockup_ebook": "O primeiro parece um arquivo.",
    "subscribe.ebook.mockup_app": "O segundo parece um produto.",
    "subscribe.ebook.app_experience_title": "Aplicativo é experiência, é praticidade, é status.",
    "subscribe.ebook.app_experience_para1":
      "É algo que fica na tela inicial do smartphone, não perdido no download ou numa pasta.",
    "subscribe.ebook.app_experience_para2": "Seu cliente sente isso na hora.",
    "subscribe.header.language": "Idioma",
    "subscribe.header.portuguese": "Português",
    "subscribe.header.english": "English",
    "subscribe.header.spanish": "Español",
    "subscribe.header.light_mode": "Modo Claro",
    "subscribe.header.dark_mode": "Modo Escuro",
    "subscribe.header.menu": "Menu",

    // CustomizationPanel - Video Course
    "custom.videoCourse.title": "Curso em Vídeo",
    "custom.videoCourse.description": "Adicione módulos e vídeos do YouTube",
    "custom.videoCourse.titleLabel": "Título do Curso em Vídeo",
    "custom.videoCourse.titlePlaceholder": "Curso em Vídeo",
    "custom.videoCourse.descriptionLabel": "Descrição do Curso",
    "custom.videoCourse.descriptionPlaceholder": "Descrição do Curso",
    "custom.videoCourse.buttonTextLabel": "Texto do Botão",
    "custom.videoCourse.buttonTextPlaceholder": "Assistir Aulas",
    "custom.videoCourse.iconLabel": "Ícone do Curso",
    "custom.videoCourse.coverLabel": "Capa do Curso",
    "custom.videoCourse.addModule": "+ Adicionar Módulo",
    "custom.videoCourse.moduleTitlePlaceholder": "Nome do Módulo",
    "custom.videoCourse.videoTitlePlaceholder": "Título do Vídeo",
    "custom.videoCourse.videoLinkPlaceholder": "Link do YouTube",
    "custom.videoCourse.addVideo": "+ Adicionar Vídeo",
    "custom.videoCourse.removeModule": "Remover Módulo",
    "custom.videoCourse.removeVideo": "Remover Vídeo",

    // CustomizationPanel - Colors
    "custom.colors.textColor": "Cor do texto",
    "custom.colors.bonusColor": "Cor do bônus",
    "custom.template.logo": "Logo do Template",

    // PWA Install Banner
    "pwa.install.title": "Instalar Aplicativo",
    "pwa.install.app": "Aplicativo",
    "pwa.install.follow": "Siga os passos abaixo:",
    "pwa.install.understood": "Entendi",
    "pwa.install.tap": "Toque para instalar",
    "pwa.install.one_tap": "Instale com um toque",
    "pwa.install.add": "Adicione à sua tela inicial",
    "pwa.install.now": "Instalar",
    "pwa.install.how": "Como instalar",
    "pwa.install.later": "Depois",
    "pwa.copy.link": "Copiar link",
    // iOS Safari
    "pwa.ios.safari.step1": "Toque em Compartilhar (ícone ↑)",
    "pwa.ios.safari.step2": "Adicionar à Tela de Início",
    "pwa.ios.safari.step3": "Toque em Adicionar",
    // iOS outros navegadores
    "pwa.ios.other.warning": "No iPhone, apps só podem ser instalados pelo Safari",
    "pwa.ios.other.step1": "Copie e abra este link no Safari",
    "pwa.ios.other.step2": "Toque em Compartilhar (ícone ↑)",
    "pwa.ios.other.step3": "Adicionar à Tela de Início",
    // Android Chrome
    "pwa.android.chrome.step1": "Toque no menu (⋮) no canto",
    "pwa.android.chrome.step2": "Adicionar à tela inicial",
    // Android Samsung
    "pwa.android.samsung.step1": "Toque no menu (≡) na barra",
    "pwa.android.samsung.step2": "Adicionar à tela inicial",
    // Android Firefox
    "pwa.android.firefox.step1": "Toque no menu (⋮)",
    "pwa.android.firefox.step2": "Instalar",
    // Android genérico
    "pwa.android.generic.step1": "Abra o menu do navegador",
    "pwa.android.generic.step2": "Adicionar à tela inicial",
    // Desktop
    "pwa.desktop.step1": "Clique no menu do navegador",
    "pwa.desktop.step2": "Instalar aplicativo",

    // Credit Card Form
    "payment.title": "Finalizar Assinatura",
    "payment.cycle.title": "Ciclo de Cobrança",
    "payment.cycle.select": "Escolha seu ciclo de pagamento",
    "payment.monthly": "Mensal",
    "payment.yearly": "Anual",
    "payment.charged.monthly": "Cobrado mensalmente",
    "payment.charged.yearly": "Cobrado anualmente",
    "payment.card.title": "Dados do Cartão",
    "payment.card.number": "Número do Cartão",
    "payment.card.name": "Nome no Cartão",
    "payment.card.month": "Mês",
    "payment.card.year": "Ano",
    "payment.card.cvv": "CVV",
    "payment.billing.title": "Dados de Cobrança",
    "payment.billing.email": "Email",
    "payment.billing.phone": "Telefone",
    "payment.billing.zipcode": "CEP",
    "payment.billing.address": "Endereço",
    "payment.billing.number": "Número",
    "payment.billing.complement": "Complemento",
    "payment.billing.neighborhood": "Bairro",
    "payment.billing.city": "Cidade",
    "payment.billing.state": "Estado",
    "payment.note": "* Valores podem variar conforme o ciclo de cobrança selecionado",

    // Integrations Panel
    "integrations.copy": "Copiar",
    "integrations.webhook.url": "URL do Webhook",
    "integrations.webhook.instructions": "Configure este webhook na sua plataforma",

    // Settings Panel
    "settings.platform.name": "Nome da Plataforma",
    "settings.platform.description": "Descrição da Plataforma",
    "settings.maintenance.mode": "Modo de Manutenção",
    "settings.maintenance.description": "Ativa uma página de manutenção para todos os usuários",
    "settings.general": "Geral",
    "settings.support": "Suporte",
    "settings.maintenance": "Manutenção",
    "settings.legal": "Legal",
    "settings.users": "Usuários",

    // Editor
    "editor.font.size": "Tamanho da Fonte",
    "editor.font.weight": "Peso da Fonte",
    "editor.save.text": "Salvar Texto",
    "editor.cancel": "Cancelar",
    "editor.edit.text": "Editar texto",
    "editor.style": "Estilo",
    "editor.edit.page": "Editar Página",
    "editor.saving": "Salvando...",
    "editor.save.all": "Salvar Tudo",

    // Domain Dialog extra
    "domain.description.authority": "Transmita mais autoridade usando seu próprio domínio.",
    "domain.description.request":
      "Clique no botão abaixo para solicitar a configuração. Nossa equipe técnica cuidará de toda a configuração para você. É rápido, seguro e sem complicações.",
    "domain.request.button": "Solicitar Configuração via WhatsApp",

    // Support fallback
    "support.email.subject": "Solicitação de Suporte",
    "support.email.body": "Olá, preciso de ajuda.",
    "toast.error": "Erro",

    // Admin Dashboard
    "admin.splash.full": "Splash PWA",
    "admin.splash.mobile": "PWA",
    "admin.app.select": "Selecionar App Publicado",
    "admin.pwa.full": "Config PWA",
    "admin.pwa.mobile": "PWA",
    "admin.pwa.title": "Configurações do Instalador PWA",
    "admin.pwa.description": "Configure como e quando o banner de instalação aparece para seus usuários",
    "admin.pwa.enabled": "Instalador Ativo",
    "admin.pwa.enabled.description": "Habilita ou desabilita completamente o banner de instalação",
    "admin.pwa.autoShow": "Exibir Automaticamente",
    "admin.pwa.autoShow.description": "Mostrar banner automaticamente ao acessar o app",
    "admin.pwa.dismissPersistent": "Lembrar Dispensa",
    "admin.pwa.dismissPersistent.description": "Se o usuário fechar o banner, não mostrar novamente",
    "admin.pwa.ios.description": "Configure o banner para dispositivos iOS (iPhone/iPad)",
    "admin.pwa.ios.safari.hint": "Navegador nativo do iOS",
    "admin.pwa.ios.chrome.hint": "Requer instruções para abrir no Safari",
    "admin.pwa.android.description": "Configure o banner para dispositivos Android",
    "admin.pwa.android.chrome.hint": "Instalação direta via prompt nativo",
    "admin.pwa.android.samsung.hint": "Navegador padrão em dispositivos Samsung",
    "admin.pwa.android.firefox.hint": "Navegador alternativo popular",
    "admin.pwa.android.other": "Outros navegadores",
    "admin.pwa.android.other.hint": "Opera, Edge, navegadores menos comuns",
    "admin.pwa.desktop.description": "Configure o banner para navegadores desktop",
    "admin.pwa.desktop.browsers": "Todos os navegadores",
    "admin.pwa.desktop.hint": "Chrome, Edge, Firefox e outros",
    "admin.pwa.saved": "✅ Configurações PWA salvas!",
    "admin.pwa.error": "Erro ao salvar configurações",
    "admin.saving": "Salvando...",
    "admin.save": "Salvar",

    // PWA Texts Configuration
    "admin.pwa.texts.title": "Textos Personalizáveis",
    "admin.pwa.texts.description": "Personalize os textos exibidos no banner e tela de instruções",
    "admin.pwa.texts.bannerTitle": "Título do Banner",
    "admin.pwa.texts.instructionsTitle": "Título das Instruções",
    "admin.pwa.texts.subtitleDirect": "Subtítulo (instalação direta)",
    "admin.pwa.texts.subtitleManual": "Subtítulo (instalação manual)",
    "admin.pwa.texts.installButton": "Botão Instalar",
    "admin.pwa.texts.howToButton": "Botão Como Instalar",
    "admin.pwa.texts.laterButton": "Botão Depois",
    "admin.pwa.texts.understoodButton": "Botão Entendi",
    "admin.pwa.texts.instructionsSubtitle": "Subtítulo das Instruções",
    "admin.pwa.texts.copyLinkButton": "Botão Copiar Link",
    "admin.pwa.texts.hint": "Deixe em branco para usar o texto padrão do idioma selecionado",

    // PWA Instructions Editor
    "admin.pwa.instructions.title": "Instruções de Instalação",
    "admin.pwa.instructions.description": "Personalize as instruções passo a passo para cada dispositivo/navegador",
    "admin.pwa.instructions.reset": "Restaurar Padrão",
    "admin.pwa.instructions.addStep": "Adicionar Passo",
    "admin.pwa.instructions.steps": "Passos",
    "admin.pwa.instructions.warningMessage": "Mensagem de Aviso",
    "admin.pwa.instructions.otherBrowsers": "Outros",
    "admin.pwa.instructions.show": "Editar Instruções por Dispositivo",
    "admin.pwa.instructions.hide": "Ocultar Editor de Instruções",
    "admin.pwa.instructions.iosSafari.desc": "Navegador nativo do iOS - suporta instalação PWA",
    "admin.pwa.instructions.iosOther.desc": "Outros navegadores no iOS precisam do Safari",
    "admin.pwa.instructions.androidChrome.desc": "Instalação nativa via prompt",
    "admin.pwa.instructions.androidSamsung.desc": "Navegador padrão Samsung",
    "admin.pwa.instructions.androidFirefox.desc": "Navegador alternativo popular",
    "admin.pwa.instructions.androidOther.desc": "Opera, Edge e outros navegadores",
    "admin.pwa.instructions.desktop.desc": "Chrome, Edge, Firefox e outros",

    // Visual Editor
    "visual.editor.title": "✨ Editor Visual - Subscribe Page",
    "visual.editor.subtitle.size": "Tamanho do Subtítulo",

    // Pricing Badge
    "pricing.badge.free_trial": "7 dias grátis",

    // CustomizationPanel - Template Showcase
    "custom.showcase.positionLabel": "Posição do Nome e Descrição",
    "custom.showcase.positionPlaceholder": "Selecione a posição",
    "custom.showcase.position.bottom": "Abaixo",
    "custom.showcase.position.middle": "Meio",
    "custom.showcase.position.top": "Acima",

    // CustomizationPanel - Template Members
    "custom.members.clicksPlaceholder": "Cliques até saber mais",
    "custom.members.headerSizeLabel": "Tamanho do Topo",
    "custom.members.headerSizePlaceholder": "Selecione o tamanho",
    "custom.members.headerSize.small": "Pequeno",
    "custom.members.headerSize.medium": "Médio",
    "custom.members.headerSize.large": "Grande",

    // PhoneMockup - Default placeholders
    "phonemockup.default.appName": "Nome do App",
    "phonemockup.default.appDescription": "Descrição do App",
    "phonemockup.default.mainProductLabel": "Produto Principal",
    "phonemockup.default.mainProductDescription": "Descrição do Produto",
    "phonemockup.default.bonusesLabel": "Bônus",
    "phonemockup.default.bonus1Label": "Bônus 1",
    "phonemockup.default.bonus2Label": "Bônus 2",
    "phonemockup.default.bonus3Label": "Bônus 3",
    "phonemockup.default.bonus4Label": "Bônus 4",
    "phonemockup.default.bonus5Label": "Bônus 5",
    "phonemockup.default.bonus6Label": "Bônus 6",
    "phonemockup.default.bonus7Label": "Bônus 7",
    "phonemockup.default.bonus8Label": "Bônus 8",
    "phonemockup.default.bonus9Label": "Bônus 9",
    "phonemockup.default.bonus10Label": "Bônus 10",
    "phonemockup.default.bonus11Label": "Bônus 11",
    "phonemockup.default.bonus12Label": "Bônus 12",
    "phonemockup.default.bonus13Label": "Bônus 13",
    "phonemockup.default.bonus14Label": "Bônus 14",
    "phonemockup.default.bonus15Label": "Bônus 15",
    "phonemockup.default.bonus16Label": "Bônus 16",
    "phonemockup.default.bonus17Label": "Bônus 17",
    "phonemockup.default.bonus18Label": "Bônus 18",
    "phonemockup.default.bonus19Label": "Bônus 19",
    "phonemockup.default.videoCourseTitle": "Curso em Vídeo",
    "phonemockup.default.whatsappMessage": "Olá! Vim através do app.",
    "phonemockup.default.whatsappButtonText": "Fale Conosco",
    "phonemockup.default.viewButtonLabel": "Ver",

    // Hero Section (linha 550-600)
    "subscribe.hero.main_title": "Converta eBooks ultrapassados em",
    "subscribe.hero.main_title.highlight": "Aplicativos modernos",
    "subscribe.hero.main_title.line3": "com poucos cliques,",
    "subscribe.hero.main_title.line4": "sem precisar programar.",
    "subscribe.hero.main_subtitle": "Venda mais aumentando o valor percebido sem mudar o conteúdo.",
    "subscribe.hero.main_cta": "Criar Meu App Agora!",

    // Second Section - Why eBooks Don't Work
    "subscribe.ebook.problem.main_title":
      "Aqui está o porquê seus eBooks não entregam mais o valor que você imagina e como transformá-los em um produto de verdade.",
    "subscribe.ebook.problem.para1":
      'Na sua oferta, só de falar a palavra "ebook" seu potencial cliente já perde metade do interesse.',
    "subscribe.ebook.problem.para2": 'Isso porque "ebook" soa como algo barato, comum e facilmente substituível.',
    "subscribe.ebook.problem.para3": "Faça um teste rápido (apenas leia em voz alta):",
    "subscribe.ebook.test.ebook": '"Estou vendendo um ebook sobre emagrecimento."',
    "subscribe.ebook.test.app": '"Estou vendendo um aplicativo sobre emagrecimento."',
    "subscribe.ebook.difference": "Percebe a diferença?",
    "subscribe.ebook.mockup.caption1": "O primeiro parece um arquivo.",
    "subscribe.ebook.mockup.caption2": "O segundo parece um produto.",
    "subscribe.ebook.experience.title": "Aplicativo é experiência, é praticidade, é status.",
    "subscribe.ebook.experience.para1":
      "É algo que fica na tela inicial do smartphone, não perdido no download ou numa pasta.",
    "subscribe.ebook.experience.para2": "Seu cliente sente isso na hora.",

    // Third Section - Benefits Cards
    "subscribe.benefits.main_title": "O que Muda Quando Seu",
    "subscribe.benefits.main_title.line2": "Ebook se Torna um App?",
    "subscribe.benefits.title.subtitle": "E como o Migrabook entrega essa experiência do jeito certo.",
    "subscribe.benefits.value.title": "Valor agregado",
    "subscribe.benefits.value.desc":
      "eBooks aparentam pouco valor. Um aplicativo eleva imediatamente a percepção da sua oferta.",
    "subscribe.benefits.ux.title": "Experiência do usuário",
    "subscribe.benefits.ux.desc": "Organizado, bonito, fácil de navegar. Seu cliente não precisa procurar arquivos.",
    "subscribe.benefits.monetization.title": "Monetização Inteligente",
    "subscribe.benefits.monetization.desc":
      "Use notificações dentro do App para oferecer upgrades, módulos extras e novas ofertas, aumentando suas vendas sem esforço.",
    "subscribe.benefits.identity.title": "Identidade visual consistente",
    "subscribe.benefits.identity.desc": "Logo, cores e nome personalizados. O app é realmente seu, não de terceiros.",
    "subscribe.benefits.multilang.title": "Interface multi-idioma",
    "subscribe.benefits.multilang.desc":
      "Menus, botões e mensagens podem ser traduzidos para qualquer idioma. Ideal para vender seu app em outros países.",
    "subscribe.benefits.access.title": "Facilidade de acesso",
    "subscribe.benefits.access.desc":
      "Seu cliente compra, você envia o link e pronto! Sem área de login, sem incômodo com suporte e menos reembolso.",
    "subscribe.benefits.updates.title": "Atualizações automáticas",
    "subscribe.benefits.updates.desc":
      "Precisa corrigir ou adicionar algo dentro do App? Atualize uma vez e todos recebem, sem reenviar PDF e sem retrabalho.",
    "subscribe.benefits.integration.title": "Integração direta",
    "subscribe.benefits.integration.desc":
      "Conecte seu app com qualquer plataforma (Hotmart, Kiwify, Stripe ou outra) e mantenha controle total sobre suas vendas.",
    "subscribe.benefits.migrate_now": "Migre Agora",

    // Fourth Section - Target Audience
    "subscribe.target.main_title": "Para Quem é o Migrabook.app?",
    "subscribe.target.bullet1.title": "Para quem quer aumentar as vendas com o mesmo conteúdo",
    "subscribe.target.bullet1.desc":
      "Transforme o PDF que você já tem em um aplicativo profissional e venda muito mais, apenas mudando o formato da entrega.",
    "subscribe.target.bullet3.title": 'Para quem está cansado de reembolsos por "dificuldade de acesso"',
    "subscribe.target.bullet3.desc":
      "Entregue um app que funciona perfeitamente - cliente acessa fácil, reclama menos, reembolsa menos.",
    "subscribe.target.bullet4.title": "Para quem quer proteger seu conteúdo de pirataria",
    "subscribe.target.bullet4.desc":
      "Chega de ver seu trabalho vazado em grupos de Telegram. App dificulta cópia e protege sua autoridade.",
    "subscribe.target.bullet5.title": "Para quem quer se destacar da multidão de eBooks genéricos",
    "subscribe.target.bullet5.desc":
      "Enquanto o mercado entrega PDFs baratos, você entrega um aplicativo profissional e se posiciona como autoridade.",
    "subscribe.target.bullet6.title":
      "Para quem quer vender em dólar sem complicação de idioma ou entrega internacional",
    "subscribe.target.bullet6.desc":
      "Seu app funciona em qualquer país, aceita qualquer idioma. Traduza seu conteúdo, lance nos EUA ou LATAM e lucre 5x mais em dólar. Mesmo aplicativo, lucro multiplicado.",

    // Fifth Section - Digital Knowledge Problems
    "subscribe.problems.title": "30-40% dos seus clientes travam aqui",
    "subscribe.problems.title.line2": "(e você perde a venda)",
    "subscribe.problems.title.part1": "30-40% dos seus clientes travam aqui",
    "subscribe.problems.title.part2": "(e você perde a venda)",
    "subscribe.problems.item1": "Cliente precisa criar login (e já desiste aqui)",
    "subscribe.problems.item2": "Confirmar e-mail (que vai pra spam)",
    "subscribe.problems.item3": "Lembrar senha (que ele esquece em 2 dias)",
    "subscribe.problems.item4": "Acessar área de membros (que não carrega no celular)",
    "subscribe.problems.item5": "Navegar até o conteúdo (se ele ainda tiver paciência)",
    "subscribe.problems.question": "1 em cada 3 clientes não consegue entrar",
    "subscribe.problems.warning_question": "1 em cada 3 clientes não consegue entrar",
    "subscribe.problems.result": "→ reclama que 'não recebeu'\n→ pede reembolso\n→ você perde a venda e o produto.",
    "subscribe.problems.warning_box":
      "→ reclama que 'não recebeu'\n→ pede reembolso\n→ você perde a venda e o produto.",

    // Sixth Section - How Migrabook Changes
    "subscribe.changes.title": "Com o Migrabook.app, isso muda.",
    "subscribe.changes.intro": "Você entrega seu conteúdo direto no app:",
    "subscribe.changes.benefit1": "Sem login",
    "subscribe.changes.benefit2": "Sem confirmação de e-mail",
    "subscribe.changes.benefit3": "Sem senha",
    "subscribe.changes.benefit4": "Sem suporte técnico",
    "subscribe.changes.no_login": "Sem login",
    "subscribe.changes.no_email": "Sem confirmação de e-mail",
    "subscribe.changes.no_password": "Sem senha",
    "subscribe.changes.no_support": "Sem suporte técnico",
    "subscribe.changes.success": 'Seu cliente recebe um link → Clica em "Instalar" → e pronto.',
    "subscribe.changes.success_box": 'Seu cliente recebe um link → Clica em "Instalar" → e pronto.',
    "subscribe.changes.success.detail": "Simples. Direto. E fácil.",
    "subscribe.changes.success_tagline": "Simples. Direto. E fácil.",
    "subscribe.changes.demo_link": "Clique e veja a demonstração",

    // Planos Page - Sixth Section - How Migrabook Changes (specific texts)
    "planos.changes.title": "Com o MigraBook.app, seu cliente entra em 10 segundos.",
    "planos.changes.intro": "Você entrega seu conteúdo direto no app:",
    "planos.changes.benefit1": "Sem login (cliente entra direto)",
    "planos.changes.benefit2": "Sem confirmação de e-mail (zero dificuldade)",
    "planos.changes.benefit3": "Sem senha (nunca vai esquecer)",
    "planos.changes.benefit4": "Sem suporte técnico (menos dor de cabeça)",
    "planos.changes.success_box": "Seu cliente recebe um link → Clica em 'Instalar' → Acessa em 10 segundos.",
    "planos.changes.success_tagline": "Zero dificuldade. Zero reembolso. Zero dor de cabeça.",

    // Planos Page - CTA Section
    "planos.cta.title": "Chega de perder dinheiro com reembolso por dificuldade de acesso.",
    "planos.cta.subtitle": "Transforme seu PDF em app profissional e elimine dificuldade, reclamação e reembolso.",
    "planos.cta.button": "Transformar Meu eBook em App Agora",
    "planos.cta.tagline": "Seu app pronto em 3 minutos.",

    // Planos Page - Countdown Timer
    "planos.countdown.title": "Preço Promocional Termina Em:",
    "planos.countdown.hours": "HORAS",
    "planos.countdown.minutes": "MINUTOS",
    "planos.countdown.seconds": "SEGUNDOS",
    "planos.countdown.disclaimer": "Depois volta para o preço original",

    // Planos Page - Final CTA Section
    "planos.final.urgency": "Últimas horas com preço promocional",
    "planos.final.title.part1": "Continuar vendendo eBook/PDF ou App Profissional?",
    "planos.final.title.part2": "A escolha é sua.",
    "planos.final.cta.button": "Quero Transformar Meu eBook em App Agora",
    "planos.final.cta.whatsapp": "Falar no WhatsApp",
    "planos.final.benefit1": "App pronto em 3 minutos (zero programação)",
    "planos.final.benefit2": "Suporte respondendo em até 2h",
    "planos.final.benefit3": "Cancele quando quiser (sem multa)",
    "planos.final.benefit4": "Usado por 2.347+ criadores de conteúdo",

    // Planos Page - Compare Costs
    "planos.compare.title": "Compare os custos",
    "planos.compare.developer.label": "Contratar desenvolvedor para criar 1 app do zero",
    "planos.compare.developer.price": "R$ 3.000+",
    "planos.compare.members.label": "Área de membros com limite de usuários",
    "planos.compare.members.price": "R$ 497/mês",
    "planos.compare.migrabook.label": "MigraBook sem limite de usuários",
    "planos.compare.migrabook.price": "A partir de R$ 47/mês",

    // Integration Section
    "subscribe.integration.main_title": "Sua plataforma de pagamento",
    "subscribe.integration.main_title.line2": "conectada em poucos cliques",
    "subscribe.integration.title.part1": "Sua plataforma de pagamento",
    "subscribe.integration.title.part2": "conectada",
    "subscribe.integration.title.part3": "em poucos cliques",
    "subscribe.integration.subtitle":
      "Conecte com Hotmart, Stripe, Kiwify ou qualquer outra. Seu cliente paga, você recebe e o MigraBook envia o app automaticamente por e-mail.",
    "subscribe.integration.bottom_text": "Você vende na plataforma de sua preferência. A gente cuida da entrega.",

    // Pricing Section
    "subscribe.pricing.main_title": "Planos e Preços",
    "subscribe.pricing.period.year": "/ano",
    "subscribe.pricing.period.month": "/mês",
    "subscribe.pricing.equivalent": "Equivale a R$",
    "subscribe.pricing.start_now": "Começar Agora",

    // FAQ Section
    "subscribe.faq.question1": "Como funciona o Migrabook.app?",
    "subscribe.faq.q1.question": "Como funciona o Migrabook.app?",
    "subscribe.faq.q1.answer":
      "Você importa seu eBook (PDF) na plataforma e antes de publicar, você personaliza o layout do aplicativo (cores, capa, logo, ícones e nome). Enquanto personaliza, você vê uma prévia em tempo real de como o app ficará. Depois disso, o Migrabook.app gera automaticamente um aplicativo pronto para envio. Quando seu cliente compra, ele recebe o link, instala no smartphone e acessa o conteúdo imediatamente. Sem login, senha ou área de membros.",
    "subscribe.faq.answer1":
      "Você importa seu eBook (PDF) na plataforma e antes de publicar, você personaliza o layout do aplicativo (cores, capa, logo, ícones e nome). Enquanto personaliza, você vê uma prévia em tempo real de como o app ficará. Depois disso, o Migrabook.app gera automaticamente um aplicativo pronto para envio. Quando seu cliente compra, ele recebe o link, instala no smartphone e acessa o conteúdo imediatamente. Sem login, senha ou área de membros.",
    "subscribe.faq.question2": "O cliente precisa baixar o app no smartphone?",
    "subscribe.faq.q2.question": "O cliente precisa baixar o app no smartphone?",
    "subscribe.faq.q2.answer":
      "Não. O cliente apenas adiciona o app na tela do smartphone com um único clique. O acesso é direto e imediato.",
    "subscribe.faq.answer2":
      "Não. O cliente apenas adiciona o app na tela do smartphone com um único clique. O acesso é direto e imediato.",
    "subscribe.faq.question3": "O cliente consegue acessar pelo computador?",
    "subscribe.faq.q3.question": "O cliente consegue acessar pelo computador?",
    "subscribe.faq.q3.answer":
      "Sim. O mesmo app pode ser aberto no navegador do desktop. A interface se adapta automaticamente ao tamanho da tela.",
    "subscribe.faq.answer3":
      "Sim. O mesmo app pode ser aberto no navegador do desktop. A interface se adapta automaticamente ao tamanho da tela.",
    "subscribe.faq.question3a": "Posso adicionar vídeos dentro do app criado no Migrabook.app?",
    "subscribe.faq.q3a.question": "Posso adicionar vídeos dentro do app criado no Migrabook.app?",
    "subscribe.faq.q3a.answer":
      "Sim, mas apenas no Plano Empresarial. Nessa modalidade, você pode ativar o modo 'Curso em Vídeo' e adicionar links de vídeos hospedados no YouTube. O player é exibido diretamente dentro do aplicativo, sem abrir navegador externo e sem sair do ambiente do app.",
    "subscribe.faq.answer3a":
      "Sim, mas apenas no Plano Empresarial. Nessa modalidade, você pode ativar o modo 'Curso em Vídeo' e adicionar links de vídeos hospedados no YouTube. O player é exibido diretamente dentro do aplicativo, sem abrir navegador externo e sem sair do ambiente do app.",
    "subscribe.faq.question4": "O pagamento do meu cliente acontece dentro do app?",
    "subscribe.faq.q4.question": "O pagamento do meu cliente acontece dentro do app?",
    "subscribe.faq.q4.answer":
      'Não. O pagamento acontece na plataforma de vendas da sua escolha (Hotmart, Kiwify, Eduzz, Stripe, etc). Como o Migrabook.app tem integração com as plataformas, após a compra o sistema envia automaticamente o link do app para seu cliente. Ele clica em "Instalar" e pronto. Simples. Direto. E fácil.',
    "subscribe.faq.answer4":
      'Não. O pagamento acontece na plataforma de vendas da sua escolha (Hotmart, Kiwify, Eduzz, Stripe, etc). Como o Migrabook.app tem integração com as plataformas, após a compra o sistema envia automaticamente o link do app para seu cliente. Ele clica em "Instalar" e pronto. Simples. Direto. E fácil.',
    "subscribe.faq.question5": "Posso colocar o aplicativo na Play Store ou App Store?",
    "subscribe.faq.q5.question": "Posso colocar o aplicativo na Play Store ou App Store?",
    "subscribe.faq.q5.answer":
      "Na Play Store você pagaria US$ 25 dólares. Na App Store, US$ 99 dólares. Com o Migrabook.app, você não tem esse custo.",
    "subscribe.faq.answer5":
      "Na Play Store você pagaria US$ 25 dólares. Na App Store, US$ 99 dólares. Com o Migrabook.app, você não tem esse custo.",
    "subscribe.faq.question6": "Posso atualizar o conteúdo do app depois de publicado?",
    "subscribe.faq.q6.question": "Posso atualizar o conteúdo do app depois de publicado?",
    "subscribe.faq.q6.answer":
      "Sim. Qualquer alteração feita no painel (cores, capa, logo, ícones, nome e conteúdo atualizado) aparece automaticamente para todos os usuários, sem reenviar nada para ninguém.",
    "subscribe.faq.answer6":
      "Sim. Qualquer alteração feita no painel (cores, capa, logo, ícones, nome e conteúdo atualizado) aparece automaticamente para todos os usuários, sem reenviar nada para ninguém.",
    "subscribe.faq.q6b.question": "Como funciona o cancelamento?",
    "subscribe.faq.q6b.answer":
      "O cancelamento interrompe apenas a renovação futura. Você continua com acesso até o fim do período já pago.",
    "subscribe.faq.question7": "O que acontece se eu cancelar minha assinatura do Migrabook.app?",
    "subscribe.faq.q7.question": "O que acontece se eu cancelar minha assinatura do Migrabook.app?",
    "subscribe.faq.q7.answer":
      "Seu app é desativado e seus clientes perdem o acesso. Antes de cancelar, recomendamos que você salve sua lista de compradores e defina outro formato de entrega, caso deseje manter o produto disponível para seus clientes.",
    "subscribe.faq.answer7":
      "Seu app é desativado e seus clientes perdem o acesso. Antes de cancelar, recomendamos que você salve sua lista de compradores e defina outro formato de entrega, caso deseje manter o produto disponível para seus clientes.",
    "subscribe.faq.question8": "Preciso saber programar para usar o Migrabook.app?",
    "subscribe.faq.q8.question": "Preciso saber programar para usar o Migrabook.app?",
    "subscribe.faq.q8.answer":
      "Não. O sistema é 100% intuitivo. Você só faz upload do conteúdo, ajusta o visual e publica.",
    "subscribe.faq.answer8":
      "Não. O sistema é 100% intuitivo. Você só faz upload do conteúdo, ajusta o visual e publica.",
    "subscribe.faq.question9": "Quanto tempo leva para converter meu eBook em um app?",
    "subscribe.faq.q9.question": "Quanto tempo leva para converter meu eBook em um app?",
    "subscribe.faq.q9.answer":
      "A geração é instantânea. Você importa o conteúdo e já vê a prévia do app na hora. Se quiser, pode publicar no mesmo instante.",
    "subscribe.faq.answer9":
      "A geração é instantânea. Você importa o conteúdo e já vê a prévia do app na hora. Se quiser, pode publicar no mesmo instante.",

    // Final CTA Section
    "subscribe.final.main_title": "Pronto para Transformar seu eBook em um Aplicativo de Sucesso?",
    "subscribe.final.subtitle": "Junte-se a centenas de autores que já levaram seu conteúdo para o próximo nível.",
    "subscribe.final.button.primary": "Criar Meu App Agora",
    "subscribe.final.cta.button": "Criar Meu App Agora",
    "subscribe.final.feature1": "Sem necessidade de programação",
    "subscribe.final.feature2": "Suporte completo",
    "subscribe.final.feature3": "Resultado em minutos",

    // Subscribe Page - Experience Section
    "subscribe.experience.title":
      "O que separa quem ainda vende PDF de quem constrói um produto de verdade é a experiência.",
    "subscribe.experience.hero_title":
      "O que separa quem ainda vende PDF de quem constrói um produto de verdade é a experiência.",
    "subscribe.experience.subtitle": "Pronto para sair do modelo antigo?",
    "subscribe.experience.tagline": "E experiência hoje é app.",
    "subscribe.experience.cta": "Quero Migrar Agora",
    "subscribe.experience.question": "",

    // Progress
    "progress.upload": "Upload",
    "progress.customization": "Personalização",
    "progress.publish": "Publicar",

    // Upload Section
    "upload.title": "Upload de Produtos",
    "upload.main": "Produto Principal",
    "upload.main.desc": "PDF ou ZIP do produto principal",
    "upload.bonus": "Bônus",
    "upload.bonus.desc": "Material adicional (PDF, ZIP)",
    "upload.send": "Enviar",
    "import.title": "Importar App Existente",
    "import.json": "Upload via JSON",
    "import.json.placeholder": "Cole o JSON do app...",
    "import.id": "Importar por ID",
    "import.id.placeholder": "ID do app...",
    "import.button": "Importar",

    // Phone Preview
    "preview.title": "Pré-visualização do App",

    // Index Page
    "index.app_loaded_success": "App carregado com sucesso",
    "index.app_loaded_description": "O app {appName} foi carregado para edição",

    // Customization
    "custom.title": "Personalização do App",
    "custom.name": "Nome do App",
    "custom.name.placeholder": "Digite o nome do seu app",
    "custom.color": "Cor do App",
    "custom.theme": "Tema do App",
    "custom.theme.dark": "Escuro",
    "custom.theme.light": "Claro",
    "custom.icon": "Ícone do App",
    "custom.icon.upload": "Enviar Ícone",
    "custom.cover": "Capa do App",
    "custom.cover.upload": "Enviar Capa",
    "custom.link": "Link Personalizado",
    "custom.link.placeholder": "Sua URL aqui",
    "custom.link.help": "Se deixar em branco vai gerar uma URL automática",
    "custom.link.locked": "Via domínio",
    "custom.link.managed": "O link é gerenciado através do seu domínio personalizado. Configure os paths no menu Domínio Personalizado.",
    "custom.reset": "Resetar",

    // Phone mockup
    "phone.main.title": "Insira seu título aqui",
    "phone.main.subtitle": "Baixe agora e comece a transformar seus resultados",
    "phone.main.description": "Insira sua descrição aqui",
    "phone.bonus.title": "Insira o título dos bônus aqui",
    "phone.view": "Ver",
    "phone.access": "Acessar",
    "phone.exclusive_bonus": "Bônus exclusivo",
    "phone.view.short": "Ver",
    "phone.view.pdf": "Ver",
    "phone.default.description": "Descrição do App",
    "phone.image.dimensions": "PNG ou JPG 1920x1080",
    "phone.home": "Home",
    "phone.products": "Produtos",

    // Admin Panel
    "admin.title": "Painel Administrativo",
    "admin.subtitle": "Controle total da plataforma",
    "admin.students": "Alunos",
    "admin.settings": "Configurações",
    "admin.integrations": "Integrações",
    "admin.apps": "Gerenciar Apps",
    "admin.logout": "Sair",
    "admin.preview.title": "Template Builder & Preview",
    "admin.preview.subtitle": "Crie templates personalizados e visualize como ficará seu app",

    // Admin Dashboard
    "admin.logout.error": "Erro ao sair",
    "admin.logout.success": "Logout realizado com sucesso",
    "admin.exit": "Sair",
    "admin.students.mobile": "Alunos",
    "admin.apps.mobile": "Apps",
    "admin.settings.mobile": "Config",
    "admin.integrations.mobile": "Integr",
    "admin.whatsapp.full": "WhatsApp",
    "admin.whatsapp.mobile": "WA",
    "admin.videos.full": "Vídeos",
    "admin.videos.mobile": "Vídeos",

    // Tutorial Videos Panel
    "videos.error.load": "Erro ao carregar vídeos",
    "videos.success.update": "Vídeo atualizado com sucesso!",
    "videos.success.create": "Vídeo criado com sucesso!",
    "videos.error.save": "Erro ao salvar vídeo",
    "videos.confirm.delete": "Tem certeza que deseja deletar este vídeo?",
    "videos.success.delete": "Vídeo deletado com sucesso!",
    "videos.error.delete": "Erro ao deletar vídeo",
    "videos.title": "Vídeos Tutoriais",
    "videos.subtitle": "Gerencie os vídeos de tutorial da plataforma",
    "videos.button.new": "Novo Vídeo",
    "videos.table.title": "Título",
    "videos.table.category": "Categoria",
    "videos.table.slug": "Slug",
    "videos.table.status": "Status",
    "videos.table.actions": "Ações",
    "videos.status.active": "Ativo",
    "videos.status.inactive": "Inativo",
    "videos.dialog.edit": "Editar Vídeo",
    "videos.dialog.new": "Novo Vídeo",
    "videos.dialog.description": "Preencha os dados do vídeo tutorial",
    "videos.form.title": "Título",
    "videos.form.description": "Descrição",
    "videos.form.url": "URL ou ID do YouTube",
    "videos.form.url.placeholder": "dQw4w9WgXcQ ou https://youtube.com/watch?v=...",
    "videos.form.category": "Categoria",
    "videos.form.category.placeholder": "braip, kiwify, hotmart...",
    "videos.form.slug": "Slug (identificador único)",
    "videos.form.slug.placeholder": "tutorial-braip",
    "videos.form.active": "Ativo",
    "videos.button.cancel": "Cancelar",
    "videos.button.saving": "Salvando...",
    "videos.button.save": "Salvar",

    // Students Panel
    "students.plan_updated": "Plano atualizado",
    "students.plan_updated_description": "Plano do usuário alterado para {planName} com sucesso",
    "students.current_plan": "Plano atual",
    "students.status_updated": "Status atualizado",
    "students.status_updated_description": "Status do usuário alterado para {status}",
    "students.activated": "ativado",
    "students.deactivated": "desativado",
    "students.error": "Erro",
    "students.error_update_status": "Erro ao atualizar status do usuário",
    "students.free": "Gratuito",
    "students.stripe_warning_title": "Validação do Stripe necessária",
    "students.stripe_warning_description": "A assinatura do usuário deve ser gerenciada através do Stripe",
    "students.error_update_plan": "Erro ao atualizar plano",
    "students.error_delete_user": "Erro ao deletar usuário",
    "students.user_deleted": "Usuário deletado",
    "students.user_deleted_description": "O usuário {email} foi deletado com sucesso",
    "students.error_delete": "Erro ao deletar usuário: {error}",
    "students.details_title": "Detalhes do Usuário",
    "students.details_subtitle": "Informações completas sobre o usuário",
    "students.client_data": "Dados do Cliente",
    "students.full_name": "Nome Completo",
    "students.not_informed": "Não informado",
    "students.email": "Email",
    "students.phone": "Telefone",
    "students.registration_date": "Data de Cadastro",
    "students.contracted_plan": "Plano Contratado",
    "students.apps": "apps",
    "students.published_apps": "Apps Publicados",
    "students.last_renewal_date": "Última Renovação",
    "students.app_history": "Histórico de Apps",
    "students.published": "Publicado",
    "students.draft": "Rascunho",
    "students.publication_date": "Data de Publicação",
    "students.last_edit": "Última Edição",
    "students.no_apps_found": "Nenhum app encontrado",
    "students.view_app": "Ver app",
    "students.filter_by_status": "Filtrar por status",
    "students.no_phone": "Sem telefone",
    "students.stripe": "Stripe",
    "students.manual": "Manual",
    "students.active": "Ativo",
    "students.inactive": "Inativo",
    "students.confirm_delete": "Confirmar exclusão",
    "students.confirm_delete_message":
      "Tem certeza que deseja deletar o usuário {email}? Esta ação não pode ser desfeita.",
    "students.cancel": "Cancelar",
    "students.deleting": "Deletando...",
    "students.delete": "Deletar",
    "students.no_users_found": "Nenhum usuário encontrado",
    "students.showing": "Mostrando",
    "students.of": "de",
    "students.users": "usuários",
    "students.previous": "Anterior",
    "students.next": "Próximo",
    "students.subscription_active": "Assinatura Ativa",
    "students.subscription_trialing": "Período de Teste",
    "students.subscription_past_due": "Pagamento Vencido",
    "students.subscription_unpaid": "Não Pago",
    "students.subscription_canceled": "Cancelada",
    "students.subscription_incomplete": "Incompleta",
    "students.subscription_paused": "Pausada",
    "students.subscription_unknown": "Desconhecido",
    "students.subscription_canceling": "Cancelando ao fim do período",
    "students.filter_by_stripe": "Filtrar por Stripe",
    "students.stripe_all": "Todos (Stripe)",
    "students.stripe_active": "Assinatura Ativa",
    "students.stripe_trialing": "Em Período de Teste",
    "students.stripe_past_due": "Pagamento Vencido",
    "students.stripe_canceled": "Cancelado",
    "students.stripe_unpaid": "Não Pago",
    "students.stripe_none": "Sem Stripe",

    // Player Page
    "player.no.video": "Nenhum vídeo selecionado",
    "player.param.help": "Use o parâmetro ?v= com o link ou ID do vídeo do YouTube",
    "player.example": "Exemplo: /player?v=dQw4w9WgXcQ",

    // Maintenance Page
    "maintenance.title": "Estamos em Manutenção",
    "maintenance.message": "Nosso sistema está passando por uma atualização para melhor atendê-lo.",
    "maintenance.back.soon": "Voltaremos em breve!",
    "maintenance.thanks": "Agradecemos sua paciência. Estamos trabalhando para oferecer uma experiência ainda melhor.",

    // Not Found Page
    "notfound.title": "404",
    "notfound.message": "Oops! Página não encontrada",
    "notfound.home": "Voltar para Home",

    // === DEACTIVATED APP ===
    "deactivated.banner": "Este app foi temporariamente desativado - Entre em contato com o suporte",
    "deactivated.title": "App Temporariamente Indisponível",
    "deactivated.message": "O app '{appName}' está temporariamente desativado.",
    "deactivated.contact": "Entre em contato com o suporte para mais informações.",

    // App Viewer
    "appviewer.notfound.title": "App não encontrado",
    "appviewer.notfound.message": "Este app não existe ou foi removido.",
    "appviewer.notfound.help": "Verifique se o link está correto ou entre em contato com quem compartilhou este app.",
    "admin.students.title": "Gerenciamento de Alunos",
    "admin.students.subtitle": "Controle de acesso e monitoramento de usuários",
    "admin.students.active": "ativos",
    "admin.students.search": "Buscar por email...",
    "admin.students.all": "Todos",
    "admin.students.active.filter": "Ativos",
    "admin.students.inactive": "Inativos",
    "admin.students.email": "Email",
    "admin.students.phone": "Telefone",
    "admin.students.plan": "Plano",
    "admin.students.apps": "Apps Publicados",
    "admin.students.status": "Status",
    "admin.students.created": "Data de Cadastro",
    "admin.students.actions": "Ações",
    "admin.students.details": "Ver Detalhes",
    "admin.settings.title": "Configurações do Sistema",
    "admin.settings.subtitle": "Gerencie as configurações globais da plataforma",
    "admin.settings.save": "Salvar Configurações",
    "admin.settings.language": "Idioma Padrão do Sistema",
    "admin.settings.language.placeholder": "Selecione o idioma",
    "admin.settings.terms": "Termos de Uso",
    "admin.settings.terms.placeholder": "Digite os termos de uso da plataforma...",
    "admin.settings.cancellation": "Mensagem de Cancelamento",
    "admin.settings.cancellation.placeholder": "Mensagem exibida quando o acesso é cancelado...",
    "admin.settings.cancellation.help": "Esta mensagem será exibida nos apps de usuários com acesso desativado",

    // Admin Login
    "admin.login.title": "Painel Admin",
    "admin.login.subtitle": "Acesso exclusivo para administradores",
    "admin.login.email": "Email",
    "admin.login.password": "Senha",
    "admin.login.submit": "Entrar",
    "admin.login.loading": "Entrando...",

    // Integrations
    "integrations.title": "Integrações",
    "integrations.subtitle": "Configure integrações com serviços externos",
    "integrations.save": "Salvar Configurações",
    "integrations.saving": "Salvando...",
    "integrations.activecampaign.title": "ActiveCampaign",
    "integrations.activecampaign.subtitle": "Automação de email marketing",
    "integrations.activecampaign.api_url": "API URL",
    "integrations.activecampaign.api_url.placeholder": "https://sua-conta.api-us1.com",
    "integrations.activecampaign.api_key": "API Key",
    "integrations.activecampaign.api_key.placeholder": "sua-chave-da-api",
    "integrations.make.title": "Make",
    "integrations.make.subtitle": "Automação de processos",
    "integrations.make.webhook_url": "Webhook URL",
    "integrations.make.webhook_url.placeholder": "https://hook.integromat.com/...",
    "integrations.new_title": "Nova Integração",
    "integrations.edit_title": "Editar Integração",
    "integrations.new_description": "Conecte seu produto de plataformas externas com seu app",
    "integrations.edit_description": "Modifique os campos e clique em Salvar para atualizar",
    "integrations.platform": "Plataforma",
    "integrations.platform_placeholder": "Selecione a plataforma",
    "integrations.product_id": "ID do Produto",
    "integrations.product_id_placeholder": "Insira o ID do Produto aqui",
    "integrations.app_link": "Link de Acesso (Email)",
    "integrations.app_link_placeholder": "https://seusite.com/app ou https://migrabook.app/seu-app",
    "integrations.app_link_help": "URL que será enviada no botão do email. Pode ser seu domínio personalizado ou qualquer link.",
    "integrations.save_button": "Salvar Integração",
    "integrations.active_title": "Integrações Ativas",
    "integrations.active_count": "{count} integração(ões) configurada(s)",
    "integrations.select.language": "Selecione o idioma",
    "integrations.product.id.placeholder": "Insira o ID do Produto aqui",
    "integrations.token.placeholder": "Cole aqui o token da sua conta",
    "integrations.config.kiwify": "Configuração Kiwify",
    "integrations.config.cartpanda": "Configuração Cart Panda",
    "integrations.config.perfectpay": "Configuração Perfect Pay",
    "integrations.config.stripe": "Configuração Stripe",
    "integrations.config.hotmart": "Configuração Hotmart",
    "integrations.config.eduzz": "Configuração Eduzz",
    "integrations.config.monetizze": "Configuração Monetizze",
    "integrations.config.cakto": "Configuração Cakto",
    "integrations.instructions.close": "Entendi, fechar instruções",
    "integrations.none": "Nenhuma integração configurada ainda",
    "integrations.account.id.placeholder": "Insira a Account ID aqui",
    "integrations.client.id.placeholder": "Insira o Client ID aqui",
    "integrations.client.secret.placeholder": "Insira o Client Secret aqui",
    "integrations.webhook.token.placeholder": "Insira o Token de Webhook aqui",
    "integrations.api.token.cartpanda.placeholder": "Cole aqui o Token da API do Cart Panda",
    "integrations.postback.key.placeholder": "Cole a Chave Única (Postback Key) aqui",

    // === INTEGRATIONS PANEL ===
    // Títulos principais
    "integrations.new.title": "Nova Integração",
    "integrations.new.description": "Conecte sua plataforma de pagamentos",
    "integrations.active.title": "Integrações Ativas",
    "integrations.active.count": "integração(ões) configurada(s)",

    // Labels comuns
    "integrations.platform.label": "Plataforma",
    "integrations.platform.select": "Selecione a plataforma",
    "integrations.language.label": "Idioma do App",
    "integrations.applink.label": "Link para o App",
    "integrations.productid.label": "ID do Produto",
    "integrations.webhook.url.label": "🔐 URL para configurar webhook:",
    "integrations.product.label": "Produto:",
    "integrations.validated.badge": "✓ Validado",

    // Botões
    "integrations.button.cancel": "Cancelar",
    "integrations.button.saving": "Salvando...",
    "integrations.button.update": "Atualizar Integração",
    "integrations.button.save": "Salvar Integração",
    "integrations.button.copy.success": "URL copiada!",

    // Erros e validações gerais
    "integrations.error.load": "Erro ao carregar integrações",
    "integrations.error.required": "⚠️ Campos obrigatórios",
    "integrations.error.required.description": "Preencha todos os campos obrigatórios",
    "integrations.error.save": "❌ Erro ao salvar",
    "integrations.error.delete": "Erro ao excluir",
    "integrations.success.delete": "Integração excluída!",
    "integrations.success.save": "✅ Integração salva!",
    "integrations.success.save.description": "foi configurado com sucesso",
    "integrations.success.update": "✅ Integração atualizada!",
    "integrations.success.update.description": "foi atualizado com sucesso",
    "integrations.success.validate": "✅ Produto validado!",
    "integrations.success.validate.found": "encontrado na",
    "integrations.error.invalid": "❌ Produto inválido",
    "integrations.error.validation": "Erro na validação",

    // Validações específicas - Token
    "integrations.error.token.required": "⚠️ Token obrigatório",

    // Validações específicas - Monetizze
    "integrations.error.monetizze.productid.required": "⚠️ Product ID obrigatório",
    "integrations.error.monetizze.productid.required.description": "Por favor, informe o Product ID da Monetizze",
    "integrations.error.monetizze.productid.invalid": "⚠️ Product ID inválido",
    "integrations.error.monetizze.productid.invalid.description":
      "O Product ID da Monetizze deve conter apenas números",
    "integrations.error.monetizze.key.required": "⚠️ Chave de Webhook obrigatória",
    "integrations.error.monetizze.key.required.description":
      "Por favor, informe a Chave de Webhook (postback_key) da Monetizze",
    "integrations.error.monetizze.key.invalid": "⚠️ Chave de Webhook inválida",
    "integrations.error.monetizze.key.invalid.description":
      "A Chave de Webhook deve ter pelo menos 20 caracteres e não pode conter espaços",

    // Validações específicas - Eduzz
    "integrations.error.eduzz.key.required": "⚠️ Eduzz Key obrigatória",
    "integrations.error.eduzz.key.required.description": "Por favor, informe a Chave de Webhook (Eduzz Key) da Eduzz",
    "integrations.error.eduzz.key.invalid": "⚠️ Eduzz Key inválida",
    "integrations.error.eduzz.key.invalid.description":
      "A Eduzz Key deve ter pelo menos 20 caracteres e não pode conter espaços",

    // Validações específicas - Hotmart
    "integrations.error.hotmart.credentials.required": "⚠️ Credenciais Hotmart obrigatórias",
    "integrations.error.hotmart.credentials.required.description":
      "Client ID, Client Secret e Basic Token são obrigatórios",

    // Validações específicas - Stripe
    "integrations.error.stripe.credentials.required": "⚠️ Credenciais Stripe obrigatórias",
    "integrations.error.stripe.credentials.required.description": "API Key e Webhook Token são obrigatórios",

    // Validações específicas - PayPal
    "integrations.error.paypal.credentials.required": "⚠️ Credenciais PayPal obrigatórias",
    "integrations.error.paypal.credentials.required.description": "Client ID e Secret são obrigatórios",

    // Validações específicas - Cart Panda
    "integrations.error.cartpanda.credentials.required": "⚠️ Credenciais Cart Panda obrigatórias",
    "integrations.error.cartpanda.credentials.required.description": "Bearer Token e Store Slug são obrigatórios",

    // Validações específicas - Braip
    "integrations.error.braip.credentials.required": "⚠️ Credenciais Braip obrigatórias",
    "integrations.error.braip.credentials.required.description": "Client ID e Client Secret são obrigatórios",

    // Validações específicas - Cakto
    "integrations.error.cakto.token.required": "⚠️ Webhook Token obrigatório",
    "integrations.error.cakto.token.required.description": "Informe o Token de Webhook da Cakto",

    // === CONFIGURAÇÕES POR PLATAFORMA ===

    // HOTMART
    "integrations.hotmart.title": "Configuração Hotmart",
    "integrations.hotmart.clientid.label": "Client ID",
    "integrations.hotmart.clientid.placeholder": "Cole o Client ID aqui",
    "integrations.hotmart.clientsecret.label": "Client Secret",
    "integrations.hotmart.clientsecret.placeholder": "Cole o Client Secret aqui",
    "integrations.hotmart.basictoken.label": "Basic Token",
    "integrations.hotmart.basictoken.placeholder": "Cole o Basic Token aqui",

    // STRIPE
    "integrations.stripe.title": "Configuração Stripe",
    "integrations.stripe.apikey.label": "Stripe API Key",
    "integrations.stripe.apikey.placeholder": "Cole a API Key aqui",
    "integrations.stripe.webhooktoken.label": "Webhook Token *",
    "integrations.stripe.webhooktoken.placeholder": "Cole o Token de Webhook do Stripe aqui",

    // KIWIFY
    "integrations.kiwify.title": "Configuração Kiwify",
    "integrations.kiwify.apitoken.label": "API Token (Opcional)",
    "integrations.kiwify.apitoken.placeholder": "Cole aqui o Token da API (obrigatório para validação)",
    "integrations.kiwify.accountid.label": "Account ID *",
    "integrations.kiwify.accountid.placeholder": "Ex: 12345",
    "integrations.kiwify.accountid.help": "ℹ️ Disponível em Configurações → Credenciais",

    // CART PANDA
    "integrations.cartpanda.title": "Configuração Cart Panda",
    "integrations.cartpanda.productid.label": "ID do Produto",
    "integrations.cartpanda.token.label": "Token",
    "integrations.cartpanda.token.placeholder": "Cole aqui o Token da API do Cart Panda",
    "integrations.cartpanda.storeslug.label": "Store Slug *",
    "integrations.cartpanda.storeslug.placeholder": "Ex: minhaloja",

    // PERFECT PAY
    "integrations.perfectpay.title": "Configuração Perfect Pay",
    "integrations.perfectpay.productid.label": "ID do Produto",
    "integrations.perfectpay.webhooktoken.label": "Token de Webhook",
    "integrations.perfectpay.webhooktoken.placeholder": "Insira o Token de Webhook aqui",

    // CAKTO
    "integrations.cakto.title": "Configuração Cakto",
    "integrations.cakto.productid.label": "ID do Produto",
    "integrations.cakto.webhooktoken.label": "Token de Webhook *",
    "integrations.cakto.webhooktoken.placeholder": "Cole o Token de Webhook da Cakto aqui",

    // BRAIP
    "integrations.braip.title": "Configuração Braip",
    "integrations.braip.productid.label": "ID do Produto",
    "integrations.braip.clientid.label": "Client ID *",
    "integrations.braip.clientid.placeholder": "Ex: 12345abcde",
    "integrations.braip.clientsecret.label": "Client Secret *",
    "integrations.braip.clientsecret.placeholder": "Cole o Client Secret da Braip aqui",

    // MONETIZZE
    "integrations.monetizze.title": "Configuração Monetizze",
    "integrations.monetizze.productid.label": "ID do Produto *",
    "integrations.monetizze.key.label": "Chave de Webhook (Postback Key) *",
    "integrations.monetizze.key.placeholder": "Cole a Chave de Webhook da Monetizze aqui",
    "integrations.monetizze.key.help": "ℹ️ A chave de webhook é obrigatória para validar as compras",

    // EDUZZ
    "integrations.eduzz.title": "Configuração Eduzz",
    "integrations.eduzz.productid.label": "ID do Produto *",
    "integrations.eduzz.key.label": "Chave de Webhook (Eduzz Key) *",
    "integrations.eduzz.key.placeholder": "Cole a Chave de Webhook da Eduzz aqui",
    "integrations.eduzz.key.help": "ℹ️ A chave de webhook é obrigatória para validar as compras",

    // PAYPAL
    "integrations.paypal.title": "Configuração PayPal",
    "integrations.paypal.clientid.label": "Client ID *",
    "integrations.paypal.clientid.placeholder": "Ex: AYSq3RDGsmBLJE-otTkBtM-j...",
    "integrations.paypal.secret.label": "Secret *",
    "integrations.paypal.secret.placeholder": "Cole o Secret do PayPal aqui",

    // === INSTRUÇÕES HOTMART ===
    "integrations.hotmart.instructions.title": "✅ Integração Hotmart Salva!",
    "integrations.hotmart.instructions.laststep": "Último passo:",
    "integrations.hotmart.instructions.description":
      "Configure o Webhook na Hotmart para receber notificações de compra e enviar o e-mail de acesso automaticamente.",
    "integrations.hotmart.instructions.steps.title": "📝 Passo a passo:",
    "integrations.hotmart.instructions.step1": "1. Acesse o painel da Hotmart",
    "integrations.hotmart.instructions.step1.link": "Abrir Hotmart",
    "integrations.hotmart.instructions.step2": "2. Configure o Webhook:",
    "integrations.hotmart.instructions.step2.item1": "Vá em",
    "integrations.hotmart.instructions.step2.item1.bold": "Ferramentas > Webhook",
    "integrations.hotmart.instructions.step2.item2": "Adicione a URL do Webhook (copie abaixo)",
    "integrations.hotmart.instructions.step2.item3": "Marque o evento:",
    "integrations.hotmart.instructions.step2.item3.bold": "Compra Aprovada",
    "integrations.hotmart.instructions.step2.item4": "Salve a configuração",
    "integrations.hotmart.instructions.webhook.label": "📋 URL do Webhook (copie abaixo):",

    // === INSTRUÇÕES MONETIZZE ===
    "integrations.monetizze.instructions.title": "⚠️ Monetizze será validado na primeira compra",
    "integrations.monetizze.instructions.description1":
      "Como a Monetizze não possui API de validação prévia, o sistema verificará:",
    "integrations.monetizze.instructions.check1": "Se o Product ID corresponde ao produto",
    "integrations.monetizze.instructions.check2": "Se o Postback Key é válido",
    "integrations.monetizze.instructions.description2":
      "Isso acontecerá automaticamente quando a primeira compra chegar via webhook.",
    "integrations.monetizze.instructions.steps.title": "📝 Como configurar o Webhook na Monetizze:",
    "integrations.monetizze.instructions.step1": "1. Acesse o painel da Monetizze",
    "integrations.monetizze.instructions.step1.link": "Abrir Monetizze",
    "integrations.monetizze.instructions.step2": "2. Configure o Postback:",
    "integrations.monetizze.instructions.step2.item1": "Vá em",
    "integrations.monetizze.instructions.step2.item1.bold": "Produto > Postback > Status",
    "integrations.monetizze.instructions.step2.item2": "Na opção",
    "integrations.monetizze.instructions.step2.item2.bold": "Finalizada (compra aprovada)",
    "integrations.monetizze.instructions.step2.item2.after": ", adicione a URL do Webhook abaixo",
    "integrations.monetizze.instructions.step2.item3": "Salve a configuração",
    "integrations.monetizze.instructions.webhook.label": "📋 URL do Webhook (copie abaixo):",

    // === INSTRUÇÕES EDUZZ ===
    "integrations.eduzz.instructions.title": "⚠️ Eduzz será validado na primeira compra",
    "integrations.eduzz.instructions.description1":
      "Como a Eduzz não possui API de validação prévia, o sistema verificará:",
    "integrations.eduzz.instructions.check1": "Se o Product ID corresponde ao produto",
    "integrations.eduzz.instructions.check2": "Se o Eduzz Key é válido",
    "integrations.eduzz.instructions.description2":
      "Isso acontecerá automaticamente quando a primeira compra chegar via webhook.",
    "integrations.eduzz.instructions.steps.title": "📝 Como configurar o Webhook na Eduzz:",
    "integrations.eduzz.instructions.step1": "1. Acesse o painel da Eduzz",
    "integrations.eduzz.instructions.step1.link": "Abrir Eduzz",
    "integrations.eduzz.instructions.step2": "2. Configure o Webhook:",
    "integrations.eduzz.instructions.step2.item1": "Vá em",
    "integrations.eduzz.instructions.step2.item1.bold": "Conteúdo > Webhook",
    "integrations.eduzz.instructions.step2.item2": "Adicione a URL do Webhook (copie abaixo)",
    "integrations.eduzz.instructions.step2.item3": "Marque os eventos de:",
    "integrations.eduzz.instructions.step2.item3.bold": "Venda e Cancelamento",
    "integrations.eduzz.instructions.step2.item4": "Salve a configuração",
    "integrations.eduzz.instructions.webhook.label": "📋 URL do Webhook (copie abaixo):",
    "integrations.eduzz.instructions.tip":
      "💡 Dica: Faça uma compra de teste ou use o Postman para simular uma compra e verificar se o webhook está funcionando corretamente.",

    // CustomDomainDialog
    "domain.how.works": "Como funciona:",
    "domain.name.title": "Nome do domínio",
    "domain.access.data": "Dados de acesso",
    "domain.manual.config": "Configuração manual (opcional)",
    "domain.full.config": "Configuração completa pela nossa equipe",
    "domain.whatsapp.start": "Configurar Meu Domínio",
    "domain.whatsapp.not.configured": "WhatsApp não configurado. Entre em contato com o suporte.",
    "domain.dialog.title": "Domínio Personalizado",
    "domain.intro": "Configure seu domínio personalizado e tenha sua própria identidade na web!",
    "domain.team.help":
      "Nossa equipe técnica cuidará de toda a configuração para você. É rápido, seguro e sem complicações.",
    "domain.step.1.description": "Informe qual domínio deseja usar (exemplo: meudominio.com)",
    "domain.step.2.title": "Dados de acesso",
    "domain.step.2.description":
      "Compartilhe o login e senha da plataforma onde o domínio foi registrado (exemplo: GoDaddy, HostGator, Registro.br, etc.)",
    "domain.step.3.title": "Configuração manual (opcional)",
    "domain.step.3.description":
      "Caso prefira não enviar os dados de acesso, você mesmo pode alterar os DNS seguindo nossas instruções. Enviaremos os endereços corretos para você apontar manualmente.",
    "domain.guarantee.title": "Configuração completa pela nossa equipe",
    "domain.guarantee.description":
      "Assim que recebermos as informações, faremos toda a configuração e você será notificado quando estiver ativo.",
    "domain.learn.more": "Saber mais sobre domínios personalizados",

    // Toast Messages
    "toast.logout.error.title": "Erro no logout",
    "toast.logout.error.description": "Não foi possível fazer logout",
    "toast.logout.success.title": "Logout realizado",
    "toast.logout.success.description": "Você foi desconectado com sucesso",
    "toast.login.error.title": "Erro no login",
    "toast.login.error.description": "Erro inesperado. Tente novamente.",
    "toast.login.error.invalid_credentials": "E-mail ou senha incorretos. Verifique seus dados e tente novamente.",
    "toast.login.success.title": "Login realizado com sucesso",
    "toast.login.success.description": "Verificando permissões administrativas...",
    "toast.validation.title": "Dados inválidos",
    "toast.copy.success.title": "Copiado!",
    "toast.copy.success.description": "O link foi copiado para a área de transferência.",
    "toast.copy.error.title": "Erro",
    "toast.copy.error.description": "Não foi possível copiar o link.",
    "toast.save.success.title": "Configurações salvas",
    "toast.save.success.description": "As integrações foram configuradas com sucesso",
    "toast.error.title": "Erro",
    "toast.error.description": "Ocorreu um erro inesperado",
    "toast.upload.success.title": "Upload realizado com sucesso!",
    "toast.upload.success.description": "{fileName} foi carregado.",
    "toast.upload.error.title": "Erro no upload",
    "toast.upload.error.description": "Não foi possível fazer o upload do arquivo.",
    "toast.file.invalid.title": "Formato não suportado",
    "toast.file.invalid.description": "Envie apenas PDFs ou MP3s até 100 MB.",
    "toast.file.size.title": "Arquivo muito grande",
    "toast.file.size.description": "Envie apenas PDFs ou MP3s até 100 MB.",
    "toast.import.success.title": "App importado com sucesso!",
    "toast.import.success.description": 'Dados do app "{appName}" foram carregados.',
    "toast.import.error.title": "Erro ao importar",
    "toast.import.error.description": "Não foi possível importar o app. Verifique o ID.",
    "toast.backup.success.title": "Backup criado!",
    "toast.backup.success.description": "Arquivo JSON baixado com sucesso.",
    "toast.json.import.success.title": "JSON importado com sucesso!",
    "toast.json.import.success.description": "Dados do arquivo foram carregados.",
    "toast.json.error.title": "Erro no JSON",
    "toast.json.error.description": "Arquivo JSON inválido ou formato incompatível.",
    "toast.feature.unavailable.title": "Recurso não disponível",
    "toast.feature.unavailable.description":
      "Importar app está disponível apenas nos planos Profissional e Empresarial.",

    // Customization - Tabs
    "custom.tabs.general": "Geral",
    "custom.tabs.labels": "Textos e Rótulos",

    // Customization - Form Labels
    "custom.description": "Descrição do App",
    "custom.description.placeholder": "Descrição que aparece no app...",
    "custom.domain": "Domínio Próprio",
    "custom.main.title": "Título do Produto Principal",
    "custom.main.description": "Descrição do Produto Principal",
    "custom.bonuses.title": "Título da Seção de Bônus",
    "custom.bonus.name": "Bônus",
    "custom.bonus.colors": "Cores dos Bônus",
    "custom.view.button": "Texto do Botão Ver",
    "custom.view.button.help": "Personalize o texto exibido no botão de visualização dos produtos",
    "custom.view.button.placeholder": "Insira o texto do botão 'ver'",
    "custom.bonus.thumbnail.alt": "Miniatura Bônus",

    // WhatsApp
    "whatsapp.title": "WhatsApp do App",
    "whatsapp.description": "Configure o botão de WhatsApp que aparecerá no seu app",
    "whatsapp.enable": "Ativar WhatsApp",
    "whatsapp.phone": "Número do WhatsApp",
    "whatsapp.phone_placeholder": "Ex: 5511999999999 (com código do país)",
    "whatsapp.message": "Mensagem padrão",
    "whatsapp.message_placeholder": "Olá! Vim através do app.",
    "whatsapp.button_text": "Texto do botão",
    "whatsapp.button_text_default": "Fale Conosco",
    "whatsapp.button_text_placeholder": "Ex: Fale Conosco",
    "whatsapp.button_color": "Cor do botão",
    "whatsapp.position": "Posição do botão",
    "whatsapp.position_right": "Inferior direito",
    "whatsapp.position_left": "Inferior esquerdo",
    "whatsapp.show_text": "Mostrar texto no botão ao passar o mouse",
    "whatsapp.default_message": "Olá! Vim através do app e gostaria de mais informações.",
    "whatsapp.icon_size": "Tamanho do Ícone",
    "whatsapp.size_small": "Pequeno",
    "whatsapp.size_medium": "Médio",
    "whatsapp.size_large": "Grande",

    // Import Section
    "import.select.json": "Selecione o JSON do app",
    "import.select.file": "Selecionar arquivo JSON",
    "import.backup": "Backup",
    "import.tooltip":
      "Importe dados de um app previamente criado usando JSON ou ID do app. Disponível apenas nos planos Profissional e Empresarial.",
    "import.premium.required": "Importar app está disponível apenas nos planos Profissional e Empresarial.",

    // Premium Overlays
    "premium.import.title": "Importação de Apps",
    "premium.import.description": "Importe dados de apps existentes usando JSON ou ID",
    "premium.notifications.title": "Notificações no App",
    "premium.notifications.description": "Envie notificações personalizadas dentro do seu app",
    "premium.videoCourse.title": "Curso em Vídeo",
    "premium.videoCourse.description": "Adicione módulos e aulas em vídeo do YouTube ao seu app",
    "premium.templates.upgrade": "Plano Empresarial →",
    "premium.templates.message": "Upgrade para acessar templates premium",
    "premium.plan.profissional": "Plano Profissional",
    "premium.plan.empresarial": "Plano Empresarial",
    "premium.exclusive.empresarial": "Recurso exclusivo do plano Empresarial",
    "premium.integrations.title": "Integrações com Plataformas",
    "premium.integrations.description": "Conecte automaticamente suas plataformas de venda",

    // Template Descriptions
    "template.classic.description": "Layout padrão limpo e elegante",
    "template.corporate.description": "Layout profissional para empresas",
    "template.showcase.description": "Layout moderno para destaque visual",
    "template.modern.description": "Design contemporâneo e minimalista",
    "template.minimal.description": "Interface limpa e focada no conteúdo",
    "template.exclusive.description": "Layout premium com cards coloridos e imagens circulares",

    // Premium Overlay CTA
    "premium.cta.arrow": "→",

    // Upload Section
    "upload.pdf.description": "Upload do PDF ou Áudio",
    "upload.bonus.description": "Upload do PDF ou Áudio",
    "upload.uploading": "Enviando...",
    "upload.uploaded": "Enviado",
    "upload.allow.download": "Permitir download do PDF",

    // Publish Section
    "publish.ready": "Pronto para publicar?",
    "publish.subtitle": "Publique seu app e compartilhe com o mundo!",
    "publish.plan": "Plano",
    "publish.apps": "apps",
    "publish.publishing": "Publicando...",
    "publish.checking": "Verificando limite...",
    "publish.republish": "Publicar Novamente",
    "publish.button": "Publicar App",
    "publish.saving": "Salvando rascunho...",
    "publish.review.title": "Revisar App Antes de Publicar",
    "publish.review.subtitle": "Verifique todas as informações antes de publicar seu app.",
    "publish.info.title": "Informações do App",
    "publish.info.name": "Nome:",
    "publish.info.description": "Descrição:",
    "publish.info.color": "Cor:",
    "publish.info.link": "Link personalizado:",
    "publish.info.undefined": "Não definido",
    "publish.products.title": "Produtos Carregados",
    "publish.products.main": "Produto Principal:",
    "publish.products.bonus": "Bônus",
    "publish.products.loaded": "Carregado",
    "publish.products.notloaded": "Não carregado",
    "publish.products.optional": "Opcional",
    "publish.visual.title": "Recursos Visuais",
    "publish.visual.icon": "Ícone do App:",
    "publish.visual.cover": "Capa do App:",
    "publish.back": "Voltar e Editar",
    "publish.confirm": "Confirmar e Publicar",
    "publish.success.title": "App Publicado com Sucesso!",
    "publish.success.subtitle": "Seu app está agora disponível e pode ser instalado como PWA.",
    "publish.success.link": "Link do seu app:",
    "publish.success.steps": "🎉 Próximos passos:",
    "publish.success.share": "Compartilhe o link com seus clientes",
    "publish.success.pwa": "O app pode ser instalado como PWA",
    "publish.success.track": "Confira seus apps no painel",
    "publish.limit.title": "Limite de Apps Atingido",
    "publish.limit.subtitle": "Você atingiu o limite de",
    "publish.limit.description": "Para criar mais apps, você precisa fazer upgrade do seu plano.",
    "publish.limit.upgrade": "Fazer Upgrade",

    // Custom Domain Dialog
    "domain.title": "Domínio Personalizado",
    "domain.button": "Configurar domínio personalizado",
    "domain.description": "Configure seu próprio domínio para transmitir mais profissionalismo",
    "domain.step": "Etapa",
    "domain.of": "de",
    "domain.back": "Voltar",
    "domain.continue": "Continuar",

    // Step 1
    "domain.step1.title": "Usar um domínio personalizado",
    "domain.step1.subtitle": "Transmita profissionalismo com um domínio personalizado",
    "domain.step1.own_domain": "Use seu próprio domínio",
    "domain.step1.connect": "Conecte seu domínio de terceiros",
    "domain.step1.dns_info":
      "Você precisa fazer login no seu provedor de domínio para atualizar seus registros de DNS.",
    "domain.step1.no_changes":
      "Não podemos fazer essas alterações por você, mas podemos te ajudar com um passo a passo.",
    "domain.step1.view_steps": "Ver os passos",
    "domain.step1.continue": "Continuar",

    // Step 2
    "domain.step2.title": "Use seu próprio domínio",
    "domain.step2.subtitle": "Você tem um domínio de outro provedor? Conecte esse domínio.",
    "domain.step2.placeholder": "Ex.: example.com",
    "domain.step2.verifying": "Verificando domínio...",
    "domain.step2.auto_available": "Conexão automática disponível",
    "domain.step2.manual_needed": "Domínio válido - configuração manual necessária",
    "domain.step2.invalid": "Domínio inválido",
    "domain.step2.provider_detected": "Provedor detectado:",
    "domain.step2.auto_message": "✨ Conexão automática disponível via {provider}",
    "domain.step2.manual_message": "✅ Domínio válido - configuração manual necessária",
    "domain.step2.instructions": "Instruções específicas serão fornecidas para {provider}",
    "domain.step2.verifying_button": "Verificando...",

    // Step 3
    "domain.step3.title": "Conectar automaticamente",
    "domain.step3.subtitle":
      "Detectamos que {domain} usa {provider}. Podemos conectar automaticamente usando a API do {provider}.",
    "domain.step3.info_title": "Informações do domínio:",
    "domain.step3.provider": "Provedor:",
    "domain.step3.nameservers": "Nameservers:",
    "domain.step3.confidence": "Confiança:",
    "domain.step3.confidence_high": "Alta",
    "domain.step3.confidence_medium": "Média",
    "domain.step3.confidence_low": "Baixa",
    "domain.step3.auto_connect": "Conectar automaticamente",
    "domain.step3.connecting": "Conectando...",
    "domain.step3.manual_option": "Configurar manualmente",

    // Step 4
    "domain.step4.title": "Acesse o site do seu provedor de domínio",
    "domain.step4.subtitle": "Na página de configurações de DNS, atualize seus registros seguindo estes passos.",
    "domain.step4.verified_success": "Domínio verificado com sucesso!",
    "domain.step4.verification_pending": "Verificação pendente",
    "domain.step4.a_record": "Registro A:",
    "domain.step4.txt_record": "Registro TXT:",
    "domain.step4.found": "Encontrado",
    "domain.step4.not_found": "Não encontrado",
    "domain.step4.add_a_record": "Adicionar registro A",
    "domain.step4.host": "Nome/host:",
    "domain.step4.value": "Valor/Direciona a:",
    "domain.step4.copy": "Copiar",
    "domain.step4.copied": "Copiado!",
    "domain.step4.record_added": "Registro adicionado",
    "domain.step4.mark_added": "Marcar como adicionado",
    "domain.step4.subdomain_record": "Registro A para subdomínio",
    "domain.step4.subdomain_help": "Permite que www.{domain} também funcione",
    "domain.step4.txt_title": "Registro TXT para verificar titularidade",
    "domain.step4.txt_help": "Usado para verificar que você é o dono do domínio",
    "domain.step4.verify_records": "Verificar Registros DNS",
    "domain.step4.verifying": "Verificando...",
    "domain.step4.help_title": "Precisa de ajuda?",
    "domain.step4.help_description":
      "Se você não sabe como adicionar registros DNS, consulte a documentação do seu provedor:",
    "domain.step4.help_link": "Ver guia completo de DNS",

    // Toast messages
    "domain.toast.verified.title": "Domínio verificado!",
    "domain.toast.verified.description": "Seu domínio foi configurado com sucesso",
    "domain.toast.pending.title": "Verificação pendente",
    "domain.toast.pending.description": "Configure os registros DNS e tente novamente",
    "domain.toast.error.title": "Erro na verificação",
    "domain.toast.error.description": "Não foi possível verificar o domínio",

    // Common
    "common.loading": "Carregando...",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.close": "Fechar",
    "common.try_again": "Tentar novamente",
    "common.edit": "Editar",
    "common.delete": "Deletar",
    "common.continue": "Continuar",
    "common.back": "Voltar",

    // Reset Password via Link
    "auth.reset_link_sent": "Link enviado!",
    "auth.reset_link_sent_desc": "Um link para redefinição de senha foi enviado para seu e-mail.",
    "auth.reset_password.title": "Redefinir Senha",
    "auth.reset_password.subtitle": "Crie uma nova senha para sua conta",
    "auth.reset_password.enter_new_password": "Digite sua nova senha abaixo",
    "auth.reset_password.button": "Redefinir Senha",
    "auth.reset_password.invalid_link": "Este link é inválido ou expirou. Solicite um novo link de redefinição.",
    "auth.reset_password.invalid_link_title": "Link Inválido",
    "auth.reset_password.success_redirect": "Você será redirecionado para o login em instantes...",
    "auth.reset_password.error": "Erro ao redefinir senha. Tente novamente.",
    "auth.new_password": "Nova Senha",
    "auth.new_password.placeholder": "Digite sua nova senha",
    "auth.confirm_password": "Confirmar Senha",
    "auth.confirm_password.placeholder": "Confirme sua nova senha",
    "auth.passwords_dont_match": "As senhas não coincidem",
    "auth.password_min_length": "A senha deve ter pelo menos 8 caracteres",
    "auth.resetting_password": "Redefinindo...",
    "auth.back_to_login": "Voltar ao login",
    "auth.redirecting": "Redirecionando...",

    // Cancellation Dialog
    "cancellation.step1.title": "Cancelar Assinatura",
    "cancellation.step1.description": "Sentiremos sua falta! Nos ajude a melhorar informando o motivo do cancelamento.",
    "cancellation.reason.label": "Motivo do cancelamento",
    "cancellation.reason.placeholder": "Selecione um motivo",
    "cancellation.reason.not_using": "Não vou dar andamento no meu projeto",
    "cancellation.reason.pause_project": "Vou parar por um tempo, mas pretendo voltar",
    "cancellation.reason.project_finished": "Era um projeto pontual que já foi finalizado",
    "cancellation.reason.too_expensive": "O preço ficou inviável pra mim",
    "cancellation.reason.not_adapted": "Não consegui me adaptar à ferramenta",
    "cancellation.reason.other": "Outros",
    "cancellation.feedback.label": "A gente fez alguma besteira? Nos conte o que aconteceu para a gente poder melhorar",
    "cancellation.feedback.placeholder": "Conte-nos mais sobre sua experiência...",
    "cancellation.step2.title": "Antes de ir, leia isso...",
    "cancellation.step2.message1":
      "É uma pena que você não queira seguir com o MigraBook. Notei que você ainda está com acesso ativo, certo? Se precisar de mais alguns dias para testar ou de alguma ajuda específica, a gente com certeza pode te ajudar!",
    "cancellation.step2.benefits_title": "Além disso, mantendo sua conta ativa:",
    "cancellation.step2.benefit1": "Você não perde seu histórico de apps criados",
    "cancellation.step2.benefit2": "Continua recebendo atualizações e novos recursos",
    "cancellation.step2.benefit3": "Pode voltar quando quiser sem precisar configurar tudo novamente",
    "cancellation.step2.message2":
      "Se preferir, podemos entrar em contato para resolver isso antes que você decida pelo cancelamento! O que você prefere?",
    "cancellation.step2.keep_subscription": "Não, quero continuar!",
    "cancellation.step2.confirm_cancel": "Sim, cancelar",
    "cancellation.step3.title": "Cancelamento Agendado",
    "cancellation.step3.access_until": "Seu acesso permanece ativo até:",
    "cancellation.step3.reactivate_message":
      "Mudou de ideia? Você pode reativar sua assinatura a qualquer momento antes da data de expiração.",
    "cancellation.step3.reactivate_button": "Reativar Assinatura",

    // Privacy Policy
    "privacy.back": "Voltar",
    "privacy.title": "Política de Privacidade — Migrabook.app",
    "privacy.last_updated": "Última atualização",

    "privacy.section1.title": "1. INFORMAÇÕES QUE COLETAMOS",
    "privacy.section1.intro":
      "Coletamos apenas as informações necessárias para o funcionamento da plataforma e para garantir uma boa experiência de uso. Essas informações incluem:",
    "privacy.section1.item1": "Dados de cadastro: nome, e-mail, telefone e senha de acesso.",
    "privacy.section1.item2": "Dados de pagamento e faturamento, quando aplicável.",
    "privacy.section1.item3":
      "Dados técnicos: endereço IP, tipo e versão do navegador, idioma, dispositivo utilizado e data de acesso.",
    "privacy.section1.item4": "Informações de uso: número de apps criados, publicações e preferências salvas.",
    "privacy.section1.footer":
      "Esses dados são utilizados de forma segura e confidencial, com acesso restrito apenas à equipe autorizada do Migrabook.app.",

    "privacy.section2.title": "2. COMO USAMOS SUAS INFORMAÇÕES",
    "privacy.section2.intro": "As informações coletadas são utilizadas para:",
    "privacy.section2.item1": "Criar e manter sua conta ativa no Migrabook.app;",
    "privacy.section2.item2": "Processar pagamentos e gerenciar assinaturas;",
    "privacy.section2.item3":
      "Enviar notificações transacionais, como lembretes de renovação de plano, avisos de suporte técnico e mudanças importantes nos serviços;",
    "privacy.section2.item4": "Melhorar a segurança, estabilidade e desempenho da plataforma;",
    "privacy.section2.item5": "Oferecer suporte e atendimento quando solicitado.",
    "privacy.section2.footer":
      "O Migrabook.app não utiliza seus dados para publicidade de terceiros nem realiza venda ou troca de informações pessoais.",

    "privacy.section3.title": "3. COMPARTILHAMENTO DE INFORMAÇÕES",
    "privacy.section3.intro":
      "Podemos compartilhar informações com provedores de serviço de pagamento, como Stripe, PayPal, Hotmart, Kiwify, Eduzz e outros semelhantes, exclusivamente para processar transações realizadas por você. Esse compartilhamento é limitado, seguro e realizado apenas quando necessário para a execução do serviço contratado.",
    "privacy.section3.item1":
      "Não compartilhamos seus dados com terceiros para fins comerciais, de marketing ou publicidade.",
    "privacy.section3.item2":
      "Compartilhamento ocorre apenas com: provedores de serviços necessários, autoridades legais quando exigido por lei, ou com seu consentimento explícito.",
    "privacy.section3.footer": "",

    "privacy.section4.title": "4. SEGURANÇA DAS INFORMAÇÕES",
    "privacy.section4.content":
      "Adotamos medidas técnicas e administrativas adequadas para proteger suas informações contra acessos não autorizados, perda, uso indevido, alteração ou destruição. Todo o tráfego de dados é criptografado, e os servidores seguem padrões internacionais de segurança. Apesar disso, nenhum sistema é 100% imune a riscos, e o usuário também é responsável por manter a confidencialidade de suas credenciais de acesso.",

    "privacy.section5.title": "5. RETENÇÃO E EXCLUSÃO DE DADOS",
    "privacy.section5.intro":
      "Seus dados serão mantidos enquanto sua conta estiver ativa. Caso decida encerrar sua conta, as informações pessoais serão excluídas de nossos sistemas, exceto quando houver obrigação legal de retenção, como registros fiscais e contábeis.",
    "privacy.section5.content":
      "Você pode solicitar a exclusão de seus dados a qualquer momento através do suporte oficial.",

    "privacy.section6.title": "6. COOKIES E DADOS DE NAVEGAÇÃO",
    "privacy.section6.intro": "O Migrabook.app pode utilizar cookies e tecnologias semelhantes para:",
    "privacy.section6.item1": "Lembrar suas preferências de login;",
    "privacy.section6.item2": "Otimizar a navegação e desempenho do site;",
    "privacy.section6.item3": "Coletar informações agregadas para análise de uso.",
    "privacy.section6.footer":
      "Você pode desativar os cookies nas configurações do navegador, mas isso pode limitar algumas funcionalidades da plataforma.",

    "privacy.section7.title": "7. DIREITOS DO USUÁRIO",
    "privacy.section7.intro": "De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), o usuário pode:",
    "privacy.section7.item1": "Acessar e corrigir suas informações;",
    "privacy.section7.item2": "Solicitar a exclusão de dados pessoais;",
    "privacy.section7.item3": "Revogar o consentimento para uso de dados;",
    "privacy.section7.item4": "Solicitar informações sobre o uso e compartilhamento de seus dados;",
    "privacy.section7.item5": "Solicitar a portabilidade de seus dados.",
    "privacy.section7.footer":
      "Essas solicitações podem ser feitas diretamente através do canal de suporte: suporte@migrabook.app",

    "privacy.section8.title": "8. CONTEÚDO PUBLICADO PELOS USUÁRIOS",
    "privacy.section8.intro":
      "O Migrabook.app atua apenas como ferramenta de criação e hospedagem de aplicativos. Todo conteúdo inserido, publicado ou compartilhado dentro dos apps criados é de responsabilidade exclusiva do usuário.",
    "privacy.section8.content":
      "O Migrabook.app não realiza curadoria, revisão ou validação prévia do material publicado pelos clientes.",

    "privacy.section9.title": "9. CANCELAMENTO E NÃO REEMBOLSO",
    "privacy.section9.content":
      "Os planos do Migrabook.app são cobrados mensal ou anualmente, conforme a modalidade de assinatura escolhida pelo usuário. O cancelamento pode ser solicitado a qualquer momento, diretamente pela plataforma ou pelos canais oficiais de suporte. Após o cancelamento, não há reembolso de valores já pagos, independentemente do tempo de uso. O usuário continuará tendo acesso ao sistema até o final do ciclo de cobrança já quitado. Após esse período, o acesso será automaticamente encerrado.",

    "privacy.section10.title": "10. ALTERAÇÕES NESTA POLÍTICA",
    "privacy.section10.content":
      "Esta Política de Privacidade pode ser atualizada a qualquer momento para refletir mudanças legais, técnicas ou operacionais. A data da última atualização será sempre indicada no início deste documento. Recomenda-se revisar esta política periodicamente.",

    "privacy.section11.title": "11. CONTATO",
    "privacy.section11.content":
      "Em caso de dúvidas, solicitações ou reclamações sobre esta Política de Privacidade, entre em contato através de:",
    "privacy.section11.email": "E-mail: suporte@migrabook.app",
    "privacy.section11.website": "Website: https://migrabook.app",

    "privacy.section12.title": "12. LEI APLICÁVEL E FORO",
    "privacy.section12.content":
      "Esta Política é regida pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Bernardo do Campo, Estado de São Paulo, para dirimir quaisquer controvérsias, com renúncia expressa de qualquer outro, por mais privilegiado que seja.",

    // Terms of Service
    "terms.back": "Voltar",
    "terms.title": "Termos de Uso — Migrabook.app",
    "terms.last_updated": "Última atualização",
    "terms.intro":
      "Bem-vindo ao Migrabook.app. Ao acessar ou utilizar nossa plataforma, você concorda com os termos e condições descritos abaixo. Recomendamos a leitura atenta deste documento antes de criar uma conta.",

    "terms.section1.title": "1. SOBRE O MIGRABOOK.APP",
    "terms.section1.content":
      "O Migrabook.app é uma plataforma online que permite a criação e personalização de aplicativos baseados em tecnologia PWA (Progressive Web App). Destina-se a produtores digitais, infoprodutores e empreendedores que desejam entregar seus conteúdos digitais (como eBooks, cursos, guias e materiais informativos) em formato de aplicativo, sem precisar programar.",

    "terms.section2.title": "2. CONTA E ACESSO",
    "terms.section2.intro":
      "Para utilizar o Migrabook.app, é necessário criar uma conta com informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas sob sua conta.",
    "terms.section2.requirement": "O uso da plataforma é pessoal e intransferível.",

    "terms.section3.title": "3. PLANOS, COBRANÇAS E CANCELAMENTOS",
    "terms.section3.intro":
      "O Migrabook.app oferece planos mensais e anuais, com valores e recursos específicos (Essencial, Profissional e Empresarial). Os preços e condições podem ser atualizados a qualquer momento, com aviso prévio no painel do usuário.",
    "terms.section3.cancellation.title": "3.1 Cancelamento",
    "terms.section3.cancellation.content":
      "O cancelamento da assinatura pode ser feito a qualquer momento, diretamente no painel do usuário ou entrando em contato com o suporte. Ao cancelar, o acesso aos aplicativos criados será suspenso ao final do ciclo já pago (mensal ou anual). Não há reembolso proporcional de períodos não utilizados.",

    "terms.section4.title": "4. CONTEÚDO E RESPONSABILIDADE DO USUÁRIO",
    "terms.section4.intro":
      "O usuário é o único responsável por todo o conteúdo enviado, publicado ou distribuído por meio do Migrabook.app — incluindo textos, imagens, vídeos, arquivos PDF e outros materiais.",
    "terms.section4.declaration.intro": "Ao utilizar a plataforma, o usuário declara que:",
    "terms.section4.declaration.item1": "Possui os direitos autorais ou autorização para usar o conteúdo publicado;",
    "terms.section4.declaration.item2":
      "O conteúdo não infringe direitos de terceiros, marcas registradas ou propriedade intelectual;",
    "terms.section4.declaration.item3":
      "O conteúdo não contém material ofensivo, difamatório, ilegal ou que viole as leis vigentes.",
    "terms.section4.rights":
      "O Migrabook.app se reserva o direito de suspender ou excluir aplicativos que violem estas condições.",

    "terms.section5.title": "5. LIMITAÇÃO DE RESPONSABILIDADE",
    "terms.section5.intro":
      "O Migrabook.app atua exclusivamente como ferramenta de criação e hospedagem de aplicativos.",
    "terms.section5.not_responsible.intro": "Não nos responsabilizamos por:",
    "terms.section5.not_responsible.item1": "Disputas entre o usuário e seus clientes finais;",
    "terms.section5.not_responsible.item2":
      "Reembolsos, bloqueios de conta ou falhas em plataformas de pagamento externas (como Hotmart, Kiwify, Eduzz, Stripe, PayPal ou similares);",
    "terms.section5.not_responsible.item3": "Problemas causados por conteúdo inserido pelo usuário;",
    "terms.section5.not_responsible.item4":
      "Quaisquer danos indiretos, lucros cessantes ou prejuízos decorrentes do uso incorreto da plataforma.",

    "terms.section6.title": "6. DISPONIBILIDADE E ATUALIZAÇÕES",
    "terms.section6.content":
      "A plataforma poderá passar por atualizações e melhorias contínuas. Nos comprometemos a manter o serviço disponível, salvo em casos de manutenção programada, força maior ou fatores externos fora do nosso controle.",

    "terms.section7.title": "7. CANCELAMENTO OU SUSPENSÃO POR PARTE DO MIGRABOOK.APP",
    "terms.section7.intro": "Podemos suspender ou encerrar o acesso do usuário em casos de:",
    "terms.section7.item1": "Violação dos Termos de Uso;",
    "terms.section7.item2": "Práticas fraudulentas ou uso indevido da plataforma;",
    "terms.section7.item3": "Atraso recorrente nos pagamentos;",
    "terms.section7.item4": "Uso que possa comprometer a segurança ou estabilidade do sistema.",

    "terms.section8.title": "8. PROPRIEDADE INTELECTUAL",
    "terms.section8.content":
      "Todo o design, código, estrutura e tecnologia do Migrabook.app pertencem exclusivamente à D. Piola dos Santos Negócios Digitais LTDA. É proibido copiar, modificar, redistribuir ou criar serviços derivados da plataforma sem autorização expressa. Os aplicativos criados pelos usuários permanecem de sua titularidade, respeitando os direitos sobre o conteúdo inserido.",

    "terms.section9.title": "9. SUPORTE E COMUNICAÇÃO",
    "terms.section9.content":
      "O suporte é oferecido por e-mail e, nos planos elegíveis, via WhatsApp. Canais oficiais de atendimento são informados dentro do painel do usuário.",

    "terms.section10.title": "10. ALTERAÇÕES DOS TERMOS",
    "terms.section10.content":
      "O Migrabook.app pode atualizar estes Termos de Uso periodicamente. Alterações relevantes serão comunicadas aos usuários por e-mail ou aviso dentro da plataforma. O uso contínuo após a atualização implica aceitação das novas condições.",

    "terms.section11.title": "11. LEI APLICÁVEL E FORO",
    "terms.section11.content":
      "Este contrato é regido pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Bernardo do Campo, Estado de São Paulo, para dirimir eventuais controvérsias, com renúncia de qualquer outro, por mais privilegiado que seja.",

    "terms.section12.title": "12. CONTATO",
    "terms.section12.intro": "Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail:",
    "terms.section12.email": "📩 suporte@migrabook.app",
    "common.view": "Ver",
    "common.download": "Baixar",
    "common.upload": "Enviar",
    "common.active": "Ativo",
    "common.inactive": "Inativo",
    "common.yes": "Sim",
    "common.no": "Não",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.all": "Todos",

    // Validation
    "validation.email.invalid": "Email inválido",
    "validation.password.min": "Senha deve ter pelo menos 6 caracteres",
    "validation.required": "Este campo é obrigatório",
    "validation.file.too_big": "Arquivo muito grande",
    "validation.image.too_big": "Imagem deve ter no máximo 10MB",
    "validation.pdf.too_big": "PDF ou MP3 deve ter no máximo 100MB",
    "validation.file.invalid_type": "Tipo de arquivo não suportado. Use PDF, MP3 ou imagens PNG/JPG.",
    "validation.file.generic": "Erro na validação do arquivo",

    // Status Messages
    "status.checking_permissions": "Verificando permissões...",
    "status.loading_data": "Carregando dados...",
    "status.saving": "Salvando...",
    "status.uploading": "Enviando...",

    // Auth Form
    "auth.full_name": "Nome Completo",
    "auth.full_name.placeholder": "Seu nome completo",
    "auth.email": "Email",
    "auth.email.placeholder": "seu@email.com",
    "auth.phone": "Telefone",
    "auth.phone.placeholder": "Digite seu telefone",
    "auth.password": "Senha",
    "auth.password.placeholder": "••••••••",
    "auth.login.title": "Faça login na sua conta",
    "auth.login.subtitle": "Entre para acessar seus apps",
    "auth.signup.title": "Crie sua conta",
    "auth.signup.subtitle": "Comece a criar seus apps agora mesmo",
    "auth.login.button": "Entrar",
    "auth.signup.button": "Criar Conta",
    "auth.login.loading": "Entrando...",
    "auth.signup.loading": "Criando conta...",
    "auth.app.subtitle": "Converta seu ebook para app em minutos",
    "auth.terms.text": "Ao criar uma conta, você concorda com nossos",
    "auth.terms.link": "Termos de Uso",
    "auth.terms.and": "e",
    "auth.privacy.link": "Política de Privacidade",
    "auth.forgot_password": "Esqueceu sua senha?",
    "auth.forgot_password.title": "Recuperar Senha",
    "auth.forgot_password.description": "Digite seu e-mail para receber um link de recuperação de senha",
    "auth.forgot_password.email.placeholder": "Digite seu e-mail",
    "auth.forgot_password.send": "Enviar Link",
    "auth.forgot_password.sending": "Enviando...",
    "auth.forgot_password.success.title": "E-mail enviado!",
    "auth.forgot_password.success.description": "Verifique sua caixa de entrada para recuperar sua senha",
    "auth.forgot_password.error.title": "Erro ao enviar",
    "auth.forgot_password.error.description": "Não foi possível enviar o e-mail. Tente novamente.",
    "auth.no_account": "Não tem uma conta?",
    "auth.create_account": "Assine um Plano.",

    // Pricing Page
    "pricing.title": "Planos e Preços",
    "pricing.subtitle": "Selecione um plano para continuar.",
    "pricing.free_trial_button": "Teste grátis por 7 dias",
    "pricing.billing.monthly": "Mensal",
    "pricing.billing.annual": "Anual",
    "pricing.billing.save": "2 meses grátis",
    "pricing.billing.year": "ano",
    "pricing.billing.month": "mês",
    "pricing.billing.equivalent": "Equivale a",
    "pricing.popular": "Recomendado",
    "pricing.plan.essencial": "Essencial",
    "pricing.plan.essencial.name": "Essencial",
    "pricing.plan.profissional": "Profissional",
    "pricing.plan.profissional.name": "Profissional",
    "pricing.plan.empresarial": "Empresarial",
    "pricing.plan.empresarial.name": "Empresarial",
    "pricing.plan.essencial.apps": "1 aplicativo",
    "pricing.plan.profissional.apps": "3 aplicativos",
    "pricing.plan.empresarial.apps": "6 aplicativos",
    "pricing.plan.essencial.badge": "7 dias grátis",
    "pricing.plan.essencial.description": "1 Aplicativo",
    "pricing.plan.profissional.description": "3 Aplicativos",
    "pricing.plan.empresarial.description": "6 Aplicativos",
    "pricing.plan.essencial.pdfs": "PDFs ilimitados",
    "pricing.plan.profissional.pdfs": "PDFs ilimitados",
    "pricing.plan.empresarial.pdfs": "PDFs ilimitados",
    "pricing.features.customization": "Personalização do app",
    "pricing.features.email_support": "Suporte por email",
    "pricing.features.whatsapp_support": "Suporte por WhatsApp",
    "pricing.features.import_apps": "Importação de apps existentes",
    "pricing.features.app_import": "Importação de apps",
    "pricing.features.video_player": "Player de vídeo integrado",
    "pricing.features.custom_domain": "Domínio personalizado",
    "pricing.features.premium_templates": "Templates premium",
    "pricing.features.multi_language": "Interface multi-idioma",
    "pricing.features.multilingual": "Interface multi-idioma",
    "pricing.features.integrations": "Integrações com plataformas",
    "pricing.features.platform_integrations": "Integrações com plataformas",
    "pricing.features.realtime_updates": "Atualizações em tempo real",
    "pricing.features.real_time_updates": "Atualizações em tempo real",
    "pricing.features.unlimited_users": "Usuários ilimitados",
    "pricing.features.push_notifications": "Notificações push",
    "pricing.features.internal_chat": "Chat interno",
    "pricing.features.convert_ebook": "Converte eBook em app em 3 minutos",
    "pricing.features.one_click_access": "Cliente acessa com 1 clique (sem login)",
    "pricing.features.multiplatform": "Funciona em Android, iOS e Web",
    "pricing.features.update_content": "Atualize conteúdo sem reenviar nada",
    "pricing.features.whatsapp_integrated": "WhatsApp integrado no app",
    "pricing.features.push_engage": "Notificações push para engajar",
    "pricing.features.payment_integrations": "Integração com plataformas de pagamento",
    "pricing.features.everything_professional": "Tudo do Profissional +",
    "pricing.features.integrated_videos": "Vídeos integrados ao app (via link)",
    "pricing.features.upsell_bump": "Upsell e Order Bump no app",
    "pricing.features.premium_visual": "Visual premium com templates exclusivos",
    "pricing.features.custom_domain_brand": "Domínio personalizado (sua marca)",
    "pricing.subscribe": "Assinar",
    "pricing.equivalent": "Equivale a",
    "pricing.per_month": "/mês",
    "pricing.per_year": "/ano",
    "pricing.back_to_app": "Voltar para o App",
    "pricing.logout": "Sair",
    "pricing.start_now": "Começar Agora",
    "pricing.cancel_anytime": "Cancele quando quiser",
    "pricing.loading": "Carregando...",
    "pricing.error.session": "Sessão expirada. Por favor, faça login novamente.",
    "pricing.error.checkout": "Erro ao criar checkout. Tente novamente.",
    "pricing.current_plan": "Plano Atual",
    "pricing.max_plan": "Plano Máximo",
    "pricing.unavailable": "Plano Indisponível",
    "pricing.unavailable_short": "Indisponível",

    // Checkout Page
    "checkout.title": "Insira seus dados de pagamento",
    "checkout.subtitle.line1": "Aceitamos cartões Visa e Mastercard.",
    "checkout.subtitle.line2": "Teste grátis durante 7 dias. Nada será cobrado hoje.",
    "checkout.subtitle.line3.monthly": "Após 7 dias, será cobrado R${price} por mês.",
    "checkout.subtitle.line3.annual": "Após 7 dias, será cobrado R${price} por ano.",
    "checkout.subtitle": "Confirme os detalhes do seu plano escolhido",
    "checkout.plan.title": "Plano",
    "checkout.price.monthly": "/mês",
    "checkout.price.annual": "/ano",
    "checkout.price.equivalent": "Equivale a",
    "checkout.publication": "Publicação:",
    "checkout.benefits.title": "Benefícios inclusos:",
    "checkout.total.monthly": "Total mensal:",
    "checkout.total.annual": "Total anual:",
    "checkout.subscribe.button": "Começar teste grátis",
    "checkout.processing": "Processando...",
    "checkout.back.button": "Voltar aos Planos",
    "checkout.back.short": "Voltar",
    "checkout.success.title": "Plano ativado com sucesso!",
    "checkout.success.description": "Seu plano {planName} está ativo. Bem-vindo!",
    "checkout.error.title": "Erro ao ativar plano",
    "checkout.error.description": "Tente novamente ou entre em contato com o suporte.",

    // Payment Success Page
    "payment_success.title": "Pagamento Aprovado!",
    "payment_success.subtitle": "Sua assinatura foi ativada com sucesso",
    "payment_success.plan_title": "Plano {plan}",
    "payment_success.benefits_title": "Benefícios do seu plano:",
    "payment_success.next_billing": "Próxima cobrança",
    "payment_success.app_limit": "Limite de apps",
    "payment_success.apps": "aplicativos",
    "payment_success.billing_cycle": "Ciclo de cobrança:",
    "payment_success.monthly": "Mensal",
    "payment_success.yearly": "Anual",
    "payment_success.amount": "Valor:",
    "payment_success.processing_title": "Processando sua assinatura...",
    "payment_success.processing_subtitle":
      "Sua assinatura está sendo ativada. Os detalhes aparecerão aqui em alguns minutos.",
    "payment_success.access_app": "Acessar o MigraBook",
    "payment_success.view_plans": "Ver Outros Planos",
    "payment_success.email_confirmation": "Um email de confirmação foi enviado para {email}",
    "payment_success.manage_subscription": "Você pode gerenciar sua assinatura a qualquer momento no painel do usuário",

    // Inactive Account Page
    "inactive.title": "Conta Inativa",
    "inactive.subtitle": "Sua conta foi desativada",
    "inactive.default_message": "Sua conta foi desativada. Entre em contato com o suporte para mais informações.",
    "inactive.reactivate_button": "Assinar Plano para Reativar Conta",
    "inactive.logout_button": "Fazer Logout",

    // CustomizationPanel
    "custom.icon.background": "Fundo transparente recomendado",
    "custom.cover.background": "Imagem de fundo do app",
    "custom.thumbnail.title": "Upload de miniatura PWA",
    "custom.thumbnail.help": "Clique no ícone para fazer upload da miniatura (PNG/JPG 512x512)",
    "custom.icon.dimensions": "PNG 512x512",

    // CreditCardForm
    "payment.finalize.title": "Finalizar Assinatura",
    "payment.plan": "Plano",
    "payment.values.vary": "* Valores podem variar conforme o ciclo de cobrança selecionado",
    "payment.billing.cycle.title": "Ciclo de Cobrança",
    "payment.choose.cycle": "Escolha seu ciclo de pagamento",
    "payment.annual": "Anual",
    "payment.annual.price": "Anual - R${price} (2 meses grátis)",
    "payment.charged.annually": "Cobrado anualmente",
    "payment.card.data.title": "Dados do Cartão",
    "payment.card.number.placeholder": "0000 0000 0000 0000",
    "payment.card.name.placeholder": "Como está no cartão",
    "payment.expiry.month": "Mês",
    "payment.expiry.year": "Ano",
    "payment.cvv": "CVV",
    "payment.cvv.placeholder": "123",
    "payment.billing.data.title": "Dados de Cobrança",
    "payment.email": "Email",
    "payment.phone": "Telefone",
    "payment.phone.placeholder": "(11) 99999-9999",
    "payment.zipcode": "CEP",
    "payment.zipcode.placeholder": "00000-000",
    "payment.address": "Endereço",
    "payment.number": "Número",
    "payment.number.placeholder": "123",
    "payment.complement": "Complemento",
    "payment.neighborhood": "Bairro",
    "payment.city": "Cidade",
    "payment.city.placeholder": "São Paulo",
    "payment.state": "Estado",
    "payment.security.info": "Suas informações estão seguras",
    "payment.security.description": "Utilizamos criptografia de ponta para proteger seus dados",
    "payment.finalize.button": "Finalizar Pagamento",
    "payment.cancel.button": "Cancelar",
    "payment.processing": "Processando pagamento...",

    // UploadSection
    "upload.error.generic": "Erro no upload",
    "upload.retry.ready.title": "Pronto para retry",
    "upload.retry.ready.description": "Selecione o arquivo novamente para tentar o upload.",
    "upload.app.notfound.title": "App não encontrado",
    "upload.app.notfound.description": "Verifique se o ID está correto.",
    "upload.access.denied.title": "Acesso negado",
    "upload.access.denied.description": "Você só pode importar seus próprios apps.",
    "upload.default.appname": "Meu App",
    "upload.default.description": "Descrição do App",

    // CreditCardForm - Validações
    "payment.validation.card.min": "Número do cartão deve ter 16 dígitos",
    "payment.validation.card.max": "Número do cartão inválido",
    "payment.validation.card.regex": "Apenas números são permitidos",
    "payment.validation.name.min": "Nome no cartão é obrigatório",
    "payment.validation.name.regex": "Nome deve conter apenas letras",
    "payment.validation.month.required": "Mês é obrigatório",
    "payment.validation.year.required": "Ano é obrigatório",
    "payment.validation.cvv.min": "CVV deve ter 3 ou 4 dígitos",
    "payment.validation.cvv.max": "CVV deve ter 3 ou 4 dígitos",
    "payment.validation.cvv.regex": "CVV deve conter apenas números",
    "payment.validation.email.invalid": "Email inválido",
    "payment.validation.phone.invalid": "Telefone inválido",
    "payment.validation.zipcode.min": "CEP inválido",
    "payment.validation.zipcode.max": "CEP inválido",
    "payment.validation.address.required": "Endereço é obrigatório",
    "payment.validation.number.required": "Número é obrigatório",
    "payment.validation.neighborhood.required": "Bairro é obrigatório",
    "payment.validation.city.required": "Cidade é obrigatória",
    "payment.validation.state.required": "Estado é obrigatório",

    // CreditCardForm - Labels e placeholders adicionais
    "payment.card.name.label": "Nome no Cartão",
    "payment.card.name.placeholder.alt": "João Silva",

    // CreditCardForm - Estados brasileiros
    "state.ac": "Acre",
    "state.al": "Alagoas",
    "state.ap": "Amapá",
    "state.am": "Amazonas",
    "state.ba": "Bahia",
    "state.ce": "Ceará",
    "state.df": "Distrito Federal",
    "state.es": "Espírito Santo",
    "state.go": "Goiás",
    "state.ma": "Maranhão",
    "state.mt": "Mato Grosso",
    "state.ms": "Mato Grosso do Sul",
    "state.mg": "Minas Gerais",
    "state.pa": "Pará",
    "state.pb": "Paraíba",
    "state.pr": "Paraná",
    "state.pe": "Pernambuco",
    "state.pi": "Piauí",
    "state.rj": "Rio de Janeiro",
    "state.rn": "Rio Grande do Norte",
    "state.rs": "Rio Grande do Sul",
    "state.ro": "Rondônia",
    "state.rr": "Roraima",
    "state.sc": "Santa Catarina",
    "state.sp": "São Paulo",
    "state.se": "Sergipe",
    "state.to": "Tocantins",

    // CreditCardForm - Toasts
    "payment.toast.auth.error.title": "Erro de Autenticação",
    "payment.toast.auth.error.description": "Você precisa estar logado para assinar um plano.",
    "payment.toast.redirect.description": "Você será redirecionado para o Stripe para completar o pagamento.",

    // Header
    "header.logout.error.title": "Erro",
    "header.logout.error.description": "Não foi possível fazer logout",
    "header.logout.success.title": "Logout realizado",
    "header.logout.success.description": "Você foi desconectado com sucesso",
    "header.language": "Idioma",
    "header.language.pt": "Português",
    "header.language.en": "English",
    "header.language.es": "Español",
    "header.menu": "MENU",
    "header.theme": "Tema",
    "header.profile": "Perfil",
    "header.reset": "Resetar",
    "header.logout.button": "Sair",
    "header.notifications": "Notificações",

    // Header Notifications Dropdown
    "header.notifications.dropdown_title": "Notificações",
    "header.notifications.mark_all_read": "Marcar todas como lidas",
    "header.notifications.empty": "Nenhuma notificação no momento",
    "header.notifications.open_link": "Abrir link",

    // Admin Notifications
    "admin.notifications.tab": "Notificações",
    "admin.notifications.title": "Gerenciar Notificações",
    "admin.notifications.add": "Nova Notificação",
    "admin.notifications.edit": "Editar Notificação",
    "admin.notifications.fetch_error": "Erro ao carregar notificações",
    "admin.notifications.validation_error": "Preencha título e mensagem",
    "admin.notifications.create_success": "Notificação criada com sucesso",
    "admin.notifications.update_success": "Notificação atualizada com sucesso",
    "admin.notifications.save_error": "Erro ao salvar notificação",
    "admin.notifications.delete_confirm": "Tem certeza que deseja excluir esta notificação?",
    "admin.notifications.delete_success": "Notificação excluída com sucesso",
    "admin.notifications.delete_error": "Erro ao excluir notificação",
    "admin.notifications.toggle_error": "Erro ao alterar status",
    "admin.notifications.loading": "Carregando notificações...",
    "admin.notifications.empty": "Nenhuma notificação cadastrada",
    "admin.notifications.form.title": "Título",
    "admin.notifications.form.title_placeholder": "Digite o título da notificação",
    "admin.notifications.form.message": "Mensagem",
    "admin.notifications.form.message_placeholder": "Digite a mensagem da notificação",
    "admin.notifications.form.link": "Link (opcional)",
    "admin.notifications.form.active": "Notificação ativa",
    "admin.notifications.form.cancel": "Cancelar",
    "admin.notifications.form.save": "Salvar",
    "admin.notifications.table.title": "Título",
    "admin.notifications.table.message": "Mensagem",
    "admin.notifications.table.status": "Status",
    "admin.notifications.table.date": "Data",
    "admin.notifications.table.actions": "Ações",
    "admin.notifications.status.active": "Ativa",
    "admin.notifications.status.inactive": "Inativa",

    // AuthGuard
    "authguard.no_permission": "Você não tem permissão para acessar este conteúdo.",

    // Settings Sidebar
    "sidebar.customization.title": "Personalização do App",
    "sidebar.customization.description": "Configure a aparência e comportamento do seu aplicativo",
    "sidebar.domain.title": "Domínio Personalizado",
    "sidebar.domain.description": "Transmita mais autoridade usando seu próprio domínio.",
    "sidebar.domain.why.title":
      "Clique no botão abaixo para solicitar a configuração. Nossa equipe fará tudo para você.",
    "sidebar.domain.why.professionalism": "Maior profissionalismo",
    "sidebar.domain.why.branding": "Branding personalizado",
    "sidebar.domain.why.trust": "Melhor confiança dos usuários",
    "sidebar.domain.why.seo": "SEO otimizado",
    "sidebar.domain.configure": "Configurar meu Domínio",
    "sidebar.notification.title": "Notificações do App",
    "sidebar.notification.description": "Configure notificações e alertas para seus usuários",
    "sidebar.integrations.title": "Integrações",
    "sidebar.integrations.description": "Conecte produtos de plataformas externas com seus apps",
    "sidebar.tooltip.customization": "Personalização do App",
    "sidebar.tooltip.domain": "Domínio Próprio",
    "sidebar.tooltip.notification": "Notificação no App",
    "sidebar.tooltip.integrations": "Integrações com Plataformas",
    "sidebar.import.title": "Importar App Existente",
    "sidebar.import.description": "Importe dados de um app previamente criado usando JSON ou ID do app",
    "sidebar.tooltip.import": "Importar App",
    "sidebar.whatsapp.title": "WhatsApp Support",
    "sidebar.whatsapp.description":
      "Configure o botão flutuante de WhatsApp para suporte ao cliente no seu app publicado",
    "sidebar.tooltip.whatsapp": "WhatsApp Support",

    // Auth Dialog Validations
    "auth.validation.name_required": "Nome completo é obrigatório",
    "auth.validation.phone_required": "Telefone é obrigatório",
    "auth.signup.success.title": "✅ Conta criada!",
    "auth.signup.success.description": "Verifique seu e-mail para confirmar sua conta.",
    "auth.resend.error.title": "Erro ao reenviar email",
    "auth.unconfirmed.title": "Email não confirmado",
    "auth.unconfirmed.description":
      "Reenviamos um email de confirmação. Verifique sua caixa de entrada e confirme sua conta antes de fazer login.",
    "auth.login.success": "Login realizado com sucesso!",
    "auth.error.title": "Erro na autenticação",

    // Auth Verification Dialog
    "auth.verification.invalid_code": "Código inválido",
    "auth.verification.code_length": "O código deve ter 5 dígitos",
    "auth.verification.success": "✅ Conta ativada com sucesso!",
    "auth.verification.redirecting": "Você será redirecionado para escolher seu plano.",
    "auth.verification.login_manually": "Ocorreu um erro ao fazer login automático. Por favor, faça login manualmente.",
    "auth.verification.error": "Erro na verificação",
    "auth.verification.invalid_or_expired": "Código inválido ou expirado",
    "auth.verification.try_again": "Erro ao verificar código. Tente novamente.",
    "auth.verification.title": "Verificar Conta",
    "auth.verification.sent_to": "Enviamos um código de verificação para",
    "auth.verification.expires": "(Código expira em 30 minutos)",
    "auth.verification.code_label": "Código de Verificação",
    "auth.verification.code_hint": "Digite o código de 5 dígitos que enviamos por e-mail",
    "auth.verification.verifying": "Verificando...",
    "auth.verification.verify_button": "Verificar e Ativar Conta",
    "auth.verification.not_received": "Não recebeu o código? Verifique sua caixa de spam ou aguarde alguns instantes.",
    "auth.verification.code_still_valid":
      "Você já tem um código de verificação válido. Por favor, verifique seu e-mail.",
    "auth.verification.sending_new_code": "Seu código anterior expirou. Enviando um novo código...",
    "auth.verification.resend_error": "Erro ao reenviar código de verificação.",

    // === PROFILE DIALOG ===
    "profile.title": "Perfil do Usuário",
    "profile.subtitle": "Gerencie suas informações pessoais e apps publicados",
    "profile.personal_info": "Informações Pessoais",
    "profile.email": "Email",
    "profile.name": "Nome",
    "profile.phone": "Telefone",
    "profile.my_subscription": "Minha Assinatura",
    "profile.plan": "Plano",
    "profile.free": "Gratuito",
    "profile.active": "Ativo",
    "profile.my_apps": "Meus Apps Publicados",
    "profile.refresh": "Atualizar",
    "profile.published": "Publicado",
    "profile.created_at": "Criado em",
    "profile.updated_at": "Atualizado em",
    "profile.edit": "Editar",
    "profile.view_app": "Ver App",
    "profile.no_apps": "Nenhum app publicado ainda",
    "profile.no_apps_message": "Seus apps publicados aparecerão aqui",
    "profile.danger_zone": "Zona de Perigo",
    "profile.delete_warning":
      "Excluir sua conta remove permanentemente todos os seus dados. Esta ação não pode ser desfeita.",
    "profile.deleting": "Excluindo...",
    "profile.delete_account": "Excluir Conta",
    "profile.delete_app_title": "Excluir App",
    "profile.delete_app_message": "Tem certeza que deseja excluir o app",
    "profile.delete": "Excluir",
    "profile.saving": "Salvando...",
    "profile.save": "Salvar",
    "profile.max_plan_message": "Você possui o plano mais avançado disponível",
    "profile.max_plan_badge": "Plano Máximo",
    "profile.downgrade_question": "Deseja fazer downgrade do seu plano?",
    "profile.contact_support": "Contatar Suporte",
    "profile.upgrade_to_business": "Upgrade para plano Empresarial",
    "profile.upgrade_message": "Faça upgrade para obter mais recursos",
    "profile.upgrade_button": "Fazer Upgrade",
    "profile.manage_subscription": "Gerenciar Assinatura",
    "profile.cancel_anytime": "Cancele sua assinatura a qualquer momento",
    "profile.cancel_subscription": "Cancelar Assinatura",
    "profile.manual_plan_title": "Plano definido pelo administrador",
    "profile.manual_plan_message":
      "Seu plano foi ativado manualmente. Para alterações ou cancelamento, entre em contato com o suporte.",

    // === TOAST MESSAGES - PROFILE ===
    "toast.profile.app_loaded": "App carregado",
    "toast.profile.app_loaded_description": "O app foi carregado no builder para edição",
    "toast.profile.error": "Erro",
    "toast.profile.error_loading_app": "Não foi possível carregar os dados do app",
    "toast.profile.error_internal": "Erro interno ao carregar app",
    "toast.profile.updated": "Perfil atualizado",
    "toast.profile.updated_description": "Suas informações foram salvas com sucesso",
    "toast.profile.update_error": "Não foi possível atualizar o perfil",
    "toast.profile.subscription_canceled": "Assinatura cancelada",
    "toast.profile.subscription_canceled_description":
      "Sua assinatura foi cancelada e você manterá o acesso até o fim do período pago",
    "toast.profile.cancel_error": "Erro ao cancelar assinatura",
    "toast.profile.subscription_reactivated": "Assinatura reativada!",
    "toast.profile.subscription_reactivated_description": "Sua assinatura foi reativada com sucesso.",
    "toast.profile.reactivate_error": "Erro ao reativar assinatura",
    "toast.profile.account_deleted": "Conta excluída",
    "toast.profile.account_deleted_description": "Sua conta foi excluída com sucesso",
    "toast.profile.delete_error": "Erro ao excluir conta",
    "toast.profile.app_deleted": "App excluído",
    "toast.profile.app_deleted_description": "O app foi excluído com sucesso.",
    "toast.profile.delete_app_error": "Erro ao excluir o app.",

    // === ERRORS ===

    "error.session_expired": "Sessão expirada. Faça login novamente.",
    "error.server_communication": "Erro na comunicação com o servidor",
    "error.cancel_subscription_failed": "Falha ao cancelar assinatura",
    "error.delete_account_failed": "Falha ao excluir conta",

    // === PROFILE - RENEWAL & SUBSCRIPTION ===
    "profile.renew_subscription": "Renove sua assinatura",
    "profile.renew_subscription_message": "Recupere o acesso aos recursos premium",
    "profile.renew_button": "Renovar",
    "profile.cancel_subscription_title": "Cancelar Assinatura",
    "profile.cancel_subscription_description":
      "Deseja cancelar sua assinatura? Você não será mais cobrado e perderá o acesso após o período vigente.",
    "profile.attention": "Atenção",
    "profile.cancel_subscription_warning": "Você manterá acesso aos recursos premium até o final do período já pago",
    "profile.keep_subscription": "Manter Assinatura",
    "profile.canceling": "Cancelando...",
    "profile.confirm_cancel_subscription": "Sim, Cancelar Assinatura",
    "profile.active_subscription_detected": "Assinatura Ativa Detectada",
    "profile.must_cancel_first": "Sua assinatura ainda está ativa. Você deve cancelar antes de excluir a conta",
    "profile.what_will_happen": "O que acontecerá",
    "profile.subscription_auto_cancel": "Sua assinatura será cancelada automaticamente na Stripe",
    "profile.data_permanent_delete": "Todos os seus dados serão excluídos permanentemente",
    "profile.action_irreversible": "Esta ação não pode ser desfeita",
    "profile.only_cancel_subscription": "Apenas Cancelar Assinatura",
    "profile.cancel_and_delete": "Cancelar Assinatura e Excluir Conta",
    "profile.confirm_delete_title": "Confirmar Exclusão da Conta",
    "profile.confirm_delete_message": "Você está prestes a excluir sua conta permanentemente.",
    "profile.all_apps_deleted": "Todos os seus aplicativos serão excluídos",
    "profile.confirm_delete_account": "Sim, Excluir Minha Conta",

    // === NOTIFICATIONS ===
    "notifications.title": "Notificações no App",
    "notifications.description": "Configure notificações e alertas para seus usuários",
    "notifications.enable": "Ativar Notificações",
    "notifications.notification_title": "Título da Notificação",
    "notifications.title_placeholder": "Digite o título da notificação...",
    "notifications.message": "Mensagem da Notificação",
    "notifications.message_placeholder": "Digite a mensagem da notificação...",
    "notifications.image": "Imagem da Notificação (opcional)",
    "notifications.upload_click": "Clique para fazer upload",
    "notifications.image_loaded": "✓ Imagem carregada",
    "notifications.image_help": "Imagem que aparece na notificação (PNG/JPG até 2MB)",
    "notifications.link": "Link da Notificação (opcional)",
    "notifications.link_placeholder": "https://seusite.com/oferta",
    "notifications.link_help": "Link para onde o usuário será direcionado ao clicar",
    "notifications.button_text": "Texto do Botão",
    "notifications.button_text_placeholder": "Acessar Oferta",
    "notifications.button_color": "Cor do Botão",
    "notifications.icon": "Ícone da Notificação",
    "notifications.choose_icon": "Escolha um ícone",
    "notifications.icon.gift": "Presente",
    "notifications.icon.bell": "Sino",
    "notifications.icon.star": "Estrela",
    "notifications.icon.sparkles": "Brilhos",
    "notifications.icon.zap": "Raio",
    "notifications.icon.trophy": "Troféu",
    "notifications.icon.heart": "Coração",
    "notifications.icon.award": "Medalha",
    "notifications.click_help": "Os usuários verão uma notificação no app e poderão clicar para ver mais",
    "notifications.new_notification": "Nova notificação",

    // IntegrationsPanel - Toasts e validações
    "integrations.toast.load.error.title": "Erro ao carregar integrações",
    "integrations.toast.attention.title": "Atenção",
    "integrations.toast.invalid.stripe.key": "Chave Stripe inválida (deve começar com sk_live_ ou sk_test_)",
    "integrations.toast.invalid.hottok": "Informe o HOTTOK para validação de webhook",
    "integrations.toast.invalid.postback": "Informe o Postback Key para validação de webhook",
    "integrations.toast.invalid.link": "O link do app está em formato inválido",
    "integrations.toast.product.invalid": "❌ Produto inválido",
    "integrations.toast.updated.title": "✅ Integração atualizada!",
    "integrations.toast.saved.title": "✅ Integração salva!",
    "integrations.delete.confirm": "Tem certeza que deseja excluir esta integração?",

    // IntegrationsPanel - Mensagens customizadas
    "integrations.message.custom": "Olá! Gostaria de acessar o aplicativo.",
    "integrations.thumbnail.alt.bonus": "Miniatura Bônus",

    // TemplateBuilder
    "template.description.placeholder": "Descreva as características e o estilo do seu template",
    "template.header.style.title": "Estilo do Cabeçalho",
    "template.content.layout.title": "Layout do Conteúdo",
    "template.button.style.title": "Estilo dos Botões",
    "template.card.style.title": "Estilo dos Cartões",
    "template.spacing.title": "Espaçamento Geral",
    "template.typography.title": "Estilo Tipográfico",

    // Admin Role Manager
    "admin.role.access_confirmed": "Acesso confirmado",
    "admin.role.access_denied": "Acesso negado",
    "admin.role.has_privileges": "Você possui privilégios de administrador",
    "admin.role.no_privileges": "Você não possui privilégios de administrador",
    "admin.role.error_check": "Erro ao verificar status de administrador",
    "admin.role.restricted_access": "Acesso Restrito",
    "admin.role.restricted_message": "Você não possui privilégios de administrador para acessar esta página",
    "admin.role.admin_status": "Status de Administrador",
    "admin.role.check_status": "Verificar Status Admin",
    "admin.role.access_confirmed_message": "Acesso de administrador confirmado com sucesso",

    // Apps Management Panel
    "apps.table.name": "Nome",
    "apps.table.user": "Usuário",
    "apps.table.plan": "Plano",
    "apps.table.status": "Status",
    "apps.table.created_at": "Criado em",
    "apps.table.actions": "Ações",
    "apps.status.published": "Publicado",
    "apps.status.draft": "Rascunho",
    "apps.manage_title": "Gerenciar Apps",
    "apps.manage_subtitle": "Visualize e gerencie todos os apps da plataforma",
    "apps.search_placeholder": "Buscar por nome, email ou ID...",
    "apps.filter_by_user": "Filtrar por usuário",
    "apps.all_users": "Todos os usuários",
    "apps.delete_button": "Excluir",
    "apps.delete_confirm_title": "Confirmar exclusão",
    "apps.delete_confirm_desc": 'Tem certeza que deseja deletar "{appName}"? Esta ação não pode ser desfeita.',
    "apps.deleting": "Excluindo...",
    "apps.not_found": "Nenhum app encontrado",
    "apps.load_error": "Erro ao carregar apps",
    "apps.deleted": "App excluído",
    "apps.deleted_desc": "App foi deletado com sucesso",
    "apps.delete_error": "Erro ao excluir app",
    "apps.copied": "Copiado!",
    "apps.id_copied": "ID copiado para a área de transferência",

    // Integrations Panel
    "integrations.url_copied": "URL copiada!",

    // WhatsApp Settings
    "whatsapp.settings_saved": "✅ Configurações salvas!",
    "whatsapp.button_active": "O botão do WhatsApp está ativo no app",
    "whatsapp.button_disabled": "O botão do WhatsApp foi desativado",
    "whatsapp.attention": "Atenção",
    "whatsapp.enter_phone": "Informe o número de telefone do WhatsApp",
    "whatsapp.invalid_phone": "Número de telefone inválido. Use o formato completo com DDD (Ex: 5511999999999)",
    "whatsapp.contact_us": "Fale Conosco",

    // Plan Service
    "plans.essential": "Essencial",
    "plans.professional": "Profissional",
    "plans.business": "Empresarial",
    "plans.essential_description": "Ideal para iniciantes",
    "plans.professional_description": "Mais flexibilidade",
    "plans.business_description": "Uso corporativo e avançado",
    "plans.feature_customization": "Personalização do app",
    "plans.feature_email_support": "Suporte por email",
    "plans.feature_import": "Importação de apps existentes",
    "plans.feature_analytics": "Análises e estatísticas",
    "plans.feature_multi_device": "Acesso multi-dispositivo",
    "plans.feature_backup": "Backup automático",
    "plans.not_found": "Plano não encontrado",
    "plans.card_declined": "Cartão recusado pela operadora",
    "plans.free": "Gratuito",
    "plans.free_internal": "Gratuito",

    // Support Page
    "support.default_title": "Central de Suporte",
    "support.default_description": "Entre em contato conosco para obter ajuda e suporte especializado.",
    "support.default_button": "Entrar em Contato",
    "support.response_message": "Responderemos o mais rápido possível",

    // General errors
    "error.generic": "Erro",
    "error.loading": "Erro ao carregar",
    "error.saving": "Erro ao salvar",

    // Password Reset Dialog
    "password.reset.title": "Redefinir Senha",
    "password.reset.sent": "Enviamos um código de verificação para",
    "password.reset.expires": "(Código expira em 30 minutos)",
    "password.reset.code_label": "Código de Verificação",
    "password.reset.code_hint": "Digite o código de 5 dígitos que enviamos por e-mail",
    "password.reset.new_password": "Nova Senha",
    "password.reset.new_password_placeholder": "Digite sua nova senha",
    "password.reset.min_chars":
      "Mínimo de 6 caracteres — use letras maiúsculas e minúsculas, números e símbolos (ex: Mh!2026)",
    "password.reset.verifying": "Verificando...",
    "password.reset.button": "Redefinir Senha",
    "password.reset.no_code": "Não recebeu o código? Verifique sua caixa de spam ou feche e solicite novamente.",
    "password.reset.invalid_code": "Código inválido",
    "password.reset.code_must_be_5": "O código deve ter 5 dígitos",
    "password.reset.short_password": "Senha muito curta",
    "password.reset.min_6_chars": "A senha deve ter no mínimo 6 caracteres",
    "password.reset.success": "✅ Senha alterada com sucesso!",
    "password.reset.success_desc": "Você já pode fazer login com sua nova senha.",
    "password.reset.error": "Erro na verificação",
    "password.reset.invalid_expired": "Código inválido ou expirado",
    "password.reset.generic_error": "Ocorreu um erro. Tente novamente.",
    "password.reset.try_again": "Erro de conexão. Verifique sua internet e tente novamente.",
    "password.reset.invalid_code_msg": "Código incorreto. Verifique o código digitado e tente novamente.",
    "password.reset.expired_code_msg": "Código expirado. Feche esta janela e solicite um novo código.",
    "password.reset.weak_password_msg": "Senha muito fraca. Use uma senha mais forte com letras, números e símbolos.",
    "password.reset.code_used_msg": "Este código já foi utilizado. Solicite um novo código.",

    // PIX Payment
    "pix.payment.title": "Pagamento PIX",
    "pix.payment.confirmed_title": "Pagamento Confirmado!",
    "pix.payment.confirmed_desc": "Seu plano {planName} foi ativado com sucesso.",
    "pix.payment.access_app": "Acessar o App",
    "pix.expired_title": "PIX Expirado",
    "pix.expired_desc": "O código PIX expirou. Tente novamente.",
    "pix.back_to_plans": "Voltar aos Planos",
    "pix.time_remaining": "Tempo restante:",
    "pix.scan_qrcode": "Escaneie o QR Code com seu app bancário",
    "pix.copy_code": "Ou copie o código PIX:",
    "pix.code_copied": "Código PIX copiado!",
    "pix.code_copied_desc": "Cole o código no seu app bancário para efetuar o pagamento.",
    "pix.how_to_pay": "Como pagar:",
    "pix.step_1": "1. Abra seu app bancário",
    "pix.step_2": "2. Escaneie o QR Code ou cole o código PIX",
    "pix.step_3": "3. Confirme o pagamento de {amount}",
    "pix.step_4": "4. Aguarde a confirmação (até 30 segundos)",
    "pix.cancel": "Cancelar",
    "pix.simulate": "Simular Pagamento",
    "pix.simulated": "Pagamento simulado!",
    "pix.simulated_desc": "Para demonstração, o pagamento foi confirmado automaticamente.",

    // Admin Login
    "admin.login.verifying": "Verificando permissões...",
    "admin.login.error_permissions": "Erro ao verificar permissões",
    "admin.login.try_later": "Tente novamente mais tarde",
    "admin.login.success": "Login realizado com sucesso",
    "admin.login.redirecting": "Redirecionando para painel admin...",
    "admin.login.access_denied": "Acesso negado",
    "admin.login.no_admin_permission": "Você não tem permissão de administrador",

    // Auth Page
    "auth.name_required": "Nome completo é obrigatório",
    "auth.phone_required": "Telefone é obrigatório",
    "auth.code_sent": "Código enviado!",
    "auth.code_sent_desc": "Digite o código de 5 dígitos que enviamos para seu e-mail.",
    "auth.email_not_confirmed": "Email não confirmado",
    "auth.email_not_confirmed_desc":
      "Reenviamos um email de confirmação. Verifique sua caixa de entrada e confirme sua conta antes de fazer login.",
    "auth.resend_error": "Erro ao reenviar email",
    "auth.login_success": "Login realizado com sucesso!",
    "auth.login_redirecting": "Redirecionando...",
    "auth.error": "Erro na autenticação",
    "auth.error.email_exists": "Este e-mail já está cadastrado. Faça login ou use outro e-mail.",
    "auth.send_code_error": "Erro ao enviar código",
    "auth.password_reset.user_not_found": "E-mail não encontrado. Verifique se digitou corretamente.",
    "auth.password_reset.error": "Erro ao processar a solicitação. Tente novamente.",
    "auth.password_reset.error_title": "Erro na recuperação",
    "auth.password_changed": "✅ Senha alterada!",
    "auth.password_changed_desc": "Faça login com sua nova senha.",
    "auth.recover_password": "Recuperar Senha",
    "auth.recover_password_desc": "Digite seu email para receber um link de recuperação de senha.",
    "auth.sending": "Enviando...",
    "auth.send_link": "Enviar Link",

    // App Viewer
    "app.error": "Erro",
    "app.error_loading": "Erro ao carregar o aplicativo:",
    "app.not_found": "App não encontrado",
    "app.not_found_desc": "Este app não existe ou foi removido. Verifique se o link está correto.",
    "app.unexpected_error": "Erro inesperado",
    "app.unexpected_error_desc": "Ocorreu um erro ao carregar o aplicativo. Tente recarregar a página.",
    "app.install_error": "Erro na instalação",
    "app.install_error_desc": "Use o menu do navegador (⋮) e selecione 'Adicionar à tela inicial'",
    "app.installed": "✅ Instalado!",
    "app.installed_desc": "App adicionado à tela inicial com sucesso.",
    "app.install_cancelled": "Instalação cancelada",
    "app.install_cancelled_desc": "Você pode instalar depois usando o menu do navegador.",
    "app.install_try_again": "Tente novamente ou use o menu do navegador.",
    "app.download_started": "Download iniciado",
    "app.download_started_desc": "{filename} está sendo baixado.",
    "app.download_error": "Erro no download",
    "app.download_error_desc": "Não foi possível baixar o arquivo.",

    // Footer
    "footer.rights": "Todos os direitos reservados",

    // Academy Page
    "academy.title": "Academy",
    "academy.subtitle": "Tutoriais e Treinamentos",
    "academy.search": "Buscar vídeos...",
    "academy.no_videos": "Nenhum vídeo encontrado",
    "academy.no_tutorials": "Nenhum tutorial disponível",
    "academy.search_other": "Tente buscar com outros termos",
    "academy.coming_soon": "Os tutoriais serão adicionados em breve",
    "academy.video": "vídeo",
    "academy.videos": "vídeos",
    "academy.restricted_access": "Acesso Restrito",
    "academy.login_required": "Faça login para acessar os tutoriais e treinamentos da plataforma.",
  },
  en: {
    // Header
    "app.title": "MigraBook",

    // CustomizationPanel - Colors
    "custom.colors.textColor": "Text color",
    "custom.colors.bonusColor": "Bonus color",
    "custom.template.logo": "Template Logo",

    // PWA Install Banner
    "pwa.install.title": "Install App",
    "pwa.install.app": "App",
    "pwa.install.follow": "Follow the steps below:",
    "pwa.install.understood": "Got it",
    "pwa.install.tap": "Tap to install",
    "pwa.install.one_tap": "Install with one tap",
    "pwa.install.add": "Add to your home screen",
    "pwa.install.now": "Install",
    "pwa.install.how": "How to install",
    "pwa.install.later": "Later",
    "pwa.copy.link": "Copy link",
    // iOS Safari
    "pwa.ios.safari.step1": "Tap Share (↑ icon)",
    "pwa.ios.safari.step2": "Add to Home Screen",
    "pwa.ios.safari.step3": "Tap Add",
    // iOS other browsers
    "pwa.ios.other.warning": "On iPhone, apps can only be installed from Safari",
    "pwa.ios.other.step1": "Copy and open this link in Safari",
    "pwa.ios.other.step2": "Tap Share (↑ icon)",
    "pwa.ios.other.step3": "Add to Home Screen",
    // Android Chrome
    "pwa.android.chrome.step1": "Tap menu (⋮) in corner",
    "pwa.android.chrome.step2": "Add to Home screen",
    // Android Samsung
    "pwa.android.samsung.step1": "Tap menu (≡) in bar",
    "pwa.android.samsung.step2": "Add to Home screen",
    // Android Firefox
    "pwa.android.firefox.step1": "Tap menu (⋮)",
    "pwa.android.firefox.step2": "Install",
    // Android generic
    "pwa.android.generic.step1": "Open browser menu",
    "pwa.android.generic.step2": "Add to Home screen",
    // Desktop
    "pwa.desktop.step1": "Click browser menu",
    "pwa.desktop.step2": "Install app",

    // Credit Card Form
    "payment.title": "Complete Subscription",
    "payment.cycle.title": "Billing Cycle",
    "payment.cycle.select": "Choose your payment cycle",
    "payment.monthly": "Monthly",
    "payment.yearly": "Annual",
    "payment.charged.monthly": "Charged monthly",
    "payment.charged.yearly": "Charged annually",
    "payment.card.title": "Card Details",
    "payment.card.number": "Card Number",
    "payment.card.name": "Name on Card",
    "payment.card.month": "Month",
    "payment.card.year": "Year",
    "payment.card.cvv": "CVV",
    "payment.billing.title": "Billing Information",
    "payment.billing.email": "Email",
    "payment.billing.phone": "Phone",
    "payment.billing.zipcode": "ZIP Code",
    "payment.billing.address": "Address",
    "payment.billing.number": "Number",
    "payment.billing.complement": "Complement",
    "payment.billing.neighborhood": "Neighborhood",
    "payment.billing.city": "City",
    "payment.billing.state": "State",
    "payment.note": "* Values may vary according to selected billing cycle",

    // Integrations Panel
    "integrations.copy": "Copy",
    "integrations.webhook.url": "Webhook URL",
    "integrations.webhook.instructions": "Configure this webhook in your platform",

    // Settings Panel
    "settings.platform.name": "Platform Name",
    "settings.platform.description": "Platform Description",
    "settings.maintenance.mode": "Maintenance Mode",
    "settings.maintenance.description": "Activates a maintenance page for all users",
    "settings.general": "General",
    "settings.support": "Support",
    "settings.maintenance": "Maintenance",
    "settings.legal": "Legal",
    "settings.users": "Users",

    // Editor
    "editor.font.size": "Font Size",
    "editor.font.weight": "Font Weight",
    "editor.save.text": "Save Text",
    "editor.cancel": "Cancel",
    "editor.edit.text": "Edit text",
    "editor.style": "Style",
    "editor.edit.page": "Edit Page",
    "editor.saving": "Saving...",
    "editor.save.all": "Save All",

    // Domain Dialog extra
    "domain.description.authority": "Convey more authority using your own domain.",
    "domain.description.request":
      "Click the button below to request configuration. Our technical team will take care of the entire setup for you. It's fast, secure, and hassle-free.",
    "domain.request.button": "Request Configuration via WhatsApp",

    // Support fallback
    "support.email.subject": "Support Request",
    "support.email.body": "Hello, I need help.",
    "toast.error": "Error",

    // Admin Dashboard
    "admin.splash.full": "PWA Splash",
    "admin.splash.mobile": "PWA",
    "admin.app.select": "Select Published App",
    "admin.pwa.full": "PWA Config",
    "admin.pwa.mobile": "PWA",
    "admin.pwa.title": "PWA Installer Settings",
    "admin.pwa.description": "Configure how and when the install banner appears to your users",
    "admin.pwa.enabled": "Installer Active",
    "admin.pwa.enabled.description": "Enable or disable the install banner completely",
    "admin.pwa.autoShow": "Show Automatically",
    "admin.pwa.autoShow.description": "Show banner automatically when accessing the app",
    "admin.pwa.dismissPersistent": "Remember Dismissal",
    "admin.pwa.dismissPersistent.description": "If user closes the banner, don't show again",
    "admin.pwa.ios.description": "Configure the banner for iOS devices (iPhone/iPad)",
    "admin.pwa.ios.safari.hint": "Native iOS browser",
    "admin.pwa.ios.chrome.hint": "Requires instructions to open in Safari",
    "admin.pwa.android.description": "Configure the banner for Android devices",
    "admin.pwa.android.chrome.hint": "Direct installation via native prompt",
    "admin.pwa.android.samsung.hint": "Default browser on Samsung devices",
    "admin.pwa.android.firefox.hint": "Popular alternative browser",
    "admin.pwa.android.other": "Other browsers",
    "admin.pwa.android.other.hint": "Opera, Edge, less common browsers",
    "admin.pwa.desktop.description": "Configure the banner for desktop browsers",
    "admin.pwa.desktop.browsers": "All browsers",
    "admin.pwa.desktop.hint": "Chrome, Edge, Firefox and others",
    "admin.pwa.saved": "✅ PWA settings saved!",
    "admin.pwa.error": "Error saving settings",
    "admin.saving": "Saving...",
    "admin.save": "Save",

    // PWA Texts Configuration
    "admin.pwa.texts.title": "Customizable Texts",
    "admin.pwa.texts.description": "Customize the texts displayed on the banner and instructions screen",
    "admin.pwa.texts.bannerTitle": "Banner Title",
    "admin.pwa.texts.instructionsTitle": "Instructions Title",
    "admin.pwa.texts.subtitleDirect": "Subtitle (direct install)",
    "admin.pwa.texts.subtitleManual": "Subtitle (manual install)",
    "admin.pwa.texts.installButton": "Install Button",
    "admin.pwa.texts.howToButton": "How to Install Button",
    "admin.pwa.texts.laterButton": "Later Button",
    "admin.pwa.texts.understoodButton": "Understood Button",
    "admin.pwa.texts.instructionsSubtitle": "Instructions Subtitle",
    "admin.pwa.texts.copyLinkButton": "Copy Link Button",
    "admin.pwa.texts.hint": "Leave blank to use the default text for the selected language",

    // PWA Instructions Editor
    "admin.pwa.instructions.title": "Installation Instructions",
    "admin.pwa.instructions.description": "Customize step-by-step instructions for each device/browser",
    "admin.pwa.instructions.reset": "Reset to Default",
    "admin.pwa.instructions.addStep": "Add Step",
    "admin.pwa.instructions.steps": "Steps",
    "admin.pwa.instructions.warningMessage": "Warning Message",
    "admin.pwa.instructions.otherBrowsers": "Others",
    "admin.pwa.instructions.show": "Edit Device Instructions",
    "admin.pwa.instructions.hide": "Hide Instructions Editor",
    "admin.pwa.instructions.iosSafari.desc": "Native iOS browser - supports PWA installation",
    "admin.pwa.instructions.iosOther.desc": "Other browsers on iOS need Safari",
    "admin.pwa.instructions.androidChrome.desc": "Native installation via prompt",
    "admin.pwa.instructions.androidSamsung.desc": "Samsung default browser",
    "admin.pwa.instructions.androidFirefox.desc": "Popular alternative browser",
    "admin.pwa.instructions.androidOther.desc": "Opera, Edge and other browsers",
    "admin.pwa.instructions.desktop.desc": "Chrome, Edge, Firefox and others",

    // Visual Editor
    "visual.editor.title": "✨ Visual Editor - Subscribe Page",
    "visual.editor.subtitle.size": "Subtitle Size",

    // Pricing Badge
    "pricing.badge.free_trial": "7 days free",
    "language.select": "Language",
    "theme.light": "Light",
    "theme.dark": "Dark",
    reset: "Reset",
    publish: "Publish App",
    "header.back_to_app": "Back to App",

    // CustomizationPanel - Video Course
    "custom.videoCourse.title": "Video Course",
    "custom.videoCourse.description": "Add modules and YouTube videos",
    "custom.videoCourse.titleLabel": "Video Course Title",
    "custom.videoCourse.titlePlaceholder": "Video Course",
    "custom.videoCourse.descriptionLabel": "Course Description",
    "custom.videoCourse.descriptionPlaceholder": "Course Description",
    "custom.videoCourse.buttonTextLabel": "Button Text",
    "custom.videoCourse.buttonTextPlaceholder": "Watch Classes",
    "custom.videoCourse.iconLabel": "Course Icon",
    "custom.videoCourse.coverLabel": "Course Cover",
    "custom.videoCourse.addModule": "+ Add Module",
    "custom.videoCourse.moduleTitlePlaceholder": "Module Name",
    "custom.videoCourse.videoTitlePlaceholder": "Video Title",
    "custom.videoCourse.videoLinkPlaceholder": "YouTube Link",
    "custom.videoCourse.addVideo": "+ Add Video",
    "custom.videoCourse.removeModule": "Remove Module",
    "custom.videoCourse.removeVideo": "Remove Video",

    // CustomizationPanel - Template Showcase
    "custom.showcase.positionLabel": "Name and Description Position",
    "custom.showcase.positionPlaceholder": "Select position",
    "custom.showcase.position.bottom": "Bottom",
    "custom.showcase.position.middle": "Middle",
    "custom.showcase.position.top": "Top",

    // CustomizationPanel - Template Members
    "custom.members.clicksPlaceholder": "Clicks to learn more",
    "custom.members.headerSizeLabel": "Header Size",
    "custom.members.headerSizePlaceholder": "Select size",
    "custom.members.headerSize.small": "Small",
    "custom.members.headerSize.medium": "Medium",
    "custom.members.headerSize.large": "Large",

    // PhoneMockup - Default placeholders
    "phonemockup.default.appName": "App Name",
    "phonemockup.default.appDescription": "App Description",
    "phonemockup.default.mainProductLabel": "Main Product",
    "phonemockup.default.mainProductDescription": "Product Description",
    "phonemockup.default.bonusesLabel": "Bonuses",
    "phonemockup.default.bonus1Label": "Bonus 1",
    "phonemockup.default.bonus2Label": "Bonus 2",
    "phonemockup.default.bonus3Label": "Bonus 3",
    "phonemockup.default.bonus4Label": "Bonus 4",
    "phonemockup.default.bonus5Label": "Bonus 5",
    "phonemockup.default.bonus6Label": "Bonus 6",
    "phonemockup.default.bonus7Label": "Bonus 7",
    "phonemockup.default.bonus8Label": "Bonus 8",
    "phonemockup.default.bonus9Label": "Bonus 9",
    "phonemockup.default.bonus10Label": "Bonus 10",
    "phonemockup.default.bonus11Label": "Bonus 11",
    "phonemockup.default.bonus12Label": "Bonus 12",
    "phonemockup.default.bonus13Label": "Bonus 13",
    "phonemockup.default.bonus14Label": "Bonus 14",
    "phonemockup.default.bonus15Label": "Bonus 15",
    "phonemockup.default.bonus16Label": "Bonus 16",
    "phonemockup.default.bonus17Label": "Bonus 17",
    "phonemockup.default.bonus18Label": "Bonus 18",
    "phonemockup.default.bonus19Label": "Bonus 19",
    "phonemockup.default.videoCourseTitle": "Video Course",
    "phonemockup.default.whatsappMessage": "Hello! I came through the app.",
    "phonemockup.default.whatsappButtonText": "Contact Us",
    "phonemockup.default.viewButtonLabel": "View",

    // Subscribe Page - Hero
    "subscribe.hero.title": "Convert outdated eBooks into",
    "subscribe.hero.title.line2": "Modern applications with just a few clicks,",
    "subscribe.hero.title.line3": "no programming required.",
    "subscribe.hero.subtitle": "Sell more by increasing perceived value without changing content.",
    "subscribe.hero.cta": "Create My App Now",
    "subscribe.hero.or": "or",
    "subscribe.hero.demo": "See Demo",

    // Subscribe Page - Problem Section
    "subscribe.problem.title": "If you sell digital knowledge, you've already noticed this in practice:",
    "subscribe.problem.step1": "The customer needs to create a login.",
    "subscribe.problem.step2": "Confirm email.",
    "subscribe.problem.step3": "Remember password.",
    "subscribe.problem.step4": "Access members area.",
    "subscribe.problem.step5": "Navigate to content.",
    "subscribe.problem.question": "What if something fails along the way?",
    "subscribe.problem.result":
      "Customer can't log in → says they \"didn't receive the product\" → requests refund → you lose the sale.",

    // Subscribe Page - Comparison
    "subscribe.comparison.pdf.title": "PDF",
    "subscribe.comparison.pdf.subtitle":
      "What separates those who still sell PDFs from those who build a real product is the experience.",
    "subscribe.comparison.app.title": "App",
    "subscribe.comparison.app.description": "And experience today is an app.",

    // Subscribe Page - Benefits
    "subscribe.benefits.title": "What Changes When Your Ebook Becomes an App?",
    "subscribe.benefits.title.part1": "What Changes When Your",
    "subscribe.benefits.title.part2": "Ebook Becomes an App?",
    "subscribe.benefits.card1.title": "No access barriers",
    "subscribe.benefits.card1.desc":
      "Customer clicks link → opens directly in app → consumes content. Login drama is over",
    "subscribe.benefits.card2.title": "User experience",
    "subscribe.benefits.card2.desc":
      "Organized, beautiful, easy to navigate. Your customer doesn't need to search for files.",
    "subscribe.benefits.card3.title": "Smart monetization",
    "subscribe.benefits.card3.desc":
      "Use in-app notifications to offer upgrades, extra modules and new offers, boosting your sales effortlessly.",
    "subscribe.benefits.card4.title": "Consistent visual identity",
    "subscribe.benefits.card4.desc": "Custom logo, colors and name. The app is truly yours, not third-party.",
    "subscribe.benefits.card5.title": "Multi-language interface",
    "subscribe.benefits.card5.desc":
      "Menus, buttons and messages can be translated into any language. Ideal for selling your app in other countries.",
    "subscribe.benefits.card6.title": "Easy access",
    "subscribe.benefits.card6.desc":
      "Your customer buys, you send the link and done! No login area, no support hassle and fewer refunds.",
    "subscribe.benefits.card7.title": "Automatic updates",
    "subscribe.benefits.card7.desc":
      "Need to fix or add something in the App? Update once and everyone receives it, no need to resend PDF and no rework.",
    "subscribe.benefits.card8.title": "Direct integration",
    "subscribe.benefits.card8.desc":
      "Connect your app with any platform (Hotmart, Kiwify, Stripe or others) and maintain full control over your sales.",
    "subscribe.benefits.cta.title": "Migrate Now",
    "subscribe.benefits.cta.button": "Transform My eBook into App",

    // Subscribe Page - Target Audience
    "subscribe.target.title": "Who is MigraBook.app for?",

    // Subscribe Page - Integrations
    "subscribe.integrations.title": "Your preferred platform",
    "subscribe.integrations.title.line2": "connected in just a few clicks",
    "subscribe.integrations.subtitle": "Migrabook.app is already integrated with the leading market platforms.",

    // Subscribe Page - Pricing
    "subscribe.pricing.title": "Plans and Pricing",
    "subscribe.pricing.subtitle": "Choose the perfect plan for your needs",
    "subscribe.pricing.popular": "Recommended",
    "subscribe.pricing.month": "/month",
    "pricing.monthly": "Monthly",
    "pricing.annual": "Annual",
    "subscribe.pricing.annual.note": "Charged annually (R$ {price})",
    "subscribe.pricing.choose.plan": "Choose {plan}",
    "subscribe.pricing.payment.secure": "Secure payment via Stripe",
    "subscribe.pricing.cancel.anytime": "Cancel anytime, no hassle",

    // Subscribe Page - FAQ
    "subscribe.faq.title": "Frequently Asked Questions",
    "subscribe.faq.subtitle": "Find answers to the most common questions",
    "subscribe.faq.q1": "Do I need to know how to program to use MigraBook?",
    "subscribe.faq.a1":
      "No! MigraBook was developed to be 100% intuitive. Just upload your PDF, customize colors and logo, and your app is ready to publish. All without writing a line of code.",
    "subscribe.faq.q2": "How does delivery to customers work?",
    "subscribe.faq.a2":
      "After integrating your app with your sales platform (Hotmart, Kiwify, etc.), the customer will automatically receive the access link via email as soon as the purchase is confirmed. They just click and access the content directly in the app.",
    "subscribe.faq.q3": "Can I customize the app with my brand?",
    "subscribe.faq.a3":
      "Yes! You can customize colors, logo, icon and even the app domain. The goal is for the app to have your brand's look, creating a unique experience for your customers.",
    "subscribe.faq.q4": "What happens if I want to cancel?",
    "subscribe.faq.a4":
      "You can cancel at any time, with no penalties or additional fees. Your app remains live until the end of the period you've already paid for.",
    "subscribe.faq.q5": "What kind of support do you offer?",
    "subscribe.faq.a5":
      "We offer email support for all plans. Professional and Business plans have access to priority support via WhatsApp. Our team is always ready to help you succeed.",

    // Subscribe Page - Final CTA
    "subscribe.final.title": "Ready to Transform Your eBook into a Successful App?",
    "subscribe.final.check1": "✓ App created in minutes",
    "subscribe.final.check2": "✓ Automatic integration with your platform",
    "subscribe.final.check3": "✓ Complete support to get started",
    "subscribe.final.cta.primary": "Create My App Now",
    "subscribe.final.cta.whatsapp": "Chat on WhatsApp",

    // Subscribe Page - Footer
    "subscribe.footer.rights": "All rights reserved.",
    "subscribe.footer.privacy": "Privacy Policy",
    "subscribe.footer.terms": "Terms of Service",

    // Header
    "subscribe.header.login": "Login",
    "subscribe.header.start": "Get Started",

    // Hero Title Parts
    "subscribe.hero.title.part1": "Convert outdated eBooks into",
    "subscribe.hero.title.part2": "Modern Apps",
    "subscribe.hero.title.part3": "with a few clicks,",
    "subscribe.hero.title.part4": "no coding required.",

    // Planos Page Hero (specific for /planos route)
    "planos.hero.title.part1": "How to convert more by just changing the",
    "planos.hero.title.highlight": "format of your delivery",
    "planos.hero.title.part2": "without creating a new product",
    "planos.hero.subtitle":
      "Same product, new format, new perception. Your customers will pay premium prices (without you coding anything)",
    "planos.hero.cta": "Transform my offer into an App",

    // Planos Page Ebook Section (specific for /planos route)
    "planos.ebook.problem_statement": "The problem isn't your knowledge. It's the format you deliver.",
    "planos.ebook.mockup_ebook": "The first sounds amateur.",
    "planos.ebook.mockup_app": "The second is professional.",
    "planos.ebook.app_benefit_title": "The same eBook, when it becomes an app:",
    "planos.ebook.benefit1": "Looks more professional",
    "planos.ebook.benefit2": "Generates more perceived value",
    "planos.ebook.benefit3": "Makes conversion easier",
    "planos.ebook.benefit4": "And sells more",

    // Planos Page - 3 Steps Section
    "planos.steps.title": "Your app ready in 3 simple steps",
    "planos.steps.subtitle": "You don't need to know how to code or deal with technical stuff.",
    "planos.steps.step1.title": "Step 1:",
    "planos.steps.step1.name": "Send your material",
    "planos.steps.step1.description":
      "Upload your eBook and you're done. You can also upload audios and add videos. The system organizes everything automatically inside the app.",
    "planos.steps.step2.title": "Step 2:",
    "planos.steps.step2.name": "Customize in 1 minute",
    "planos.steps.step2.description": "Add name, colors and visual identity to give the app a professional look.",
    "planos.steps.step3.title": "Step 3:",
    "planos.steps.step3.name": "Send to your customers",
    "planos.steps.step3.description":
      "Share the link and the customer installs it directly on their phone with one tap, no complicated login.",
    "planos.steps.final.title": "Simple as that. From eBook to App in 3 minutes.",
    "planos.steps.final.subtitle": "If you start now!",
    "planos.steps.final.button": "Transform My eBook into App Now",

    // Planos Page - Benefits Section
    "planos.benefits.title.part1": "What changes when your ebook",
    "planos.benefits.title.highlight": "stops being a file",
    "planos.benefits.title.part2": "and becomes an app",
    "planos.benefits.card1.title": "Charge 3x More for the Same Content",
    "planos.benefits.card1.desc":
      'Your info product stops being "just an eBook" and becomes a premium experience. Your customers will perceive it as much more valuable and you can justify higher prices.',
    "planos.benefits.card2.title": "Convert More Visitors into Buyers",
    "planos.benefits.card2.desc":
      'When you offer a professional app instead of a simple PDF, your product stands out from the competition. Customers see more value, trust more, and click "buy" with less resistance.',
    "planos.benefits.card3.title": "Reduce Refund Requests by 90%",
    "planos.benefits.card3.desc":
      "A customer who receives an organized, beautiful, and easy-to-use app is more satisfied. Result? Fewer complaints, fewer refunds, and more money in your pocket.",
    "planos.benefits.card4.title": "Your Customers Never Lose Access",
    "planos.benefits.card4.desc":
      "Unlike PDFs that disappear on phones or get lost in email, your app stays on the smartphone home screen, one click away. Customers access whenever they want, from any device, zero hassle.",
    "planos.benefits.card5.title": "Look Like a Big Brand, Even as a Solo",
    "planos.benefits.card5.desc":
      "Your customer opens an app with professional design, organized interface, and smooth navigation. The premium experience increases your authority and generates natural referrals.",
    "planos.benefits.card6.title": "Sell to 10 or 10,000 Without Changing Anything",
    "planos.benefits.card6.desc":
      "It doesn't matter if you have 10 or 10 thousand customers. The process is the same, without hiring a programmer, paying for expensive servers, or worrying about technical infrastructure.",
    "planos.benefits.cta.subtitle":
      "Turn your eBook into a professional app that sells more, refunds less, and impresses your customers.",
    "planos.benefits.cta.title": "Start now.",
    "planos.benefits.cta.button": "Transform My eBook into App Now",

    // What MigraBook Does in Practice Section
    "planos.practice.title": "What MigraBook does in practice",
    "planos.practice.block1.title": "Turns simple content into a professional product",
    "planos.practice.block1.pdf.title": "PDF materials converted into an app",
    "planos.practice.block1.pdf.desc":
      "Convert eBooks, guides, manuals and any PDF material into a professional, organized and easy-to-access application. The content stops being a loose file and becomes a direct experience on the customer's phone.",
    "planos.practice.block1.video.title": "Videos (via link) and audios integrated into the app",
    "planos.practice.block1.video.desc":
      "In addition to PDFs/eBooks, you can complement the content with audios uploaded directly and videos added via YouTube link, all played within the app. The user consumes everything without leaving the app, keeping the experience centralized.",

    // Block 2
    "planos.practice.block2.title": "Simplifies access and reduces support",
    "planos.practice.block2.access.title": "Easy access",
    "planos.practice.block2.access.desc":
      "The customer receives the link, installs the app on their phone and accesses all content with a single tap, without complicated login.",
    "planos.practice.block2.install.title": "Quick installation (Android, iOS and Web)",
    "planos.practice.block2.install.desc":
      "The customer installs the app in seconds or accesses it directly through the browser, without needing to go to the Play Store or App Store.",
    "planos.practice.block2.whatsapp.title": "WhatsApp support inside the app",
    "planos.practice.block2.whatsapp.desc":
      "Add a floating button so your customer can reach you with one tap. Ideal for quick questions and avoiding refunds.",

    // Block 3
    "planos.practice.block3.title": "Keeps content always updated and professional-looking",
    "planos.practice.block3.realtime.title": "Real-time updates",
    "planos.practice.block3.realtime.desc":
      "Update content whenever you want, without resending links or files. Your app is always up to date and the customer always accesses the latest version.",
    "planos.practice.block3.templates.title": "Premium templates always ready",
    "planos.practice.block3.templates.desc":
      "Choose professional templates to organize your content and keep the app looking modern and well-presented, even when you add new materials.",

    // Block 4
    "planos.practice.block4.title": "Increases sales and engagement",
    "planos.practice.block4.push.title": "Push Notifications",
    "planos.practice.block4.push.desc":
      "Highlight new content, announcements and offers within the app, directing the user to important actions during app usage.",
    "planos.practice.block4.upsell.title": "Upsell, Order Bump and Affiliates",
    "planos.practice.block4.upsell.desc":
      "Sell more within the app itself, unlocking extra content, new offers or promoting products as an affiliate.",

    // Block 5
    "planos.practice.block5.title": "Allows scaling without limitations",
    "planos.practice.block5.users.title": "Unlimited users",
    "planos.practice.block5.users.desc": "Sell to as many people as you want, with no additional cost per user.",
    "planos.practice.block5.integration.title": "Integration with payment platforms",
    "planos.practice.block5.integration.desc":
      "Connect your app to major market platforms and automate access after purchase, without manual processes.",
    "planos.practice.block5.domain.title": "Custom domain",
    "planos.practice.block5.domain.desc":
      "Your app with your name, your brand and your domain, reinforcing authority and professionalism.",
    "planos.practice.cta.title": "You just saw everything MigraBook does.",
    "planos.practice.cta.subtitle": "Now see how easy it is to create yours.",
    "planos.practice.cta.button": "Create My App in 3 Minutes",

    // Ebook Section
    "subscribe.ebook.title":
      "Here's why your eBooks no longer deliver the value you imagine and how to transform them into a real product.",
    "subscribe.ebook.para1":
      "In your offer, just mentioning the word “ebook” already makes your potential customer lose half of their interest.",
    "subscribe.ebook.para2": "That’s because “ebook” sounds cheap, ordinary, and easily replaceable.",
    "subscribe.ebook.test_title": "Take a quick test (just read aloud):",
    "subscribe.ebook.test_ebook": "I'm selling an",
    "subscribe.ebook.test_ebook_word": "ebook",
    "subscribe.ebook.test_subject": "about weight loss.",
    "subscribe.ebook.test_app": "I'm selling an",
    "subscribe.ebook.test_app_word": "app",
    "subscribe.ebook.difference_question": "Do you see the difference?",
    "subscribe.ebook.mockup_ebook": "The first looks like a file.",
    "subscribe.ebook.mockup_app": "The second looks like a product.",
    "subscribe.ebook.app_experience_title": "App is experience, convenience, status.",
    "subscribe.ebook.app_experience_para1":
      "It's something that stays on the smartphone home screen, not lost in downloads or a folder.",
    "subscribe.ebook.app_experience_para2": "Your customer feels this right away.",
    "subscribe.header.language": "Language",
    "subscribe.header.portuguese": "Portuguese",
    "subscribe.header.english": "English",
    "subscribe.header.spanish": "Spanish",
    "subscribe.header.light_mode": "Light Mode",
    "subscribe.header.dark_mode": "Dark Mode",
    "subscribe.header.menu": "Menu",

    // Hero Section
    "subscribe.hero.main_title": "Convert Outdated eBooks into",
    "subscribe.hero.main_title.highlight": "Modern Apps",
    "subscribe.hero.main_title.line3": "with a few clicks,",
    "subscribe.hero.main_title.line4": "no coding required.",
    "subscribe.hero.main_subtitle": "Sell more by increasing perceived value without changing content.",
    "subscribe.hero.main_cta": "Create My App Now!",

    // Second Section - Why eBooks Don't Work
    "subscribe.ebook.problem.main_title":
      "Here's why your eBooks no longer deliver the value you imagine and how to transform them into a real product.",
    "subscribe.ebook.problem.para1":
      'In your offer, just by saying the word "ebook" your potential customer already loses half the interest.',
    "subscribe.ebook.problem.para2":
      'That\'s because "ebook" sounds like something cheap, common and easily replaceable.',
    "subscribe.ebook.problem.para3": "Take a quick test (just read aloud):",
    "subscribe.ebook.test.ebook": '"I\'m selling an ebook about weight loss."',
    "subscribe.ebook.test.app": '"I\'m selling an app about weight loss."',
    "subscribe.ebook.difference": "Do you see the difference?",
    "subscribe.ebook.mockup.caption1": "The first looks like a file.",
    "subscribe.ebook.mockup.caption2": "The second looks like a product.",
    "subscribe.ebook.experience.title": "App is experience, convenience, status.",
    "subscribe.ebook.experience.para1":
      "It's something that stays on the smartphone home screen, not lost in downloads or a folder.",
    "subscribe.ebook.experience.para2": "Your customer feels this right away.",

    // Third Section - Benefits Cards
    "subscribe.benefits.main_title": "What Changes When Your",
    "subscribe.benefits.main_title.line2": "Ebook Becomes an App?",
    "subscribe.benefits.title.subtitle": "And how Migrabook delivers this experience the right way.",
    "subscribe.benefits.value.title": "Added Value",
    "subscribe.benefits.value.desc":
      "eBooks appear to have little value. An app instantly elevates the perception of your offering.",
    "subscribe.benefits.ux.title": "User Experience",
    "subscribe.benefits.ux.desc":
      "Organized, beautiful, easy to navigate. Your customer doesn't need to search for files.",
    "subscribe.benefits.monetization.title": "Smart Monetization",
    "subscribe.benefits.monetization.desc":
      "Use in-app notifications to offer upgrades, extra modules and new offers, boosting your sales effortlessly.",
    "subscribe.benefits.identity.title": "Consistent Visual Identity",
    "subscribe.benefits.identity.desc": "Custom logo, colors and name. The app is truly yours, not third-party.",
    "subscribe.benefits.multilang.title": "Multi-language Interface",
    "subscribe.benefits.multilang.desc":
      "Menus, buttons and messages can be translated into any language. Ideal for selling your app in other countries.",
    "subscribe.benefits.access.title": "Easy Access",
    "subscribe.benefits.access.desc":
      "Your customer buys, you send the link and done! No login area, no support hassle and less refunds.",
    "subscribe.benefits.updates.title": "Automatic Updates",
    "subscribe.benefits.updates.desc":
      "Need to fix or add something in the app? Update once and everyone receives it, no need to resend PDF and no rework.",
    "subscribe.benefits.integration.title": "Direct Integration",
    "subscribe.benefits.integration.desc":
      "Connect your app with any platform (Hotmart, Kiwify, Stripe or others) and maintain full control over your sales.",
    "subscribe.benefits.migrate_now": "Migrate Now",

    // Fourth Section - Target Audience
    "subscribe.target.main_title": "Who is Migrabook.app for?",
    "subscribe.target.bullet1.title": "For those who want to increase sales with the same content",
    "subscribe.target.bullet1.desc":
      "Transform the PDF you already have into a professional app and sell much more, just by changing the delivery format.",
    "subscribe.target.bullet3.title": 'For those tired of refunds due to "access difficulties"',
    "subscribe.target.bullet3.desc":
      "Deliver an app that works perfectly - customer accesses easily, complains less, refunds less.",
    "subscribe.target.bullet4.title": "For those who want to protect their content from piracy",
    "subscribe.target.bullet4.desc":
      "Stop seeing your work leaked in Telegram groups. App makes copying difficult and protects your authority.",
    "subscribe.target.bullet5.title": "For those who want to stand out from the crowd of generic eBooks",
    "subscribe.target.bullet5.desc":
      "While everyone delivers $27 PDFs, you deliver a professional app and position yourself as an authority.",
    "subscribe.target.bullet6.title":
      "For those who want to sell in dollars without language or international delivery hassle",
    "subscribe.target.bullet6.desc":
      "Your app works in any country, supports any language. Translate your content, launch in the US or LATAM and earn 5x more in dollars. Same app, multiplied profit.",

    // Fifth Section - Digital Knowledge Problems
    "subscribe.problems.title": "30-40% of your customers get stuck here",
    "subscribe.problems.title.line2": "(and you lose the sale)",
    "subscribe.problems.title.part1": "30-40% of your customers get stuck here",
    "subscribe.problems.title.part2": "(and you lose the sale)",
    "subscribe.problems.item1": "Customer needs to create login (and already gives up here)",
    "subscribe.problems.item2": "Confirm email (which goes to spam)",
    "subscribe.problems.item3": "Remember password (which they forget in 2 days)",
    "subscribe.problems.item4": "Access members area (which doesn't load on mobile)",
    "subscribe.problems.item5": "Navigate to content (if they still have patience)",
    "subscribe.problems.question": "1 in 3 customers can't get in",
    "subscribe.problems.warning_question": "1 in 3 customers can't get in",
    "subscribe.problems.result":
      "→ complains 'didn't receive'\n→ requests refund\n→ you lose the sale and the product.",
    "subscribe.problems.warning_box":
      "→ complains 'didn't receive'\n→ requests refund\n→ you lose the sale and the product.",

    // Sixth Section - How Migrabook Changes
    "subscribe.changes.title": "With Migrabook.app, this changes.",
    "subscribe.changes.intro": "You deliver your content directly in the app:",
    "subscribe.changes.benefit1": "No login",
    "subscribe.changes.benefit2": "No email confirmation",
    "subscribe.changes.benefit3": "No password",
    "subscribe.changes.benefit4": "No technical support",
    "subscribe.changes.no_login": "No login",
    "subscribe.changes.no_email": "No email confirmation",
    "subscribe.changes.no_password": "No password",
    "subscribe.changes.no_support": "No technical support",
    "subscribe.changes.success": 'Your customer receives a link → Clicks "Install" → and done.',
    "subscribe.changes.success_box": 'Your customer receives a link → Clicks "Install" → and done.',
    "subscribe.changes.success.detail": "Simple. Direct. And easy.",
    "subscribe.changes.success_tagline": "Simple. Direct. And easy.",
    "subscribe.changes.demo_link": "Click and see the demo",

    // Planos Page - Sixth Section - How Migrabook Changes (specific texts)
    "planos.changes.title": "With MigraBook.app, your customer enters in 10 seconds.",
    "planos.changes.intro": "You deliver your content directly in the app:",
    "planos.changes.benefit1": "No login (customer enters directly)",
    "planos.changes.benefit2": "No email confirmation (zero difficulty)",
    "planos.changes.benefit3": "No password (never forgotten)",
    "planos.changes.benefit4": "No technical support (less headache)",
    "planos.changes.success_box": "Your customer receives a link → Clicks 'Install' → Accesses in 10 seconds.",
    "planos.changes.success_tagline": "Zero difficulty. Zero refunds. Zero headache.",

    // Planos Page - CTA Section
    "planos.cta.title": "Stop losing money on refunds due to access difficulties.",
    "planos.cta.subtitle":
      "Transform your PDF into a professional app and eliminate difficulty, complaints and refunds.",
    "planos.cta.button": "Transform My eBook to App Now",
    "planos.cta.tagline": "Your app ready in 3 minutes.",

    // Planos Page - Countdown Timer
    "planos.countdown.title": "Promotional Price Ends In:",
    "planos.countdown.hours": "HOURS",
    "planos.countdown.minutes": "MINUTES",
    "planos.countdown.seconds": "SECONDS",
    "planos.countdown.disclaimer": "Then it goes back to the original price",

    // Planos Page - Final CTA Section
    "planos.final.urgency": "Last hours at promotional price",
    "planos.final.title.part1": "Keep selling eBook/PDF or Professional App?",
    "planos.final.title.part2": "The choice is yours.",
    "planos.final.cta.button": "I Want to Transform My eBook into App Now",
    "planos.final.cta.whatsapp": "Talk on WhatsApp",
    "planos.final.benefit1": "App ready in 3 minutes (zero coding)",
    "planos.final.benefit2": "Support responding within 2h",
    "planos.final.benefit3": "Cancel whenever you want (no penalty)",
    "planos.final.benefit4": "Used by 2,347+ content creators",

    // Planos Page - Compare Costs
    "planos.compare.title": "Compare the costs",
    "planos.compare.developer.label": "Hire developer to create 1 app from scratch",
    "planos.compare.developer.price": "$3,000+",
    "planos.compare.members.label": "Members area with user limit",
    "planos.compare.members.price": "$197/month",
    "planos.compare.migrabook.label": "MigraBook with unlimited users",
    "planos.compare.migrabook.price": "Starting at $47/month",

    // Integration Section
    "subscribe.integration.main_title": "Your preferred platform",
    "subscribe.integration.main_title.line2": "connected in just a few clicks",
    "subscribe.integration.title.part1": "Your preferred platform",
    "subscribe.integration.title.part2": "connected",
    "subscribe.integration.title.part3": "in just a few clicks",
    "subscribe.integration.subtitle": "Migrabook.app is already integrated with the major market platforms.",
    "subscribe.integration.bottom_text": "Connect and start selling in minutes, without technical complications.",

    // Pricing Section
    "subscribe.pricing.main_title": "Plans and Pricing",
    "subscribe.pricing.period.year": "/year",
    "subscribe.pricing.period.month": "/month",
    "subscribe.pricing.equivalent": "Equals $",
    "subscribe.pricing.start_now": "Start Now",

    // FAQ Section
    "subscribe.faq.question1": "How does Migrabook.app work?",
    "subscribe.faq.q1.question": "How does Migrabook.app work?",
    "subscribe.faq.q1.answer":
      "You import your eBook (PDF) to the platform and before publishing, you customize the app layout (colors, cover, logo, icons and name). While customizing, you see a real-time preview of how the app will look. After that, Migrabook.app automatically generates a ready-to-send app. When your customer purchases, they receive the link, install on their smartphone and access content immediately. No login, password or members area.",
    "subscribe.faq.answer1":
      "You import your eBook (PDF) to the platform and before publishing, you customize the app layout (colors, cover, logo, icons and name). While customizing, you see a real-time preview of how the app will look. After that, Migrabook.app automatically generates a ready-to-send app. When your customer purchases, they receive the link, install on their smartphone and access content immediately. No login, password or members area.",
    "subscribe.faq.question2": "Does the customer need to download the app on their smartphone?",
    "subscribe.faq.q2.question": "Does the customer need to download the app on their smartphone?",
    "subscribe.faq.q2.answer":
      "No. The customer just adds the app to the smartphone screen with a single click. Access is direct and immediate.",
    "subscribe.faq.answer2":
      "No. The customer just adds the app to the smartphone screen with a single click. Access is direct and immediate.",
    "subscribe.faq.question3": "Can the customer access from computer?",
    "subscribe.faq.q3.question": "Can the customer access from computer?",
    "subscribe.faq.q3.answer":
      "Yes. The same app can be opened in the desktop browser. The interface automatically adapts to screen size.",
    "subscribe.faq.answer3":
      "Yes. The same app can be opened in the desktop browser. The interface automatically adapts to screen size.",
    "subscribe.faq.question3a": "Can I add videos inside the app created in Migrabook.app?",
    "subscribe.faq.q3a.question": "Can I add videos inside the app created in Migrabook.app?",
    "subscribe.faq.q3a.answer":
      "Yes, but only in the Enterprise Plan. In this plan, you can activate the 'Video Course' mode and add links to videos hosted on YouTube. The player is displayed directly within the application, without opening an external browser and without leaving the app environment.",
    "subscribe.faq.answer3a":
      "Yes, but only in the Enterprise Plan. In this plan, you can activate the 'Video Course' mode and add links to videos hosted on YouTube. The player is displayed directly within the application, without opening an external browser and without leaving the app environment.",
    "subscribe.faq.question4": "Does my customer's payment happen within the app?",
    "subscribe.faq.q4.question": "Does my customer's payment happen within the app?",
    "subscribe.faq.q4.answer":
      'No. Payment happens on your sales platform of choice (Hotmart, Kiwify, Eduzz, Stripe, etc). Since Migrabook.app integrates with the platforms, after purchase the system automatically sends the app link to your customer. They click \\"Install\\" and done. Simple. Direct. And easy.',
    "subscribe.faq.answer4":
      'No. Payment happens on your sales platform of choice (Hotmart, Kiwify, Eduzz, Stripe, etc). Since Migrabook.app integrates with the platforms, after purchase the system automatically sends the app link to your customer. They click "Install" and done. Simple. Direct. And easy.',
    "subscribe.faq.question5": "Can I put the app on Play Store or App Store?",
    "subscribe.faq.q5.question": "Can I put the app on Play Store or App Store?",
    "subscribe.faq.q5.answer":
      "On Play Store you would pay $25. On App Store, $99. With Migrabook.app, you don't have this cost.",
    "subscribe.faq.answer5":
      "On Play Store you would pay $25. On App Store, $99. With Migrabook.app, you don't have this cost.",
    "subscribe.faq.question6": "Can I update the app content after publishing?",
    "subscribe.faq.q6.question": "Can I update the app content after publishing?",
    "subscribe.faq.q6.answer":
      "Yes. Any changes made in the panel (colors, cover, logo, icons, name and updated content) automatically appear for all users, without resending anything to anyone.",
    "subscribe.faq.answer6":
      "Yes. Any changes made in the panel (colors, cover, logo, icons, name and updated content) automatically appear for all users, without resending anything to anyone.",
    "subscribe.faq.q6b.question": "How does cancellation work?",
    "subscribe.faq.q6b.answer":
      "Cancellation only stops future renewals. You continue to have access until the end of your already paid period.",
    "subscribe.faq.question7": "What happens if I cancel my Migrabook.app subscription?",
    "subscribe.faq.q7.question": "What happens if I cancel my Migrabook.app subscription?",
    "subscribe.faq.q7.answer":
      "Your app is deactivated and your customers lose access. Before canceling, we recommend you save your buyers list and define another delivery format, if you wish to keep the product available to your customers.",
    "subscribe.faq.answer7":
      "Your app is deactivated and your customers lose access. Before canceling, we recommend you save your buyers list and define another delivery format, if you wish to keep the product available to your customers.",
    "subscribe.faq.question8": "Do I need to know programming to use Migrabook.app?",
    "subscribe.faq.q8.question": "Do I need to know programming to use Migrabook.app?",
    "subscribe.faq.q8.answer":
      "No. The system is 100% intuitive. You just upload content, adjust the visuals and publish.",
    "subscribe.faq.answer8":
      "No. The system is 100% intuitive. You just upload content, adjust the visuals and publish.",
    "subscribe.faq.question9": "How long does it take to convert my eBook into an app?",
    "subscribe.faq.q9.question": "How long does it take to convert my eBook into an app?",
    "subscribe.faq.q9.answer":
      "Generation is instant. You import content and see the app preview right away. If you want, you can publish at that same instant.",
    "subscribe.faq.answer9":
      "Generation is instant. You import content and see the app preview right away. If you want, you can publish at that same instant.",

    // Final CTA Section
    "subscribe.final.main_title": "Ready to Transform Your eBook into a Successful App?",
    "subscribe.final.subtitle": "Join hundreds of authors who have already taken their content to the next level.",
    "subscribe.final.button.primary": "Create My App Now",
    "subscribe.final.cta.button": "Create My App Now",
    "subscribe.final.feature1": "No programming required",
    "subscribe.final.feature2": "Full support",
    "subscribe.final.feature3": "Results in minutes",

    // Subscribe Page - Experience Section
    "subscribe.experience.title":
      "What separates those who still sell PDFs from those who build a real product is the experience.",
    "subscribe.experience.hero_title":
      "What separates those who still sell PDFs from those who build a real product is the experience.",
    "subscribe.experience.subtitle": "Ready to break out of the old model?",
    "subscribe.experience.tagline": "And experience today is an app.",
    "subscribe.experience.cta": "I Want to Migrate Now",
    "subscribe.experience.question": "",

    // Progress
    "progress.upload": "Upload",
    "progress.customization": "Customization",
    "progress.publish": "Publish",

    // Upload Section
    "upload.title": "Product Upload",
    "upload.main": "Main Product",
    "upload.main.desc": "PDF or ZIP of main product",
    "upload.bonus": "Bonus",
    "upload.bonus.desc": "Additional material (PDF, ZIP)",
    "upload.send": "Send",
    "import.title": "Import Existing App",
    "import.json": "Upload via JSON",
    "import.json.placeholder": "Paste the app JSON...",
    "import.id": "Import by ID",
    "import.id.placeholder": "App ID...",
    "import.button": "Import",

    // Phone Preview
    "preview.title": "App Preview",

    // Customization
    "custom.title": "App Customization",
    "custom.name": "App Name",
    "custom.name.placeholder": "Enter your app name",
    "custom.color": "App Color",
    "custom.theme": "App Theme",
    "custom.theme.dark": "Dark",
    "custom.theme.light": "Light",
    "custom.icon": "App Icon",
    "custom.icon.upload": "Upload Icon",
    "custom.cover": "App Cover",
    "custom.cover.upload": "Upload Cover",
    "custom.link": "Custom Link",
    "custom.link.placeholder": "Your URL here",
    "custom.link.help": "Leave blank for automatic URL generation",
    "custom.link.locked": "Via domain",
    "custom.link.managed": "The link is managed through your custom domain. Configure paths in the Custom Domain menu.",
    "custom.reset": "Reset",

    // Phone mockup
    "phone.main.title": "Insert your title here",
    "phone.main.subtitle": "Download now and start transforming your results",
    "phone.main.description": "Insert your description here",
    "phone.bonus.title": "Insert bonus title here",
    "phone.view": "View",
    "phone.access": "Access",
    "phone.exclusive_bonus": "Exclusive bonus",
    "phone.view.short": "View",
    "phone.view.pdf": "View PDF",
    "phone.default.description": "App Description",
    "phone.image.dimensions": "PNG or JPG 1920x1080",
    "phone.home": "Home",
    "phone.products": "Products",

    // Admin Panel
    "admin.title": "Admin Panel",
    "admin.subtitle": "Complete platform control",
    "admin.students": "Students",
    "admin.settings": "Settings",
    "admin.integrations": "Integrations",
    "admin.apps": "Manage Apps",
    "admin.logout": "Logout",
    "admin.preview.title": "Template Builder & Preview",
    "admin.preview.subtitle": "Create custom templates and visualize how your app will look",

    // Player Page
    "player.no.video": "No video selected",
    "player.param.help": "Use the ?v= parameter with the YouTube video link or ID",
    "player.example": "Example: /player?v=dQw4w9WgXcQ",

    // Maintenance Page
    "maintenance.title": "Under Maintenance",
    "maintenance.message": "Our system is undergoing an update to better serve you.",
    "maintenance.back.soon": "We'll be back soon!",
    "maintenance.thanks": "Thank you for your patience. We are working to offer an even better experience.",

    // Not Found Page
    "notfound.title": "404",
    "notfound.message": "Oops! Page not found",
    "notfound.home": "Return to Home",

    // App Viewer
    "appviewer.notfound.title": "App not found",
    "appviewer.notfound.message": "This app doesn't exist or has been removed.",
    "appviewer.notfound.help": "Check if the link is correct or contact whoever shared this app with you.",
    "admin.students.title": "Student Management",
    "admin.students.subtitle": "Access control and user monitoring",
    "admin.students.active": "active",
    "admin.students.search": "Search by email...",
    "admin.students.all": "All",
    "admin.students.active.filter": "Active",
    "admin.students.inactive": "Inactive",
    "admin.students.email": "Email",
    "admin.students.phone": "Phone",
    "admin.students.plan": "Plan",
    "admin.students.apps": "Published Apps",
    "admin.students.status": "Status",
    "admin.students.created": "Registration Date",
    "admin.students.actions": "Actions",
    "admin.students.details": "View Details",
    "admin.settings.title": "System Settings",
    "admin.settings.subtitle": "Manage global platform settings",
    "admin.settings.save": "Save Settings",
    "admin.settings.language": "Default System Language",
    "admin.settings.language.placeholder": "Select language",
    "admin.settings.terms": "Terms of Use",
    "admin.settings.terms.placeholder": "Enter platform terms of use...",
    "admin.settings.cancellation": "Cancellation Message",
    "admin.settings.cancellation.placeholder": "Message displayed when access is cancelled...",
    "admin.settings.cancellation.help": "This message will be displayed in apps of users with deactivated access",

    // Admin Login
    "admin.login.title": "Admin Panel",
    "admin.login.subtitle": "Exclusive access for administrators",
    "admin.login.email": "Email",
    "admin.login.password": "Password",
    "admin.login.submit": "Login",
    "admin.login.loading": "Logging in...",

    // Integrations
    "integrations.title": "Integrations",
    "integrations.subtitle": "Configure integrations with external services",
    "integrations.save": "Save Settings",
    "integrations.saving": "Saving...",
    "integrations.activecampaign.title": "ActiveCampaign",
    "integrations.activecampaign.subtitle": "Email marketing automation",
    "integrations.activecampaign.api_url": "API URL",
    "integrations.activecampaign.api_url.placeholder": "https://your-account.api-us1.com",
    "integrations.activecampaign.api_key": "API Key",
    "integrations.activecampaign.api_key.placeholder": "your-api-key",
    "integrations.make.title": "Make",
    "integrations.make.subtitle": "Process automation",
    "integrations.make.webhook_url": "Webhook URL",
    "integrations.make.webhook_url.placeholder": "https://hook.integromat.com/...",
    "integrations.new_title": "New Integration",
    "integrations.edit_title": "Edit Integration",
    "integrations.new_description": "Connect your product from external platforms with your app",
    "integrations.edit_description": "Modify the fields and click Save to update",
    "integrations.platform": "Platform",
    "integrations.platform_placeholder": "Select platform",
    "integrations.product_id": "Product / Offer ID",
    "integrations.product_id_placeholder": "Ex: prod_12345 or offer-name",
    "integrations.app_link": "Access Link (Email)",
    "integrations.app_link_placeholder": "https://yoursite.com/app or https://migrabook.app/your-app",
    "integrations.app_link_help": "URL that will be sent in the email button. Can be your custom domain or any link.",
    "integrations.save_button": "Save Integration",
    "integrations.active_title": "Active Integrations",
    "integrations.active_count": "{count} integration(s) configured",
    "integrations.select.language": "Select language",
    "integrations.product.id.placeholder": "Enter Product ID here",
    "integrations.token.placeholder": "Paste your account token here",
    "integrations.config.kiwify": "Kiwify Configuration",
    "integrations.config.cartpanda": "Cart Panda Configuration",

    // === INTEGRATIONS PANEL ===
    // Main titles
    "integrations.new.title": "New Integration",
    "integrations.new.description": "Connect your payment platform",
    "integrations.active.title": "Active Integrations",
    "integrations.active.count": "integration(s) configured",

    // Common labels
    "integrations.platform.label": "Platform",
    "integrations.platform.select": "Select platform",
    "integrations.language.label": "App Language",
    "integrations.applink.label": "App Link",
    "integrations.productid.label": "Product ID",
    "integrations.webhook.url.label": "🔐 URL to configure webhook:",
    "integrations.product.label": "Product:",
    "integrations.validated.badge": "✓ Validated",

    // Buttons
    "integrations.button.cancel": "Cancel",
    "integrations.button.saving": "Saving...",
    "integrations.button.update": "Update Integration",
    "integrations.button.save": "Save Integration",
    "integrations.button.copy.success": "URL copied!",

    // General errors and validations
    "integrations.error.load": "Error loading integrations",
    "integrations.error.required": "⚠️ Required fields",
    "integrations.error.required.description": "Fill in all required fields",
    "integrations.error.save": "❌ Error saving",
    "integrations.error.delete": "Error deleting",
    "integrations.success.delete": "Integration deleted!",
    "integrations.success.save": "✅ Integration saved!",
    "integrations.success.save.description": "was successfully configured",
    "integrations.success.update": "✅ Integration updated!",
    "integrations.success.update.description": "was successfully updated",
    "integrations.success.validate": "✅ Product validated!",
    "integrations.success.validate.found": "found on",
    "integrations.error.invalid": "❌ Invalid product",
    "integrations.error.validation": "Validation error",

    // Specific validations - Token
    "integrations.error.token.required": "⚠️ Token required",

    // Specific validations - Monetizze
    "integrations.error.monetizze.productid.required": "⚠️ Product ID required",
    "integrations.error.monetizze.productid.required.description": "Please enter the Monetizze Product ID",
    "integrations.error.monetizze.productid.invalid": "⚠️ Invalid Product ID",
    "integrations.error.monetizze.productid.invalid.description": "Monetizze Product ID must contain only numbers",
    "integrations.error.monetizze.key.required": "⚠️ Webhook Key required",
    "integrations.error.monetizze.key.required.description": "Please enter the Monetizze Webhook Key (postback_key)",
    "integrations.error.monetizze.key.invalid": "⚠️ Invalid Webhook Key",
    "integrations.error.monetizze.key.invalid.description":
      "Webhook Key must be at least 20 characters and cannot contain spaces",

    // Specific validations - Eduzz
    "integrations.error.eduzz.key.required": "⚠️ Eduzz Key required",
    "integrations.error.eduzz.key.required.description": "Please enter the Eduzz Webhook Key (Eduzz Key)",
    "integrations.error.eduzz.key.invalid": "⚠️ Invalid Eduzz Key",
    "integrations.error.eduzz.key.invalid.description":
      "Eduzz Key must be at least 20 characters and cannot contain spaces",

    // Specific validations - Hotmart
    "integrations.error.hotmart.credentials.required": "⚠️ Hotmart credentials required",
    "integrations.error.hotmart.credentials.required.description":
      "Client ID, Client Secret and Basic Token are required",

    // Specific validations - Stripe
    "integrations.error.stripe.credentials.required": "⚠️ Stripe credentials required",
    "integrations.error.stripe.credentials.required.description": "API Key and Webhook Token are required",

    // Specific validations - PayPal
    "integrations.error.paypal.credentials.required": "⚠️ PayPal credentials required",
    "integrations.error.paypal.credentials.required.description": "Client ID and Secret are required",

    // Specific validations - Cart Panda
    "integrations.error.cartpanda.credentials.required": "⚠️ Cart Panda credentials required",
    "integrations.error.cartpanda.credentials.required.description": "Bearer Token and Store Slug are required",

    // Specific validations - Braip
    "integrations.error.braip.credentials.required": "⚠️ Braip credentials required",
    "integrations.error.braip.credentials.required.description": "Client ID and Client Secret are required",

    // Specific validations - Cakto
    "integrations.error.cakto.token.required": "⚠️ Webhook Token required",
    "integrations.error.cakto.token.required.description": "Enter the Cakto Webhook Token",

    // === PLATFORM CONFIGURATIONS ===

    // HOTMART
    "integrations.hotmart.title": "Hotmart Configuration",
    "integrations.hotmart.clientid.label": "Client ID",
    "integrations.hotmart.clientid.placeholder": "Paste your Client ID here",
    "integrations.hotmart.clientsecret.label": "Client Secret",
    "integrations.hotmart.clientsecret.placeholder": "Paste your Client Secret here",
    "integrations.hotmart.basictoken.label": "Basic Token",
    "integrations.hotmart.basictoken.placeholder": "Paste your Basic Token here",

    // STRIPE
    "integrations.stripe.title": "Stripe Configuration",
    "integrations.stripe.apikey.label": "Stripe API Key",
    "integrations.stripe.apikey.placeholder": "Paste your API Key here",
    "integrations.stripe.webhooktoken.label": "Webhook Token *",
    "integrations.stripe.webhooktoken.placeholder": "Paste your Stripe Webhook Token here",

    // KIWIFY
    "integrations.kiwify.title": "Kiwify Configuration",
    "integrations.kiwify.apitoken.label": "API Token (Optional)",
    "integrations.kiwify.apitoken.placeholder": "Paste your API Token here (required for validation)",
    "integrations.kiwify.accountid.label": "Account ID *",
    "integrations.kiwify.accountid.placeholder": "Ex: 12345",
    "integrations.kiwify.accountid.help": "ℹ️ Available in Settings → Credentials",

    // CART PANDA
    "integrations.cartpanda.title": "Cart Panda Configuration",
    "integrations.cartpanda.productid.label": "Product ID",
    "integrations.cartpanda.token.label": "Token",
    "integrations.cartpanda.token.placeholder": "Paste your Cart Panda API Token here",
    "integrations.cartpanda.storeslug.label": "Store Slug *",
    "integrations.cartpanda.storeslug.placeholder": "Ex: mystore",

    // PERFECT PAY
    "integrations.perfectpay.title": "Perfect Pay Configuration",
    "integrations.perfectpay.productid.label": "Product ID",
    "integrations.perfectpay.webhooktoken.label": "Webhook Token",
    "integrations.perfectpay.webhooktoken.placeholder": "Enter your Webhook Token here",

    // CAKTO
    "integrations.cakto.title": "Cakto Configuration",
    "integrations.cakto.productid.label": "Product ID",
    "integrations.cakto.webhooktoken.label": "Webhook Token *",
    "integrations.cakto.webhooktoken.placeholder": "Paste your Cakto Webhook Token here",

    // BRAIP
    "integrations.braip.title": "Braip Configuration",
    "integrations.braip.productid.label": "Product ID",
    "integrations.braip.clientid.label": "Client ID *",
    "integrations.braip.clientid.placeholder": "Ex: 12345abcde",
    "integrations.braip.clientsecret.label": "Client Secret *",
    "integrations.braip.clientsecret.placeholder": "Paste your Braip Client Secret here",

    // MONETIZZE
    "integrations.monetizze.title": "Monetizze Configuration",
    "integrations.monetizze.productid.label": "Product ID *",
    "integrations.monetizze.key.label": "Webhook Key (Postback Key) *",
    "integrations.monetizze.key.placeholder": "Paste your Monetizze Webhook Key here",
    "integrations.monetizze.key.help": "ℹ️ Webhook key is required to validate purchases",

    // EDUZZ
    "integrations.eduzz.title": "Eduzz Configuration",
    "integrations.eduzz.productid.label": "Product ID *",
    "integrations.eduzz.key.label": "Webhook Key (Eduzz Key) *",
    "integrations.eduzz.key.placeholder": "Paste your Eduzz Webhook Key here",
    "integrations.eduzz.key.help": "ℹ️ Webhook key is required to validate purchases",

    // PAYPAL
    "integrations.paypal.title": "PayPal Configuration",
    "integrations.paypal.clientid.label": "Client ID *",
    "integrations.paypal.clientid.placeholder": "Ex: AYSq3RDGsmBLJE-otTkBtM-j...",
    "integrations.paypal.secret.label": "Secret *",
    "integrations.paypal.secret.placeholder": "Paste your PayPal Secret here",

    // === HOTMART INSTRUCTIONS ===
    "integrations.hotmart.instructions.title": "✅ Hotmart Integration Saved!",
    "integrations.hotmart.instructions.laststep": "Last step:",
    "integrations.hotmart.instructions.description":
      "Configure the Webhook in Hotmart to receive purchase notifications and automatically send the access email.",
    "integrations.hotmart.instructions.steps.title": "📝 Step by step:",
    "integrations.hotmart.instructions.step1": "1. Access your Hotmart dashboard",
    "integrations.hotmart.instructions.step1.link": "Open Hotmart",
    "integrations.hotmart.instructions.step2": "2. Configure the Webhook:",
    "integrations.hotmart.instructions.step2.item1": "Go to",
    "integrations.hotmart.instructions.step2.item1.bold": "Tools > Webhook",
    "integrations.hotmart.instructions.step2.item2": "Add the Webhook URL (copy below)",
    "integrations.hotmart.instructions.step2.item3": "Check the event:",
    "integrations.hotmart.instructions.step2.item3.bold": "Purchase Approved",
    "integrations.hotmart.instructions.step2.item4": "Save configuration",
    "integrations.hotmart.instructions.webhook.label": "📋 Webhook URL (copy below):",

    // === MONETIZZE INSTRUCTIONS ===
    "integrations.monetizze.instructions.title": "⚠️ Monetizze will be validated on first purchase",
    "integrations.monetizze.instructions.description1":
      "Since Monetizze doesn't have a prior validation API, the system will verify:",
    "integrations.monetizze.instructions.check1": "If the Product ID matches the product",
    "integrations.monetizze.instructions.check2": "If the Postback Key is valid",
    "integrations.monetizze.instructions.description2":
      "This will happen automatically when the first purchase arrives via webhook.",
    "integrations.monetizze.instructions.steps.title": "📝 How to configure Webhook in Monetizze:",
    "integrations.monetizze.instructions.step1": "1. Access your Monetizze dashboard",
    "integrations.monetizze.instructions.step1.link": "Open Monetizze",
    "integrations.monetizze.instructions.step2": "2. Configure the Postback:",
    "integrations.monetizze.instructions.step2.item1": "Go to",
    "integrations.monetizze.instructions.step2.item1.bold": "Product > Postback > Status",
    "integrations.monetizze.instructions.step2.item2": "In the option",
    "integrations.monetizze.instructions.step2.item2.bold": "Completed (purchase approved)",
    "integrations.monetizze.instructions.step2.item2.after": ", add the Webhook URL below",
    "integrations.monetizze.instructions.step2.item3": "Save configuration",
    "integrations.monetizze.instructions.webhook.label": "📋 Webhook URL (copy below):",

    // === EDUZZ INSTRUCTIONS ===
    "integrations.eduzz.instructions.title": "⚠️ Eduzz will be validated on first purchase",
    "integrations.eduzz.instructions.description1":
      "Since Eduzz doesn't have a prior validation API, the system will verify:",
    "integrations.eduzz.instructions.check1": "If the Product ID matches the product",
    "integrations.eduzz.instructions.check2": "If the Eduzz Key is valid",
    "integrations.eduzz.instructions.description2":
      "This will happen automatically when the first purchase arrives via webhook.",
    "integrations.eduzz.instructions.steps.title": "📝 How to configure Webhook in Eduzz:",
    "integrations.eduzz.instructions.step1": "1. Access your Eduzz dashboard",
    "integrations.eduzz.instructions.step1.link": "Open Eduzz",
    "integrations.eduzz.instructions.step2": "2. Configure the Webhook:",
    "integrations.eduzz.instructions.step2.item1": "Go to",
    "integrations.eduzz.instructions.step2.item1.bold": "Content > Webhook",
    "integrations.eduzz.instructions.step2.item2": "Add the Webhook URL (copy below)",
    "integrations.eduzz.instructions.step2.item3": "Check the events for:",
    "integrations.eduzz.instructions.step2.item3.bold": "Sale and Cancellation",
    "integrations.eduzz.instructions.step2.item4": "Save configuration",
    "integrations.eduzz.instructions.webhook.label": "📋 Webhook URL (copy below):",
    "integrations.eduzz.instructions.tip":
      "💡 Tip: Make a test purchase or use Postman to simulate a purchase and verify if the webhook is working correctly.",

    // Toast Messages
    "toast.logout.error.title": "Logout Error",
    "toast.logout.error.description": "Could not logout",
    "toast.logout.success.title": "Logged Out",
    "toast.logout.success.description": "You have been successfully logged out",
    "toast.login.error.title": "Login Error",
    "toast.login.error.description": "Unexpected error. Please try again.",
    "toast.login.error.invalid_credentials":
      "Incorrect email or password. Please check your credentials and try again.",
    "toast.login.success.title": "Login Successful",
    "toast.login.success.description": "Checking administrative permissions...",
    "toast.validation.title": "Invalid Data",
    "toast.copy.success.title": "Copied!",
    "toast.copy.success.description": "The link has been copied to clipboard.",
    "toast.copy.error.title": "Error",
    "toast.copy.error.description": "Could not copy the link.",
    "toast.save.success.title": "Settings Saved",
    "toast.save.success.description": "Integrations have been configured successfully",
    "toast.error.title": "Error",
    "toast.error.description": "An unexpected error occurred",
    "toast.upload.success.title": "Upload successful!",
    "toast.upload.success.description": "{fileName} has been uploaded.",
    "toast.upload.error.title": "Upload error",
    "toast.upload.error.description": "Could not upload the file.",
    "toast.file.invalid.title": "Unsupported format",
    "toast.file.invalid.description": "Please upload only PDFs or MP3s up to 100 MB.",
    "toast.file.size.title": "File too large",
    "toast.file.size.description": "Please upload only PDFs or MP3s up to 100 MB.",
    "toast.import.success.title": "App imported successfully!",
    "toast.import.success.description": 'App data "{appName}" has been loaded.',
    "toast.import.error.title": "Import error",
    "toast.import.error.description": "Could not import the app. Check the ID.",
    "toast.backup.success.title": "Backup created!",
    "toast.backup.success.description": "JSON file downloaded successfully.",
    "toast.json.import.success.title": "JSON imported successfully!",
    "toast.json.import.success.description": "File data has been loaded.",
    "toast.json.error.title": "JSON error",
    "toast.json.error.description": "Invalid JSON file or incompatible format.",
    "toast.feature.unavailable.title": "Feature unavailable",
    "toast.feature.unavailable.description": "Importing apps is only available in Professional and Business plans.",

    // Customization - Tabs
    "custom.tabs.general": "General",
    "custom.tabs.labels": "Texts and Labels",

    // Customization - Form Labels
    "custom.description": "App Description",
    "custom.description.placeholder": "Description that appears in the app...",
    "custom.domain": "Custom Domain",
    "custom.main.title": "Main Product Title",
    "custom.main.description": "Main Product Description",
    "custom.bonuses.title": "Bonus Section Title",
    "custom.bonus.name": "Bonus",
    "custom.bonus.colors": "Bonus Colors",
    "custom.view.button": "View Button Text",
    "custom.view.button.help": "Customize the text displayed on the product view button",
    "custom.view.button.placeholder": "Enter the 'view' button text",
    "custom.bonus.thumbnail.alt": "Bonus Thumbnail",

    // WhatsApp
    "whatsapp.title": "App WhatsApp",
    "whatsapp.description": "Configure the WhatsApp button that will appear in your app",
    "whatsapp.enable": "Enable WhatsApp",
    "whatsapp.phone": "WhatsApp Number",
    "whatsapp.phone_placeholder": "Ex: 5511999999999 (with country code)",
    "whatsapp.message": "Default message",
    "whatsapp.message_placeholder": "Hello! I came through the app.",
    "whatsapp.button_text": "Button text",
    "whatsapp.button_text_default": "Contact Us",
    "whatsapp.button_text_placeholder": "Ex: Contact Us",
    "whatsapp.button_color": "Button color",
    "whatsapp.position": "Button position",
    "whatsapp.position_right": "Bottom right",
    "whatsapp.position_left": "Bottom left",
    "whatsapp.show_text": "Show text on button hover",
    "whatsapp.default_message": "Hello! I came through the app and would like more information.",
    "whatsapp.icon_size": "Icon Size",
    "whatsapp.size_small": "Small",
    "whatsapp.size_medium": "Medium",
    "whatsapp.size_large": "Large",

    // Premium Overlays
    "premium.import.title": "App Import",
    "premium.import.description": "Import data from existing apps using JSON or ID",
    "premium.notifications.title": "App Notifications",
    "premium.notifications.description": "Send custom notifications within your app",
    "premium.videoCourse.title": "Video Course",
    "premium.videoCourse.description": "Add video course modules and YouTube lessons to your app",
    "premium.templates.upgrade": "Enterprise Plan →",
    "premium.templates.message": "Upgrade to access premium templates",
    "premium.plan.profissional": "Professional Plan",
    "premium.plan.empresarial": "Business Plan",
    "premium.exclusive.empresarial": "Feature exclusive to Business Plan",
    "premium.integrations.title": "Platform Integrations",
    "premium.integrations.description": "Automatically connect your sales platforms",

    // Template Descriptions
    "template.classic.description": "Clean and elegant default layout",
    "template.corporate.description": "Professional layout for businesses",
    "template.showcase.description": "Modern layout for visual emphasis",
    "template.modern.description": "Contemporary and minimalist design",
    "template.minimal.description": "Clean interface focused on content",
    "template.exclusive.description": "Premium layout with colored cards and circular images",

    // Premium Overlay CTA
    "premium.cta.arrow": "→",

    // Import Section
    "import.select.json": "Select app JSON",
    "import.select.file": "Select JSON file",
    "import.backup": "Backup",
    "import.tooltip":
      "Import data from a previously created app using JSON or app ID. Available only in Professional and Enterprise plans.",
    "import.premium.required": "App import is available only in Professional and Enterprise plans.",

    // Upload Section
    "upload.pdf.description": "Upload PDF or Audio",
    "upload.bonus.description": "Upload PDF or Audio",
    "upload.uploading": "Uploading...",
    "upload.uploaded": "Uploaded",
    "upload.allow.download": "Allow PDF download",

    // Publish Section
    "publish.ready": "Ready to publish?",
    "publish.subtitle": "Publish your app and share it with the world!",
    "publish.plan": "Plan",
    "publish.apps": "apps",
    "publish.publishing": "Publishing...",
    "publish.checking": "Checking limit...",
    "publish.republish": "Publish Again",
    "publish.button": "Publish App",
    "publish.saving": "Saving draft...",
    "publish.review.title": "Review App Before Publishing",
    "publish.review.subtitle": "Check all information before publishing your app.",
    "publish.info.title": "App Information",
    "publish.info.name": "Name:",
    "publish.info.description": "Description:",
    "publish.info.color": "Color:",
    "publish.info.link": "Custom link:",
    "publish.info.undefined": "Not defined",
    "publish.products.title": "Loaded Products",
    "publish.products.main": "Main Product:",
    "publish.products.bonus": "Bonus",
    "publish.products.loaded": "Loaded",
    "publish.products.notloaded": "Not loaded",
    "publish.products.optional": "Optional",
    "publish.visual.title": "Visual Assets",
    "publish.visual.icon": "App Icon:",
    "publish.visual.cover": "App Cover:",
    "publish.back": "Back and Edit",
    "publish.confirm": "Confirm and Publish",
    "publish.success.title": "App Successfully Published!",
    "publish.success.subtitle": "Your app is now available and can be installed as PWA.",
    "publish.success.link": "Your app link:",
    "publish.success.steps": "🎉 Next steps:",
    "publish.success.share": "Share the link with your clients",
    "publish.success.pwa": "The app can be installed as PWA",
    "publish.success.track": "Check your apps on the dashboard",
    "publish.limit.title": "App Limit Reached",
    "publish.limit.subtitle": "You have reached the limit of",
    "publish.limit.description": "To create more apps, you need to upgrade your plan.",
    "publish.limit.upgrade": "Upgrade",

    // Custom Domain Dialog
    "domain.title": "Custom Domain",
    "domain.button": "Configure custom domain",
    "domain.description": "Set up your own domain to convey more professionalism",
    "domain.step": "Step",
    "domain.of": "of",
    "domain.back": "Back",
    "domain.continue": "Continue",

    // Step 1
    "domain.step1.title": "Use a custom domain",
    "domain.step1.subtitle": "Convey professionalism with a custom domain",
    "domain.step1.own_domain": "Use your own domain",
    "domain.step1.connect": "Connect your third-party domain",
    "domain.step1.dns_info": "You need to log in to your domain provider to update your DNS records.",
    "domain.step1.no_changes": "We can't make these changes for you, but we can help with a step-by-step guide.",
    "domain.step1.view_steps": "View steps",

    // Step 2
    "domain.step2.title": "Use your own domain",
    "domain.step2.subtitle": "Do you have a domain from another provider? Connect that domain.",
    "domain.step2.placeholder": "e.g., example.com",
    "domain.step2.verifying": "Verifying domain...",
    "domain.step2.auto_available": "Automatic connection available",
    "domain.step2.manual_needed": "Valid domain - manual setup required",
    "domain.step2.invalid": "Invalid domain",
    "domain.step2.provider_detected": "Provider detected:",
    "domain.step2.auto_message": "✨ Automatic connection available via {provider}",
    "domain.step2.manual_message": "✅ Valid domain - manual setup required",
    "domain.step2.instructions": "Specific instructions will be provided for {provider}",
    "domain.step2.verifying_button": "Verifying...",

    // Step 3
    "domain.step3.title": "Connect automatically",
    "domain.step3.subtitle":
      "We detected that {domain} uses {provider}. We can connect automatically using the {provider} API.",
    "domain.step3.info_title": "Domain information:",
    "domain.step3.provider": "Provider:",
    "domain.step3.nameservers": "Nameservers:",
    "domain.step3.confidence": "Confidence:",
    "domain.step3.confidence_high": "High",
    "domain.step3.confidence_medium": "Medium",
    "domain.step3.confidence_low": "Low",
    "domain.step3.auto_connect": "Connect automatically",
    "domain.step3.connecting": "Connecting...",
    "domain.step3.manual_option": "Configure manually",

    // Step 4
    "domain.step4.title": "Access your domain provider's website",
    "domain.step4.subtitle": "On the DNS settings page, update your records following these steps.",
    "domain.step4.verified_success": "Domain verified successfully!",
    "domain.step4.verification_pending": "Verification pending",
    "domain.step4.a_record": "A Record:",
    "domain.step4.txt_record": "TXT Record:",
    "domain.step4.found": "Found",
    "domain.step4.not_found": "Not found",
    "domain.step4.add_a_record": "Add A record",
    "domain.step4.host": "Name/host:",
    "domain.step4.value": "Value/Points to:",
    "domain.step4.copy": "Copy",
    "domain.step4.copied": "Copied!",
    "domain.step4.record_added": "Record added",
    "domain.step4.mark_added": "Mark as added",
    "domain.step4.subdomain_record": "A record for subdomain",
    "domain.step4.subdomain_help": "Allows www.{domain} to work as well",
    "domain.step4.txt_title": "TXT record to verify ownership",
    "domain.step4.txt_help": "Used to verify you own the domain",
    "domain.step4.verify_records": "Verify DNS Records",
    "domain.step4.verifying": "Verifying...",
    "domain.step4.help_title": "Need help?",
    "domain.step4.help_description": "If you don't know how to add DNS records, check your provider's documentation:",
    "domain.step4.help_link": "View complete DNS guide",

    // Toast messages
    "domain.toast.verified.title": "Domain verified!",
    "domain.toast.verified.description": "Your domain was configured successfully",
    "domain.toast.pending.title": "Verification pending",
    "domain.toast.pending.description": "Configure DNS records and try again",
    "domain.toast.error.title": "Verification error",
    "domain.toast.error.description": "Could not verify the domain",

    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.close": "Close",
    "common.try_again": "Try again",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.view": "View",
    "common.download": "Download",
    "common.upload": "Upload",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.yes": "Yes",
    "common.no": "No",
    "common.continue": "Continue",
    "common.back": "Back",

    // Cancellation Dialog
    "cancellation.step1.title": "Cancel Subscription",
    "cancellation.step1.description": "We'll miss you! Help us improve by sharing your reason for canceling.",
    "cancellation.reason.label": "Reason for cancellation",
    "cancellation.reason.placeholder": "Select a reason",
    "cancellation.reason.not_using": "I won't continue with my project",
    "cancellation.reason.pause_project": "I'm taking a break, but plan to return",
    "cancellation.reason.project_finished": "It was a one-time project that's now complete",
    "cancellation.reason.too_expensive": "The price became too expensive for me",
    "cancellation.reason.not_adapted": "I couldn't adapt to the tool",
    "cancellation.reason.other": "Other",
    "cancellation.feedback.label": "Did we do something wrong? Tell us what happened so we can improve",
    "cancellation.feedback.placeholder": "Tell us more about your experience...",
    "cancellation.step2.title": "Before you go, read this...",
    "cancellation.step2.message1":
      "It's a shame you don't want to continue with MigraBook. I noticed you still have active access, right? If you need a few more days to test or some specific help, we can certainly assist you!",
    "cancellation.step2.benefits_title": "Also, by keeping your account active:",
    "cancellation.step2.benefit1": "You won't lose your history of created apps",
    "cancellation.step2.benefit2": "You'll continue receiving updates and new features",
    "cancellation.step2.benefit3": "You can come back anytime without having to set everything up again",
    "cancellation.step2.message2":
      "If you prefer, we can reach out to resolve this before you decide to cancel! What do you prefer?",
    "cancellation.step2.keep_subscription": "No, I want to stay!",
    "cancellation.step2.confirm_cancel": "Yes, cancel",
    "cancellation.step3.title": "Cancellation Scheduled",
    "cancellation.step3.access_until": "Your access remains active until:",
    "cancellation.step3.reactivate_message":
      "Changed your mind? You can reactivate your subscription anytime before the expiration date.",
    "cancellation.step3.reactivate_button": "Reactivate Subscription",

    // Privacy Policy
    "privacy.back": "Back",
    "privacy.title": "Privacy Policy — Migrabook.app",
    "privacy.last_updated": "Last updated",

    "privacy.section1.title": "1. INFORMATION WE COLLECT",
    "privacy.section1.intro":
      "We only collect information necessary for the platform to function and to ensure a good user experience. This information includes:",
    "privacy.section1.item1": "Registration data: name, email, phone number, and access password.",
    "privacy.section1.item2": "Payment and billing data, when applicable.",
    "privacy.section1.item3":
      "Technical data: IP address, browser type and version, language, device used, and access date.",
    "privacy.section1.item4": "Usage information: number of apps created, publications, and saved preferences.",
    "privacy.section1.footer":
      "This data is used securely and confidentially, with access restricted only to authorized Migrabook.app staff.",

    "privacy.section2.title": "2. HOW WE USE YOUR INFORMATION",
    "privacy.section2.intro": "The collected information is used to:",
    "privacy.section2.item1": "Create and maintain your active account on Migrabook.app;",
    "privacy.section2.item2": "Process payments and manage subscriptions;",
    "privacy.section2.item3":
      "Send transactional notifications, such as plan renewal reminders, technical support notices, and important service changes;",
    "privacy.section2.item4": "Improve the security, stability, and performance of the platform;",
    "privacy.section2.item5": "Provide support and assistance when requested.",
    "privacy.section2.footer":
      "Migrabook.app does not use your data for third-party advertising nor does it sell or exchange personal information.",

    "privacy.section3.title": "3. INFORMATION SHARING",
    "privacy.section3.intro":
      "We may share information with payment service providers, such as Stripe, PayPal, Hotmart, Kiwify, Eduzz, and similar services, exclusively to process transactions made by you. This sharing is limited, secure, and performed only when necessary for the execution of the contracted service.",
    "privacy.section3.item1":
      "We do not share your data with third parties for commercial, marketing, or advertising purposes.",
    "privacy.section3.item2":
      "Sharing occurs only with: necessary service providers, legal authorities when required by law, or with your explicit consent.",
    "privacy.section3.footer": "",

    "privacy.section4.title": "4. INFORMATION SECURITY",
    "privacy.section4.content":
      "We adopt appropriate technical and administrative measures to protect your information against unauthorized access, loss, misuse, alteration, or destruction. All data traffic is encrypted, and servers follow international security standards. Despite this, no system is 100% immune to risks, and the user is also responsible for maintaining the confidentiality of their access credentials.",

    "privacy.section5.title": "5. DATA RETENTION AND DELETION",
    "privacy.section5.intro":
      "Your data will be kept as long as your account is active. If you decide to close your account, personal information will be deleted from our systems, except when there is a legal obligation to retain records, such as fiscal and accounting records.",
    "privacy.section5.content": "You can request the deletion of your data at any time through official support.",

    "privacy.section6.title": "6. COOKIES AND BROWSING DATA",
    "privacy.section6.intro": "Migrabook.app may use cookies and similar technologies to:",
    "privacy.section6.item1": "Remember your login preferences;",
    "privacy.section6.item2": "Optimize navigation and site performance;",
    "privacy.section6.item3": "Collect aggregated information for usage analysis.",
    "privacy.section6.footer":
      "You can disable cookies in your browser settings, but this may limit some platform functionalities.",

    "privacy.section7.title": "7. USER RIGHTS",
    "privacy.section7.intro": "In accordance with the General Data Protection Law (Law No. 13.709/2018), the user can:",
    "privacy.section7.item1": "Access and correct their information;",
    "privacy.section7.item2": "Request deletion of personal data;",
    "privacy.section7.item3": "Revoke consent for data use;",
    "privacy.section7.item4": "Request information about the use and sharing of their data;",
    "privacy.section7.item5": "Request the portability of their data.",
    "privacy.section7.footer": "These requests can be made directly through the support channel: suporte@migrabook.app",

    "privacy.section8.title": "8. USER-PUBLISHED CONTENT",
    "privacy.section8.intro":
      "Migrabook.app acts only as a tool for creating and hosting applications. All content inserted, published, or shared within created apps is the sole responsibility of the user.",
    "privacy.section8.content":
      "Migrabook.app does not curate, review, or pre-validate material published by customers.",

    "privacy.section9.title": "9. CANCELLATION AND NO REFUND",
    "privacy.section9.content":
      "Plans are charged monthly or annually, according to the chosen modality. The Essential plan offers a 7-day free trial without charge. After this period, charging starts automatically unless canceled within the trial period. In case of cancellation after charging, there is no proportional refund, but the user may continue accessing the system until the end of the already paid cycle.",

    "privacy.section10.title": "10. CHANGES TO THIS POLICY",
    "privacy.section10.content":
      "This Privacy Policy may be updated at any time to reflect legal, technical, or operational changes. The last update date will always be indicated at the beginning of this document. It is recommended to review this policy periodically.",

    "privacy.section11.title": "11. CONTACT",
    "privacy.section11.content":
      "For questions, requests, or complaints about this Privacy Policy, contact us through:",
    "privacy.section11.email": "Email: suporte@migrabook.app",
    "privacy.section11.website": "Website: https://migrabook.app",

    "privacy.section12.title": "12. APPLICABLE LAW AND JURISDICTION",
    "privacy.section12.content":
      "This Policy is governed by the laws of the Federative Republic of Brazil. The jurisdiction of São Bernardo do Campo, State of São Paulo, is elected to resolve any controversies, with express waiver of any other, however privileged it may be.",

    // Terms of Service
    "terms.back": "Back",
    "terms.title": "Terms of Use — Migrabook.app",
    "terms.last_updated": "Last updated",
    "terms.intro":
      "Welcome to Migrabook.app. By accessing or using our platform, you agree to the terms and conditions described below. We recommend carefully reading this document before creating an account.",

    "terms.section1.title": "1. ABOUT MIGRABOOK.APP",
    "terms.section1.content":
      "Migrabook.app is an online platform that allows the creation and customization of applications based on PWA (Progressive Web App) technology. It is intended for digital producers, infoproducers, and entrepreneurs who wish to deliver their digital content (such as eBooks, courses, guides, and informational materials) in application format, without needing to code.",

    "terms.section2.title": "2. ACCOUNT AND ACCESS",
    "terms.section2.intro":
      "To use Migrabook.app, you must create an account with true and updated information. You are responsible for maintaining the confidentiality of your access credentials and for all activities performed under your account.",
    "terms.section2.requirement": "The use of the platform is personal and non-transferable.",

    "terms.section3.title": "3. PLANS, BILLING AND CANCELLATIONS",
    "terms.section3.intro":
      "Migrabook.app offers monthly and annual plans, with specific prices and features (Essential, Professional, and Business). Prices and conditions may be updated at any time, with prior notice in the user panel.",
    "terms.section3.cancellation.title": "3.1 Cancellation",
    "terms.section3.cancellation.content":
      "Subscription cancellation can be done at any time, directly from the user panel or by contacting support. Upon cancellation, access to created applications will be suspended at the end of the already paid cycle (monthly or annual). There is no proportional refund for unused periods.",

    "terms.section4.title": "4. CONTENT AND USER RESPONSIBILITY",
    "terms.section4.intro":
      "The user is solely responsible for all content uploaded, published, or distributed through Migrabook.app — including texts, images, videos, PDF files, and other materials.",
    "terms.section4.declaration.intro": "By using the platform, the user declares that:",
    "terms.section4.declaration.item1": "They possess the copyright or authorization to use the published content;",
    "terms.section4.declaration.item2":
      "The content does not infringe on third-party rights, trademarks, or intellectual property;",
    "terms.section4.declaration.item3":
      "The content does not contain offensive, defamatory, illegal material or that violates current laws.",
    "terms.section4.rights":
      "Migrabook.app reserves the right to suspend or delete applications that violate these conditions.",

    "terms.section5.title": "5. LIMITATION OF LIABILITY",
    "terms.section5.intro": "Migrabook.app acts exclusively as a tool for creating and hosting applications.",
    "terms.section5.not_responsible.intro": "We are not responsible for:",
    "terms.section5.not_responsible.item1": "Disputes between the user and their end customers;",
    "terms.section5.not_responsible.item2":
      "Refunds, account blocks, or failures in external payment platforms (such as Hotmart, Kiwify, Eduzz, Stripe, PayPal, or similar);",
    "terms.section5.not_responsible.item3": "Problems caused by content inserted by the user;",
    "terms.section5.not_responsible.item4":
      "Any indirect damages, lost profits, or losses resulting from incorrect use of the platform.",

    "terms.section6.title": "6. AVAILABILITY AND UPDATES",
    "terms.section6.content":
      "The platform may undergo continuous updates and improvements. We are committed to keeping the service available, except in cases of scheduled maintenance, force majeure, or external factors beyond our control.",

    "terms.section7.title": "7. CANCELLATION OR SUSPENSION BY MIGRABOOK.APP",
    "terms.section7.intro": "We may suspend or terminate user access in cases of:",
    "terms.section7.item1": "Violation of the Terms of Use;",
    "terms.section7.item2": "Fraudulent practices or misuse of the platform;",
    "terms.section7.item3": "Recurring payment delays;",
    "terms.section7.item4": "Use that may compromise the security or stability of the system.",

    "terms.section8.title": "8. INTELLECTUAL PROPERTY",
    "terms.section8.content":
      "All design, code, structure, and technology of Migrabook.app belong exclusively to D. Piola dos Santos Negócios Digitais LTDA. It is prohibited to copy, modify, redistribute, or create derivative services from the platform without express authorization. Applications created by users remain their ownership, respecting rights to inserted content.",

    "terms.section9.title": "9. SUPPORT AND COMMUNICATION",
    "terms.section9.content":
      "Support is offered by email and, in eligible plans, via WhatsApp. Official service channels are informed within the user panel.",

    "terms.section10.title": "10. CHANGES TO THE TERMS",
    "terms.section10.content":
      "Migrabook.app may update these Terms of Use periodically. Relevant changes will be communicated to users by email or notice within the platform. Continued use after the update implies acceptance of the new conditions.",

    "terms.section11.title": "11. APPLICABLE LAW AND JURISDICTION",
    "terms.section11.content":
      "This contract is governed by the laws of the Federative Republic of Brazil. The jurisdiction of São Bernardo do Campo, State of São Paulo, is elected to resolve any controversies, with waiver of any other, however privileged it may be.",

    "terms.section12.title": "12. CONTACT",
    "terms.section12.intro": "For questions about these Terms of Use, contact us by email:",
    "terms.section12.email": "📩 suporte@migrabook.app",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.all": "All",

    // Validation
    "validation.email.invalid": "Invalid email",
    "validation.password.min": "Password must be at least 6 characters",
    "validation.required": "This field is required",
    "validation.file.too_big": "File too large",
    "validation.image.too_big": "Image must be maximum 10MB",
    "validation.pdf.too_big": "PDF or MP3 must be maximum 100MB",
    "validation.file.invalid_type": "Unsupported file type. Use PDF, MP3, or PNG/JPG images.",
    "validation.file.generic": "File validation error",

    // Status Messages
    "status.checking_permissions": "Checking permissions...",
    "status.loading_data": "Loading data...",
    "status.saving": "Saving...",
    "status.uploading": "Uploading...",

    // Auth Form
    "auth.full_name": "Full Name",
    "auth.full_name.placeholder": "Your full name",
    "auth.email": "Email",
    "auth.email.placeholder": "your@email.com",
    "auth.phone": "Phone",
    "auth.phone.placeholder": "Enter your phone",
    "auth.password": "Password",
    "auth.password.placeholder": "••••••••",
    "auth.login.title": "Sign in to your account",
    "auth.login.subtitle": "Enter to access your apps",
    "auth.signup.title": "Create your account",
    "auth.signup.subtitle": "Start creating your apps now",
    "auth.login.button": "Sign In",
    "auth.signup.button": "Create Account",
    "auth.login.loading": "Signing in...",
    "auth.signup.loading": "Creating account...",
    "auth.app.subtitle": "Convert your ebook to app in minutes",
    "auth.terms.text": "By creating an account, you agree to our",
    "auth.terms.link": "Terms of Use",
    "auth.terms.and": "and",
    "auth.privacy.link": "Privacy Policy",
    "auth.forgot_password": "Forgot your password?",
    "auth.forgot_password.title": "Recover Password",
    "auth.forgot_password.description": "Enter your email to receive a password recovery link",
    "auth.forgot_password.email.placeholder": "Enter your email",
    "auth.forgot_password.send": "Send Link",
    "auth.forgot_password.sending": "Sending...",
    "auth.forgot_password.success.title": "Email sent!",
    "auth.forgot_password.success.description": "Check your inbox to recover your password",
    "auth.forgot_password.error.title": "Error sending email",
    "auth.forgot_password.error.description": "Could not send email. Please try again.",
    "auth.no_account": "Don't have an account?",
    "auth.create_account": "Subscribe to a Plan.",

    // Pricing Page
    "pricing.title": "Plans & Pricing",
    "pricing.subtitle": "Select a plan to continue.",
    "pricing.free_trial_button": "Free trial for 7 days",
    "pricing.billing.monthly": "Monthly",
    "pricing.billing.annual": "Annual",
    "pricing.billing.save": "2 months free",
    "pricing.billing.year": "year",
    "pricing.billing.month": "month",
    "pricing.billing.equivalent": "Equivalent to",
    "pricing.popular": "Recommended",
    "pricing.plan.essencial": "Essential",
    "pricing.plan.essencial.name": "Essential",
    "pricing.plan.profissional": "Professional",
    "pricing.plan.profissional.name": "Professional",
    "pricing.plan.empresarial": "Business",
    "pricing.plan.empresarial.name": "Business",
    "pricing.plan.essencial.apps": "1 application",
    "pricing.plan.profissional.apps": "3 applications",
    "pricing.plan.empresarial.apps": "6 applications",
    "pricing.plan.essencial.badge": "7 days free",
    "pricing.plan.essencial.description": "1 Application",
    "pricing.plan.profissional.description": "3 Applications",
    "pricing.plan.empresarial.description": "6 Applications",
    "pricing.plan.essencial.pdfs": "Unlimited PDFs",
    "pricing.plan.profissional.pdfs": "Unlimited PDFs",
    "pricing.plan.empresarial.pdfs": "Unlimited PDFs",
    "pricing.features.customization": "App customization",
    "pricing.features.email_support": "Email support",
    "pricing.features.whatsapp_support": "Support via WhatsApp",
    "pricing.features.import_apps": "Import existing apps",
    "pricing.features.app_import": "App import",
    "pricing.features.video_player": "Integrated video player",
    "pricing.features.custom_domain": "Custom domain",
    "pricing.features.premium_templates": "Premium templates",
    "pricing.features.multi_language": "Multi-language interface",
    "pricing.features.multilingual": "Multi-language interface",
    "pricing.features.integrations": "Platform integrations",
    "pricing.features.platform_integrations": "Platform integrations",
    "pricing.features.realtime_updates": "Real-time updates",
    "pricing.features.real_time_updates": "Real-time updates",
    "pricing.features.unlimited_users": "Unlimited users",
    "pricing.features.push_notifications": "Push notifications",
    "pricing.features.internal_chat": "Internal chat",
    "pricing.features.convert_ebook": "Convert eBook to app in 3 minutes",
    "pricing.features.one_click_access": "Customer accesses with 1 click (no login)",
    "pricing.features.multiplatform": "Works on Android, iOS and Web",
    "pricing.features.update_content": "Update content without resending anything",
    "pricing.features.whatsapp_integrated": "WhatsApp integrated in app",
    "pricing.features.push_engage": "Push notifications to engage",
    "pricing.features.payment_integrations": "Integration with payment platforms",
    "pricing.features.everything_professional": "Everything in Professional +",
    "pricing.features.integrated_videos": "Videos integrated in app (via link)",
    "pricing.features.upsell_bump": "Upsell and Order Bump in app",
    "pricing.features.premium_visual": "Premium visual with exclusive templates",
    "pricing.features.custom_domain_brand": "Custom domain (your brand)",
    "pricing.subscribe": "Subscribe",
    "pricing.equivalent": "Equivalent to",
    "pricing.per_month": "/month",
    "pricing.per_year": "/year",
    "pricing.back_to_app": "Back to App",
    "pricing.logout": "Logout",
    "pricing.start_now": "Start Now",
    "pricing.cancel_anytime": "Cancel anytime",
    "pricing.loading": "Loading...",
    "pricing.error.session": "Session expired. Please log in again.",
    "pricing.error.checkout": "Error creating checkout. Please try again.",
    "checkout.title": "Enter your payment details",
    "checkout.subtitle.line1": "We accept Visa and Mastercard.",
    "checkout.subtitle.line2": "Free trial for 7 days. No charge today.",
    "checkout.subtitle.line3.monthly": "After 7 days, you will be charged R${price} per month.",
    "checkout.subtitle.line3.annual": "After 7 days, you will be charged R${price} per year.",
    "checkout.subtitle": "You're one step away from turning your eBooks into professional apps",
    "checkout.plan.title": "Plan",
    "checkout.price.annual": "/year",
    "checkout.price.monthly": "/month",
    "checkout.price.equivalent": "Equivalent to",
    "checkout.benefits.title": "What's included:",
    "checkout.total.annual": "Annual Total",
    "checkout.total.monthly": "Monthly Total",
    "checkout.processing": "Processing...",
    "checkout.subscribe.button": "Start free trial",
    "checkout.back.button": "Back to Plans",
    "checkout.back.short": "Back",
    "checkout.error.title": "Processing error",
    "checkout.error.description": "Could not start checkout. Please try again.",

    // Payment Success Page
    "payment_success.title": "Payment Approved!",
    "payment_success.subtitle": "Your subscription has been activated successfully",
    "payment_success.plan_title": "Plan {plan}",
    "payment_success.benefits_title": "Your plan benefits:",
    "payment_success.next_billing": "Next billing",
    "payment_success.app_limit": "App limit",
    "payment_success.apps": "applications",
    "payment_success.billing_cycle": "Billing cycle:",
    "payment_success.monthly": "Monthly",
    "payment_success.yearly": "Annual",
    "payment_success.amount": "Amount:",
    "payment_success.processing_title": "Processing your subscription...",
    "payment_success.processing_subtitle":
      "Your subscription is being activated. Details will appear here in a few minutes.",
    "payment_success.access_app": "Access MigraBook",
    "payment_success.view_plans": "View Other Plans",
    "payment_success.email_confirmation": "A confirmation email was sent to {email}",
    "payment_success.manage_subscription": "You can manage your subscription anytime in the user panel",

    // Inactive Account Page
    "inactive.title": "Inactive Account",
    "inactive.subtitle": "Your account has been deactivated",
    "inactive.default_message": "Your account has been deactivated. Contact support for more information.",
    "inactive.reactivate_button": "Subscribe to Reactivate Account",
    "inactive.logout_button": "Sign Out",

    // CustomizationPanel
    "custom.icon.background": "Transparent background recommended",
    "custom.cover.background": "App background image",
    "custom.thumbnail.title": "PWA thumbnail upload",
    "custom.thumbnail.help": "Click the icon to upload PWA thumbnail (PNG/JPG 512x512)",

    // UploadSection
    "upload.error.generic": "Upload error",
    "upload.retry.ready.title": "Ready to retry",
    "upload.retry.ready.description": "Select the file again to retry the upload.",
    "upload.app.notfound.title": "App not found",
    "upload.app.notfound.description": "Check if the ID is correct.",
    "upload.access.denied.title": "Access denied",
    "upload.access.denied.description": "You can only import your own apps.",
    "upload.default.appname": "My App",
    "upload.default.description": "App Description",

    // CreditCardForm - Validaciones
    "payment.validation.card.min": "El número de tarjeta debe tener 16 dígitos",
    "payment.validation.card.max": "Número de tarjeta inválido",
    "payment.validation.card.regex": "Solo se permiten números",
    "payment.validation.name.min": "El nombre del titular es obligatorio",
    "payment.validation.name.regex": "El nombre debe contener solo letras",
    "payment.validation.month.required": "El mes es obligatorio",
    "payment.validation.year.required": "El año es obligatorio",
    "payment.validation.cvv.min": "CVV debe tener 3 o 4 dígitos",
    "payment.validation.cvv.max": "CVV debe tener 3 o 4 dígitos",
    "payment.validation.cvv.regex": "CVV debe contener solo números",
    "payment.validation.email.invalid": "Email inválido",
    "payment.validation.phone.invalid": "Teléfono inválido",
    "payment.validation.zipcode.min": "Código postal inválido",
    "payment.validation.zipcode.max": "Código postal inválido",
    "payment.validation.address.required": "La dirección es obligatoria",
    "payment.validation.number.required": "El número es obligatorio",
    "payment.validation.neighborhood.required": "El barrio es obligatorio",
    "payment.validation.city.required": "La ciudad es obligatoria",
    "payment.validation.state.required": "El estado es obligatorio",

    // CreditCardForm - Labels y marcadores de posición
    "payment.card.name.label": "Nombre en la Tarjeta",
    "payment.card.name.placeholder.alt": "Juan Silva",

    // CreditCardForm - Estados brasileños (mantener nombres en portugués)
    "state.ac": "Acre",
    "state.al": "Alagoas",
    // ... (copie todos los estados del PT)

    // CreditCardForm - Notificaciones
    "payment.toast.auth.error.title": "Error de Autenticación",
    "payment.toast.auth.error.description": "Debe iniciar sesión para suscribirse a un plan.",
    "payment.toast.redirect.description": "Será redirigido a Stripe para completar el pago.",

    // Header
    "header.logout.error.title": "Error",
    "header.logout.error.description": "Could not log out",
    "header.logout.success.title": "Logged out",
    "header.logout.success.description": "You have been successfully disconnected",
    "header.language": "Language",
    "header.language.pt": "Português",
    "header.language.en": "English",
    "header.language.es": "Español",
    "header.menu": "MENU",
    "header.theme": "Theme",
    "header.profile": "Profile",
    "header.reset": "Reset",
    "header.logout.button": "Logout",
    "header.notifications": "Notifications",

    // Header Notifications Dropdown
    "header.notifications.dropdown_title": "Notifications",
    "header.notifications.mark_all_read": "Mark all as read",
    "header.notifications.empty": "No notifications at the moment",
    "header.notifications.open_link": "Open link",

    // Admin Notifications
    "admin.notifications.tab": "Notifications",
    "admin.notifications.title": "Manage Notifications",
    "admin.notifications.add": "New Notification",
    "admin.notifications.edit": "Edit Notification",
    "admin.notifications.fetch_error": "Error loading notifications",
    "admin.notifications.validation_error": "Fill in title and message",
    "admin.notifications.create_success": "Notification created successfully",
    "admin.notifications.update_success": "Notification updated successfully",
    "admin.notifications.save_error": "Error saving notification",
    "admin.notifications.delete_confirm": "Are you sure you want to delete this notification?",
    "admin.notifications.delete_success": "Notification deleted successfully",
    "admin.notifications.delete_error": "Error deleting notification",
    "admin.notifications.toggle_error": "Error changing status",
    "admin.notifications.loading": "Loading notifications...",
    "admin.notifications.empty": "No notifications registered",
    "admin.notifications.form.title": "Title",
    "admin.notifications.form.title_placeholder": "Enter notification title",
    "admin.notifications.form.message": "Message",
    "admin.notifications.form.message_placeholder": "Enter notification message",
    "admin.notifications.form.link": "Link (optional)",
    "admin.notifications.form.active": "Notification active",
    "admin.notifications.form.cancel": "Cancel",
    "admin.notifications.form.save": "Save",
    "admin.notifications.table.title": "Title",
    "admin.notifications.table.message": "Message",
    "admin.notifications.table.status": "Status",
    "admin.notifications.table.date": "Date",
    "admin.notifications.table.actions": "Actions",
    "admin.notifications.status.active": "Active",
    "admin.notifications.status.inactive": "Inactive",

    // AuthGuard
    "authguard.no_permission": "You do not have permission to access this content.",

    // === PRICING PAGE (additional keys) ===
    "pricing.current_plan": "Current Plan",
    "pricing.max_plan": "Maximum Plan",
    "pricing.unavailable": "Plan Unavailable",
    "pricing.unavailable_short": "Unavailable",

    // === PROFILE DIALOG ===
    "profile.title": "User Profile",
    "profile.subtitle": "Manage your personal information and published apps",
    "profile.personal_info": "Personal Information",
    "profile.email": "Email",
    "profile.name": "Name",
    "profile.phone": "Phone",
    "profile.my_subscription": "My Subscription",
    "profile.plan": "Plan",
    "profile.free": "Free",
    "profile.active": "Active",
    "profile.my_apps": "My Published Apps",
    "profile.refresh": "Refresh",
    "profile.published": "Published",
    "profile.created_at": "Created on",
    "profile.updated_at": "Updated on",
    "profile.edit": "Edit",
    "profile.view_app": "View App",
    "profile.no_apps": "No apps published yet",
    "profile.no_apps_message": "Your published apps will appear here",
    "profile.danger_zone": "Danger Zone",
    "profile.delete_warning": "Deleting your account permanently removes all your data. This action cannot be undone.",
    "profile.deleting": "Deleting...",
    "profile.delete_account": "Delete Account",
    "profile.delete_app_title": "Delete App",
    "profile.delete_app_message": "Are you sure you want to delete the app",
    "profile.delete": "Delete",
    "profile.saving": "Saving...",
    "profile.save": "Save",
    "profile.max_plan_message": "You have the most advanced plan available",
    "profile.max_plan_badge": "Maximum Plan",
    "profile.downgrade_question": "Want to downgrade your plan?",
    "profile.contact_support": "Contact Support",
    "profile.upgrade_to_business": "Upgrade to Business plan",
    "profile.upgrade_message": "Upgrade to get more features",
    "profile.upgrade_button": "Upgrade",
    "profile.manage_subscription": "Manage Subscription",
    "profile.cancel_anytime": "Cancel your subscription anytime",
    "profile.cancel_subscription": "Cancel Subscription",
    "profile.manual_plan_title": "Plan set by administrator",
    "profile.manual_plan_message": "Your plan was activated manually. For changes or cancellation, contact support.",

    // === TOAST MESSAGES - PROFILE ===
    "toast.profile.app_loaded": "App loaded",
    "toast.profile.app_loaded_description": "The app was loaded in the builder for editing",
    "toast.profile.error": "Error",
    "toast.profile.error_loading_app": "Could not load app data",
    "toast.profile.error_internal": "Internal error loading app",
    "toast.profile.updated": "Profile updated",
    "toast.profile.updated_description": "Your information was saved successfully",
    "toast.profile.update_error": "Could not update profile",
    "toast.profile.subscription_canceled": "Subscription canceled",
    "toast.profile.subscription_canceled_description":
      "Your subscription was canceled and you will keep access until the end of the paid period",
    "toast.profile.cancel_error": "Error canceling subscription",
    "toast.profile.subscription_reactivated": "Subscription reactivated!",
    "toast.profile.subscription_reactivated_description": "Your subscription was successfully reactivated.",
    "toast.profile.reactivate_error": "Error reactivating subscription",
    "toast.profile.account_deleted": "Account deleted",
    "toast.profile.account_deleted_description": "Your account was deleted successfully",
    "toast.profile.delete_error": "Error deleting account",
    "toast.profile.app_deleted": "App deleted",
    "toast.profile.app_deleted_description": "The app was successfully deleted.",
    "toast.profile.delete_app_error": "Error deleting the app.",

    // === ERRORS ===

    "error.session_expired": "Session expired. Please log in again.",
    "error.server_communication": "Error communicating with server",
    "error.cancel_subscription_failed": "Failed to cancel subscription",
    "error.delete_account_failed": "Failed to delete account",

    // === PROFILE - RENEWAL & SUBSCRIPTION ===
    "profile.renew_subscription": "Renew your subscription",
    "profile.renew_subscription_message": "Regain access to premium features",
    "profile.renew_button": "Renew",
    "profile.cancel_subscription_title": "Cancel Subscription",
    "profile.cancel_subscription_description":
      "Do you want to cancel your subscription? You will no longer be charged and will lose access after the current period.",
    "profile.attention": "Attention",
    "profile.cancel_subscription_warning":
      "You will maintain access to premium features until the end of the already paid period",
    "profile.keep_subscription": "Keep Subscription",
    "profile.canceling": "Canceling...",
    "profile.confirm_cancel_subscription": "Yes, Cancel Subscription",
    "profile.active_subscription_detected": "Active Subscription Detected",
    "profile.must_cancel_first": "Your subscription is still active. You must cancel it before deleting your account",
    "profile.what_will_happen": "What will happen",
    "profile.subscription_auto_cancel": "Your subscription will be automatically canceled on Stripe",
    "profile.data_permanent_delete": "All your data will be permanently deleted",
    "profile.action_irreversible": "This action cannot be undone",
    "profile.only_cancel_subscription": "Only Cancel Subscription",
    "profile.cancel_and_delete": "Cancel Subscription and Delete Account",
    "profile.confirm_delete_title": "Confirm Account Deletion",
    "profile.confirm_delete_message": "You are about to permanently delete your account.",
    "profile.all_apps_deleted": "All your apps will be deleted",
    "profile.confirm_delete_account": "Yes, Delete My Account",

    // === INDEX PAGE ===
    "index.app_loaded_success": "App loaded successfully",
    "index.app_loaded_description": "The app '{appName}' was loaded for editing",

    // === DEACTIVATED APP ===
    "deactivated.banner": "This app has been temporarily deactivated - Contact your app support",
    "deactivated.title": "App Temporarily Unavailable",
    "deactivated.message": "The app '{appName}' is temporarily deactivated.",
    "deactivated.contact": "Contact support for more information.",

    // === NOTIFICATIONS ===
    "notifications.title": "In-App Notifications",
    "notifications.description": "Send personalized notifications and alerts to your users",
    "notifications.enable": "Enable Notifications",
    "notifications.notification_title": "Notification Title",
    "notifications.title_placeholder": "Enter notification title...",
    "notifications.message": "Notification Message",
    "notifications.message_placeholder": "Enter notification message...",
    "notifications.image": "Notification Image (optional)",
    "notifications.upload_click": "Click to upload",
    "notifications.image_loaded": "✓ Image loaded",
    "notifications.image_help": "The image will be automatically adjusted in the popup",
    "notifications.link": "Action Link (optional)",
    "notifications.button_text": "Button Text",
    "notifications.button_text_placeholder": "Access Offer",
    "notifications.button_color": "Action Button Color",
    "notifications.icon": "Notification Icon",
    "notifications.choose_icon": "Choose an icon",
    "notifications.icon.gift": "Gift",
    "notifications.icon.bell": "Bell",
    "notifications.icon.star": "Star",
    "notifications.icon.sparkles": "Sparkles",
    "notifications.icon.zap": "Lightning",
    "notifications.icon.trophy": "Trophy",
    "notifications.icon.heart": "Heart",
    "notifications.icon.award": "Award",
    "notifications.click_help": "Click the chosen icon in the app to open the notification",
    "notifications.new_notification": "New notification",

    // === ADMIN DASHBOARD ===
    "admin.logout.error": "Error logging out",
    "admin.logout.success": "Logout successful",
    "admin.exit": "Exit",
    "admin.students.mobile": "Students",
    "admin.apps.mobile": "Apps",
    "admin.settings.mobile": "Config",
    "admin.integrations.mobile": "Integr",
    "admin.whatsapp.full": "WhatsApp",
    "admin.whatsapp.mobile": "WA",
    "admin.videos.full": "Videos",
    "admin.videos.mobile": "Videos",

    // Tutorial Videos Panel
    "videos.error.load": "Error loading videos",
    "videos.success.update": "Video updated successfully!",
    "videos.success.create": "Video created successfully!",
    "videos.error.save": "Error saving video",
    "videos.confirm.delete": "Are you sure you want to delete this video?",
    "videos.success.delete": "Video deleted successfully!",
    "videos.error.delete": "Error deleting video",
    "videos.title": "Tutorial Videos",
    "videos.subtitle": "Manage platform tutorial videos",
    "videos.button.new": "New Video",
    "videos.table.title": "Title",
    "videos.table.category": "Category",
    "videos.table.slug": "Slug",
    "videos.table.status": "Status",
    "videos.table.actions": "Actions",
    "videos.status.active": "Active",
    "videos.status.inactive": "Inactive",
    "videos.dialog.edit": "Edit Video",
    "videos.dialog.new": "New Video",
    "videos.dialog.description": "Fill in the tutorial video details",
    "videos.form.title": "Title",
    "videos.form.description": "Description",
    "videos.form.url": "YouTube URL or ID",
    "videos.form.url.placeholder": "dQw4w9WgXcQ or https://youtube.com/watch?v=...",
    "videos.form.category": "Category",
    "videos.form.category.placeholder": "braip, kiwify, hotmart...",
    "videos.form.slug": "Slug (unique identifier)",
    "videos.form.slug.placeholder": "tutorial-braip",
    "videos.form.active": "Active",
    "videos.button.cancel": "Cancel",
    "videos.button.saving": "Saving...",
    "videos.button.save": "Save",

    // === STUDENTS PANEL ===
    "students.plan_updated": "Plan updated",
    "students.plan_updated_description": "User plan changed to {planName} successfully",
    "students.current_plan": "Current plan",
    "students.status_updated": "Status updated",
    "students.status_updated_description": "User status changed to {status}",
    "students.activated": "activated",
    "students.deactivated": "deactivated",
    "students.error": "Error",
    "students.error_update_status": "Error updating user status",
    "students.free": "Free",
    "students.stripe_warning_title": "Stripe validation required",
    "students.stripe_warning_description": "User subscription must be managed through Stripe",
    "students.error_update_plan": "Error updating plan",
    "students.error_delete_user": "Error deleting user",
    "students.user_deleted": "User deleted",
    "students.user_deleted_description": "User {email} was successfully deleted",
    "students.error_delete": "Error deleting user: {error}",
    "students.details_title": "User Details",
    "students.details_subtitle": "Complete information about the user",
    "students.client_data": "Client Data",
    "students.full_name": "Full Name",
    "students.not_informed": "Not informed",
    "students.email": "Email",
    "students.phone": "Phone",
    "students.registration_date": "Registration Date",
    "students.contracted_plan": "Contracted Plan",
    "students.apps": "apps",
    "students.published_apps": "Published Apps",
    "students.last_renewal_date": "Last Renewal",
    "students.app_history": "App History",
    "students.published": "Published",
    "students.draft": "Draft",
    "students.publication_date": "Publication Date",
    "students.last_edit": "Last Edit",
    "students.no_apps_found": "No apps found",
    "students.view_app": "View app",
    "students.filter_by_status": "Filter by status",
    "students.no_phone": "No phone",
    "students.stripe": "Stripe",
    "students.manual": "Manual",
    "students.active": "Active",
    "students.inactive": "Inactive",
    "students.confirm_delete": "Confirm deletion",
    "students.confirm_delete_message": "Are you sure you want to delete user {email}? This action cannot be undone.",
    "students.cancel": "Cancel",
    "students.deleting": "Deleting...",
    "students.delete": "Delete",
    "students.no_users_found": "No users found",
    "students.showing": "Showing",
    "students.of": "of",
    "students.users": "users",
    "students.previous": "Previous",
    "students.next": "Next",
    "students.subscription_active": "Active Subscription",
    "students.subscription_trialing": "Trial Period",
    "students.subscription_past_due": "Payment Past Due",
    "students.subscription_unpaid": "Unpaid",
    "students.subscription_canceled": "Canceled",
    "students.subscription_incomplete": "Incomplete",
    "students.subscription_paused": "Paused",
    "students.subscription_unknown": "Unknown",
    "students.subscription_canceling": "Canceling at period end",
    "students.filter_by_stripe": "Filter by Stripe",
    "students.stripe_all": "All (Stripe)",
    "students.stripe_active": "Active Subscription",
    "students.stripe_trialing": "Trial Period",
    "students.stripe_past_due": "Payment Past Due",
    "students.stripe_canceled": "Canceled",
    "students.stripe_unpaid": "Unpaid",
    "students.stripe_none": "No Stripe",

    // Settings Sidebar
    "sidebar.customization.title": "App Customization",
    "sidebar.customization.description": "Configure the appearance and behavior of your application",
    "sidebar.domain.title": "Custom Domain",
    "sidebar.domain.description": "Set up a custom domain for your application",
    "sidebar.domain.why.title":
      "Click the button below to request the setup. Our team will take care of everything for you.",
    "sidebar.domain.why.professionalism": "Greater professionalism",
    "sidebar.domain.why.branding": "Custom branding",
    "sidebar.domain.why.trust": "Better user trust",
    "sidebar.domain.why.seo": "Optimized SEO",
    "sidebar.domain.configure": "Configure my Domain",
    "sidebar.notification.title": "App Notifications",
    "sidebar.notification.description": "Configure notifications and alerts for your users",
    "sidebar.integrations.title": "Integrations",
    "sidebar.integrations.description": "Connect products from external platforms with your apps",
    "sidebar.tooltip.customization": "App Customization",
    "sidebar.tooltip.domain": "Custom Domain",
    "sidebar.tooltip.notification": "In-App Notification",
    "sidebar.tooltip.integrations": "Platform Integrations",
    "sidebar.import.title": "Import Existing App",
    "sidebar.import.description": "Import data from a previously created app using JSON or app ID",
    "sidebar.tooltip.import": "Import App",
    "sidebar.whatsapp.title": "WhatsApp Support",
    "sidebar.whatsapp.description": "Configure the floating WhatsApp button for customer support on your published app",
    "sidebar.tooltip.whatsapp": "WhatsApp Support",

    // Auth Dialog Validations
    "auth.validation.name_required": "Full name is required",
    "auth.validation.phone_required": "Phone is required",
    "auth.signup.success.title": "✅ Account created!",
    "auth.signup.success.description": "Check your email to confirm your account.",
    "auth.resend.error.title": "Error resending email",
    "auth.unconfirmed.title": "Email not confirmed",
    "auth.unconfirmed.description":
      "We've resent a confirmation email. Please check your inbox and confirm your account before logging in.",
    "auth.login.success": "Login successful!",
    "auth.error.title": "Authentication error",

    // Auth Verification Dialog
    "auth.verification.invalid_code": "Invalid code",
    "auth.verification.code_length": "Code must be 5 digits long",
    "auth.verification.success": "✅ Account activated successfully!",
    "auth.verification.redirecting": "You will be redirected to choose your plan.",
    "auth.verification.login_manually": "An error occurred during automatic login. Please log in manually.",
    "auth.verification.error": "Verification Error",
    "auth.verification.invalid_or_expired": "Invalid or expired code",
    "auth.verification.try_again": "Error verifying code. Please try again.",
    "auth.verification.title": "Verify Account",
    "auth.verification.sent_to": "We sent a verification code to",
    "auth.verification.expires": "(Code expires in 30 minutes)",
    "auth.verification.code_label": "Verification Code",
    "auth.verification.code_hint": "Enter the 5-digit code we sent to your email",
    "auth.verification.verifying": "Verifying...",
    "auth.verification.verify_button": "Verify and Activate Account",
    "auth.verification.not_received": "Didn't receive the code? Check your spam folder or wait a few moments.",
    "auth.verification.code_still_valid": "You already have a valid verification code. Please check your email.",
    "auth.verification.sending_new_code": "Your previous code has expired. Sending a new code...",
    "auth.verification.resend_error": "Error resending verification code.",

    // CreditCardForm - ENGLISH
    "payment.finalize.title": "Complete Subscription",
    "payment.plan": "Plan",
    "payment.values.vary": "* Values may vary according to the selected billing cycle",
    "payment.billing.cycle.title": "Billing Cycle",
    "payment.choose.cycle": "Choose your payment cycle",
    "payment.annual": "Annual",
    "payment.annual.price": "Annual - R${price} (2 months free)",
    "payment.charged.annually": "Charged annually",
    "payment.card.data.title": "Card Data",
    "payment.card.number.placeholder": "0000 0000 0000 0000",
    "payment.card.name.placeholder": "As shown on card",
    "payment.expiry.month": "Month",
    "payment.expiry.year": "Year",
    "payment.cvv": "CVV",
    "payment.cvv.placeholder": "123",
    "payment.billing.data.title": "Billing Information",
    "payment.email": "Email",
    "payment.phone": "Phone",
    "payment.phone.placeholder": "(11) 99999-9999",
    "payment.zipcode": "ZIP Code",
    "payment.zipcode.placeholder": "00000-000",
    "payment.address": "Address",
    "payment.number": "Number",
    "payment.number.placeholder": "123",
    "payment.complement": "Complement",
    "payment.neighborhood": "Neighborhood",
    "payment.city": "City",
    "payment.city.placeholder": "São Paulo",
    "payment.state": "State",
    "payment.security.info": "Your information is secure",
    "payment.security.description": "We use cutting-edge encryption to protect your data",
    "payment.finalize.button": "Complete Payment",
    "payment.cancel.button": "Cancel",
    "payment.processing": "Processing payment...",

    // CustomDomainDialog - ENGLISH
    "domain.dialog.title": "Custom Domain",
    "domain.intro": "Set up your custom domain and have your own web identity!",
    "domain.team.help":
      "Our technical team will take care of the entire setup for you. It's fast, secure, and hassle-free.",
    "domain.step.1.description": "Tell us which domain you want to use (example: mydomain.com)",
    "domain.step.2.title": "Access credentials",
    "domain.step.2.description":
      "Share the login and password for the platform where the domain was registered (example: GoDaddy, HostGator, Registro.br, etc.)",
    "domain.step.3.title": "Manual configuration (optional)",
    "domain.step.3.description":
      "If you prefer not to send access credentials, you can change the DNS yourself following our instructions. We'll send you the correct addresses to point manually.",
    "domain.guarantee.title": "Complete setup by our team",
    "domain.guarantee.description":
      "As soon as we receive the information, we'll do all the configuration and you'll be notified when it's active.",
    "domain.learn.more": "Learn more about custom domains",
    "domain.whatsapp.not.configured": "WhatsApp not configured. Contact support.",
    "domain.whatsapp.start": "Configure My Domain",

    // IntegrationsPanel - Toasts and validations
    "integrations.toast.load.error.title": "Error loading integrations",
    "integrations.toast.attention.title": "Attention",
    "integrations.toast.invalid.stripe.key": "Invalid Stripe key (must start with sk_live_ or sk_test_)",
    "integrations.toast.invalid.hottok": "Please provide HOTTOK for webhook validation",
    "integrations.toast.invalid.postback": "Please provide Postback Key for webhook validation",
    "integrations.toast.invalid.link": "The app link is in invalid format",
    "integrations.toast.product.invalid": "❌ Invalid product",
    "integrations.toast.updated.title": "✅ Integration updated!",
    "integrations.toast.saved.title": "✅ Integration saved!",
    "integrations.delete.confirm": "Are you sure you want to delete this integration?",

    // IntegrationsPanel - Custom messages
    "integrations.message.custom": "Hello! I would like to access the application.",
    "integrations.thumbnail.alt.bonus": "Bonus Thumbnail",

    // TemplateBuilder
    "template.description.placeholder": "Describe the characteristics and style of your template",
    "template.header.style.title": "Header Style",
    "template.content.layout.title": "Content Layout",
    "template.button.style.title": "Button Style",
    "template.card.style.title": "Card Style",
    "template.spacing.title": "General Spacing",
    "template.typography.title": "Typography Style",

    // Admin Role Manager
    "admin.role.access_confirmed": "Access confirmed",
    "admin.role.access_denied": "Access denied",
    "admin.role.has_privileges": "You have administrator privileges",
    "admin.role.no_privileges": "You don't have administrator privileges",
    "admin.role.error_check": "Error checking admin status",
    "admin.role.restricted_access": "Restricted Access",
    "admin.role.restricted_message": "You don't have administrator privileges to access this page",
    "admin.role.admin_status": "Administrator Status",
    "admin.role.check_status": "Check Admin Status",
    "admin.role.access_confirmed_message": "Administrator access confirmed successfully",

    // Apps Management Panel
    "apps.table.name": "Name",
    "apps.table.user": "User",
    "apps.table.plan": "Plan",
    "apps.table.status": "Status",
    "apps.table.created_at": "Created at",
    "apps.table.actions": "Actions",
    "apps.status.published": "Published",
    "apps.status.draft": "Draft",
    "apps.manage_title": "Manage Apps",
    "apps.manage_subtitle": "View and manage all platform apps",
    "apps.search_placeholder": "Search by name, email or ID...",
    "apps.filter_by_user": "Filter by user",
    "apps.all_users": "All users",
    "apps.delete_button": "Delete",
    "apps.delete_confirm_title": "Confirm deletion",
    "apps.delete_confirm_desc": 'Are you sure you want to delete "{appName}"? This action cannot be undone.',
    "apps.deleting": "Deleting...",
    "apps.not_found": "No apps found",
    "apps.load_error": "Error loading apps",
    "apps.deleted": "App deleted",
    "apps.deleted_desc": "App was successfully deleted",
    "apps.delete_error": "Error deleting app",
    "apps.copied": "Copied!",
    "apps.id_copied": "ID copied to clipboard",

    // Integrations Panel
    "integrations.url_copied": "URL copied!",

    // WhatsApp Settings
    "whatsapp.settings_saved": "✅ Settings saved!",
    "whatsapp.button_active": "WhatsApp button is active in the app",
    "whatsapp.button_disabled": "WhatsApp button has been disabled",
    "whatsapp.attention": "Attention",
    "whatsapp.enter_phone": "Enter WhatsApp phone number",
    "whatsapp.invalid_phone": "Invalid phone number. Use full format with area code (Ex: 5511999999999)",
    "whatsapp.contact_us": "Contact Us",

    // Plan Service
    "plans.essential": "Essential",
    "plans.professional": "Professional",
    "plans.business": "Business",
    "plans.essential_description": "Ideal for beginners",
    "plans.professional_description": "More flexibility",
    "plans.business_description": "Corporate and advanced use",
    "plans.feature_customization": "App customization",
    "plans.feature_email_support": "Email support",
    "plans.feature_import": "Import existing apps",
    "plans.feature_analytics": "Analytics and statistics",
    "plans.feature_multi_device": "Multi-device access",
    "plans.feature_backup": "Automatic backup",
    "plans.not_found": "Plan not found",
    "plans.card_declined": "Card declined by operator",
    "plans.free": "Free",
    "plans.free_internal": "Gratuito",

    // Support Page
    "support.default_title": "Support Center",
    "support.default_description": "Contact us for help and specialized support.",
    "support.default_button": "Contact",
    "support.response_message": "We'll respond as soon as possible",

    // General errors
    "error.generic": "Error",
    "error.loading": "Error loading",
    "error.saving": "Error saving",

    // Password Reset Dialog
    "password.reset.title": "Reset Password",
    "password.reset.sent": "We sent a verification code to",
    "password.reset.expires": "(Code expires in 30 minutes)",
    "password.reset.code_label": "Verification Code",
    "password.reset.code_hint": "Enter the 5-digit code we sent to your email",
    "password.reset.new_password": "New Password",
    "password.reset.new_password_placeholder": "Enter your new password",
    "password.reset.min_chars": "Minimum 6 characters",
    "password.reset.verifying": "Verifying...",
    "password.reset.button": "Reset Password",
    "password.reset.no_code": "Didn't receive the code? Check your spam folder or close and request again.",
    "password.reset.invalid_code": "Invalid code",
    "password.reset.code_must_be_5": "Code must be 5 digits",
    "password.reset.short_password": "Password too short",
    "password.reset.min_6_chars": "Password must be at least 6 characters",
    "password.reset.success": "✅ Password changed successfully!",
    "password.reset.success_desc": "You can now log in with your new password.",
    "password.reset.error": "Verification error",
    "password.reset.invalid_expired": "Invalid or expired code",
    "password.reset.generic_error": "An error occurred. Please try again.",
    "password.reset.try_again": "Connection error. Check your internet and try again.",
    "password.reset.invalid_code_msg": "Incorrect code. Please check the code and try again.",
    "password.reset.expired_code_msg": "Code expired. Close this window and request a new code.",
    "password.reset.weak_password_msg":
      "Password too weak. Use a stronger password with letters, numbers, and symbols.",
    "password.reset.code_used_msg": "This code has already been used. Request a new code.",

    // PIX Payment
    "pix.payment.title": "PIX Payment",
    "pix.payment.confirmed_title": "Payment Confirmed!",
    "pix.payment.confirmed_desc": "Your {planName} plan has been successfully activated.",
    "pix.payment.access_app": "Access App",
    "pix.expired_title": "PIX Expired",
    "pix.expired_desc": "The PIX code has expired. Please try again.",
    "pix.back_to_plans": "Back to Plans",
    "pix.time_remaining": "Time remaining:",
    "pix.scan_qrcode": "Scan the QR Code with your banking app",
    "pix.copy_code": "Or copy the PIX code:",
    "pix.code_copied": "PIX code copied!",
    "pix.code_copied_desc": "Paste the code in your banking app to make the payment.",
    "pix.how_to_pay": "How to pay:",
    "pix.step_1": "1. Open your banking app",
    "pix.step_2": "2. Scan the QR Code or paste the PIX code",
    "pix.step_3": "3. Confirm the payment of {amount}",
    "pix.step_4": "4. Wait for confirmation (up to 30 seconds)",
    "pix.cancel": "Cancel",
    "pix.simulate": "Simulate Payment",
    "pix.simulated": "Payment simulated!",
    "pix.simulated_desc": "For demonstration, the payment was automatically confirmed.",

    // Admin Login
    "admin.login.verifying": "Verifying permissions...",
    "admin.login.error_permissions": "Error verifying permissions",
    "admin.login.try_later": "Please try again later",
    "admin.login.success": "Login successful",
    "admin.login.redirecting": "Redirecting to admin panel...",
    "admin.login.access_denied": "Access denied",
    "admin.login.no_admin_permission": "You do not have administrator permission",

    // Auth Page
    "auth.name_required": "Full name is required",
    "auth.phone_required": "Phone is required",
    "auth.code_sent": "Code sent!",
    "auth.code_sent_desc": "Enter the 5-digit code we sent to your email.",
    "auth.email_not_confirmed": "Email not confirmed",
    "auth.email_not_confirmed_desc":
      "We resent a confirmation email. Check your inbox and confirm your account before logging in.",
    "auth.resend_error": "Error resending email",
    "auth.login_success": "Login successful!",
    "auth.login_redirecting": "Redirecting...",
    "auth.error": "Authentication error",
    "auth.error.email_exists": "This email is already registered. Please log in or use a different email.",
    "auth.send_code_error": "Error sending code",
    "auth.password_reset.user_not_found": "Email not found. Please check if you typed it correctly.",
    "auth.password_reset.error": "Error processing request. Please try again.",
    "auth.password_reset.error_title": "Recovery error",
    "auth.password_changed": "✅ Password changed!",
    "auth.password_changed_desc": "Log in with your new password.",
    "auth.recover_password": "Recover Password",
    "auth.recover_password_desc": "Enter your email to receive a password recovery link.",
    "auth.sending": "Sending...",
    "auth.send_link": "Send Link",

    // App Viewer
    "app.error": "Error",
    "app.error_loading": "Error loading application:",
    "app.not_found": "App not found",
    "app.not_found_desc": "This app does not exist or has been removed. Check if the link is correct.",
    "app.unexpected_error": "Unexpected error",
    "app.unexpected_error_desc": "An error occurred while loading the application. Try reloading the page.",
    "app.install_error": "Installation error",
    "app.install_error_desc": "Use the browser menu (⋮) and select 'Add to home screen'",
    "app.installed": "✅ Installed!",
    "app.installed_desc": "App successfully added to home screen.",
    "app.install_cancelled": "Installation cancelled",
    "app.install_cancelled_desc": "You can install later using the browser menu.",
    "app.install_try_again": "Try again or use the browser menu.",
    "app.download_started": "Download started",
    "app.download_started_desc": "{filename} is being downloaded.",
    "app.download_error": "Download error",
    "app.download_error_desc": "Could not download the file.",

    // Footer
    "footer.rights": "All rights reserved",

    // Academy Page
    "academy.title": "Academy",
    "academy.subtitle": "Tutorials and Training",
    "academy.search": "Search videos...",
    "academy.no_videos": "No videos found",
    "academy.no_tutorials": "No tutorials available",
    "academy.search_other": "Try searching with other terms",
    "academy.coming_soon": "Tutorials will be added soon",
    "academy.video": "video",
    "academy.videos": "videos",
    "academy.restricted_access": "Restricted Access",
    "academy.login_required": "Log in to access the platform tutorials and training.",
  },
  es: {
    // Header
    "app.title": "MigraBook",
    "header.back_to_app": "Volver al App",

    // CustomizationPanel - Colors
    "custom.colors.textColor": "Color del texto",
    "custom.colors.bonusColor": "Color del bono",
    "custom.template.logo": "Logo de Plantilla",

    // PWA Install Banner
    "pwa.install.title": "Instalar Aplicación",
    "pwa.install.app": "Aplicación",
    "pwa.install.follow": "Sigue los pasos a continuación:",
    "pwa.install.understood": "Entendido",
    "pwa.install.tap": "Toca para instalar",
    "pwa.install.one_tap": "Instala con un toque",
    "pwa.install.add": "Agregar a tu pantalla de inicio",
    "pwa.install.now": "Instalar",
    "pwa.install.how": "Cómo instalar",
    "pwa.install.later": "Después",
    "pwa.copy.link": "Copiar enlace",
    // iOS Safari
    "pwa.ios.safari.step1": "Toca Compartir (icono ↑)",
    "pwa.ios.safari.step2": "Agregar a Pantalla de Inicio",
    "pwa.ios.safari.step3": "Toca Agregar",
    // iOS otros navegadores
    "pwa.ios.other.warning": "En iPhone, las apps solo se pueden instalar desde Safari",
    "pwa.ios.other.step1": "Copia y abre este enlace en Safari",
    "pwa.ios.other.step2": "Toca Compartir (icono ↑)",
    "pwa.ios.other.step3": "Agregar a Pantalla de Inicio",
    // Android Chrome
    "pwa.android.chrome.step1": "Toca el menú (⋮) en la esquina",
    "pwa.android.chrome.step2": "Agregar a pantalla de inicio",
    // Android Samsung
    "pwa.android.samsung.step1": "Toca el menú (≡) en la barra",
    "pwa.android.samsung.step2": "Agregar a pantalla de inicio",
    // Android Firefox
    "pwa.android.firefox.step1": "Toca el menú (⋮)",
    "pwa.android.firefox.step2": "Instalar",
    // Android genérico
    "pwa.android.generic.step1": "Abre el menú del navegador",
    "pwa.android.generic.step2": "Agregar a pantalla de inicio",
    // Desktop
    "pwa.desktop.step1": "Haz clic en el menú del navegador",
    "pwa.desktop.step2": "Instalar aplicación",

    // Credit Card Form
    "payment.title": "Finalizar Suscripción",
    "payment.cycle.title": "Ciclo de Facturación",
    "payment.cycle.select": "Elija su ciclo de pago",
    "payment.monthly": "Mensual",
    "payment.yearly": "Anual",
    "payment.charged.monthly": "Cobrado mensualmente",
    "payment.charged.yearly": "Cobrado anualmente",
    "payment.card.title": "Datos de la Tarjeta",
    "payment.card.number": "Número de Tarjeta",
    "payment.card.name": "Nombre en la Tarjeta",
    "payment.card.month": "Mes",
    "payment.card.year": "Año",
    "payment.card.cvv": "CVV",
    "payment.billing.title": "Datos de Facturación",
    "payment.billing.email": "Email",
    "payment.billing.phone": "Teléfono",
    "payment.billing.zipcode": "Código Postal",
    "payment.billing.address": "Dirección",
    "payment.billing.number": "Número",
    "payment.billing.complement": "Complemento",
    "payment.billing.neighborhood": "Barrio",
    "payment.billing.city": "Ciudad",
    "payment.billing.state": "Estado",
    "payment.note": "* Los valores pueden variar según el ciclo de facturación seleccionado",

    // Integrations Panel
    "integrations.copy": "Copiar",
    "integrations.webhook.url": "URL del Webhook",
    "integrations.webhook.instructions": "Configure este webhook en su plataforma",

    // Settings Panel
    "settings.platform.name": "Nombre de la Plataforma",
    "settings.platform.description": "Descripción de la Plataforma",
    "settings.maintenance.mode": "Modo de Mantenimiento",
    "settings.maintenance.description": "Activa una página de mantenimiento para todos los usuarios",
    "settings.general": "General",
    "settings.support": "Soporte",
    "settings.maintenance": "Mantenimiento",
    "settings.legal": "Legal",
    "settings.users": "Usuarios",

    // Editor
    "editor.font.size": "Tamaño de Fuente",
    "editor.font.weight": "Peso de Fuente",
    "editor.save.text": "Guardar Texto",
    "editor.cancel": "Cancelar",
    "editor.edit.text": "Editar texto",
    "editor.style": "Estilo",
    "editor.edit.page": "Editar Página",
    "editor.saving": "Guardando...",
    "editor.save.all": "Guardar Todo",

    // Domain Dialog extra
    "domain.description.authority": "Transmita más autoridad usando su propio dominio.",
    "domain.description.request":
      "Haga clic en el botón de abajo para solicitar la configuración. Nuestro equipo técnico se encargará de toda la configuración por usted. Es rápido, seguro y sin complicaciones.",
    "domain.request.button": "Solicitar Configuración vía WhatsApp",

    // Support fallback
    "support.email.subject": "Solicitud de Soporte",
    "support.email.body": "Hola, necesito ayuda.",
    "toast.error": "Error",

    // Admin Dashboard
    "admin.splash.full": "Splash PWA",
    "admin.splash.mobile": "PWA",
    "admin.app.select": "Seleccionar App Publicada",
    "admin.pwa.full": "Config PWA",
    "admin.pwa.mobile": "PWA",
    "admin.pwa.title": "Configuración del Instalador PWA",
    "admin.pwa.description": "Configure cómo y cuándo aparece el banner de instalación para sus usuarios",
    "admin.pwa.enabled": "Instalador Activo",
    "admin.pwa.enabled.description": "Habilita o deshabilita completamente el banner de instalación",
    "admin.pwa.autoShow": "Mostrar Automáticamente",
    "admin.pwa.autoShow.description": "Mostrar banner automáticamente al acceder a la app",
    "admin.pwa.dismissPersistent": "Recordar Cierre",
    "admin.pwa.dismissPersistent.description": "Si el usuario cierra el banner, no mostrar de nuevo",
    "admin.pwa.ios.description": "Configure el banner para dispositivos iOS (iPhone/iPad)",
    "admin.pwa.ios.safari.hint": "Navegador nativo de iOS",
    "admin.pwa.ios.chrome.hint": "Requiere instrucciones para abrir en Safari",
    "admin.pwa.android.description": "Configure el banner para dispositivos Android",
    "admin.pwa.android.chrome.hint": "Instalación directa via prompt nativo",
    "admin.pwa.android.samsung.hint": "Navegador predeterminado en dispositivos Samsung",
    "admin.pwa.android.firefox.hint": "Navegador alternativo popular",
    "admin.pwa.android.other": "Otros navegadores",
    "admin.pwa.android.other.hint": "Opera, Edge, navegadores menos comunes",
    "admin.pwa.desktop.description": "Configure el banner para navegadores de escritorio",
    "admin.pwa.desktop.browsers": "Todos los navegadores",
    "admin.pwa.desktop.hint": "Chrome, Edge, Firefox y otros",
    "admin.pwa.saved": "✅ Configuración PWA guardada!",
    "admin.pwa.error": "Error al guardar configuración",
    "admin.saving": "Guardando...",
    "admin.save": "Guardar",

    // PWA Texts Configuration
    "admin.pwa.texts.title": "Textos Personalizables",
    "admin.pwa.texts.description": "Personaliza los textos mostrados en el banner y pantalla de instrucciones",
    "admin.pwa.texts.bannerTitle": "Título del Banner",
    "admin.pwa.texts.instructionsTitle": "Título de Instrucciones",
    "admin.pwa.texts.subtitleDirect": "Subtítulo (instalación directa)",
    "admin.pwa.texts.subtitleManual": "Subtítulo (instalación manual)",
    "admin.pwa.texts.installButton": "Botón Instalar",
    "admin.pwa.texts.howToButton": "Botón Cómo Instalar",
    "admin.pwa.texts.laterButton": "Botón Después",
    "admin.pwa.texts.understoodButton": "Botón Entendido",
    "admin.pwa.texts.instructionsSubtitle": "Subtítulo de Instrucciones",
    "admin.pwa.texts.copyLinkButton": "Botón Copiar Enlace",
    "admin.pwa.texts.hint": "Deja en blanco para usar el texto predeterminado del idioma seleccionado",

    // PWA Instructions Editor
    "admin.pwa.instructions.title": "Instrucciones de Instalación",
    "admin.pwa.instructions.description": "Personaliza las instrucciones paso a paso para cada dispositivo/navegador",
    "admin.pwa.instructions.reset": "Restaurar Predeterminado",
    "admin.pwa.instructions.addStep": "Agregar Paso",
    "admin.pwa.instructions.steps": "Pasos",
    "admin.pwa.instructions.warningMessage": "Mensaje de Advertencia",
    "admin.pwa.instructions.otherBrowsers": "Otros",
    "admin.pwa.instructions.show": "Editar Instrucciones por Dispositivo",
    "admin.pwa.instructions.hide": "Ocultar Editor de Instrucciones",
    "admin.pwa.instructions.iosSafari.desc": "Navegador nativo de iOS - soporta instalación PWA",
    "admin.pwa.instructions.iosOther.desc": "Otros navegadores en iOS necesitan Safari",
    "admin.pwa.instructions.androidChrome.desc": "Instalación nativa via prompt",
    "admin.pwa.instructions.androidSamsung.desc": "Navegador predeterminado Samsung",
    "admin.pwa.instructions.androidFirefox.desc": "Navegador alternativo popular",
    "admin.pwa.instructions.androidOther.desc": "Opera, Edge y otros navegadores",
    "admin.pwa.instructions.desktop.desc": "Chrome, Edge, Firefox y otros",

    // Visual Editor
    "visual.editor.title": "✨ Editor Visual - Página de Suscripción",
    "visual.editor.subtitle.size": "Tamaño del Subtítulo",

    // Pricing Badge
    "pricing.badge.free_trial": "7 días gratis",
    "language.select": "Idioma",
    "theme.light": "Claro",
    "theme.dark": "Oscuro",
    reset: "Resetear",
    publish: "Publicar App",

    // Subscribe Page - Hero
    "subscribe.hero.title": "Convierte eBooks obsoletos en",
    "subscribe.hero.title.line2": "Aplicaciones modernas con pocos clics,",
    "subscribe.hero.title.line3": "sin necesidad de programar.",
    "subscribe.hero.subtitle": "Vende más aumentando el valor percibido sin cambiar el contenido.",
    "subscribe.hero.cta": "Crear Mi App Ahora",
    "subscribe.hero.or": "o",
    "subscribe.hero.demo": "Ver Demostración",

    // Subscribe Page - Problem Section
    "subscribe.problem.title": "Si vendes conocimiento digital, ya lo has notado en la práctica:",
    "subscribe.problem.step1": "El cliente necesita crear un login.",
    "subscribe.problem.step2": "Confirmar email.",
    "subscribe.problem.step3": "Recordar contraseña.",
    "subscribe.problem.step4": "Acceder al área de miembros.",
    "subscribe.problem.step5": "Navegar hasta el contenido.",
    "subscribe.problem.question": "¿Y si algo falla en el camino?",
    "subscribe.problem.result":
      'El cliente no puede entrar → dice que "no recibió el producto" → pide reembolso → pierdes la venta.',

    // Subscribe Page - Comparison
    "subscribe.comparison.pdf.title": "PDF",
    "subscribe.comparison.pdf.subtitle":
      "Lo que separa a quienes aún venden PDF de quienes construyen un producto real es la experiencia.",
    "subscribe.comparison.app.title": "App",
    "subscribe.comparison.app.description": "Y la experiencia hoy es una app.",

    // Subscribe Page - Benefits
    "subscribe.benefits.title": "¿Qué Cambia Cuando Tu Ebook Se Convierte en App?",
    "subscribe.benefits.title.part1": "¿Qué Cambia Cuando Tu",
    "subscribe.benefits.title.part2": "Ebook Se Convierte en App?",
    "subscribe.benefits.card1.title": "Sin barreras de acceso",
    "subscribe.benefits.card1.desc":
      "El cliente hace clic en el enlace → se abre directamente en la app → consume el contenido. Se acabó el drama del login",
    "subscribe.benefits.card2.title": "Experiencia del usuario",
    "subscribe.benefits.card2.desc": "Organizado, hermoso, fácil de navegar. Tu cliente no necesita buscar archivos.",
    "subscribe.benefits.card3.title": "Monetización inteligente",
    "subscribe.benefits.card3.desc":
      "Usa notificaciones dentro de la App para ofrecer actualizaciones, módulos extras y nuevas ofertas, aumentando tus ventas sin esfuerzo.",
    "subscribe.benefits.card4.title": "Identidad visual consistente",
    "subscribe.benefits.card4.desc": "Logo, colores y nombre personalizados. La app es realmente tuya, no de terceros.",
    "subscribe.benefits.card5.title": "Interfaz multiidioma",
    "subscribe.benefits.card5.desc":
      "Menús, botones y mensajes pueden ser traducidos a cualquier idioma. Ideal para vender tu app en otros países.",
    "subscribe.benefits.card6.title": "Facilidad de acceso",
    "subscribe.benefits.card6.desc":
      "Tu cliente compra, envías el link y listo! Sin área de login, sin molestias con soporte y menos reembolsos.",
    "subscribe.benefits.card7.title": "Actualizaciones automáticas",
    "subscribe.benefits.card7.desc":
      "¿Necesitas corregir o añadir algo dentro de la App? Actualiza una vez y todos lo reciben, sin reenviar PDF y sin retrabajo.",
    "subscribe.benefits.card8.title": "Integración directa",
    "subscribe.benefits.card8.desc":
      "Conecta tu app con cualquier plataforma (Hotmart, Kiwify, Stripe u otra) y mantén control total sobre tus ventas.",
    "subscribe.benefits.cta.title": "Migrar Ahora",
    "subscribe.benefits.cta.button": "Transformar Mi eBook en App",

    // Subscribe Page - Target Audience
    "subscribe.target.title": "¿Para Quién es MigraBook.app?",

    // Subscribe Page - Integrations
    "subscribe.integrations.title": "Tu plataforma preferida",
    "subscribe.integrations.title.line2": "conectada en pocos clics",
    "subscribe.integrations.subtitle": "Migrabook.app ya está integrado con las principales plataformas del mercado.",

    // Subscribe Page - Pricing
    "subscribe.pricing.title": "Planes y Precios",
    "subscribe.pricing.subtitle": "Elige el plan perfecto para tus necesidades",
    "subscribe.pricing.popular": "Recomendado",
    "subscribe.pricing.month": "/mes",
    "pricing.monthly": "Mensual",
    "pricing.annual": "Anual",
    "subscribe.pricing.annual.note": "Cobrado anualmente (R$ {price})",
    "subscribe.pricing.choose.plan": "Elegir {plan}",
    "subscribe.pricing.payment.secure": "Pago seguro vía Stripe",
    "subscribe.pricing.cancel.anytime": "Cancela cuando quieras, sin complicaciones",

    // Subscribe Page - FAQ
    "subscribe.faq.title": "Preguntas Frecuentes",
    "subscribe.faq.subtitle": "Encuentra respuestas a las preguntas más comunes",
    "subscribe.faq.q1": "¿Necesito saber programar para usar MigraBook?",
    "subscribe.faq.a1":
      "¡No! MigraBook fue desarrollado para ser 100% intuitivo. Solo sube tu PDF, personaliza colores y logo, y tu app está lista para publicar. Todo sin escribir una línea de código.",
    "subscribe.faq.q2": "¿Cómo funciona la entrega a los clientes?",
    "subscribe.faq.a2":
      "Después de integrar tu app con tu plataforma de ventas (Hotmart, Kiwify, etc.), el cliente recibirá automáticamente el enlace de acceso por email tan pronto como se confirme la compra. Solo hace clic y accede al contenido directamente en la app.",
    "subscribe.faq.q3": "¿Puedo personalizar la app con mi marca?",
    "subscribe.faq.a3":
      "¡Sí! Puedes personalizar colores, logo, icono e incluso el dominio de la app. El objetivo es que la app tenga el aspecto de tu marca, creando una experiencia única para tus clientes.",
    "subscribe.faq.q4": "¿Qué pasa si quiero cancelar?",
    "subscribe.faq.a4":
      "Puedes cancelar en cualquier momento, sin multas ni tarifas adicionales. Tu app permanecerá activa hasta el final del período que ya pagaste.",
    "subscribe.faq.q5": "¿Qué tipo de soporte ofrecen?",
    "subscribe.faq.a5":
      "Ofrecemos soporte por email para todos los planes. Los planes Profesional y Empresarial tienen acceso a soporte prioritario vía WhatsApp. Nuestro equipo siempre está listo para ayudarte a tener éxito.",

    // Subscribe Page - Final CTA
    "subscribe.final.title": "¿Listo para Transformar tu eBook en una Aplicación de Éxito?",
    "subscribe.final.check1": "✓ App creada en minutos",
    "subscribe.final.check2": "✓ Integración automática con tu plataforma",
    "subscribe.final.check3": "✓ Soporte completo para comenzar",
    "subscribe.final.cta.primary": "Crear Mi App Ahora",
    "subscribe.final.cta.whatsapp": "Hablar por WhatsApp",

    // Subscribe Page - Footer
    "subscribe.footer.rights": "Todos los derechos reservados.",
    "subscribe.footer.privacy": "Política de Privacidad",
    "subscribe.footer.terms": "Términos de Uso",

    // Header
    "subscribe.header.login": "Iniciar Sesión",
    "subscribe.header.start": "Comenzar Ahora",

    // Hero Title Parts
    "subscribe.hero.title.part1": "Convierte eBooks obsoletos en",
    "subscribe.hero.title.part2": "Apps Modernas",
    "subscribe.hero.title.part3": "con pocos clics,",
    "subscribe.hero.title.part4": "sin necesidad de programar.",

    // Ebook Section
    "subscribe.ebook.title":
      "Aquí está el porqué tus eBooks ya no entregan el valor que imaginas y cómo transformarlos en un producto real.",
    "subscribe.ebook.para1":
      "En tu oferta, solo al mencionar la palabra “ebook”, tu cliente potencial ya pierde la mitad del interés.",
    "subscribe.ebook.para2": "Eso se debe a que “ebook” suena como algo barato, común y fácilmente reemplazable.",
    "subscribe.ebook.test_title": "Haz una prueba rápidda (solo lee en voz alta):",
    "subscribe.ebook.test_ebook": "Estoy vendiendo un",
    "subscribe.ebook.test_ebook_word": "ebook",
    "subscribe.ebook.test_subject": "sobre pérdida de peso.",
    "subscribe.ebook.test_app": "Estoy vendiendo una",
    "subscribe.ebook.test_app_word": "aplicación",
    "subscribe.ebook.difference_question": "¿Notas la diferencia?",
    "subscribe.ebook.mockup_ebook": "El primero parece un archivo.",
    "subscribe.ebook.mockup_app": "El segundo parece un producto.",
    "subscribe.ebook.app_experience_title": "La aplicación es experiencia, es practicidad, es estatus.",
    "subscribe.ebook.app_experience_para1":
      "Es algo que se queda en la pantalla principal del smartphone, no perdido en descargas o en una carpeta.",
    "subscribe.ebook.app_experience_para2": "Tu cliente siente esto de inmediato.",
    "subscribe.header.language": "Idioma",
    "subscribe.header.portuguese": "Portugués",
    "subscribe.header.english": "Inglés",
    "subscribe.header.spanish": "Español",
    "subscribe.header.light_mode": "Modo Claro",
    "subscribe.header.dark_mode": "Modo Oscuro",
    "subscribe.header.menu": "Menú",

    // Hero Section
    "subscribe.hero.main_title": "Convierte eBooks Obsoletos en",
    "subscribe.hero.main_title.highlight": "Apps Modernas",
    "subscribe.hero.main_title.line3": "con pocos clics,",
    "subscribe.hero.main_title.line4": "sin necesidad de programar.",
    "subscribe.hero.main_subtitle": "Vende más aumentando el valor percibido sin cambiar el contenido.",
    "subscribe.hero.main_cta": "¡Crear Mi App Ahora!",

    // Planos Page Hero (specific for /planos route)
    "planos.hero.title.part1": "Cómo convertir más cambiando solo el",
    "planos.hero.title.highlight": "formato de tu entrega",
    "planos.hero.title.part2": "sin crear un nuevo producto",
    "planos.hero.subtitle":
      "Mismo producto, nuevo formato, nueva percepción. Tus clientes pagarán precio premium (sin que programes nada)",
    "planos.hero.cta": "Transformar mi oferta en App",

    // Planos Page Ebook Section (specific for /planos route)
    "planos.ebook.problem_statement": "El problema no es tu conocimiento. Es el formato en que lo entregas.",
    "planos.ebook.mockup_ebook": "El primero suena amateur.",
    "planos.ebook.mockup_app": "El segundo es profesional.",
    "planos.ebook.app_benefit_title": "El mismo eBook, cuando se convierte en app:",
    "planos.ebook.benefit1": "Parece más profesional",
    "planos.ebook.benefit2": "Genera más valor percibido",
    "planos.ebook.benefit3": "Facilita la conversión",
    "planos.ebook.benefit4": "Y vende más",

    // Planos Page - 3 Steps Section
    "planos.steps.title": "Tu aplicación lista en 3 simples pasos",
    "planos.steps.subtitle": "No necesitas saber programar ni lidiar con la parte técnica.",
    "planos.steps.step1.title": "Paso 1:",
    "planos.steps.step1.name": "Envía tu material",
    "planos.steps.step1.description":
      "Sube tu eBook y listo. También puedes enviar audios y agregar videos. El sistema organiza todo automáticamente dentro de la app.",
    "planos.steps.step2.title": "Paso 2:",
    "planos.steps.step2.name": "Personaliza en 1 minuto",
    "planos.steps.step2.description":
      "Agrega nombre, colores e identidad visual para darle a la app una apariencia profesional.",
    "planos.steps.step3.title": "Paso 3:",
    "planos.steps.step3.name": "Envía a tus clientes",
    "planos.steps.step3.description":
      "Comparte el enlace y el cliente lo instala directamente en su celular con un toque, sin login complicado.",
    "planos.steps.final.title": "Así de simple. Del eBook a la App en 3 minutos.",
    "planos.steps.final.subtitle": "¡Si empiezas ahora!",
    "planos.steps.final.button": "Transformar Mi eBook en App Ahora",

    // Planos Page - Benefits Section
    "planos.benefits.title.part1": "Qué cambia cuando tu ebook",
    "planos.benefits.title.highlight": "deja de ser un archivo",
    "planos.benefits.title.part2": "y se convierte en una app",
    "planos.benefits.card1.title": "Cobra 3x Más por el Mismo Contenido",
    "planos.benefits.card1.desc":
      'Tu infoproducto deja de ser "solo un eBook" y se convierte en una experiencia premium. Tus clientes lo percibirán como algo mucho más valioso y tú justificas precios mayores.',
    "planos.benefits.card2.title": "Convierte Más Visitantes en Compradores",
    "planos.benefits.card2.desc":
      'Cuando ofreces una app profesional en lugar de un simple PDF, tu producto se destaca de la competencia. El cliente ve más valor, confía más y hace clic en "comprar" con menos resistencia.',
    "planos.benefits.card3.title": "Reduce Solicitudes de Reembolso en 90%",
    "planos.benefits.card3.desc":
      "El cliente que recibe una app organizada, bonita y fácil de usar queda más satisfecho. ¿Resultado? Menos quejas, menos devoluciones y más dinero en tu bolsillo.",
    "planos.benefits.card4.title": "Tus Clientes Nunca Pierden Acceso",
    "planos.benefits.card4.desc":
      "A diferencia del PDF que desaparece en el celular o se pierde en el email, tu app queda en la pantalla de inicio, a un clic de distancia. El cliente accede cuando quiera, desde cualquier dispositivo, cero dolor de cabeza.",
    "planos.benefits.card5.title": "Parece una Gran Marca, Aunque Seas Solo",
    "planos.benefits.card5.desc":
      "Tu cliente abre una aplicación con diseño profesional, interfaz organizada y navegación fluida. La experiencia premium aumenta tu autoridad y genera recomendaciones naturales.",
    "planos.benefits.card6.title": "Vende a 10 o 10.000 Sin Cambiar Nada",
    "planos.benefits.card6.desc":
      "No importa si tienes 10 o 10 mil clientes. El proceso es el mismo, sin contratar programador, pagar servidor caro o preocuparte por infraestructura técnica.",
    "planos.benefits.cta.subtitle":
      "Transforma tu eBook en una app profesional que vende más, reembolsa menos e impresiona a tus clientes.",
    "planos.benefits.cta.title": "Empieza ahora mismo.",
    "planos.benefits.cta.button": "Transformar Mi eBook en App Ahora",

    // What MigraBook Does in Practice Section
    "planos.practice.title": "Lo que MigraBook hace en la práctica",
    "planos.practice.block1.title": "Transforma contenido simple en producto profesional",
    "planos.practice.block1.pdf.title": "Materiales en PDF convertidos en aplicación",
    "planos.practice.block1.pdf.desc":
      "Convierte eBooks, guías, manuales y cualquier material PDF en una aplicación profesional, organizada y fácil de acceder. El contenido deja de ser un archivo suelto y pasa a ser una experiencia directa en el celular del cliente.",
    "planos.practice.block1.video.title": "Videos (vía enlace) y audios integrados en la app",
    "planos.practice.block1.video.desc":
      "Además de PDFs/eBooks, puedes complementar el contenido con audios subidos directamente y videos agregados vía enlace de YouTube, todos reproducidos dentro de la aplicación. El usuario consume todo sin salir de la app, manteniendo la experiencia centralizada.",

    // Block 2
    "planos.practice.block2.title": "Facilita el acceso y reduce soporte",
    "planos.practice.block2.access.title": "Acceso facilitado",
    "planos.practice.block2.access.desc":
      "El cliente recibe el enlace, instala la app en el celular y accede a todo el contenido con un solo toque, sin login complicado.",
    "planos.practice.block2.install.title": "Instalación rápida (Android, iOS y Web)",
    "planos.practice.block2.install.desc":
      "El cliente instala la app en segundos o accede directamente por el navegador, sin necesidad de ir a Play Store o App Store.",
    "planos.practice.block2.whatsapp.title": "Soporte vía WhatsApp dentro de la app",
    "planos.practice.block2.whatsapp.desc":
      "Agrega un botón flotante para que tu cliente hable contigo con un toque. Ideal para resolver dudas rápidas y evitar reembolsos.",

    // Block 3
    "planos.practice.block3.title": "Mantiene el contenido siempre actualizado y con apariencia profesional",
    "planos.practice.block3.realtime.title": "Actualizaciones en tiempo real",
    "planos.practice.block3.realtime.desc":
      "Actualiza contenidos cuando quieras, sin reenviar enlaces o archivos. Tu app siempre está actualizada y el cliente siempre accede a la versión más reciente.",
    "planos.practice.block3.templates.title": "Templates premium siempre listos",
    "planos.practice.block3.templates.desc":
      "Elige modelos profesionales para organizar tu contenido y mantener el visual de la app moderno y bien presentado, incluso cuando agregas nuevos materiales.",

    // Block 4
    "planos.practice.block4.title": "Aumenta ventas y engagement",
    "planos.practice.block4.push.title": "Notificaciones Push",
    "planos.practice.block4.push.desc":
      "Destaca nuevos contenidos, avisos y ofertas dentro de la aplicación, dirigiendo al usuario hacia acciones importantes durante el uso de la app.",
    "planos.practice.block4.upsell.title": "Upsell, Order Bump y Afiliados",
    "planos.practice.block4.upsell.desc":
      "Vende más dentro de la propia aplicación, liberando contenidos extras, nuevas ofertas o promoviendo productos como afiliado.",

    // Block 5
    "planos.practice.block5.title": "Permite escalar sin limitaciones",
    "planos.practice.block5.users.title": "Usuarios ilimitados",
    "planos.practice.block5.users.desc": "Vende a cuantas personas quieras, sin costo adicional por usuario.",
    "planos.practice.block5.integration.title": "Integración con plataformas de pago",
    "planos.practice.block5.integration.desc":
      "Conecta tu app a las principales plataformas del mercado y automatiza el acceso después de la compra, sin procesos manuales.",
    "planos.practice.block5.domain.title": "Dominio personalizado",
    "planos.practice.block5.domain.desc":
      "Tu aplicación con tu nombre, tu marca y tu dominio, reforzando autoridad y profesionalismo.",
    "planos.practice.cta.title": "Acabas de ver todo lo que hace MigraBook.",
    "planos.practice.cta.subtitle": "Ahora mira lo fácil que es crear el tuyo.",
    "planos.practice.cta.button": "Crear Mi App en 3 Minutos",

    // Second Section - Why eBooks Don't Work
    "subscribe.ebook.problem.main_title":
      "Aquí está el porqué tus eBooks ya no entregan el valor que imaginas y cómo transformarlos en un producto real.",
    "subscribe.ebook.problem.para1":
      'En tu oferta, solo con decir la palabra "ebook" tu cliente potencial ya pierde la mitad del interés.',
    "subscribe.ebook.problem.para2": 'Esto es porque "ebook" suena como algo barato, común y fácilmente reemplazable.',
    "subscribe.ebook.problem.para3": "Haz una prueba rápida (solo lee en voz alta):",
    "subscribe.ebook.test.ebook": '"Estoy vendiendo un ebook sobre pérdida de peso."',
    "subscribe.ebook.test.app": '"Estoy vendiendo una app sobre pérdida de peso."',
    "subscribe.ebook.difference": "¿Notas la diferencia?",
    "subscribe.ebook.mockup.caption1": "El primero parece un archivo.",
    "subscribe.ebook.mockup.caption2": "El segundo parece un producto.",
    "subscribe.ebook.experience.title": "App es experiencia, es practicidad, es estatus.",
    "subscribe.ebook.experience.para1":
      "Es algo que queda en la pantalla inicial del smartphone, no perdido en descargas o en una carpeta.",
    "subscribe.ebook.experience.para2": "Tu cliente lo siente de inmediato.",

    // Third Section - Benefits Cards
    "subscribe.benefits.main_title": "¿Qué Cambia Cuando Tu",
    "subscribe.benefits.main_title.line2": "Ebook se Convierte en una App?",
    "subscribe.benefits.title.subtitle": "Y cómo Migrabook entrega esta experiencia de la manera correcta.",
    "subscribe.benefits.value.title": "Valor Agregado",
    "subscribe.benefits.value.desc":
      "Los eBooks parecen tener poco valor. Una app eleva instantáneamente la percepción de tu oferta.",
    "subscribe.benefits.ux.title": "Experiencia del Usuario",
    "subscribe.benefits.ux.desc": "Organizado, bonito, fácil de navegar. Tu cliente no necesita buscar archivos.",
    "subscribe.benefits.monetization.title": "Monetización Inteligente",
    "subscribe.benefits.monetization.desc":
      "Usa notificaciones dentro de la app para ofrecer actualizaciones, módulos extras y nuevas ofertas, aumentando tus ventas sin esfuerzo.",
    "subscribe.benefits.identity.title": "Identidad Visual Consistente",
    "subscribe.benefits.identity.desc":
      "Logo, colores y nombre personalizados. La app es realmente tuya, no de terceros.",
    "subscribe.benefits.multilang.title": "Interfaz Multi-idioma",
    "subscribe.benefits.multilang.desc":
      "Menús, botones y mensajes pueden traducirse a cualquier idioma. Ideal para vender tu app en otros países.",
    "subscribe.benefits.access.title": "Facilidad de Acceso",
    "subscribe.benefits.access.desc":
      "Tu cliente compra, envías el enlace y ¡listo! Sin área de inicio de sesión, sin molestias de soporte y menos reembolsos.",
    "subscribe.benefits.updates.title": "Actualizaciones Automáticas",
    "subscribe.benefits.updates.desc":
      "¿Necesitas corregir o agregar algo en la app? Actualiza una vez y todos lo reciben, sin reenviar PDF y sin retrabajo.",
    "subscribe.benefits.integration.title": "Integración Directa",
    "subscribe.benefits.integration.desc":
      "Conecta tu app con cualquier plataforma (Hotmart, Kiwify, Stripe u otra) y mantén control total sobre tus ventas.",
    "subscribe.benefits.migrate_now": "Migrar Ahora",

    // Fourth Section - Target Audience
    "subscribe.target.main_title": "¿Para Quién es Migrabook.app?",
    "subscribe.target.bullet1.title": "Para quien quiere aumentar las ventas con el mismo contenido",
    "subscribe.target.bullet1.desc":
      "Transforma el PDF que ya tienes en una aplicación profesional y vende mucho más, solo cambiando el formato de entrega.",
    "subscribe.target.bullet3.title": 'Para quien está cansado de reembolsos por "dificultad de acceso"',
    "subscribe.target.bullet3.desc":
      "Entrega una app que funciona perfectamente - cliente accede fácil, reclama menos, reembolsa menos.",
    "subscribe.target.bullet4.title": "Para quien quiere proteger su contenido de la piratería",
    "subscribe.target.bullet4.desc":
      "Basta de ver tu trabajo filtrado en grupos de Telegram. App dificulta la copia y protege tu autoridad.",
    "subscribe.target.bullet5.title": "Para quien quiere destacarse de la multitud de eBooks genéricos",
    "subscribe.target.bullet5.desc":
      "Mientras todos entregan PDF de $27, tú entregas una app profesional y te posicionas como autoridad.",
    "subscribe.target.bullet6.title":
      "Para quienes quieren vender en dólares sin complicaciones de idioma o entrega internacional",
    "subscribe.target.bullet6.desc":
      "Tu app funciona en cualquier país, acepta cualquier idioma. Traduce tu contenido, lanza en EE.UU. o LATAM y gana 5x más en dólares. Misma aplicación, ganancia multiplicada.",

    // Fifth Section - Digital Knowledge Problems
    "subscribe.problems.title": "30-40% de tus clientes se traban aquí",
    "subscribe.problems.title.line2": "(y pierdes la venta)",
    "subscribe.problems.title.part1": "30-40% de tus clientes se traban aquí",
    "subscribe.problems.title.part2": "(y pierdes la venta)",
    "subscribe.problems.item1": "Cliente necesita crear login (y ya desiste aquí)",
    "subscribe.problems.item2": "Confirmar email (que va al spam)",
    "subscribe.problems.item3": "Recordar contraseña (que olvida en 2 días)",
    "subscribe.problems.item4": "Acceder al área de miembros (que no carga en el celular)",
    "subscribe.problems.item5": "Navegar hasta el contenido (si aún tiene paciencia)",
    "subscribe.problems.question": "1 de cada 3 clientes no puede entrar",
    "subscribe.problems.warning_question": "1 de cada 3 clientes no puede entrar",
    "subscribe.problems.result": "→ reclama que 'no recibió'\n→ pide reembolso\n→ pierdes la venta y el producto.",
    "subscribe.problems.warning_box": "→ reclama que 'no recibió'\n→ pide reembolso\n→ pierdes la venta y el producto.",

    // Sixth Section - How Migrabook Changes
    "subscribe.changes.title": "Con Migrabook.app, esto cambia.",
    "subscribe.changes.intro": "Entregas tu contenido directamente en la app:",
    "subscribe.changes.benefit1": "Sin inicio de sesión",
    "subscribe.changes.benefit2": "Sin confirmación de email",
    "subscribe.changes.benefit3": "Sin contraseña",
    "subscribe.changes.benefit4": "Sin soporte técnico",
    "subscribe.changes.no_login": "Sin inicio de sesión",
    "subscribe.changes.no_email": "Sin confirmación de email",
    "subscribe.changes.no_password": "Sin contraseña",
    "subscribe.changes.no_support": "Sin soporte técnico",
    "subscribe.changes.success": 'Tu cliente recibe un enlace → Hace clic en "Instalar" → y listo.',
    "subscribe.changes.success_box": 'Tu cliente recibe un enlace → Hace clic en "Instalar" → y listo.',
    "subscribe.changes.success.detail": "Simple. Directo. Y fácil.",
    "subscribe.changes.success_tagline": "Simple. Directo. Y fácil.",
    "subscribe.changes.demo_link": "Haz clic y mira la demostración",

    // Planos Page - Sixth Section - How Migrabook Changes (specific texts)
    "planos.changes.title": "Con MigraBook.app, tu cliente entra en 10 segundos.",
    "planos.changes.intro": "Entregas tu contenido directamente en la app:",
    "planos.changes.benefit1": "Sin inicio de sesión (cliente entra directo)",
    "planos.changes.benefit2": "Sin confirmación de email (cero dificultad)",
    "planos.changes.benefit3": "Sin contraseña (nunca la olvidará)",
    "planos.changes.benefit4": "Sin soporte técnico (menos dolor de cabeza)",
    "planos.changes.success_box": "Tu cliente recibe un enlace → Hace clic en 'Instalar' → Accede en 10 segundos.",
    "planos.changes.success_tagline": "Cero dificultad. Cero reembolsos. Cero dolor de cabeza.",

    // Planos Page - CTA Section
    "planos.cta.title": "Basta de perder dinero con reembolsos por dificultad de acceso.",
    "planos.cta.subtitle": "Transforma tu PDF en app profesional y elimina dificultad, reclamos y reembolsos.",
    "planos.cta.button": "Transformar Mi eBook en App Ahora",
    "planos.cta.tagline": "Tu app lista en 3 minutos.",

    // Planos Page - Countdown Timer
    "planos.countdown.title": "El Precio Promocional Termina En:",
    "planos.countdown.hours": "HORAS",
    "planos.countdown.minutes": "MINUTOS",
    "planos.countdown.seconds": "SEGUNDOS",
    "planos.countdown.disclaimer": "Después vuelve al precio original",

    // Planos Page - Final CTA Section
    "planos.final.urgency": "Últimas horas con precio promocional",
    "planos.final.title.part1": "¿Seguir vendiendo eBook/PDF o App Profesional?",
    "planos.final.title.part2": "La elección es tuya.",
    "planos.final.cta.button": "Quiero Transformar Mi eBook en App Ahora",
    "planos.final.cta.whatsapp": "Hablar en WhatsApp",
    "planos.final.benefit1": "App listo en 3 minutos (cero programación)",
    "planos.final.benefit2": "Soporte respondiendo en hasta 2h",
    "planos.final.benefit3": "Cancela cuando quieras (sin multa)",
    "planos.final.benefit4": "Usado por 2.347+ creadores de contenido",

    // Planos Page - Compare Costs
    "planos.compare.title": "Compara los costos",
    "planos.compare.developer.label": "Contratar desarrollador para crear 1 app desde cero",
    "planos.compare.developer.price": "$3.000+",
    "planos.compare.members.label": "Área de miembros con límite de usuarios",
    "planos.compare.members.price": "$197/mes",
    "planos.compare.migrabook.label": "MigraBook sin límite de usuarios",
    "planos.compare.migrabook.price": "A partir de $47/mes",

    // Integration Section
    "subscribe.integration.main_title": "Tu plataforma preferida",
    "subscribe.integration.main_title.line2": "conectada en pocos clics",
    "subscribe.integration.title.part1": "Tu plataforma preferida",
    "subscribe.integration.title.part2": "conectada",
    "subscribe.integration.title.part3": "en pocos clics",
    "subscribe.integration.subtitle": "Migrabook.app ya viene integrado con las principales plataformas del mercado.",
    "subscribe.integration.bottom_text": "Conecta y comienza a vender en minutos, sin complicación técnica.",

    // Pricing Section
    "subscribe.pricing.main_title": "Planes y Precios",
    "subscribe.pricing.period.year": "/año",
    "subscribe.pricing.period.month": "/mes",
    "subscribe.pricing.equivalent": "Equivale a $",
    "subscribe.pricing.start_now": "Comenzar Ahora",

    // FAQ Section
    "subscribe.faq.question1": "¿Cómo funciona Migrabook.app?",
    "subscribe.faq.q1.question": "¿Cómo funciona Migrabook.app?",
    "subscribe.faq.q1.answer":
      "Importas tu eBook (PDF) a la plataforma y antes de publicar, personalizas el diseño de la app (colores, portada, logo, iconos y nombre). Mientras personalizas, ves una vista previa en tiempo real de cómo quedará la app. Después de eso, Migrabook.app genera automáticamente una app lista para enviar. Cuando tu cliente compra, recibe el enlace, instala en su smartphone y accede al contenido inmediatamente. Sin inicio de sesión, contraseña o área de miembros.",
    "subscribe.faq.answer1":
      "Importas tu eBook (PDF) a la plataforma y antes de publicar, personalizas el diseño de la app (colores, portada, logo, iconos y nombre). Mientras personalizas, ves una vista previa en tiempo real de cómo quedará la app. Después de eso, Migrabook.app genera automáticamente una app lista para enviar. Cuando tu cliente compra, recibe el enlace, instala en su smartphone y accede al contenido inmediatamente. Sin inicio de sesión, contraseña o área de miembros.",
    "subscribe.faq.question2": "¿El cliente necesita descargar la app en el smartphone?",
    "subscribe.faq.q2.question": "¿El cliente necesita descargar la app en el smartphone?",
    "subscribe.faq.q2.answer":
      "No. El cliente solo agrega la app a la pantalla del smartphone con un solo clic. El acceso es directo e inmediato.",
    "subscribe.faq.answer2":
      "No. El cliente solo agrega la app a la pantalla del smartphone con un solo clic. El acceso es directo e inmediato.",
    "subscribe.faq.question3": "¿El cliente puede acceder desde la computadora?",
    "subscribe.faq.q3.question": "¿El cliente puede acceder desde la computadora?",
    "subscribe.faq.q3.answer":
      "Sí. La misma app se puede abrir en el navegador de escritorio. La interfaz se adapta automáticamente al tamaño de la pantalla.",
    "subscribe.faq.answer3":
      "Sí. La misma app se puede abrir en el navegador de escritorio. La interfaz se adapta automáticamente al tamaño de la pantalla.",
    "subscribe.faq.question3a": "¿Puedo añadir vídeos dentro de la aplicación creada en Migrabook.app?",
    "subscribe.faq.q3a.question": "¿Puedo añadir vídeos dentro de la aplicación creada en Migrabook.app?",
    "subscribe.faq.q3a.answer":
      "Sí, pero solo en el Plan Empresarial. En esta modalidad, puede activar el modo 'Curso en Vídeo' y añadir enlaces de vídeos alojados en YouTube. El reproductor se muestra directamente dentro de la aplicación, sin abrir un navegador externo y sin salir del entorno de la aplicación.",
    "subscribe.faq.answer3a":
      "Sí, pero solo en el Plan Empresarial. En esta modalidad, puede activar el modo 'Curso en Vídeo' y añadir enlaces de vídeos alojados en YouTube. El reproductor se muestra directamente dentro de la aplicación, sin abrir un navegador externo y sin salir del entorno de la aplicación.",
    "subscribe.faq.question4": "¿El pago de mi cliente ocurre dentro de la app?",
    "subscribe.faq.q4.question": "¿El pago de mi cliente ocurre dentro de la app?",
    "subscribe.faq.q4.answer":
      'No. El pago ocurre en la plataforma de ventas de tu elección (Hotmart, Kiwify, Eduzz, Stripe, etc). Como Migrabook.app tiene integración con las plataformas, después de la compra el sistema envía automáticamente el enlace de la app a tu cliente. Hace clic en \\"Instalar\\" y listo. Simple. Directo. Y fácil.',
    "subscribe.faq.answer4":
      'No. El pago ocurre en la plataforma de ventas de tu elección (Hotmart, Kiwify, Eduzz, Stripe, etc). Como Migrabook.app tiene integración con las plataformas, después de la compra el sistema envía automáticamente el enlace de la app a tu cliente. Hace clic en "Instalar" y listo. Simple. Directo. Y fácil.',
    "subscribe.faq.question5": "¿Puedo poner la app en Play Store o App Store?",
    "subscribe.faq.q5.question": "¿Puedo poner la app en Play Store o App Store?",
    "subscribe.faq.q5.answer":
      "En Play Store pagarías $25. En App Store, $99. Con Migrabook.app, no tienes este costo.",
    "subscribe.faq.answer5": "En Play Store pagarías $25. En App Store, $99. Con Migrabook.app, no tienes este costo.",
    "subscribe.faq.question6": "¿Puedo actualizar el contenido de la app después de publicarla?",
    "subscribe.faq.q6.question": "¿Puedo actualizar el contenido de la app después de publicarla?",
    "subscribe.faq.q6.answer":
      "Sí. Cualquier cambio realizado en el panel (colores, portada, logo, iconos, nombre y contenido actualizado) aparece automáticamente para todos los usuarios, sin reenviar nada a nadie.",
    "subscribe.faq.answer6":
      "Sí. Cualquier cambio realizado en el panel (colores, portada, logo, iconos, nombre y contenido actualizado) aparece automáticamente para todos los usuarios, sin reenviar nada a nadie.",
    "subscribe.faq.q6b.question": "¿Cómo funciona la cancelación?",
    "subscribe.faq.q6b.answer":
      "La cancelación solo detiene las renovaciones futuras. Continúas con acceso hasta el final del período ya pagado.",
    "subscribe.faq.question7": "¿Qué pasa si cancelo mi suscripción de Migrabook.app?",
    "subscribe.faq.q7.question": "¿Qué pasa si cancelo mi suscripción de Migrabook.app?",
    "subscribe.faq.q7.answer":
      "Tu app se desactiva y tus clientes pierden el acceso. Antes de cancelar, recomendamos que guardes tu lista de compradores y definas otro formato de entrega, si deseas mantener el producto disponible para tus clientes.",
    "subscribe.faq.answer7":
      "Tu app se desactiva y tus clientes pierden el acceso. Antes de cancelar, recomendamos que guardes tu lista de compradores y definas otro formato de entrega, si deseas mantener el producto disponible para tus clientes.",
    "subscribe.faq.question8": "¿Necesito saber programar para usar Migrabook.app?",
    "subscribe.faq.q8.question": "¿Necesito saber programar para usar Migrabook.app?",
    "subscribe.faq.q8.answer":
      "No. El sistema es 100% intuitivo. Solo subes el contenido, ajustas lo visual y publicas.",
    "subscribe.faq.answer8": "No. El sistema es 100% intuitivo. Solo subes el contenido, ajustas lo visual y publicas.",
    "subscribe.faq.question9": "¿Cuánto tiempo lleva convertir mi eBook en una app?",
    "subscribe.faq.q9.question": "¿Cuánto tiempo lleva convertir mi eBook en una app?",
    "subscribe.faq.q9.answer":
      "La generación es instantánea. Importas el contenido y ya ves la vista previa de la app de inmediato. Si quieres, puedes publicar en ese mismo instante.",
    "subscribe.faq.answer9":
      "La generación es instantánea. Importas el contenido y ya ves la vista previa de la app de inmediato. Si quieres, puedes publicar en ese mismo instante.",

    // Final CTA Section
    "subscribe.final.main_title": "¿Listo para Transformar tu eBook en una App de Éxito?",
    "subscribe.final.subtitle": "Únete a cientos de autores que ya han llevado su contenido al siguiente nivel.",
    "subscribe.final.button.primary": "Crear Mi App Ahora",
    "subscribe.final.cta.button": "Crear Mi App Ahora",
    "subscribe.final.feature1": "Sin necesidad de programación",
    "subscribe.final.feature2": "Soporte completo",
    "subscribe.final.feature3": "Resultados en minutos",

    // Subscribe Page - Experience Section
    "subscribe.experience.title":
      "Lo que separa a quienes aún venden PDF de quienes construyen un producto real es la experiencia.",
    "subscribe.experience.hero_title":
      "Lo que separa a quienes aún venden PDF de quienes construyen un producto real es la experiencia.",
    "subscribe.experience.subtitle": "¿Listo para salir del modelo antiguo?",
    "subscribe.experience.tagline": "Y la experiencia hoy es una app.",
    "subscribe.experience.cta": "Quiero Migrar Ahora",
    "subscribe.experience.question": "",

    // Progress
    "progress.upload": "Upload",
    "progress.customization": "Personalización",
    "progress.publish": "Publicar",

    // Upload Section
    "upload.title": "Subida de Productos",
    "upload.main": "Producto Principal",
    "upload.main.desc": "PDF o ZIP del producto principal",
    "upload.bonus": "Bono",
    "upload.bonus.desc": "Material adicional (PDF, ZIP)",
    "upload.send": "Enviar",
    "import.title": "Importar App Existente",
    "import.json": "Subir via JSON",
    "import.json.placeholder": "Pega el JSON de la app...",
    "import.id": "Importar por ID",
    "import.id.placeholder": "ID de la app...",
    "import.button": "Importar",

    // Phone Preview
    "preview.title": "Vista Previa de la App",

    // Customization
    "custom.title": "Personalización de la App",
    "custom.name": "Nombre de la App",
    "custom.name.placeholder": "Ingresa el nombre de tu app",
    "custom.color": "Color de la App",
    "custom.theme": "Tema de la App",
    "custom.theme.dark": "Oscuro",
    "custom.theme.light": "Claro",
    "custom.icon": "Ícono de la App",
    "custom.icon.upload": "Subir Ícono",
    "custom.cover": "Portada de la App",
    "custom.cover.upload": "Subir Portada",
    "custom.link": "Enlace Personalizado",
    "custom.link.placeholder": "Tu URL aquí",
    "custom.link.help": "Dejar en blanco para generar URL automática",
    "custom.link.locked": "Vía dominio",
    "custom.link.managed": "El enlace es gestionado a través de tu dominio personalizado. Configura las rutas en el menú Dominio Personalizado.",
    "custom.reset": "Resetear",

    // Phone mockup
    "phone.main.title": "Inserta tu título aquí",
    "phone.main.subtitle": "Descarga ahora y comienza a transformar tus resultados",
    "phone.main.description": "Inserta tu descripción aquí",
    "phone.bonus.title": "Inserta el título de bonos aquí",
    "phone.view": "Ver",
    "phone.access": "Acceder",
    "phone.exclusive_bonus": "Bono exclusivo",
    "phone.view.short": "Ver", // ADICIONAR
    "phone.view.pdf": "Ver PDF", // ADICIONAR
    "phone.default.description": "Descripción de la App", // ADICIONAR
    "phone.image.dimensions": "PNG o JPG 1920x1080", // ADICIONAR
    "phone.home": "Inicio",
    "phone.products": "Productos",

    // Admin Panel
    "admin.title": "Panel Administrativo",
    "admin.subtitle": "Control total de la plataforma",
    "admin.students": "Estudiantes",
    "admin.settings": "Configuraciones",
    "admin.integrations": "Integraciones",
    "admin.apps": "Gestionar Apps",
    "admin.logout": "Salir",
    "admin.preview.title": "Constructor y Vista Previa de Plantillas",
    "admin.preview.subtitle": "Cree plantillas personalizadas y visualice cómo se verá su app",

    // Player Page
    "player.no.video": "Ningún video seleccionado",
    "player.param.help": "Use el parámetro ?v= con el enlace o ID del video de YouTube",
    "player.example": "Ejemplo: /player?v=dQw4w9WgXcQ",

    // Maintenance Page
    "maintenance.title": "En Mantenimiento",
    "maintenance.message": "Nuestro sistema está pasando por una actualización para atenderle mejor.",
    "maintenance.back.soon": "¡Volveremos pronto!",
    "maintenance.thanks": "Gracias por su paciencia. Estamos trabajando para ofrecer una experiencia aún mejor.",

    // Not Found Page
    "notfound.title": "404",
    "notfound.message": "¡Ups! Página no encontrada",
    "notfound.home": "Volver al Inicio",

    // App Viewer
    "appviewer.notfound.title": "App no encontrada",
    "appviewer.notfound.message": "Esta app no existe o ha sido eliminada.",
    "appviewer.notfound.help": "Verifique si el enlace es correcto o contacte con quien compartió esta app.",
    "admin.students.title": "Gestión de Estudiantes",
    "admin.students.subtitle": "Control de acceso y monitoreo de usuarios",
    "admin.students.active": "activos",
    "admin.students.search": "Buscar por email...",
    "admin.students.all": "Todos",
    "admin.students.active.filter": "Activos",
    "admin.students.inactive": "Inactivos",
    "admin.students.email": "Email",
    "admin.students.phone": "Teléfono",
    "admin.students.plan": "Plan",
    "admin.students.apps": "Apps Publicadas",
    "admin.students.status": "Estado",
    "admin.students.created": "Fecha de Registro",
    "admin.students.actions": "Acciones",
    "admin.students.details": "Ver Detalles",
    "admin.settings.title": "Configuraciones del Sistema",
    "admin.settings.subtitle": "Gestionar configuraciones globales de la plataforma",
    "admin.settings.save": "Guardar Configuraciones",
    "admin.settings.language": "Idioma Predeterminado del Sistema",
    "admin.settings.language.placeholder": "Seleccionar idioma",
    "admin.settings.terms": "Términos de Uso",
    "admin.settings.terms.placeholder": "Ingrese los términos de uso de la plataforma...",
    "admin.settings.cancellation": "Mensaje de Cancelación",
    "admin.settings.cancellation.placeholder": "Mensaje mostrado cuando el acceso es cancelado...",
    "admin.settings.cancellation.help": "Este mensaje se mostrará en las apps de usuarios con acceso desactivado",

    // Admin Login
    "admin.login.title": "Panel Admin",
    "admin.login.subtitle": "Acceso exclusivo para administradores",
    "admin.login.email": "Email",
    "admin.login.password": "Contraseña",
    "admin.login.submit": "Entrar",
    "admin.login.loading": "Entrando...",

    // Integrations
    "integrations.title": "Integraciones",
    "integrations.subtitle": "Configurar integraciones con servicios externos",
    "integrations.save": "Guardar Configuraciones",
    "integrations.saving": "Guardando...",
    "integrations.activecampaign.title": "ActiveCampaign",
    "integrations.activecampaign.subtitle": "Automatización de email marketing",
    "integrations.activecampaign.api_url": "API URL",
    "integrations.activecampaign.api_url.placeholder": "https://tu-cuenta.api-us1.com",
    "integrations.activecampaign.api_key": "API Key",
    "integrations.activecampaign.api_key.placeholder": "tu-clave-api",
    "integrations.make.title": "Make",
    "integrations.make.subtitle": "Automatización de procesos",
    "integrations.make.webhook_url": "Webhook URL",
    "integrations.make.webhook_url.placeholder": "https://hook.integromat.com/...",
    "integrations.new_title": "Nueva Integración",
    "integrations.edit_title": "Editar Integración",
    "integrations.new_description": "Conecte su producto de plataformas externas con su app",
    "integrations.edit_description": "Modifique los campos y haga clic en Guardar para actualizar",
    "integrations.platform": "Plataforma",
    "integrations.platform_placeholder": "Seleccione la plataforma",
    "integrations.product_id": "ID del Producto / Oferta",
    "integrations.product_id_placeholder": "Ej: prod_12345 o nombre-oferta",
    "integrations.app_link": "Enlace de Acceso (Email)",
    "integrations.app_link_placeholder": "https://tusitio.com/app o https://migrabook.app/tu-app",
    "integrations.app_link_help": "URL que se enviará en el botón del email. Puede ser tu dominio personalizado o cualquier enlace.",
    "integrations.save_button": "Guardar Integración",
    "integrations.active_title": "Integraciones Activas",
    "integrations.active_count": "{count} integración(es) configurada(s)",
    "integrations.select.language": "Seleccionar idioma",
    "integrations.product.id.placeholder": "Ingrese el ID del Producto aquí",
    "integrations.token.placeholder": "Pegue su token de cuenta aquí",
    "integrations.config.kiwify": "Configuración Kiwify",
    "integrations.config.cartpanda": "Configuración Cart Panda",

    // Toast Messages
    "toast.logout.error.title": "Error de Logout",
    "toast.logout.error.description": "No se pudo cerrar sesión",
    "toast.logout.success.title": "Sesión Cerrada",
    "toast.logout.success.description": "Has cerrado sesión exitosamente",
    "toast.login.error.title": "Error de Login",
    "toast.login.error.description": "Error inesperado. Inténtalo de nuevo.",
    "toast.login.error.invalid_credentials":
      "Correo o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.",
    "toast.login.success.title": "Login Exitoso",
    "toast.login.success.description": "Verificando permisos administrativos...",
    "toast.validation.title": "Datos Inválidos",
    "toast.copy.success.title": "¡Copiado!",
    "toast.copy.success.description": "El enlace ha sido copiado al portapapeles.",
    "toast.copy.error.title": "Error",
    "toast.copy.error.description": "No se pudo copiar el enlace.",
    "toast.save.success.title": "Configuraciones Guardadas",
    "toast.save.success.description": "Las integraciones han sido configuradas exitosamente",
    "toast.error.title": "Error",
    "toast.error.description": "Ocurrió un error inesperado",
    "toast.upload.success.title": "¡Subida exitosa!",
    "toast.upload.success.description": "{fileName} ha sido cargado.",
    "toast.upload.error.title": "Error en la subida",
    "toast.upload.error.description": "No se pudo subir el archivo.",
    "toast.file.invalid.title": "Formato no compatible",
    "toast.file.invalid.description": "Por favor, envíe solo PDFs o MP3s de hasta 100 MB.",
    "toast.file.size.title": "Archivo demasiado grande",
    "toast.file.size.description": "Por favor, envíe solo PDFs o MP3s de hasta 100 MB.",
    "toast.import.success.title": "¡App importada exitosamente!",
    "toast.import.success.description": 'Los datos de la app "{appName}" han sido cargados.',
    "toast.import.error.title": "Error al importar",
    "toast.import.error.description": "No se pudo importar la app. Verifique el ID.",
    "toast.backup.success.title": "¡Backup creado!",
    "toast.backup.success.description": "Archivo JSON descargado exitosamente.",
    "toast.json.import.success.title": "¡JSON importado exitosamente!",
    "toast.json.import.success.description": "Los datos del archivo han sido cargados.",
    "toast.json.error.title": "Error en el JSON",
    "toast.json.error.description": "Archivo JSON inválido o formato incompatible.",
    "toast.feature.unavailable.title": "Recurso no disponible",
    "toast.feature.unavailable.description":
      "Importar apps solo está disponible en los planes Profesional y Empresarial.",

    // === INTEGRATIONS PANEL ===
    // Títulos principales
    "integrations.new.title": "Nueva Integración",
    "integrations.new.description": "Conecta tu plataforma de pagos",
    "integrations.active.title": "Integraciones Activas",
    "integrations.active.count": "integración(es) configurada(s)",

    // Etiquetas comunes
    "integrations.platform.label": "Plataforma",
    "integrations.platform.select": "Selecciona la plataforma",
    "integrations.language.label": "Idioma de la App",
    "integrations.applink.label": "Enlace a la App",
    "integrations.productid.label": "ID del Producto",
    "integrations.webhook.url.label": "🔐 URL para configurar webhook:",
    "integrations.product.label": "Producto:",
    "integrations.validated.badge": "✓ Validado",

    // Botones
    "integrations.button.cancel": "Cancelar",
    "integrations.button.saving": "Guardando...",
    "integrations.button.update": "Actualizar Integración",
    "integrations.button.save": "Guardar Integración",
    "integrations.button.copy.success": "¡URL copiada!",

    // Errores y validaciones generales
    "integrations.error.load": "Error al cargar integraciones",
    "integrations.error.required": "⚠️ Campos obligatorios",
    "integrations.error.required.description": "Rellena todos los campos obligatorios",
    "integrations.error.save": "❌ Error al guardar",
    "integrations.error.delete": "Error al eliminar",
    "integrations.success.delete": "¡Integración eliminada!",
    "integrations.success.save": "✅ ¡Integración guardada!",
    "integrations.success.save.description": "fue configurado con éxito",
    "integrations.success.update": "✅ ¡Integración actualizada!",
    "integrations.success.update.description": "fue actualizado con éxito",
    "integrations.success.validate": "✅ ¡Producto validado!",
    "integrations.success.validate.found": "encontrado en",
    "integrations.error.invalid": "❌ Producto inválido",
    "integrations.error.validation": "Error en la validación",

    // Validaciones específicas - Token
    "integrations.error.token.required": "⚠️ Token obligatorio",

    // Validaciones específicas - Monetizze
    "integrations.error.monetizze.productid.required": "⚠️ Product ID obligatorio",
    "integrations.error.monetizze.productid.required.description": "Por favor, ingresa el Product ID de Monetizze",
    "integrations.error.monetizze.productid.invalid": "⚠️ Product ID inválido",
    "integrations.error.monetizze.productid.invalid.description":
      "El Product ID de Monetizze debe contener solo números",
    "integrations.error.monetizze.key.required": "⚠️ Clave de Webhook obligatoria",
    "integrations.error.monetizze.key.required.description":
      "Por favor, ingresa la Clave de Webhook (postback_key) de Monetizze",
    "integrations.error.monetizze.key.invalid": "⚠️ Clave de Webhook inválida",
    "integrations.error.monetizze.key.invalid.description":
      "La Clave de Webhook debe tener al menos 20 caracteres y no puede contener espacios",

    // Validaciones específicas - Eduzz
    "integrations.error.eduzz.key.required": "⚠️ Eduzz Key obligatoria",
    "integrations.error.eduzz.key.required.description": "Por favor, ingresa la Clave de Webhook (Eduzz Key) de Eduzz",
    "integrations.error.eduzz.key.invalid": "⚠️ Eduzz Key inválida",
    "integrations.error.eduzz.key.invalid.description":
      "La Eduzz Key debe tener al menos 20 caracteres y no puede contener espacios",

    // Validaciones específicas - Hotmart
    "integrations.error.hotmart.credentials.required": "⚠️ Credenciales de Hotmart obligatorias",
    "integrations.error.hotmart.credentials.required.description":
      "Client ID, Client Secret y Basic Token son obligatorios",

    // Validaciones específicas - Stripe
    "integrations.error.stripe.credentials.required": "⚠️ Credenciales de Stripe obligatorias",
    "integrations.error.stripe.credentials.required.description": "API Key y Webhook Token son obligatorios",

    // Validaciones específicas - PayPal
    "integrations.error.paypal.credentials.required": "⚠️ Credenciales de PayPal obligatorias",
    "integrations.error.paypal.credentials.required.description": "Client ID y Secret son obligatorios",

    // Validaciones específicas - Cart Panda
    "integrations.error.cartpanda.credentials.required": "⚠️ Credenciales de Cart Panda obligatorias",
    "integrations.error.cartpanda.credentials.required.description": "Bearer Token y Store Slug son obligatorios",

    // Validaciones específicas - Braip
    "integrations.error.braip.credentials.required": "⚠️ Credenciales de Braip obligatorias",
    "integrations.error.braip.credentials.required.description": "Client ID y Client Secret son obligatorios",

    // Validaciones específicas - Cakto
    "integrations.error.cakto.token.required": "⚠️ Webhook Token obligatorio",
    "integrations.error.cakto.token.required.description": "Ingresa el Token de Webhook de Cakto",

    // === CONFIGURACIONES POR PLATAFORMA ===

    // HOTMART
    "integrations.hotmart.title": "Configuración de Hotmart",
    "integrations.hotmart.clientid.label": "Client ID",
    "integrations.hotmart.clientid.placeholder": "Pega tu Client ID aquí",
    "integrations.hotmart.clientsecret.label": "Client Secret",
    "integrations.hotmart.clientsecret.placeholder": "Pega tu Client Secret aquí",
    "integrations.hotmart.basictoken.label": "Basic Token",
    "integrations.hotmart.basictoken.placeholder": "Pega tu Basic Token aquí",

    // STRIPE
    "integrations.stripe.title": "Configuración de Stripe",
    "integrations.stripe.apikey.label": "Stripe API Key",
    "integrations.stripe.apikey.placeholder": "Pega tu API Key aquí",
    "integrations.stripe.webhooktoken.label": "Webhook Token *",
    "integrations.stripe.webhooktoken.placeholder": "Pega tu Token de Webhook de Stripe aquí",

    // KIWIFY
    "integrations.kiwify.title": "Configuración de Kiwify",
    "integrations.kiwify.apitoken.label": "API Token (Opcional)",
    "integrations.kiwify.apitoken.placeholder": "Pega tu Token de API aquí (obligatorio para validación)",
    "integrations.kiwify.accountid.label": "Account ID *",
    "integrations.kiwify.accountid.placeholder": "Ej: 12345",
    "integrations.kiwify.accountid.help": "ℹ️ Disponible en Configuración → Credenciales",

    // CART PANDA
    "integrations.cartpanda.title": "Configuración de Cart Panda",
    "integrations.cartpanda.productid.label": "ID del Producto",
    "integrations.cartpanda.token.label": "Token",
    "integrations.cartpanda.token.placeholder": "Pega tu Token de API de Cart Panda aquí",
    "integrations.cartpanda.storeslug.label": "Store Slug *",
    "integrations.cartpanda.storeslug.placeholder": "Ej: mitienda",

    // PERFECT PAY
    "integrations.perfectpay.title": "Configuración de Perfect Pay",
    "integrations.perfectpay.productid.label": "ID del Producto",
    "integrations.perfectpay.webhooktoken.label": "Token de Webhook",
    "integrations.perfectpay.webhooktoken.placeholder": "Ingresa tu Token de Webhook aquí",

    // CAKTO
    "integrations.cakto.title": "Configuración de Cakto",
    "integrations.cakto.productid.label": "ID del Producto",
    "integrations.cakto.webhooktoken.label": "Token de Webhook *",
    "integrations.cakto.webhooktoken.placeholder": "Pega tu Token de Webhook de Cakto aquí",

    // BRAIP
    "integrations.braip.title": "Configuración de Braip",
    "integrations.braip.productid.label": "ID del Producto",
    "integrations.braip.clientid.label": "Client ID *",
    "integrations.braip.clientid.placeholder": "Ej: 12345abcde",
    "integrations.braip.clientsecret.label": "Client Secret *",
    "integrations.braip.clientsecret.placeholder": "Pega tu Client Secret de Braip aquí",

    // MONETIZZE
    "integrations.monetizze.title": "Configuración de Monetizze",
    "integrations.monetizze.productid.label": "ID del Producto *",
    "integrations.monetizze.key.label": "Clave de Webhook (Postback Key) *",
    "integrations.monetizze.key.placeholder": "Pega tu Clave de Webhook de Monetizze aquí",
    "integrations.monetizze.key.help": "ℹ️ La clave de webhook es obligatoria para validar las compras",

    // EDUZZ
    "integrations.eduzz.title": "Configuración de Eduzz",
    "integrations.eduzz.productid.label": "ID del Producto *",
    "integrations.eduzz.key.label": "Clave de Webhook (Eduzz Key) *",
    "integrations.eduzz.key.placeholder": "Pega tu Clave de Webhook de Eduzz aquí",
    "integrations.eduzz.key.help": "ℹ️ La clave de webhook es obligatoria para validar las compras",

    // PAYPAL
    "integrations.paypal.title": "Configuración de PayPal",
    "integrations.paypal.clientid.label": "Client ID *",
    "integrations.paypal.clientid.placeholder": "Ej: AYSq3RDGsmBLJE-otTkBtM-j...",
    "integrations.paypal.secret.label": "Secret *",
    "integrations.paypal.secret.placeholder": "Pega tu Secret de PayPal aquí",

    // === INSTRUCCIONES HOTMART ===
    "integrations.hotmart.instructions.title": "✅ ¡Integración de Hotmart Guardada!",
    "integrations.hotmart.instructions.laststep": "Último paso:",
    "integrations.hotmart.instructions.description":
      "Configura el Webhook en Hotmart para recibir notificaciones de compra y enviar el correo de acceso automáticamente.",
    "integrations.hotmart.instructions.steps.title": "📝 Paso a paso:",
    "integrations.hotmart.instructions.step1": "1. Accede al panel de Hotmart",
    "integrations.hotmart.instructions.step1.link": "Abrir Hotmart",
    "integrations.hotmart.instructions.step2": "2. Configura el Webhook:",
    "integrations.hotmart.instructions.step2.item1": "Ve a",
    "integrations.hotmart.instructions.step2.item1.bold": "Herramientas > Webhook",
    "integrations.hotmart.instructions.step2.item2": "Agrega la URL del Webhook (copia abajo)",
    "integrations.hotmart.instructions.step2.item3": "Marca el evento:",
    "integrations.hotmart.instructions.step2.item3.bold": "Compra Aprobada",
    "integrations.hotmart.instructions.step2.item4": "Guarda la configuración",
    "integrations.hotmart.instructions.webhook.label": "📋 URL del Webhook (copia abajo):",

    // === INSTRUCCIONES MONETIZZE ===
    "integrations.monetizze.instructions.title": "⚠️ Monetizze será validado en la primera compra",
    "integrations.monetizze.instructions.description1":
      "Como Monetizze no tiene API de validación previa, el sistema verificará:",
    "integrations.monetizze.instructions.check1": "Si el Product ID corresponde al producto",
    "integrations.monetizze.instructions.check2": "Si el Postback Key es válido",
    "integrations.monetizze.instructions.description2":
      "Esto sucederá automáticamente cuando llegue la primera compra vía webhook.",
    "integrations.monetizze.instructions.steps.title": "📝 Cómo configurar el Webhook en Monetizze:",
    "integrations.monetizze.instructions.step1": "1. Accede al panel de Monetizze",
    "integrations.monetizze.instructions.step1.link": "Abrir Monetizze",
    "integrations.monetizze.instructions.step2": "2. Configura el Postback:",
    "integrations.monetizze.instructions.step2.item1": "Ve a",
    "integrations.monetizze.instructions.step2.item1.bold": "Producto > Postback > Estado",
    "integrations.monetizze.instructions.step2.item2": "En la opción",
    "integrations.monetizze.instructions.step2.item2.bold": "Finalizada (compra aprobada)",
    "integrations.monetizze.instructions.step2.item2.after": ", agrega la URL del Webhook abajo",
    "integrations.monetizze.instructions.step2.item3": "Guarda la configuración",
    "integrations.monetizze.instructions.webhook.label": "📋 URL del Webhook (copia abajo):",

    // === INSTRUCCIONES EDUZZ ===
    "integrations.eduzz.instructions.title": "⚠️ Eduzz será validado en la primera compra",
    "integrations.eduzz.instructions.description1":
      "Como Eduzz no tiene API de validación previa, el sistema verificará:",
    "integrations.eduzz.instructions.check1": "Si el Product ID corresponde al producto",
    "integrations.eduzz.instructions.check2": "Si el Eduzz Key es válido",
    "integrations.eduzz.instructions.description2":
      "Esto sucederá automáticamente cuando llegue la primera compra vía webhook.",
    "integrations.eduzz.instructions.steps.title": "📝 Cómo configurar el Webhook en Eduzz:",
    "integrations.eduzz.instructions.step1": "1. Accede al panel de Eduzz",
    "integrations.eduzz.instructions.step1.link": "Abrir Eduzz",
    "integrations.eduzz.instructions.step2": "2. Configura el Webhook:",
    "integrations.eduzz.instructions.step2.item1": "Ve a",
    "integrations.eduzz.instructions.step2.item1.bold": "Contenido > Webhook",
    "integrations.eduzz.instructions.step2.item2": "Agrega la URL del Webhook (copia abajo)",
    "integrations.eduzz.instructions.step2.item3": "Marca los eventos de:",
    "integrations.eduzz.instructions.step2.item3.bold": "Venta y Cancelación",
    "integrations.eduzz.instructions.step2.item4": "Guarda la configuración",
    "integrations.eduzz.instructions.webhook.label": "📋 URL del Webhook (copia abajo):",
    "integrations.eduzz.instructions.tip":
      "💡 Consejo: Haz una compra de prueba o usa Postman para simular una compra y verificar si el webhook está funcionando correctamente.",

    // Customization - Tabs
    "custom.tabs.general": "General",
    "custom.tabs.labels": "Textos y Etiquetas",

    // Customization - Form Labels
    "custom.description": "Descripción de la App",
    "custom.description.placeholder": "Descripción que aparece en la app...",
    "custom.domain": "Dominio Propio",
    "custom.main.title": "Título del Producto Principal",
    "custom.main.description": "Descripción del Producto Principal",
    "custom.bonuses.title": "Título de la Sección de Bonos",
    "custom.bonus.name": "Bono",
    "custom.bonus.colors": "Colores de los Bonos",
    "custom.view.button": "Texto del Botón Ver",
    "custom.view.button.help": "Personaliza el texto mostrado en el botón de visualización de productos",
    "custom.view.button.placeholder": "Ingrese el texto del botón 'ver'",
    "custom.bonus.thumbnail.alt": "Miniatura de Bono",

    // WhatsApp
    "whatsapp.title": "WhatsApp de la App",
    "whatsapp.description": "Configura el botón de WhatsApp que aparecerá en tu app",
    "whatsapp.enable": "Activar WhatsApp",
    "whatsapp.phone": "Número de WhatsApp",
    "whatsapp.phone_placeholder": "Ej: 5511999999999 (con código de país)",
    "whatsapp.message": "Mensaje predeterminado",
    "whatsapp.message_placeholder": "¡Hola! Vine a través de la app.",
    "whatsapp.button_text": "Texto del botón",
    "whatsapp.button_text_default": "Contáctanos",
    "whatsapp.button_text_placeholder": "Ej: Contáctanos",
    "whatsapp.button_color": "Color del botón",
    "whatsapp.position": "Posición del botón",
    "whatsapp.position_right": "Inferior derecha",
    "whatsapp.position_left": "Inferior izquierda",
    "whatsapp.show_text": "Mostrar texto en el botón al pasar el mouse",
    "whatsapp.default_message": "¡Hola! Vine a través de la app y me gustaría más información.",
    "whatsapp.icon_size": "Tamaño del Ícono",
    "whatsapp.size_small": "Pequeño",
    "whatsapp.size_medium": "Mediano",
    "whatsapp.size_large": "Grande",

    // Import Section
    "import.select.json": "Seleccione el JSON de la app",
    "import.select.file": "Seleccionar archivo JSON",
    "import.backup": "Backup",
    "import.tooltip":
      "Importe datos de una app creada previamente usando JSON o ID de la app. Disponible solo en planes Profesional y Empresarial.",
    "import.premium.required": "Importar app está disponible solo en planes Profesional y Empresarial.",

    // Premium Overlays
    "premium.import.title": "Importación de Apps",
    "premium.import.description": "Importe datos de apps existentes usando JSON o ID",
    "premium.notifications.title": "Notificaciones en la App",
    "premium.notifications.description": "Envíe notificaciones personalizadas dentro de su app",
    "premium.videoCourse.title": "Curso en Video",
    "premium.videoCourse.description": "Agregue módulos de curso y lecciones de YouTube a su app",
    "premium.templates.upgrade": "Plan Empresarial →",
    "premium.templates.message": "Actualiza para acceder a templates premium",
    "premium.plan.profissional": "Plan Profesional",
    "premium.plan.empresarial": "Plan Empresarial",
    "premium.exclusive.empresarial": "Recurso exclusivo del Plan Empresarial",
    "premium.integrations.title": "Integraciones de Plataformas",
    "premium.integrations.description": "Conecta automáticamente tus plataformas de venta",

    // Template Descriptions
    "template.classic.description": "Layout predeterminado limpio y elegante",
    "template.corporate.description": "Layout profesional para empresas",
    "template.showcase.description": "Layout moderno para destaque visual",
    "template.modern.description": "Diseño contemporáneo y minimalista",
    "template.minimal.description": "Interfaz limpia enfocada en el contenido",
    "template.exclusive.description": "Layout premium con tarjetas coloridas e imágenes circulares",

    // Premium Overlay CTA
    "premium.cta.arrow": "→",

    // Upload Section
    "upload.pdf.description": "Subir PDF o Audio",
    "upload.bonus.description": "Subir PDF o Audio",
    "upload.uploading": "Subiendo...",
    "upload.uploaded": "Subido",
    "upload.allow.download": "Permitir descarga del PDF",

    // Publish Section
    "publish.ready": "¿Listo para publicar?",
    "publish.subtitle": "¡Publica tu app y compártela con el mundo!",
    "publish.plan": "Plan",
    "publish.apps": "apps",
    "publish.publishing": "Publicando...",
    "publish.checking": "Verificando límite...",
    "publish.republish": "Publicar Nuevamente",
    "publish.button": "Publicar App",
    "publish.saving": "Guardando borrador...",
    "publish.review.title": "Revisar App Antes de Publicar",
    "publish.review.subtitle": "Verifica toda la información antes de publicar tu app.",
    "publish.info.title": "Información de la App",
    "publish.info.name": "Nombre:",
    "publish.info.description": "Descripción:",
    "publish.info.color": "Color:",
    "publish.info.link": "Enlace personalizado:",
    "publish.info.undefined": "No definido",
    "publish.products.title": "Productos Cargados",
    "publish.products.main": "Producto Principal:",
    "publish.products.bonus": "Bono",
    "publish.products.loaded": "Cargado",
    "publish.products.notloaded": "No cargado",
    "publish.products.optional": "Opcional",
    "publish.visual.title": "Recursos Visuales",
    "publish.visual.icon": "Ícono de la App:",
    "publish.visual.cover": "Portada de la App:",
    "publish.back": "Volver y Editar",
    "publish.confirm": "Confirmar y Publicar",
    "publish.success.title": "¡App Publicada con Éxito!",
    "publish.success.subtitle": "Tu app está ahora disponible y puede instalarse como PWA.",
    "publish.success.link": "Enlace de tu app:",
    "publish.success.steps": "🎉 Próximos pasos:",
    "publish.success.share": "Comparte el enlace con tus clientes",
    "publish.success.pwa": "La app puede instalarse como PWA",
    "publish.success.track": "Revisa tus aplicaciones en el panel",
    "publish.limit.title": "Límite de Apps Alcanzado",
    "publish.limit.subtitle": "Has alcanzado el límite de",
    "publish.limit.description": "Para crear más apps, necesitas actualizar tu plan.",
    "publish.limit.upgrade": "Actualizar Plan",

    // Custom Domain Dialog
    "domain.title": "Dominio Personalizado",
    "domain.button": "Configurar dominio personalizado",
    "domain.description": "Configure su propio dominio para transmitir más profesionalismo",
    "domain.step": "Paso",
    "domain.of": "de",
    "domain.back": "Volver",
    "domain.continue": "Continuar",

    // Step 1
    "domain.step1.title": "Usar un dominio personalizado",
    "domain.step1.subtitle": "Transmita profesionalismo con un dominio personalizado",
    "domain.step1.own_domain": "Use su propio dominio",
    "domain.step1.connect": "Conecte su dominio de terceros",
    "domain.step1.dns_info": "Necesita iniciar sesión en su proveedor de dominio para actualizar sus registros DNS.",
    "domain.step1.no_changes":
      "No podemos hacer estos cambios por usted, pero podemos ayudarle con una guía paso a paso.",
    "domain.step1.view_steps": "Ver los pasos",

    // Step 2
    "domain.step2.title": "Use su propio dominio",
    "domain.step2.subtitle": "¿Tiene un dominio de otro proveedor? Conecte ese dominio.",
    "domain.step2.placeholder": "Ej.: example.com",
    "domain.step2.verifying": "Verificando dominio...",
    "domain.step2.auto_available": "Conexión automática disponible",
    "domain.step2.manual_needed": "Dominio válido - configuración manual necesaria",
    "domain.step2.invalid": "Dominio inválido",
    "domain.step2.provider_detected": "Proveedor detectado:",
    "domain.step2.auto_message": "✨ Conexión automática disponible vía {provider}",
    "domain.step2.manual_message": "✅ Dominio válido - configuración manual necesaria",
    "domain.step2.instructions": "Se proporcionarán instrucciones específicas para {provider}",
    "domain.step2.verifying_button": "Verificando...",

    // Step 3
    "domain.step3.title": "Conectar automáticamente",
    "domain.step3.subtitle":
      "Detectamos que {domain} usa {provider}. Podemos conectar automáticamente usando la API de {provider}.",
    "domain.step3.info_title": "Información del dominio:",
    "domain.step3.provider": "Proveedor:",
    "domain.step3.nameservers": "Nameservers:",
    "domain.step3.confidence": "Confianza:",
    "domain.step3.confidence_high": "Alta",
    "domain.step3.confidence_medium": "Media",
    "domain.step3.confidence_low": "Baja",
    "domain.step3.auto_connect": "Conectar automáticamente",
    "domain.step3.connecting": "Conectando...",
    "domain.step3.manual_option": "Configurar manualmente",

    // Step 4
    "domain.step4.title": "Acceda al sitio de su proveedor de dominio",
    "domain.step4.subtitle": "En la página de configuración de DNS, actualice sus registros siguiendo estos pasos.",
    "domain.step4.verified_success": "¡Dominio verificado con éxito!",
    "domain.step4.verification_pending": "Verificación pendiente",
    "domain.step4.a_record": "Registro A:",
    "domain.step4.txt_record": "Registro TXT:",
    "domain.step4.found": "Encontrado",
    "domain.step4.not_found": "No encontrado",
    "domain.step4.add_a_record": "Agregar registro A",
    "domain.step4.host": "Nombre/host:",
    "domain.step4.value": "Valor/Apunta a:",
    "domain.step4.copy": "Copiar",
    "domain.step4.copied": "¡Copiado!",
    "domain.step4.record_added": "Registro agregado",
    "domain.step4.mark_added": "Marcar como agregado",
    "domain.step4.subdomain_record": "Registro A para subdominio",
    "domain.step4.subdomain_help": "Permite que www.{domain} también funcione",
    "domain.step4.txt_title": "Registro TXT para verificar titularidad",
    "domain.step4.txt_help": "Usado para verificar que usted es el propietario del dominio",
    "domain.step4.verify_records": "Verificar Registros DNS",
    "domain.step4.verifying": "Verificando...",
    "domain.step4.help_title": "¿Necesita ayuda?",
    "domain.step4.help_description":
      "Si no sabe cómo agregar registros DNS, consulte la documentación de su proveedor:",
    "domain.step4.help_link": "Ver guía completa de DNS",

    // Toast messages
    "domain.toast.verified.title": "¡Dominio verificado!",
    "domain.toast.verified.description": "Su dominio fue configurado con éxito",
    "domain.toast.pending.title": "Verificación pendiente",
    "domain.toast.pending.description": "Configure los registros DNS e intente nuevamente",
    "domain.toast.error.title": "Error en la verificación",
    "domain.toast.error.description": "No se pudo verificar el dominio",

    // Common
    "common.loading": "Cargando...",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.close": "Cerrar",
    "common.try_again": "Intentar de nuevo",
    "common.edit": "Editar",
    "common.delete": "Eliminar",
    "common.view": "Ver",
    "common.download": "Descargar",
    "common.upload": "Subir",
    "common.active": "Activo",
    "common.inactive": "Inactivo",
    "common.yes": "Sí",
    "common.no": "No",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.all": "Todos",
    "common.continue": "Continuar",
    "common.back": "Volver",

    // Cancellation Dialog
    "cancellation.step1.title": "Cancelar Suscripción",
    "cancellation.step1.description": "¡Te extrañaremos! Ayúdanos a mejorar compartiendo el motivo de la cancelación.",
    "cancellation.reason.label": "Motivo de la cancelación",
    "cancellation.reason.placeholder": "Selecciona un motivo",
    "cancellation.reason.not_using": "No voy a continuar con mi proyecto",
    "cancellation.reason.pause_project": "Voy a hacer una pausa, pero planeo volver",
    "cancellation.reason.project_finished": "Era un proyecto puntual que ya está completo",
    "cancellation.reason.too_expensive": "El precio se volvió muy caro para mí",
    "cancellation.reason.not_adapted": "No pude adaptarme a la herramienta",
    "cancellation.reason.other": "Otros",
    "cancellation.feedback.label": "¿Hicimos algo mal? Cuéntanos qué pasó para que podamos mejorar",
    "cancellation.feedback.placeholder": "Cuéntanos más sobre tu experiencia...",
    "cancellation.step2.title": "Antes de irte, lee esto...",
    "cancellation.step2.message1":
      "Es una pena que no quieras continuar con MigraBook. Noté que todavía tienes acceso activo, ¿verdad? Si necesitas unos días más para probar o alguna ayuda específica, ¡seguramente podemos ayudarte!",
    "cancellation.step2.benefits_title": "Además, manteniendo tu cuenta activa:",
    "cancellation.step2.benefit1": "No perderás tu historial de apps creadas",
    "cancellation.step2.benefit2": "Seguirás recibiendo actualizaciones y nuevas funciones",
    "cancellation.step2.benefit3": "Puedes volver cuando quieras sin tener que configurar todo de nuevo",
    "cancellation.step2.message2":
      "Si lo prefieres, ¡podemos contactarte para resolver esto antes de que decidas cancelar! ¿Qué prefieres?",
    "cancellation.step2.keep_subscription": "¡No, quiero quedarme!",
    "cancellation.step2.confirm_cancel": "Sí, cancelar",
    "cancellation.step3.title": "Cancelación Programada",
    "cancellation.step3.access_until": "Tu acceso permanece activo hasta:",
    "cancellation.step3.reactivate_message":
      "¿Cambiaste de opinión? Puedes reactivar tu suscripción en cualquier momento antes de la fecha de expiración.",
    "cancellation.step3.reactivate_button": "Reactivar Suscripción",

    // Privacy Policy
    "privacy.back": "Volver",
    "privacy.title": "Política de Privacidad — Migrabook.app",
    "privacy.last_updated": "Última actualización",

    "privacy.section1.title": "1. INFORMACIÓN QUE RECOPILAMOS",
    "privacy.section1.intro":
      "Recopilamos únicamente la información necesaria para el funcionamiento de la plataforma y para garantizar una buena experiencia de uso. Esta información incluye:",
    "privacy.section1.item1": "Datos de registro: nombre, correo electrónico, teléfono y contraseña de acceso.",
    "privacy.section1.item2": "Datos de pago y facturación, cuando sea aplicable.",
    "privacy.section1.item3":
      "Datos técnicos: dirección IP, tipo y versión del navegador, idioma, dispositivo utilizado y fecha de acceso.",
    "privacy.section1.item4": "Información de uso: número de apps creadas, publicaciones y preferencias guardadas.",
    "privacy.section1.footer":
      "Estos datos se utilizan de forma segura y confidencial, con acceso restringido únicamente al equipo autorizado de Migrabook.app.",

    "privacy.section2.title": "2. CÓMO USAMOS SU INFORMACIÓN",
    "privacy.section2.intro": "La información recopilada se utiliza para:",
    "privacy.section2.item1": "Crear y mantener su cuenta activa en Migrabook.app;",
    "privacy.section2.item2": "Procesar pagos y gestionar suscripciones;",
    "privacy.section2.item3":
      "Enviar notificaciones transaccionales, como recordatorios de renovación de plan, avisos de soporte técnico y cambios importantes en los servicios;",
    "privacy.section2.item4": "Mejorar la seguridad, estabilidad y rendimiento de la plataforma;",
    "privacy.section2.item5": "Ofrecer soporte y atención cuando se solicite.",
    "privacy.section2.footer":
      "Migrabook.app no utiliza sus datos para publicidad de terceros ni realiza venta o intercambio de información personal.",

    "privacy.section3.title": "3. COMPARTIR INFORMACIÓN",
    "privacy.section3.intro":
      "Podemos compartir información con proveedores de servicios de pago, como Stripe, PayPal, Hotmart, Kiwify, Eduzz y similares, exclusivamente para procesar transacciones realizadas por usted. Este intercambio es limitado, seguro y se realiza solo cuando es necesario para la ejecución del servicio contratado.",
    "privacy.section3.item1": "No compartimos sus datos con terceros con fines comerciales, de marketing o publicidad.",
    "privacy.section3.item2":
      "El intercambio ocurre solo con: proveedores de servicios necesarios, autoridades legales cuando lo exija la ley, o con su consentimiento explícito.",
    "privacy.section3.footer": "",

    "privacy.section4.title": "4. SEGURIDAD DE LA INFORMACIÓN",
    "privacy.section4.content":
      "Adoptamos medidas técnicas y administrativas adecuadas para proteger su información contra acceso no autorizado, pérdida, uso indebido, alteración o destrucción. Todo el tráfico de datos está cifrado y los servidores siguen estándares internacionales de seguridad. A pesar de esto, ningún sistema es 100% inmune a riesgos, y el usuario también es responsable de mantener la confidencialidad de sus credenciales de acceso.",

    "privacy.section5.title": "5. RETENCIÓN Y ELIMINACIÓN DE DATOS",
    "privacy.section5.intro":
      "Sus datos se mantendrán mientras su cuenta esté activa. Si decide cerrar su cuenta, la información personal se eliminará de nuestros sistemas, excepto cuando exista obligación legal de retención, como registros fiscales y contables.",
    "privacy.section5.content":
      "Puede solicitar la eliminación de sus datos en cualquier momento a través del soporte oficial.",

    "privacy.section6.title": "6. COOKIES Y DATOS DE NAVEGACIÓN",
    "privacy.section6.intro": "Migrabook.app puede utilizar cookies y tecnologías similares para:",
    "privacy.section6.item1": "Recordar sus preferencias de inicio de sesión;",
    "privacy.section6.item2": "Optimizar la navegación y el rendimiento del sitio;",
    "privacy.section6.item3": "Recopilar información agregada para análisis de uso.",
    "privacy.section6.footer":
      "Puede desactivar las cookies en la configuración de su navegador, pero esto puede limitar algunas funcionalidades de la plataforma.",

    "privacy.section7.title": "7. DERECHOS DEL USUARIO",
    "privacy.section7.intro":
      "De acuerdo con la Ley General de Protección de Datos (Ley n.º 13.709/2018), el usuario puede:",
    "privacy.section7.item1": "Acceder y corregir su información;",
    "privacy.section7.item2": "Solicitar la eliminación de datos personales;",
    "privacy.section7.item3": "Revocar el consentimiento para el uso de datos;",
    "privacy.section7.item4": "Solicitar información sobre el uso y el intercambio de sus datos;",
    "privacy.section7.item5": "Solicitar la portabilidad de sus datos.",
    "privacy.section7.footer":
      "Estas solicitudes se pueden realizar directamente a través del canal de soporte: suporte@migrabook.app",

    "privacy.section8.title": "8. CONTENIDO PUBLICADO POR LOS USUARIOS",
    "privacy.section8.intro":
      "Migrabook.app actúa únicamente como herramienta de creación y alojamiento de aplicaciones. Todo el contenido insertado, publicado o compartido dentro de las apps creadas es responsabilidad exclusiva del usuario.",
    "privacy.section8.content":
      "Migrabook.app no realiza curación, revisión o validación previa del material publicado por los clientes.",

    "privacy.section9.title": "9. CANCELACIÓN Y NO REEMBOLSO",
    "privacy.section9.content":
      "Los planes se cobran mensual o anualmente, según la modalidad elegida. El plan Esencial ofrece 7 días de prueba gratuita sin cargo. Después de este período, el cobro se inicia automáticamente, salvo cancelación dentro del plazo de prueba. En caso de cancelación después del cobro, no hay reembolso proporcional, pero el usuario podrá continuar accediendo al sistema hasta el final del ciclo ya pagado.",

    "privacy.section10.title": "10. CAMBIOS EN ESTA POLÍTICA",
    "privacy.section10.content":
      "Esta Política de Privacidad puede actualizarse en cualquier momento para reflejar cambios legales, técnicos u operativos. La fecha de la última actualización siempre se indicará al principio de este documento. Se recomienda revisar esta política periódicamente.",

    "privacy.section11.title": "11. CONTACTO",
    "privacy.section11.content":
      "En caso de dudas, solicitudes o reclamos sobre esta Política de Privacidad, contáctenos a través de:",
    "privacy.section11.email": "Correo electrónico: suporte@migrabook.app",
    "privacy.section11.website": "Sitio web: https://migrabook.app",

    "privacy.section12.title": "12. LEY APLICABLE Y JURISDICCIÓN",
    "privacy.section12.content":
      "Esta Política se rige por las leyes de la República Federativa del Brasil. Se elige la jurisdicción de la Comarca de São Bernardo do Campo, Estado de São Paulo, para resolver cualquier controversia, con renuncia expresa de cualquier otra, por más privilegiada que sea.",

    // Terms of Service
    "terms.back": "Volver",
    "terms.title": "Términos de Uso — Migrabook.app",
    "terms.last_updated": "Última actualización",
    "terms.intro":
      "Bienvenido a Migrabook.app. Al acceder o utilizar nuestra plataforma, usted acepta los términos y condiciones descritos a continuación. Recomendamos la lectura atenta de este documento antes de crear una cuenta.",

    "terms.section1.title": "1. ACERCA DE MIGRABOOK.APP",
    "terms.section1.content":
      "Migrabook.app es una plataforma en línea que permite la creación y personalización de aplicaciones basadas en tecnología PWA (Progressive Web App). Está destinada a productores digitales, infoproductores y emprendedores que desean entregar sus contenidos digitales (como eBooks, cursos, guías y materiales informativos) en formato de aplicación, sin necesidad de programar.",

    "terms.section2.title": "2. CUENTA Y ACCESO",
    "terms.section2.intro":
      "Para utilizar Migrabook.app, es necesario crear una cuenta con información verdadera y actualizada. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades realizadas bajo su cuenta.",
    "terms.section2.requirement": "El uso de la plataforma es personal e intransferible.",

    "terms.section3.title": "3. PLANES, COBROS Y CANCELACIONES",
    "terms.section3.intro":
      "Migrabook.app ofrece planes mensuales y anuales, con precios y recursos específicos (Esencial, Profesional y Empresarial). Los precios y condiciones pueden actualizarse en cualquier momento, con aviso previo en el panel del usuario.",
    "terms.section3.cancellation.title": "3.1 Cancelación",
    "terms.section3.cancellation.content":
      "La cancelación de la suscripción se puede realizar en cualquier momento, directamente desde el panel del usuario o contactando al soporte. Al cancelar, el acceso a las aplicaciones creadas se suspenderá al final del ciclo ya pagado (mensual o anual). No hay reembolso proporcional de períodos no utilizados.",

    "terms.section4.title": "4. CONTENIDO Y RESPONSABILIDAD DEL USUARIO",
    "terms.section4.intro":
      "El usuario es el único responsable de todo el contenido enviado, publicado o distribuido a través de Migrabook.app — incluyendo textos, imágenes, videos, archivos PDF y otros materiales.",
    "terms.section4.declaration.intro": "Al utilizar la plataforma, el usuario declara que:",
    "terms.section4.declaration.item1": "Posee los derechos de autor o autorización para usar el contenido publicado;",
    "terms.section4.declaration.item2":
      "El contenido no infringe derechos de terceros, marcas registradas o propiedad intelectual;",
    "terms.section4.declaration.item3":
      "El contenido no contiene material ofensivo, difamatorio, ilegal o que viole las leyes vigentes.",
    "terms.section4.rights":
      "Migrabook.app se reserva el derecho de suspender o eliminar aplicaciones que violen estas condiciones.",

    "terms.section5.title": "5. LIMITACIÓN DE RESPONSABILIDAD",
    "terms.section5.intro":
      "Migrabook.app actúa exclusivamente como herramienta de creación y alojamiento de aplicaciones.",
    "terms.section5.not_responsible.intro": "No nos responsabilizamos por:",
    "terms.section5.not_responsible.item1": "Disputas entre el usuario y sus clientes finales;",
    "terms.section5.not_responsible.item2":
      "Reembolsos, bloqueos de cuenta o fallas en plataformas de pago externas (como Hotmart, Kiwify, Eduzz, Stripe, PayPal o similares);",
    "terms.section5.not_responsible.item3": "Problemas causados por contenido insertado por el usuario;",
    "terms.section5.not_responsible.item4":
      "Cualesquiera daños indirectos, lucro cesante o perjuicios derivados del uso incorrecto de la plataforma.",

    "terms.section6.title": "6. DISPONIBILIDAD Y ACTUALIZACIONES",
    "terms.section6.content":
      "La plataforma podrá pasar por actualizaciones y mejoras continuas. Nos comprometemos a mantener el servicio disponible, salvo en casos de mantenimiento programado, fuerza mayor o factores externos fuera de nuestro control.",

    "terms.section7.title": "7. CANCELACIÓN O SUSPENSIÓN POR PARTE DE MIGRABOOK.APP",
    "terms.section7.intro": "Podemos suspender o terminar el acceso del usuario en casos de:",
    "terms.section7.item1": "Violación de los Términos de Uso;",
    "terms.section7.item2": "Prácticas fraudulentas o uso indebido de la plataforma;",
    "terms.section7.item3": "Retraso recurrente en los pagos;",
    "terms.section7.item4": "Uso que pueda comprometer la seguridad o estabilidad del sistema.",

    "terms.section8.title": "8. PROPIEDAD INTELECTUAL",
    "terms.section8.content":
      "Todo el diseño, código, estructura y tecnología de Migrabook.app pertenecen exclusivamente a D. Piola dos Santos Negócios Digitais LTDA. Está prohibido copiar, modificar, redistribuir o crear servicios derivados de la plataforma sin autorización expresa. Las aplicaciones creadas por los usuarios permanecen de su titularidad, respetando los derechos sobre el contenido insertado.",

    "terms.section9.title": "9. SOPORTE Y COMUNICACIÓN",
    "terms.section9.content":
      "El soporte se ofrece por correo electrónico y, en los planes elegibles, vía WhatsApp. Los canales oficiales de atención se informan dentro del panel del usuario.",

    "terms.section10.title": "10. CAMBIOS EN LOS TÉRMINOS",
    "terms.section10.content":
      "Migrabook.app puede actualizar estos Términos de Uso periódicamente. Los cambios relevantes serán comunicados a los usuarios por correo electrónico o aviso dentro de la plataforma. El uso continuo después de la actualización implica aceptación de las nuevas condiciones.",

    "terms.section11.title": "11. LEY APLICABLE Y JURISDICCIÓN",
    "terms.section11.content":
      "Este contrato se rige por las leyes de la República Federativa del Brasil. Se elige la jurisdicción de la Comarca de São Bernardo do Campo, Estado de São Paulo, para resolver eventuales controversias, con renuncia de cualquier otra, por más privilegiada que sea.",

    "terms.section12.title": "12. CONTACTO",
    "terms.section12.intro": "En caso de dudas sobre estos Términos de Uso, contáctenos por correo electrónico:",
    "terms.section12.email": "📩 suporte@migrabook.app",

    // Validation
    "validation.email.invalid": "Email inválido",
    "validation.password.min": "La contraseña debe tener al menos 6 caracteres",
    "validation.required": "Este campo es obligatorio",
    "validation.file.too_big": "Archivo demasiado grande",
    "validation.image.too_big": "La imagen debe tener máximo 10MB",
    "validation.pdf.too_big": "El PDF o MP3 debe tener máximo 100MB",
    "validation.file.invalid_type": "Tipo de archivo no soportado. Use PDF, MP3 o imágenes PNG/JPG.",
    "validation.file.generic": "Error en la validación del archivo",

    // Status Messages
    "status.checking_permissions": "Verificando permisos...",
    "status.loading_data": "Cargando datos...",
    "status.saving": "Guardando...",
    "status.uploading": "Subiendo...",

    // Auth Form
    "auth.full_name": "Nombre Completo",
    "auth.full_name.placeholder": "Tu nombre completo",
    "auth.email": "Email",
    "auth.email.placeholder": "tu@email.com",
    "auth.phone": "Teléfono",
    "auth.phone.placeholder": "Ingresa tu teléfono",
    "auth.password": "Contraseña",
    "auth.password.placeholder": "••••••••",
    "auth.login.title": "Inicia sesión en tu cuenta",
    "auth.login.subtitle": "Entra para acceder a tus apps",
    "auth.signup.title": "Crea tu cuenta",
    "auth.signup.subtitle": "Comienza a crear tus apps ahora mismo",
    "auth.login.button": "Iniciar Sesión",
    "auth.signup.button": "Crear Cuenta",
    "auth.login.loading": "Iniciando sesión...",
    "auth.signup.loading": "Creando cuenta...",
    "auth.app.subtitle": "Convierte tu ebook en app en minutos",
    "auth.terms.text": "Al crear una cuenta, aceptas nuestros",
    "auth.terms.link": "Términos de Uso",
    "auth.terms.and": "y",
    "auth.privacy.link": "Política de Privacidad",
    "auth.forgot_password": "¿Olvidaste tu contraseña?",
    "auth.forgot_password.title": "Recuperar Contraseña",
    "auth.forgot_password.description": "Ingresa tu correo para recibir un enlace de recuperación",
    "auth.forgot_password.email.placeholder": "Ingresa tu correo",
    "auth.forgot_password.send": "Enviar Enlace",
    "auth.forgot_password.sending": "Enviando...",
    "auth.forgot_password.success.title": "¡Correo enviado!",
    "auth.forgot_password.success.description": "Revisa tu bandeja de entrada para recuperar tu contraseña",
    "auth.forgot_password.error.title": "Error al enviar",
    "auth.forgot_password.error.description": "No se pudo enviar el correo. Intenta nuevamente.",
    "auth.no_account": "¿No tienes una cuenta?",
    "auth.create_account": "Suscríbete a un Plan.",

    // Pricing Page
    "pricing.title": "Planes y Precios",
    "pricing.subtitle": "Selecciona un plan para continuar.",
    "pricing.free_trial_button": "Prueba gratis por 7 días",
    "pricing.billing.monthly": "Mensual",
    "pricing.billing.annual": "Anual",
    "pricing.billing.save": "2 meses gratis",
    "pricing.billing.year": "año",
    "pricing.billing.month": "mes",
    "pricing.billing.equivalent": "Equivale a",
    "pricing.popular": "Recomendado",
    "pricing.plan.essencial": "Esencial",
    "pricing.plan.essencial.name": "Esencial",
    "pricing.plan.profissional": "Profesional",
    "pricing.plan.profissional.name": "Profesional",
    "pricing.plan.empresarial": "Empresarial",
    "pricing.plan.empresarial.name": "Empresarial",
    "pricing.plan.essencial.apps": "1 aplicación",
    "pricing.plan.profissional.apps": "3 aplicaciones",
    "pricing.plan.empresarial.apps": "6 aplicaciones",
    "pricing.plan.essencial.badge": "7 días gratis",
    "pricing.plan.essencial.description": "1 Aplicación",
    "pricing.plan.profissional.description": "3 Aplicaciones",
    "pricing.plan.empresarial.description": "6 Aplicaciones",
    "pricing.plan.essencial.pdfs": "PDFs ilimitados",
    "pricing.plan.profissional.pdfs": "PDFs ilimitados",
    "pricing.plan.empresarial.pdfs": "PDFs ilimitados",
    "pricing.features.customization": "Personalización del app",
    "pricing.features.email_support": "Soporte por email",
    "pricing.features.whatsapp_support": "Soporte por WhatsApp",
    "pricing.features.import_apps": "Importación de apps existentes",
    "pricing.features.app_import": "Importación de apps",
    "pricing.features.video_player": "Reproductor de vídeo integrado",
    "pricing.features.custom_domain": "Dominio personalizado",
    "pricing.features.premium_templates": "Plantillas premium",
    "pricing.features.multi_language": "Interfaz multi-idioma",
    "pricing.features.multilingual": "Interfaz multi-idioma",
    "pricing.features.integrations": "Integraciones con plataformas",
    "pricing.features.platform_integrations": "Integraciones con plataformas",
    "pricing.features.realtime_updates": "Actualizaciones en tiempo real",
    "pricing.features.real_time_updates": "Actualizaciones en tiempo real",
    "pricing.features.unlimited_users": "Usuarios ilimitados",
    "pricing.features.push_notifications": "Notificaciones push",
    "pricing.features.internal_chat": "Chat interno",
    "pricing.features.convert_ebook": "Convierte eBook en app en 3 minutos",
    "pricing.features.one_click_access": "Cliente accede con 1 clic (sin login)",
    "pricing.features.multiplatform": "Funciona en Android, iOS y Web",
    "pricing.features.update_content": "Actualiza contenido sin reenviar nada",
    "pricing.features.whatsapp_integrated": "WhatsApp integrado en app",
    "pricing.features.push_engage": "Notificaciones push para enganchar",
    "pricing.features.payment_integrations": "Integración con plataformas de pago",
    "pricing.features.everything_professional": "Todo del Profesional +",
    "pricing.features.integrated_videos": "Videos integrados en app (via link)",
    "pricing.features.upsell_bump": "Upsell y Order Bump en app",
    "pricing.features.premium_visual": "Visual premium con plantillas exclusivas",
    "pricing.features.custom_domain_brand": "Dominio personalizado (tu marca)",
    "pricing.subscribe": "Suscribirse",
    "pricing.equivalent": "Equivale a",
    "pricing.per_month": "/mes",
    "pricing.per_year": "/año",
    "pricing.back_to_app": "Volver a la App",
    "pricing.logout": "Salir",
    "pricing.start_now": "Comenzar Ahora",
    "pricing.cancel_anytime": "Cancela cuando quieras",
    "pricing.loading": "Cargando...",
    "pricing.error.session": "Sesión expirada. Por favor, inicia sesión nuevamente.",
    "pricing.error.checkout": "Error al crear checkout. Inténtalo de nuevo.",
    "checkout.title": "Ingresa tus datos de pago",
    "checkout.subtitle.line1": "Aceptamos tarjetas Visa y Mastercard.",
    "checkout.subtitle.line2": "Prueba gratis durante 7 días. No se cobrará hoy.",
    "checkout.subtitle.line3.monthly": "Después de 7 días, se cobrará R${price} por mes.",
    "checkout.subtitle.line3.annual": "Después de 7 días, se cobrará R${price} por año.",
    "checkout.subtitle": "Estás a un paso de transformar tus eBooks en aplicaciones profesionales",
    "checkout.plan.title": "Plan",
    "checkout.price.annual": "/año",
    "checkout.price.monthly": "/mes",
    "checkout.price.equivalent": "Equivale a",
    "checkout.benefits.title": "Qué está incluido:",
    "checkout.total.annual": "Total Anual",
    "checkout.total.monthly": "Total Mensual",
    "checkout.processing": "Procesando...",
    "checkout.subscribe.button": "Comenzar prueba gratis",
    "checkout.back.button": "Volver a los Planes",
    "checkout.back.short": "Volver",
    "checkout.error.title": "Error al procesar",
    "checkout.error.description": "No se pudo iniciar el checkout. Inténtalo de nuevo.",

    // Payment Success Page
    "payment_success.title": "¡Pago Aprobado!",
    "payment_success.subtitle": "Tu suscripción ha sido activada exitosamente",
    "payment_success.plan_title": "Plan {plan}",
    "payment_success.benefits_title": "Beneficios de tu plan:",
    "payment_success.next_billing": "Próximo cobro",
    "payment_success.app_limit": "Límite de apps",
    "payment_success.apps": "aplicaciones",
    "payment_success.billing_cycle": "Ciclo de facturación:",
    "payment_success.monthly": "Mensual",
    "payment_success.yearly": "Anual",
    "payment_success.amount": "Monto:",
    "payment_success.processing_title": "Procesando tu suscripción...",
    "payment_success.processing_subtitle":
      "Tu suscripción está siendo activada. Los detalles aparecerán aquí en unos minutos.",
    "payment_success.access_app": "Acceder al MigraBook",
    "payment_success.view_plans": "Ver Otros Planes",
    "payment_success.email_confirmation": "Se envió un email de confirmación a {email}",
    "payment_success.manage_subscription":
      "Puedes gestionar tu suscripción en cualquier momento desde el panel de usuario",

    // Inactive Account Page
    "inactive.title": "Cuenta Inactiva",
    "inactive.subtitle": "Tu cuenta ha sido desactivada",
    "inactive.default_message": "Tu cuenta ha sido desactivada. Contacta soporte para más información.",
    "inactive.reactivate_button": "Suscribirse para Reactivar Cuenta",
    "inactive.logout_button": "Cerrar Sesión",

    // CustomizationPanel
    "custom.icon.background": "Fondo transparente recomendado",
    "custom.cover.background": "Imagen de fondo de la app",
    "custom.thumbnail.title": "Subir miniatura PWA",
    "custom.thumbnail.help": "Haga clic en el ícono para subir la miniatura PWA (PNG/JPG 512x512)",

    // UploadSection
    "upload.error.generic": "Error en la subida",
    "upload.retry.ready.title": "Listo para reintentar",
    "upload.retry.ready.description": "Seleccione el archivo nuevamente para intentar la subida.",
    "upload.app.notfound.title": "App no encontrada",
    "upload.app.notfound.description": "Verifique si el ID es correcto.",
    "upload.access.denied.title": "Acceso denegado",
    "upload.access.denied.description": "Solo puede importar sus propias apps.",
    "upload.default.appname": "Mi App",
    "upload.default.description": "Descripción de la App",

    // Header
    "header.logout.error.title": "Error",
    "header.logout.error.description": "No se pudo cerrar sesión",
    "header.logout.success.title": "Sesión cerrada",
    "header.logout.success.description": "Ha sido desconectado exitosamente",
    "header.language": "Idioma",
    "header.language.pt": "Português",
    "header.language.en": "English",
    "header.language.es": "Español",
    "header.menu": "MENÚ",
    "header.theme": "Tema",
    "header.profile": "Perfil",
    "header.reset": "Reiniciar",
    "header.logout.button": "Salir",
    "header.notifications": "Notificaciones",

    // Header Notifications Dropdown
    "header.notifications.dropdown_title": "Notificaciones",
    "header.notifications.mark_all_read": "Marcar todas como leídas",
    "header.notifications.empty": "Sin notificaciones por el momento",
    "header.notifications.open_link": "Abrir enlace",

    // Admin Notifications
    "admin.notifications.tab": "Notificaciones",
    "admin.notifications.title": "Gestionar Notificaciones",
    "admin.notifications.add": "Nueva Notificación",
    "admin.notifications.edit": "Editar Notificación",
    "admin.notifications.fetch_error": "Error al cargar notificaciones",
    "admin.notifications.validation_error": "Complete título y mensaje",
    "admin.notifications.create_success": "Notificación creada con éxito",
    "admin.notifications.update_success": "Notificación actualizada con éxito",
    "admin.notifications.save_error": "Error al guardar notificación",
    "admin.notifications.delete_confirm": "¿Está seguro de que desea eliminar esta notificación?",
    "admin.notifications.delete_success": "Notificación eliminada con éxito",
    "admin.notifications.delete_error": "Error al eliminar notificación",
    "admin.notifications.toggle_error": "Error al cambiar estado",
    "admin.notifications.loading": "Cargando notificaciones...",
    "admin.notifications.empty": "No hay notificaciones registradas",
    "admin.notifications.form.title": "Título",
    "admin.notifications.form.title_placeholder": "Ingrese el título de la notificación",
    "admin.notifications.form.message": "Mensaje",
    "admin.notifications.form.message_placeholder": "Ingrese el mensaje de la notificación",
    "admin.notifications.form.link": "Enlace (opcional)",
    "admin.notifications.form.active": "Notificación activa",
    "admin.notifications.form.cancel": "Cancelar",
    "admin.notifications.form.save": "Guardar",
    "admin.notifications.table.title": "Título",
    "admin.notifications.table.message": "Mensaje",
    "admin.notifications.table.status": "Estado",
    "admin.notifications.table.date": "Fecha",
    "admin.notifications.table.actions": "Acciones",
    "admin.notifications.status.active": "Activa",
    "admin.notifications.status.inactive": "Inactiva",

    // CustomizationPanel - Video Course
    "custom.videoCourse.title": "Curso en Video",
    "custom.videoCourse.description": "Agrega módulos y videos de YouTube",
    "custom.videoCourse.titleLabel": "Título del Curso en Video",
    "custom.videoCourse.titlePlaceholder": "Curso en Video",
    "custom.videoCourse.descriptionLabel": "Descripción del Curso",
    "custom.videoCourse.descriptionPlaceholder": "Descripción del Curso",
    "custom.videoCourse.buttonTextLabel": "Texto del Botón",
    "custom.videoCourse.buttonTextPlaceholder": "Ver Clases",
    "custom.videoCourse.iconLabel": "Ícono del Curso",
    "custom.videoCourse.coverLabel": "Portada del Curso",
    "custom.videoCourse.addModule": "+ Agregar Módulo",
    "custom.videoCourse.moduleTitlePlaceholder": "Nombre del Módulo",
    "custom.videoCourse.videoTitlePlaceholder": "Título del Video",
    "custom.videoCourse.videoLinkPlaceholder": "Enlace de YouTube",
    "custom.videoCourse.addVideo": "+ Agregar Video",
    "custom.videoCourse.removeModule": "Eliminar Módulo",
    "custom.videoCourse.removeVideo": "Eliminar Video",

    // CustomizationPanel - Template Showcase
    "custom.showcase.positionLabel": "Posición del Nombre y Descripción",
    "custom.showcase.positionPlaceholder": "Seleccione la posición",
    "custom.showcase.position.bottom": "Abajo",
    "custom.showcase.position.middle": "Medio",
    "custom.showcase.position.top": "Arriba",

    // CustomizationPanel - Template Members
    "custom.members.clicksPlaceholder": "Clics para saber más",
    "custom.members.headerSizeLabel": "Tamaño del Encabezado",
    "custom.members.headerSizePlaceholder": "Seleccione el tamaño",
    "custom.members.headerSize.small": "Pequeño",
    "custom.members.headerSize.medium": "Mediano",
    "custom.members.headerSize.large": "Grande",

    // PhoneMockup - Default placeholders
    "phonemockup.default.appName": "Nombre de la App",
    "phonemockup.default.appDescription": "Descripción de la App",
    "phonemockup.default.mainProductLabel": "Producto Principal",
    "phonemockup.default.mainProductDescription": "Descripción del Producto",
    "phonemockup.default.bonusesLabel": "Bonos",
    "phonemockup.default.bonus1Label": "Bono 1",
    "phonemockup.default.bonus2Label": "Bono 2",
    "phonemockup.default.bonus3Label": "Bono 3",
    "phonemockup.default.bonus4Label": "Bono 4",
    "phonemockup.default.bonus5Label": "Bono 5",
    "phonemockup.default.bonus6Label": "Bono 6",
    "phonemockup.default.bonus7Label": "Bono 7",
    "phonemockup.default.bonus8Label": "Bono 8",
    "phonemockup.default.bonus9Label": "Bono 9",
    "phonemockup.default.bonus10Label": "Bono 10",
    "phonemockup.default.bonus11Label": "Bono 11",
    "phonemockup.default.bonus12Label": "Bono 12",
    "phonemockup.default.bonus13Label": "Bono 13",
    "phonemockup.default.bonus14Label": "Bono 14",
    "phonemockup.default.bonus15Label": "Bono 15",
    "phonemockup.default.bonus16Label": "Bono 16",
    "phonemockup.default.bonus17Label": "Bono 17",
    "phonemockup.default.bonus18Label": "Bono 18",
    "phonemockup.default.bonus19Label": "Bono 19",
    "phonemockup.default.videoCourseTitle": "Curso en Video",
    "phonemockup.default.whatsappMessage": "¡Hola! Vine a través de la app.",
    "phonemockup.default.whatsappButtonText": "Contáctanos",
    "phonemockup.default.viewButtonLabel": "Ver",

    // AuthGuard
    "authguard.no_permission": "No tienes permiso para acceder a este contenido.",

    // === PRICING PAGE (additional keys) ===
    "pricing.current_plan": "Plan Actual",
    "pricing.max_plan": "Plan Máximo",
    "pricing.unavailable": "Plan No Disponible",
    "pricing.unavailable_short": "No disponible",

    // === PROFILE DIALOG ===
    "profile.title": "Perfil de Usuario",
    "profile.subtitle": "Administre su información personal y aplicaciones publicadas",
    "profile.personal_info": "Información Personal",
    "profile.email": "Correo",
    "profile.name": "Nombre",
    "profile.phone": "Teléfono",
    "profile.my_subscription": "Mi Suscripción",
    "profile.plan": "Plan",
    "profile.free": "Gratis",
    "profile.active": "Activo",
    "profile.my_apps": "Mis Aplicaciones Publicadas",
    "profile.refresh": "Actualizar",
    "profile.published": "Publicado",
    "profile.created_at": "Creado el",
    "profile.updated_at": "Actualizado el",
    "profile.edit": "Editar",
    "profile.view_app": "Ver App",
    "profile.no_apps": "Aún no hay aplicaciones publicadas",
    "profile.no_apps_message": "Sus aplicaciones publicadas aparecerán aquí",
    "profile.danger_zone": "Zona de Peligro",
    "profile.delete_warning":
      "Eliminar su cuenta elimina permanentemente todos sus datos. Esta acción no se puede deshacer.",
    "profile.deleting": "Eliminando...",
    "profile.delete_account": "Eliminar Cuenta",
    "profile.delete_app_title": "Eliminar App",
    "profile.delete_app_message": "¿Estás seguro de que quieres eliminar la app",
    "profile.delete": "Eliminar",
    "profile.saving": "Guardando...",
    "profile.save": "Guardar",
    "profile.max_plan_message": "Tiene el plan más avanzado disponible",
    "profile.max_plan_badge": "Plan Máximo",
    "profile.downgrade_question": "¿Quiere reducir su plan?",
    "profile.contact_support": "Contactar Soporte",
    "profile.upgrade_to_business": "Actualice al plan Empresarial",
    "profile.upgrade_message": "Actualice para obtener más funciones",
    "profile.upgrade_button": "Actualizar",
    "profile.manage_subscription": "Administrar Suscripción",
    "profile.cancel_anytime": "Cancele su suscripción en cualquier momento",
    "profile.cancel_subscription": "Cancelar Suscripción",
    "profile.manual_plan_title": "Plan configurado por el administrador",
    "profile.manual_plan_message": "Su plan se activó manualmente. Para cambios o cancelación, contacte con soporte.",

    // === TOAST MESSAGES - PROFILE ===
    "toast.profile.app_loaded": "App cargada",
    "toast.profile.app_loaded_description": "La app se cargó en el constructor para edición",
    "toast.profile.error": "Error",
    "toast.profile.error_loading_app": "No se pudieron cargar los datos de la app",
    "toast.profile.error_internal": "Error interno al cargar app",
    "toast.profile.updated": "Perfil actualizado",
    "toast.profile.updated_description": "Su información se guardó con éxito",
    "toast.profile.update_error": "No se pudo actualizar el perfil",
    "toast.profile.subscription_canceled": "Suscripción cancelada",
    "toast.profile.subscription_canceled_description":
      "Su suscripción fue cancelada y mantendrá acceso hasta el final del período pagado",
    "toast.profile.cancel_error": "Error al cancelar suscripción",
    "toast.profile.subscription_reactivated": "¡Suscripción reactivada!",
    "toast.profile.subscription_reactivated_description": "Su suscripción fue reactivada con éxito.",
    "toast.profile.reactivate_error": "Error al reactivar suscripción",
    "toast.profile.account_deleted": "Cuenta eliminada",
    "toast.profile.account_deleted_description": "Su cuenta fue eliminada con éxito",
    "toast.profile.delete_error": "Error al eliminar la cuenta",
    "toast.profile.app_deleted": "App eliminado",
    "toast.profile.app_deleted_description": "La app fue eliminada con éxito.",
    "toast.profile.delete_app_error": "Error al eliminar la app.",

    // === ERRORS ===

    "error.session_expired": "Sesión expirada. Inicie sesión nuevamente.",
    "error.server_communication": "Error de comunicación con el servidor",
    "error.cancel_subscription_failed": "Error al cancelar suscripción",
    "error.delete_account_failed": "Error al eliminar cuenta",

    // === PROFILE - RENEWAL & SUBSCRIPTION ===
    "profile.renew_subscription": "Renueva tu suscripción",
    "profile.renew_subscription_message": "Recupera el acceso a las funciones premium",
    "profile.renew_button": "Renovar",
    "profile.cancel_subscription_title": "Cancelar Suscripción",
    "profile.cancel_subscription_description":
      "¿Deseas cancelar tu suscripción? Ya no se te cobrará y perderás el acceso después del período actual.",
    "profile.attention": "Atención",
    "profile.cancel_subscription_warning":
      "Mantendrás el acceso a las funciones premium hasta el final del período ya pagado",
    "profile.keep_subscription": "Mantener Suscripción",
    "profile.canceling": "Cancelando...",
    "profile.confirm_cancel_subscription": "Sí, Cancelar Suscripción",
    "profile.active_subscription_detected": "Suscripción Activa Detectada",
    "profile.must_cancel_first": "Tu suscripción aún está activa. Debes cancelarla antes de eliminar tu cuenta",
    "profile.what_will_happen": "Qué sucederá",
    "profile.subscription_auto_cancel": "Tu suscripción será cancelada automáticamente en Stripe",
    "profile.data_permanent_delete": "Todos tus datos serán eliminados permanentemente",
    "profile.action_irreversible": "Esta acción no se puede deshacer",
    "profile.only_cancel_subscription": "Solo Cancelar Suscripción",
    "profile.cancel_and_delete": "Cancelar Suscripción y Eliminar Cuenta",
    "profile.confirm_delete_title": "Confirmar Eliminación de Cuenta",
    "profile.confirm_delete_message": "Estás a punto de eliminar tu cuenta permanentemente.",
    "profile.all_apps_deleted": "Todas tus aplicaciones serán eliminadas",
    "profile.confirm_delete_account": "Sí, Eliminar Mi Cuenta",

    // === INDEX PAGE ===
    "index.app_loaded_success": "App cargada con éxito",
    "index.app_loaded_description": "La app '{appName}' fue cargada para edición",

    // === DEACTIVATED APP ===
    "deactivated.banner": "Esta aplicación ha sido desactivada temporalmente - Contacte con el soporte de su app",
    "deactivated.title": "App Temporalmente No Disponible",
    "deactivated.message": "La aplicación '{appName}' está temporalmente desactivada.",
    "deactivated.contact": "Contacte con soporte para más información.",

    // === NOTIFICATIONS ===
    "notifications.title": "Notificaciones en la App",
    "notifications.description": "Envíe notificaciones y alertas personalizadas a sus usuarios",
    "notifications.enable": "Activar Notificaciones",
    "notifications.notification_title": "Título de la Notificación",
    "notifications.title_placeholder": "Escriba el título de la notificación...",
    "notifications.message": "Mensaje de la Notificación",
    "notifications.message_placeholder": "Escriba el mensaje de la notificación...",
    "notifications.image": "Imagen de la Notificación (opcional)",
    "notifications.upload_click": "Haga clic para subir",
    "notifications.image_loaded": "✓ Imagen cargada",
    "notifications.image_help": "La imagen se ajustará automáticamente en el popup",
    "notifications.link": "Enlace de Acción (opcional)",
    "notifications.button_text": "Texto del Botón",
    "notifications.button_text_placeholder": "Acceder a Oferta",
    "notifications.button_color": "Color del Botón de Acción",
    "notifications.icon": "Icono de la Notificación",
    "notifications.choose_icon": "Elija un icono",
    "notifications.icon.gift": "Regalo",
    "notifications.icon.bell": "Campana",
    "notifications.icon.star": "Estrella",
    "notifications.icon.sparkles": "Brillos",
    "notifications.icon.zap": "Rayo",
    "notifications.icon.trophy": "Trofeo",
    "notifications.icon.heart": "Corazón",
    "notifications.icon.award": "Medalla",
    "notifications.click_help": "Haga clic en el icono elegido en la app para abrir la notificación",
    "notifications.new_notification": "Nueva notificación",

    // === ADMIN DASHBOARD ===
    "admin.logout.error": "Error al cerrar sesión",
    "admin.logout.success": "Cierre de sesión exitoso",
    "admin.exit": "Salir",
    "admin.students.mobile": "Alumnos",
    "admin.apps.mobile": "Apps",
    "admin.settings.mobile": "Config",
    "admin.integrations.mobile": "Integr",
    "admin.whatsapp.full": "WhatsApp",
    "admin.whatsapp.mobile": "WA",
    "admin.videos.full": "Videos",
    "admin.videos.mobile": "Videos",

    // Tutorial Videos Panel
    "videos.error.load": "Error al cargar videos",
    "videos.success.update": "¡Video actualizado con éxito!",
    "videos.success.create": "¡Video creado con éxito!",
    "videos.error.save": "Error al guardar video",
    "videos.confirm.delete": "¿Estás seguro de que quieres eliminar este video?",
    "videos.success.delete": "¡Video eliminado con éxito!",
    "videos.error.delete": "Error al eliminar video",
    "videos.title": "Videos Tutoriales",
    "videos.subtitle": "Gestiona los videos tutoriales de la plataforma",
    "videos.button.new": "Nuevo Video",
    "videos.table.title": "Título",
    "videos.table.category": "Categoría",
    "videos.table.slug": "Slug",
    "videos.table.status": "Estado",
    "videos.table.actions": "Acciones",
    "videos.status.active": "Activo",
    "videos.status.inactive": "Inactivo",
    "videos.dialog.edit": "Editar Video",
    "videos.dialog.new": "Nuevo Video",
    "videos.dialog.description": "Complete los datos del video tutorial",
    "videos.form.title": "Título",
    "videos.form.description": "Descripción",
    "videos.form.url": "URL o ID de YouTube",
    "videos.form.url.placeholder": "dQw4w9WgXcQ o https://youtube.com/watch?v=...",
    "videos.form.category": "Categoría",
    "videos.form.category.placeholder": "braip, kiwify, hotmart...",
    "videos.form.slug": "Slug (identificador único)",
    "videos.form.slug.placeholder": "tutorial-braip",
    "videos.form.active": "Activo",
    "videos.button.cancel": "Cancelar",
    "videos.button.saving": "Guardando...",
    "videos.button.save": "Guardar",

    // === STUDENTS PANEL ===
    "students.plan_updated": "Plan actualizado",
    "students.plan_updated_description": "Plan del usuario cambiado a {planName} con éxito",
    "students.current_plan": "Plan actual",
    "students.status_updated": "Estado actualizado",
    "students.status_updated_description": "Estado del usuario cambiado a {status}",
    "students.activated": "activado",
    "students.deactivated": "desactivado",
    "students.error": "Error",
    "students.error_update_status": "Error al actualizar estado del usuario",
    "students.free": "Gratis",
    "students.stripe_warning_title": "Validación de Stripe requerida",
    "students.stripe_warning_description": "La suscripción del usuario debe gestionarse a través de Stripe",
    "students.error_update_plan": "Error al actualizar plan",
    "students.error_delete_user": "Error al eliminar usuario",
    "students.user_deleted": "Usuario eliminado",
    "students.user_deleted_description": "El usuario {email} fue eliminado con éxito",
    "students.error_delete": "Error al eliminar usuario: {error}",
    "students.details_title": "Detalles del Usuario",
    "students.details_subtitle": "Información completa sobre el usuario",
    "students.client_data": "Datos del Cliente",
    "students.full_name": "Nombre Completo",
    "students.not_informed": "No informado",
    "students.email": "Email",
    "students.phone": "Teléfono",
    "students.registration_date": "Fecha de Registro",
    "students.contracted_plan": "Plan Contratado",
    "students.apps": "apps",
    "students.published_apps": "Apps Publicadas",
    "students.last_renewal_date": "Última Renovación",
    "students.app_history": "Historial de Apps",
    "students.published": "Publicado",
    "students.draft": "Borrador",
    "students.publication_date": "Fecha de Publicación",
    "students.last_edit": "Última Edición",
    "students.no_apps_found": "No se encontraron apps",
    "students.view_app": "Ver app",
    "students.filter_by_status": "Filtrar por estado",
    "students.no_phone": "Sin teléfono",
    "students.stripe": "Stripe",
    "students.manual": "Manual",
    "students.active": "Activo",
    "students.inactive": "Inactivo",
    "students.confirm_delete": "Confirmar eliminación",
    "students.confirm_delete_message":
      "¿Está seguro que desea eliminar al usuario {email}? Esta acción no se puede deshacer.",
    "students.cancel": "Cancelar",
    "students.deleting": "Eliminando...",
    "students.delete": "Eliminar",
    "students.no_users_found": "No se encontraron usuarios",
    "students.showing": "Mostrando",
    "students.of": "de",
    "students.users": "usuarios",
    "students.previous": "Anterior",
    "students.next": "Siguiente",
    "students.subscription_active": "Suscripción Activa",
    "students.subscription_trialing": "Período de Prueba",
    "students.subscription_past_due": "Pago Vencido",
    "students.subscription_unpaid": "No Pagado",
    "students.subscription_canceled": "Cancelada",
    "students.subscription_incomplete": "Incompleta",
    "students.subscription_paused": "Pausada",
    "students.subscription_unknown": "Desconocido",
    "students.subscription_canceling": "Cancelando al final del período",
    "students.filter_by_stripe": "Filtrar por Stripe",
    "students.stripe_all": "Todos (Stripe)",
    "students.stripe_active": "Suscripción Activa",
    "students.stripe_trialing": "Período de Prueba",
    "students.stripe_past_due": "Pago Vencido",
    "students.stripe_canceled": "Cancelado",
    "students.stripe_unpaid": "No Pagado",
    "students.stripe_none": "Sin Stripe",

    // Settings Sidebar
    "sidebar.customization.title": "Personalización de la App",
    "sidebar.customization.description": "Configure la apariencia y el comportamiento de su aplicación",
    "sidebar.domain.title": "Dominio Personalizado",
    "sidebar.domain.description": "Configure un dominio propio para su aplicación",
    "sidebar.domain.why.title":
      "Haz clic en el botón de abajo para solicitar la configuración. Nuestro equipo se encargará de todo por ti.",
    "sidebar.domain.why.professionalism": "Mayor profesionalismo",
    "sidebar.domain.why.branding": "Branding personalizado",
    "sidebar.domain.why.trust": "Mejor confianza de los usuarios",
    "sidebar.domain.why.seo": "SEO optimizado",
    "sidebar.domain.configure": "Configurar mi Dominio",
    "sidebar.notification.title": "Notificaciones de la App",
    "sidebar.notification.description": "Configure notificaciones y alertas para sus usuarios",
    "sidebar.integrations.title": "Integraciones",
    "sidebar.integrations.description": "Conecte productos de plataformas externas con sus apps",
    "sidebar.tooltip.customization": "Personalización de la App",
    "sidebar.tooltip.domain": "Dominio Propio",
    "sidebar.tooltip.notification": "Notificación en la App",
    "sidebar.tooltip.integrations": "Integraciones con Plataformas",
    "sidebar.import.title": "Importar App Existente",
    "sidebar.import.description": "Importe datos de una app creada previamente usando JSON o ID de la app",
    "sidebar.tooltip.import": "Importar App",
    "sidebar.whatsapp.title": "Soporte WhatsApp",
    "sidebar.whatsapp.description":
      "Configure el botón flotante de WhatsApp para soporte al cliente en su app publicada",
    "sidebar.tooltip.whatsapp": "Soporte WhatsApp",

    // Auth Dialog Validations
    "auth.validation.name_required": "El nombre completo es obligatorio",
    "auth.validation.phone_required": "El teléfono es obligatorio",
    "auth.signup.success.title": "✅ ¡Cuenta creada!",
    "auth.signup.success.description": "Verifique su correo electrónico para confirmar su cuenta.",
    "auth.resend.error.title": "Error al reenviar correo",
    "auth.unconfirmed.title": "Correo no confirmado",
    "auth.unconfirmed.description":
      "Hemos reenviado un correo de confirmación. Por favor, verifique su bandeja de entrada y confirme su cuenta antes de iniciar sesión.",
    "auth.login.success": "¡Inicio de sesión exitoso!",
    "auth.error.title": "Error de autenticación",

    // Auth Verification Dialog
    "auth.verification.invalid_code": "Código inválido",
    "auth.verification.code_length": "El código debe tener 5 dígitos",
    "auth.verification.success": "✅ ¡Cuenta activada con éxito!",
    "auth.verification.redirecting": "Serás redirigido para elegir tu plan.",
    "auth.verification.login_manually":
      "Ocurrió un error al iniciar sesión automáticamente. Por favor, inicia sesión manualmente.",
    "auth.verification.error": "Error de verificación",
    "auth.verification.invalid_or_expired": "Código inválido o caducado",
    "auth.verification.try_again": "Error al verificar el código. Inténtalo de nuevo.",
    "auth.verification.title": "Verificar Cuenta",
    "auth.verification.sent_to": "Enviamos un código de verificación a",
    "auth.verification.expires": "(El código caduca en 30 minutos)",
    "auth.verification.code_label": "Código de Verificación",
    "auth.verification.code_hint": "Introduce el código de 5 dígitos que enviamos a tu correo electrónico",
    "auth.verification.verifying": "Verificando...",
    "auth.verification.verify_button": "Verificar y Activar Cuenta",
    "auth.verification.not_received": "¿No recibiste el código? Revisa tu carpeta de spam o espera unos momentos.",
    "auth.verification.code_still_valid":
      "Ya tienes un código de verificación válido. Por favor, revisa tu correo electrónico.",
    "auth.verification.sending_new_code": "Tu código anterior ha expirado. Enviando un nuevo código...",
    "auth.verification.resend_error": "Error al reenviar el código de verificación.",

    // CreditCardForm - SPANISH
    "payment.finalize.title": "Finalizar Suscripción",
    "payment.plan": "Plan",
    "payment.values.vary": "* Los valores pueden variar según el ciclo de facturación seleccionado",
    "payment.billing.cycle.title": "Ciclo de Facturación",
    "payment.choose.cycle": "Elija su ciclo de pago",
    "payment.annual": "Anual",
    "payment.annual.price": "Anual - R${price} (2 meses gratis)",
    "payment.charged.annually": "Cobrado anualmente",
    "payment.card.data.title": "Datos de la Tarjeta",
    "payment.card.number.placeholder": "0000 0000 0000 0000",
    "payment.card.name.placeholder": "Como aparece en la tarjeta",
    "payment.expiry.month": "Mes",
    "payment.expiry.year": "Año",
    "payment.cvv": "CVV",
    "payment.cvv.placeholder": "123",
    "payment.billing.data.title": "Datos de Facturación",
    "payment.email": "Email",
    "payment.phone": "Teléfono",
    "payment.phone.placeholder": "(11) 99999-9999",
    "payment.zipcode": "Código Postal",
    "payment.zipcode.placeholder": "00000-000",
    "payment.address": "Dirección",
    "payment.number": "Número",
    "payment.number.placeholder": "123",
    "payment.complement": "Complemento",
    "payment.neighborhood": "Barrio",
    "payment.city": "Ciudad",
    "payment.city.placeholder": "São Paulo",
    "payment.state": "Estado",
    "payment.security.info": "Su información está segura",
    "payment.security.description": "Utilizamos cifrado de última generación para proteger sus datos",
    "payment.finalize.button": "Completar Pago",
    "payment.cancel.button": "Cancelar",
    "payment.processing": "Procesando pago...",

    // CustomDomainDialog - SPANISH
    "domain.dialog.title": "Dominio Personalizado",
    "domain.intro": "¡Configure su dominio personalizado y tenga su propia identidad en la web!",
    "domain.team.help":
      "Nuestro equipo técnico se encargará de toda la configuración por usted. Es rápido, seguro y sin complicaciones.",
    "domain.step.1.description": "Infórmenos qué dominio desea usar (ejemplo: midominio.com)",
    "domain.step.2.title": "Datos de acceso",
    "domain.step.2.description":
      "Comparta el inicio de sesión y contraseña de la plataforma donde se registró el dominio (ejemplo: GoDaddy, HostGator, Registro.br, etc.)",
    "domain.step.3.title": "Configuración manual (opcional)",
    "domain.step.3.description":
      "Si prefiere no enviar los datos de acceso, usted mismo puede cambiar el DNS siguiendo nuestras instrucciones. Le enviaremos las direcciones correctas para apuntar manualmente.",
    "domain.guarantee.title": "Configuración completa por nuestro equipo",
    "domain.guarantee.description":
      "Tan pronto como recibamos la información, haremos toda la configuración y se le notificará cuando esté activo.",
    "domain.learn.more": "Más información sobre dominios personalizados",
    "domain.whatsapp.not.configured": "WhatsApp no configurado. Contacte con soporte.",
    "domain.whatsapp.start": "Configurar mi dominio",

    // IntegrationsPanel - Notificaciones y validaciones
    "integrations.toast.load.error.title": "Error al cargar integraciones",
    "integrations.toast.attention.title": "Atención",
    "integrations.toast.invalid.stripe.key": "Clave Stripe inválida (debe comenzar con sk_live_ o sk_test_)",
    "integrations.toast.invalid.hottok": "Proporcione HOTTOK para validación de webhook",
    "integrations.toast.invalid.postback": "Proporcione Postback Key para validación de webhook",
    "integrations.toast.invalid.link": "El enlace de la aplicación está en formato inválido",
    "integrations.toast.product.invalid": "❌ Producto inválido",
    "integrations.toast.updated.title": "✅ Integración actualizada!",
    "integrations.toast.saved.title": "✅ Integración guardada!",
    "integrations.delete.confirm": "¿Está seguro de que desea eliminar esta integración?",

    // IntegrationsPanel - Mensajes personalizados
    "integrations.message.custom": "¡Hola! Me gustaría acceder a la aplicación.",
    "integrations.thumbnail.alt.bonus": "Miniatura de Bono",

    // TemplateBuilder
    "template.description.placeholder": "Describa las características y el estilo de su plantilla",
    "template.header.style.title": "Estilo del Encabezado",
    "template.content.layout.title": "Diseño del Contenido",
    "template.button.style.title": "Estilo de los Botones",
    "template.card.style.title": "Estilo de las Tarjetas",
    "template.spacing.title": "Espaciado General",
    "template.typography.title": "Estilo Tipográfico",

    // Admin Role Manager
    "admin.role.access_confirmed": "Acceso confirmado",
    "admin.role.access_denied": "Acceso denegado",
    "admin.role.has_privileges": "Tienes privilegios de administrador",
    "admin.role.no_privileges": "No tienes privilegios de administrador",
    "admin.role.error_check": "Error al verificar estado de administrador",
    "admin.role.restricted_access": "Acceso Restringido",
    "admin.role.restricted_message": "No tienes privilegios de administrador para acceder a esta página",
    "admin.role.admin_status": "Estado de Administrador",
    "admin.role.check_status": "Verificar Estado Admin",
    "admin.role.access_confirmed_message": "Acceso de administrador confirmado exitosamente",

    // Apps Management Panel
    "apps.table.name": "Nombre",
    "apps.table.user": "Usuario",
    "apps.table.plan": "Plan",
    "apps.table.status": "Estado",
    "apps.table.created_at": "Creado en",
    "apps.table.actions": "Acciones",
    "apps.status.published": "Publicado",
    "apps.status.draft": "Borrador",
    "apps.manage_title": "Gestionar Apps",
    "apps.manage_subtitle": "Visualiza y gestiona todas las apps de la plataforma",
    "apps.search_placeholder": "Buscar por nombre, email o ID...",
    "apps.filter_by_user": "Filtrar por usuario",
    "apps.all_users": "Todos los usuarios",
    "apps.delete_button": "Eliminar",
    "apps.delete_confirm_title": "Confirmar eliminación",
    "apps.delete_confirm_desc": '¿Está seguro de que desea eliminar "{appName}"? Esta acción no se puede deshacer.',
    "apps.deleting": "Eliminando...",
    "apps.not_found": "No se encontraron apps",
    "apps.load_error": "Error al cargar apps",
    "apps.deleted": "App eliminada",
    "apps.deleted_desc": "La app fue eliminada con éxito",
    "apps.delete_error": "Error al eliminar app",
    "apps.copied": "¡Copiado!",
    "apps.id_copied": "ID copiado al portapapeles",

    // Integrations Panel
    "integrations.url_copied": "¡URL copiada!",

    // WhatsApp Settings
    "whatsapp.settings_saved": "✅ ¡Configuraciones guardadas!",
    "whatsapp.button_active": "El botón de WhatsApp está activo en la app",
    "whatsapp.button_disabled": "El botón de WhatsApp ha sido desactivado",
    "whatsapp.attention": "Atención",
    "whatsapp.enter_phone": "Ingrese el número de teléfono de WhatsApp",
    "whatsapp.invalid_phone":
      "Número de teléfono inválido. Use el formato completo con código de área (Ej: 5511999999999)",
    "whatsapp.contact_us": "Contáctenos",

    // Plan Service
    "plans.essential": "Esencial",
    "plans.professional": "Profesional",
    "plans.business": "Empresarial",
    "plans.essential_description": "Ideal para principiantes",
    "plans.professional_description": "Más flexibilidad",
    "plans.business_description": "Uso corporativo y avanzado",
    "plans.feature_customization": "Personalización de la app",
    "plans.feature_email_support": "Soporte por email",
    "plans.feature_import": "Importación de apps existentes",
    "plans.feature_analytics": "Análisis y estadísticas",
    "plans.feature_multi_device": "Acceso multidispositivo",
    "plans.feature_backup": "Copia de seguridad automática",
    "plans.not_found": "Plan no encontrado",
    "plans.card_declined": "Tarjeta rechazada por el operador",
    "plans.free": "Gratis",
    "plans.free_internal": "Gratuito",

    // Support Page
    "support.default_title": "Centro de Soporte",
    "support.default_description": "Contáctenos para obtener ayuda y soporte especializado.",
    "support.default_button": "Contactar",
    "support.response_message": "Responderemos lo antes posible",

    // General errors
    "error.generic": "Error",
    "error.loading": "Error al cargar",
    "error.saving": "Error al guardar",

    // Password Reset Dialog
    "password.reset.title": "Restablecer Contraseña",
    "password.reset.sent": "Enviamos un código de verificación a",
    "password.reset.expires": "(El código expira en 30 minutos)",
    "password.reset.code_label": "Código de Verificación",
    "password.reset.code_hint": "Ingrese el código de 5 dígitos que enviamos a su correo",
    "password.reset.new_password": "Nueva Contraseña",
    "password.reset.new_password_placeholder": "Ingrese su nueva contraseña",
    "password.reset.min_chars": "Mínimo 6 caracteres",
    "password.reset.verifying": "Verificando...",
    "password.reset.button": "Restablecer Contraseña",
    "password.reset.no_code": "¿No recibió el código? Revise su carpeta de spam o cierre y solicite nuevamente.",
    "password.reset.invalid_code": "Código inválido",
    "password.reset.code_must_be_5": "El código debe tener 5 dígitos",
    "password.reset.short_password": "Contraseña muy corta",
    "password.reset.min_6_chars": "La contraseña debe tener al menos 6 caracteres",
    "password.reset.success": "✅ ¡Contraseña cambiada con éxito!",
    "password.reset.success_desc": "Ya puede iniciar sesión con su nueva contraseña.",
    "password.reset.error": "Error de verificación",
    "password.reset.invalid_expired": "Código inválido o expirado",
    "password.reset.generic_error": "Ocurrió un error. Inténtelo de nuevo.",
    "password.reset.try_again": "Error de conexión. Verifique su internet e inténtelo de nuevo.",
    "password.reset.invalid_code_msg": "Código incorrecto. Verifique el código ingresado e inténtelo de nuevo.",
    "password.reset.expired_code_msg": "Código expirado. Cierre esta ventana y solicite un nuevo código.",
    "password.reset.weak_password_msg":
      "Contraseña muy débil. Use una contraseña más fuerte con letras, números y símbolos.",
    "password.reset.code_used_msg": "Este código ya fue utilizado. Solicite un nuevo código.",

    // PIX Payment
    "pix.payment.title": "Pago PIX",
    "pix.payment.confirmed_title": "¡Pago Confirmado!",
    "pix.payment.confirmed_desc": "Su plan {planName} ha sido activado con éxito.",
    "pix.payment.access_app": "Acceder a la App",
    "pix.expired_title": "PIX Expirado",
    "pix.expired_desc": "El código PIX ha expirado. Inténtelo de nuevo.",
    "pix.back_to_plans": "Volver a los Planes",
    "pix.time_remaining": "Tiempo restante:",
    "pix.scan_qrcode": "Escanee el código QR con su app bancaria",
    "pix.copy_code": "O copie el código PIX:",
    "pix.code_copied": "¡Código PIX copiado!",
    "pix.code_copied_desc": "Pegue el código en su app bancaria para realizar el pago.",
    "pix.how_to_pay": "Cómo pagar:",
    "pix.step_1": "1. Abra su app bancaria",
    "pix.step_2": "2. Escanee el código QR o pegue el código PIX",
    "pix.step_3": "3. Confirme el pago de {amount}",
    "pix.step_4": "4. Espere la confirmación (hasta 30 segundos)",
    "pix.cancel": "Cancelar",
    "pix.simulate": "Simular Pago",
    "pix.simulated": "¡Pago simulado!",
    "pix.simulated_desc": "Para demostración, el pago fue confirmado automáticamente.",

    // Admin Login
    "admin.login.verifying": "Verificando permisos...",
    "admin.login.error_permissions": "Error al verificar permisos",
    "admin.login.try_later": "Inténtelo de nuevo más tarde",
    "admin.login.success": "Inicio de sesión exitoso",
    "admin.login.redirecting": "Redirigiendo al panel admin...",
    "admin.login.access_denied": "Acceso denegado",
    "admin.login.no_admin_permission": "No tiene permiso de administrador",

    // Auth Page
    "auth.name_required": "El nombre completo es obligatorio",
    "auth.phone_required": "El teléfono es obligatorio",
    "auth.code_sent": "¡Código enviado!",
    "auth.code_sent_desc": "Ingrese el código de 5 dígitos que enviamos a su correo.",
    "auth.email_not_confirmed": "Correo no confirmado",
    "auth.email_not_confirmed_desc":
      "Reenviamos un correo de confirmación. Verifique su bandeja de entrada y confirme su cuenta antes de iniciar sesión.",
    "auth.resend_error": "Error al reenviar correo",
    "auth.login_success": "¡Inicio de sesión exitoso!",
    "auth.login_redirecting": "Redirigiendo...",
    "auth.error": "Error de autenticación",
    "auth.error.email_exists": "Este correo ya está registrado. Inicia sesión o usa otro correo.",
    "auth.send_code_error": "Error al enviar código",
    "auth.password_reset.user_not_found": "Correo no encontrado. Verifique si lo escribió correctamente.",
    "auth.password_reset.error": "Error al procesar la solicitud. Intente nuevamente.",
    "auth.password_reset.error_title": "Error de recuperación",
    "auth.password_changed": "✅ ¡Contraseña cambiada!",
    "auth.password_changed_desc": "Inicie sesión con su nueva contraseña.",
    "auth.recover_password": "Recuperar Contraseña",
    "auth.recover_password_desc": "Ingrese su correo para recibir un enlace de recuperación de contraseña.",
    "auth.sending": "Enviando...",
    "auth.send_link": "Enviar Enlace",

    // App Viewer
    "app.error": "Error",
    "app.error_loading": "Error al cargar la aplicación:",
    "app.not_found": "App no encontrada",
    "app.not_found_desc": "Esta app no existe o ha sido eliminada. Verifique si el enlace es correcto.",
    "app.unexpected_error": "Error inesperado",
    "app.unexpected_error_desc": "Ocurrió un error al cargar la aplicación. Intente recargar la página.",
    "app.install_error": "Error de instalación",
    "app.install_error_desc": "Use el menú del navegador (⋮) y seleccione 'Añadir a pantalla de inicio'",
    "app.installed": "✅ ¡Instalado!",
    "app.installed_desc": "App añadida a la pantalla de inicio con éxito.",
    "app.install_cancelled": "Instalación cancelada",
    "app.install_cancelled_desc": "Puede instalar después usando el menú del navegador.",
    "app.install_try_again": "Inténtelo de nuevo o use el menú del navegador.",
    "app.download_started": "Descarga iniciada",
    "app.download_started_desc": "{filename} se está descargando.",
    "app.download_error": "Error de descarga",
    "app.download_error_desc": "No se pudo descargar el archivo.",

    // Footer
    "footer.rights": "Todos los derechos reservados",

    // Academy Page
    "academy.title": "Academy",
    "academy.subtitle": "Tutoriales y Entrenamientos",
    "academy.search": "Buscar videos...",
    "academy.no_videos": "No se encontraron videos",
    "academy.no_tutorials": "No hay tutoriales disponibles",
    "academy.search_other": "Intenta buscar con otros términos",
    "academy.coming_soon": "Los tutoriales se agregarán pronto",
    "academy.video": "video",
    "academy.videos": "videos",
    "academy.restricted_access": "Acceso Restringido",
    "academy.login_required": "Inicia sesión para acceder a los tutoriales y entrenamientos de la plataforma.",
  },
};

// Country to language mapping
const COUNTRY_LANGUAGE_MAP: Record<string, Language> = {
  BR: "pt", // Brazil
  US: "en", // United States
  CA: "en", // Canada
  GB: "en", // United Kingdom
  AU: "en", // Australia
  AR: "es", // Argentina
  BO: "es", // Bolivia
  CL: "es", // Chile
  CO: "es", // Colombia
  CR: "es", // Costa Rica
  CU: "es", // Cuba
  DO: "es", // Dominican Republic
  EC: "es", // Ecuador
  SV: "es", // El Salvador
  GT: "es", // Guatemala
  HN: "es", // Honduras
  MX: "es", // Mexico
  NI: "es", // Nicaragua
  PA: "es", // Panama
  PY: "es", // Paraguay
  PE: "es", // Peru
  PR: "es", // Puerto Rico
  UY: "es", // Uruguay
  VE: "es", // Venezuela
};

// Detect language from browser locale
const getBrowserLanguage = (): Language | null => {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("pt")) return "pt";
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("en")) return "en";
  return null;
};

// Get country code from IP geolocation
const getCountryFromIP = async (): Promise<string | null> => {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      timeout: 5000,
    } as any);
    if (response.ok) {
      const data = await response.json();
      return data.country_code;
    }
  } catch (error) {
    console.warn("Could not detect country from IP:", error);
  }
  return null;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export { LanguageContext };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { defaultLanguage, isLoading } = usePlatformSettings();
  const [language, setLanguage] = useState<Language>("pt");
  const [hasSetLanguage, setHasSetLanguage] = useState(false);

  // Auto-detect language on mount
  useEffect(() => {
    if (isLoading || hasSetLanguage) return;
    const autoDetectLanguage = async () => {
      const userOverride = localStorage.getItem("app_language_override") === "true";
      const savedLanguage = localStorage.getItem("app_language") as Language | null;

      // 1) Respect user's manual choice if present
      if (userOverride && savedLanguage && ["pt", "en", "es"].includes(savedLanguage)) {
        setLanguage(savedLanguage);
        setHasSetLanguage(true);
        return;
      }

      // 2) Admin default (only if user didn't override)
      if (!userOverride && defaultLanguage && ["pt", "en", "es"].includes(defaultLanguage)) {
        setLanguage(defaultLanguage as Language);
        localStorage.setItem("app_language", defaultLanguage);
        setHasSetLanguage(true);
        return;
      }

      // 3) Legacy saved language (no override flag)
      if (savedLanguage && ["pt", "en", "es"].includes(savedLanguage)) {
        setLanguage(savedLanguage);
        setHasSetLanguage(true);
        return;
      }

      // 4) Try browser language
      const browserLang = getBrowserLanguage();
      if (browserLang) {
        setLanguage(browserLang);
        localStorage.setItem("app_language", browserLang);
        setHasSetLanguage(true);
        return;
      }

      // 5) Try IP geolocation
      const country = await getCountryFromIP();
      if (country && COUNTRY_LANGUAGE_MAP[country]) {
        const detectedLang = COUNTRY_LANGUAGE_MAP[country];
        setLanguage(detectedLang);
        localStorage.setItem("app_language", detectedLang);
        setHasSetLanguage(true);
        return;
      }

      // 6) Fallback to admin default from DB, else pt
      try {
        const { data, error } = await supabase
          .from("admin_settings")
          .select("value")
          .eq("key", "default_language")
          .maybeSingle();

        if (!error && data?.value && ["pt", "en", "es"].includes(data.value)) {
          setLanguage(data.value as Language);
          localStorage.setItem("app_language", data.value);
        } else {
          setLanguage("pt");
          localStorage.setItem("app_language", "pt");
        }
      } catch (error) {
        console.error("Error fetching default language:", error);
        setLanguage("pt");
        localStorage.setItem("app_language", "pt");
      }

      setHasSetLanguage(true);
    };

    autoDetectLanguage();
  }, [defaultLanguage, isLoading, hasSetLanguage]);

  // Update language when admin default changes (unless user manually overrode)
  useEffect(() => {
    if (isLoading) return;
    const userOverride = localStorage.getItem("app_language_override") === "true";
    if (
      !userOverride &&
      defaultLanguage &&
      defaultLanguage !== language &&
      ["pt", "en", "es"].includes(defaultLanguage)
    ) {
      setLanguage(defaultLanguage as Language);
      localStorage.setItem("app_language", defaultLanguage);
    }
  }, [defaultLanguage, language, isLoading]);

  // Wrapper for setLanguage to persist to localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("app_language", lang);
    localStorage.setItem("app_language_override", "true");
    setHasSetLanguage(true);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Retorna valores padrão ao invés de dar erro
    return {
      language: "pt" as Language,
      setLanguage: () => {},
      t: (key: string) => key, // Retorna a própria chave como fallback
    };
  }
  return context;
};
