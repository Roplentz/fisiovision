export function compare(engineResult,expectedStatus,expectedRepetitions){
  const automatic=engineResult.metrics.find(metric=>metric.id==="repetition_count")?.value??null;
  const expected=expectedStatus==="accepted"?expectedRepetitions:null;
  const statusMatch=engineResult.status===expectedStatus;
  const error=automatic===null||expected===null?null:Math.abs(automatic-expected);
  const outcome=!statusMatch?"status_mismatch":error!==null&&error!==0?"count_mismatch":expectedStatus==="rejected"||error!==null?"match":"not_comparable";
  return{statusMatch,automaticStatus:engineResult.status,expectedStatus,automaticRepetitions:automatic,expectedRepetitions:expected,repetitionAbsoluteError:error,outcome};
}
export function comparisonMarkdown(sampleId,c){
  const v=value=>value===null?"n/a":String(value);
  return `# Comparação — ${sampleId}\n\n| Indicador | Automático | Ground truth |\n|---|---:|---:|\n| Status | ${c.automaticStatus} | ${c.expectedStatus} |\n| Repetições | ${v(c.automaticRepetitions)} | ${v(c.expectedRepetitions)} |\n\n- Concordância de status: ${c.statusMatch?"sim":"não"}\n- Erro absoluto de contagem: ${v(c.repetitionAbsoluteError)}\n- Resultado: ${c.outcome}\n`;
}
