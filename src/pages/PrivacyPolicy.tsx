import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const PrivacyPolicy = () => {
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
          {t("privacy.back")}
        </Button>

        <Card className="bg-app-surface border-app-border p-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {t("privacy.title")}
          </h1>

          <div className="space-y-6 text-app-muted">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("privacy.section1.title")}
              </h2>
              <p>{t("privacy.section1.intro")}</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>{t("privacy.section1.item1")}</li>
                <li>{t("privacy.section1.item2")}</li>
                <li>{t("privacy.section1.item3")}</li>
                <li>{t("privacy.section1.item4")}</li>
              </ul>
              <p className="mt-2">{t("privacy.section1.footer")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("privacy.section2.title")}
              </h2>
              <p>{t("privacy.section2.intro")}</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>{t("privacy.section2.item1")}</li>
                <li>{t("privacy.section2.item2")}</li>
                <li>{t("privacy.section2.item3")}</li>
                <li>{t("privacy.section2.item4")}</li>
                <li>{t("privacy.section2.item5")}</li>
              </ul>
              <p className="mt-2">{t("privacy.section2.footer")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("privacy.section3.title")}
              </h2>
              <p>{t("privacy.section3.intro")}</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>{t("privacy.section3.item1")}</li>
                <li>{t("privacy.section3.item2")}</li>
              </ul>
              <p className="mt-2">{t("privacy.section3.footer")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("privacy.section4.title")}
              </h2>
              <p>{t("privacy.section4.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("privacy.section5.title")}
              </h2>
              <p>{t("privacy.section5.intro")}</p>
              <p className="mt-2">{t("privacy.section5.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("privacy.section6.title")}
              </h2>
              <p>{t("privacy.section6.intro")}</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>{t("privacy.section6.item1")}</li>
                <li>{t("privacy.section6.item2")}</li>
                <li>{t("privacy.section6.item3")}</li>
              </ul>
              <p className="mt-2">{t("privacy.section6.footer")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("privacy.section7.title")}
              </h2>
              <p>{t("privacy.section7.intro")}</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>{t("privacy.section7.item1")}</li>
                <li>{t("privacy.section7.item2")}</li>
                <li>{t("privacy.section7.item3")}</li>
                <li>{t("privacy.section7.item4")}</li>
                <li>{t("privacy.section7.item5")}</li>
              </ul>
              <p className="mt-2">{t("privacy.section7.footer")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("privacy.section8.title")}
              </h2>
              <p>{t("privacy.section8.intro")}</p>
              <p className="mt-2">{t("privacy.section8.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("privacy.section9.title")}
              </h2>
              <p>{t("privacy.section9.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("privacy.section10.title")}
              </h2>
              <p>{t("privacy.section10.content")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("privacy.section11.title")}
              </h2>
              <p>{t("privacy.section11.content")}</p>
              <p className="mt-2">{t("privacy.section11.email")}</p>
              <p>{t("privacy.section11.website")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {t("privacy.section12.title")}
              </h2>
              <p>{t("privacy.section12.content")}</p>
            </section>

            <p className="text-sm mt-8 pt-6 border-t border-app-border">
              {t("privacy.last_updated")}: {getDateFormat()}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
