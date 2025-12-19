import React, { useState, useMemo } from 'react';
import {
  Network,
  ChevronRight,
  ChevronDown,
  Bot,
  User,
  X,
  Search,
  Zap
} from 'lucide-react';

// --- DATA STRUCTURE ---
const PROCESS_DATA = [
  {
    id: "1",
    title: "1. Marketing & Captación",
    icon: "Megaphone",
    tasks: [
      { id: "1.1", name: "Definir segmentos", role: "Dirección / Marketing", crit: "Alta", score: "A1", agent: "Agente de research de mercado", desc: "IA analiza datos históricos y mercado, propone segmentación." },
      { id: "1.2", name: "Investigación de competencia", role: "Marketing", crit: "Media", score: "A2", agent: "Agente de inteligencia competitiva", desc: "Scrapeo de info pública y resumen de competidores." },
      { id: "1.3", name: "Plan de contenidos", role: "Marketing", crit: "Media", score: "A2", agent: "Content planner agent", desc: "Propuesta de calendario y temas." },
      { id: "1.4", name: "Redacción de contenidos", role: "Marketing", crit: "Media", score: "A3", agent: "Content writer agent", desc: "Delegable a IA con revisión rápida." },
      { id: "1.5", name: "Diseño de campañas", role: "Marketing", crit: "Alta", score: "A1", agent: "Campaign strategist agent", desc: "Sugerencia de estructura y mensajes." },
      { id: "1.6", name: "Landing de captura", role: "Marketing / Producto", crit: "Alta", score: "A2", agent: "UX + copy agent", desc: "Generación de textos y variantes A/B." },
      { id: "1.7", name: "Nurturing de leads", role: "Marketing / Ventas", crit: "Alta", score: "A3", agent: "Lead nurturing agent", desc: "Secuencias automáticas según comportamiento." },
      { id: "1.8", name: "Scoring de leads", role: "Ventas / CRM", crit: "Alta", score: "A3", agent: "Lead scoring agent", desc: "Cálculo dinámico de calidad de lead." },
      { id: "1.9", name: "Consolidación origen", role: "Marketing / Admin", crit: "Media", score: "A3", agent: "Data cleaning agent", desc: "Etiquetado automático por UTM." },
      { id: "1.10", name: "Reporte semanal", role: "Dirección", crit: "Alta", score: "A3", agent: "Reporting agent", desc: "Dashboard + resumen ejecutivo." }
    ]
  },
  {
    id: "2",
    title: "2. Gestión de Leads y Matriculación",
    icon: "Users",
    tasks: [
      { id: "2.1", name: "Recepción solicitud", role: "Front office", crit: "Alta", score: "A3", agent: "Lead intake agent", desc: "Creación de ficha en CRM y normalización." },
      { id: "2.2", name: "Conversación inicial", role: "Asesor académico", crit: "Alta", score: "A2", agent: "Sales concierge agent", desc: "Guía de conversación y opciones." },
      { id: "2.3", name: "Test de nivel online", role: "Profesor", crit: "Alta", score: "A3", agent: "Placement test agent", desc: "Test adaptativo + análisis automático." },
      { id: "2.4", name: "Propuesta de curso", role: "Asesor académico", crit: "Alta", score: "A2", agent: "Offer builder agent", desc: "Armado de propuesta según catálogo." },
      { id: "2.5", name: "Envío oferta", role: "Comercial", crit: "Alta", score: "A3", agent: "Proposal sending agent", desc: "Automatizable tras decisión." },
      { id: "2.6", name: "Registro follow-up", role: "Comercial", crit: "Media", score: "A3", agent: "CRM agent", desc: "Creación de tareas y recordatorios." },
      { id: "2.7", name: "Gestión objeciones", role: "Comercial", crit: "Alta", score: "A1", agent: "Sales coach agent", desc: "Sugerencia de argumentarios en tiempo real." },
      { id: "2.8", name: "Cierre / Contrato", role: "Comercial", crit: "Crítica", score: "A1", agent: "Contract drafting agent", desc: "Preparación documental supervisada." },
      { id: "2.9", name: "Creación matrícula", role: "Admin", crit: "Crítica", score: "A3", agent: "Enrollment agent", desc: "Alta en sistema tras firma." },
      { id: "2.10", name: "Generación RGPD", role: "Legal", crit: "Crítica", score: "A2", agent: "Document builder agent", desc: "Composición de contratos legales." },
      { id: "2.11", name: "Cobro inicial", role: "Admin", crit: "Crítica", score: "A2", agent: "Billing agent", desc: "Inicio de cobro vía pasarela." }
    ]
  },
  {
    id: "3",
    title: "3. Onboarding de Alumno",
    icon: "UserPlus",
    tasks: [
      { id: "3.1", name: "Bienvenida", role: "Admin", crit: "Media", score: "A3", agent: "Onboarding agent", desc: "Email/WhatsApp con accesos." },
      { id: "3.2", name: "Asignación grupo", role: "Coord. Académico", crit: "Alta", score: "A2", agent: "Scheduling agent", desc: "Propuesta de mejor grupo." },
      { id: "3.3", name: "Usuario LMS", role: "IT", crit: "Alta", score: "A3", agent: "LMS provisioning agent", desc: "Alta vía API 100%." },
      { id: "3.4", name: "Entrega docu", role: "Admin", crit: "Media", score: "A3", agent: "Document delivery agent", desc: "Envío de normas y calendario." },
      { id: "3.5", name: "Recordatorio 1ª clase", role: "Admin", crit: "Media", score: "A3", agent: "Reminder agent", desc: "Mensaje automático fecha/hora." },
      { id: "3.6", name: "Mini encuesta", role: "Coord. Académico", crit: "Media", score: "A3", agent: "Survey agent", desc: "Expectativas y objetivos." },
      { id: "3.7", name: "Config objetivos", role: "Profesor", crit: "Alta", score: "A1", agent: "Goal advisor agent", desc: "Propuesta de metas lingüísticas." }
    ]
  },
  {
    id: "4",
    title: "4. Diseño Académico",
    icon: "BookOpen",
    tasks: [
      { id: "4.1", name: "Diseño catálogo", role: "Dirección", crit: "Crítica", score: "A1", agent: "Curriculum design agent", desc: "Estructura basada en CEFR." },
      { id: "4.2", name: "Diseño syllabus", role: "Dirección", crit: "Crítica", score: "A1", agent: "Syllabus generator agent", desc: "Temarios por semana." },
      { id: "4.3", name: "Selección material", role: "Dirección", crit: "Alta", score: "A1", agent: "Resource curator agent", desc: "Propuesta de libros/apps." },
      { id: "4.4", name: "Planificación anual", role: "Operaciones", crit: "Alta", score: "A1", agent: "Planning agent", desc: "Simulación de escenarios." },
      { id: "4.5", name: "Criterios evaluación", role: "Dirección", crit: "Alta", score: "A0", agent: "N/A", desc: "Pedagógico/Político." },
      { id: "4.6", name: "Diseño rúbricas", role: "Dirección", crit: "Media", score: "A2", agent: "Rubric builder agent", desc: "Generación de criterios de corrección." },
      { id: "4.7", name: "Mapeo certificados", role: "Dirección", crit: "Alta", score: "A1", agent: "Certification mapping agent", desc: "Ajuste a Cambridge/TOEFL." },
      { id: "4.8", name: "Actividades modelo", role: "Docente", crit: "Media", score: "A2", agent: "Activity generator agent", desc: "Banco de actividades." }
    ]
  },
  {
    id: "5",
    title: "5. Planificación Horaria",
    icon: "Calendar",
    tasks: [
      { id: "5.1", name: "Disponibilidad prof", role: "RRHH", crit: "Alta", score: "A3", agent: "Availability agent", desc: "Consolidación de formularios." },
      { id: "5.2", name: "Definir slots", role: "Coord.", crit: "Alta", score: "A2", agent: "Timetable agent", desc: "Propuesta de parrillas." },
      { id: "5.3", name: "Asignación grupos", role: "Coord.", crit: "Crítica", score: "A2", agent: "Group scheduling agent", desc: "Casar demanda con slots." },
      { id: "5.4", name: "Asignación profes", role: "Coord.", crit: "Crítica", score: "A1", agent: "Matchmaking agent", desc: "Sugerencia por afinidad." },
      { id: "5.5", name: "Asignación aulas", role: "Admin", crit: "Alta", score: "A3", agent: "Room allocation agent", desc: "Gestión de capacidad física." },
      { id: "5.6", name: "Gestión cambios", role: "Coord.", crit: "Alta", score: "A2", agent: "Rescheduling agent", desc: "Re-sugerencia por bajas." },
      { id: "5.7", name: "Notificación horario", role: "Admin", crit: "Media", score: "A3", agent: "Calendar sync agent", desc: "Envío de ICS/Calendar." }
    ]
  },
  {
    id: "6",
    title: "6. Impartición (Operaciones)",
    icon: "Presentation",
    tasks: [
      { id: "6.1", name: "Tomar asistencia", role: "Profesor", crit: "Alta", score: "A2", agent: "Attendance agent", desc: "Registro auto/validado." },
      { id: "6.2", name: "Log de contenido", role: "Profesor", crit: "Alta", score: "A2", agent: "Lesson logger agent", desc: "Resumen de sesión." },
      { id: "6.3", name: "Resumen alumnos", role: "Profesor", crit: "Media", score: "A3", agent: "Lesson summarizer agent", desc: "Nota de voz a texto para alumnos." },
      { id: "6.4", name: "Gestión tareas", role: "Profesor", crit: "Alta", score: "A2", agent: "Homework agent", desc: "Asignación y corrección parcial." },
      { id: "6.5", name: "Soporte clase", role: "Profesor", crit: "Alta", score: "A1", agent: "Classroom copilot agent", desc: "Ayuda en tiempo real." },
      { id: "6.6", name: "Incidencias", role: "Profesor", crit: "Media", score: "A2", agent: "Incident logging agent", desc: "Reporte de conducta/técnico." },
      { id: "6.7", name: "Recordatorios", role: "Sistema", crit: "Media", score: "A3", agent: "Reminder agent", desc: "Avisos de entrega." }
    ]
  },
  {
    id: "7",
    title: "7. Evaluación y Seguimiento",
    icon: "Award",
    tasks: [
      { id: "7.1", name: "Creación exámenes", role: "Dirección", crit: "Alta", score: "A1", agent: "Exam generator agent", desc: "Propuesta de tests." },
      { id: "7.2", name: "Corrección auto", role: "Sistema", crit: "Alta", score: "A3", agent: "Auto-grading agent", desc: "Corrección directa." },
      { id: "7.3", name: "Corrección writing", role: "Profesor", crit: "Alta", score: "A2", agent: "Writing evaluator agent", desc: "Pre-evaluación con rúbrica." },
      { id: "7.4", name: "Corrección speaking", role: "Profesor", crit: "Crítica", score: "A1", agent: "Speaking feedback agent", desc: "Sugerencia de feedback." },
      { id: "7.5", name: "Cálculo notas", role: "Sistema", crit: "Crítica", score: "A3", agent: "Grade calculator agent", desc: "Media ponderada automática." },
      { id: "7.6", name: "Informes progreso", role: "Profesor", crit: "Alta", score: "A2", agent: "Progress report agent", desc: "Generación de texto reporte." },
      { id: "7.7", name: "Certificados", role: "Admin", crit: "Alta", score: "A3", agent: "Certificate agent", desc: "Emisión de PDFs." },
      { id: "7.8", name: "Inscripción oficial", role: "Admin", crit: "Alta", score: "A1", agent: "Exam registration agent", desc: "Gestión con organismos." }
    ]
  },
  {
    id: "8",
    title: "8. Atención y Fidelización",
    icon: "HeartHandshake",
    tasks: [
      { id: "8.1", name: "Consultas generales", role: "Recepción", crit: "Alta", score: "A3", agent: "FAQ / support bot", desc: "Chatbot 24/7." },
      { id: "8.2", name: "Reclamaciones", role: "Dirección", crit: "Crítica", score: "A1", agent: "Sentiment analysis agent", desc: "Priorización de quejas." },
      { id: "8.3", name: "Check-in post-onboard", role: "Coord.", crit: "Media", score: "A3", agent: "Check-in agent", desc: "Contacto automático de satisfacción." },
      { id: "8.4", name: "Encuestas", role: "Calidad", crit: "Alta", score: "A3", agent: "Survey agent", desc: "Lanzamiento y recolección." },
      { id: "8.5", name: "Fidelización", role: "Marketing", crit: "Media", score: "A2", agent: "Loyalty agent", desc: "Propuesta de descuentos/referidos." },
      { id: "8.6", name: "Recuperación", role: "Ventas", crit: "Alta", score: "A3", agent: "Win-back agent", desc: "Campañas a inactivos." }
    ]
  },
  {
    id: "9",
    title: "9. Facturación y Finanzas",
    icon: "BadgeDollarSign",
    tasks: [
      { id: "9.1", name: "Generación facturas", role: "Admin", crit: "Crítica", score: "A3", agent: "Billing agent", desc: "Masivo mensual." },
      { id: "9.2", name: "Recibos (SEPA)", role: "Admin", crit: "Crítica", score: "A2", agent: "Payment agent", desc: "Creación de remesas." },
      { id: "9.3", name: "Conciliación", role: "Contabilidad", crit: "Alta", score: "A2", agent: "Reconciliation agent", desc: "Cruce banco vs sistema." },
      { id: "9.4", name: "Gestión impagos", role: "Admin", crit: "Crítica", score: "A2", agent: "Dunning agent", desc: "Secuencia de cobro." },
      { id: "9.5", name: "Reporte financiero", role: "CFO", crit: "Alta", score: "A3", agent: "Finance reporting agent", desc: "Dashboards automáticos." },
      { id: "9.6", name: "Presupuestos", role: "Dirección", crit: "Alta", score: "A1", agent: "Forecasting agent", desc: "Modelado de escenarios." }
    ]
  },
  {
    id: "10",
    title: "10. RRHH y Profesorado",
    icon: "Briefcase",
    tasks: [
      { id: "10.1", name: "Ofertas empleo", role: "RRHH", crit: "Media", score: "A3", agent: "Job posting agent", desc: "Publicación multi-portal." },
      { id: "10.2", name: "Screening CVs", role: "RRHH", crit: "Alta", score: "A2", agent: "CV screening agent", desc: "Filtrado inicial." },
      { id: "10.3", name: "Entrevistas", role: "RRHH", crit: "Media", score: "A3", agent: "Scheduling agent", desc: "Agendado automático." },
      { id: "10.4", name: "Onboarding profe", role: "RRHH", crit: "Alta", score: "A2", agent: "HR onboarding agent", desc: "Documentación y accesos." },
      { id: "10.5", name: "Performance", role: "Dirección", crit: "Alta", score: "A1", agent: "Performance analytics agent", desc: "KPIs docentes." },
      { id: "10.6", name: "Formación interna", role: "Dirección", crit: "Media", score: "A1", agent: "Training planner agent", desc: "Planificación workshops." }
    ]
  },
  {
    id: "11",
    title: "11. Contenidos y LMS",
    icon: "Database",
    tasks: [
      { id: "11.1", name: "Alta cursos LMS", role: "IT", crit: "Alta", score: "A3", agent: "LMS curator agent", desc: "Setup inicial." },
      { id: "11.2", name: "Subida materiales", role: "Admin", crit: "Media", score: "A2", agent: "Content uploader agent", desc: "Ingesta de archivos." },
      { id: "11.3", name: "Generación Quizzes", role: "Profes", crit: "Media", score: "A3", agent: "Quiz generator agent", desc: "Auto-creación." },
      { id: "11.4", name: "Analytics uso", role: "Dirección", crit: "Media", score: "A3", agent: "Content analytics agent", desc: "Métricas de consumo." },
      { id: "11.5", name: "Ciclo de vida", role: "IT", crit: "Media", score: "A2", agent: "Content lifecycle agent", desc: "Limpieza obsoletos." }
    ]
  },
  {
    id: "12",
    title: "12. Estrategia y Reporting",
    icon: "LineChart",
    tasks: [
      { id: "12.1", name: "OKRs", role: "Dirección", crit: "Crítica", score: "A1", agent: "Strategy copilot agent", desc: "Seguimiento objetivos." },
      { id: "12.2", name: "KPIs mensuales", role: "Dirección", crit: "Alta", score: "A3", agent: "Executive dashboard agent", desc: "Visión global." },
      { id: "12.3", name: "Rentabilidad", role: "Finanzas", crit: "Alta", score: "A2", agent: "Profitability agent", desc: "Margen por curso." },
      { id: "12.4", name: "Expansión", role: "Dirección", crit: "Crítica", score: "A0", agent: "N/A", desc: "Decisión humana pura." },
      { id: "12.5", name: "Satisfacción global", role: "Dirección", crit: "Alta", score: "A2", agent: "Sentiment + NPS agent", desc: "Agregado de feedback." }
    ]
  },
  {
    id: "13",
    title: "13. IT y Datos",
    icon: "Server",
    tasks: [
      { id: "13.1", name: "Infraestructura", role: "IT", crit: "Crítica", score: "A2", agent: "Infra monitor agent", desc: "Uptime y backups." },
      { id: "13.2", name: "Roles y permisos", role: "IT", crit: "Crítica", score: "A2", agent: "Access control agent", desc: "Seguridad accesos." },
      { id: "13.3", name: "Auditoría logs", role: "IT", crit: "Alta", score: "A2", agent: "Audit trail agent", desc: "Rastreo de uso." },
      { id: "13.4", name: "RGPD Compliance", role: "Legal", crit: "Crítica", score: "A1", agent: "Compliance copilot agent", desc: "Gestión derechos ARCO." },
      { id: "13.5", name: "Limpieza datos", role: "Data", crit: "Media", score: "A3", agent: "Data cleaning agent", desc: "Deduplicación." }
    ]
  }
];

