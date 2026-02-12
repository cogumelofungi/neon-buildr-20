import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const TermsOfService = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const getDateFormat = () => {
    switch (language) {
      case "en":
        return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      case "es":
        return new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      default:
        return new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-app-bg p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("terms.back")}
        </Button>

        <Card className="bg-app-surface border-app-border p-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {t("terms.title")}
          </h1>

          <div className="space-y-6 text-app-muted">
            <p className="text-foreground">{t("terms.intro")}</p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("terms.section1.title")}
              </h2>
              <p>{t("terms.section1.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("terms.section2.title")}
              </h2>
              <p>{t("terms.section2.intro")}</p>
              <p className="mt-2">{t("terms.section2.requirement")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("terms.section3.title")}
              </h2>
              <p>{t("terms.section3.intro")}</p>
              
              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">
                {t("terms.section3.cancellation.title")}
              </h3>
              <p>{t("terms.section3.cancellation.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("terms.section4.title")}
              </h2>
              <p>{t("terms.section4.intro")}</p>
              <p className="mt-2">{t("terms.section4.declaration.intro")}</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>{t("terms.section4.declaration.item1")}</li>
                <li>{t("terms.section4.declaration.item2")}</li>
                <li>{t("terms.section4.declaration.item3")}</li>
              </ul>
              <p className="mt-2">{t("terms.section4.rights")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("terms.section5.title")}
              </h2>
              <p>{t("terms.section5.intro")}</p>
              <p className="mt-2">{t("terms.section5.not_responsible.intro")}</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>{t("terms.section5.not_responsible.item1")}</li>
                <li>{t("terms.section5.not_responsible.item2")}</li>
                <li>{t("terms.section5.not_responsible.item3")}</li>
                <li>{t("terms.section5.not_responsible.item4")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("terms.section6.title")}
              </h2>
              <p>{t("terms.section6.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("terms.section7.title")}
              </h2>
              <p>{t("terms.section7.intro")}</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>{t("terms.section7.item1")}</li>
                <li>{t("terms.section7.item2")}</li>
                <li>{t("terms.section7.item3")}</li>
                <li>{t("terms.section7.item4")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("terms.section8.title")}
              </h2>
              <p>{t("terms.section8.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("terms.section9.title")}
              </h2>
              <p>{t("terms.section9.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("terms.section10.title")}
              </h2>
              <p>{t("terms.section10.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("terms.section11.title")}
              </h2>
              <p>{t("terms.section11.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("terms.section12.title")}
              </h2>
              <p>{t("terms.section12.intro")}</p>
              <p className="mt-2">{t("terms.section12.email")}</p>
            </section>

            <p className="text-sm mt-8 pt-6 border-t border-app-border">
              {t("terms.last_updated")}: {getDateFormat()}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
