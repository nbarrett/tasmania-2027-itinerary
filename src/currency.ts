const AUD_PER_GBP = 1.93;
const STORAGE_KEY = "budget-currency";

type Currency = "AUD" | "GBP";

function toGbp(aud: number): number {
  const gbp = aud / AUD_PER_GBP;
  const step = gbp >= 1000 ? 50 : 10;
  return Math.round(gbp / step) * step;
}

function formatAmounts(amounts: number[], currency: Currency): string {
  const symbol = currency === "AUD" ? "A$" : "£";
  const formatted = amounts.map(amount => amount.toLocaleString("en-GB"));
  return symbol + formatted.join("-");
}

function renderCurrency(currency: Currency): void {
  document.querySelectorAll<HTMLElement>(".money").forEach(element => {
    const aud = element.dataset.aud;
    if (!aud) {
      return;
    }
    const audAmounts = aud.split("-").map(Number);
    const amounts = currency === "AUD" ? audAmounts : audAmounts.map(toGbp);
    element.textContent = formatAmounts(amounts, currency);
  });
  const note = document.getElementById("currency-note");
  if (note) {
    note.hidden = currency === "AUD";
  }
}

function asCurrency(value: string | null): Currency {
  return value === "GBP" ? "GBP" : "AUD";
}

const select = document.getElementById("currency-select");
if (select instanceof HTMLSelectElement) {
  const saved = asCurrency(localStorage.getItem(STORAGE_KEY));
  select.value = saved;
  renderCurrency(saved);
  select.addEventListener("change", () => {
    const currency = asCurrency(select.value);
    localStorage.setItem(STORAGE_KEY, currency);
    renderCurrency(currency);
  });
}
