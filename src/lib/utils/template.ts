// prompt_template の {{variable}} を実際の入力値で置換
export function renderTemplate(template: string, inputs: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => inputs[key] ?? '');
}
