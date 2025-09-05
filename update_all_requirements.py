#!/usr/bin/env python3
"""
Script para atualizar todos os requirements.txt dos serviços
com as versões unificadas.
"""

import os
import shutil

def main():
    # Arquivo de referência com versões unificadas
    unified_requirements = "requirements-unified.txt"
    
    # Lista de diretórios que contêm requirements.txt
    services = [
        "backend",
        "optimizer_ai", 
        "strategic_mode_service",
        "campaign_automation_service",
        "discount_campaign_scheduler",
        "gamification_service",
        "learning_service",
        "acos_service",
        "alerts_service"
    ]
    
    print("🔄 Atualizando requirements.txt em todos os serviços...")
    
    # Verificar se o arquivo unificado existe
    if not os.path.exists(unified_requirements):
        print(f"❌ Erro: {unified_requirements} não encontrado!")
        return
    
    updated_count = 0
    
    for service in services:
        service_req_path = os.path.join(service, "requirements.txt")
        
        if os.path.exists(service):
            try:
                # Copiar o arquivo unificado para cada serviço
                shutil.copy2(unified_requirements, service_req_path)
                print(f"✅ {service}/requirements.txt atualizado")
                updated_count += 1
            except Exception as e:
                print(f"❌ Erro ao atualizar {service}: {e}")
        else:
            print(f"⚠️  Diretório {service} não encontrado")
    
    print(f"\n🎉 Atualização concluída! {updated_count} serviços atualizados.")
    print("📦 Versões unificadas aplicadas em todos os requirements.txt")

if __name__ == "__main__":
    main()
