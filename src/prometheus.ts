export class ApiMetrics {
  private requests = new Map<string, number>();
  private durationSum = 0;
  private durationCount = 0;
  private fallbackCount = 0;

  observe(status: number, durationMs: number): void {
    const key = String(status);
    this.requests.set(key, (this.requests.get(key) ?? 0) + 1);
    this.durationSum += durationMs / 1000;
    this.durationCount += 1;
  }

  observeFallback(): void { this.fallbackCount += 1; }

  render(): string {
    const lines = [
      "# HELP fisiovision_http_requests_total Total HTTP requests by status.",
      "# TYPE fisiovision_http_requests_total counter",
      ...[...this.requests.entries()].map(([status, value]) => `fisiovision_http_requests_total{status="${status}"} ${value}`),
      "# HELP fisiovision_http_request_duration_seconds_sum Sum of request duration.",
      "# TYPE fisiovision_http_request_duration_seconds_sum counter",
      `fisiovision_http_request_duration_seconds_sum ${this.durationSum}`,
      `fisiovision_http_request_duration_seconds_count ${this.durationCount}`,
      "# HELP fisiovision_consumer_fallback_total Total consumer fallbacks.",
      "# TYPE fisiovision_consumer_fallback_total counter",
      `fisiovision_consumer_fallback_total ${this.fallbackCount}`,
    ];
    return lines.join("\n") + "\n";
  }
}
