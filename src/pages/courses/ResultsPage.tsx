import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { Award, RefreshCw, Download, Linkedin, CheckCircle, XCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Course, Certificate } from "@/types/database";

interface LocationState {
  score: number;
  passed: boolean;
  passingScore: number;
}

export function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const state = location.state as LocationState | undefined;
  const [course, setCourse] = useState<Course | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);

  useEffect(() => {
    if (!state) {
      navigate(`/courses/${id}`);
      return;
    }

    if (state.passed) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#1E40AF", "#F59E0B", "#10B981"],
      });
    }

    fetchCourseData();
  }, [id, state]);

  const fetchCourseData = async () => {
    if (!id || !user) return;

    try {
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      setCourse(courseData);

      // Check for existing certificate
      const { data: certData } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", id)
        .single();

      setCertificate(certData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const generateCertificate = async () => {
    if (!user || !course || !id) return;

    setGeneratingCertificate(true);

    try {
      // In a real implementation, this would generate a PDF
      // For now, we'll just create a certificate record
      const certificateUrl = `/certificates/${id}-${user.id}.pdf`;

      const { data, error } = await supabase
        .from("certificates")
        .insert({
          user_id: user.id,
          course_id: id,
          issued_at: new Date().toISOString(),
          certificate_url: certificateUrl,
        })
        .select()
        .single();

      if (error) throw error;
      setCertificate(data);
    } catch (error) {
      console.error("Error generating certificate:", error);
    } finally {
      setGeneratingCertificate(false);
    }
  };

  if (!state) {
    return null;
  }

  const { score, passed, passingScore } = state;

  return (
    <div className="max-w-lg mx-auto space-y-6 text-center">
      {/* Result card */}
      <Card className="overflow-hidden">
        <div
          className={`p-8 ${
            passed
              ? "bg-gradient-to-br from-success-50 to-success-100"
              : "bg-gradient-to-br from-error-50 to-error-100"
          }`}
        >
          <div
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
              passed ? "bg-success" : "bg-error"
            }`}
          >
            {passed ? (
              <CheckCircle className="h-10 w-10 text-white" />
            ) : (
              <XCircle className="h-10 w-10 text-white" />
            )}
          </div>
        </div>

        <CardContent className="pt-6 space-y-4">
          <h1
            className={`text-2xl font-bold ${
              passed ? "text-success" : "text-error"
            }`}
          >
            {passed ? "¡Felicidades!" : "No has aprobado"}
          </h1>

          <p className="text-gray-600">
            {passed
              ? "Has completado el examen con éxito."
              : "No te preocupes, puedes intentarlo de nuevo."}
          </p>

          <div className="py-4">
            <div className="text-5xl font-bold text-gray-900">{score}%</div>
            <p className="text-sm text-gray-500 mt-1">
              Nota mínima requerida: {passingScore}%
            </p>
          </div>

          {passed ? (
            <div className="space-y-3">
              {certificate ? (
                <a
                  href={certificate.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Certificado
                  </Button>
                </a>
              ) : (
                <Button
                  onClick={generateCertificate}
                  disabled={generatingCertificate}
                  className="w-full"
                >
                  <Award className="mr-2 h-4 w-4" />
                  {generatingCertificate
                    ? "Generando..."
                    : "Generar Certificado"}
                </Button>
              )}

              <Button variant="outline" className="w-full">
                <Linkedin className="mr-2 h-4 w-4" />
                Compartir en LinkedIn
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => navigate(`/courses/${id}/exam`)}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar Examen
            </Button>
          )}

          <Link to="/courses">
            <Button variant="ghost" className="w-full mt-2">
              Volver a Mis Cursos
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
