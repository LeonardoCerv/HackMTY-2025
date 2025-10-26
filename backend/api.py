from fastapi import APIRouter, HTTPException
import requests
from typing import List, Dict, Any
import json
from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import datetime

# Crear un router en lugar de usar app directamente
router = APIRouter()
load_dotenv()

NESSIE_API_KEY = "5385334cd89925d890675e8cdd41c9c4"
NESSIE_BASE_URL = "http://api.nessieisreal.com"

use_mock = os.getenv("use_mock", "false").lower() == "true"


def fetch_from_nessie(url: str) -> List[Dict[str, Any]]:
    """Hace una petición GET segura a la API de Nessie y devuelve lista."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data if isinstance(data, list) else []
    except requests.exceptions.RequestException as err:
        print(f"⚠️ Error al conectar con Nessie: {err}")
        return []


@router.get("/api/transactions")
def get_transactions_for_customer():
    """
    Obtiene todas las transacciones del primer cliente disponible.
    """
    if use_mock:
        try:
            # Ruta ajustada para tu estructura
            # Path(__file__).parent es la raíz (C:.)
            json_file_path = Path(__file__).parent / "data-transactions" / "good_transactions.json"
            
            # Verificar que el archivo existe
            if not json_file_path.exists():
                raise HTTPException(
                    status_code=404,
                    detail=f"Archivo no encontrado en: {json_file_path}"
                )
            
            with open(json_file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            print(f"✅ Datos cargados desde JSON local: {data['customer']['name']}")
            print(f"📊 Total de transacciones: {data['total_transactions']}")
            return data
            
        except FileNotFoundError:
            raise HTTPException(
                status_code=404,
                detail="Archivo transactions.json no encontrado en 'data-transactions/'"
            )
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error en el formato del archivo JSON: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error inesperado: {str(e)}"
            )
    
    else:
        # Tu código original con la API de Nessie
        customers_url = f"{NESSIE_BASE_URL}/customers?key={NESSIE_API_KEY}"
        customers = fetch_from_nessie(customers_url)

        if not customers:
            raise HTTPException(status_code=404, detail="No se encontraron clientes en Nessie.")

        customer = customers[0]
        customer_id = customer["_id"]
        customer_name = f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip()

        print(f"Cliente seleccionado: {customer_name} (ID: {customer_id})")

        accounts_url = f"{NESSIE_BASE_URL}/customers/{customer_id}/accounts?key={NESSIE_API_KEY}"
        accounts = fetch_from_nessie(accounts_url)

        if not accounts:
            raise HTTPException(status_code=404, detail=f"No se encontraron cuentas para el cliente {customer_name}.")

        target_accounts = [acc for acc in accounts if acc.get("type") in ["Savings", "Credit Card"]]

        if not target_accounts:
            raise HTTPException(status_code=404, detail="El cliente no tiene cuentas de tipo Savings o Credit Card.")

        all_tx = []

        for account in target_accounts:
            account_id = account["_id"]
            account_type = account["type"]
            nickname = account.get("nickname", "Sin nombre")

            endpoints = {
                "deposit": f"{NESSIE_BASE_URL}/accounts/{account_id}/deposits?key={NESSIE_API_KEY}",
                "withdrawal": f"{NESSIE_BASE_URL}/accounts/{account_id}/withdrawals?key={NESSIE_API_KEY}",
                "purchase": f"{NESSIE_BASE_URL}/accounts/{account_id}/purchases?key={NESSIE_API_KEY}",
                "transfer": f"{NESSIE_BASE_URL}/accounts/{account_id}/transfers?key={NESSIE_API_KEY}",
                "loan": f"{NESSIE_BASE_URL}/accounts/{account_id}/loans?key={NESSIE_API_KEY}"
            }

            for tx_type, url in endpoints.items():
                transactions = fetch_from_nessie(url)
                for tx in transactions:
                    amount = tx.get("amount") or tx.get("payment_amount") or 0
                    all_tx.append({
                        "customer_id": customer_id,
                        "customer_name": customer_name,
                        "account_id": account_id,
                        "account_type": account_type,
                        "nickname": nickname,
                        "type": tx_type,
                        "amount": amount,
                        "positive": tx_type in ["deposit", "loan"],
                        "transaction_date": tx.get("transaction_date") or tx.get("date"),
                        "description": tx.get("description") or "",
                    })

        all_tx.sort(key=lambda x: x.get("transaction_date") or "", reverse=True)

        return {
            "customer": {
                "id": customer_id,
                "name": customer_name,
                "total_accounts": len(target_accounts),
                "account_names": [a.get("nickname") for a in target_accounts],
            },
            "total_transactions": len(all_tx),
            "transactions": all_tx
        }


@router.get("/api/v1/accounts")
def get_accounts() -> Dict[str, Any]:
    """Obtiene todas las cuentas de Nessie."""
    nessie_url = f"{NESSIE_BASE_URL}/accounts?key={NESSIE_API_KEY}"
    
    try:
        response = requests.get(nessie_url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as err:
        status_code = err.response.status_code
        raise HTTPException(
            status_code=status_code,
            detail="Error al obtener las cuentas de Nessie."
        )
    except requests.exceptions.RequestException:
        raise HTTPException(
            status_code=503,
            detail="Error de conexión con la API externa."
        )

@router.get("/api/loans")   
def get_loans() -> Dict[str, Any]:
    """Obtiene todos los préstamos con información detallada."""

    customers_url = f"{NESSIE_BASE_URL}/customers?key={NESSIE_API_KEY}"
    customers = fetch_from_nessie(customers_url)

    if not customers:
        raise HTTPException(status_code=404, detail="No se encontraron clientes en Nessie.")

    customer = customers[0]
    customer_id = customer["_id"]
    customer_name = f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip()

    print(f"Cliente seleccionado: {customer_name} (ID: {customer_id})")
    
    accounts_url = f"{NESSIE_BASE_URL}/customers/{customer_id}/accounts?key={NESSIE_API_KEY}"
    accounts = fetch_from_nessie(accounts_url)

    if not accounts:
        raise HTTPException(status_code=404, detail="No se encontraron cuentas en Nessie.")

    account = accounts[0]
    account_id = account["_id"]
    account_type = account.get("type", "N/A")
    nickname = account.get("nickname", "N/A")

    print(f"Cuenta seleccionada: {nickname} (ID: {account_id}, Tipo: {account_type})")

    nessie_url = f"{NESSIE_BASE_URL}/accounts/{account_id}/loans?key={NESSIE_API_KEY}"
    
    loans = fetch_from_nessie(nessie_url)

    if not loans:
        raise HTTPException(status_code=404, detail="No se encontraron préstamos en Nessie.")   
    
    # Calcular métricas de préstamos
    total_loan_amount = sum(loan.get("amount", 0) for loan in loans)
    total_monthly_payments = sum(loan.get("monthly_payment", 0) for loan in loans)
    
    loan = loans[0]
    credit_score = loan.get("credit_score", 0)
    print(f"Préstamo seleccionado: ID {loan['_id']} con puntaje crediticio {credit_score}") 

    return {
        "loans": loans,
        "total_loans": len(loans),
        "total_loan_amount": total_loan_amount,
        "total_monthly_payments": total_monthly_payments,
        "average_credit_score": credit_score
    }

@router.get("/api/credit-score")
def get_credit_score() -> Dict[str, Any]:
    """Obtiene el puntaje crediticio con información detallada."""
    
    customers_url = f"{NESSIE_BASE_URL}/customers?key={NESSIE_API_KEY}"
    customers = fetch_from_nessie(customers_url)

    if not customers:
        raise HTTPException(status_code=404, detail="No se encontraron clientes en Nessie.")

    customer = customers[0]
    customer_id = customer["_id"]

    accounts_url = f"{NESSIE_BASE_URL}/customers/{customer_id}/accounts?key={NESSIE_API_KEY}"
    accounts = fetch_from_nessie(accounts_url)

    if not accounts:
        raise HTTPException(status_code=404, detail="No se encontraron cuentas en Nessie.")

    account = accounts[0]
    account_id = account["_id"]

    nessie_url = f"{NESSIE_BASE_URL}/accounts/{account_id}/loans?key={NESSIE_API_KEY}"
    loans = fetch_from_nessie(nessie_url)

    if not loans:
        raise HTTPException(status_code=404, detail="No se encontraron préstamos en Nessie.")
    
    # Obtener el credit score del primer préstamo
    loan = loans[0]
    credit_score = loan.get("credit_score", 0)
    
    # Determinar el rango según el puntaje
    def get_score_range(score: int) -> str:
        if score >= 800:
            return "Exceptional"
        elif score >= 740:
            return "Very Good"
        elif score >= 670:
            return "Good"
        elif score >= 580:
            return "Fair"
        else:
            return "Poor"
    
    return {
        "creditScore": credit_score,
        "scoreRange": get_score_range(credit_score),
        "lastUpdated": datetime.now().isoformat()
    }

@router.get("/api/loans-credit-summary")
def get_loans_credit_summary() -> Dict[str, Any]:
    """Obtiene un resumen completo de préstamos y credit score."""
    
    customers_url = f"{NESSIE_BASE_URL}/customers?key={NESSIE_API_KEY}"
    customers = fetch_from_nessie(customers_url)

    if not customers:
        raise HTTPException(status_code=404, detail="No se encontraron clientes en Nessie.")

    customer = customers[0]
    customer_id = customer["_id"]
    customer_name = f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip()

    accounts_url = f"{NESSIE_BASE_URL}/customers/{customer_id}/accounts?key={NESSIE_API_KEY}"
    accounts = fetch_from_nessie(accounts_url)

    if not accounts:
        raise HTTPException(status_code=404, detail="No se encontraron cuentas en Nessie.")

    account = accounts[0]
    account_id = account["_id"]

    nessie_url = f"{NESSIE_BASE_URL}/accounts/{account_id}/loans?key={NESSIE_API_KEY}"
    loans = fetch_from_nessie(nessie_url)

    if not loans:
        raise HTTPException(status_code=404, detail="No se encontraron préstamos en Nessie.")
    
    # Calcular métricas
    total_loan_amount = sum(loan.get("amount", 0) for loan in loans)
    total_monthly_payments = sum(loan.get("monthly_payment", 0) for loan in loans)
    credit_score = loans[0].get("credit_score", 0)
    
    def get_score_range(score: int) -> str:
        if score >= 800:
            return "Exceptional"
        elif score >= 740:
            return "Very Good"
        elif score >= 670:
            return "Good"
        elif score >= 580:
            return "Fair"
        else:
            return "Poor"
    
    return {
        "customer_name": customer_name,
        "loans": {
            "total_loans": len(loans),
            "total_loan_amount": total_loan_amount,
            "total_monthly_payments": total_monthly_payments,
            "active_loans": len([l for l in loans if l.get("status") == "pending"]),
            "loans_detail": loans
        },
        "credit_score": {
            "score": credit_score,
            "range": get_score_range(credit_score),
            "last_updated": datetime.now().isoformat()
        }
    }