interface Task {
  id: string;
  name: string;
  role: string;
  crit: string;
  score: string;
  agent: string;
  desc: string;
}

interface ScoreBadgeProps {
  score: string;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  const styles: Record<string, string> = {
    "A0": "bg-gray-200 text-gray-700 border-gray-300",
    "A1": "bg-blue-100 text-blue-700 border-blue-300",
    "A2": "bg-purple-100 text-purple-700 border-purple-300",
    "A3": "bg-emerald-100 text-emerald-700 border-emerald-300"
  };

  const labels: Record<string, string> = {
    "A0": "Humano",
    "A1": "Copiloto",
    "A2": "Híbrido",
    "A3": "Autónomo"
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono border ${styles[score] || styles["A0"]}`}>
      {score} - {labels[score]}
    </span>
  );
};

interface DetailPanelProps {
  task: Task | null;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white border-l border-gray-200 shadow-2xl p-6 overflow-y-auto z-50">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
        <X size={24} />
      </button>

      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{task.name}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <ScoreBadge score={task.score} />
            <span className={`px-2 py-0.5 rounded text-xs border ${task.crit === 'Crítica' ? 'bg-red-100 border-red-300 text-red-700' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
              {task.crit}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Descripción</h3>
            <p className="text-gray-700">{task.desc}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Rol Responsable</h3>
              <div className="flex items-center gap-2 text-gray-700">
                <User size={16} />
                <span className="text-sm">{task.role}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Score IA</h3>
              <div className="flex items-center gap-2 text-gray-700">
                <Zap size={16} />
                <span className="text-sm">{task.score}</span>
              </div>
            </div>
          </div>

          {task.score !== 'A0' && (
            <div className="bg-primary-50 p-4 rounded-xl border border-primary-200">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                <Bot size={16} />
                Agente Sugerido
              </h3>
              <p className="text-gray-900 font-medium text-lg mb-1">{task.agent}</p>
              <p className="text-primary-600 text-sm">
                Recomendado para automatización
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
             <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Configuración JSON</h3>
             <div className="bg-gray-900 p-3 rounded-xl text-xs font-mono text-green-400 overflow-x-auto">
               {`{
  "task_name": "${task.name}",
  "agent_type": "${task.agent}",
  "criticality": "${task.crit}",
  "automation_level": "${task.score}"
}`}
             </div>
             <button
               className="mt-3 w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors"
               onClick={() => {
                 navigator.clipboard.writeText(JSON.stringify({
                   task_name: task.name,
                   agent_type: task.agent,
                   criticality: task.crit,
                   automation_level: task.score
                 }, null, 2));
               }}
             >
               Copiar JSON
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type FilterScore = "ALL" | "A0" | "A1" | "A2" | "A3";

export function ProcessMapPage() {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterScore, setFilterScore] = useState<FilterScore>("ALL");

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const filteredData = useMemo(() => {
    if (filterScore === "ALL") return PROCESS_DATA;
    return PROCESS_DATA.map(group => ({
      ...group,
      tasks: group.tasks.filter(t => t.score === filterScore)
    })).filter(group => group.tasks.length > 0);
  }, [filterScore]);

  useMemo(() => {
    if (filterScore !== "ALL") {
      const allIds: Record<string, boolean> = {};
      PROCESS_DATA.forEach(g => allIds[g.id] = true);
      setExpandedGroups(allIds);
    }
  }, [filterScore]);

  const totalTasks = PROCESS_DATA.reduce((acc, g) => acc + g.tasks.length, 0);
  const a3Tasks = PROCESS_DATA.reduce((acc, g) => acc + g.tasks.filter(t => t.score === 'A3').length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Network className="h-7 w-7 text-primary" />
            Mapa de Procesos
          </h1>
          <p className="text-gray-500 mt-1">
            Explora los procesos y oportunidades de automatización con IA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-900">{totalTasks}</span> tareas totales
            {" "}-{" "}
            <span className="font-medium text-emerald-600">{a3Tasks}</span> automatizables
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">Filtrar por nivel:</span>
          {[
            { id: "ALL" as FilterScore, label: "Todos", color: "bg-gray-500" },
            { id: "A3" as FilterScore, label: "A3 Autónomo", color: "bg-emerald-500" },
            { id: "A2" as FilterScore, label: "A2 Híbrido", color: "bg-purple-500" },
            { id: "A1" as FilterScore, label: "A1 Copiloto", color: "bg-blue-500" },
            { id: "A0" as FilterScore, label: "A0 Manual", color: "bg-gray-400" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterScore(filter.id)}
              className={`
                px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2
                ${filterScore === filter.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              <div className={`w-2 h-2 rounded-full ${filter.color}`} />
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              const all: Record<string, boolean> = {};
              PROCESS_DATA.forEach(g => all[g.id] = true);
              setExpandedGroups(all);
            }}
            className="px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm text-gray-600 transition-colors"
          >
            Expandir todo
          </button>
          <button
            onClick={() => setExpandedGroups({})}
            className="px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm text-gray-600 transition-colors"
          >
            Colapsar todo
          </button>
        </div>
      </div>

      {/* Process Tree */}
      <div className="space-y-4">
        {filteredData.map((group) => {
          const isExpanded = expandedGroups[group.id];
          const activeCount = group.tasks.length;
          const a3Count = group.tasks.filter(t => t.score === 'A3').length;

          return (
            <div key={group.id} className="relative">
              {/* Macro Process Node */}
              <div
                onClick={() => toggleGroup(group.id)}
                className={`
                  relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200
                  ${isExpanded
                    ? 'bg-white border-primary shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-colors
                    ${isExpanded ? 'bg-primary border-primary text-white' : 'bg-gray-100 border-gray-200 text-gray-500'}
                  `}>
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className={`text-base font-semibold ${isExpanded ? 'text-primary' : 'text-gray-900'}`}>
                      {group.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {activeCount} tareas - {a3Count} automatizables
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="hidden md:flex flex-col items-end gap-1 w-32">
                  <div className="text-xs text-gray-500">Potencial IA</div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${activeCount > 0 ? (a3Count / activeCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sub-Tasks */}
              {isExpanded && (
                <div className="ml-6 pl-6 py-3 space-y-2 border-l-2 border-gray-200">
                  {group.tasks.map((task) => {
                    const isSelected = selectedTask?.id === task.id;

                    let borderColor = "border-gray-200 hover:border-gray-300";
                    if (task.score === "A3") borderColor = "border-emerald-200 hover:border-emerald-400";
                    if (task.score === "A2") borderColor = "border-purple-200 hover:border-purple-400";
                    if (task.score === "A1") borderColor = "border-blue-200 hover:border-blue-400";

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`
                          relative p-3 rounded-xl border bg-white cursor-pointer transition-all hover:shadow-sm
                          flex items-center justify-between
                          ${isSelected ? 'ring-2 ring-primary border-primary' : borderColor}
                        `}
                      >
                        {/* Horizontal connector */}
                        <div className="absolute top-1/2 -left-6 w-6 h-0.5 bg-gray-200" />

                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0
                            ${task.score === 'A3' ? 'bg-emerald-500' :
                              task.score === 'A2' ? 'bg-purple-500' :
                              task.score === 'A1' ? 'bg-blue-500' : 'bg-gray-400'}
                          `} />
                          <span className="text-sm font-medium text-gray-900">{task.name}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 hidden sm:block">{task.role}</span>
                          <ScoreBadge score={task.score} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No se encontraron procesos con este filtro.</p>
        </div>
      )}

      {/* Detail Panel Slide-over */}
      {selectedTask && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelectedTask(null)}
          />
          <DetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
        </>
      )}
    </div>
  );
}
