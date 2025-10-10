import React, { useState, useMemo, useEffect } from "react";
import { BiMap, BiExpandAlt} from "react-icons/bi";
import { useGetParcelasInactivasQuery } from "../services/inactive";
import { Modal } from "./ui/modal";

type Parcela = {
  id: string | number;
  nombre?: string;
  ubicacion?: string;
  "tamaño"?: number;
  ectarias?: string;
  activa?: boolean;
  [key: string]: any;
};

const PAGE_SIZE = 6;

const DeletedParcelasList: React.FC = () => {
  const { data: parcelas, error, isLoading } = useGetParcelasInactivasQuery();

  const loading = isLoading;
  const fetchError = error;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Parcela | null>(null);

  // search + pagination state
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    // reset page if parcelas change or query changes
    setPage(1);
  }, [parcelas, query]);

  const openModal = (p: Parcela) => {
    setSelected(p);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setSelected(null);
  };

  // parse ubicacion string -> array of [lat, lng]
  const parsedCoords = useMemo(() => {
    if (!selected || !selected.ubicacion) return null;
    try {
      const parsed = JSON.parse(selected.ubicacion);
      if (!Array.isArray(parsed) || parsed.length === 0) return null;
      return parsed
        .map((pt: any) => {
          if (Array.isArray(pt) && pt.length >= 2) return [Number(pt[0]), Number(pt[1])];
          if (pt && typeof pt.lat === "number" && typeof pt.lng === "number") return [pt.lat, pt.lng];
          return null;
        })
        .filter(Boolean) as [number, number][];
    } catch {
      return null;
    }
  }, [selected]);

  // filtering
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!parcelas) return [];
    if (!normalizedQuery) return parcelas;
    return parcelas.filter((p: Parcela) => {
      const q = normalizedQuery;
      const fields = [
        String(p.id ?? "").toLowerCase(),
        String(p.nombre ?? "").toLowerCase(),
        String(p.ubicacion ?? "").toLowerCase(),
      ];
      return fields.some((f) => f.includes(q));
    });
  }, [parcelas, normalizedQuery]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  if (loading)
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600" />
          <div className="text-sm text-gray-600">Cargando parcelas eliminadas...</div>
        </div>
      </div>
    );

  if (fetchError)
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-lg p-4">
          Error cargando parcelas eliminadas.
        </div>
      </div>
    );

  if (!parcelas || parcelas.length === 0)
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 text-gray-600">No hay parcelas eliminadas.</div>
      </div>
    );

  const renderSvgPreview = (coords: [number, number][] | null) => {
    if (!coords || coords.length === 0)
      return (
        <div className="flex items-center justify-center w-full h-56 bg-gray-100 text-gray-400">
          Sin datos de ubicación
        </div>
      );

    const lats = coords.map((c) => c[0]);
    const lons = coords.map((c) => c[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const w = 600;
    const h = 360;
    const pad = 20;

    const lonRange = maxLon - minLon || 1;
    const latRange = maxLat - minLat || 1;

    const points = coords
      .map(([lat, lon]) => {
        const x = pad + ((lon - minLon) / lonRange) * (w - pad * 2);
        const y = pad + ((maxLat - lat) / latRange) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(" ");

    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLon = lons.reduce((a, b) => a + b, 0) / lons.length;
    const cx = pad + ((avgLon - minLon) / lonRange) * (w - pad * 2);
    const cy = pad + ((maxLat - avgLat) / latRange) * (h - pad * 2);

    return (
      <div className="w-full h-56 bg-white border rounded overflow-hidden shadow-inner">
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#edf2f7" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width={w} height={h} fill="url(#g)" />
          <polyline points={points} fill="#10B98133" stroke="#059669" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={4} fill="#059669" stroke="#fff" strokeWidth={1} />
        </svg>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Search & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, ubicación..."
            className="w-64 px-3 py-2 border border-gray-100 shadow-sm rounded bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <div className="text-sm text-gray-500 dark:text-gray-200">Resultados: {total}</div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-1 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 shadow-sm rounded bg-white disabled:opacity-50"
          >
            Prev
          </button>
          <div className="px-2">Página {currentPage} / {totalPages}</div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 shadow-sm rounded bg-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Cards grid de las parcelas inactivas limitadas a 6 a la vez */}
      {paginated.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow p-6 text-gray-600">No se encontraron parcelas para la búsqueda.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((p: Parcela) => {
            const tamanio = p["tamaño"] !== undefined ? Number(p["tamaño"]) : undefined;
            const estado = p.activa ? "Inactiva" : "Eliminada";
            const badgeStyle = p.activa ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800";

            return (
              <article
                key={p.id}
                className="relative bg-white border border-gray-100 dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow-sm p-5 flex flex-col justify-between"
              >
                <header className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">{p.nombre ?? `Parcela ${p.id}`}</h3>
                  </div>

                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeStyle}`}>
                    {estado}
                  </span>
                </header>

                <div className="mt-4 text-sm text-gray-600 flex-1">
                  <ul className="mt-4 space-y-2 text-xs text-gray-500">
                    {p.ubicacion && (
                      <li className="flex items-center gap-2">
                        <BiMap className="text-gray-400 dark:text-gray-100" />
                        <span className="truncate dark:text-gray-200">{p.ubicacion}</span>
                      </li>
                    )}
                    {tamanio !== undefined && (
                      <li className="flex items-center gap-2">
                        <BiExpandAlt className="text-gray-400 dark:text-gray-200" />
                        <span>{tamanio.toFixed(4)}</span>
                      </li>
                    )}
                    {p.ectarias && (
                      <li className="flex items-center gap-2">
                        <span className="text-gray-400 dark:text-gray-100">Hectáreas:</span>
                        <span className="text-gray-600 dark:text-gray-200">{p.ectarias}</span>
                      </li>
                    )}
                  </ul>
                </div>

                <footer className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(p)}
                      className="text-sm px-3 py-2 border dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 border-gray-200 rounded text-gray-600 hover:bg-gray-200"
                    >
                      Ver
                    </button>
                  </div>

                  {/* <div className="flex items-center gap-2">
                    <button
                      onClick={() => console.log("Restaurar parcela", p.id)}
                      className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <BiRefresh />
                      Reactivar Parcela
                    </button>
                  </div> */}
                </footer>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={open}
        onClose={closeModal}
        className="max-w-2xl mx-auto"
        showCloseButton
        title={selected ? `${selected.nombre ?? `Parcela ${selected.id}`}` : undefined}
      >
        {selected && (
          <div className="space-y-4">
            {/* preview mapa / zona */}
            {renderSvgPreview(parsedCoords)}

            {/* detalles */}
            <div className="text-sm text-gray-700 space-y-2">
              {selected.ubicacion && (
                <div>
                  <p className="font-medium dark:text-gray-100">Coordenadas:</p>
                  <pre className="mt-1 text-xs bg-gray-50 p-2 rounded text-gray-600 overflow-auto" style={{ maxHeight: 160 }}>
                    {selected.ubicacion}
                  </pre>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                {selected["tamaño"] !== undefined && (
                  <div className="px-2 py-1 bg-gray-50 rounded">{Number(selected["tamaño"]).toFixed(4)}</div>
                )}
                {selected.ectarias && <div className="px-2 py-1 bg-gray-50 rounded">Hectáreas: {selected.ectarias}</div>}
                <div className={`px-2 py-1 rounded ${selected.activa ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                  {selected.activa ? "Inactiva" : "Eliminada"}
                </div>
              </div>
            </div>

            {/* acciones */}
            <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-100  shadow-sm rounded bg-white hover:bg-gray-50">
                Cerrar
              </button>

              <button
                onClick={() => {
                  console.log("Restaurar desde modal", selected?.id);
                  closeModal();
                }}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Reactivar Parcela
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeletedParcelasList;