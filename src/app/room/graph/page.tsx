import { GothicPage } from "@/components/mucha/Gothic";
import { GraphView } from "@/components/graph/GraphView";
import { getTheme } from "@/lib/day-theme";
import { gothicFor } from "@/lib/kimi-palettes";
import { SCORE_FONT_BODY } from "@/lib/score-colors";
import { loadGraphData } from "@/lib/graph-data";

// /room/graph — knowledge-graph constellation. canon 拉真 KG; V2 ship 合成 demo
// 图 (lib/graph-data.ts), 接后端后换 loadGraphData (docs/BACKENDS.md).

export const dynamic = "force-dynamic";

export default async function GraphPage() {
  const theme = await getTheme();
  const G = gothicFor(theme);
  const data = await loadGraphData();

  return (
    <GothicPage G={G}>
      <div style={{ fontFamily: SCORE_FONT_BODY }}>
        <GraphView G={G} data={data} theme={theme} />
      </div>
    </GothicPage>
  );
}
