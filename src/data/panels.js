/*
  REAL DATA - Hollywood 2024, N = 136.
  Aggregates computed from hollywood_2024_model.csv (see /scripts or the
  analysis pass). filmdata.json is generated; do not hand-edit its numbers.

  Four sub-trend panels ride the horizontal filmstrip; MAIN is the closing
  full-width graph (digital attention vs commercial success).
*/
import data from "./filmdata.json";

export const MAIN = {
  title: "Does attention sell tickets?",
  stat: { value: "The Hype Effect: Cut in Half by Budget", label: "TRAILER VIEWS ↔ BOX-OFFICE REVENUE" },
  finding:
    "It looks like massive trailer views guarantee a huge box office return. But once you account for how much a movie actually cost to make, that connection plummets by 50%.",
  insight:
    "The hype isn't organic; it's an illusion funded by massive marketing budgets.",
  chart: data.main,
};

export const VALIDATION = {
  eyebrow: "STATISTICAL VALIDATION",
  title: "The eye test, confirmed by the math",
  intro:
    "Pretty charts can fool you, so we checked them with a sequential regression model that adds one factor at a time and measures how much of the box office each one explains.",
  r2Note:
    "“Explained” = the share of the differences in box office the model can account for. " +
    "Higher means a fuller explanation of why films earn what they do.",
  coeffNote:
    "How hard each factor pushes box office once everything else is held equal. Bars to the " +
    "right lift revenue; bars to the left pull it down. Longer bar = stronger effect.",
  takeaways: [
    {
      tag: "MONEY BUYS THE MAGIC",
      body:
        "What actually decides if a movie is a hit? The production budget. Factoring in how much a studio spends pushes our ability to predict box office success from 40% to 66%. Online attention barely adds 4% to the equation. The so-called 'attention effect' is mostly just big budgets in disguise.",
    },
    {
      tag: "Horror mathematically converts",
      body:
        "What happens when you strip away the massive budgets and online hype? Horror stands alone. The math gives horror a 1.4x box-office multiplier, meaning it brings in roughly 42% more money than a comparable film in a different genre. It proves that horror is the most dependable investment in Hollywood.",
    },
  ],
  // Model 3 standardised coefficients (largest → smallest for a ranked read).
  coefficients: [
    { label: "Log Budget", value: 0.53, note: "The biggest lever by far - more money on screen, more money at the box office." },
    { label: "Is Sequel", value: 0.41, note: "A known franchise brings a big, dependable boost." },
    { label: "Horror", value: 0.35, note: "A horror film out-earns an average film on the same budget and buzz." },
    { label: "Log Views", value: 0.26, hl: true, note: "Trailer attention helps - but only about half as much as budget." },
    { label: "Drama", value: 0.24, note: "Drama also beats the baseline genre group." },
    { label: "Runtime", value: -0.06, note: "How long the film runs barely moves revenue." },
    { label: "Adaptation", value: -0.15, note: "Book/comic adaptations do slightly worse, all else equal." },
  ],
  // Sequential R²: base, then the gain budget adds, then the gain attention adds.
  models: [
    {
      axis: "Basic factors", model: "Model 1", r2: 0.40, base: 0.40, budget: 0, attention: 0,
      blurb: "Genre, runtime, sequel and timing alone explain 40% of why films earn what they do."
    },
    {
      axis: "+ Budget", model: "Model 2", r2: 0.66, base: 0.40, budget: 0.26, attention: 0,
      blurb: "Add the production budget and the model leaps to 66% - a +26 jump. Budget dominates."
    },
    {
      axis: "+ Attention", model: "Model 3", r2: 0.70, base: 0.40, budget: 0.26, attention: 0.04,
      blurb: "Pile on all the trailer views and likes and it only inches to 70% - just +4. Attention adds little on top of budget."
    },
  ],
};

export const PANELS = [
  {
    kind: "genre",
    frame: "ATTENTION ISN'T FUNGIBLE",
    title: "Action Inflates, Horror Pays",
    finding:
      "Action movies might win the internet, racking up the most trailer views (10.8 million on average). But they are incredibly expensive to make, barely doubling their money at the box office (2.1x return).",
    insight:
      "Not all views are created equal. Horror movies get fewer views (7.5 million) but cost pennies to make, meaning they return a massive 4.7x on their budget.",
    chart: { rows: data.genre },
  },
  {
    kind: "budget",
    frame: "THE MID-BUDGET TRAP",
    title: "The Mid-Budget Death Zone",
    stat: { value: "1.7×", label: "the lowest return on investment" },
    finding:
      "Throwing more money at a movie guarantees more trailer views, but it doesn't guarantee profits.",
    insight:
      "The most dangerous place to be in Hollywood right now is stuck in the middle. Movies budgeted between $14M and $38M hit a massive profit slump, returning just 1.7x their cost.",
    chart: { rows: data.budget },
  },
  {
    kind: "correlates",
    frame: "WHAT MOVES THE NEEDLE",
    title: "Money Buys Attention",
    finding:
      "Don't let viral trailers fool you. The sheer size of a movie's production budget is the single biggest driver of box-office success - beating out both YouTube views and likes.",
    insight:
      "Once you factor out the budget, the actual impact of trailer views gets cut in half. Viral \"attention\" is often just a massive marketing spend in disguise.",
    chart: { bars: data.correlates, domain: [-0.2, 0.9] },
  },
  {
    kind: "sequel",
    frame: "THE SEQUEL PREMIUM",
    title: "The Franchise Cheat Code",
    stat: { value: "11.6×", label: "more revenue for sequels" },
    finding:
      "Original movies have a steep hill to climb. Sequels in our data averaged a massive $197 million at the box office - making nearly 12 times more money than original films, while only needing 3 times the trailer views to do it.",
    insight:
      "Audiences pay for familiarity. A sequel makes nearly $5 for every $1 spent, double the return of an original idea.",
    chart: { rows: data.sequel },
  },
];
