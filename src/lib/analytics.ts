/**
 * تحليلات خفيفة تحترم الخصوصية.
 * تعمل مع Umami أو Plausible إن وُجد سكربت محمّل، وإلا فتصمت دون أخطاء.
 * لا تُرسل أي بيانات شخصية، ولا تُخزَّن أي كوكيز من طرفنا.
 */
type Props = Record<string, string | number | boolean>;

type AnalyticsWindow = Window & {
  umami?: { track: (event: string, data?: Props) => void };
  plausible?: (event: string, options?: { props?: Props }) => void;
};

function provider(): AnalyticsWindow | null {
  return typeof window === 'undefined' ? null : (window as AnalyticsWindow);
}

export function track(event: string, props: Props = {}): void {
  const target = provider();
  if (!target) return;
  try {
    if (target.umami?.track) target.umami.track(event, props);
    else if (target.plausible) target.plausible(event, { props });
  } catch {
    // التحليلات لا يجوز أن تُعطّل الواجهة أبدًا.
  }
}

export function trackPageView(path: string): void {
  track('pageview', { path });
}
