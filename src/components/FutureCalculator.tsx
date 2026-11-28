import React, { useState } from "react";
import {
  UBA_FACULTIES,
  CBC_SUBJECTS,
  CNBA_APPROVED_5TH,
  PELLE_APPROVED_5TH,
  } from "../db/carrerasUba";

export default function FutureCalculator() {
  const [colegio, setColegio] = useState<"cnba" | "pelle">("cnba");
  const [selectedFacultyIdx, setSelectedFacultyIdx] = useState<number>(0);
  const [selectedCareerId, setSelectedCareerId] = useState<string>(
    UBA_FACULTIES[0].careers[0].id,
  );

  const selectedFaculty = UBA_FACULTIES[selectedFacultyIdx];
  const selectedCareer =
    selectedFaculty.careers.find((c) => c.id === selectedCareerId) ||
    selectedFaculty.careers[0];

  // 1. Obtener equivalencias de 5to año
  const approved5thList =
    colegio === "cnba" ? CNBA_APPROVED_5TH : PELLE_APPROVED_5TH;

  const {
    compulsorySubjects,
    electiveSubjects,
    quantityTotal,
    quantityToChoose,
    sixthYearPath,
  } = selectedCareer;

  // --- LÓGICA CAMINO A: 5TO AÑO + CBC UBA ---
  // Obligatorias aprobadas y pendientes
  const approvedCompulsory = compulsorySubjects.filter((code) =>
    approved5thList.includes(code),
  );
  const pendingCompulsory = compulsorySubjects.filter(
    (code) => !approved5thList.includes(code),
  );

  // Electivas aprobadas en 5to año
  const approvedElectivesIn5th = electiveSubjects.filter((code) =>
    approved5thList.includes(code),
  );
  // Cuántas electivas cubre el colegio del cupo
  const numApprovedElectives = Math.min(
    approvedElectivesIn5th.length,
    quantityToChoose,
  );
  // Las electivas que efectivamente rellenamos
  const filledElectives = approvedElectivesIn5th.slice(0, numApprovedElectives);
  // Cuántas electivas quedan pendientes por rendir
  const numPendingElectives = quantityToChoose - numApprovedElectives;
  // Opciones de electivas restantes a elegir en la UBA
  const remainingElectiveOptions = electiveSubjects.filter(
    (code) => !filledElectives.includes(code),
  );

  // Totales camino 5to año
  const totalApproved5th = approvedCompulsory.length + numApprovedElectives;
  const percentage5th =
    quantityTotal > 0
      ? Math.round((totalApproved5th / quantityTotal) * 100)
      : 0;

  const totalPending5th = pendingCompulsory.length + numPendingElectives;

  // Estimación temporal del CBC Directo
  let cbcTimeEstimate: string;
  let cbcEntryDate: string;

  if (totalPending5th === 0) {
    cbcTimeEstimate = "0 cuatrimestres (¡Ingresás directo!)";
    cbcEntryDate = "Marzo de 2027 (Inmediato)";
  } else if (totalPending5th <= 2) {
    cbcTimeEstimate = "1 cuatrimestre";
    cbcEntryDate = "Agosto de 2027 (Ingreso a mitad de año)";
  } else if (totalPending5th <= 4) {
    cbcTimeEstimate = "1 a 2 cuatrimestres (Según tu ritmo)";
    cbcEntryDate = "Agosto de 2027 / Marzo de 2028";
  } else {
    cbcTimeEstimate = "2 cuatrimestres (1 año completo)";
    cbcEntryDate = "Marzo de 2028";
  }

  // --- LÓGICA CAMINO B: 6TO AÑO ---
  const sixthYearPathInfo =
    colegio === "cnba" ? sixthYearPath.cnba : sixthYearPath.pelle;
  const {
    orientation: sixthOrientation,
    coveredCompulsory,
    coveredElectives,
    notes: sixthNotes,
  } = sixthYearPathInfo;

  // Electivas de la carrera que se ofrecen en la orientación de 6to de su colegio
  const sixthCoveredElectivesInOffer = electiveSubjects.filter((code) =>
    coveredElectives.includes(code),
  );
  // Cuántas cubre el 6to del cupo total de la carrera
  const numSixthCoveredElectives = Math.min(
    sixthCoveredElectivesInOffer.length,
    quantityToChoose,
  );
  const sixthFilledElectives = sixthCoveredElectivesInOffer.slice(
    0,
    numSixthCoveredElectives,
  );
  // Electivas que el alumno tendrá que rendir en sede de todos modos
  const numSixthPendingElectives = quantityToChoose - numSixthCoveredElectives;

  // Totales camino 6to año
  const totalApprovedSixth =
    coveredCompulsory.length + numSixthCoveredElectives;
  const percentageSixth =
    quantityTotal > 0
      ? Math.round((totalApprovedSixth / quantityTotal) * 100)
      : 0;

  const isCbcRecommended = totalPending5th <= 2;

  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value);
    setSelectedFacultyIdx(idx);
    setSelectedCareerId(UBA_FACULTIES[idx].careers[0].id);
  };

  const handleCareerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCareerId(e.target.value);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Selector de Colegio */}
      <div className="flex flex-col items-center mb-10">
        <h2 className="text-xl font-medium mb-4 text-zinc-600 dark:text-zinc-300">
          Seleccioná tu colegio secundario:
        </h2>
        <div className="inline-flex p-1 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-xl">
          <button
            onClick={() => setColegio("cnba")}
            aria-pressed={colegio === "cnba"}
            className={`min-h-11 px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
              colegio === "cnba"
                ? "bg-[var(--brand)] text-[var(--on-brand)] scale-105"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
            }`}
          >
            CNBA (Nacional de Buenos Aires)
          </button>
          <button
            onClick={() => setColegio("pelle")}
            aria-pressed={colegio === "pelle"}
            className={`min-h-11 px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
              colegio === "pelle"
                ? "bg-[var(--brand)] text-[var(--on-brand)] scale-105"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
            }`}
          >
            PELLE (Carlos Pellegrini)
          </button>
        </div>
      </div>

      {/* Selectores de Carrera */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 bg-zinc-100/50 dark:bg-darkless/50 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div>
          <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-300">
            Facultad de la UBA:
          </label>
          <select
            aria-label="Facultad"
            value={selectedFacultyIdx}
            onChange={handleFacultyChange}
            className="w-full p-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-xl transition"
          >
            {UBA_FACULTIES.map((fac, idx) => (
              <option key={fac.name} value={idx}>
                {fac.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-300">
            Carrera elegida:
          </label>
          <select
            aria-label="Carrera"
            value={selectedCareerId}
            onChange={handleCareerChange}
            className="w-full p-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-xl transition"
          >
            {selectedFaculty.careers.map((car) => (
              <option key={car.id} value={car.id}>
                {car.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Título de Carrera y Veredicto Inicial */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-3">
          {selectedCareer.name}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-6">
          Esta carrera requiere un total de{" "}
          <span className="font-bold text-[var(--link)]">
            {quantityTotal} materias
          </span>{" "}
          en el Ciclo Básico Común (CBC)
          {quantityToChoose > 0 &&
            (
              <>
                {" "}
                ({compulsorySubjects.length} obligatorias fijas y elegir{" "}
                {quantityToChoose} electivas)
              </>
            ).valueOf()}
          .
        </p>

        {/* Recomendación Dinámica */}
        <div
          className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl border ${
            isCbcRecommended
              ? "bg-green-500/10 border-green-500/30 text-green-800 dark:text-green-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
          }`}
        >
          <span className="text-2xl">💡</span>
          <div className="text-left">
            <p className="font-bold">Recomendación para tu trayecto:</p>
            <p className="text-sm">
              {isCbcRecommended
                ? `Te conviene egresar en 5to y hacer el CBC. Solo te quedan ${totalPending5th} materias y podés terminarlas en un cuatrimestre.`
                : `Hacer 6to año te cubre un ${percentageSixth}% del CBC, pero evaluá si preferís adelantar las ${totalPending5th} materias del CBC por tu cuenta.`}
            </p>
          </div>
        </div>
      </div>

      {/* Los Dos Caminos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-12 text-left">
        {/* CAMINO A: Egresar en 5to y hacer el CBC UBA */}
        <div className="flex flex-col bg-zinc-100/50 dark:bg-darkless/50 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
          <div className="p-6 bg-green-500/10 border-b border-zinc-200/50 dark:border-zinc-800/50">
            <span className="text-sm font-bold uppercase tracking-wider text-[var(--link)] bg-green-500/10 px-3 py-1 rounded-full">
              Camino Rápido
            </span>
            <h3 className="text-2xl font-bold mt-2 text-zinc-900 dark:text-white">
              Opción 5to año + CBC UBA
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Egresar de 5to y completar las materias restantes directo en la
              UBA.
            </p>
          </div>

          <div className="p-6 flex-grow flex flex-col justify-between">
            <div>
              {/* Barra de progreso */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    Avance total del CBC:
                  </span>
                  <span className="text-lg font-bold text-[var(--link)]">
                    {percentage5th}%
                  </span>
                </div>
                <div className="w-full bg-zinc-300 dark:bg-zinc-800 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage5th}%` }}
                  ></div>
                </div>
                <p className="text-sm text-[var(--muted)] mt-2">
                  ({totalApproved5th} de {quantityTotal} materias cubiertas)
                </p>
              </div>

              {/* Seccion 1: Materias Obligatorias */}
              <div className="mb-6">
                <h4 className="font-bold text-sm text-[var(--muted)] uppercase tracking-wider mb-3">
                  1. Materias Obligatorias Fijas ({compulsorySubjects.length}):
                </h4>
                <div className="space-y-2">
                  {compulsorySubjects.map((subjCode) => {
                    const subject = CBC_SUBJECTS[subjCode] || {
                      code: subjCode,
                      name: "Materia",
                    };
                    const isApproved = approved5thList.includes(subjCode);
                    return (
                      <div
                        key={subjCode}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${
                          isApproved
                            ? "bg-green-500/5 border-green-500/20 text-green-800 dark:text-green-300"
                            : "bg-zinc-200/30 dark:bg-zinc-800/30 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <span
                          className={`text-xl font-bold ${
                            isApproved ? "text-[var(--link)]" : "text-zinc-400"
                          }`}
                        >
                          {isApproved ? "✓" : "○"}
                        </span>
                        <div className="flex-grow">
                          <p className="font-semibold text-sm">
                            {subject.name}
                          </p>
                          <p className="text-sm text-[var(--muted)]">
                            {isApproved
                              ? `Equivalencia automática (Código ${subject.code})`
                              : `Pendiente de rendir (Código ${subject.code})`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Seccion 2: Electivas */}
              {quantityToChoose > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-sm text-[var(--muted)] uppercase tracking-wider mb-2">
                    2. Materias Electivas (Elegir {quantityToChoose}):
                  </h4>

                  {/* Mensaje Pedagogico de Relleno de Electivas */}
                  <div className="p-3 bg-zinc-200/50 dark:bg-zinc-800/40 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 mb-3 border border-zinc-300/30 dark:border-zinc-700/30">
                    💡 <strong>Asignación óptima de electivas:</strong> El
                    colegio te aprueba automáticamente{" "}
                    {approvedElectivesIn5th.length} de las opciones del pool
                    electivo. El sistema las seleccionó prioritariamente para
                    cubrir tu cupo.
                  </div>

                  <div className="space-y-2">
                    {/* Electivas rellenas / aprobadas por el colegio */}
                    {filledElectives.map((subjCode) => {
                      const subject = CBC_SUBJECTS[subjCode] || {
                        code: subjCode,
                        name: "Materia",
                      };
                      return (
                        <div
                          key={subjCode}
                          className="flex items-center gap-3 p-3 rounded-xl border bg-green-500/5 border-green-500/20 text-green-800 dark:text-green-300"
                        >
                          <span className="text-xl font-bold text-[var(--link)]">
                            ✓
                          </span>
                          <div className="flex-grow">
                            <p className="font-semibold text-sm">
                              {subject.name}
                            </p>
                            <p className="text-sm text-[var(--muted)]">
                              Aprobada y asignada al cupo (Código {subject.code}
                              )
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Electivas que le quedan pendientes al alumno */}
                    {numPendingElectives > 0 && (
                      <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2">
                          Pendiente: Debés cursar y rendir {numPendingElectives}{" "}
                          de las siguientes opciones:
                        </p>
                        <ul className="space-y-1 pl-4 list-disc text-sm text-zinc-600 dark:text-zinc-400">
                          {remainingElectiveOptions.map((subjCode) => {
                            const subject = CBC_SUBJECTS[subjCode] || {
                              code: subjCode,
                              name: "Materia",
                            };
                            return (
                              <li key={subjCode}>
                                {subject.name} (Código {subject.code})
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Estimaciones y Conclusión */}
            <div className="p-4 bg-zinc-200/50 dark:bg-zinc-800/30 rounded-xl space-y-2 border border-zinc-300/30 dark:border-zinc-700/30">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Materias a rendir en UBA:
                </span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  {totalPending5th} materias
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Tiempo estimado:
                </span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  {cbcTimeEstimate}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Ingreso a carrera:
                </span>
                <span className="font-bold text-[var(--link)]">{cbcEntryDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CAMINO B: Hacer el 6to año en el Colegio */}
        <div className="flex flex-col bg-zinc-100/50 dark:bg-darkless/50 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
          <div className="p-6 bg-green-500/10 border-b border-zinc-200/50 dark:border-zinc-800/50">
            <span className="text-sm font-bold uppercase tracking-wider text-[var(--link)] bg-green-500/10 px-3 py-1 rounded-full">
              Camino Tradicional
            </span>
            <h3 className="text-2xl font-bold mt-2 text-zinc-900 dark:text-white">
              Opción 6to Año ({colegio.toUpperCase()})
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Hacer el 6º año optativo en tu colegio para cubrir los contenidos
              del CBC.
            </p>
          </div>

          <div className="p-6 flex-grow flex flex-col justify-between">
            <div>
              {/* Orientación escolar */}
              <div className="mb-6">
                <span className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider block mb-1">
                  Orientación / Trayecto a cursar:
                </span>
                <p className="text-base font-bold text-[var(--link)]">
                  {sixthOrientation}
                </p>
              </div>

              {/* Avance del CBC con 6to año */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    Cobertura del CBC en 6to:
                  </span>
                  <span className="text-lg font-bold text-[var(--link)]">
                    {percentageSixth}%
                  </span>
                </div>
                <div className="w-full bg-zinc-300 dark:bg-zinc-800 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentageSixth}%` }}
                  ></div>
                </div>
                <p className="text-sm text-[var(--muted)] mt-2">
                  ({totalApprovedSixth} de {quantityTotal} materias cubiertas)
                </p>
              </div>

              {/* Seccion 1: Obligatorias en 6to */}
              <div className="mb-6">
                <h4 className="font-bold text-sm text-[var(--muted)] uppercase tracking-wider mb-3">
                  1. Cobertura de Obligatorias:
                </h4>
                <div className="space-y-2">
                  {compulsorySubjects.map((subjCode) => {
                    const subject = CBC_SUBJECTS[subjCode] || {
                      code: subjCode,
                      name: "Materia",
                    };
                    const isCovered = coveredCompulsory.includes(subjCode);
                    return (
                      <div
                        key={subjCode}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${
                          isCovered
                            ? "bg-green-500/5 border-green-500/20 text-green-800 dark:text-green-300"
                            : "bg-red-500/5 border-red-500/20 text-red-800 dark:text-red-300"
                        }`}
                      >
                        <span
                          className={`text-xl font-bold ${
                            isCovered ? "text-[var(--link)]" : "text-red-500"
                          }`}
                        >
                          {isCovered ? "✓" : "✗"}
                        </span>
                        <div className="flex-grow">
                          <p className="font-semibold text-sm">
                            {subject.name}
                          </p>
                          <p className="text-sm text-[var(--muted)]">
                            {isCovered
                              ? "Aprobada cursando 6º Año"
                              : "Deberá rendirse por fuera en sede del CBC"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Seccion 2: Electivas en 6to */}
              {quantityToChoose > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-sm text-[var(--muted)] uppercase tracking-wider mb-2">
                    2. Cobertura de Electivas:
                  </h4>

                  <div className="space-y-2">
                    {sixthFilledElectives.map((subjCode) => {
                      const subject = CBC_SUBJECTS[subjCode] || {
                        code: subjCode,
                        name: "Materia",
                      };
                      return (
                        <div
                          key={subjCode}
                          className="flex items-center gap-3 p-3 rounded-xl border bg-green-500/5 border-green-500/20 text-green-800 dark:text-green-300"
                        >
                          <span className="text-xl font-bold text-[var(--link)]">
                            ✓
                          </span>
                          <div className="flex-grow">
                            <p className="font-semibold text-sm">
                              {subject.name}
                            </p>
                            <p className="text-sm text-[var(--muted)]">
                              Aprobada cursando 6º Año (Asignada al cupo)
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {numSixthPendingElectives > 0 && (
                      <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-red-800 dark:text-red-300 text-sm">
                        <strong>Pendiente:</strong> Debés rendir{" "}
                        {numSixthPendingElectives} electiva(s) en sede del CBC
                        por no estar cubiertas en el plan escolar de 6to.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notas de 6to año */}
              {sixthNotes && (
                <div className="mb-6 p-3 bg-zinc-200/50 dark:bg-zinc-800/40 border-l-4 border-green-500 rounded text-sm text-zinc-600 dark:text-zinc-400 text-left">
                  <strong>Nota del plan de estudios:</strong> {sixthNotes}
                </div>
              )}
            </div>

            {/* Estimaciones y Conclusión */}
            <div className="p-4 bg-zinc-200/50 dark:bg-zinc-800/30 rounded-xl space-y-2 border border-zinc-300/30 dark:border-zinc-700/30">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Duración en el colegio:
                </span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  1 año (marzo a diciembre)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Ingreso a carrera:
                </span>
                <span className="font-bold text-[var(--link)]">Marzo de 2028</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Pros y Contras Pedagógico */}
      <div className="bg-zinc-100/50 dark:bg-darkless/50 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 text-left mb-10">
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
          <span>🧐</span> ¿Cómo tomar la decisión adecuada?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-[var(--link)] mb-3 flex items-center gap-2">
              <span>🚀</span> Egresar en 5to + CBC Directo
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li>
                <strong>Ahorro de Tiempo:</strong> Si tu carrera te reconoce
                casi todo, hacer el CBC tradicional es más rápido (1
                cuatrimestre) y te permite ingresar a cursar en la facultad a
                mitad de año.
              </li>
              <li>
                <strong>Relleno Automático:</strong> El sistema de equivalencias
                de la UBA te permite usar tus materias aprobadas de 5to año para
                rellenar de manera automática el cupo de electivas, evitándote
                tener que rendirlas.
              </li>
              <li>
                <strong>Flexibilidad:</strong> Podés cursar las materias
                restantes a través de UBA XXI e ir organizando tus propios
                horarios de estudio.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[var(--link)] mb-3 flex items-center gap-2">
              <span>🏫</span> Hacer el 6to Año en el Colegio
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li>
                <strong>Entorno Conocido:</strong> Compartís la cursada nocturna
                un año más con tus compañeros y profesores de secundaria en las
                aulas de tu colegio.
              </li>
              <li>
                <strong>Seguridad Administrativa:</strong> Al aprobar las
                materias anuales de 6to, se te acreditan de forma automática en
                el SIU Guaraní del CBC.
              </li>
              <li>
                <strong>Materias Anuales:</strong> Cursar el CBC de forma anual
                da más margen de estudio que el régimen cuatrimestral acelerado
                de la UBA.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Descarga de Documentación Oficial */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href="/docs/RESCS-2026-03373199-UBA-REC.pdf"
          target="_blank"
          className="min-h-11 flex items-center gap-2 text-sm font-semibold px-4 py-2 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
        >
          <span>📄</span> Res. CBC UBA 5to (RESCS-2026-03373199)
        </a>
        <a
          href="/docs/sexto_cnba.pdf"
          target="_blank"
          className="min-h-11 flex items-center gap-2 text-sm font-semibold px-4 py-2 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
        >
          <span>📄</span> Plan 6to Año CNBA (PDF)
        </a>
        <a
          href="/docs/sexto_pelle.pdf"
          target="_blank"
          className="min-h-11 flex items-center gap-2 text-sm font-semibold px-4 py-2 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
        >
          <span>📄</span> Plan 6to Año PELLE (PDF)
        </a>
      </div>

      {/* Disclaimer y Botón de Reporte */}
      <div className="mt-12 p-6 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl text-center max-w-2xl mx-auto">
        <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
          ⚠️ <strong>Disclaimer de información:</strong> Los planes de estudio y
          equivalencias se basan en resoluciones oficiales de la UBA vigentes
          para 2025/2026. Sin embargo, los planes de carreras pueden cambiar y
          esta herramienta no reemplaza el trámite ni el asesoramiento oficial
          del Departamento de Alumnos de tu Facultad.
        </p>
        <a
          href="https://wa.me/5491127556546?text=Hola%20Gena!%20Encontr%C3%A9%20un%20error%20en%20las%20equivalencias%20de%20Tu%20Futuro%20en%20ComiD%C3%B3lar%20con%20la%20carrera..."
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-11 inline-flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl transition duration-300 transform hover:scale-105 bg-[var(--brand)] text-[var(--on-brand)]"
        >
          <span>💬</span> Reportar Error por WhatsApp
        </a>
      </div>
    </div>
  );
}
