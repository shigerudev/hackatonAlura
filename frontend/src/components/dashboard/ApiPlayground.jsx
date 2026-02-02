import { useState } from 'react';
import { apiFetch } from '../../utils/api';

export default function ApiPlayground() {
  const [endpoint, setEndpoint] = useState('/churn/predict');
  const [method, setMethod] = useState('POST');
  // Muestras validadas segun backend ChurnRequest (nombres y tipos exactos)
  const samples = {
    cancela: JSON.stringify({
      gender: 'Female',
      SeniorCitizen: 1,
      Partner: 'No',
      Dependents: 'No',
      tenure: 1,
      PhoneService: 'Yes',
      MultipleLines: 'No',
      InternetService: 'Fiber optic',
      OnlineSecurity: 'No',
      OnlineBackup: 'No',
      DeviceProtection: 'No',
      TechSupport: 'No',
      StreamingTV: 'Yes',
      StreamingMovies: 'Yes',
      Contract: 'Month-to-month',
      PaperlessBilling: 'Yes',
      PaymentMethod: 'Electronic check',
      MonthlyCharges: 95.7,
      TotalCharges: 95.7
    }, null, 2),
    noCancela: JSON.stringify({
      gender: 'Male',
      SeniorCitizen: 0,
      Partner: 'Yes',
      Dependents: 'Yes',
      tenure: 72,
      PhoneService: 'Yes',
      MultipleLines: 'Yes',
      InternetService: 'DSL',
      OnlineSecurity: 'Yes',
      OnlineBackup: 'Yes',
      DeviceProtection: 'Yes',
      TechSupport: 'Yes',
      StreamingTV: 'No',
      StreamingMovies: 'No',
      Contract: 'Two year',
      PaperlessBilling: 'No',
      PaymentMethod: 'Bank transfer (automatic)',
      MonthlyCharges: 45.3,
      TotalCharges: 3250.8
    }, null, 2)
  };

  const [sampleKey, setSampleKey] = useState('cancela');
  const [requestBody, setRequestBody] = useState(samples.cancela);
  const [responseBody, setResponseBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProcess = async () => {
    setLoading(true);
    setError('');
    setResponseBody('');

    try {
      let body = undefined;
      if (method !== 'GET' && requestBody.trim()) {
        try {
          body = JSON.parse(requestBody);
        } catch (e) {
          setError('El JSON de la solicitud no es válido.');
          setLoading(false);
          return;
        }
      }

      const res = await apiFetch(endpoint, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      });

      const contentType = res.headers.get('content-type') || '';
      let text = '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        text = JSON.stringify(json, null, 2);
      } else {
        text = await res.text();
      }

      setResponseBody(text);
      if (!res.ok) {
        setError(`Error ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      setError('Error de conexión o de procesamiento.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-playground w-full max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">API Playground</h1>
        <p className="text-gray-400 mt-1">Prueba endpoints del backend con un editor JSON simple.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <select
              className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
              <option>PATCH</option>
            </select>
            <input
              className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/churn/predict"
            />
          </div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm text-gray-400">Request JSON</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Ejemplo:</span>
              <select
                className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                value={sampleKey}
                onChange={(e) => {
                  const k = e.target.value;
                  setSampleKey(k);
                  setRequestBody(samples[k]);
                }}
              >
                <option value="cancela">Va a cancelar</option>
                <option value="noCancela">No cancela</option>
              </select>
            </div>
          </div>
          <textarea
            className="w-full h-[360px] bg-black/40 border border-white/10 rounded-xl p-3 font-mono text-sm text-white resize-none"
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            spellCheck={false}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleProcess}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Procesar Solicitud'}
            </button>
          </div>
          {error && (
            <div className="mt-3 text-alert-red text-sm">{error}</div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <label className="block text-sm text-gray-400 mb-2">Respuesta</label>
          <pre className="w-full h-[420px] bg-black/40 border border-white/10 rounded-xl p-3 font-mono text-sm text-neon-cyan overflow-auto whitespace-pre-wrap">
{responseBody || '// Ejecuta la solicitud para ver la respuesta aquí...'}
          </pre>
        </div>
      </div>
    </div>
  );
}
