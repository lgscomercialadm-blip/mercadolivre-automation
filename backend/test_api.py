#!/usr/bin/env python3
"""
Script para testar APIs do backend
"""
import requests
import json

def test_api():
    base_url = "http://localhost:8001"
    
    print("🔍 Testando APIs do Backend\n")
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health: {e}")
    
    # Test 2: OAuth status
    try:
        response = requests.get(f"{base_url}/api/oauth-simple/status")
        print(f"✅ OAuth Status: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ OAuth Status: {e}")
    
    # Test 3: ML test
    try:
        response = requests.get(f"{base_url}/api/ml-simple/test")
        print(f"✅ ML Test: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ ML Test: {e}")

if __name__ == "__main__":
    test_api()
