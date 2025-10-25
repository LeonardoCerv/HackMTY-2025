from fastapi import FastAPI, HTTPException
import requests
from typing import List, Dict, Any

app = FastAPI(
    title="Nessie Customer Transactions Aggregator",
    description="Obtiene todas las transacciones de un cliente específico desde cuentas Savings y Credit Card.",
    version="1.2.0"
)

NESSIE_API_KEY = "5385334cd89925d890675e8cdd41c9c4"
NESSIE_BASE_URL = "http://api.nessieisreal.com"


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


@app.get("/transactions")
def get_transactions_for_customer(customer_index: int = 0):
    """
    Obtiene todas las transacciones de un cliente específico basado en su índice (por defecto el primero).
    """
    # 1️⃣ Obtener todos los clientes
    customers_url = f"{NESSIE_BASE_URL}/customers?key={NESSIE_API_KEY}"
    customers = fetch_from_nessie(customers_url)

    if not customers:
        raise HTTPException(status_code=404, detail="No se encontraron clientes en Nessie.")

    if customer_index >= len(customers):
        raise HTTPException(status_code=400, detail=f"El índice {customer_index} excede la cantidad de clientes disponibles.")

    # 2️⃣ Seleccionamos el cliente deseado
    customer = customers[customer_index]
    customer_id = customer["_id"]
    customer_name = f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip()

    # 3️⃣ Obtener las cuentas de ese cliente
    accounts_url = f"{NESSIE_BASE_URL}/customers/{customer_id}/accounts?key={NESSIE_API_KEY}"
    accounts = fetch_from_nessie(accounts_url)

    if not accounts:
        raise HTTPException(status_code=404, detail=f"No se encontraron cuentas para el cliente {customer_name}.")

    # 4️⃣ Filtramos las cuentas de tipo Savings o Credit Card
    target_accounts = [acc for acc in accounts if acc.get("type") in ["Savings", "Credit Card"]]

    if not target_accounts:
        raise HTTPException(status_code=404, detail="El cliente no tiene cuentas de tipo Savings o Credit Card.")

    all_tx = []

    # 5️⃣ Recolectar transacciones de cada cuenta
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

    # 6️⃣ Ordenar por fecha descendente
    all_tx.sort(key=lambda x: x.get("transaction_date", ""), reverse=True)

    # 7️⃣ Respuesta final
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
