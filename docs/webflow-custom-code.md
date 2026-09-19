# Webflow custom code

Everything in Webflow's Site Settings → Custom Code, and what belongs where.

The dividing line: **third-party tags stay in Webflow, our own code lives in
this repo.** Tracking snippets are pasted by whoever owns the ad account and
need to be editable without a deploy; our CSS and JS need review, linting and
version history.

Analytics, ad and pixel scripts — gtag, LinkedIn Insight, and any pixel added
later — are **always added by hand in the Webflow dashboard**, never bundled
into `main.js`. This file documents what is pasted there so the two do not
drift; it is a record, not the source of truth. Webflow wins if they disagree.

---

## Site Settings → Custom Code → Head

```html
<!-- Google tag (gtag.js) — GA4 + Google Ads -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YNTGQP6YJK"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-YNTGQP6YJK');
  gtag('config', 'AW-16956415502');
</script>

<!-- LinkedIn Insight Tag -->
<script type="text/javascript">
  _linkedin_partner_id = '6875436';
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script>
<script type="text/javascript">
  (function (l) {
    if (!l) {
      window.lintrk = function (a, b) {
        window.lintrk.q.push([a, b]);
      };
      window.lintrk.q = [];
    }
    var s = document.getElementsByTagName('script')[0];
    var b = document.createElement('script');
    b.type = 'text/javascript';
    b.async = true;
    b.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    s.parentNode.insertBefore(b, s);
  })(window.lintrk);
</script>

<!-- Elfsight platform — powers the AI Chatbot and Announcement Bar widgets.
     The widget <div>s themselves go in Embed elements on the canvas, not here. -->
<script src="https://elfsightcdn.com/platform.js" async></script>

<!-- Armored Massage custom CSS — github.com/royeyal/armored-massage -->
<link rel="stylesheet" href="https://armored-massage-scripts.roy-eyal.workers.dev/main.css" />
```

### What changed from the previous head, and why

- **One `gtag.js` load instead of two.** The tag was included twice, once per
  measurement ID, each redefining `gtag()` and re-running `gtag('js', ...)`.
  One library load with two `config` calls is Google's documented setup for
  sending to multiple properties, and it removes a redundant ~90KB request.
- **LinkedIn moved from footer to head.** It was in the footer, which delays
  the pageview beacon until the rest of the page has parsed. It is async either
  way; head just fires it sooner.
- **The two Elfsight `<div>`s are gone from here.** Divs are not valid in
  `<head>` — the parser closes the head early and hoists them to the top of
  `<body>`, so the chatbot and announcement bar render wherever that lands
  rather than where you want them. Put each `<div class="elfsight-app-…">` in
  an Embed element on the canvas instead:
  - AI Chatbot — `<div class="elfsight-app-676a2143-6e58-4e37-bde8-8aff1a1ac434" data-elfsight-app-lazy></div>`
  - Announcement Bar — `<div class="elfsight-app-bd5e4798-c07a-4919-922d-f2de91d37d10" data-elfsight-app-lazy></div>`

  `platform.js` is loaded once here and picks up both widgets wherever they sit.
- **The `<noscript>` LinkedIn pixel moved to the footer**, which is the only
  Webflow field that puts it inside `<body>` where it is valid.

---

## Site Settings → Custom Code → Footer

```html
<!-- LinkedIn Insight Tag — noscript fallback pixel.
     Here rather than in Head: an <img> must be inside <body> to be valid, and
     the footer field is the only one Webflow puts there. -->
<noscript>
  <img
    height="1"
    width="1"
    style="display: none"
    alt=""
    src="https://px.ads.linkedin.com/collect/?pid=6875436&fmt=gif"
  />
</noscript>

<!-- Armored Massage custom JS — github.com/royeyal/armored-massage -->
<script src="https://armored-massage-scripts.roy-eyal.workers.dev/main.js" type="module"></script>
```

Everything that used to be inline here — `animateSplitTextHeadings`, the
sticky navbar `ScrollTrigger`, and `initContentRevealScroll` — now lives in
`src/js/` and ships in `main.js`.

**Delete the old inline `<script>` blocks when you paste this in.** Leaving
them would run the heading split twice over the same elements, which
double-wraps every word and line.

---

## GSAP

GSAP, ScrollTrigger and SplitText are loaded by Webflow's own GSAP integration
and used as globals. They are declared `external` in `vite.config.js`, so they
are never bundled — one GSAP on the page, one ScrollTrigger sharing one scroll
state.

If Webflow's GSAP setting is ever turned off, `main.js` logs one error and
stops rather than throwing from inside an animation.

The repo used to vendor `SplitText.min.js` and serve it over jsDelivr, from back
when SplitText was a paid Club GreenSock plugin. It has been free since GSAP
3.13, Webflow ships it, and that copy is now deleted.

---

## Deploying a change

```bash
npm run deploy
```

Builds to `dist/` with a new content hash and uploads the Worker. The URLs in
Webflow never change — `/main.js` and `/main.css` are served `no-cache`, so
browsers revalidate on each page load and pick up the new hash immediately.
No Webflow edit, no cache purge, and no re-publish of the site is needed.

To verify a deploy landed:

```bash
curl -sI https://armored-massage-scripts.roy-eyal.workers.dev/main.js | head -5
```
