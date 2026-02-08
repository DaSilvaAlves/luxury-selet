PRD – Loja de Revenda O Boticário (Versão Pro)  
Data: Janeiro 2026

Status: Pronto para Desenvolvimento (Sprint 1\)

Diferencial: Foco em conversão mobile e organização logística via WhatsApp.

1\. Visão Geral e Problema Central  
Problema: A "fadiga de catálogo". Clientes perdem-se em PDFs longos e a revendedora perde horas a transcrever pedidos manuais e a pedir dados de morada.

Solução: Um catálogo interativo que funciona como um funil de vendas, entregando o pedido "mastigado" no WhatsApp da revendedora, com cálculos de IVA e totais feitos automaticamente.

2\. Melhorias na Experiência do Cliente (UX)  
Persistência de Carrinho: O carrinho deve ser guardado no local storage do navegador. Se a cliente fechar o browser e voltar mais tarde, os produtos ainda estão lá.

Filtro "Pronta Entrega" vs "Por Encomenda": Essencial para revendedoras O Boticário. Alguns itens ela tem em stock, outros precisa de encomendar à marca.

Botão Flutuante de Ajuda: Um botão direto para o WhatsApp para tirar dúvidas antes de fechar o carrinho.

3\. Funcionalidades Críticas (Otimizadas)  
3.1. Identificador Único de Pedido (Crucial)  
O que muda: Cada vez que o cliente clica em "Finalizar", o sistema gera um ID curto (ex: \#BOT-1024).

Porquê: Para a revendedora conseguir pesquisar no Admin e saber exatamente qual é o pedido de que a cliente está a falar no WhatsApp.

3.2. Checkout e RGPD (Portugal/UE)  
Checkbox de Consentimento: Adicionar obrigatoriamente: "Aceito que os meus dados sejam processados para fins de processamento desta encomenda (RGPD)."

Cálculo de Portes (Simples): Adicionar uma lógica de "Portes Grátis a partir de X €" ou "Taxa fixa de entrega". Isso evita a revendedora ter de cobrar portes à parte depois.

3.3. Template de Mensagem WhatsApp (Refinado)  
Otimizei o template para ser lido rapidamente num ecrã de telemóvel:

Plaintext  
🛍️ \*NOVA ENCOMENDA \[ID\_PEDIDO\]\*  
\----------------------------------  
👤 \*CLIENTE:\* \[NOME\]  
📞 \*TEL:\* \[TELEFONE\]  
📍 \*ENTREGA:\* \[LOCALIDADE\], \[DISTRITO\]  
\----------------------------------  
📦 \*PRODUTOS:\*  
\[LINHAS\_PRODUTO\]  
\----------------------------------  
💰 \*TOTAL:\* \[TOTAL\]€  
💳 \*PAGAMENTO:\* \[METODO\]  
\----------------------------------  
💬 \*NOTAS:\* \[NOTAS\]

\_Clica aqui para ver os detalhes no Admin: \[LINK\_DIRETO\_ADMIN\]\_  
4\. Área Administrativa (Revendedora)  
Dashboard Rápido: Ver o total de vendas do mês e quantos pedidos estão "Pendentes de Pagamento".

Gestão de Stock Simplificada: Um botão "Ativar/Desativar" produto. Se o produto esgotou no armazém da marca, ela desativa com um clique.

Gerador de Promoções: Campo "Preço Original" e "Preço Promo". O sistema calcula automaticamente a badge de "% de Desconto".

5\. Arquitetura Técnica Sugerida  
Imagens: Sugiro usar um serviço como Cloudinary ou redimensionamento automático no upload. Fotos de perfumes pesadas vão destruir a performance mobile.

Base de Dados: Manter a tabela orders é vital para que, no futuro, possas enviar newsletters ou promoções segmentadas (ex: "Quem comprou Lily há 3 meses pode estar a precisar de novo").

6\. Próximos Passos (Roadmap)  
Fase 1 (MVP): Catálogo \+ Carrinho \+ Link WhatsApp (sem Admin, produtos via JSON/Código).

Fase 2: Implementação do Admin para gestão de produtos.

Fase 3: Sistema de fidelidade (ex: a cada 50€ em compras, ganha uma amostra grátis \- configurável no checkout).