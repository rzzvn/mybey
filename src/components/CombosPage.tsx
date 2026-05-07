import { useState } from "react";
import { Wrench, BookOpen } from "lucide-react";
import { ui } from "../data/i18n";
import CommunityCombosTab from "./CommunityCombosTab";
import MyCombosTab from "./MyCombosTab";

export default function CombosPage() {
  const [tab, setTab] = useState<"community" | "my">("community");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTab("community")}
          className={`btn ${tab === "community" ? "btn-primary" : "btn-secondary"}`}
        >
          <BookOpen className="w-4 h-4" /> {ui.communityCombos}
        </button>
        <button
          onClick={() => setTab("my")}
          className={`btn ${tab === "my" ? "btn-primary" : "btn-secondary"}`}
        >
          <Wrench className="w-4 h-4" /> {ui.myCombos}
        </button>
      </div>

      {tab === "community" && <CommunityCombosTab />}
      {tab === "my" && <MyCombosTab />}
    </div>
  );
}
