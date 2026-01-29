import { Link, useRouteError } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function ErrorPage() {
  const err: any = useRouteError?.() || null;

  return (
    <div className="min-h-screen bg-bg text-slate-200">
      <div className="mx-auto max-w-4xl px-4 py-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[-200px] top-[-120px] h-[480px] w-[480px] rounded-full bg-violet-600/18 blur-3xl" />
          <div className="absolute right-[-220px] top-[120px] h-[520px] w-[520px] rounded-full bg-cyan-400/12 blur-3xl" />
        </div>

        <Card className="overflow-hidden">
          <CardContent className="relative p-8 md:p-10">
            <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-violet-600/18 blur-3xl" />
            <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-amber-400/10">
                  <AlertTriangle className="h-6 w-6 text-amber-200" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
                      Something went wrong
                    </h1>
                    <Badge variant="amber">Graceful failure</Badge>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    If this is an outage (AI or GLPI/Solman), ticket creation should still be preserved using fallback rules + sync queue.
                  </p>

                  {err && (
                    <pre className="mt-4 max-h-44 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-300">
                      {String(err?.statusText || err?.message || err)}
                    </pre>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="secondary">
                  <Link to="/">
                    Go to Landing <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="primary">
                  <Link to="/dashboard">
                    Back to Dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-slate-600">
          USTS — enterprise-grade, dark UI · All actions auditable · Clear error states
        </div>
      </div>
    </div>
  );
}