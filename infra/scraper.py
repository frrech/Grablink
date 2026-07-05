import json
import urllib.request
import re
import os

def lambda_handler(event, context):
    api_url = os.environ.get('API_URL')
    
    for record in event['Records']:
        # O SQS envia o payload como uma string JSON
        payload = json.loads(record['body'])
        share_code = payload.get('code')
        target_url = payload.get('url')
        
        try:
            # Requisita a página com um header simulando um navegador
            req = urllib.request.Request(
                target_url, 
                headers={'User-Agent': 'Mozilla/5.0 GrablinkBot/1.0'}
            )
            
            with urllib.request.urlopen(req, timeout=5) as response:
                html = response.read().decode('utf-8', errors='ignore')
                
                # Regex simples para capturar o conteúdo da tag <title>
                title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
                page_title = title_match.group(1).strip() if title_match else "Título indisponível"
                
                print(f"Scraping concluído para {share_code}: {page_title}")
                
                # (Opcional) Envia o título extraído de volta para atualizar via API NestJS
                update_data = json.dumps({'title': page_title}).encode('utf-8')
                update_req = urllib.request.Request(
                    f"{api_url}/share/{share_code}", 
                    data=update_data, 
                    headers={'Content-Type': 'application/json'}, 
                    method='PATCH'
                )
                urllib.request.urlopen(update_req)

        except Exception as e:
            print(f"Erro ao processar URL {target_url}: {str(e)}")
            # Em caso de falha severa, você pode optar por levantar o erro 
            # para a mensagem voltar para a fila SQS.

    return {
        'statusCode': 200,
        'body': 'Lote processado com sucesso'
    }