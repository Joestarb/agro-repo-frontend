import React from "react";
import { Link } from "react-router-dom";
import { BiChevronLeft } from "react-icons/bi";
import DeletedParcelasList from "../../../components/DeletedParcelasList";

const InactiveParcelasView: React.FC = () => {
  return (
    <main className="min-h-screen p-6 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Parcelas eliminadas
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-200 text-md">
              Listado de parcelas marcadas como inactivas o eliminadas. Aquí puedes
              revisar y restaurar registros.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/parcelas"
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded bg-white text-sm text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <BiChevronLeft className="text-lg" />
              Volver a parcelas
            </Link>

            <button
              type="button"
              className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
              onClick={() => window.location.reload()}
            >
              Actualizar
            </button>
          </div>
        </div>

        <section>
          <DeletedParcelasList />
        </section>
      </div>
    </main>
  );
};

export default InactiveParcelasView;