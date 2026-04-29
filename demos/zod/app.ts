import express from "express";
import { z } from "zod";

const app = express();
app.use(express.urlencoded({ extended: true }));

const REQUIRED_FIELDS = ["name", "email", "arrival", "departure", "guests"];

app.get("/", (_req, res) => res.send(html()));

const BookingSchema = z.object({
  name: z.string("Doit être une chaîne de caractères"),
  email: z.email("Doit être un email valide"),
  arrival: z.coerce.date().min(new Date(), "Doit être dans le futur"),
  departure: z.coerce.date(),
  guests: z.coerce.number("Doit être un chiffre").min(1, "Minimum une personne").max(15, "Maximum 15 personnes")
})
  .refine((data) => data.arrival <= data.departure, {
    message: "Le départ doit être après l'arrivée",
    path: ["departure"], // path of error
  });

type Booking = z.infer<typeof BookingSchema>

app.post("/book", (req, res) => {
  const result = BookingSchema.safeParse(req.body)

  console.log({ body: req.body })

  if (result.success) {
    return res.send(`<p>Réservation confirmée pour ${req.body.name} !</p>`);
  }

  if (result.error) {
    const flattenedErrors = z.flattenError(result.error)
    return res.send(html(flattenedErrors.fieldErrors, req.body));
  }
});

app.listen(3000, () => console.log("http://localhost:3000"));

// ------------------------------------------------------------

type Errors = Record<string, string[]>;
type Values = Record<string, string>;

function field(label: string, name: string, type: string, errors: Errors, values: Values) {
  const err = errors[name];
  const val = values[name] ?? "";
  return `
    <div class="flex flex-col gap-1.5">
      <label for="${name}" class="text-xs font-medium uppercase tracking-widest text-stone-500">${label}</label>
      <input id="${name}" name="${name}" type="${type}" value="${val}"
        class="w-full px-4 py-3 text-sm border rounded-sm bg-stone-50 text-stone-900 outline-none transition
               focus:border-stone-500 focus:ring-2 focus:ring-stone-200
               ${err ? "border-red-400 bg-red-50" : "border-stone-200"}" />
      ${err ? `<span class="text-xs text-red-600">↳ ${err}</span>` : ""}
    </div>`;
}

function html(errors: Errors = {}, values: Values = {}) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Réservation</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-stone-100 flex items-center justify-center p-8">
  <div class="w-full max-w-lg overflow-hidden rounded-sm bg-white shadow-sm">
    <div class="bg-stone-900 px-10 py-8">
      <h1 class="text-3xl font-light tracking-tight text-stone-100 mb-1">Réserver un séjour</h1>
      <p class="text-xs tracking-wide text-stone-500">Remplissez les informations ci-dessous</p>
    </div>
    <form method="POST" action="/book" class="flex flex-col gap-6 px-10 py-8">
      ${field("Nom complet", "name", "text", errors, values)}
      ${field("Email", "email", "email", errors, values)}
      <div class="grid grid-cols-2 gap-4">
        ${field("Date d'arrivée", "arrival", "date", errors, values)}
        ${field("Date de départ", "departure", "date", errors, values)}
      </div>
      ${field("Nombre de voyageurs", "guests", "number", errors, values)}
      <button type="submit"
        class="mt-2 w-full rounded-sm bg-stone-900 py-3 text-sm font-medium tracking-wide text-stone-100 hover:bg-stone-700 transition">
        Réserver
      </button>
    </form>
  </div>
</body>
</html>`;
}
