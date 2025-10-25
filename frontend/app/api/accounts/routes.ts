const PYTHON_API_BASE_URL = "http://localhost:8000";

interface NessieAccount {
  _id: string;
  type: string;
  balance: number;
}

export async function GET(request: Request) {
  try {
    const urlCompleta = `${PYTHON_API_BASE_URL}/api/v1/accounts`;

    const response = await fetch(urlCompleta);

    const data: NessieAccount[] | { code: number, message: string } = await response.json();
    console.log("DATA: " , data, " ")

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {

    console.error("No se pudo conectar con el Backend de Python (verificar si está corriendo en 8000):", error);

    return new Response(
      JSON.stringify({ 
        code: 503, 
        message: "El servidor de Python para el análisis financiero no está disponible." 
      }), 
      {
        status: 503, 
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}