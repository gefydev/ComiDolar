import { useCallback, useEffect, useState } from "react";
import { listaGuardada, pedirDonantes, type Lista } from "@/lib/donantes";
import { formatearFecha } from "@/lib/formato";
export default function DonationGrid() {
  const [lista, setLista] = useState<Lista | null>(null);
  const [fallo, setFallo] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearElegido, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [sortConfig, setSortConfig] = useState({
    key: "total",
    direction: "descending",
  });

  const cargar = useCallback(async () => {
    try {
      setLista(await pedirDonantes());
      setFallo(false);
    } catch (error) {
      console.error("Error al pedir los donantes:", error);
      // Último valor conocido, con su fecha
      setLista(listaGuardada());
      setFallo(true);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- el estado cambia recién al responder la red
    cargar();
  }, [cargar]);

  const availableYears = [...new Set(lista?.donantes.map((d) => d.year))]
    .sort()
    .reverse();
  const selectedYear =
    availableYears.length && !availableYears.includes(yearElegido)
      ? availableYears[0]
      : yearElegido;
  const donationTable = (lista?.donantes ?? [])
    .filter((donor) => donor.year === selectedYear)
    .filter(
      (donor, index, self) =>
        index === self.findIndex((d) => d.name === donor.name),
    );

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedDonations = [...donationTable]
    .filter((donor) =>
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortConfig.key === "name") {
        return sortConfig.direction === "ascending"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortConfig.direction === "ascending"
          ? a.total - b.total
          : b.total - a.total;
      }
    });

  const isExpanded = visibleCount === sortedDonations.length;
  const toggleExpand = () => {
    setVisibleCount(isExpanded ? 7 : sortedDonations.length);
  };

  const getInitials = (name) => {
    const segments = name.match(/\b\w/g) || [];
    const length = segments.length;

    if (length === 2) return segments.slice(0, 2);
    if (length === 3) return segments.slice(0, 2);
    if (length > 3) return [segments[0], segments[2]];

    return segments;
  };

  if (!lista && fallo) {
    return (
      <div
        role="alert"
        className="w-full h-[500px] flex flex-col items-center justify-center text-center gap-4"
      >
        <p>No pudimos cargar los donantes.</p>
        <button
          onClick={cargar}
          className="bg-green-500 dark:bg-green-600 text-white py-2 px-4 rounded cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!lista) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center text-green-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="256px"
          height="256px"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="0" fill="currentColor">
            <animate
              id="svgSpinnersPulse30"
              fill="freeze"
              attributeName="r"
              begin="0;svgSpinnersPulse32.begin+0.4s"
              calcMode="spline"
              dur="1.2s"
              keySplines=".52,.6,.25,.99"
              values="0;11"
            />
            <animate
              fill="freeze"
              attributeName="opacity"
              begin="0;svgSpinnersPulse32.begin+0.4s"
              calcMode="spline"
              dur="1.2s"
              keySplines=".52,.6,.25,.99"
              values="1;0"
            />
          </circle>
          <circle cx="12" cy="12" r="0" fill="currentColor">
            <animate
              id="svgSpinnersPulse31"
              fill="freeze"
              attributeName="r"
              begin="svgSpinnersPulse30.begin+0.4s"
              calcMode="spline"
              dur="1.2s"
              keySplines=".52,.6,.25,.99"
              values="0;11"
            />
            <animate
              fill="freeze"
              attributeName="opacity"
              begin="svgSpinnersPulse30.begin+0.4s"
              calcMode="spline"
              dur="1.2s"
              keySplines=".52,.6,.25,.99"
              values="1;0"
            />
          </circle>
          <circle cx="12" cy="12" r="0" fill="currentColor">
            <animate
              id="svgSpinnersPulse32"
              fill="freeze"
              attributeName="r"
              begin="svgSpinnersPulse30.begin+0.8s"
              calcMode="spline"
              dur="1.2s"
              keySplines=".52,.6,.25,.99"
              values="0;11"
            />
            <animate
              fill="freeze"
              attributeName="opacity"
              begin="svgSpinnersPulse30.begin+0.8s"
              calcMode="spline"
              dur="1.2s"
              keySplines=".52,.6,.25,.99"
              values="1;0"
            />
          </circle>
        </svg>
      </div>
    );
  }
  return (
    <>
      <h2 className="text-xl font-bold mb-4">Tabla de Donaciones</h2>
      <div className="flex flex-col gap-4 mb-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="p-2 ring-0 rounded border ring-green-500 border-zinc-300 dark:border-zinc-600 bg-zinc-100/50 dark:bg-darkless/50 text-zinc-800 dark:text-white"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Buscar donante..."
          className="flex-1 p-2 ring-0 rounded border ring-green-500 border-zinc-300 dark:border-zinc-600 bg-zinc-100/50 dark:bg-darkless/50 text-zinc-800 dark:text-white dark:placeholder-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {fallo && (
        <p role="status" className="mb-2 text-sm">
          Sin conexión con la lista. Datos del{" "}
          {formatearFecha(lista.consultado)}.
        </p>
      )}
      <h3 className="text-lg font-semibold mb-4">
        Total:{" "}
        <span className="text-green-500">
          {donationTable
            .reduce((acc, donor) => acc + donor.total, 0)
            .toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
        </span>
      </h3>
      <input
        type="text"
        placeholder="Buscar donante..."
        className="mb-4 w-full p-2 ring-0 rounded border ring-green-500 border-zinc-300 dark:border-zinc-600 bg-zinc-100/50 dark:bg-darkless/50 text-zinc-800 dark:text-white dark:placeholder-white"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="flex flex-col bg-zinc-300/50 dark:bg-backgroundDark/50 text-zinc-800 dark:text-zinc-200 uppercase mb-2">
        <div className="flex px-3 gap-7">
          <img
            src="/assets/img/favicon.webp"
            className="h-8 w-8 mr-2"
            alt="Logo de ComiDolar"
          />
          <div className="flex items-center justify-between gap-2 w-full xl:text-[10px]">
            <span
              className="flex items-center justify-center text-center cursor-pointer w-full border-r border-green-500"
              onClick={() => handleSort("name")}
            >
              Nombre{" "}
              <span className="ml-[3px] text-green-500 xl:text-[8px]">
                {sortConfig.key === "name"
                  ? sortConfig.direction === "ascending"
                    ? "▲"
                    : "▼"
                  : ""}
              </span>
            </span>
            <span
              className="flex items-center justify-center text-center cursor-pointer w-full"
              onClick={() => handleSort("total")}
            >
              Total Donaciones
              <span className="ml-[3px] text-green-500 xl:text-[8px]">
                {sortConfig.key === "total"
                  ? sortConfig.direction === "ascending"
                    ? "▲"
                    : "▼"
                  : ""}
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {sortedDonations.slice(0, visibleCount).map((donor) => (
          <div
            key={donor.name}
            className="flex items-center xl:text-[10px] border-b border-zinc-300 dark:border-zinc-600 hover:bg-green-500/50 transition duration-200 p-2"
          >
            <span className="flex items-center justify-center bg-zinc-300/50 dark:bg-black/50 min-w-12 min-h-12 rounded-full text-lg font-semibold text-center">
              {getInitials(donor.name)}
            </span>
            <span className="flex-grow py-2 px-4">{donor.name}</span>
            <span className="flex-none py-2 px-4 text-right">
              {donor.total.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              })}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={toggleExpand}
        className="mt-4 bg-green-500 dark:bg-green-600 text-white py-2 px-4 rounded hover:bg-green-600 dark:hover:bg-green-700 transition duration-300"
      >
        {isExpanded ? "Ver menos" : "Ver todos"}
      </button>
    </>
  );
}
